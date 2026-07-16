package com.campusconnect.dto;

import com.campusconnect.entity.EventCategory;
import jakarta.validation.constraints.*;

import java.time.Instant;

public record EventRequest(

        @NotBlank(message = "Event title is required")
        @Size(
                min = 3,
                max = 120,
                message = "Event title must contain between 3 and 120 characters"
        )
        String title,

        @NotBlank(message = "Event description is required")
        @Size(
                min = 20,
                max = 3000,
                message = "Description must contain between 20 and 3000 characters"
        )
        String description,

        @NotBlank(message = "Event venue is required")
        @Size(
                min = 3,
                max = 250,
                message = "Venue must contain between 3 and 250 characters"
        )
        String venue,

        @NotNull(message = "Start time is required")
        Instant startTime,

        @NotNull(message = "End time is required")
        Instant endTime,

        @NotNull(message = "Registration deadline is required")
        Instant registrationDeadline,

        @Min(
                value = 1,
                message = "Capacity must be at least 1"
        )
        @Max(
                value = 100000,
                message = "Capacity cannot exceed 100000"
        )
        int capacity,

        @Size(
                max = 500,
                message = "Banner URL cannot exceed 500 characters"
        )
        String bannerUrl,

        @NotNull(message = "Event category is required")
        EventCategory category,

        @NotNull(message = "Club ID is required")
        Long clubId
) {
}