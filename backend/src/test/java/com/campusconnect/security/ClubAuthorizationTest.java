package com.campusconnect.security;

import com.campusconnect.entity.*;
import com.campusconnect.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClubAuthorizationTest {
    @Mock UserRepository users;
    @Mock ClubMembershipRepository memberships;
    @Mock EventRepository events;

    @Test
    void coordinatorCannotManageAnotherClub() {
        var authorization = new ClubAuthorization(users, memberships, events);
        var auth = new UsernamePasswordAuthenticationToken("student@example.com", "ignored", java.util.List.of());
        var student = mock(User.class);
        when(student.isEnabled()).thenReturn(true);
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(student.getId()).thenReturn(7L);
        when(users.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(student));
        var membership = mock(ClubMembership.class);
        when(membership.getRole()).thenReturn(MembershipRole.COORDINATOR);
        when(memberships.findByUserIdAndClubId(7L, 11L)).thenReturn(Optional.of(membership));
        when(memberships.findByUserIdAndClubId(7L, 12L)).thenReturn(Optional.empty());

        assertTrue(authorization.canManage(11L, auth));
        assertFalse(authorization.canManage(12L, auth));
    }

    @Test
    void unauthenticatedUserCannotManageClubs() {
        var authorization = new ClubAuthorization(users, memberships, events);
        assertFalse(authorization.canManage(11L, null));
        verifyNoInteractions(users, memberships, events);
    }

    @Test
    void enabledUniversityAdminCanManageAnyClub() {
        var authorization = new ClubAuthorization(users, memberships, events);
        var auth = new UsernamePasswordAuthenticationToken("admin@example.com", "ignored", java.util.List.of());
        var admin = mock(User.class);
        when(admin.isEnabled()).thenReturn(true);
        when(admin.getRole()).thenReturn(Role.UNIVERSITY_ADMIN);
        when(users.findByEmailIgnoreCase("admin@example.com")).thenReturn(Optional.of(admin));

        assertTrue(authorization.canManage(42L, auth));
        verifyNoInteractions(memberships, events);
    }
}
