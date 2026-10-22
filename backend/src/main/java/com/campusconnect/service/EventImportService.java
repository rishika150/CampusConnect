package com.campusconnect.service;

import com.campusconnect.dto.EventRequest;
import com.campusconnect.entity.Event;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.repository.EventRepository;
import org.apache.commons.csv.CSVFormat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.Reader;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
public class EventImportService {
    private final EventRepository repository;
    private final EventService eventService;

    public EventImportService(EventRepository repository, EventService eventService) {
        this.repository = repository;
        this.eventService = eventService;
    }

    public record ImportResult(int imported, int updated, int skipped, int failed, List<String> errors) {}

    public ImportResult process(Reader reader, String source) throws java.io.IOException {
        var errors = new ArrayList<String>();
        var seen = new HashSet<String>();
        int imported = 0, updated = 0, skipped = 0;
        var format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true).get();
        try (var parser = format.parse(reader)) {
            var required = List.of("externalId", "clubId", "title", "description", "venue",
                    "startTime", "endTime", "registrationDeadline", "capacity", "category");
            if (!parser.getHeaderMap().keySet().containsAll(required))
                throw new IllegalArgumentException("CSV requires headers: " + String.join(", ", required));
            for (var row : parser) {
                if (imported + updated + skipped + errors.size() >= 200) {
                    errors.add("Import stopped after 200 rows");
                    break;
                }
                try {
                    String id = row.get("externalId").trim();
                    if (!id.matches("[A-Za-z0-9._:-]{1,120}"))
                        throw new IllegalArgumentException("externalId must be 1-120 letters, digits or . _ : -");
                    String sourceKey = source + ":" + id;
                    if (!seen.add(sourceKey)) {
                        skipped++;
                        continue;
                    }
                    var request = new EventRequest(row.get("title"), row.get("description"),
                            row.get("venue"), Instant.parse(row.get("startTime")),
                            Instant.parse(row.get("endTime")), Instant.parse(row.get("registrationDeadline")),
                            Integer.parseInt(row.get("capacity")),
                            parser.getHeaderMap().containsKey("bannerUrl") ? row.get("bannerUrl") : null,
                            EventCategory.valueOf(row.get("category").trim().toUpperCase(java.util.Locale.ROOT)),
                            Long.valueOf(row.get("clubId")));
                    if (request.title().isBlank() || request.description().length() < 20 ||
                            request.venue().isBlank() || request.capacity() < 1 || request.capacity() > 100000)
                        throw new IllegalArgumentException("Invalid event fields");
                    int result = upsert(sourceKey, request);
                    if (result == 1) imported++;
                    else if (result == 2) updated++;
                    else skipped++;
                } catch (Exception ex) {
                    errors.add("Row " + row.getRecordNumber() + ": " +
                            (ex.getMessage() == null ? "Invalid data" : ex.getMessage()));
                }
            }
        }
        return new ImportResult(imported, updated, skipped, errors.size(), errors);
    }

    @Transactional
    public int upsert(String sourceKey, EventRequest request) {
        // This method is also invoked through the transactional proxy by CSV import controller.
        var existing = repository.findBySourceKey(sourceKey);
        if (existing.isPresent()) {
            Event event = existing.get();
            if (!event.isActive()) return 0; // Do not resurrect cancelled events.
            if (!event.getClub().getId().equals(request.clubId()))
                throw new IllegalArgumentException("Imported event cannot change its club");
            if (event.getTitle().equals(request.title()) && event.getDescription().equals(request.description())
                    && event.getVenue().equals(request.venue()) && event.getStartTime().equals(request.startTime())
                    && event.getEndTime().equals(request.endTime())
                    && event.getRegistrationDeadline().equals(request.registrationDeadline())
                    && event.getCapacity() == request.capacity() && event.getCategory() == request.category())
                return 0;
            eventService.updateEvent(event.getId(), request);
            return 2;
        }
        var created = eventService.createEvent(request);
        repository.findById(created.id()).orElseThrow().setSourceKey(sourceKey);
        return 1;
    }
}
