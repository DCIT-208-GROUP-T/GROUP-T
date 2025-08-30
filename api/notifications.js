const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly, type } = req.query;

    const notifications = await Notification.getUserNotifications(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true',
      type: type || null
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        total: await Notification.countDocuments({ userId: req.user._id })
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

router.put('/mark-read', async (req, res) => {
  try {
    const { notificationIds } = req.body;

    await Notification.markAsRead(req.user._id, notificationIds);

    res.json({
      success: true,
      message: notificationIds ? 'Notifications marked as read' : 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      priority,
      actionUrl,
      metadata
    } = req.body;

    const notification = new Notification({
      userId: req.user._id,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      priority: priority || 'medium',
      actionUrl,
      metadata
    });

    await notification.save();
    await notification.populate('relatedEntityId');

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

module.exports = router;

