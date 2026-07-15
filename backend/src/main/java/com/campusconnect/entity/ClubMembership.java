package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "club_memberships",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_club_memberships_user_club",
                        columnNames = {
                                "user_id",
                                "club_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_club_memberships_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_club_memberships_club",
                        columnList = "club_id"
                )
        }
)
public class ClubMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_club_memberships_user"
            )
    )
    private User user;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "club_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_club_memberships_club"
            )
    )
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private MembershipRole role = MembershipRole.MEMBER;

    @Column(
            name = "joined_at",
            nullable = false,
            updatable = false
    )
    private Instant joinedAt;

    protected ClubMembership() {
    }

    public ClubMembership(
            User user,
            Club club,
            MembershipRole role
    ) {
        this.user = user;
        this.club = club;
        this.role = role;
    }

    @PrePersist
    void onCreate() {
        joinedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Club getClub() {
        return club;
    }

    public MembershipRole getRole() {
        return role;
    }

    public void setRole(MembershipRole role) {
        this.role = role;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }
}