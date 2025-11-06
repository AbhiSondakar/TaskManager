package com.example.taskmanager.dto;

import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
public class TaskDto {
    private Long id;

    @NotBlank(message = "Title is mandatory")
    private String title;

    private String description;

    @NotNull(message = "Status is mandatory")
    private Status status;

    private LocalDate dueDate;

    @NotNull(message = "Priority is mandatory")
    private Priority priority;

    private boolean archived;

    private Set<String> tags;

    private List<SubtaskDto> subtasks;

    private List<CommentDto> comments;

    private List<AttachmentDto> attachments;
}