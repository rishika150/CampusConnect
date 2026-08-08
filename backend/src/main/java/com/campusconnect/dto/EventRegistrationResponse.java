package com.campusconnect.dto;

import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.EventStatus;

import java.time.Instant;

public record EventRegistrationResponse(
        Long registrationId,
        Instant registeredAt,
        Long eventId,
        String eventTitle,
        String venue,
        Instant startTime,
        Instant endTime,
        EventStatus status,
        Long clubId,
        String clubName
) {

    public static EventRegistrationResponse from(
            EventRegistration registration
    ) {
        Event event = registration.getEvent();

        return new EventRegistrationResponse(
                registration.getId(),
                registration.getRegisteredAt(),
                event.getId(),
                event.getTitle(),
                event.getVenue(),
                event.getStartTime(),
                event.getEndTime(),
                event.calculateStatus(),
                event.getClub().getId(),
                event.getClub().getName()
        );
    }
}
