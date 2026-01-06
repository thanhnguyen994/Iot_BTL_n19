const mqtt = require('mqtt');
const {getIO} = require('../socket.service');
const Device = require('../../models/device.model');
const SensorData = require('../../models/sensordata.model');
const humidHelper = async (action, data) => {
    const deviceName = data.device;
    const value = data.value;
    const device = await Device.findOne({ name: deviceName });
    if (!device) {
        console.error(`Device not found: ${deviceName}`);
        return;
    }
    const sensorData = new SensorData({
        deviceName,
        device_id: device._id,
        sensorType: 'humidity',
        number_value: value,
        unit: '%',
    });
    await sensorData.save();

    const io = getIO();
    io.emit('humidity', {
        deviceName,
        sensorType: 'humidity',
        value,
        unit: '%',
        timestamp: sensorData.timestamp
    });

    console.log(`Humidity Helper Invoked - Action: ${action}, Device: ${deviceName}, Data:`, data);
}
module.exports = { humidHelper };