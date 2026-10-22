package com.campusconnect.service;

import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.io.StringReader;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EventImportServiceIntegrationTest {
    @Autowired EventImportService imports;
    @Autowired ClubRepository clubs;
    @Autowired EventRepository events;

    @Test
    void reimportUpdatesExistingEventRatherThanDuplicatingIt() throws Exception {
        String key = UUID.randomUUID().toString();
        Club club = clubs.save(new Club("Importer " + key, "A club used in import integration tests.",
                ClubCategory.TECHNOLOGY, null, "test@example.org"));
        Instant start = Instant.now().plusSeconds(86400);
        String source = "test-" + key;
        String csv = "externalId,clubId,title,description,venue,startTime,endTime,registrationDeadline,capacity,category\n" +
                "event-one," + club.getId() + ",Demo Workshop,A detailed workshop description for import testing,Auditorium," +
                start + "," + start.plusSeconds(3600) + "," + start.minusSeconds(3600) + ",30,WORKSHOP\n";

        var first = imports.process(new StringReader(csv), source);
        var second = imports.process(new StringReader(csv), source);
        assertEquals(1, first.imported(), first.toString());
        assertEquals(0, first.failed());
        assertEquals(1, second.skipped());
        assertEquals(0, second.failed());

        String revised = csv.replace(",30,WORKSHOP", ",45,WORKSHOP");
        var third = imports.process(new StringReader(revised), source);
        assertEquals(1, third.updated());
        var stored = events.findBySourceKey(source + ":event-one").orElseThrow();
        assertEquals(45, stored.getCapacity());

        String withBanner = revised.replace(
                "capacity,category\n", "capacity,category,bannerUrl\n"
        ).replace(",45,WORKSHOP\n", ",45,WORKSHOP,https://example.org/banner.png\n");
        var fourth = imports.process(new StringReader(withBanner), source);
        assertEquals(1, fourth.updated(), fourth.toString());
        assertEquals(0, fourth.failed(), fourth.toString());
        assertEquals("https://example.org/banner.png",
                events.findBySourceKey(source + ":event-one").orElseThrow().getBannerUrl());
        var fifth = imports.process(new StringReader(withBanner), source);
        assertEquals(1, fifth.skipped(), fifth.toString());
    }
}
