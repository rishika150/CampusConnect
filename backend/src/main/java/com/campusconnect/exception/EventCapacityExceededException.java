package com.campusconnect.exception;

public class EventCapacityExceededException extends RuntimeException {

    public EventCapacityExceededException(Long eventId) {
        super("Event " + eventId + " has reached its registration capacity");
    }
}
