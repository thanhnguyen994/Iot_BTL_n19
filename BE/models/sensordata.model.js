const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sensorDataSchema = new Schema({
  deviceName: { type: String, required: true },
  device_id: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
  sensorType: { type: String, required: true },
  string_value: { type: String },
  number_value: { type: Number },
  unit: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SensorData', sensorDataSchema);