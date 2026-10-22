package com.campusconnect.repository;

import com.campusconnect.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.time.Instant;

public interface EventRepository
        extends JpaRepository<Event, Long>,
        JpaSpecificationExecutor<Event> {

    Optional<Event> findByIdAndActiveTrue(Long id);

    boolean existsByClubIdAndTitle(Long clubId, String title);

    boolean existsByClubIdAndTitleIgnoreCaseAndStartTime(Long clubId, String title, Instant startTime);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id and e.active = true")
    Optional<Event> findActiveByIdForUpdate(@Param("id") Long id);
}