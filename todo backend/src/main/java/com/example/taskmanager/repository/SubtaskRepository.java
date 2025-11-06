package com.example.taskmanager.repository;

import com.example.taskmanager.model.Subtask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    // Find all subtasks by task ID
    List<Subtask> findAllByTaskId(Long taskId);

    // Find all subtasks by task ID with pagination
    Page<Subtask> findAllByTaskId(Long taskId, Pageable pageable);

    // Find subtask by ID and task ID
    @Query("SELECT s FROM Subtask s WHERE s.id = :subtaskId AND s.task.id = :taskId")
    Optional<Subtask> findByIdAndTaskId(@Param("subtaskId") Long subtaskId, @Param("taskId") Long taskId);
}