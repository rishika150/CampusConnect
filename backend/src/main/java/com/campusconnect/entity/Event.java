package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(
                        name = "idx_events_club_id",
                        columnList = "club_id"
                ),
                @Index(
                        name = "idx_events_start_time",
                        columnList = "start_time"
                ),
                @Index(
                        name = "idx_events_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_events_category",
                        columnList = "category"
                ),
                @Index(
                        name = "idx_events_active",
                        columnList = "is_active"
                )
        }
)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 120
    )
    private String title;

    @Column(
            nullable = false,
            length = 3000
    )
    private String description;

    @Column(
            nullable = false,
            length = 250
    )
    private String venue;

    @Column(
            name = "start_time",
            nullable = false
    )
    private Instant startTime;

    @Column(
            name = "end_time",
            nullable = false
    )
    private Instant endTime;

    @Column(
            name = "registration_deadline",
            nullable = false
    )
    private Instant registrationDeadline;

    @Column(nullable = false)
    private int capacity;

    @Column(
            name = "registered_count",
            nullable = false
    )
    private int registeredCount;

    @Column(
            name = "banner_url",
            length = 500
    )
    private String bannerUrl;

    @Column(
            name = "is_active",
            nullable = false
    )
    private boolean active;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private EventCategory category;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private EventStatus status;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "club_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_events_club"
            )
    )
    private Club club;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected Event() {
    }

    public Event(
            String title,
            String description,
            String venue,
            Instant startTime,
            Instant endTime,
            Instant registrationDeadline,
            int capacity,
            String bannerUrl,
            EventCategory category,
            Club club
    ) {
        this.title = title;
        this.description = description;
        this.venue = venue;
        this.startTime = startTime;
        this.endTime = endTime;
        this.registrationDeadline = registrationDeadline;
        this.capacity = capacity;
        this.bannerUrl = bannerUrl;
        this.category = category;
        this.club = club;
        this.registeredCount = 0;
        this.active = true;
        this.status = calculateStatus();
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;
        status = calculateStatus();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();

        if (status != EventStatus.CANCELLED) {
            status = calculateStatus();
        }
    }

    public EventStatus calculateStatus() {
        if (status == EventStatus.CANCELLED) {
            return EventStatus.CANCELLED;
        }

        Instant now = Instant.now();

        if (now.isBefore(startTime)) {
            return EventStatus.UPCOMING;
        }

        if (!now.isAfter(endTime)) {
            return EventStatus.ONGOING;
        }

        return EventStatus.COMPLETED;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Instant getRegistrationDeadline() {
        return registrationDeadline;
    }

    public void setRegistrationDeadline(Instant registrationDeadline) {
        this.registrationDeadline = registrationDeadline;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getRegisteredCount() {
        return registeredCount;
    }

    public void setRegisteredCount(int registeredCount) {
        this.registeredCount = registeredCount;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public EventCategory getCategory() {
        return category;
    }

    public void setCategory(EventCategory category) {
        this.category = category;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public Club getClub() {
        return club;
    }

    public void setClub(Club club) {
        this.club = club;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}