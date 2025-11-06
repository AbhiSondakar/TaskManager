# API Request & Response Examples

## Task Endpoints

### 1. Create a Task

**Request:**
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement Payment Gateway",
  "description": "Integrate Stripe payment processing",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-12-31",
  "tags": ["payment", "integration", "urgent"]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Implement Payment Gateway",
  "description": "Integrate Stripe payment processing",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2025-12-31",
  "archived": false,
  "tags": ["payment", "integration", "urgent"],
  "subtasks": [],
  "comments": null,
  "attachments": null
}
```

---

### 2. Get Tasks with Pagination and Filters

**Request:**
```http
GET /api/tasks?page=0&size=5&sortBy=priority&sortDirection=desc&status=PENDING
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 3,
      "title": "Fix Critical Bug",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": "2025-11-10",
      "archived": false,
      "tags": ["bugfix"],
      "subtasks": []
    },
    {
      "id": 5,
      "title": "Code Review",
      "status": "PENDING",
      "priority": "MEDIUM",
      "dueDate": "2025-11-12",
      "archived": false,
      "tags": ["review"],
      "subtasks": []
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 5,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalPages": 2,
  "totalElements": 8,
  "last": false,
  "first": true,
  "numberOfElements": 5
}
```

---

### 3. Search Tasks

**Request:**
```http
GET /api/tasks/search?query=payment&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Implement Payment Gateway",
      "description": "Integrate Stripe payment processing",
      "status": "PENDING",
      "priority": "HIGH",
      ...
    }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

---

### 4. Filter by Tag

**Request:**
```http
GET /api/tasks?tag=urgent&page=0&size=10
```

**Response:** Returns all tasks tagged with "urgent"

---

### 5. Archive Task (Soft Delete)

**Request:**
```http
DELETE /api/tasks/3
```

**Response (204 No Content)**

---

### 6. Restore Archived Task

**Request:**
```http
POST /api/tasks/3/restore
```

**Response (200 OK):**
```json
{
  "id": 3,
  "title": "Fix Critical Bug",
  "archived": false,
  ...
}
```

---

## Subtask Endpoints

### 7. Create Subtask

**Request:**
```http
POST /api/tasks/1/subtasks
Content-Type: application/json

{
  "title": "Research Stripe API",
  "description": "Review documentation and best practices",
  "completed": false
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Research Stripe API",
  "description": "Review documentation and best practices",
  "completed": false
}
```

---

### 8. Mark Subtask as Complete

**Request:**
```http
PATCH /api/tasks/1/subtasks/1
Content-Type: application/json

{
  "completed": true
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Research Stripe API",
  "description": "Review documentation and best practices",
  "completed": true
}
```

**Note:** Parent task status will automatically update to IN_PROGRESS

---

### 9. Get Subtasks (Paginated)

**Request:**
```http
GET /api/tasks/1/subtasks?page=0&size=5
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Research Stripe API",
      "completed": true
    },
    {
      "id": 2,
      "title": "Implement webhook handler",
      "completed": false
    }
  ],
  "totalElements": 2
}
```

---

## Comment Endpoints

### 10. Add Comment

**Request:**
```http
POST /api/tasks/1/comments
Content-Type: application/json

{
  "message": "Started working on this. Should be done by EOD."
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "message": "Started working on this. Should be done by EOD.",
  "createdAt": "2025-11-06T10:30:00"
}
```

---

### 11. Get All Comments

**Request:**
```http
GET /api/tasks/1/comments
```

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "message": "Updated requirements received from client",
    "createdAt": "2025-11-06T14:00:00"
  },
  {
    "id": 1,
    "message": "Started working on this. Should be done by EOD.",
    "createdAt": "2025-11-06T10:30:00"
  }
]
```

---

## Attachment Endpoints

### 12. Upload Attachment

**Request (using curl):**
```bash
curl -X POST \
  -F "file=@/path/to/document.pdf" \
  http://localhost:8080/api/tasks/1/attachments
```

**Request (using Postman):**
- Method: POST
- URL: `http://localhost:8080/api/tasks/1/attachments`
- Body: form-data
    - Key: `file` (type: File)
    - Value: [select file]

**Response (201 Created):**
```json
{
  "id": 1,
  "fileName": "document.pdf",
  "url": "/uploads/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.pdf",
  "fileSize": 245760,
  "contentType": "application/pdf",
  "uploadedAt": "2025-11-06T10:45:00"
}
```

---

### 13. Get All Attachments

**Request:**
```http
GET /api/tasks/1/attachments
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fileName": "document.pdf",
    "url": "/uploads/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.pdf",
    "fileSize": 245760,
    "contentType": "application/pdf",
    "uploadedAt": "2025-11-06T10:45:00"
  },
  {
    "id": 2,
    "fileName": "screenshot.png",
    "url": "/uploads/b2c3d4e5-f6g7-8901-h2i3-j4k5l6m7n8o9.png",
    "fileSize": 87234,
    "contentType": "image/png",
    "uploadedAt": "2025-11-06T11:20:00"
  }
]
```

---

### 14. Download Attachment

**Request:**
```http
GET /uploads/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8.pdf
```

