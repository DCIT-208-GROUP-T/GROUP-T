
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllDocuments,
  getDocumentById,
  getDocumentsByUserId,
  createDocument,
  updateDocument,
  deleteDocument
} = require('../models/DocumentFirestore');
const router = express.Router();


// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, GIF, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET /api/documents - Get all documents for the current user
router.get('/', async (req, res) => {
  try {
    const documents = await getDocumentsByUserId(req.user.id);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/documents/:id - Get a specific document
router.get('/:id', async (req, res) => {
  try {
    const document = await getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/documents - Upload a new document
router.post('/', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentData = {
      userId: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: req.body.category || 'other',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const document = await createDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/documents/:id - Update document metadata
router.put('/:id', async (req, res) => {
  try {
    const { category, caseId } = req.body;

    const document = await updateDocument(req.params.id, { category, caseId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const document = await getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await deleteDocument(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/documents/download/:id - Download a document
router.get('/download/:id', async (req, res) => {
  try {
    const document = await getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    res.download(document.path, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
