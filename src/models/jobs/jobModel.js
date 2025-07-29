const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  location: {
    type: String,
  },
  organization: {
    type: String,
  },
  mode: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;