// File: server/server.js
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { protect } = require('./middleware/authMiddleware');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('locationUpdate', (data) => {
    socket.broadcast.emit('locationBroadcast', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0' ,  () => console.log(`Server running on port ${PORT}`));
