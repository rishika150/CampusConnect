package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(
        name = "Events",
        description = "Event discovery and management APIs"
)
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/events")
    @Operation(summary = "Browse and filter active events")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>> listEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) EventStatus status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Events retrieved successfully",
                        eventService.listEvents(
                                search,
                                clubId,
                                category,
                                status,
                                page,
                                size,
                                sortBy,
                                sortDirection
                        )
                )
        );
    }

    @GetMapping("/events/upcoming")
    @Operation(summary = "List upcoming events")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>>
    listUpcomingEvents(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Upcoming events retrieved successfully",
                        eventService.listUpcomingEvents(page, size)
                )
        );
    }

    @GetMapping("/events/{eventId}")
    @Operation(summary = "Get active event details")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(
            @PathVariable Long eventId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Event retrieved successfully",
                        eventService.getEvent(eventId)
                )
        );
    }

    @GetMapping("/clubs/{clubId}/events")
    @Operation(summary = "List events belonging to a club")
    public ResponseEntity<ApiResponse<PageResponse<EventResponse>>>
    listClubEvents(
            @PathVariable Long clubId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Club events retrieved successfully",
                        eventService.listClubEvents(
                                clubId,
                                page,
                                size
                        )
                )
        );
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new event")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Event created successfully",
                                eventService.createEvent(request)
                        )
                );
    }

    @PutMapping("/events/{eventId}")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an event")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Event updated successfully",
                        eventService.updateEvent(
                                eventId,
                                request
                        )
                )
        );
    }

    @DeleteMapping("/events/{eventId}")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Soft-delete an event")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @PathVariable Long eventId
    ) {
        eventService.deleteEvent(eventId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Event deleted successfully"
                )
        );
    }
}