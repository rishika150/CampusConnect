package com.campusconnect.config;

import com.campusconnect.entity.*;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.OffsetDateTime;

/**
 * Explicitly demo-only. Sourced events are imported only when a complete
 * date/time is available; undocumented fields are not guessed.
 */
@Component
@Profile("demo")
public class IgdtuwDemoSeeder implements ApplicationRunner {
    private final ClubRepository clubs;
    private final EventRepository events;
    private final ObjectMapper mapper;

    public IgdtuwDemoSeeder(ClubRepository clubs, EventRepository events, ObjectMapper mapper) {
        this.clubs = clubs;
        this.events = events;
        this.mapper = mapper;
    }

    private JsonNode records(String path) throws java.io.IOException {
        try (InputStream stream = new ClassPathResource("demo/" + path).getInputStream()) {
            return mapper.readTree(stream);
        }
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        for (JsonNode item : records("igdtuw_clubs.json")) {
            if (!item.path("verified").asBoolean(false)) continue;
            String name = item.path("name").asText();
            if (clubs.findByNameIgnoreCase(name).isPresent()) continue;
            String email = item.path("contactEmail").isNull() ? null : item.path("contactEmail").asText();
            clubs.save(new Club(name,
                    item.path("description").asText(),
                    ClubCategory.valueOf(item.path("category").asText()),
                    null, email));
        }

        for (JsonNode item : records("igdtuw_events.json")) {
            // An unknown end time must not be converted into a fictional schedule.
            if (!item.path("verified").asBoolean(false) || item.path("endTime").isNull()) continue;
            var club = clubs.findByNameIgnoreCase(item.path("club").asText());
            if (club.isEmpty()) continue;
            String title = item.path("title").asText();
            if (events.existsByClubIdAndTitle(club.get().getId(), title)) continue;
            var start = OffsetDateTime.parse(item.path("startTime").asText()).toInstant();
            var end = OffsetDateTime.parse(item.path("endTime").asText()).toInstant();
            events.save(new Event(title, item.path("description").asText(),
                    item.path("venue").asText(), start, end,
                    start.minusSeconds(86400), 100, null,
                    EventCategory.valueOf(item.path("category").asText()), club.get()));
        }
    }
}
