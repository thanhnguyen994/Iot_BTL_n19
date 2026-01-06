const mqtt = require('mqtt');
const {getIO} = require('../socket.service');
const Device = require('../../models/device.model');
const SensorData = require('../../models/sensordata.model');

const fanHelper = async (action, data) => {
    const deviceName = data.device;
    const value = data.value;

    const lastStatus = await SensorData.findOne({ deviceName })
        .sort({ createdAt: -1 })
        .select('number_value')
        .exec();

    if (lastStatus && lastStatus.number_value === value) {
        return;
    }
    const device = await Device.findOne({ name: deviceName });
    if (!device) {
        console.error(`Device not found: ${deviceName}`);
        return;
    }
    const sensordata = new SensorData({
        deviceName,
        device_id: device._id,
        sensorType: 'fan',
        number_value: value,
        unit: '',
    });
    await sensordata.save();

    const io = getIO();
    io.emit('fan', {
        deviceName,
        sensorType: 'fan',
        value,
        unit: '',
        timestamp: sensordata.timestamp
    });

    console.log(`Fan Helper Invoked - Action: ${action}, Device: ${deviceName}, Data:`, data);
}
module.exports = { fanHelper };