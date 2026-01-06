const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  location: { type: String },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastActive: { type: Date, default: Date.now },
  user_email: { type: String, required: true },
  lastAlertAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);