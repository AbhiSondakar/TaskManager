# Migration Guide: v1.0 → v2.0

## Overview of Changes

This guide helps you understand what has changed from the original implementation to v2.0 with all the new features.

---

## ⚠️ Breaking Changes

### 1. Task Endpoints Modified

#### Old (v1.0):
```http
GET /api/tasks  → Returns List<TaskDto>
```

#### New (v2.0):
```http
GET /api/tasks  → Returns Page<TaskDto> (paginated)
GET /api/tasks/all  → Returns List<TaskDto> (non-paginated, for backward compatibility)
```

**Migration:**
- If you need the old behavior, use `/api/tasks/all`
- Otherwise, adapt to use pagination with `/api/tasks?page=0&size=100`

---

### 2. Subtask Endpoints Modified

#### Old (v1.0):
```http
GET /api/tasks/{taskId}/subtasks  → Returns List<SubtaskDto>
```

#### New (v2.0):
```http
GET /api/tasks/{taskId}/subtasks  → Returns Page<SubtaskDto> (paginated)
GET /api/tasks/{taskId}/subtasks/all  → Returns List<SubtaskDto> (non-paginated)
```

**Migration:** Same as tasks - use `/all` endpoint if you need non-paginated results.

---

### 3. Delete Behavior Changed

#### Old (v1.0):
```http
DELETE /api/tasks/{id}  → Permanently deletes task
```

#### New (v2.0):
```http
DELETE /api/tasks/{id}  → Soft delete (archives task)
DELETE /api/tasks/{id}/permanent  → Permanently deletes task
```

**Migration:**
- Default DELETE now archives instead of permanently removing
- Use `/permanent` endpoint if you need hard delete
- Use `POST /api/tasks/{id}/restore` to restore archived tasks

---

### 4. New Status Type: DELAYED

#### Old Status Enum:
```java
public enum Status {
    PENDING,
    IN_PROGRESS,
    COMPLETED
}
```

#### New Status Enum:
```java
public enum Status {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    DELAYED  // New!
}
```

**Migration:**
- Update any frontend code that handles status values
- Tasks past their due date will automatically get DELAYED status
- Handle DELAYED in UI filters and displays

---

## 🆕 New Features (Non-Breaking)

### 1. Pagination Support

All GET endpoints now support pagination:

```http
GET /api/tasks?page=0&size=10
GET /api/tasks/{taskId}/subtasks?page=0&size=5
```

**Response Format:**
```json
{
  "content": [...],
  "totalPages": 5,
  "totalElements": 47,
  "pageNumber": 0,
  "pageSize": 10,
  "first": true,
  "last": false
}
```

---

### 2. Filtering & Sorting

New query parameters:

```http
GET /api/tasks?status=PENDING&priority=HIGH&sortBy=dueDate&sortDirection=desc
```

**Supported Filters:**
- `status` - Filter by Status enum
- `priority` - Filter by Priority enum
- `dueDate` - Filter by specific date
- `tag` - Filter by tag
- `sortBy` - Sort field (id, title, status, priority, dueDate)
- `sortDirection` - asc or desc

---

### 3. Search Functionality

```http
GET /api/tasks/search?query=meeting&page=0&size=10
```

Searches in:
- Task title
- Task description
- Case-insensitive

---

### 4. Tagging System

Tasks now support tags:

```json
{
  "title": "Build Feature",
  "tags": ["backend", "api", "urgent"]
}
```

Filter by tag:
```http
GET /api/tasks?tag=urgent
```

---

### 5. Comments System

New endpoints:

```http
POST /api/tasks/{taskId}/comments
GET /api/tasks/{taskId}/comments
DELETE /api/tasks/comments/{commentId}
```

---

### 6. File Attachments

New endpoints:

```http
POST /api/tasks/{taskId}/attachments  (multipart/form-data)
GET /api/tasks/{taskId}/attachments
DELETE /api/tasks/attachments/{attachmentId}
```

Files stored in `uploads/` directory.

---

### 7. Task History (Audit Trail)

New endpoint:

```http
GET /api/tasks/{taskId}/history
```

Tracks all changes:
- Task creation
- Status changes
- Title/priority/due date changes
- Subtask completions
- Archive/restore actions

---

### 8. Automatic Overdue Updates

Scheduled job runs every hour:
- Checks all tasks with `dueDate < today`
- Updates status to DELAYED if not COMPLETED
- Logs change in history

---

### 9. Caching

Task list is now cached:
```java
@Cacheable(value = "tasks", key = "'all'")
public List<TaskDto> getAllTasks()
```

Cache invalidated on:
- Create task
- Update task
- Delete/archive task

---

## 📊 Database Schema Changes

### New Fields Added to Task:

```sql
ALTER TABLE task ADD COLUMN archived BOOLEAN DEFAULT FALSE;
```

### New Table: task_tags

```sql
CREATE TABLE task_tags (
    task_id BIGINT,
    tag VARCHAR(255),
    FOREIGN KEY (task_id) REFERENCES task(id)
);
```

### New Tables:

1. **comment**
```sql
CREATE TABLE comment (
    id BIGINT PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP,
    task_id BIGINT,
    FOREIGN KEY (task_id) REFERENCES task(id)
);
```

2. **attachment**
```sql
CREATE TABLE attachment (
    id BIGINT PRIMARY KEY,
    file_name VARCHAR(255),
    url VARCHAR(500),
    file_size BIGINT,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP,
    task_id BIGINT,
    FOREIGN KEY (task_id) REFERENCES task(id)
);
```

