const mqtt = require('mqtt');
const {getIO} = require('../socket.service');
const Device = require('../../models/device.model');
const SensorData = require('../../models/sensordata.model');
const { checkTemperatureAlert } = require('../../controllers/alert.controller');
const ALERT_COOLDOWN = 15 * 60 * 1000;
const temperatureHelper = async (action, data) => {
    const deviceName = data.device;
    const sensorType = 'temperature';
    const unit = '°C';
    const number_value = data.value;
    const lastStatus = await SensorData.findOne({ deviceName })
        .sort({ createdAt: -1 })
        .select('number_value')
        .exec();
    if (lastStatus && lastStatus.number_value === number_value) {
        return;
    }
    const device = await Device.findOne({ name: deviceName });
    if (!device) return;
    const sensordata = new SensorData({
        deviceName,
        device_id: device._id,
        sensorType,
        number_value,
        unit,
    });
    await sensordata.save();

    const threshold = process.env.TEMP_THRESHOLD || 50;

    if (number_value > threshold) {
        const now = new Date();
        const lastSent = device.lastAlertSentAt ? new Date(device.lastAlertSentAt).getTime() : 0;

        if (now.getTime() - lastSent > ALERT_COOLDOWN) {
            
            const userEmail = device.user_email;
            await checkTemperatureAlert(number_value, userEmail);
            device.lastAlertSentAt = now;
            await device.save();
            
        } else {
            console.log(`Nhiệt độ vẫn cao (${number_value}) nhưng đang trong thời gian chờ (Cooldown). Không gửi mail.`);
        }
    } else {
        if (device.lastAlertSentAt) {
            device.lastAlertSentAt = null; 
            await device.save();
        }
    }
    const io = getIO();
    io.emit('temperature', {
        deviceName,
        sensorType,
        value: number_value,
        unit,
        timestamp: sensordata.timestamp
    });

}
module.exports = { temperatureHelper };