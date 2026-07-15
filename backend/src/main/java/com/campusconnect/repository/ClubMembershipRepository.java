package com.campusconnect.repository;

import com.campusconnect.entity.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMembershipRepository
        extends JpaRepository<ClubMembership, Long> {

    boolean existsByUserIdAndClubId(
            Long userId,
            Long clubId
    );

    Optional<ClubMembership> findByUserIdAndClubId(
            Long userId,
            Long clubId
    );

    List<ClubMembership> findAllByUserIdOrderByJoinedAtDesc(
            Long userId
    );

    long countByClubId(Long clubId);

    void deleteAllByClubId(Long clubId);
}