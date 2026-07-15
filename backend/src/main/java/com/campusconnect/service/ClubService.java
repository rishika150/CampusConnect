package com.campusconnect.service;

import com.campusconnect.dto.*;
import com.campusconnect.entity.*;
import com.campusconnect.exception.*;
import com.campusconnect.repository.ClubMembershipRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClubService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final String DEFAULT_SORT_BY = "createdAt";

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "name",
            "category",
            "createdAt",
            "updatedAt"
    );

    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final UserRepository userRepository;

    public ClubService(
            ClubRepository clubRepository,
            ClubMembershipRepository clubMembershipRepository,
            UserRepository userRepository
    ) {
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ClubResponse> listActiveClubs(
            String search,
            ClubCategory category,
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection,
            String currentUserEmail
    ) {
        int resolvedPage = page != null && page >= 0
                ? page
                : DEFAULT_PAGE;

        int resolvedSize = size != null && size > 0
                ? Math.min(size, MAX_PAGE_SIZE)
                : DEFAULT_SIZE;

        Pageable pageable = PageRequest.of(
                resolvedPage,
                resolvedSize,
                resolveSort(sortBy, sortDirection)
        );

        String normalizedSearch = normalizeSearch(search);

        Page<Club> clubPage = clubRepository.searchActiveClubs(
                normalizedSearch,
                category,
                pageable
        );

        List<Long> clubIds = clubPage.getContent().stream()
                .map(Club::getId)
                .toList();

        Map<Long, Long> memberCounts = loadMemberCounts(clubIds);

        Map<Long, ClubMembership> memberships =
                loadMembershipsForUser(currentUserEmail, clubIds);

        Page<ClubResponse> responsePage = clubPage.map(club ->
                ClubResponse.from(
                        club,
                        memberCounts.getOrDefault(club.getId(), 0L),
                        memberships.get(club.getId())
                )
        );

        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ClubResponse getActiveClubById(
            Long clubId,
            String currentUserEmail
    ) {
        Club club = clubRepository.findById(clubId)
                .filter(Club::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));

        long memberCount = clubMembershipRepository.countByClubId(clubId);

        ClubMembership membership = resolveMembership(
                currentUserEmail,
                clubId
        );

        return ClubResponse.from(club, memberCount, membership);
    }

    @Transactional
    public ClubResponse createClub(ClubRequest request) {
        String name = request.name().trim();
        String description = request.description().trim();
        String contactEmail = normalizeEmail(request.contactEmail());

        if (clubRepository.existsByNameIgnoreCase(name)) {
            throw new ClubNameAlreadyExistsException(name);
        }

        Club club = new Club(
                name,
                description,
                request.category(),
                normalizeLogoUrl(request.logoUrl()),
                contactEmail
        );

        Club savedClub = clubRepository.save(club);

        return ClubResponse.from(savedClub, 0L);
    }

    @Transactional
    public ClubResponse updateClub(
            Long clubId,
            ClubRequest request
    ) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));

        String name = request.name().trim();
        String description = request.description().trim();
        String contactEmail = normalizeEmail(request.contactEmail());

        if (clubRepository.existsByNameIgnoreCaseAndIdNot(name, clubId)) {
            throw new ClubNameAlreadyExistsException(name);
        }

        club.setName(name);
        club.setDescription(description);
        club.setCategory(request.category());
        club.setLogoUrl(normalizeLogoUrl(request.logoUrl()));
        club.setContactEmail(contactEmail);

        Club updatedClub = clubRepository.save(club);

        long memberCount =
                clubMembershipRepository.countByClubId(clubId);

        return ClubResponse.from(updatedClub, memberCount);
    }

    @Transactional
    public void deactivateClub(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));

        if (!club.isActive()) {
            throw new ResourceNotFoundException(
                    "Club",
                    "id",
                    clubId
            );
        }

        club.setActive(false);
        clubRepository.save(club);
    }

    @Transactional
    public ClubMembershipResponse joinClub(
            Long clubId,
            String userEmail
    ) {
        User user = resolveUser(userEmail);

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));

        if (!club.isActive()) {
            throw new InactiveClubException(clubId);
        }

        if (clubMembershipRepository.existsByUserIdAndClubId(
                user.getId(),
                clubId
        )) {
            throw new ClubMembershipAlreadyExistsException(
                    user.getId(),
                    clubId
            );
        }

        ClubMembership membership = new ClubMembership(
                user,
                club,
                MembershipRole.MEMBER
        );

        ClubMembership savedMembership =
                clubMembershipRepository.save(membership);

        long memberCount =
                clubMembershipRepository.countByClubId(clubId);

        return ClubMembershipResponse.from(
                savedMembership,
                memberCount
        );
    }

    @Transactional
    public void leaveClub(Long clubId, String userEmail) {
        User user = resolveUser(userEmail);

        ClubMembership membership = clubMembershipRepository
                .findByUserIdAndClubId(user.getId(), clubId)
                .orElseThrow(() -> new ClubMembershipNotFoundException(
                        user.getId(),
                        clubId
                ));

        clubMembershipRepository.delete(membership);
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipResponse> getMyClubs(String userEmail) {
        User user = resolveUser(userEmail);

        List<ClubMembership> memberships =
                clubMembershipRepository
                        .findAllByUserIdOrderByJoinedAtDesc(user.getId());

        if (memberships.isEmpty()) {
            return List.of();
        }

        List<Long> clubIds = memberships.stream()
                .map(membership -> membership.getClub().getId())
                .toList();

        Map<Long, Long> memberCounts = loadMemberCounts(clubIds);

        return memberships.stream()
                .map(membership -> ClubMembershipResponse.from(
                        membership,
                        memberCounts.getOrDefault(
                                membership.getClub().getId(),
                                0L
                        )
                ))
                .toList();
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User",
                        "email",
                        email
                ));
    }

    private ClubMembership resolveMembership(
            String userEmail,
            Long clubId
    ) {
        if (userEmail == null) {
            return null;
        }

        User user = userRepository
                .findByEmailIgnoreCase(userEmail)
                .orElse(null);

        if (user == null) {
            return null;
        }

        return clubMembershipRepository
                .findByUserIdAndClubId(user.getId(), clubId)
                .orElse(null);
    }

    private Map<Long, ClubMembership> loadMembershipsForUser(
            String userEmail,
            List<Long> clubIds
    ) {
        if (userEmail == null || clubIds.isEmpty()) {
            return Map.of();
        }

        User user = userRepository
                .findByEmailIgnoreCase(userEmail)
                .orElse(null);

        if (user == null) {
            return Map.of();
        }

        return clubMembershipRepository
                .findAllByUserIdAndClubIdIn(user.getId(), clubIds)
                .stream()
                .collect(Collectors.toMap(
                        membership -> membership.getClub().getId(),
                        membership -> membership
                ));
    }

    private Map<Long, Long> loadMemberCounts(List<Long> clubIds) {
        if (clubIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, Long> counts = new HashMap<>();

        for (Object[] row : clubMembershipRepository
                .countMembersByClubIds(clubIds)) {
            counts.put((Long) row[0], (Long) row[1]);
        }

        return counts;
    }

    private Sort resolveSort(String sortBy, String sortDirection) {
        String field = ALLOWED_SORT_FIELDS.contains(sortBy)
                ? sortBy
                : DEFAULT_SORT_BY;

        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return Sort.by(direction, field);
    }

    private String normalizeSearch(String search) {
        return search == null
                ? ""
                : search.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeLogoUrl(String logoUrl) {
        if (logoUrl == null) {
            return null;
        }

        String trimmed = logoUrl.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}