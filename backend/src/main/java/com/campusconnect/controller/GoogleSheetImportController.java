package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.service.EventImportService;
import com.campusconnect.service.GoogleSheetSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/import")
@PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
public class GoogleSheetImportController {
    private final GoogleSheetSyncService syncService;

    public record SheetSyncRequest(String url, String source) {}

    public GoogleSheetImportController(GoogleSheetSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/events/google-sheet")
    public ResponseEntity<ApiResponse<EventImportService.ImportResult>> sync(
            @RequestBody SheetSyncRequest input) throws Exception {
        if (input == null) throw new IllegalArgumentException("Sheet URL and source are required");
        return ResponseEntity.ok(ApiResponse.success("Google Sheet synchronized",
                syncService.sync(input.url(), input.source())));
    }
}
