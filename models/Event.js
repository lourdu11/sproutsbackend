const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date }, // Optional sorting point
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  duration: { type: String, default: '1 Day' },
  price: { type: String, default: 'Free' },
  image: { type: String, default: '' },
  certificateImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  topics: [{ type: String }],
  benefits: [{ type: String }],
  trainerName: { type: String, default: '' },
  trainerBio: { type: String, default: '' },
  googleFormUrl: { type: String, default: '' },
  status: { type: String, enum: ['Upcoming', 'Completed'], default: 'Upcoming' },
  statusOverride: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-status logic: if no manual override, derive from date (or endDate if present)
eventSchema.methods.getComputedStatus = function () {
  if (this.statusOverride) return this.status;
  
  // Try to parse endDate for more accurate status
  if (this.endDate) {
    const [day, month, year] = this.endDate.split('-').map(Number);
    const end = new Date(year, month - 1, day, 23, 59, 59);
    return end < new Date() ? 'Completed' : 'Upcoming';
  }
  
  return new Date(this.date) < new Date() ? 'Completed' : 'Upcoming';
};

module.exports = mongoose.model('Event', eventSchema);
