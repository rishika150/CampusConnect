package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "clubs",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_clubs_name",
                        columnNames = "name"
                )
        },
        indexes = {
                @Index(
                        name = "idx_clubs_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_clubs_category",
                        columnList = "category"
                ),
                @Index(
                        name = "idx_clubs_active",
                        columnList = "is_active"
                )
        }
)
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            nullable = false,
            length = 120
    )
    private String name;

    @Column(
            nullable = false,
            length = 2000
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 40
    )
    private ClubCategory category;

    @Column(
            name = "logo_url",
            length = 500
    )
    private String logoUrl;

    @Column(
            name = "contact_email",
            nullable = false,
            length = 150
    )
    private String contactEmail;

    @Column(
            name = "is_active",
            nullable = false
    )
    private boolean active = true;

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

    @OneToMany(
            mappedBy = "club",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ClubMembership> memberships = new ArrayList<>();

    protected Club() {
    }

    public Club(
            String name,
            String description,
            ClubCategory category,
            String logoUrl,
            String contactEmail
    ) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.logoUrl = logoUrl;
        this.contactEmail = contactEmail;
        this.active = true;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ClubCategory getCategory() {
        return category;
    }

    public void setCategory(ClubCategory category) {
        this.category = category;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<ClubMembership> getMemberships() {
        return memberships;
    }
}