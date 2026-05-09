/**
 * services/smsService.js
 * Twilio SMS sender. Gracefully disabled if credentials are missing.
 */
 
const { getTwilioClient } = require('../config/sms');
const logger = require('../utils/logger');
 
const FROM = process.env.TWILIO_PHONE_NUMBER;
 
/**
 * Send an SMS message.
 * @returns {{ success: boolean, sid?: string, error?: string }}
 */
const sendSMS = async (to, body) => {
  const client = getTwilioClient();
 
  if (!client) {
    logger.warn(`SMS skipped (Twilio not configured) → ${to}: ${body}`);
    return { success: false, error: 'Twilio not configured' };
  }
 
  try {
    const message = await client.messages.create({ body, from: FROM, to });
    logger.info(`SMS sent to ${to}: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    logger.warn(`SMS failed to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};
 
/**
 * Notify user about complaint status via SMS.
 */
const sendComplaintSMS = (phone, complaintTitle, status) => {
  if (!phone) return Promise.resolve({ success: false, error: 'No phone number' });
  const body = `[SmartWaste] Your complaint "${complaintTitle}" status: ${status}. Track at ${process.env.FRONTEND_URL}/track-complaint`;
  return sendSMS(phone, body);
};
 
/**
 * Confirm e-waste pickup via SMS.
 */
const sendPickupSMS = (phone, pickupDate) => {
  if (!phone) return Promise.resolve({ success: false, error: 'No phone number' });
  const body = `[SmartWaste] E-waste pickup confirmed for ${new Date(pickupDate).toDateString()}. Thank you!`;
  return sendSMS(phone, body);
};
 
module.exports = { sendSMS, sendComplaintSMS, sendPickupSMS };