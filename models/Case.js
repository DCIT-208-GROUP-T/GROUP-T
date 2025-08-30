const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseType: {
    type: String,
    required: true,
    enum: ['criminal', 'civil', 'family', 'corporate', 'real_estate', 'employment', 'intellectual_property', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'review', 'completed', 'closed'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  estimatedCompletion: {
    type: Date
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

caseSchema.index({ clientId: 1 });
caseSchema.index({ lawyerId: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });

caseSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'caseId'
});

caseSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'pending' || this.status === 'review';
};

module.exports = mongoose.model('Case', caseSchema);

