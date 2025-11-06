package com.example.taskmanager.repository;

import com.example.taskmanager.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    // Find all attachments by task ID
    List<Attachment> findByTaskIdOrderByUploadedAtDesc(Long taskId);
}