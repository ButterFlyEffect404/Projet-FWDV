const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { tasks, workspaces, users } = require('../data/store');

// GET all tasks
router.get('/', (req, res) => {
  const { workspaceId, status, priority } = req.query;
  
  let filteredTasks = tasks;

  if (workspaceId) {
    filteredTasks = filteredTasks.filter(t => t.workspaceId === workspaceId);
  }
  if (status) {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  if (priority) {
    filteredTasks = filteredTasks.filter(t => t.priority === priority);
  }

  res.json(filteredTasks);
});

// GET task by ID
router.get('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({
      message: 'Task not found'
    });
  }
  res.json(task);
});

// CREATE new task
router.post('/', (req, res) => {
  const { title, description, workspaceId, priority, assignedTo, createdBy, dueDate, status } = req.body;

  // Validation
  if (!title || !workspaceId || !createdBy) {
    return res.status(400).json({
      message: 'Title, workspaceId, and createdBy are required'
    });
  }

  // Check if workspace exists
  const workspace = workspaces.find(w => w.id === workspaceId);
  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  // Check if creator exists
  const creator = users.find(u => u.id === createdBy);
  if (!creator) {
    return res.status(404).json({
      message: 'Creator user not found'
    });
  }

  // Check if assignee exists (if provided)
  if (assignedTo) {
    const assignee = users.find(u => u.id === assignedTo);
    if (!assignee) {
      return res.status(404).json({
        message: 'Assigned user not found'
      });
    }
  }

  const newTask = {
    id: uuidv4(),
    title,
    description: description || '',
    status: status || 'pending',
    priority: priority || 'medium',
    workspaceId,
    assignedTo: assignedTo || null,
    createdBy,
    dueDate: dueDate ? new Date(dueDate) : null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// UPDATE task
router.put('/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      message: 'Task not found'
    });
  }

  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (assignedTo !== undefined) {
    if (assignedTo && !users.find(u => u.id === assignedTo)) {
      return res.status(404).json({
        message: 'Assigned user not found'
      });
    }
    task.assignedTo = assignedTo;
  }
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  task.updatedAt = new Date();

  res.json(task);
});

// DELETE task
router.delete('/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: 'Task not found'
    });
  }

  const deletedTask = tasks.splice(index, 1);

  res.json(deletedTask[0]);
});

module.exports = router;