package com.campusconnect.service;

import com.campusconnect.dto.EventRequest;
import com.campusconnect.entity.*;
import com.campusconnect.repository.*;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("demo")
class IgdtuwGoogleFormIntegrationTest {
    @Autowired Validator validator;
    @Autowired MockMvc mvc;
    @Autowired ClubRepository clubs;
    @Autowired EventRepository events;
    @Autowired EventService eventService;
    @Autowired EventRegistrationService registrationService;
    @Autowired UserRepository users;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper mapper;

    private EventRequest request(String url, Long clubId) {
        Instant start = Instant.now().plusSeconds(86400);
        return new EventRequest("Public Demo Workshop", "A verified testing description for the registration form.",
                "University Auditorium", start, start.plusSeconds(7200), start.minusSeconds(3600),
                50, null, EventCategory.WORKSHOP, clubId, url, null, null);
    }

    @Test
    void rejectsUntrustedFormsAndAcceptsGoogleHosts() {
        assertFalse(validator.validate(request("https://example.org/collect", 1L)).isEmpty());
        assertFalse(validator.validate(request("https://forms.gle.evil.test/collect", 1L)).isEmpty());
        assertTrue(validator.validate(request("https://forms.gle/abc", 1L)).isEmpty());
        assertTrue(validator.validate(request("https://docs.google.com/forms/d/e/123/viewform", 1L)).isEmpty());
        assertTrue(validator.validate(request(null, 1L)).isEmpty());
    }

    @Test
    void unauthenticatedPersonalClubsEndpointReturns401() throws Exception {
        mvc.perform(get("/api/v1/clubs/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void sourcedDemoDataIsLoaded() {
        assertTrue(clubs.findByNameIgnoreCase("ACM Student Chapter").isPresent());
        var club = clubs.findByNameIgnoreCase("GDG on Campus IGDTUW").orElseThrow();
        assertTrue(events.existsByClubIdAndTitle(club.getId(), "GDG on Campus Orientation 2026–27"));
    }

    @Test
    void authenticatedStudentCannotPublishEvents() throws Exception {
        String email = UUID.randomUUID() + "@example.org";
        String password = "Test-Password-9283!";
        users.save(new User("Student Tester", email, passwordEncoder.encode(password), Role.STUDENT));
        String body = mapper.writeValueAsString(java.util.Map.of("email", email, "password", password));
        String response = mvc.perform(post("/api/v1/auth/login")
                .contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String token = mapper.readTree(response).path("data").path("accessToken").asText();
        assertFalse(token.isBlank());
        Instant start = Instant.now().plusSeconds(172800);
        Long clubId = clubs.findByNameIgnoreCase("ACM Student Chapter").orElseThrow().getId();
        var request = request("https://forms.gle/abc", clubId);
        mvc.perform(post("/api/v1/events")
                .header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content(mapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void externalFormEventsRejectNativeRegistration() {
        String key = UUID.randomUUID().toString();
        var club = clubs.save(new Club("Form Test " + key, "A dedicated club for external registration testing.",
                ClubCategory.TECHNOLOGY, null, null));
        var created = eventService.createEvent(request("https://forms.gle/abc", club.getId()));
        var error = assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> registrationService.register(created.id(), "nobody@example.org"));
        assertEquals(409, error.getStatusCode().value());
    }
}
