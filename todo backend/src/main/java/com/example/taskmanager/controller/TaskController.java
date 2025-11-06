package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskDto;
import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.Status;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Get all tasks (non-paginated, for backward compatibility)
     */
    @GetMapping("/all")
    public List<TaskDto> getAllTasks() {
        return taskService.getAllTasks();
    }

    /**
     * Get tasks with pagination, filtering, and sorting
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     * @param sortBy Sort field (default: id)
     * @param sortDirection Sort direction: asc or desc (default: desc)
     * @param status Filter by status
     * @param priority Filter by priority
     * @param dueDate Filter by due date
     * @param tag Filter by tag
     */
    @GetMapping
    public ResponseEntity<Page<TaskDto>> getTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) String tag) {

        Page<TaskDto> tasks = taskService.getTasksWithPagination(
                page, size, sortBy, sortDirection, status, priority, dueDate, tag
        );
        return ResponseEntity.ok(tasks);
    }

    /**
     * Search tasks by keyword in title or description
     * @param query Search keyword
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<TaskDto>> searchTasks(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<TaskDto> tasks = taskService.searchTasks(query, page, size);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto) {
        TaskDto createdTask = taskService.createTask(taskDto);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * Soft delete (archive) a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restore an archived task
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<TaskDto> restoreTask(@PathVariable Long id) {
        TaskDto restoredTask = taskService.restoreTask(id);
        return ResponseEntity.ok(restoredTask);
    }

    /**
     * Permanently delete a task (use with caution)
     */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteTask(@PathVariable Long id) {
        taskService.permanentlyDeleteTask(id);
        return ResponseEntity.noContent().build();
    }
}