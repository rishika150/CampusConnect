package com.campusconnect.dto;

import com.campusconnect.entity.EventRegistration;
import java.time.Instant;

public record EventRegistrationResponse(Long registrationId, Long eventId, String eventTitle,
                                        Instant registeredAt, int availableSeats) {
    public static EventRegistrationResponse from(EventRegistration registration) {
        var event = registration.getEvent();
        return new EventRegistrationResponse(registration.getId(), event.getId(), event.getTitle(),
                registration.getRegisteredAt(), Math.max(0, event.getCapacity() - event.getRegisteredCount()));
    }
}
