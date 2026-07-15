package com.campusconnect.exception;

public class ClubMembershipAlreadyExistsException extends RuntimeException {

    public ClubMembershipAlreadyExistsException(
            Long userId,
            Long clubId
    ) {
        super(
                "User %d is already a member of club %d"
                        .formatted(userId, clubId)
        );
    }
}
