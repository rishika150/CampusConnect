package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.UserResponse;
import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(
        name = "Users",
        description = "Authenticated user profile APIs"
)
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> me(
            Authentication authentication
    ) {
        User user = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile retrieved successfully",
                        UserResponse.from(user)
                )
        );
    }
}