# Task Manager API v2.0 - Complete Feature Set

## 🚀 New Features Implemented

### ✅ All Requested Features

1. **Pagination & Filtering** - Advanced query support for tasks and subtasks
2. **Search** - Full-text search in titles and descriptions
3. **Soft Delete** - Archive tasks instead of permanent deletion
4. **Sorting & Advanced Filtering** - Dynamic sorting by any field
5. **Automatic Overdue Updates** - Scheduled job marks overdue tasks as DELAYED
6. **Audit Trail** - Complete history tracking for all changes
7. **Comments System** - Add notes and comments to tasks
8. **File Attachments** - Upload and manage files for tasks
9. **Tagging System** - Organize tasks with custom tags
10. **Caching & Indexing** - Performance optimizations

---

## 📋 API Endpoints

### Task Management

#### Get Tasks (Paginated)
```http
GET /api/tasks?page=0&size=10&sortBy=dueDate&sortDirection=desc
```

**Query Parameters:**
- `page` - Page number (default: 0)
- `size` - Page size (default: 10)
- `sortBy` - Sort field: id, title, status, priority, dueDate (default: id)
- `sortDirection` - asc or desc (default: desc)
- `status` - Filter by status: PENDING, IN_PROGRESS, COMPLETED, DELAYED
- `priority` - Filter by priority: LOW, MEDIUM, HIGH
- `dueDate` - Filter by due date (format: YYYY-MM-DD)
- `tag` - Filter by tag

**Example:**
```bash
curl "http://localhost:8080/api/tasks?page=0&size=5&status=IN_PROGRESS&priority=HIGH"
```

#### Search Tasks
```http
GET /api/tasks/search?query=meeting&page=0&size=10
```

#### Get All Tasks (Non-Paginated)
```http
GET /api/tasks/all
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete Project",
  "description": "Finish the task manager implementation",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-12-31",
  "tags": ["backend", "urgent"]
}
```

#### Update Task
```http
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  ...
}
```

#### Archive Task (Soft Delete)
```http
DELETE /api/tasks/{id}
```

#### Restore Archived Task
```http
POST /api/tasks/{id}/restore
```

#### Permanently Delete Task
```http
DELETE /api/tasks/{id}/permanent
```

---

### Subtask Management

#### Get Subtasks (Paginated)
```http
GET /api/tasks/{taskId}/subtasks?page=0&size=10
```

#### Get All Subtasks (Non-Paginated)
```http
GET /api/tasks/{taskId}/subtasks/all
```

#### Get Single Subtask
```http
GET /api/tasks/{taskId}/subtasks/{subtaskId}
```

#### Create Subtask
```http
POST /api/tasks/{taskId}/subtasks
Content-Type: application/json

{
  "title": "Research phase",
  "description": "Gather requirements",
  "completed": false
}
```

#### Update Subtask (Full)
```http
PUT /api/tasks/{taskId}/subtasks/{subtaskId}
Content-Type: application/json

{
  "title": "Updated subtask",
  "description": "New description",
  "completed": true
}
```

#### Partial Update Subtask
```http
PATCH /api/tasks/{taskId}/subtasks/{subtaskId}
Content-Type: application/json

{
  "completed": true
}
```

#### Delete Subtask
```http
DELETE /api/tasks/{taskId}/subtasks/{subtaskId}
```

---

### Comments

#### Get Comments
```http
GET /api/tasks/{taskId}/comments
```

#### Add Comment
```http
POST /api/tasks/{taskId}/comments
Content-Type: application/json

{
  "message": "This needs to be done by tomorrow"
}
```

#### Delete Comment
```http
DELETE /api/tasks/comments/{commentId}
```

---

### Attachments

#### Get Attachments
```http
GET /api/tasks/{taskId}/attachments
```

#### Upload Attachment
```http
POST /api/tasks/{taskId}/attachments
Content-Type: multipart/form-data

file: [binary file data]
```

**Example with curl:**
```bash
curl -X POST -F "file=@document.pdf" \
  http://localhost:8080/api/tasks/1/attachments
```

#### Delete Attachment
```http
DELETE /api/tasks/attachments/{attachmentId}
```

---

### Task History (Audit Trail)

#### Get Task History
```http
GET /api/tasks/{taskId}/history
```

**Response:**
```json
[
  {
    "id": 1,
    "fieldChanged": "STATUS",
    "oldValue": "PENDING",
    "newValue": "IN_PROGRESS",
    "changedAt": "2025-11-06T10:30:00"
  },
  {
    "id": 2,
    "fieldChanged": "SUBTASK_COMPLETION [Subtask #5]",
    "oldValue": "false",
    "newValue": "true",
    "changedAt": "2025-11-06T11:15:00"
  }
]
```

---

## 🔄 Automatic Features

### Parent Task Status Management
When subtasks are modified, the parent task status updates automatically:

- **All subtasks completed** → Task status = COMPLETED
- **Some subtasks completed** → Task status = IN_PROGRESS
- **No subtasks completed** → Task status = PENDING
- **Task with no subtasks** → Status remains as set

