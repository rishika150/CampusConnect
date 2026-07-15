package com.campusconnect.exception;

public class ClubMembershipNotFoundException extends RuntimeException {

    public ClubMembershipNotFoundException(
            Long userId,
            Long clubId
    ) {
        super(
                "Membership not found for user %d in club %d"
                        .formatted(userId, clubId)
        );
    }
}
