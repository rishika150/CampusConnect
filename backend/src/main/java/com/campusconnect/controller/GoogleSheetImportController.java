package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.service.EventImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/** Sync a public Google Sheets CSV export without OAuth or a paid API. */
@RestController
@RequestMapping("/api/v1/admin/import")
@PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
public class GoogleSheetImportController {
    private final EventImportService imports;
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(5)).build();

    public record SheetSyncRequest(String url, String source) {}

    public GoogleSheetImportController(EventImportService imports) { this.imports = imports; }

    @PostMapping("/events/google-sheet")
    public ResponseEntity<ApiResponse<EventImportService.ImportResult>> sync(
            @RequestBody SheetSyncRequest input) throws Exception {
        if (input == null || input.url() == null || input.source() == null ||
                !input.source().matches("[A-Za-z0-9._-]{1,60}"))
            throw new IllegalArgumentException("Provide a valid URL and stable source identifier");
        URI uri = URI.create(input.url());
        if (!"https".equals(uri.getScheme()) || !"docs.google.com".equals(uri.getHost())
                || uri.getRawUserInfo() != null || uri.getPort() != -1
                || !uri.getPath().startsWith("/spreadsheets/d/"))
            throw new IllegalArgumentException("Only HTTPS Google Sheets CSV export URLs are accepted");
        var request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(12))
                .header("Accept", "text/csv").GET().build();
        var response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200 || response.body().length > 1024 * 1024)
            throw new IllegalArgumentException("Google Sheet must be publicly readable CSV smaller than 1 MB");
        var body = new String(response.body(), java.nio.charset.StandardCharsets.UTF_8);
        try (var reader = new StringReader(body)) {
            return ResponseEntity.ok(ApiResponse.success("Google Sheet synchronized",
                    imports.process(reader, input.source())));
        }
    }
}
