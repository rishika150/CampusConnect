package com.campusconnect.exception;

public class EventRegistrationNotFoundException
        extends RuntimeException {

    public EventRegistrationNotFoundException(
            Long userId,
            Long eventId
    ) {
        super("No registration found for user " + userId + " and event " + eventId);
    }
}
