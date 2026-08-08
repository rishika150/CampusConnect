package com.campusconnect.exception;

public class EventRegistrationAlreadyExistsException
        extends RuntimeException {

    public EventRegistrationAlreadyExistsException(
            Long userId,
            Long eventId
    ) {
        super("User " + userId + " is already registered for event " + eventId);
    }
}