**Response:** Binary file data

---

## Task History Endpoints

### 15. Get Task History

**Request:**
```http
GET /api/tasks/1/history
```

**Response (200 OK):**
```json
[
  {
    "id": 5,
    "fieldChanged": "STATUS",
    "oldValue": "PENDING",
    "newValue": "IN_PROGRESS",
    "changedAt": "2025-11-06T12:30:00"
  },
  {
    "id": 4,
    "fieldChanged": "SUBTASK_COMPLETION [Subtask #1]",
    "oldValue": "false",
    "newValue": "true",
    "changedAt": "2025-11-06T12:29:45"
  },
  {
    "id": 3,
    "fieldChanged": "PRIORITY",
    "oldValue": "MEDIUM",
    "newValue": "HIGH",
    "changedAt": "2025-11-06T11:15:00"
  },
  {
    "id": 2,
    "fieldChanged": "TITLE",
    "oldValue": "Implement Payment",
    "newValue": "Implement Payment Gateway",
    "changedAt": "2025-11-06T10:50:00"
  },
  {
    "id": 1,
    "fieldChanged": "CREATED",
    "oldValue": null,
    "newValue": "Task created",
    "changedAt": "2025-11-06T10:30:00"
  }
]
```

---

## Error Responses

### 404 Not Found

**Request:**
```http
GET /api/tasks/999
```

**Response:**
```json
{
  "timestamp": "2025-11-06T15:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Task not found with id: 999"
}
```

---

### 400 Bad Request (Validation Error)

**Request:**
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "",
  "status": "INVALID_STATUS"
}
```

**Response:**
```json
{
  "timestamp": "2025-11-06T15:32:00",
  "status": 400,
  "error": "Validation Failed",
  "fieldErrors": {
    "title": "Title is mandatory",
    "status": "Status is mandatory",
    "priority": "Priority is mandatory"
  }
}
```

---

### 400 Bad Request (Business Logic Error)

**Request:**
```http
POST /api/tasks/1/subtasks
Content-Type: application/json

{
  "title": "   ",
  "completed": false
}
```

**Response:**
```json
{
  "timestamp": "2025-11-06T15:35:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Subtask title is required and cannot be blank"
}
```

---

## Testing Workflow

### Complete Task Lifecycle

```bash
# 1. Create Task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build REST API",
    "description": "Create endpoints for user management",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2025-12-01",
    "tags": ["api", "backend"]
  }'

# Response: {"id": 1, ...}

# 2. Add first subtask
curl -X POST http://localhost:8080/api/tasks/1/subtasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Design database schema", "completed": false}'

# 3. Add second subtask
curl -X POST http://localhost:8080/api/tasks/1/subtasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Implement endpoints", "completed": false}'

# 4. Complete first subtask - Task auto-updates to IN_PROGRESS
curl -X PATCH http://localhost:8080/api/tasks/1/subtasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 5. Add comment
curl -X POST http://localhost:8080/api/tasks/1/comments \
  -H "Content-Type: application/json" \
  -d '{"message": "Database schema approved by team"}'

# 6. Upload attachment
curl -X POST -F "file=@schema.pdf" \
  http://localhost:8080/api/tasks/1/attachments

# 7. Complete second subtask - Task auto-updates to COMPLETED
curl -X PATCH http://localhost:8080/api/tasks/1/subtasks/2 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 8. View complete history
curl http://localhost:8080/api/tasks/1/history

# 9. Search for the task
curl "http://localhost:8080/api/tasks/search?query=REST"

# 10. Filter by tag
curl "http://localhost:8080/api/tasks?tag=backend"
```

---

## Postman Collection Structure

```
Task Manager API v2.0
├── Tasks
│   ├── Create Task
│   ├── Get Tasks (Paginated)
│   ├── Search Tasks
│   ├── Update Task
│   ├── Archive Task
│   ├── Restore Task
│   └── Get Task History
├── Subtasks
│   ├── Create Subtask
│   ├── Get Subtasks
│   ├── Update Subtask (PUT)
│   ├── Update Subtask (PATCH)
│   └── Delete Subtask
├── Comments
│   ├── Add Comment
│   ├── Get Comments
│   └── Delete Comment
└── Attachments
    ├── Upload Attachment
    ├── Get Attachments
    └── Delete Attachment
```

---

## Testing the Scheduled Job

The overdue task updater runs every hour. To test immediately:

1. Create a task with a past due date:
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Overdue Task",
    "status": "PENDING",
    "priority": "HIGH",
    "dueDate": "2025-01-01"
  }'
```

2. Wait for the next hour mark, or temporarily modify the cron in `ScheduledTaskService.java`:
```java
@Scheduled(fixedRate = 10000)  // Run every 10 seconds for testing
```

3. Check the task status - it should be automatically updated to DELAYED

4. View history to see the automatic status change:
```bash
curl http://localhost:8080/api/tasks/1/history
```

You'll see an entry like:
```json
{
  "fieldChanged": "STATUS",
  "oldValue": "PENDING",
  "newValue": "DELAYED",
  "changedAt": "2025-11-06T16:00:00"
}
```