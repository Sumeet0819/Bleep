const express = require('express');
const authRoutes = require('./routes/user.routes');
const reminderRoutes = require('./routes/reminder.routes');
const app = express();
const cors = require('cors');

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:8081","http://192.168.1.12:3000"],
    credentials: true,
  })
);
// Routes
app.use('/api/auth', authRoutes);

app.use('/api/', reminderRoutes);


module.exports = app;// Middleware to parse JSON bodies
