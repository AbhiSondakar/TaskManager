package com.example.taskmanager.service;

import com.example.taskmanager.model.Status;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.TaskHistory;
import com.example.taskmanager.repository.TaskHistoryRepository;
import com.example.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final TaskRepository taskRepository;
    private final TaskHistoryRepository taskHistoryRepository;

    /**
     * Runs every hour to check for overdue tasks
     * Cron: 0 0 * * * * (at the start of every hour)
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void updateOverdueTasks() {
        log.info("Running scheduled job to update overdue tasks");

        LocalDate today = LocalDate.now();
        List<Task> overdueTasks = taskRepository.findOverdueTasks(today);

        int updatedCount = 0;
        for (Task task : overdueTasks) {
            if (task.getStatus() != Status.DELAYED) {
                Status oldStatus = task.getStatus();
                task.setStatus(Status.DELAYED);
                taskRepository.save(task);

                // Log the change
                TaskHistory history = new TaskHistory();
                history.setTask(task);
                history.setFieldChanged("STATUS");
                history.setOldValue(oldStatus.toString());
                history.setNewValue(Status.DELAYED.toString());
                taskHistoryRepository.save(history);

                updatedCount++;
            }
        }

        log.info("Updated {} tasks to DELAYED status", updatedCount);
    }

    /**
     * Alternative: Run every day at midnight
     * Uncomment this and comment the hourly one if you prefer daily checks
     */
    // @Scheduled(cron = "0 0 0 * * *")
    // @Transactional
    // public void updateOverdueTasksDaily() {
    //     updateOverdueTasks();
    // }
}