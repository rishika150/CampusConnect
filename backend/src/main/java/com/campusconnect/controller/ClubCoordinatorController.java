package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.MembershipRoleRequest;
import java.util.List;
import java.util.Map;
import com.campusconnect.entity.MembershipRole;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.ClubMembershipRepository;
import com.campusconnect.repository.ClubRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/clubs/{clubId}/members")
public class ClubCoordinatorController {
    private final ClubMembershipRepository memberships;
    private final ClubRepository clubs;

    public ClubCoordinatorController(ClubMembershipRepository memberships, ClubRepository clubs) {
        this.memberships = memberships;
        this.clubs = clubs;
    }

    @GetMapping
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listMembers(@PathVariable Long clubId) {
        if (!clubs.existsById(clubId))
            throw new ResourceNotFoundException("Club", "id", clubId);
        var data = memberships.findAllByClubIdOrderByJoinedAtAsc(clubId).stream()
                .map(m -> Map.<String, Object>of(
                        "userId", m.getUser().getId(),
                        "fullName", m.getUser().getFullName(),
                        "email", m.getUser().getEmail(),
                        "role", m.getRole().name()
                )).toList();
        return ResponseEntity.ok(ApiResponse.success("Club members retrieved", data));
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updateRole(@PathVariable Long clubId,
            @PathVariable Long userId, @Valid @RequestBody MembershipRoleRequest request) {
        if (!clubs.existsById(clubId)) throw new ResourceNotFoundException("Club", "id", clubId);
        var membership = memberships.findByUserIdAndClubId(userId, clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club membership", "userId", userId));
        membership.setRole(request.role());
        memberships.save(membership);
        return ResponseEntity.ok(ApiResponse.success("Membership role updated"));
    }
}
