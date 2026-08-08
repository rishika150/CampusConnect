package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_registrations_user_event",
                        columnNames = {"user_id", "event_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_event_registrations_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_event_registrations_event",
                        columnList = "event_id"
                )
        }
)
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_event_registrations_user"
            )
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "event_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_event_registrations_event"
            )
    )
    private Event event;

    @Column(
            name = "registered_at",
            nullable = false,
            updatable = false
    )
    private Instant registeredAt;

    protected EventRegistration() {
    }

    public EventRegistration(User user, Event event) {
        this.user = user;
        this.event = event;
    }

    @PrePersist
    void onCreate() {
        registeredAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Event getEvent() {
        return event;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }
}
