package com.campusconnect.service;

import com.campusconnect.entity.*;
import com.campusconnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventRegistrationServiceTest {
    @Mock EventRepository events;
    @Mock EventRegistrationRepository registrations;
    @Mock UserRepository users;

    EventRegistrationService service;
    Event event;
    User user;

    @BeforeEach
    void setup() {
        service = new EventRegistrationService(events, registrations, users);
        var club = mock(Club.class);
        event = new Event("Campus workshop", "Learn together", "Hall",
                Instant.now().plusSeconds(7200), Instant.now().plusSeconds(10800),
                Instant.now().plusSeconds(3600), 1, null, EventCategory.WORKSHOP, club);
        user = mock(User.class);
    }

    @Test
    void fullEventRejectsRegistrationWithoutChangingCount() {
        event.setRegisteredCount(1);
        when(events.findActiveByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(users.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(3L);
        when(registrations.existsByUserIdAndEventId(3L, 10L)).thenReturn(false);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.register(10L, "student@example.com"));

        assertEquals(409, error.getStatusCode().value());
        assertEquals(1, event.getRegisteredCount());
        verify(registrations, never()).saveAndFlush(any());
    }

    @Test
    void duplicateEventRegistrationReturnsConflict() {
        when(events.findActiveByIdForUpdate(10L)).thenReturn(Optional.of(event));
        when(users.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(3L);
        when(registrations.existsByUserIdAndEventId(3L, 10L)).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.register(10L, "student@example.com"));

        assertEquals(409, error.getStatusCode().value());
        assertEquals(0, event.getRegisteredCount());
        verify(registrations, never()).saveAndFlush(any());
    }
}
