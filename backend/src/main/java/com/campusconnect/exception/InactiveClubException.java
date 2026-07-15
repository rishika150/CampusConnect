package com.campusconnect.exception;

public class InactiveClubException extends RuntimeException {

    public InactiveClubException(Long clubId) {
        super("Club %d is not active".formatted(clubId));
    }
}
