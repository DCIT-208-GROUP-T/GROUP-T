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

userSchema.index({ accountType: 1 });

userSchema.virtual('lawyerProfile', {
  ref: 'LawyerProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

userSchema.virtual('clientProfile', {
  ref: 'ClientProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

userSchema.methods.getDisplayName = function() {
  return this.fullName.split(' ')[0];
};

userSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);

