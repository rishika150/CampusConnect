package com.campusconnect.dto;

import com.campusconnect.entity.ClubMembership;
import com.campusconnect.entity.MembershipRole;

import java.time.Instant;

public record ClubMembershipResponse(
        Long id,
        ClubResponse club,
        Instant joinedAt,
        MembershipRole membershipRole
) {

    public static ClubMembershipResponse from(
            ClubMembership membership,
            long memberCount
    ) {
        return new ClubMembershipResponse(
                membership.getId(),
                ClubResponse.from(
                        membership.getClub(),
                        memberCount,
                        membership
                ),
                membership.getJoinedAt(),
                membership.getRole()
        );
    }
}
