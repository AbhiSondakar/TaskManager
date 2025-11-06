package com.example.taskmanager.service;

import com.example.taskmanager.dto.SubtaskDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SubtaskService {
    List<SubtaskDto> getSubtasksByTaskId(Long taskId);
    Page<SubtaskDto> getSubtasksByTaskIdWithPagination(Long taskId, int page, int size);
    SubtaskDto createSubtask(Long taskId, SubtaskDto subtaskDto);
    SubtaskDto updateSubtask(Long taskId, Long subtaskId, SubtaskDto subtaskDto);
    SubtaskDto patchSubtask(Long taskId, Long subtaskId, SubtaskDto subtaskDto);
    void deleteSubtask(Long taskId, Long subtaskId);
    SubtaskDto getSubtaskById(Long taskId, Long subtaskId);
}