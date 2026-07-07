const mongoose = require('mongoose');

// Blueprint for each job application
const ApplicationSchema = new mongoose.Schema({
  // Who owns this application?
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Links to User model
    ref: 'User',                            // References the User collection
    required: true
  },
  
  // Basic info about the job
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  
  position: {
    type: String,
    required: true,
    trim: true
  },
  
  // Where did you apply?
  applicationUrl: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Application status (progress tracking)
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected'],  // Only these 4 options allowed
    default: 'Applied'
  },
  
  // Optional details
  location: {
    type: String,
    trim: true,
    default: ''
  },
  
  salaryRange: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Notes about the application or interview
  notes: {
    type: String,
    default: ''
  },
  
  // Important dates
  dateApplied: {
    type: Date,
    default: Date.now
  },
  
  followUpDate: {
    type: Date,
    default: null  // Optional reminder date
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

/*// Automatically update 'updatedAt' whenever the document is modified
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});*/

module.exports = mongoose.model('Application', ApplicationSchema);