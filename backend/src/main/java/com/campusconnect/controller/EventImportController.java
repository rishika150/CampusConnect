package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.EventRequest;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.service.EventService;
import com.campusconnect.repository.EventRepository;
import org.apache.commons.csv.CSVFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/import")
public class EventImportController {
    private final EventService events;
    private final EventRepository eventRepository;

    public EventImportController(EventService events, EventRepository eventRepository) {
        this.events = events;
        this.eventRepository = eventRepository;
    }

    public record ImportResult(int imported, int skipped, int failed, List<String> errors) {}

    @PostMapping(value = "/events/csv", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<ApiResponse<ImportResult>> importEvents(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty() || file.getSize() > 1024 * 1024)
            throw new IllegalArgumentException("CSV must be nonempty and no larger than 1 MB");
        var issues = new ArrayList<String>();
        int success = 0;
        int skipped = 0;
        var format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true)
                .setIgnoreSurroundingSpaces(true).get();
        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             var parser = format.parse(reader)) {
            var required = List.of("clubId", "title", "description", "venue", "startTime", "endTime",
                    "registrationDeadline", "capacity", "category");
            if (!parser.getHeaderMap().keySet().containsAll(required))
                throw new IllegalArgumentException("CSV is missing required column headers");
            for (var row : parser) {
                if (success + skipped + issues.size() >= 200) {
                    issues.add("Import stopped after 200 rows");
                    break;
                }
                try {
                    var request = new EventRequest(row.get("title"), row.get("description"),
                            row.get("venue"), Instant.parse(row.get("startTime")),
                            Instant.parse(row.get("endTime")), Instant.parse(row.get("registrationDeadline")),
                            Integer.parseInt(row.get("capacity")), parser.getHeaderMap().containsKey("bannerUrl") ? row.get("bannerUrl") : null,
                            EventCategory.valueOf(row.get("category").trim().toUpperCase()),
                            Long.valueOf(row.get("clubId")));
                    // Service validation applies to imported rows as well.
                    if (request.title().isBlank() || request.description().length() < 20 || request.venue().isBlank()
                            || request.capacity() < 1 || request.capacity() > 100000)
                        throw new IllegalArgumentException("Invalid event fields");
                    if (eventRepository.existsByClubIdAndTitleIgnoreCaseAndStartTime(
                            request.clubId(), request.title().trim(), request.startTime())) {
                        skipped++;
                        continue;
                    }
                    events.createEvent(request);
                    success++;
                } catch (Exception ex) {
                    issues.add("Row " + row.getRecordNumber() + ": " + (ex.getMessage() == null ? "Invalid data" : ex.getMessage()));
                }
            }
        }
        return ResponseEntity.ok(ApiResponse.success("CSV import processed",
                new ImportResult(success, skipped, issues.size(), issues)));
    }
}
