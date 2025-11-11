# Todo API

A simple Spring Boot application to manage a list of todos.

## Endpoints

### Get all todos

- **GET** `/todos`

Returns a list of all todos.

**Response:**
```json
[
    {
        "id": 1,
        "title": "My first todo",
        "completed": false
    },
    {
        "id": 2,
        "title": "My second todo",
        "completed": true
    }
]
```

### Get a single todo

- **GET** `/todos/{id}`

Returns a single todo by its ID.

**Response:**
```json
{
    "id": 1,
    "title": "My first todo",
    "completed": false
}
```

### Create a new todo

- **POST** `/todos`

Creates a new todo.

**Request:**
```json
{
    "title": "A new todo",
    "completed": false
}
```

**Response:**
```json
{
    "id": 3,
    "title": "A new todo",
    "completed": false
}
```

### Update a todo

- **PUT** `/todos/{id}`

Updates an existing todo.

**Request:**
```json
{
    "title": "Updated todo title",
    "completed": true
}
```

**Response:**
```json
{
    "id": 1,
    "title": "Updated todo title",
    "completed": true
}
```

### Delete a todo

- **DELETE** `/todos/{id}`

Deletes a todo by its ID.
