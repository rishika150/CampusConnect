package com.campusconnect.dto;

import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.ClubMembership;
import com.campusconnect.entity.MembershipRole;

import java.time.Instant;

public record ClubResponse(
        Long id,
        String name,
        String description,
        ClubCategory category,
        String logoUrl,
        String contactEmail,
        boolean active,
        long memberCount,
        boolean joinedByCurrentUser,
        Instant joinedAt,
        MembershipRole membershipRole,
        Instant createdAt,
        Instant updatedAt
) {

    public static ClubResponse from(
            Club club,
            long memberCount
    ) {
        return from(club, memberCount, null);
    }

    public static ClubResponse from(
            Club club,
            long memberCount,
            ClubMembership membership
    ) {
        boolean joined = membership != null;

        return new ClubResponse(
                club.getId(),
                club.getName(),
                club.getDescription(),
                club.getCategory(),
                club.getLogoUrl(),
                club.getContactEmail(),
                club.isActive(),
                memberCount,
                joined,
                joined ? membership.getJoinedAt() : null,
                joined ? membership.getRole() : null,
                club.getCreatedAt(),
                club.getUpdatedAt()
        );
    }
}
