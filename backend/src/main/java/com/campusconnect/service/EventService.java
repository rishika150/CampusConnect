package com.campusconnect.service;

import com.campusconnect.dto.EventRequest;
import com.campusconnect.dto.EventResponse;
import com.campusconnect.dto.PageResponse;
import com.campusconnect.entity.*;
import com.campusconnect.exception.EventNotFoundException;
import com.campusconnect.exception.InvalidEventTimeException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class EventService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final String DEFAULT_SORT_BY = "startTime";

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "title",
            "startTime",
            "endTime",
            "capacity",
            "createdAt",
            "updatedAt"
    );

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;

    public EventService(
            EventRepository eventRepository,
            ClubRepository clubRepository
    ) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> listEvents(
            String search,
            Long clubId,
            EventCategory category,
            EventStatus status,
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection
    ) {
        Pageable pageable = createPageable(
                page,
                size,
                sortBy,
                sortDirection
        );

        Specification<Event> specification =
                buildSpecification(
                        search,
                        clubId,
                        category,
                        status
                );

        Page<EventResponse> responsePage = eventRepository
                .findAll(specification, pageable)
                .map(EventResponse::from);

        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long eventId) {
        Event event = eventRepository
                .findByIdAndActiveTrue(eventId)
                .filter(item -> item.getClub().isActive())
                .orElseThrow(() ->
                        new EventNotFoundException(eventId)
                );

        return EventResponse.from(event);
    }

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> listUpcomingEvents(
            Integer page,
            Integer size
    ) {
        return listEvents(
                null,
                null,
                null,
                EventStatus.UPCOMING,
                page,
                size,
                "startTime",
                "asc"
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> listClubEvents(
            Long clubId,
            Integer page,
            Integer size
    ) {
        Club club = clubRepository.findById(clubId)
                .filter(Club::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));

        return listEvents(
                null,
                club.getId(),
                null,
                null,
                page,
                size,
                "startTime",
                "asc"
        );
    }

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        validateTimes(request);
        Club club = resolveActiveClub(request.clubId());

        Event event = new Event(
                request.title().trim(),
                request.description().trim(),
                request.venue().trim(),
                request.startTime(),
                request.endTime(),
                request.registrationDeadline(),
                request.capacity(),
                normalizeOptionalText(request.bannerUrl()),
                request.category(),
                club
        );

        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }

    @Transactional
    public EventResponse updateEvent(
            Long eventId,
            EventRequest request
    ) {
        validateTimes(request);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException(eventId)
                );

        if (!event.isActive()) {
            throw new EventNotFoundException(eventId);
        }

        Club club = resolveActiveClub(request.clubId());

        if (request.capacity() < event.getRegisteredCount()) {
            throw new IllegalArgumentException(
                    "Capacity cannot be lower than the current registered count"
            );
        }

        event.setTitle(request.title().trim());
        event.setDescription(request.description().trim());
        event.setVenue(request.venue().trim());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setRegistrationDeadline(
                request.registrationDeadline()
        );
        event.setCapacity(request.capacity());
        event.setBannerUrl(
                normalizeOptionalText(request.bannerUrl())
        );
        event.setCategory(request.category());
        event.setClub(club);

        if (event.getStatus() != EventStatus.CANCELLED) {
            event.setStatus(event.calculateStatus());
        }

        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException(eventId)
                );

        if (!event.isActive()) {
            throw new EventNotFoundException(eventId);
        }

        event.setActive(false);
        event.setStatus(EventStatus.CANCELLED);

        eventRepository.save(event);
    }

    private Club resolveActiveClub(Long clubId) {
        return clubRepository.findById(clubId)
                .filter(Club::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Club",
                        "id",
                        clubId
                ));
    }

    private void validateTimes(EventRequest request) {
        Instant now = Instant.now();

        if (!request.startTime().isAfter(now)) {
            throw new InvalidEventTimeException(
                    "Event start time must be in the future"
            );
        }

        if (!request.endTime().isAfter(request.startTime())) {
            throw new InvalidEventTimeException(
                    "Event end time must be after the start time"
            );
        }

        if (!request.registrationDeadline()
                .isBefore(request.startTime())) {
            throw new InvalidEventTimeException(
                    "Registration deadline must be before the event start time"
            );
        }

        if (!request.registrationDeadline().isAfter(now)) {
            throw new InvalidEventTimeException(
                    "Registration deadline must be in the future"
            );
        }
    }

    private Pageable createPageable(
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection
    ) {
        int resolvedPage = page != null && page >= 0
                ? page
                : DEFAULT_PAGE;

        int resolvedSize = size != null && size > 0
                ? Math.min(size, MAX_PAGE_SIZE)
                : DEFAULT_SIZE;

        String resolvedSortBy =
                ALLOWED_SORT_FIELDS.contains(sortBy)
                        ? sortBy
                        : DEFAULT_SORT_BY;

        Sort.Direction direction =
                "asc".equalsIgnoreCase(sortDirection)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return PageRequest.of(
                resolvedPage,
                resolvedSize,
                Sort.by(direction, resolvedSortBy)
        );
    }

    private Specification<Event> buildSpecification(
            String search,
            Long clubId,
            EventCategory category,
            EventStatus status
    ) {
        String normalizedSearch = search == null
                ? ""
                : search.trim().toLowerCase(Locale.ROOT);

        Instant now = Instant.now();

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(
                    criteriaBuilder.isTrue(root.get("active"))
            );

            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get("club").get("active")
                    )
            );

            if (!normalizedSearch.isEmpty()) {
                String pattern = "%" + normalizedSearch + "%";

                predicates.add(
                        criteriaBuilder.or(
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("title")
                                        ),
                                        pattern
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("description")
                                        ),
                                        pattern
                                ),
                                criteriaBuilder.like(
                                        criteriaBuilder.lower(
                                                root.get("venue")
                                        ),
                                        pattern
                                )
                        )
                );
            }

            if (clubId != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("club").get("id"),
                                clubId
                        )
                );
            }

            if (category != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category"),
                                category
                        )
                );
            }

            if (status != null) {
                addStatusPredicate(
                        predicates,
                        root,
                        criteriaBuilder,
                        status,
                        now
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(Predicate[]::new)
            );
        };
    }

    private void addStatusPredicate(
            List<Predicate> predicates,
            jakarta.persistence.criteria.Root<Event> root,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            EventStatus status,
            Instant now
    ) {
        switch (status) {
            case CANCELLED -> predicates.add(
                    criteriaBuilder.equal(
                            root.get("status"),
                            EventStatus.CANCELLED
                    )
            );

            case UPCOMING -> {
                predicates.add(
                        criteriaBuilder.notEqual(
                                root.get("status"),
                                EventStatus.CANCELLED
                        )
                );

                predicates.add(
                        criteriaBuilder.greaterThan(
                                root.get("startTime"),
                                now
                        )
                );
            }

            case ONGOING -> {
                predicates.add(
                        criteriaBuilder.notEqual(
                                root.get("status"),
                                EventStatus.CANCELLED
                        )
                );

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("startTime"),
                                now
                        )
                );

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("endTime"),
                                now
                        )
                );
            }

            case COMPLETED -> {
                predicates.add(
                        criteriaBuilder.notEqual(
                                root.get("status"),
                                EventStatus.CANCELLED
                        )
                );

                predicates.add(
                        criteriaBuilder.lessThan(
                                root.get("endTime"),
                                now
                        )
                );
            }
        }
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}