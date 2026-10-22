package com.campusconnect.security;

import com.campusconnect.config.SecurityConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {
    private final JwtService jwt = new JwtService(
            Base64.getEncoder().encodeToString("a-long-test-only-secret-key-with-enough-entropy-123".getBytes(StandardCharsets.UTF_8)),
            3600000L
    );

    @AfterEach void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test void disabledAccountCannotAuthenticateWithExistingJwt() throws Exception {
        var details = User.withUsername("disabled@example.org")
                .password("irrelevant").roles("STUDENT").disabled(true).build();
        var userDetails = mock(CustomUserDetailsService.class);
        when(userDetails.loadUserByUsername("disabled@example.org")).thenReturn(details);

        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.addHeader("Authorization", "Bearer " + jwt.generateToken(details));
        new JwtAuthenticationFilter(jwt, userDetails).doFilter(
                request, new MockHttpServletResponse(), new MockFilterChain()
        );

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test void enabledAccountAuthenticatesWithValidJwt() throws Exception {
        var details = User.withUsername("enabled@example.org")
                .password("irrelevant").roles("STUDENT").build();
        var userDetails = mock(CustomUserDetailsService.class);
        when(userDetails.loadUserByUsername("enabled@example.org")).thenReturn(details);

        var request = new MockHttpServletRequest("GET", "/api/v1/users/me");
        request.addHeader("Authorization", "Bearer " + jwt.generateToken(details));
        new JwtAuthenticationFilter(jwt, userDetails).doFilter(
                request, new MockHttpServletResponse(), new MockFilterChain()
        );

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
