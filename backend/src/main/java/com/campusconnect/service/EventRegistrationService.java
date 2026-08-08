package com.campusconnect.service;

import com.campusconnect.dto.EventRegistrationResponse;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.entity.User;
import com.campusconnect.exception.*;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class EventRegistrationService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public EventRegistrationService(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EventRegistrationResponse register(
            Long eventId,
            String userEmail
    ) {
        User user = resolveUser(userEmail);
        Event event = lockActiveEvent(eventId);

        if (registrationRepository.existsByUserIdAndEventId(
                user.getId(),
                eventId
        )) {
            throw new EventRegistrationAlreadyExistsException(
                    user.getId(),
                    eventId
            );
        }

        validateRegistrationWindow(event);

        if (event.getRegisteredCount() >= event.getCapacity()) {
            throw new EventCapacityExceededException(eventId);
        }

        EventRegistration registration =
                new EventRegistration(user, event);

        EventRegistration savedRegistration =
                registrationRepository.saveAndFlush(registration);

        event.registerAttendee();
        eventRepository.save(event);

        return EventRegistrationResponse.from(savedRegistration);
    }

    @Transactional
    public void unregister(Long eventId, String userEmail) {
        User user = resolveUser(userEmail);
        Event event = lockActiveEvent(eventId);

        EventRegistration registration = registrationRepository
                .findByUserIdAndEventId(user.getId(), eventId)
                .orElseThrow(() ->
                        new EventRegistrationNotFoundException(
                                user.getId(),
                                eventId
                        )
                );

        if (event.calculateStatus() != EventStatus.UPCOMING) {
            throw new EventRegistrationClosedException(
                    "Registration can only be cancelled before the event starts"
            );
        }

        registrationRepository.delete(registration);
        event.unregisterAttendee();
        eventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationResponse> getMyRegistrations(
            String userEmail
    ) {
        User user = resolveUser(userEmail);

        return registrationRepository
                .findAllByUserIdOrderByRegisteredAtDesc(user.getId())
                .stream()
                .map(EventRegistrationResponse::from)
                .toList();
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User",
                        "email",
                        email
                ));
    }

    private Event lockActiveEvent(Long eventId) {
        return eventRepository.findActiveByIdForUpdate(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }

    private void validateRegistrationWindow(Event event) {
        if (event.calculateStatus() != EventStatus.UPCOMING) {
            throw new EventRegistrationClosedException(
                    "Registration is only available for upcoming events"
            );
        }

        if (!Instant.now().isBefore(event.getRegistrationDeadline())) {
            throw new EventRegistrationClosedException(
                    "The registration deadline has passed"
            );
        }
    }
}
