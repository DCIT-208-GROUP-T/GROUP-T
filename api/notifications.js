const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  deleteUserNotifications
} = require('../models/NotificationFirestore');

router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly, type } = req.query;

    const notifications = await getUserNotifications(req.user.id, {
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
        total: notifications.length
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
    const count = await getUnreadCount(req.user.id);

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

    await markAsRead(req.user.id, notificationIds);

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
    const notification = await getNotificationById(req.params.id);

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await markAsRead(req.user.id, [req.params.id]);

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
    const notification = await getNotificationById(req.params.id);

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await deleteNotification(req.params.id);

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
    await deleteUserNotifications(req.user.id);

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

    const notification = await createNotification({
      userId: req.user.id,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType,
      priority: priority || 'medium',
      actionUrl,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    });

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

