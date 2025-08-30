const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['case', 'appointment', 'message', 'payment', 'system', 'document'],
    required: true
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityType'
  },
  relatedEntityType: {
    type: String,
    enum: ['Case', 'Appointment', 'Message', 'Invoice', null]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { 
    limit = 50, 
    skip = 0, 
    unreadOnly = false,
    type = null 
  } = options;

  const query = { userId };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate('relatedEntityId')
    .exec();
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds = null) {
  const query = { userId, isRead: false };
  
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }

  return this.updateMany(query, { isRead: true });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Pre-save middleware to ensure proper formatting
notificationSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.title = this.title.trim();
  }
  if (this.isModified('message')) {
    this.message = this.message.trim();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
