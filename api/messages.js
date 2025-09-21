const express = require('express');
const {
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
  getMessagesBySender,
  getMessagesByReceiver,
  getMessagesByCase,
  getConversation,
  markMessageAsRead,
  getAllMessages
} = require('../models/MessageFirestore');
const {
  getUserById
} = require('../models/UserFirestore');
const {
  getCaseById
} = require('../models/CaseFirestore');
const {
  validateMessageCreation,
  validateIdParam,
  validateMessageIds,
  validateUserIdParam
} = require('../middleware/validation');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);
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
    const messages = await getConversation(
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

router.get('/user/:userId?', async (req, res) => {
  try {
    if (!req.params.userId) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      req.params.userId = req.user.id;
    }
    const { type } = req.query;
    let messages;
    if (type === 'sent') {
      messages = await getMessagesByUser(req.params.userId, 'sent');
    } else if (type === 'received') {
      messages = await getMessagesByUser(req.params.userId, 'received');
    } else {
      // For 'all' type, get sent and received messages and merge
      const sentMessages = await getMessagesByUser(req.params.userId, 'sent');
      const receivedMessages = await getMessagesByUser(req.params.userId, 'received');
      messages = [...sentMessages, ...receivedMessages];
      // Optionally sort by createdAt descending
      messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId?/unread', async (req, res) => {
  try {
    if (!req.params.userId) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      req.params.userId = req.user.id;
    }
    const messages = await getUnreadMessagesByUser(req.params.userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', validateMessageCreation, async (req, res) => {
  try {
    const { senderId, receiverId, caseId, content, messageType, fileUrl, fileName } = req.body;

    // Verify sender and receiver exist
    const [sender, receiver] = await Promise.all([
      getUserById(senderId),
      getUserById(receiverId)
    ]);

    if (!sender) {
      return res.status(400).json({ message: 'Invalid sender ID' });
    }

    if (!receiver) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Verify case exists if provided
    if (caseId) {
      const caseData = await getCaseById(caseId);
      if (!caseData) {
        return res.status(400).json({ message: 'Invalid case ID' });
      }
    }

    const message = await createMessage({
      senderId,
      receiverId,
      caseId,
      content,
      messageType,
      fileUrl,
      fileName,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/read', validateIdParam, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const updatedMessage = await markMessageAsRead(req.params.id);

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

    const promises = messageIds.map(id => markMessageAsRead(id));
    await Promise.all(promises);

    res.json({ 
      message: `${messageIds.length} messages marked as read`,
      modifiedCount: messageIds.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await deleteMessage(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

