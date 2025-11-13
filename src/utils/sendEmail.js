// utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Email utility for sending emails throughout the application
 * Centralizes email configuration and sending logic
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} username - User's username
 */
const sendPasswordResetEmail = async (email, resetToken, username) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Trello Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Trello Clone',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0079bf; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f5f7; padding: 30px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0079bf; color: white; text-decoration: none; border-radius: 3px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
          .warning { color: #ff5630; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${username || 'there'},</p>
            <p>You requested to reset your password for your Trello Clone account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>For security, you can also copy and paste this link:</p>
            <p style="word-break: break-all; font-size: 12px; background: white; padding: 10px;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Trello Clone. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${username || 'there'},
      
      You requested to reset your password for your Trello Clone account.
      
      Click the link below to reset your password (valid for 15 minutes):
      ${resetUrl}
      
      If you didn't request this, please ignore this email.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send board invitation email
 * @param {string} inviteeEmail - Email of person being invited
 * @param {string} inviterName - Name of person sending invitation
 * @param {string} boardName - Name of the board
 * @param {string} token - Invitation token
 * @param {string} role - Role being granted
 */
const sendBoardInvitationEmail = async (inviteeEmail, inviterName, boardName, token, role) => {
  const transporter = createTransporter();
  
  const acceptInviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/accept?token=${token}`;
  
  const roleDescriptions = {
    'VIEWER': 'view the board',
    'MEMBER': 'view and edit the board',
    'ADMIN': 'manage the board and its members'
  };
  
  const mailOptions = {
    from: `"Trello Clone" <${process.env.EMAIL_USER}>`,
    to: inviteeEmail,
    subject: `${inviterName} invited you to join "${boardName}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0079bf; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f5f7; padding: 30px; }
          .board-info { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #0079bf; }
          .button { display: inline-block; padding: 12px 24px; background-color: #5aac44; color: white; text-decoration: none; border-radius: 3px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
          .role-badge { display: inline-block; padding: 4px 8px; background-color: #dfe1e6; border-radius: 3px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Board Invitation</h1>
          </div>
          <div class="content">
            <p><strong>${inviterName}</strong> has invited you to collaborate on:</p>
            <div class="board-info">
              <h2 style="margin: 0;">${boardName}</h2>
              <p style="margin: 10px 0 0 0;">
                Role: <span class="role-badge">${role}</span>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                You'll be able to ${roleDescriptions[role] || 'collaborate on this board'}.
              </p>
            </div>
            <p style="text-align: center;">
              <a href="${acceptInviteUrl}" class="button">Accept Invitation</a>
            </p>
            <p><strong>This invitation will expire in 15 minutes.</strong></p>
            <p style="font-size: 14px; color: #666;">
              Don't have an account? No problem! You can create one when you accept the invitation.
            </p>
            <p>Or copy and paste this link:</p>
            <p style="word-break: break-all; font-size: 12px; background: white; padding: 10px;">${acceptInviteUrl}</p>
          </div>
          <div class="footer">
            <p>This invitation was sent by ${inviterName} through Trello Clone.</p>
            <p>&copy; ${new Date().getFullYear()} Trello Clone. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${inviterName} has invited you to collaborate on "${boardName}"
      
      Your role: ${role}
      
      Click the link below to accept the invitation (valid for 15 minutes):
      ${acceptInviteUrl}
      
      Don't have an account? You can create one when you accept the invitation.
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Board invitation email sent to ${inviteeEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending board invitation email:', error);
    throw new Error('Failed to send board invitation email');
  }
};

/**
 * Test email configuration
 */
const testEmailConfiguration = async () => {
  const transporter = createTransporter();
  
  try {
    await transporter.verify();
    console.log('✅ Email service is configured and ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.error('Please check your EMAIL_* environment variables');
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendBoardInvitationEmail,
  testEmailConfiguration
};

