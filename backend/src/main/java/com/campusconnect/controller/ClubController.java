package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.ClubMembershipResponse;
import com.campusconnect.dto.ClubRequest;
import com.campusconnect.dto.ClubResponse;
import com.campusconnect.dto.PageResponse;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.service.ClubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clubs")
@Tag(
        name = "Clubs",
        description = "Club listing, management, and membership APIs"
)
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping("/me")
    @Operation(
            summary = "List clubs joined by the authenticated user"
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Memberships retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<ApiResponse<List<ClubMembershipResponse>>> myClubs(
            Authentication authentication
    ) {
        List<ClubMembershipResponse> memberships =
                clubService.getMyClubs(authentication.getName());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Club memberships retrieved successfully",
                        memberships
                )
        );
    }

    @GetMapping
    @Operation(summary = "List active clubs with optional search and filters")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Clubs retrieved")
    })
    public ResponseEntity<ApiResponse<PageResponse<ClubResponse>>> listClubs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ClubCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            Authentication authentication
    ) {
        String currentUserEmail = authentication != null
                ? authentication.getName()
                : null;

        PageResponse<ClubResponse> clubs = clubService.listActiveClubs(
                search,
                category,
                page,
                size,
                sortBy,
                sortDirection,
                currentUserEmail
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Clubs retrieved successfully",
                        clubs
                )
        );
    }

    @GetMapping("/{clubId}")
    @Operation(summary = "Get active club details by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Club retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Club not found")
    })
    public ResponseEntity<ApiResponse<ClubResponse>> getClub(
            @PathVariable Long clubId,
            Authentication authentication
    ) {
        String currentUserEmail = authentication != null
                ? authentication.getName()
                : null;

        ClubResponse club = clubService.getActiveClubById(
                clubId,
                currentUserEmail
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Club retrieved successfully",
                        club
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @Operation(summary = "Create a new club")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Club created"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate club name")
    })
    public ResponseEntity<ApiResponse<ClubResponse>> createClub(
            @Valid @RequestBody ClubRequest request
    ) {
        ClubResponse club = clubService.createClub(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Club created successfully",
                        club
                ));
    }

    @PutMapping("/{clubId}")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @Operation(summary = "Update an existing club")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Club updated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Club not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate club name")
    })
    public ResponseEntity<ApiResponse<ClubResponse>> updateClub(
            @PathVariable Long clubId,
            @Valid @RequestBody ClubRequest request
    ) {
        ClubResponse club = clubService.updateClub(clubId, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Club updated successfully",
                        club
                )
        );
    }

    @DeleteMapping("/{clubId}")
    @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
    @Operation(summary = "Soft-delete a club by deactivating it")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Club deactivated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Club not found")
    })
    public ResponseEntity<ApiResponse<Void>> deactivateClub(
            @PathVariable Long clubId
    ) {
        clubService.deactivateClub(clubId);

        return ResponseEntity.ok(
                ApiResponse.success("Club deactivated successfully")
        );
    }

    @PostMapping("/{clubId}/join")
    @Operation(summary = "Join a club as a member")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Joined club"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Club is inactive"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Club not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Already a member")
    })
    public ResponseEntity<ApiResponse<ClubMembershipResponse>> joinClub(
            @PathVariable Long clubId,
            Authentication authentication
    ) {
        ClubMembershipResponse membership = clubService.joinClub(
                clubId,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Joined club successfully",
                        membership
                ));
    }

    @DeleteMapping("/{clubId}/leave")
    @Operation(summary = "Leave a club")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Left club"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Membership not found")
    })
    public ResponseEntity<ApiResponse<Void>> leaveClub(
            @PathVariable Long clubId,
            Authentication authentication
    ) {
        clubService.leaveClub(clubId, authentication.getName());

        return ResponseEntity.ok(
                ApiResponse.success("Left club successfully")
        );
    }
}
