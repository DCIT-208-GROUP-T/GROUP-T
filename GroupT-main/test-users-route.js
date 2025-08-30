const express = require('express');
const router = express.Router();
const User = require('./models/User');

console.log('Testing users route import...');

// Simple test route
router.get('/test', async (req, res) => {
  res.json({ message: 'Test route working' });
});

console.log('Users route loaded successfully');

module.exports = router;
