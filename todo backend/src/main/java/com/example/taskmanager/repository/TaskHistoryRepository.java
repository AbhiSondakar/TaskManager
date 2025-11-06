package com.example.taskmanager.repository;

import com.example.taskmanager.model.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    // Find all history entries for a task, ordered by time
    List<TaskHistory> findByTaskIdOrderByChangedAtDesc(Long taskId);
}