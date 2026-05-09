/**
 * config/email.js – Nodemailer transporter setup
 */
 
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
 
let transporter;
 
const createTransporter = () => {
  if (transporter) return transporter;
 
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
 
  // Verify connection on startup
  transporter.verify((error) => {
    if (error) {
      logger.warn('Email transporter not configured:', error.message);
    } else {
      logger.info('📧 Email transporter ready');
    }
  });
 
  return transporter;
};
 
module.exports = { createTransporter };