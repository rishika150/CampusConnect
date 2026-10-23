package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.EventRegistrationResponse;
import com.campusconnect.service.EventRegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class EventRegistrationController {
    private final EventRegistrationService service;

    public EventRegistrationController(EventRegistrationService service) {
        this.service = service;
    }

    @GetMapping("/registrations/me")
    public ResponseEntity<ApiResponse<List<EventRegistrationResponse>>> mine(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Registrations retrieved", service.myRegistrations(auth.getName())));
    }

    @PostMapping("/events/{eventId}/registrations")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> register(@PathVariable Long eventId, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registered successfully", service.register(eventId, auth.getName())));
    }

    @DeleteMapping("/events/{eventId}/registrations/me")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long eventId, Authentication auth) {
        service.cancel(eventId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled"));
    }
}
