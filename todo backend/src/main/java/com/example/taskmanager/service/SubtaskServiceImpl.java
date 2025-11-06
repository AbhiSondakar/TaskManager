package com.example.taskmanager.service;

import com.example.taskmanager.dto.SubtaskDto;
import com.example.taskmanager.model.Status;
import com.example.taskmanager.model.Subtask;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskHistory;
import com.example.taskmanager.repository.SubtaskRepository;
import com.example.taskmanager.repository.TaskHistoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubtaskServiceImpl implements SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;

    public SubtaskServiceImpl(SubtaskRepository subtaskRepository,
                              TaskRepository taskRepository,
                              TaskHistoryRepository taskHistoryRepository) {
        this.subtaskRepository = subtaskRepository;
        this.taskRepository = taskRepository;
        this.taskHistoryRepository = taskHistoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubtaskDto> getSubtasksByTaskId(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));
        return task.getSubtasks().stream()
                .map(s -> new SubtaskDto(s.getId(), s.getTitle(), s.getDescription(), s.isCompleted()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubtaskDto> getSubtasksByTaskIdWithPagination(Long taskId, int page, int size) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found with id: " + taskId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Subtask> subtasksPage = subtaskRepository.findAllByTaskId(taskId, pageable);

        return subtasksPage.map(s -> new SubtaskDto(s.getId(), s.getTitle(), s.getDescription(), s.isCompleted()));
    }

    @Override
    @Transactional
    public SubtaskDto createSubtask(Long taskId, SubtaskDto dto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Subtask title is required and cannot be blank");
        }

        Subtask subtask = new Subtask();
        subtask.setTitle(dto.getTitle());
        subtask.setDescription(dto.getDescription());
        subtask.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);
        subtask.setTask(task);

        Subtask saved = subtaskRepository.save(subtask);

        // Update parent task status after adding new subtask
        updateParentTaskStatus(taskId);

        return new SubtaskDto(saved.getId(), saved.getTitle(), saved.getDescription(), saved.isCompleted());
    }

    @Override
    @Transactional
    public SubtaskDto updateSubtask(Long taskId, Long subtaskId, SubtaskDto dto) {
        Subtask subtask = subtaskRepository.findByIdAndTaskId(subtaskId, taskId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subtask not found with id: " + subtaskId + " for task: " + taskId));

        // Track changes
        boolean titleChanged = !subtask.getTitle().equals(dto.getTitle());
        boolean completionChanged = subtask.isCompleted() != (dto.getCompleted() != null ? dto.getCompleted() : false);

        // Full update (PUT semantics)
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Subtask title is required and cannot be blank");
        }

        subtask.setTitle(dto.getTitle());
        subtask.setDescription(dto.getDescription());
        subtask.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);

        Subtask updated = subtaskRepository.save(subtask);

        // Log changes
        if (titleChanged) {
            logSubtaskHistory(taskId, subtaskId, "SUBTASK_TITLE", null, dto.getTitle());
        }
        if (completionChanged) {
            logSubtaskHistory(taskId, subtaskId, "SUBTASK_COMPLETION",
                    String.valueOf(!updated.isCompleted()), String.valueOf(updated.isCompleted()));
        }

        // Check and auto-update parent task completion
        updateParentTaskStatus(taskId);

        return new SubtaskDto(updated.getId(), updated.getTitle(), updated.getDescription(), updated.isCompleted());
    }

    @Override
    @Transactional
    public SubtaskDto patchSubtask(Long taskId, Long subtaskId, SubtaskDto dto) {
        Subtask subtask = subtaskRepository.findByIdAndTaskId(subtaskId, taskId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subtask not found with id: " + subtaskId + " for task: " + taskId));

        // Partial update (PATCH semantics) - only update non-null fields
        if (dto.getTitle() != null) {
            if (dto.getTitle().isBlank()) {
                throw new IllegalArgumentException("Subtask title cannot be blank");
            }
            if (!subtask.getTitle().equals(dto.getTitle())) {
                logSubtaskHistory(taskId, subtaskId, "SUBTASK_TITLE", subtask.getTitle(), dto.getTitle());
                subtask.setTitle(dto.getTitle());
            }
        }

        if (dto.getDescription() != null) {
            subtask.setDescription(dto.getDescription());
        }

        if (dto.getCompleted() != null) {
            if (subtask.isCompleted() != dto.getCompleted()) {
                logSubtaskHistory(taskId, subtaskId, "SUBTASK_COMPLETION",
                        String.valueOf(subtask.isCompleted()), String.valueOf(dto.getCompleted()));
                subtask.setCompleted(dto.getCompleted());
            }
        }

        Subtask updated = subtaskRepository.save(subtask);

        // Check and auto-update parent task completion
        updateParentTaskStatus(taskId);

        return new SubtaskDto(updated.getId(), updated.getTitle(), updated.getDescription(), updated.isCompleted());
    }

    @Override
    @Transactional
    public void deleteSubtask(Long taskId, Long subtaskId) {
        Subtask subtask = subtaskRepository.findByIdAndTaskId(subtaskId, taskId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subtask not found with id: " + subtaskId + " for task: " + taskId));

        logSubtaskHistory(taskId, subtaskId, "SUBTASK_DELETED", subtask.getTitle(), "DELETED");
        subtaskRepository.delete(subtask);

        // Re-evaluate parent task status after deletion
        updateParentTaskStatus(taskId);
    }

    @Transactional
    private void updateParentTaskStatus(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        List<Subtask> subtasks = subtaskRepository.findAllByTaskId(taskId);
        Status oldStatus = task.getStatus();
        Status newStatus = oldStatus;

        if (subtasks.isEmpty()) {
            if (task.getStatus() != Status.COMPLETED) {
                newStatus = Status.PENDING;
            }
        } else if (subtasks.stream().allMatch(Subtask::isCompleted)) {
            newStatus = Status.COMPLETED;
        } else if (subtasks.stream().anyMatch(Subtask::isCompleted)) {
            newStatus = Status.IN_PROGRESS;
        } else {
            if (task.getStatus() == Status.COMPLETED) {
                newStatus = Status.IN_PROGRESS;
            }
        }

        if (oldStatus != newStatus) {
            task.setStatus(newStatus);
            taskRepository.save(task);

            // Log status change
            TaskHistory history = new TaskHistory();
            history.setTask(task);
            history.setFieldChanged("STATUS");
            history.setOldValue(oldStatus.toString());
            history.setNewValue(newStatus.toString());
            taskHistoryRepository.save(history);
        }
    }

    private void logSubtaskHistory(Long taskId, Long subtaskId, String field, String oldValue, String newValue) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + taskId));

        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setFieldChanged(field + " [Subtask #" + subtaskId + "]");
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        taskHistoryRepository.save(history);
    }

    @Override
    @Transactional(readOnly = true)
    public SubtaskDto getSubtaskById(Long taskId, Long subtaskId) {
        Subtask subtask = subtaskRepository.findByIdAndTaskId(subtaskId, taskId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Subtask not found with id: " + subtaskId + " for task: " + taskId));
        return new SubtaskDto(subtask.getId(), subtask.getTitle(), subtask.getDescription(), subtask.isCompleted());
    }
}