const express = require('express');
const Case = require('../models/Case');
const User = require('../models/User');
// const { requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all cases
router.get('/', async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .select('-__v');
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get case by ID
router.get('/:id', async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('clientId', 'fullName email phoneNumber')
      .populate('lawyerId', 'fullName email phoneNumber')
      .select('-__v');
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cases by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const cases = await Case.find({ clientId: req.params.clientId })
      .populate('lawyerId', 'fullName email')
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cases by lawyer ID
router.get('/lawyer/:lawyerId', async (req, res) => {
  try {
    const cases = await Case.find({ lawyerId: req.params.lawyerId })
      .populate('clientId', 'fullName email phoneNumber')
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new case - Only lawyers and admins can create cases
router.post('/', async (req, res) => {
  try {
    const { title, description, clientId, lawyerId, caseType, priority } = req.body;
    
    // Verify client and lawyer exist
    const [client, lawyer] = await Promise.all([
      User.findById(clientId),
      User.findById(lawyerId)
    ]);
    
    if (!client || client.accountType !== 'client') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    
    if (!lawyer || lawyer.accountType !== 'lawyer') {
      return res.status(400).json({ message: 'Invalid lawyer ID' });
    }

    const caseData = new Case({
      title,
      description,
      clientId,
      lawyerId,
      caseType,
      priority
    });

    const savedCase = await caseData.save();
    const populatedCase = await Case.findById(savedCase._id)
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email');
    
    res.status(201).json(populatedCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update case
router.put('/:id', async (req, res) => {
  try {
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .select('-__v');
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json(caseData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete case - Only lawyers and admins can delete cases
router.delete('/:id', async (req, res) => {
  try {
    const caseData = await Case.findByIdAndDelete(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add document to case
router.post('/:id/documents', async (req, res) => {
  try {
    const { name, url } = req.body;
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      { $push: { documents: { name, url } } },
      { new: true, runValidators: true }
    );
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json(caseData.documents[caseData.documents.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add note to case
router.post('/:id/notes', async (req, res) => {
  try {
    const { content, createdBy } = req.body;
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      { $push: { notes: { content, createdBy } } },
      { new: true, runValidators: true }
    );
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json(caseData.notes[caseData.notes.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get cases by status
router.get('/status/:status', async (req, res) => {
  try {
    const cases = await Case.find({ status: req.params.status })
      .populate('clientId', 'fullName email')
      .populate('lawyerId', 'fullName email')
      .select('-__v');
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
