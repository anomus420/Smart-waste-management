/**
 * server.js – Entry point
 * Bootstraps the Express app and starts the HTTP server.
 */
 
// server.js  (replace your current file)
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so controllers can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});