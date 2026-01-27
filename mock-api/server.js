const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;




// Middleware
app.use(express.json());
app.use(function (req, res, next) {
    // Allow specific origin (required when using credentials)
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
const usersRouter = require('./routes/users');
const workspacesRouter = require('./routes/workspaces');
const tasksRouter = require('./routes/tasks');

app.use('/user', usersRouter);
app.use('/workspaces', workspacesRouter);
app.use('/tasks', tasksRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Mock API Server',
    version: '1.0.0',
    endpoints: {
      users: '/users',
      workspaces: '/workspaces',
      tasks: '/tasks'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    http://localhost:${PORT}/users`);
  console.log(`  GET    http://localhost:${PORT}/users/:id`);
  console.log(`  POST   http://localhost:${PORT}/users`);
  console.log(`  PUT    http://localhost:${PORT}/users/:id`);
  console.log(`  DELETE http://localhost:${PORT}/users/:id\n`);
  console.log(`  GET    http://localhost:${PORT}/workspaces`);
  console.log(`  GET    http://localhost:${PORT}/workspaces/:id`);
  console.log(`  POST   http://localhost:${PORT}/workspaces`);
  console.log(`  PUT    http://localhost:${PORT}/workspaces/:id`);
  console.log(`  DELETE http://localhost:${PORT}/workspaces/:id`);
  console.log(`  POST   http://localhost:${PORT}/workspaces/:id/members`);
  console.log(`  DELETE http://localhost:${PORT}/workspaces/:id/members/:userId\n`);
  console.log(`  GET    http://localhost:${PORT}/tasks`);
  console.log(`  GET    http://localhost:${PORT}/tasks/:id`);
  console.log(`  POST   http://localhost:${PORT}/tasks`);
  console.log(`  PUT    http://localhost:${PORT}/tasks/:id`);
  console.log(`  DELETE http://localhost:${PORT}/tasks/:id\n`);
});
