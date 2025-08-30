const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.id }).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by Firebase UID
router.get('/firebase/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid }).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user (after Firebase auth)
router.post('/', async (req, res) => {
  try {
    const { firebaseUid, email, fullName, accountType, phoneNumber, profilePicture } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ firebaseUid }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      firebaseUid,
      email,
      fullName,
      accountType: accountType || 'client',
      phoneNumber,
      profilePicture // Include profile picture in user data
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by account type
router.get('/type/:accountType', async (req, res) => {
  try {
    const users = await User.find({ accountType: req.params.accountType }).select('-__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/deactivate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deactivate();
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile with profile picture support
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, phoneNumber, profilePicture } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        fullName, 
        phoneNumber, 
        profilePicture,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/lawyers/specialty/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const lawyers = await User.find({ accountType: 'lawyer', specialty }).select('-__v');
    
    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
