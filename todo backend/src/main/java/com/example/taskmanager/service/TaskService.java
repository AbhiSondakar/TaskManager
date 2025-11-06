package com.example.taskmanager.service;

import com.example.taskmanager.dto.SubtaskDto;
import com.example.taskmanager.dto.TaskDto;
import com.example.taskmanager.model.*;
import com.example.taskmanager.repository.TaskHistoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "tasks", key = "'all'")
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAllByOrderByIdDesc().stream()
                .filter(task -> !task.isArchived())
                .map(this::convertToTaskDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> getTasksWithPagination(
            int page, int size,
            String sortBy, String sortDirection,
            Status status, Priority priority,
            LocalDate dueDate, String tag) {

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy != null ? sortBy : "id"));

        Page<Task> tasksPage;

        // Apply filters
        if (tag != null && !tag.isBlank()) {
            tasksPage = taskRepository.findByTag(tag, pageable);
        } else if (status != null || priority != null || dueDate != null) {
            tasksPage = taskRepository.findByFilters(status, priority, dueDate, pageable);
        } else {
            tasksPage = taskRepository.findByArchivedFalse(pageable);
        }

        return tasksPage.map(this::convertToTaskDto);
    }

    @Transactional(readOnly = true)
    public Page<TaskDto> searchTasks(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Task> tasksPage = taskRepository.searchTasks(query, pageable);
        return tasksPage.map(this::convertToTaskDto);
    }

    @Transactional
    @CacheEvict(value = "tasks", allEntries = true)
    public TaskDto createTask(TaskDto taskDto) {
        Task task = convertToTaskEntity(taskDto);
        Task savedTask = taskRepository.save(task);

        // Log creation in history
        logTaskHistory(savedTask, "CREATED", null, "Task created");

        return convertToTaskDto(savedTask);
    }

    @Transactional
    @CacheEvict(value = "tasks", allEntries = true)
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));

        // Track changes for history
        trackAndLogChanges(task, taskDto);

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setDueDate(taskDto.getDueDate());
        task.setPriority(taskDto.getPriority());

        if (taskDto.getTags() != null) {
            task.getTags().clear();
            task.getTags().addAll(taskDto.getTags());
        }

        // Update subtasks if provided
        if (taskDto.getSubtasks() != null) {
            updateTaskSubtasks(task, taskDto.getSubtasks());
        }

        Task updatedTask = taskRepository.save(task);
        return convertToTaskDto(updatedTask);
    }

    @Transactional
    @CacheEvict(value = "tasks", allEntries = true)
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));

        // Soft delete - mark as archived
        task.setArchived(true);
        taskRepository.save(task);

        // Log the archival
        logTaskHistory(task, "ARCHIVED", "false", "true");
    }

    @Transactional
    @CacheEvict(value = "tasks", allEntries = true)
    public void permanentlyDeleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "tasks", allEntries = true)
    public TaskDto restoreTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));

        task.setArchived(false);
        Task restoredTask = taskRepository.save(task);

        logTaskHistory(task, "RESTORED", "true", "false");

        return convertToTaskDto(restoredTask);
    }

    private void trackAndLogChanges(Task existingTask, TaskDto newData) {
        if (!existingTask.getTitle().equals(newData.getTitle())) {
            logTaskHistory(existingTask, "TITLE", existingTask.getTitle(), newData.getTitle());
        }

        if (existingTask.getStatus() != newData.getStatus()) {
            logTaskHistory(existingTask, "STATUS", existingTask.getStatus().toString(), newData.getStatus().toString());
        }

        if (existingTask.getPriority() != newData.getPriority()) {
            logTaskHistory(existingTask, "PRIORITY", existingTask.getPriority().toString(), newData.getPriority().toString());
        }

        if ((existingTask.getDueDate() == null && newData.getDueDate() != null) ||
                (existingTask.getDueDate() != null && !existingTask.getDueDate().equals(newData.getDueDate()))) {
            logTaskHistory(existingTask, "DUE_DATE",
                    existingTask.getDueDate() != null ? existingTask.getDueDate().toString() : "null",
                    newData.getDueDate() != null ? newData.getDueDate().toString() : "null");
        }
    }

    private void logTaskHistory(Task task, String field, String oldValue, String newValue) {
        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setFieldChanged(field);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        taskHistoryRepository.save(history);
    }

    private void updateTaskSubtasks(Task task, List<SubtaskDto> subtaskDtos) {
        List<Subtask> existingSubtasks = task.getSubtasks();

        Map<Long, Subtask> existingSubtaskMap = existingSubtasks.stream()
                .filter(s -> s.getId() != null)
                .collect(Collectors.toMap(Subtask::getId, subtask -> subtask));

        List<Subtask> updatedSubtasks = new ArrayList<>();

        for (SubtaskDto subtaskDto : subtaskDtos) {
            if (subtaskDto.getId() != null && existingSubtaskMap.containsKey(subtaskDto.getId())) {
                Subtask existingSubtask = existingSubtaskMap.get(subtaskDto.getId());
                existingSubtask.setTitle(subtaskDto.getTitle());
                existingSubtask.setDescription(subtaskDto.getDescription());
                existingSubtask.setCompleted(subtaskDto.getCompleted() != null ? subtaskDto.getCompleted() : false);
                updatedSubtasks.add(existingSubtask);
            } else {
                Subtask newSubtask = convertToSubtaskEntity(subtaskDto);
                newSubtask.setTask(task);
                updatedSubtasks.add(newSubtask);
            }
        }

        existingSubtasks.clear();
        existingSubtasks.addAll(updatedSubtasks);
    }

    private TaskDto convertToTaskDto(Task task) {
        TaskDto taskDto = new TaskDto();
        taskDto.setId(task.getId());
        taskDto.setTitle(task.getTitle());
        taskDto.setDescription(task.getDescription());
        taskDto.setStatus(task.getStatus());
        taskDto.setDueDate(task.getDueDate());
        taskDto.setPriority(task.getPriority());
        taskDto.setArchived(task.isArchived());
        taskDto.setTags(task.getTags());

        if (task.getSubtasks() != null) {
            taskDto.setSubtasks(task.getSubtasks().stream()
                    .map(this::convertToSubtaskDto)
                    .collect(Collectors.toList()));
        }

        return taskDto;
    }

    private Task convertToTaskEntity(TaskDto taskDto) {
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setDueDate(taskDto.getDueDate());
        task.setPriority(taskDto.getPriority());
        task.setArchived(false);

        if (taskDto.getTags() != null) {
            task.getTags().addAll(taskDto.getTags());
        }

        if (taskDto.getSubtasks() != null) {
            List<Subtask> subtasks = taskDto.getSubtasks().stream()
                    .map(this::convertToSubtaskEntity)
                    .collect(Collectors.toList());
            task.setSubtasks(subtasks);
            subtasks.forEach(subtask -> subtask.setTask(task));
        }
        return task;
    }

    private SubtaskDto convertToSubtaskDto(Subtask subtask) {
        SubtaskDto subtaskDto = new SubtaskDto();
        subtaskDto.setId(subtask.getId());
        subtaskDto.setTitle(subtask.getTitle());
        subtaskDto.setDescription(subtask.getDescription());
        subtaskDto.setCompleted(subtask.isCompleted());
        return subtaskDto;
    }

    private Subtask convertToSubtaskEntity(SubtaskDto subtaskDto) {
        Subtask subtask = new Subtask();
        if (subtaskDto.getId() != null) {
            subtask.setId(subtaskDto.getId());
        }
        subtask.setTitle(subtaskDto.getTitle());
        subtask.setDescription(subtaskDto.getDescription());
        subtask.setCompleted(subtaskDto.getCompleted() != null ? subtaskDto.getCompleted() : false);
        return subtask;
    }
}