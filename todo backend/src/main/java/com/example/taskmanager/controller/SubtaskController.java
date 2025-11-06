package com.example.taskmanager.controller;

import com.example.taskmanager.dto.SubtaskDto;
import com.example.taskmanager.service.SubtaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class SubtaskController {

    private final SubtaskService subtaskService;

    public SubtaskController(SubtaskService subtaskService) {
        this.subtaskService = subtaskService;
    }

    /**
     * Get all subtasks for a task (non-paginated)
     */
    @GetMapping("/{taskId}/subtasks/all")
    public ResponseEntity<List<SubtaskDto>> getSubtasks(@PathVariable Long taskId) {
        return ResponseEntity.ok(subtaskService.getSubtasksByTaskId(taskId));
    }

    /**
     * Get subtasks with pagination
     */
    @GetMapping("/{taskId}/subtasks")
    public ResponseEntity<Page<SubtaskDto>> getSubtasksPaginated(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<SubtaskDto> subtasks = subtaskService.getSubtasksByTaskIdWithPagination(taskId, page, size);
        return ResponseEntity.ok(subtasks);
    }

    @GetMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<SubtaskDto> getSubtask(@PathVariable Long taskId, @PathVariable Long subtaskId) {
        return ResponseEntity.ok(subtaskService.getSubtaskById(taskId, subtaskId));
    }

    @PostMapping("/{taskId}/subtasks")
    public ResponseEntity<SubtaskDto> createSubtask(
            @PathVariable Long taskId,
            @Valid @RequestBody SubtaskDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subtaskService.createSubtask(taskId, dto));
    }

    @PutMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<SubtaskDto> updateSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @Valid @RequestBody SubtaskDto dto) {
        return ResponseEntity.ok(subtaskService.updateSubtask(taskId, subtaskId, dto));
    }

    @PatchMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<SubtaskDto> patchSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId,
            @RequestBody SubtaskDto dto) {
        SubtaskDto updated = subtaskService.patchSubtask(taskId, subtaskId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}/subtasks/{subtaskId}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable Long taskId, @PathVariable Long subtaskId) {
        subtaskService.deleteSubtask(taskId, subtaskId);
        return ResponseEntity.noContent().build();
    }
}