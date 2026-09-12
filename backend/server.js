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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5175',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PROD_URL
].filter(Boolean).map(url => url.trim().replace(/\/$/, ''));

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const sanitized = origin.trim().replace(/\/$/, '');
  if (allowedOrigins.includes(sanitized)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(sanitized)) return true;
  if (sanitized.includes('onrender.com') || sanitized.includes('smart-waste')) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
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

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use by another process. Free port ${PORT} or configure a different PORT in .env`);
  } else {
    logger.error(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
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