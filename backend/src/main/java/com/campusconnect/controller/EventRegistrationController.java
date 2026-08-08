package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.EventRegistrationResponse;
import com.campusconnect.service.EventRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "bearerAuth")
@Tag(
        name = "Event Registrations",
        description = "Authenticated event registration APIs"
)
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    public EventRegistrationController(
            EventRegistrationService registrationService
    ) {
        this.registrationService = registrationService;
    }

    @PostMapping("/events/{eventId}/registrations")
    @Operation(summary = "Register for an upcoming event")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> register(
            @PathVariable Long eventId,
            Authentication authentication
    ) {
        EventRegistrationResponse registration =
                registrationService.register(
                        eventId,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Event registration completed successfully",
                        registration
                ));
    }

    @DeleteMapping("/events/{eventId}/registrations")
    @Operation(summary = "Cancel an event registration")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @PathVariable Long eventId,
            Authentication authentication
    ) {
        registrationService.unregister(
                eventId,
                authentication.getName()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Event registration cancelled successfully"
                )
        );
    }

    @GetMapping("/users/me/event-registrations")
    @Operation(summary = "List the current user's event registrations")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>>
    getMyRegistrations(Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Event registrations retrieved successfully",
                        registrationService.getMyRegistrations(
                                authentication.getName()
                        )
                )
        );
    }
}
