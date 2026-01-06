const mqtt = require('mqtt');
const {getIO} = require('../socket.service');
const Device = require('../../models/device.model');
const SensorData = require('../../models/sensordata.model');
const airHelper = async (action, data) => {
    const deviceName = data.device;
    const value = data.value;
    const device = await Device.findOne({ name: deviceName });
    if (!device) {
        console.error(`Device not found: ${deviceName}`);
        return;
    }
    let sensorData = new SensorData({
        deviceName,
        device_id: device._id,
        sensorType: 'air_quality',
        number_value: value,
        unit: 'AQI',
    });
    switch (action) {
        case 'CO2':
            sensorData.sensorType = 'co2';
            sensorData.unit = 'ppm';
            await sensorData.save();
            break;
        case 'NH3':
            sensorData.sensorType = 'nh3';
            sensorData.unit = 'ppm';
            await sensorData.save();
            break;
        case 'NOx':
            sensorData.sensorType = 'nox';
            sensorData.unit = 'µg/m³';
            await sensorData.save();
            break;
        case 'Alcohol':
            sensorData.sensorType = 'alcohol';
            sensorData.unit = 'ppm';
            await sensorData.save();
            break;
        case 'Benzene':
            sensorData.sensorType = 'benzene';
            sensorData.unit = 'ppm';
            await sensorData.save();
            break;
        default:
            console.log(`Unknown air quality action: ${action}`);
            return;
    }
    const io = getIO();
    io.emit(sensorData.sensorType, {
        deviceName,
        sensorType: sensorData.sensorType,
        value,
        unit: sensorData.unit,
        timestamp: sensorData.timestamp
    });

    console.log(`Air Quality Helper Invoked - Action: ${action}, Device: ${deviceName}, Data:`, data);
}
module.exports = { airHelper };