package com.campusconnect.service;

import com.campusconnect.dto.EventRegistrationResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.exception.EventNotFoundException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;

@Service
public class EventRegistrationService {
    private final EventRepository events;
    private final EventRegistrationRepository registrations;
    private final UserRepository users;

    public EventRegistrationService(EventRepository events, EventRegistrationRepository registrations, UserRepository users) {
        this.events = events;
        this.registrations = registrations;
        this.users = users;
    }

    @Transactional
    public EventRegistrationResponse register(Long eventId, String email) {
        // Serialize all capacity mutations for an event through a database row lock.
        Event event = events.findActiveByIdForUpdate(eventId).orElseThrow(() -> new EventNotFoundException(eventId));
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        if (registrations.existsByUserIdAndEventId(user.getId(), eventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already registered for this event");
        }
        Instant now = Instant.now();
        if (!event.getClub().isActive() || event.calculateStatus() != EventStatus.UPCOMING
                || !now.isBefore(event.getRegistrationDeadline())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration is closed for this event");
        }
        if (event.getRegisteredCount() >= event.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No seats available");
        }
        event.setRegisteredCount(event.getRegisteredCount() + 1);
        var registration = registrations.saveAndFlush(new EventRegistration(user, event));
        events.save(event);
        return EventRegistrationResponse.from(registration);
    }

    @Transactional
    public void cancel(Long eventId, String email) {
        Event event = events.findActiveByIdForUpdate(eventId).orElseThrow(() -> new EventNotFoundException(eventId));
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        var registration = registrations.findByUserIdAndEventId(user.getId(), eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No registration found"));
        registrations.delete(registration);
        registrations.flush();
        event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
        events.save(event);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> myRegistrations(String email) {
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return registrations.findAllByUserIdOrderByRegisteredAtDesc(user.getId()).stream()
                .map(EventRegistrationResponse::from).toList();
    }
}
