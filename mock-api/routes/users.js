const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { users } = require('../data/store');

// GET all users
router.get('/', (req, res) => {
  // Don't send passwords in response
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// GET user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }
  // Don't send password in response
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// CREATE new user
router.post('/', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      message: 'First name, last name, email, and password are required'
    });
  }

  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({
      message: 'Email already exists'
    });
  }

  // Auto-increment ID
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id: newId,
    firstName,
    lastName,
    email,
    password,
    createdAt: new Date()
  };

  users.push(newUser);

  // Don't send password in response
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// UPDATE user
router.put('/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const { firstName, lastName, email, password } = req.body;

  // Update only provided fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) {
    // Check if email already exists in other users
    if (users.some(u => u.id !== userId && u.email === email)) {
      return res.status(409).json({
        message: 'Email already exists'
      });
    }
    user.email = email;
  }
  if (password) user.password = password;

  // Don't send password in response
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  const deletedUser = users.splice(index, 1);

  res.json(deletedUser[0]);
});

module.exports = router;