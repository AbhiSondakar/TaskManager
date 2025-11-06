package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskHistoryDto;
import com.example.taskmanager.model.TaskHistory;
import com.example.taskmanager.repository.TaskHistoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskHistoryService {

    private final TaskHistoryRepository taskHistoryRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<TaskHistoryDto> getTaskHistory(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found with id: " + taskId);
        }

        return taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private TaskHistoryDto convertToDto(TaskHistory history) {
        return new TaskHistoryDto(
                history.getId(),
                history.getFieldChanged(),
                history.getOldValue(),
                history.getNewValue(),
                history.getChangedAt()
        );
    }
}