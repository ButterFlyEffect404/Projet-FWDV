// In-memory data store
let users = [
  {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed_password_123',
    createdAt: new Date()
  },
  {
    id: 2,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: 'hashed_password_456',
    createdAt: new Date()
  },
  {
    id: 3,
    email: 'buddurid@example.com',
    firstName: 'Buddurid',
    lastName: 'Smith',
    password: 'buddurid',
    createdAt: new Date()
  }
];

let workspaces = [
  {
    id: 1,
    name: 'Default Workspace',
    description: 'My default workspace',
    ownerId: users[0].id.toString(),
    members: [users[0].id.toString(), users[1].id.toString()],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Project Alpha',
    description: 'A workspace for Project Alpha',
    ownerId: users[1].id.toString(),
    members: [users[1].id.toString()],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let tasks = [
  {
    id: 1,
    title: 'Setup project structure',
    description: 'Create initial project folders and files',
    status: 'DONE',
    priority: 'high',
    workspaceId: workspaces[0].id,
    assignedTo: users[0].id,
    createdBy: users[0].id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Implement authentication',
    description: 'Add JWT-based authentication',
    status: 'IN_PROGRESS',
    priority: 'high',
    workspaceId: workspaces[0].id,
    assignedTo: users[1].id,
    createdBy: users[0].id,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: 3,
    title: 'Design UI mockups',
    description: 'Create UI mockups for the application',
    status: 'TODO',
    priority: 'medium',
    workspaceId: workspaces[1].id,
    assignedTo: users[1].id,
    createdBy: users[1].id,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Counter for generating new IDs
let nextWorkspaceId = 3;
let nextTaskId = 4;

module.exports = {
  users,
  workspaces,
  tasks,
  getNextWorkspaceId: () => ++nextWorkspaceId,
  getNextTaskId: () => ++nextTaskId
};
