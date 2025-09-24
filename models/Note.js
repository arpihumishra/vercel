const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure notes are isolated by tenant - compound index for performance
noteSchema.index({ tenantId: 1, createdAt: -1 });
noteSchema.index({ tenantId: 1, _id: 1 });

// Update the updatedAt field on save
noteSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Static method to count notes for a tenant
noteSchema.statics.countByTenant = function(tenantId) {
  return this.countDocuments({ tenantId });
};

// Static method to find notes by tenant with pagination
noteSchema.statics.findByTenant = function(tenantId, options = {}) {
  const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;
  
  return this.find({ tenantId })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('createdBy', 'email role');
};

module.exports = mongoose.model('Note', noteSchema);