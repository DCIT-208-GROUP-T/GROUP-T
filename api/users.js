const express = require('express');
const {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers
} = require('../models/UserFirestore');
const {
  validateUserCreation,
  validateUserUpdate,
  validateIdParam
} = require('../middleware/validation');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/firebase/:uid', async (req, res) => {
  try {
    const user = await getUserById(req.params.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by Firebase UID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', validateUserCreation, async (req, res) => {
  try {
    const { firebaseUid, email, fullName, accountType, phoneNumber, profilePicture } = req.body;

    // Check if user already exists
    const existingUser = await getUserById(firebaseUid) || await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      firebaseUid,
      email,
      fullName,
      accountType: accountType || 'client',
      phoneNumber,
      profilePicture,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedUser = await createUser(userData);
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: 'Failed to create user' });
  }
});

router.put('/:id', validateIdParam, validateUserUpdate, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Failed to update user' });
  }
});

router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Note: Firestore doesn't support complex queries like filtering by accountType easily
// These endpoints would need to be implemented with collection queries or composite indexes

router.get('/type/:accountType', async (req, res) => {
  try {
    // For now, return empty array - would need to implement with Firestore queries
    res.json([]);
  } catch (error) {
    console.error('Error fetching users by account type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/deactivate', validateIdParam, async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, { isActive: false });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Failed to deactivate user' });
  }
});

router.put('/profile/:id', validateIdParam, validateUserUpdate, async (req, res) => {
  try {
    const { fullName, phoneNumber, profilePicture } = req.body;

    const updatedUser = await updateUser(req.params.id, {
      fullName,
      phoneNumber,
      profilePicture,
      updatedAt: new Date()
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ message: 'Failed to update user profile' });
  }
});

router.get('/lawyers/specialty/:specialty', async (req, res) => {
  try {
    // For now, return empty array - would need to implement with Firestore queries
    res.json([]);
  } catch (error) {
    console.error('Error fetching lawyers by specialty:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

