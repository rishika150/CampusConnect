package com.campusconnect.service;

import com.campusconnect.dto.EventRegistrationResponse;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.entity.User;
import com.campusconnect.exception.EventCapacityExceededException;
import com.campusconnect.exception.EventRegistrationAlreadyExistsException;
import com.campusconnect.exception.EventRegistrationClosedException;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventRegistrationServiceTest {

    private static final Long EVENT_ID = 10L;
    private static final Long USER_ID = 20L;
    private static final String USER_EMAIL = "student@igdtuw.ac.in";

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventRegistrationRepository registrationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Event event;

    @Mock
    private User user;

    @Mock
    private Club club;

    private EventRegistrationService service;

    @BeforeEach
    void setUp() {
        service = new EventRegistrationService(
                eventRepository,
                registrationRepository,
                userRepository
        );

        when(userRepository.findByEmailIgnoreCase(USER_EMAIL))
                .thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(USER_ID);
        when(eventRepository.findActiveByIdForUpdate(EVENT_ID))
                .thenReturn(Optional.of(event));
    }

    @Test
    void registerCreatesRegistrationAndIncrementsCount() {
        prepareOpenEvent(3, 1);
        prepareResponseFields();
        when(registrationRepository.existsByUserIdAndEventId(
                USER_ID,
                EVENT_ID
        )).thenReturn(false);
        when(registrationRepository.saveAndFlush(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        EventRegistrationResponse response = service.register(
                EVENT_ID,
                USER_EMAIL
        );

        assertEquals(EVENT_ID, response.eventId());
        assertEquals("Tech Symposium", response.eventTitle());
        verify(event).registerAttendee();
        verify(eventRepository).save(event);
    }

    @Test
    void registerRejectsDuplicateBeforeChangingCapacity() {
        when(registrationRepository.existsByUserIdAndEventId(
                USER_ID,
                EVENT_ID
        )).thenReturn(true);

        assertThrows(
                EventRegistrationAlreadyExistsException.class,
                () -> service.register(EVENT_ID, USER_EMAIL)
        );

        verify(event, never()).registerAttendee();
        verify(registrationRepository, never()).saveAndFlush(any());
    }

    @Test
    void registerRejectsFullEvent() {
        prepareOpenEvent(2, 2);
        when(registrationRepository.existsByUserIdAndEventId(
                USER_ID,
                EVENT_ID
        )).thenReturn(false);

        assertThrows(
                EventCapacityExceededException.class,
                () -> service.register(EVENT_ID, USER_EMAIL)
        );

        verify(registrationRepository, never()).saveAndFlush(any());
    }

    @Test
    void registerRejectsPassedDeadline() {
        when(registrationRepository.existsByUserIdAndEventId(
                USER_ID,
                EVENT_ID
        )).thenReturn(false);
        when(event.calculateStatus()).thenReturn(EventStatus.UPCOMING);
        when(event.getRegistrationDeadline())
                .thenReturn(Instant.now().minusSeconds(60));

        assertThrows(
                EventRegistrationClosedException.class,
                () -> service.register(EVENT_ID, USER_EMAIL)
        );

        verify(registrationRepository, never()).saveAndFlush(any());
    }

    @Test
    void unregisterDeletesRegistrationAndDecrementsCount() {
        EventRegistration registration =
                new EventRegistration(user, event);

        when(registrationRepository.findByUserIdAndEventId(
                USER_ID,
                EVENT_ID
        )).thenReturn(Optional.of(registration));
        when(event.calculateStatus()).thenReturn(EventStatus.UPCOMING);

        service.unregister(EVENT_ID, USER_EMAIL);

        verify(registrationRepository).delete(registration);
        verify(event).unregisterAttendee();
        verify(eventRepository).save(event);
    }

    private void prepareOpenEvent(int capacity, int registeredCount) {
        when(event.calculateStatus()).thenReturn(EventStatus.UPCOMING);
        when(event.getRegistrationDeadline())
                .thenReturn(Instant.now().plusSeconds(3600));
        when(event.getCapacity()).thenReturn(capacity);
        when(event.getRegisteredCount()).thenReturn(registeredCount);
    }

    private void prepareResponseFields() {
        when(event.getId()).thenReturn(EVENT_ID);
        when(event.getTitle()).thenReturn("Tech Symposium");
        when(event.getVenue()).thenReturn("Auditorium");
        when(event.getStartTime())
                .thenReturn(Instant.now().plusSeconds(7200));
        when(event.getEndTime())
                .thenReturn(Instant.now().plusSeconds(10800));
        when(event.getClub()).thenReturn(club);
        when(club.getId()).thenReturn(30L);
        when(club.getName()).thenReturn("Tech Club");
    }
}
