
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: String,
  message: String,
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' },
  deliveryType: { type: String, enum: ['In-App', 'Email', 'SMS'], default: 'In-App' },
  reminderFrequency: { type: Number, default: 2 }, // hours
  visibility: {
    organization: { type: Boolean, default: false },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  startTime: { type: Date, default: Date.now },
  expiryTime: Date,
  active: { type: Boolean, default: true },
  lastSent: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, time: Date }],
  snoozedUsers: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, snoozedDate: Date }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

alertSchema.virtual('isExpired').get(function () {
  return this.expiryTime ? new Date(this.expiryTime) < new Date() : false;
});

alertSchema.set('toJSON', { virtuals: true });
alertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Alert', alertSchema);
