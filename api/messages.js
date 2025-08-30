const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Case = require('../models/Case');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'fullName email accountType')
      .populate('receiverId', 'fullName email accountType')
      .populate('caseId', 'title')
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('senderId', 'fullName email accountType')
      .populate('receiverId', 'fullName email accountType')
      .populate('caseId', 'title')
      .select('-__v');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversation/:userId1/:userId2', async (req, res) => {
  try {
    const { caseId, limit } = req.query;
    const messages = await Message.getConversation(
      req.params.userId1,
      req.params.userId2,
      caseId,
      parseInt(limit) || 50
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {
      $or: [
        { senderId: req.params.userId },
        { receiverId: req.params.userId }
      ]
    };

    if (type === 'sent') {
      query = { senderId: req.params.userId };
    } else if (type === 'received') {
      query = { receiverId: req.params.userId };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'fullName email accountType')
      .populate('receiverId', 'fullName email accountType')
      .populate('caseId', 'title')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId/unread', async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.params.userId,
      isRead: false
    })
      .populate('senderId', 'fullName email accountType')
      .populate('caseId', 'title')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, caseId, content, messageType, fileUrl, fileName } = req.body;

    // Verify sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender) {
      return res.status(400).json({ message: 'Invalid sender ID' });
    }

    if (!receiver) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Verify case exists if provided
    if (caseId) {
      const caseData = await Case.findById(caseId);
      if (!caseData) {
        return res.status(400).json({ message: 'Invalid case ID' });
      }
    }

    const message = new Message({
      senderId,
      receiverId,
      caseId,
      content,
      messageType,
      fileUrl,
      fileName
    });

    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'fullName email accountType')
      .populate('receiverId', 'fullName email accountType')
      .populate('caseId', 'title');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead();
    const updatedMessage = await Message.findById(req.params.id)
      .populate('senderId', 'fullName email accountType')
      .populate('receiverId', 'fullName email accountType')
      .select('-__v');

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/read-multiple', async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'Invalid message IDs' });
    }

    const result = await Message.updateMany(
      { _id: { $in: messageIds } },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ 
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

