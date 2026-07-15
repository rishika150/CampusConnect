package com.campusconnect.repository;

import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClubRepository extends JpaRepository<Club, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            Long id
    );

    @Query("""
            SELECT c
            FROM Club c
            WHERE c.active = true
              AND (
                    LOWER(c.name) LIKE CONCAT('%', :search, '%')
                    OR LOWER(c.description) LIKE CONCAT('%', :search, '%')
                  )
              AND (
                    :category IS NULL
                    OR c.category = :category
                  )
            """)
    Page<Club> searchActiveClubs(
            @Param("search") String search,
            @Param("category") ClubCategory category,
            Pageable pageable
    );
}