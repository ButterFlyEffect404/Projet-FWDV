# Mock API

A simple in-memory mock API with CRUD operations for users, workspaces, and tasks.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start          # Start the server
npm run dev        # Start with file watching (requires Node 18+)
```

The server will run on `http://localhost:3001`

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Create User Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Workspaces

- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member to workspace
- `DELETE /api/workspaces/:id/members/:userId` - Remove member from workspace

#### Create Workspace Example:

```json
{
  "name": "Project Alpha",
  "description": "A workspace for Project Alpha",
  "ownerId": "user-id-here"
}
```

#### Add Member Example:

```json
{
  "userId": "user-id-to-add"
}
```

### Tasks

- `GET /api/tasks` - Get all tasks (supports filtering)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Create Task Example:

```json
{
  "title": "Implement authentication",
  "description": "Add JWT-based authentication",
  "workspaceId": "workspace-id-here",
  "createdBy": "user-id-here",
  "assignedTo": "user-id-here",
  "priority": "high",
  "status": "in-progress",
  "dueDate": "2026-01-28T00:00:00Z"
}
```

#### Query Tasks Example:

```
GET /api/tasks?workspaceId=workspace-id&status=in-progress&priority=high
```

## Features

- ✅ In-memory data storage (no database)
- ✅ CRUD operations for users, workspaces, and tasks
- ✅ Workspace member management
- ✅ Task filtering by workspace, status, and priority
- ✅ UUID-based resource IDs
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Error handling and validation
- ✅ Request logging

## Data Structure

### User

```javascript
{
  id: "uuid",
  name: "string",
  email: "string",
  password: "string",
  createdAt: "Date",
  updatedAt: "Date"
}
```

### Workspace

```javascript
{
  id: "uuid",
  name: "string",
  description: "string",
  ownerId: "uuid",
  members: ["uuid"],
  createdAt: "Date",
  updatedAt: "Date"
}
```

### Task

```javascript
{
  id: "uuid",
  title: "string",
  description: "string",
  status: "pending|in-progress|completed",
  priority: "low|medium|high",
  workspaceId: "uuid",
  assignedTo: "uuid|null",
  createdBy: "uuid",
  dueDate: "Date|null",
  createdAt: "Date",
  updatedAt: "Date"
}
```

## Notes

- All data is stored in memory and will be reset when the server restarts
- No authentication is implemented (this is a mock API)
- The API includes sample data with 2 users, 2 workspaces, and 3 tasks
