package com.campusconnect.service;

import com.campusconnect.entity.*;
import com.campusconnect.dto.EventRequest;
import com.campusconnect.exception.EventNotFoundException;
import com.campusconnect.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EventRegistrationIntegrationTest {
    @Autowired EventRegistrationService service;
    @Autowired EventService eventService;
    @Autowired ClubRepository clubs;
    @Autowired EventRepository events;
    @Autowired UserRepository users;
    @Autowired EventRegistrationRepository registrations;

    @Test
    void lastSeatIsNotOverbookedByParallelRequests() throws Exception {
        var key = UUID.randomUUID().toString();
        var club = clubs.save(new Club("Concurrent " + key, "A testing club used to verify concurrent bookings.",
                ClubCategory.TECHNOLOGY, null, "test@example.org"));
        var event = events.save(new Event("Workshop " + key, "A hands-on workshop for testing concurrent registrations.",
                "Campus Auditorium", Instant.now().plusSeconds(86400), Instant.now().plusSeconds(90000),
                Instant.now().plusSeconds(72000), 1, null, EventCategory.WORKSHOP, club));
        var userA = users.save(new User("Student A", key + "a@example.org", "test-only", Role.STUDENT));
        var userB = users.save(new User("Student B", key + "b@example.org", "test-only", Role.STUDENT));
        var start = new CountDownLatch(1);

        try (var executor = Executors.newFixedThreadPool(2)) {
            var a = executor.submit(() -> attempt(event.getId(), userA.getEmail(), start));
            var b = executor.submit(() -> attempt(event.getId(), userB.getEmail(), start));
            start.countDown();
            int successful = a.get(20, TimeUnit.SECONDS) + b.get(20, TimeUnit.SECONDS);
            assertEquals(1, successful, "Only one of two requests may claim the last seat");
        }

        assertEquals(1, events.findById(event.getId()).orElseThrow().getRegisteredCount());
        assertEquals(1, registrations.countByEventId(event.getId()));
    }


    @Test
    void capacityCannotDropBelowBookingsAndDeletedEventsRejectRegistrations() {
        var key = UUID.randomUUID().toString();
        var club = clubs.save(new Club("Integrity " + key, "Testing registration capacity and deletion rules.",
                ClubCategory.TECHNOLOGY, null, "integrity@example.org"));
        Instant start = Instant.now().plusSeconds(86400);
        var event = events.save(new Event("Integrity Workshop " + key,
                "A future event used to test capacity and cancellation integrity.",
                "Campus Hall", start, start.plusSeconds(3600),
                start.minusSeconds(3600), 2, null, EventCategory.WORKSHOP, club));
        var user1 = users.save(new User("Integrity Student A", key + "a@example.org", "test-only", Role.STUDENT));
        var user2 = users.save(new User("Integrity Student B", key + "b@example.org", "test-only", Role.STUDENT));
        service.register(event.getId(), user1.getEmail());
        service.register(event.getId(), user2.getEmail());

        var tooSmall = new EventRequest(event.getTitle(), event.getDescription(), event.getVenue(),
                start, start.plusSeconds(3600), start.minusSeconds(3600), 1, null,
                EventCategory.WORKSHOP, club.getId());
        assertThrows(IllegalArgumentException.class, () -> eventService.updateEvent(event.getId(), tooSmall));
        assertEquals(2, events.findById(event.getId()).orElseThrow().getRegisteredCount());
        assertEquals(2, events.findById(event.getId()).orElseThrow().getCapacity());

        eventService.deleteEvent(event.getId());
        assertFalse(events.findById(event.getId()).orElseThrow().isActive());
        assertThrows(EventNotFoundException.class, () -> service.register(event.getId(), user1.getEmail()));
        assertThrows(EventNotFoundException.class, () -> service.register(event.getId(), user2.getEmail()));

        service.cancel(event.getId(), user1.getEmail());
        assertEquals(1, events.findById(event.getId()).orElseThrow().getRegisteredCount());
        service.cancel(event.getId(), user2.getEmail());
        assertEquals(0, events.findById(event.getId()).orElseThrow().getRegisteredCount());
        assertEquals(0, registrations.countByEventId(event.getId()));
    }


    @Test
    void capacityReductionAndNewBookingCannotViolateSeatInvariant() throws Exception {
        String key = UUID.randomUUID().toString();
        var club = clubs.save(new Club("Race " + key, "A club for concurrent capacity updates and bookings.",
                ClubCategory.TECHNOLOGY, null, "race@example.org"));
        Instant startTime = Instant.now().plusSeconds(86400);
        var event = events.save(new Event("Race Workshop " + key,
                "Workshop for testing an edit competing with another registration.",
                "Campus Auditorium", startTime, startTime.plusSeconds(3600),
                startTime.minusSeconds(3600), 2, null, EventCategory.WORKSHOP, club));
        var first = users.save(new User("Registered Student", key + "one@example.org", "test-only", Role.STUDENT));
        var second = users.save(new User("Competing Student", key + "two@example.org", "test-only", Role.STUDENT));
        service.register(event.getId(), first.getEmail());
        var reduceToOne = new EventRequest(event.getTitle(), event.getDescription(), event.getVenue(),
                startTime, startTime.plusSeconds(3600), startTime.minusSeconds(3600), 1, null,
                EventCategory.WORKSHOP, club.getId());
        var gate = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var booking = executor.submit(() -> {
                gate.await();
                try {
                    service.register(event.getId(), second.getEmail());
                    return true;
                } catch (ResponseStatusException expected) {
                    assertEquals(409, expected.getStatusCode().value());
                    return false;
                }
            });
            var edit = executor.submit(() -> {
                gate.await();
                try {
                    eventService.updateEvent(event.getId(), reduceToOne);
                    return true;
                } catch (IllegalArgumentException expected) {
                    return false;
                }
            });
            gate.countDown();
            boolean bookingSucceeded = booking.get(20, TimeUnit.SECONDS);
            boolean editSucceeded = edit.get(20, TimeUnit.SECONDS);
            assertNotEquals(bookingSucceeded, editSucceeded,
                    "Either the additional booking or the capacity reduction must be rejected");
        }
        var stored = events.findById(event.getId()).orElseThrow();
        assertTrue(stored.getRegisteredCount() <= stored.getCapacity());
        assertEquals(registrations.countByEventId(event.getId()), stored.getRegisteredCount());
    }

    private int attempt(Long eventId, String email, CountDownLatch start) {
        try {
            if (!start.await(10, TimeUnit.SECONDS)) throw new AssertionError("Start latch timed out");
            service.register(eventId, email);
            return 1;
        } catch (ResponseStatusException expected) {
            assertEquals(409, expected.getStatusCode().value());
            return 0;
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new AssertionError(interrupted);
        }
    }
}
