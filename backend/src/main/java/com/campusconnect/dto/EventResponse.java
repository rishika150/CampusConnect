package com.campusconnect.dto;

import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;

import java.time.Instant;

public record EventResponse(
        Long id,
        String title,
        String description,
        String venue,
        Instant startTime,
        Instant endTime,
        Instant registrationDeadline,
        int capacity,
        int registeredCount,
        int availableSeats,
        String bannerUrl,
        boolean active,
        EventCategory category,
        EventStatus status,
        Long clubId,
        String clubName,
        Instant createdAt,
        Instant updatedAt
) {

    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRegistrationDeadline(),
                event.getCapacity(),
                event.getRegisteredCount(),
                Math.max(
                        event.getCapacity() - event.getRegisteredCount(),
                        0
                ),
                event.getBannerUrl(),
                event.isActive(),
                event.getCategory(),
                event.calculateStatus(),
                event.getClub().getId(),
                event.getClub().getName(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}