const SensorData = require('../models/sensordata.model');
const {getIO} = require('../services/socket.service');
const Device = require('../models/device.model');
const {getMQTTClient} = require('../services/mqtt.service');
const getAllDevices = async () => {
    return await Device.find().exec();
};
module.exports = { getAllDevices };