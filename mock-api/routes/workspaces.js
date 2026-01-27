const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { workspaces, users, tasks } = require('../data/store');

// GET all workspaces
router.get('/', (req, res) => {
  res.json(workspaces);
});

// GET workspace by ID
router.get('/:id', (req, res) => {
  const workspace = workspaces.find(w => w.id === req.params.id);
  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }
  res.json(workspace);
});

// CREATE new workspace
router.post('/', (req, res) => {
  const { name, description, ownerId } = req.body;

  // Validation
  if (!name || !ownerId) {
    return res.status(400).json({
      message: 'Name and ownerId are required'
    });
  }

  // Check if owner exists
  const owner = users.find(u => u.id === ownerId);
  if (!owner) {
    return res.status(404).json({
      message: 'Owner not found'
    });
  }

  const newWorkspace = {
    id: uuidv4(),
    name,
    description: description || '',
    ownerId,
    members: [ownerId],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  workspaces.push(newWorkspace);

  res.status(201).json(newWorkspace);
});

// UPDATE workspace
router.put('/:id', (req, res) => {
  const workspace = workspaces.find(w => w.id === req.params.id);

  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  const { name, description } = req.body;

  if (name) workspace.name = name;
  if (description !== undefined) workspace.description = description;

  workspace.updatedAt = new Date();

  res.json(workspace);
});

// DELETE workspace
router.delete('/:id', (req, res) => {
  const index = workspaces.findIndex(w => w.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  const deletedWorkspace = workspaces.splice(index, 1);

  res.json(deletedWorkspace[0]);
});

// ADD member to workspace
router.post('/:id/members', (req, res) => {
  const workspace = workspaces.find(w => w.id === req.params.id);

  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      message: 'userId is required'
    });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  if (workspace.members.includes(userId)) {
    return res.status(409).json({
      message: 'User is already a member of this workspace'
    });
  }

  workspace.members.push(userId.toString());
  workspace.updatedAt = new Date();

  res.json(workspace);
});

// REMOVE member from workspace
router.delete('/:id/members/:userId', (req, res) => {
  const workspace = workspaces.find(w => w.id === req.params.id);

  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  const memberIndex = workspace.members.indexOf(req.params.userId);

  if (memberIndex === -1) {
    return res.status(404).json({
      message: 'User is not a member of this workspace'
    });
  }

  workspace.members.splice(memberIndex, 1);
  workspace.updatedAt = new Date();

  res.json(workspace);
});

// GET tasks for a specific workspace
router.get('/:id/tasks', (req, res) => {
  const workspace = workspaces.find(w => w.id === req.params.id);

  if (!workspace) {
    return res.status(404).json({
      message: 'Workspace not found'
    });
  }

  // Filter tasks by workspaceId
  const workspaceTasks = tasks.filter(t => t.workspaceId === req.params.id);

  res.json(workspaceTasks);
});

module.exports = router;