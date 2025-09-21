const express = require('express');
const {
  createCase,
  getCaseById,
  updateCase,
  deleteCase,
  getCasesByClient,
  getCasesByLawyer,
  getCasesByStatus
} = require('../models/CaseFirestore');
const {
  validateCaseCreation,
  validateIdParam,
  validateDocumentUpload
} = require('../middleware/validation');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cases = await getCasesByStatus('active'); // or getAllCases() if needed
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const caseData = await getCaseById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(caseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/client/:clientId?', async (req, res) => {
  try {
    if (!req.params.clientId) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      req.params.clientId = req.user.id;
    }
    const cases = await getCasesByClient(req.params.clientId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/lawyer/:lawyerId?', async (req, res) => {
  try {
    if (!req.params.lawyerId) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      req.params.lawyerId = req.user.id;
    }
    const cases = await getCasesByLawyer(req.params.lawyerId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', validateCaseCreation, async (req, res) => {
  try {
    const { title, description, clientId, lawyerId, caseType, priority } = req.body;

    // No direct user validation here, assume client and lawyer IDs are valid Firestore document IDs

    const caseData = {
      title,
      description,
      clientId,
      lawyerId,
      caseType,
      priority,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newCase = await createCase(caseData);
    res.status(201).json(newCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', validateIdParam, async (req, res) => {
  try {
    const updatedCase = await updateCase(req.params.id, req.body);
    if (!updatedCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(updatedCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    await deleteCase(req.params.id);
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Note: Firestore does not support atomic array push like MongoDB, so document and notes updates need to be handled differently.
// These routes can be updated later with Firestore transaction or batch writes.

module.exports = router;

