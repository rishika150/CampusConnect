package com.campusconnect.dto;

import com.campusconnect.entity.ClubCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClubRequest(

        @NotBlank(message = "Club name is required")
        @Size(
                min = 2,
                max = 120,
                message = "Club name must contain between 2 and 120 characters"
        )
        String name,

        @NotBlank(message = "Description is required")
        @Size(
                min = 20,
                max = 2000,
                message = "Description must contain between 20 and 2000 characters"
        )
        String description,

        @NotNull(message = "Category is required")
        ClubCategory category,

        @Size(
                max = 500,
                message = "Logo URL cannot exceed 500 characters"
        )
        String logoUrl,

        @NotBlank(message = "Contact email is required")
        @Email(message = "Enter a valid contact email address")
        @Size(
                max = 150,
                message = "Contact email cannot exceed 150 characters"
        )
        String contactEmail
) {
}
