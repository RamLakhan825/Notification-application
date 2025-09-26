require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const userRoutes = require('./routes/user');
const endUserRoutes = require('./routes/endUser');

// Initialize Express app first
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', endUserRoutes);

// Create HTTP server AFTER app is declared
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, { cors: { origin: '*' } });

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId); // Join a room for this user
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Export io to use in scheduler
module.exports.io = io;

// Scheduler (make sure scheduler requires io if needed)
require('./scheduler/alertScheduler');

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
