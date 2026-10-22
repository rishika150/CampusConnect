package com.campusconnect.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "event_registrations",
    uniqueConstraints = @UniqueConstraint(name = "uk_event_registration_user_event", columnNames = {"user_id", "event_id"}),
    indexes = @Index(name = "idx_event_registration_event", columnList = "event_id"))
public class EventRegistration {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private Instant registeredAt;

    protected EventRegistration() {}

    public EventRegistration(User user, Event event) {
        this.user = user;
        this.event = event;
        this.registeredAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Event getEvent() { return event; }
    public Instant getRegisteredAt() { return registeredAt; }
}
