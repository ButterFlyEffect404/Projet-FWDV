const { v4: uuidv4 } = require('uuid');

// In-memory data store
let users = [
  {
    id: uuidv4(),
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password_123',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hashed_password_456',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let workspaces = [
  {
    id: uuidv4(),
    name: 'Default Workspace',
    description: 'My default workspace',
    ownerId: users[0].id,
    members: [users[0].id, users[1].id],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    name: 'Project Alpha',
    description: 'A workspace for Project Alpha',
    ownerId: users[1].id,
    members: [users[1].id],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let tasks = [
  {
    id: uuidv4(),
    title: 'Setup project structure',
    description: 'Create initial project folders and files',
    status: 'completed',
    priority: 'high',
    workspaceId: workspaces[0].id,
    assignedTo: users[0].id,
    createdBy: users[0].id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: uuidv4(),
    title: 'Implement authentication',
    description: 'Add JWT-based authentication',
    status: 'in-progress',
    priority: 'high',
    workspaceId: workspaces[0].id,
    assignedTo: users[1].id,
    createdBy: users[0].id,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    title: 'Design UI mockups',
    description: 'Create UI mockups for the application',
    status: 'pending',
    priority: 'medium',
    workspaceId: workspaces[1].id,
    assignedTo: users[1].id,
    createdBy: users[1].id,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

module.exports = {
  users,
  workspaces,
  tasks
};
