const mqtt = require('mqtt');
const { getIO } = require('./socket.service');
const { lightHelper } = require('./mqtt_handler/light');
const { temperatureHelper } = require('./mqtt_handler/temp');
const { ledHelper } = require('./mqtt_handler/led');
const { humidHelper } = require('./mqtt_handler/humid');
const { airHelper } = require('./mqtt_handler/air');
const { fanHelper } = require('./mqtt_handler/fan');
const { pumpHelper } = require('./mqtt_handler/pump');

let mqttClient = null;

const connectMQTT = () => {
  console.log('Starting MQTT Service...');
  console.log('MQTT Broker URL:', process.env.MQTT_BROKER_URL);
  
  const brokerUrl = `mqtts://${process.env.MQTT_BROKER_URL || 'localhost'}:${process.env.MQTT_PORT || 1883}`;
  
  const options = {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
  };

  console.log('Connecting to:', brokerUrl);
  const client = mqtt.connect(brokerUrl, options);
  mqttClient = client;

  client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe('topic/btl_iot_n19/#', (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err);
      } else {
        console.log('Subscribed to topic: btl_iot_n19/#');
      }
    });
  });

  client.on('error', (err) => {
    console.error('MQTT Connection Error:', err.message);
  });

  client.on('offline', () => {
    console.log('MQTT Client is offline');
  });

  client.on('reconnect', () => {
    console.log('Reconnecting to MQTT Broker...');
  });

  client.on('message', (topic, message) => {
    const payload = message.toString();
    const data = JSON.parse(payload);
    console.log(`Received message on ${topic}: ${payload}`);
    const parts = topic.split('/');
    const name = parts[2];
    const action = parts[3];
    console.log(`Parsed topic - Name: ${name}, Action: ${action}`);
    switch (name) {
      case 'cam_bien_anh_sang':
        lightHelper(action, data);
        break;
      case 'den_led':
        ledHelper(action, data);
        break;
      case 'cam_bien_nhiet_do':
        temperatureHelper(action, data);
        break;
      case 'cam_bien_do_am':
        humidHelper(action, data);
        break;
      case 'air_quality':
        airHelper(action, data);
        break;
      case 'quat':
        fanHelper(action, data);
        break;
      case 'may_bom':
        pumpHelper(action, data);
        break;
      default:
        
        break;
    }
  });

  return client;
};

const getMQTTClient = () => {
  if (!mqttClient) {
    throw new Error('MQTT Client not initialized!');
  }
  return mqttClient;
};

module.exports = { connectMQTT, getMQTTClient };