### Scheduled Overdue Check
Every hour, a background job runs to check for overdue tasks:

```java
@Scheduled(cron = "0 0 * * * *")  // Every hour
public void updateOverdueTasks()
```

- Tasks past `dueDate` with status ≠ COMPLETED → Set to DELAYED
- Change is logged in task history

---

## 🗄️ Database Schema

### Entities

1. **Task**
    - id, title, description, status, dueDate, priority
    - archived (boolean)
    - tags (Set<String>)

2. **Subtask**
    - id, title, description, completed
    - task_id (FK to Task)

3. **Comment**
    - id, message, createdAt
    - task_id (FK to Task)

4. **Attachment**
    - id, fileName, url, fileSize, contentType, uploadedAt
    - task_id (FK to Task)

5. **TaskHistory**
    - id, fieldChanged, oldValue, newValue, changedAt
    - task_id (FK to Task)

### Indexes
Optimized queries with indexes on:
- `status`, `priority`, `dueDate` (Task)
- `archived` (Task)
- `task_id`, `changedAt` (TaskHistory)

---

## 🚀 Running the Application

### Prerequisites
- Java 17+
- Maven 3.6+

### Development Mode (H2 Database)
```bash
mvn spring-boot:run
```

Access H2 Console: http://localhost:8080/h2-console
- URL: `jdbc:h2:mem:taskdb`
- Username: `sa`
- Password: (empty)

### Production Mode (PostgreSQL)
Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskmanager
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

---

## 📁 File Upload Configuration

Files are stored in the `uploads/` directory by default.

Configure in `application.properties`:
```properties
file.upload-dir=uploads
spring.servlet.multipart.max-file-size=10MB
```

Access uploaded files: `http://localhost:8080/uploads/filename.ext`

---

## 🎯 Usage Examples

### Example 1: Create Task with Tags
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement User Authentication",
    "description": "Add JWT-based authentication",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2025-12-15",
    "tags": ["security", "backend", "urgent"]
  }'
```

### Example 2: Search and Filter
```bash
# Search for tasks containing "authentication"
curl "http://localhost:8080/api/tasks/search?query=authentication&page=0&size=10"

# Filter by tag and priority
curl "http://localhost:8080/api/tasks?tag=backend&priority=HIGH&sortBy=dueDate&sortDirection=asc"
```

### Example 3: Complete Workflow
```bash
# 1. Create task
TASK_ID=$(curl -s -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Build Feature","status":"PENDING","priority":"MEDIUM"}' \
  | jq -r '.id')

# 2. Add subtasks
curl -X POST http://localhost:8080/api/tasks/$TASK_ID/subtasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Design","completed":false}'

curl -X POST http://localhost:8080/api/tasks/$TASK_ID/subtasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Implementation","completed":false}'

# 3. Mark first subtask complete
curl -X PATCH http://localhost:8080/api/tasks/$TASK_ID/subtasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# 4. Add comment
curl -X POST http://localhost:8080/api/tasks/$TASK_ID/comments \
  -H "Content-Type: application/json" \
  -d '{"message":"Design phase completed successfully"}'

# 5. Upload attachment
curl -X POST -F "file=@design.pdf" \
  http://localhost:8080/api/tasks/$TASK_ID/attachments

# 6. View history
curl http://localhost:8080/api/tasks/$TASK_ID/history
```

---

## 🔍 Audit Trail Tracking

The system automatically logs:
- Task creation
- Status changes
- Priority changes
- Title changes
- Due date changes
- Subtask completion changes
- Task archival/restoration

Example history entry:
```json
{
  "fieldChanged": "SUBTASK_COMPLETION [Subtask #3]",
  "oldValue": "false",
  "newValue": "true",
  "changedAt": "2025-11-06T14:22:10"
}
```

---

## 📊 Response Pagination Format

```json
{
  "content": [ /* array of items */ ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "sorted": true },
    "offset": 0
  },
  "totalPages": 5,
  "totalElements": 47,
  "last": false,
  "first": true,
  "numberOfElements": 10
}
```

---

## 🛠️ Technology Stack

- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** H2 (dev) / PostgreSQL (prod)
- **ORM:** JPA/Hibernate
- **Validation:** Jakarta Validation
- **Caching:** Spring Cache (Simple)
- **Scheduling:** Spring Scheduling
- **Build Tool:** Maven

---

## 📝 Notes

- All write operations are transactional
- Archived tasks are excluded from default queries
- Cache is automatically invalidated on task modifications
- File uploads are limited to 10MB by default
- Overdue check runs hourly (configurable)

---

## 🎉 Ready for Frontend Integration

This backend is fully prepared for integration with modern frontends (React, Vue, Angular):

- RESTful API design
- Comprehensive pagination support
- Flexible filtering and sorting
- File upload handling
- Real-time status updates
- Complete audit trail
- Soft delete with restoration

**Base URL:** `http://localhost:8080/api`

**Headers Required:**
```
Content-Type: application/json
```

For file uploads:
```
Content-Type: multipart/form-data
```