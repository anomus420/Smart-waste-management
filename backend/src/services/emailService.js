/**
 * services/emailService.js
 * Wraps Nodemailer with ready-made email templates.
 */
 
const { createTransporter } = require('../config/email');
const logger = require('../utils/logger');
 
const FROM = process.env.EMAIL_FROM || 'noreply@smartwaste.com';
 
/**
 * Core send function.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `Smart Waste <${FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''), // fallback plain text
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.warn(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};
 
/**
 * Welcome email after signup.
 */
const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: 'Welcome to Smart Waste Management 🌱',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#16a34a">Welcome, ${user.name}!</h2>
        <p>Thank you for joining Smart Waste Management. Together we can build cleaner communities.</p>
        <p>You can now:</p>
        <ul>
          <li>File waste-related complaints in your area</li>
          <li>Request e-waste pickup</li>
          <li>Find nearby waste centres</li>
          <li>Learn through our Awareness Hub</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
          Get Started
        </a>
        <p style="color:#888;margin-top:24px;font-size:12px">Smart Waste Management Team</p>
      </div>`,
  });
 
/**
 * Complaint status update email.
 */
const sendComplaintStatusEmail = (user, complaint, newStatus) => {
  const statusLabel = {
    in_progress: 'In Progress',
    resolved:    'Resolved ✅',
    rejected:    'Not Actionable',
  }[newStatus] || newStatus;
 
  return sendEmail({
    to: user.email,
    subject: `Complaint Update: "${complaint.title}" is now ${statusLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#16a34a">Complaint Status Update</h2>
        <p>Hi ${user.name},</p>
        <p>Your complaint <strong>"${complaint.title}"</strong> has been updated.</p>
        <p><strong>New Status:</strong> ${statusLabel}</p>
        <p><strong>Location:</strong> ${complaint.location.address}</p>
        <a href="${process.env.FRONTEND_URL}/track-complaint" 
           style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
          Track Your Complaint
        </a>
      </div>`,
  });
};
 
/**
 * E-waste pickup confirmation email.
 */
const sendPickupConfirmationEmail = (user, pickup) =>
  sendEmail({
    to: user.email,
    subject: 'E-Waste Pickup Confirmed 📦',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#16a34a">Pickup Confirmed!</h2>
        <p>Hi ${user.name}, your e-waste pickup has been scheduled.</p>
        <p><strong>Type:</strong> ${pickup.wasteType}</p>
        <p><strong>Address:</strong> ${pickup.address}</p>
        <p><strong>Date:</strong> ${new Date(pickup.pickupDate).toDateString()}</p>
        <p><strong>Time Slot:</strong> ${pickup.pickupTimeSlot}</p>
        <p>Please ensure the items are accessible at the scheduled time.</p>
      </div>`,
  });
 
/**
 * Password reset email.
 */
const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: 'Password Reset Request 🔒',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#16a34a">Reset Your Password</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Please click the button below to set a new password. This link is valid for 10 minutes.</p>
        <a href="${resetUrl}" 
           style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;margin-bottom:12px">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>`,
  });
 
module.exports = { sendEmail, sendWelcomeEmail, sendComplaintStatusEmail, sendPickupConfirmationEmail, sendPasswordResetEmail };