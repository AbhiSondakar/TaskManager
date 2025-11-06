package com.example.taskmanager.repository;

import com.example.taskmanager.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Find all comments by task ID, ordered by creation time
    List<Comment> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}