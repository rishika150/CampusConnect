package com.campusconnect.config;

import com.campusconnect.entity.*;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Demo-only fixture data. Never executes in normal or production profiles.
 * Event dates are created relative to initialization and rows are not duplicated.
 */
@Component
@Profile("demo")
public class DemoDataSeeder implements ApplicationRunner {
    private final ClubRepository clubs;
    private final EventRepository events;

    public DemoDataSeeder(ClubRepository clubs, EventRepository events) {
        this.clubs = clubs;
        this.events = events;
    }

    private record SampleClub(String name, ClubCategory category, String description) {}

    private static final List<SampleClub> SAMPLES = List.of(
        new SampleClub("Campus Coding Collective", ClubCategory.TECHNOLOGY, "A student-led community for programming practice, technical workshops and peer mentoring."),
        new SampleClub("Robotics and Innovation Club", ClubCategory.TECHNOLOGY, "Explore robotics, practical prototyping, electronics and hands-on engineering challenges."),
        new SampleClub("Campus Dance Society", ClubCategory.DANCE, "A welcoming space for dance workshops, choreography, showcases and performing arts."),
        new SampleClub("Literary and Debate Forum", ClubCategory.LITERARY, "Improve public speaking, critical thinking and creative writing through student activities."),
        new SampleClub("Entrepreneurship Circle", ClubCategory.ENTREPRENEURSHIP, "Connect aspiring founders through idea pitches, product workshops and startup discussions."),
        new SampleClub("Music and Arts Collective", ClubCategory.MUSIC, "Collaborate with musicians and performers through rehearsals, open mics and showcases."),
        new SampleClub("University Sports Society", ClubCategory.SPORTS, "Join friendly competitions, training sessions and inclusive campus wellness activities."),
        new SampleClub("Community Service Network", ClubCategory.SOCIAL_SERVICE, "Coordinate student volunteering, social impact projects and local outreach activities.")
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Instant base = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        for (int i = 0; i < SAMPLES.size(); i++) {
            var sample = SAMPLES.get(i);
            Club club = clubs.findByNameIgnoreCase(sample.name()).orElseGet(() ->
                    clubs.save(new Club(sample.name(), sample.description(), sample.category(),
                            null, "demo-events@example.org")));
            if (!club.isActive()) continue;

            for (int j = 0; j < 4; j++) {
                String title = sample.name() + " - " + switch (j) {
                    case 0 -> "Introduction Session";
                    case 1 -> "Hands-on Workshop";
                    case 2 -> "Community Meetup";
                    default -> "Annual Showcase";
                };
                if (events.existsByClubIdAndTitle(club.getId(), title)) continue;
                Instant start = base.plus((long) (i * 4 + j + 2), ChronoUnit.DAYS);
                Instant end = start.plus(2, ChronoUnit.HOURS);
                Instant deadline = start.minus(1, ChronoUnit.DAYS);
                var category = switch (j) {
                    case 1 -> EventCategory.WORKSHOP;
                    case 2 -> EventCategory.NETWORKING;
                    default -> sample.category() == ClubCategory.SPORTS
                            ? EventCategory.SPORTS : EventCategory.OTHER;
                };
                events.save(new Event(title,
                        "Demo event for interview walkthroughs. Meet club members, learn about upcoming opportunities, and participate in practical campus activities.",
                        "Campus Activity Hall", start, end, deadline, 40 + j * 20,
                        null, category, club));
            }
        }
    }
}
