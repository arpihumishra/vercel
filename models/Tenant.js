const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Tenant slug can only contain lowercase letters, numbers, and hyphens']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  maxNotes: {
    type: Number,
    default: 3 // Free plan limit
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

// Update the updatedAt field on save
tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set maxNotes based on plan
  if (this.plan === 'pro') {
    this.maxNotes = -1; // -1 indicates unlimited
  } else {
    this.maxNotes = 3; // Free plan limit
  }
  
  next();
});

// Instance method to check if tenant can create more notes
tenantSchema.methods.canCreateNote = async function(currentNoteCount) {
  if (this.plan === 'pro' || this.maxNotes === -1) {
    return true;
  }
  return currentNoteCount < this.maxNotes;
};

module.exports = mongoose.model('Tenant', tenantSchema);