package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskDto {
    private Long id;

    @NotBlank(message = "Subtask title is required")
    private String title;

    private String description;

    // Changed to Boolean (wrapper) to support null values for PATCH operations
    private Boolean completed;
}