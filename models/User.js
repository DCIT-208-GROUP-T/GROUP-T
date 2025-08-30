const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['client', 'lawyer', 'admin'],
    default: 'client'
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ accountType: 1 });

// Virtual for lawyer-specific data
userSchema.virtual('lawyerProfile', {
  ref: 'LawyerProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Virtual for client-specific data
userSchema.virtual('clientProfile', {
  ref: 'ClientProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Method to get user display name
userSchema.methods.getDisplayName = function() {
  return this.fullName.split(' ')[0];
};

userSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
