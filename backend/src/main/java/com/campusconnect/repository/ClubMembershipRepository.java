package com.campusconnect.repository;

import com.campusconnect.entity.ClubMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
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

    List<ClubMembership> findAllByUserIdAndClubIdIn(
            Long userId,
            Collection<Long> clubIds
    );

    @Query("""
            SELECT cm.club.id, COUNT(cm)
            FROM ClubMembership cm
            WHERE cm.club.id IN :clubIds
            GROUP BY cm.club.id
            """)
    List<Object[]> countMembersByClubIds(
            @Param("clubIds") Collection<Long> clubIds
    );

    long countByClubId(Long clubId);

    void deleteAllByClubId(Long clubId);
}