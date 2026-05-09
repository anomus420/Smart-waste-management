/**
 * config/sms.js – Twilio SMS client setup
 */
 
const logger = require('../utils/logger');
 
let client;
 
const getTwilioClient = () => {
  if (client) return client;
 
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    logger.warn('Twilio credentials not configured. SMS features disabled.');
    return null;
  }
 
  try {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('📱 Twilio SMS client ready');
    return client;
  } catch (err) {
    logger.warn('Twilio not available:', err.message);
    return null;
  }
};
 
module.exports = { getTwilioClient };