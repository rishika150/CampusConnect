package com.campusconnect.config;

import com.campusconnect.service.GoogleSheetSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.concurrent.atomic.AtomicBoolean;

@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "campusconnect.sheets.enabled", havingValue = "true")
public class ScheduledSheetSync {
    private static final Logger log = LoggerFactory.getLogger(ScheduledSheetSync.class);

    private final GoogleSheetSyncService service;
    private final String url;
    private final String source;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public ScheduledSheetSync(GoogleSheetSyncService service,
            @Value("${campusconnect.sheets.url:}") String url,
            @Value("${campusconnect.sheets.source:}") String source) {
        this.service = service;
        this.url = url;
        this.source = source;
        if (url.isBlank() || source.isBlank()) {
            throw new IllegalStateException("Scheduled sheet sync needs SHEET_CSV_URL and SHEET_SOURCE");
        }
    }

    @Scheduled(fixedDelayString = "${campusconnect.sheets.interval-ms:1800000}",
            initialDelayString = "${campusconnect.sheets.initial-delay-ms:30000}")
    public void synchronize() {
        if (!running.compareAndSet(false, true)) return;
        try {
            var result = service.sync(url, source);
            log.info("Sheet sync complete: imported={}, updated={}, skipped={}, failed={}",
                    result.imported(), result.updated(), result.skipped(), result.failed());
            if (!result.errors().isEmpty()) log.warn("Sheet sync reported {} rejected rows", result.errors().size());
        } catch (Exception ex) {
            log.error("Scheduled Google Sheets sync failed: {}", ex.toString());
        } finally {
            running.set(false);
        }
    }
}
