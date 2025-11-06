package com.example.taskmanager.repository;

import com.example.taskmanager.model.Priority;
import com.example.taskmanager.model.Status;
import com.example.taskmanager.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all non-archived tasks ordered by ID descending
    List<Task> findAllByOrderByIdDesc();

    // Pagination support for non-archived tasks
    Page<Task> findByArchivedFalse(Pageable pageable);

    // Filter by status (non-archived)
    Page<Task> findByStatusAndArchivedFalse(Status status, Pageable pageable);

    // Filter by priority (non-archived)
    Page<Task> findByPriorityAndArchivedFalse(Priority priority, Pageable pageable);

    // Filter by status and priority (non-archived)
    Page<Task> findByStatusAndPriorityAndArchivedFalse(Status status, Priority priority, Pageable pageable);

    // Filter by due date (non-archived)
    Page<Task> findByDueDateAndArchivedFalse(LocalDate dueDate, Pageable pageable);

    // Search by title or description (case-insensitive, non-archived)
    @Query("SELECT t FROM Task t WHERE t.archived = false AND " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Task> searchTasks(@Param("query") String query, Pageable pageable);

    // Find by tag (non-archived)
    @Query("SELECT DISTINCT t FROM Task t JOIN t.tags tag WHERE tag = :tag AND t.archived = false")
    Page<Task> findByTag(@Param("tag") String tag, Pageable pageable);

    // Find overdue tasks (due date passed, not completed, not archived)
    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status != 'COMPLETED' AND t.archived = false")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    // Complex filter query with all parameters
    @Query("SELECT t FROM Task t WHERE t.archived = false " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:dueDate IS NULL OR t.dueDate = :dueDate)")
    Page<Task> findByFilters(@Param("status") Status status,
                             @Param("priority") Priority priority,
                             @Param("dueDate") LocalDate dueDate,
                             Pageable pageable);
}