// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   password: String,
//   role: { type: String, enum: ['admin', 'user'], default: 'user' }
// });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  readAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }] // needed for team-based alerts
});

module.exports = mongoose.model('User', userSchema);
