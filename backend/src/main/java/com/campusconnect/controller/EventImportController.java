package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.service.EventImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/admin/import")
@PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
public class EventImportController {
    private final EventImportService imports;

    public EventImportController(EventImportService imports) {
        this.imports = imports;
    }

    @PostMapping(value = "/events/csv", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<EventImportService.ImportResult>> importEvents(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "source", defaultValue = "manual") String source) throws Exception {
        if (file.isEmpty() || file.getSize() > 1024 * 1024)
            throw new IllegalArgumentException("CSV must be nonempty and no larger than 1 MB");
        if (!source.matches("[A-Za-z0-9._-]{1,60}"))
            throw new IllegalArgumentException("Invalid source name");
        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            return ResponseEntity.ok(ApiResponse.success("CSV import processed", imports.process(reader, source)));
        }
    }
}
