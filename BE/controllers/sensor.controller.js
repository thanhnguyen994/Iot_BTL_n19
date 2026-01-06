const SensorData = require('../models/sensordata.model');
const {getIO} = require('../services/socket.service');
const Device = require('../models/device.model');
const {getMQTTClient} = require('../services/mqtt.service');
const getLatestSensorData = async (deviceName, sensorType) => {
    return await SensorData.findOne({ deviceName, sensorType })
        .sort({ createdAt: -1 })
        .select('number_value')
        .exec();
};
const getSensorDataHistory = async (deviceName, sensorType) => {
    return await SensorData.find({ deviceName, sensorType })
        .sort({ createdAt: -1 }).limit(30)
        .exec();
};

const changeSensorStatus = async (deviceName, sensorType, value) => {
    const device = await Device.findOne({ name: deviceName });
    const sensorData = await getLatestSensorData(deviceName);
    
    if (sensorData && sensorData.number_value === value) {
        return;
    }
    const sensordata = new SensorData({
        deviceName,
        device_id: device._id,
        sensorType,
        number_value: value,
        unit: '',
    });
    await sensordata.save();
    
    // Publish to MQTT
    const mqttClient = getMQTTClient();
    const topic = `topic/btl_iot_n19/${deviceName}/action`; 
    const payload = String(value); 

    mqttClient.publish(topic, payload);
    
    // Emit to frontend via socket
    const io = getIO();
    io.emit(sensorType, {
        deviceName,
        sensorType,
        value,
        unit: '',
        timestamp: sensordata.timestamp
    });
    
    return sensordata;
};

module.exports = { changeSensorStatus, getSensorDataHistory, getLatestSensorData };