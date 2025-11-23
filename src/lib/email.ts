import nodemailer from 'nodemailer';
import { IBooking } from '@/models/Booking';
import { IEvent } from '@/models/Event';
import { IUser } from '@/models/User';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const getBookingConfirmationTemplate = (booking: IBooking, event: IEvent, user: IUser) => {
  return {
    subject: `Booking Confirmed - ${event.title} (${booking.bookingId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmation</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>Your booking has been confirmed! Here are the details:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Participants:</strong> ${booking.participants.length}</p>
          <p><strong>Total Amount:</strong> ₹${booking.finalAmount}</p>
          <p><strong>Payment Status:</strong> ${booking.paymentInfo.paymentStatus}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">What's Next?</h3>
          <ul>
            <li>You'll receive a reminder email 24 hours before your trip</li>
            <li>Please arrive 30 minutes before the scheduled departure time</li>
            <li>Bring a valid ID and any required documents</li>
            <li>Check the weather forecast and pack accordingly</li>
          </ul>
        </div>
        
        <p>If you have any questions, please contact us at support@avidexplorers.com</p>
        
        <p>Best regards,<br>The Avid Explores Team</p>
      </div>
    `,
  };
};

const getPaymentFailedTemplate = (booking: IBooking, event: IEvent, user: IUser) => {
  return {
    subject: `Payment Failed - ${event.title} (${booking.bookingId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>We're sorry to inform you that your payment for the following booking has failed:</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> ₹${booking.finalAmount}</p>
          ${booking.paymentInfo.failureReason ? `<p><strong>Reason:</strong> ${booking.paymentInfo.failureReason}</p>` : ''}
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #d97706;">Next Steps</h3>
          <p>Please try making the payment again using the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/booking/${booking._id}/payment" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            Retry Payment
          </a>
          <p><small>This booking will be automatically cancelled if payment is not completed within 24 hours.</small></p>
        </div>
        
        <p>If you continue to face issues, please contact us at support@avidexplorers.com</p>
        
        <p>Best regards,<br>The Avid Explores Team</p>
      </div>
    `,
  };
};

const getCancellationTemplate = (booking: IBooking, event: IEvent, user: IUser) => {
  return {
    subject: `Booking Cancelled - ${event.title} (${booking.bookingId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Booking Cancelled</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>Your booking has been cancelled as requested:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> ₹${booking.finalAmount}</p>
          ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
        </div>
        
        ${booking.paymentInfo.paymentStatus === 'SUCCESS' ? `
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">Refund Information</h3>
            <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
            <p><strong>Refund Amount:</strong> ₹${booking.paymentInfo.refundAmount || booking.finalAmount}</p>
          </div>
        ` : ''}
        
        <p>We're sorry to see you go. If you have any feedback or questions, please contact us at support@avidexplorers.com</p>
        
        <p>Best regards,<br>The Avid Explores Team</p>
      </div>
    `,
  };
};

// Email sending functions
export const sendBookingConfirmation = async (booking: IBooking, event: IEvent, user: IUser) => {
  try {
    const template = getBookingConfirmationTemplate(booking, event, user);
    
    await transporter.sendMail({
      from: `"Avid Explores" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`Booking confirmation email sent to ${user.email} for booking ${booking.bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

export const sendPaymentFailedEmail = async (booking: IBooking, event: IEvent, user: IUser) => {
  try {
    const template = getPaymentFailedTemplate(booking, event, user);
    
    await transporter.sendMail({
      from: `"Avid Explores" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`Payment failed email sent to ${user.email} for booking ${booking.bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return false;
  }
};

export const sendCancellationEmail = async (booking: IBooking, event: IEvent, user: IUser) => {
  try {
    const template = getCancellationTemplate(booking, event, user);
    
    await transporter.sendMail({
      from: `"Avid Explores" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: user.email,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`Cancellation email sent to ${user.email} for booking ${booking.bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
};

// Newsletter and marketing emails
export const sendNewsletterEmail = async (subscribers: string[], subject: string, content: string) => {
  try {
    const promises = subscribers.map(email => 
      transporter.sendMail({
        from: `"Avid Explores" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject,
        html: content,
      })
    );
    
    await Promise.all(promises);
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
    return true;
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return false;
  }
};

// Admin notification emails
export const sendAdminNotification = async (subject: string, content: string) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@avidexplorers.com';
    
    await transporter.sendMail({
      from: `"Avid Explores System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[ADMIN] ${subject}`,
      html: content,
    });
    
    console.log(`Admin notification sent: ${subject}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

// OTP Email Template
const getOTPEmailTemplate = (otp: string, type: 'login' | 'reset') => {
  const title = type === 'login' ? 'Login Verification' : 'Password Reset';
  const message = type === 'login' 
    ? 'You requested an OTP to login to your account.' 
    : 'You requested to reset your password.';
  
  return {
    subject: `${title} - Your OTP Code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 36px; font-weight: bold; color: #ffffff; margin-bottom: 10px; letter-spacing: 2px;">
                      AVID EXPLORERS
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hello,
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      ${message}
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px dashed #dc2626; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                      <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                        Your OTP Code
                      </p>
                      <div style="font-size: 42px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </div>
                      <p style="color: #666666; font-size: 13px; margin: 15px 0 0 0;">
                        Valid for 10 minutes
                      </p>
                    </div>
                    
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                        <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Avid Explorers will never ask for your OTP via phone or email.
                      </p>
                    </div>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                      If you didn't request this OTP, please ignore this email or contact our support team immediately.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      Need help? Contact us at
                    </p>
                    <p style="margin: 0 0 15px 0;">
                      <a href="mailto:support@avidexplorers.com" style="color: #dc2626; text-decoration: none; font-weight: 600;">
                        support@avidexplorers.com
                      </a>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                      © ${new Date().getFullYear()} Avid Explorers. All rights reserved.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
                      Your trusted adventure partner
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

// Send OTP Email
export const sendOTPEmail = async (email: string, otp: string, type: 'login' | 'reset' = 'reset') => {
  try {
    const template = getOTPEmailTemplate(otp, type);
    
    await transporter.sendMail({
      from: `"Avid Explorers" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    });
    
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};