const express = require('express');
const cors = require('cors');
const sensorRoutes = require('./routes/index');

const app = express();

app.use(cors());
app.use(express.json());

// Use sensor routes
app.use('/api', sensorRoutes);

module.exports = app;