package com.campusconnect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/** Fetch only direct, public Google Sheets CSV exports. */
@Service
public class GoogleSheetSyncService {
    private static final int MAX_BYTES = 1024 * 1024;
    private final EventImportService imports;
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(5)).build();

    public GoogleSheetSyncService(EventImportService imports) {
        this.imports = imports;
    }

    public EventImportService.ImportResult sync(String url, String source) throws Exception {
        if (url == null || source == null || !source.matches("[A-Za-z0-9._-]{1,60}")) {
            throw new IllegalArgumentException("Provide a valid sheet URL and stable source identifier");
        }
        URI uri = URI.create(url);
        if (!"https".equals(uri.getScheme()) || !"docs.google.com".equals(uri.getHost())
                || uri.getRawUserInfo() != null || uri.getPort() != -1
                || !uri.getPath().matches("/spreadsheets/d/[A-Za-z0-9_-]+/(export|gviz/tq)")) {
            throw new IllegalArgumentException("Only direct HTTPS Google Sheets CSV export URLs are accepted");
        }
        String query = uri.getRawQuery();
        if (query == null || !(query.contains("format=csv") || query.contains("tqx=out%3Acsv") || query.contains("tqx=out:csv"))) {
            throw new IllegalArgumentException("The Google Sheets URL must request CSV output");
        }
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(12))
                .header("Accept", "text/csv")
                .GET().build();
        HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200 || response.body().length > MAX_BYTES) {
            throw new IllegalArgumentException("The public sheet must return CSV under 1 MB");
        }
        String body = new String(response.body(), StandardCharsets.UTF_8);
        // Google may serve an access-denied HTML page with HTTP 200.
        if (body.stripLeading().startsWith("<")) {
            throw new IllegalArgumentException("Sheet returned HTML, not CSV; check its public CSV export link");
        }
        return imports.process(new StringReader(body), source);
    }
}
