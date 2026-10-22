package com.campusconnect.dto;

import com.campusconnect.entity.MembershipRole;
import jakarta.validation.constraints.NotNull;

public record MembershipRoleRequest(@NotNull MembershipRole role) {}