3. **task_history**
```sql
CREATE TABLE task_history (
    id BIGINT PRIMARY KEY,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP,
    task_id BIGINT,
    FOREIGN KEY (task_id) REFERENCES task(id)
);
```

### New Indexes:

```sql
CREATE INDEX idx_status ON task(status);
CREATE INDEX idx_priority ON task(priority);
CREATE INDEX idx_due_date ON task(due_date);
CREATE INDEX idx_archived ON task(archived);
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_history_changed_at ON task_history(changed_at);
```

---

## 🔄 Automatic Migration

If using `spring.jpa.hibernate.ddl-auto=update`:
- All new tables/columns will be created automatically
- Existing data will be preserved
- New indexes will be added

For production with manual migrations:
- Use provided SQL scripts above
- Set `spring.jpa.hibernate.ddl-auto=validate`

---

## 📝 Code Changes Summary

### New Classes Created:

**Models:**
- `Comment.java`
- `Attachment.java`
- `TaskHistory.java`

**DTOs:**
- `CommentDto.java`
- `AttachmentDto.java`
- `TaskHistoryDto.java`

**Repositories:**
- `CommentRepository.java`
- `AttachmentRepository.java`
- `TaskHistoryRepository.java`

**Services:**
- `CommentService.java`
- `AttachmentService.java`
- `TaskHistoryService.java`
- `ScheduledTaskService.java`

**Controllers:**
- `CommentController.java`
- `AttachmentController.java`
- `TaskHistoryController.java`

**Configuration:**
- `CacheConfig.java`
- `SchedulingConfig.java`
- `FileUploadConfig.java`

### Modified Classes:

**Models:**
- `Task.java` - Added: archived, tags, relationships
- `Status.java` - Added: DELAYED

**Services:**
- `TaskService.java` - Added: pagination, filtering, history tracking, cache
- `SubtaskServiceImpl.java` - Added: pagination, history logging

**Controllers:**
- `TaskController.java` - Added: pagination, search, filter params
- `SubtaskController.java` - Added: pagination support

**Repositories:**
- `TaskRepository.java` - Added: many filter methods, search
- `SubtaskRepository.java` - Added: pagination support

---

## 🧪 Testing the Migration

### 1. Test Backward Compatibility

```bash
# Old endpoint still works (now at /all)
curl http://localhost:8080/api/tasks/all
```

### 2. Test New Pagination

```bash
curl "http://localhost:8080/api/tasks?page=0&size=5"
```

### 3. Test Soft Delete

```bash
# Create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","status":"PENDING","priority":"LOW"}'

# Archive it (soft delete)
curl -X DELETE http://localhost:8080/api/tasks/1

# Verify it's not in list
curl http://localhost:8080/api/tasks/all

# Restore it
curl -X POST http://localhost:8080/api/tasks/1/restore

# Verify it's back
curl http://localhost:8080/api/tasks/all
```

### 4. Test History Tracking

```bash
# Create and modify task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","status":"PENDING","priority":"HIGH"}'

# Update it
curl -X PUT http://localhost:8080/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","status":"IN_PROGRESS","priority":"MEDIUM"}'

# Check history
curl http://localhost:8080/api/tasks/1/history
```

### 5. Test New Features

```bash
# Add comment
curl -X POST http://localhost:8080/api/tasks/1/comments \
  -H "Content-Type: application/json" \
  -d '{"message":"Test comment"}'

# Upload file
curl -X POST -F "file=@test.txt" \
  http://localhost:8080/api/tasks/1/attachments

# Search
curl "http://localhost:8080/api/tasks/search?query=test"

# Filter by tag
curl "http://localhost:8080/api/tasks?tag=urgent"
```

---

## 🚀 Deployment Checklist

- [ ] Update frontend to handle paginated responses
- [ ] Update frontend to handle DELAYED status
- [ ] Test DELETE endpoints (now soft delete by default)
- [ ] Create `uploads/` directory on server
- [ ] Set file permissions for uploads directory
- [ ] Update error handling for new validation rules
- [ ] Test scheduled job behavior
- [ ] Configure cache settings for production
- [ ] Update API documentation
- [ ] Test all new endpoints
- [ ] Verify existing functionality still works

---

## 📞 Support

If you encounter issues during migration:

1. Check the error logs
2. Review the API_EXAMPLES.md for correct request formats
3. Ensure all new dependencies are installed (check pom.xml)
4. Verify database schema updates completed successfully
5. Test with H2 console to inspect data

---

## 🎉 Benefits of Upgrading

- **Better Performance**: Pagination reduces data transfer
- **Richer Features**: Comments, attachments, tags
- **Better UX**: Search, filters, soft delete
- **Audit Trail**: Complete history tracking
- **Automation**: Automatic overdue detection
- **Production Ready**: Caching, indexing, optimizations

---

## Version Summary

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Basic CRUD | ✅ | ✅ |
| Subtasks | ✅ | ✅ |
| Pagination | ❌ | ✅ |
| Search | ❌ | ✅ |
| Filters | ❌ | ✅ |
| Soft Delete | ❌ | ✅ |
| Comments | ❌ | ✅ |
| Attachments | ❌ | ✅ |
| History | ❌ | ✅ |
| Tags | ❌ | ✅ |
| Auto-Overdue | ❌ | ✅ |
| Caching | ❌ | ✅ |
| Indexes | ❌ | ✅ |