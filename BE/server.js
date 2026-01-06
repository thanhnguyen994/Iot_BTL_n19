require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initSocket } = require('./services/socket.service');
const { connectMQTT } = require('./services/mqtt.service');

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);

initSocket(server);

connectMQTT();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});