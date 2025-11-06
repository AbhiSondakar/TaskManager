package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskHistoryDto;
import com.example.taskmanager.service.TaskHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskHistoryController {

    private final TaskHistoryService taskHistoryService;

    /**
     * Get complete history/audit trail for a task
     */
    @GetMapping("/{taskId}/history")
    public ResponseEntity<List<TaskHistoryDto>> getTaskHistory(@PathVariable Long taskId) {
        List<TaskHistoryDto> history = taskHistoryService.getTaskHistory(taskId);
        return ResponseEntity.ok(history);
    }
}