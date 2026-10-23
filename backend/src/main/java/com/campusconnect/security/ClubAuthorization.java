package com.campusconnect.security;

import com.campusconnect.entity.MembershipRole;
import com.campusconnect.entity.Role;
import com.campusconnect.repository.ClubMembershipRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.repository.EventRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("clubAuthorization")
public class ClubAuthorization {
    private final UserRepository users;
    private final EventRepository events;
    private final ClubMembershipRepository memberships;

    public ClubAuthorization(UserRepository users, ClubMembershipRepository memberships, EventRepository events) {
        this.users = users;
        this.events = events;
        this.memberships = memberships;
    }

    public boolean canManage(Long clubId, Authentication authentication) {
        if (clubId == null || authentication == null || !authentication.isAuthenticated()) return false;
        var user = users.findByEmailIgnoreCase(authentication.getName()).orElse(null);
        if (user == null || !user.isEnabled()) return false;
        if (user.getRole() == Role.UNIVERSITY_ADMIN) return true;
        return memberships.findByUserIdAndClubId(user.getId(), clubId)
                .map(m -> m.getRole() == MembershipRole.COORDINATOR || m.getRole() == MembershipRole.ADMIN)
                .orElse(false);
    }
    public boolean canManageEvent(Long eventId, Authentication authentication) {
        return events.findById(eventId)
                .map(event -> canManage(event.getClub().getId(), authentication))
                .orElse(false);
    }

    public boolean canMoveEvent(Long eventId, Long newClubId, Authentication authentication) {
        return canManageEvent(eventId, authentication) && canManage(newClubId, authentication);
    }
}
