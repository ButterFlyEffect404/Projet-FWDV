const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { users } = require('../data/store');

// GET all users
router.get('/', (req, res) => {
  res.json(users);
});

// GET user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }
  res.json(user);
});

// CREATE new user
router.post('/', (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required'
    });
  }

  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({
      message: 'Email already exists'
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

// UPDATE user
router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const { name, email, password } = req.body;

  // Update only provided fields
  if (name) user.name = name;
  if (email) {
    // Check if email already exists in other users
    if (users.some(u => u.id !== req.params.id && u.email === email)) {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }
    user.email = email;
  }
  if (password) user.password = password;

  user.updatedAt = new Date();

  res.json(user);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const deletedUser = users.splice(index, 1);

  res.json(deletedUser[0]);
});

module.exports = router;