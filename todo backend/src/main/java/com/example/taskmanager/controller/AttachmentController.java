package com.example.taskmanager.controller;

import com.example.taskmanager.dto.AttachmentDto;
import com.example.taskmanager.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    /**
     * Get all attachments for a specific task
     */
    @GetMapping("/{taskId}/attachments")
    public ResponseEntity<List<AttachmentDto>> getAttachments(@PathVariable Long taskId) {
        List<AttachmentDto> attachments = attachmentService.getAttachmentsByTaskId(taskId);
        return ResponseEntity.ok(attachments);
    }

    /**
     * Upload an attachment to a task
     */
    @PostMapping("/{taskId}/attachments")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file) throws IOException {

        AttachmentDto attachment = attachmentService.uploadAttachment(taskId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
    }

    /**
     * Delete an attachment
     */
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) throws IOException {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }
}