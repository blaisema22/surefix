const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const formatTime = (time) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${suffix}`;
};

const formatDate = (dateStr) => {
    // Ensure date is treated as local time to prevent timezone shifts (e.g. displaying previous day)
    const date = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const emailStyles = `
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #e94560; font-size: 28px; margin: 0; letter-spacing: 2px; }
    .header p { color: #a0aec0; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 36px 32px; }
    .greeting { font-size: 18px; color: #1a1a2e; font-weight: 600; margin-bottom: 12px; }
    .text { color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
    .card { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 24px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #718096; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { color: #1a1a2e; font-size: 14px; font-weight: 600; }
    .badge { display: inline-block; background: #e94560; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
    .btn { display: inline-block; background: #e94560; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 8px 0; }
    .footer { background: #f7fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #a0aec0; font-size: 12px; margin: 0; }
    @media only screen and (max-width: 620px) {
      .container { margin: 0; border-radius: 0; width: 100%; max-width: 100%; box-shadow: none; }
      .header { padding: 30px 20px; }
      .body { padding: 24px 20px; }
      .card { padding: 16px; margin: 20px 0; }
      .card-row { flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 0; }
      .card-label { font-size: 11px; margin-bottom: 2px; }
      .btn { display: block; text-align: center; width: auto; }
    }
  </style>
`;

const sendBookingConfirmation = async({ to, name, appointment }) => {
    const { booking_reference, appointment_date, appointment_time, centre_name, centre_address, service_name, device_brand, device_model } = appointment;

    const html = `
    <!DOCTYPE html><html><head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SUREFIX</h1>
          <p>Electronic Repair Appointment System</p>
        </div>
        <div class="body">
          <div class="greeting">Hello, ${name}! 👋</div>
          <p class="text">Your repair appointment has been <strong>successfully booked</strong>. Here are your appointment details:</p>
          <div class="card">
            <div class="card-row"><span class="card-label">Reference</span><span class="card-value"><span class="badge">${booking_reference}</span></span></div>
            <div class="card-row"><span class="card-label">Date</span><span class="card-value">${formatDate(appointment_date)}</span></div>
            <div class="card-row"><span class="card-label">Time</span><span class="card-value">${formatTime(appointment_time)}</span></div>
            <div class="card-row"><span class="card-label">Repair Centre</span><span class="card-value">${centre_name}</span></div>
            <div class="card-row"><span class="card-label">Address</span><span class="card-value">${centre_address}</span></div>
            <div class="card-row"><span class="card-label">Service</span><span class="card-value">${service_name}</span></div>
            <div class="card-row"><span class="card-label">Device</span><span class="card-value">${device_brand} ${device_model}</span></div>
          </div>
          <p class="text">Please arrive 5–10 minutes before your scheduled time. Bring your device and this reference number.</p>
          <p class="text">Need to cancel or reschedule? Log into your SureFix dashboard anytime.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} SureFix. All rights reserved. | This is an automated email.</p></div>
      </div>
    </body></html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SureFix <noreply@surefix.com>',
        to,
        subject: `✅ Appointment Confirmed — Ref: ${booking_reference}`,
        html,
    });
};

const sendCancellationEmail = async({ to, name, appointment }) => {
    const { booking_reference, appointment_date, appointment_time, centre_name } = appointment;

    const html = `
    <!DOCTYPE html><html><head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SUREFIX</h1>
          <p>Electronic Repair Appointment System</p>
        </div>
        <div class="body">
          <div class="greeting">Hello, ${name}</div>
          <p class="text">Your appointment has been <strong>cancelled</strong> as requested.</p>
          <div class="card">
            <div class="card-row"><span class="card-label">Reference</span><span class="card-value">${booking_reference}</span></div>
            <div class="card-row"><span class="card-label">Date</span><span class="card-value">${formatDate(appointment_date)}</span></div>
            <div class="card-row"><span class="card-label">Time</span><span class="card-value">${formatTime(appointment_time)}</span></div>
            <div class="card-row"><span class="card-label">Centre</span><span class="card-value">${centre_name}</span></div>
          </div>
          <p class="text">You can book a new appointment anytime via your SureFix dashboard.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} SureFix. All rights reserved.</p></div>
      </div>
    </body></html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SureFix <noreply@surefix.com>',
        to,
        subject: `Appointment Cancelled — Ref: ${booking_reference}`,
        html,
    });
};

const sendVerificationEmail = async({ to, name, token }) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
    <!DOCTYPE html><html><head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SUREFIX</h1>
          <p>Electronic Repair Appointment System</p>
        </div>
        <div class="body">
          <div class="greeting">Welcome to SureFix, ${name}! 🎉</div>
          <p class="text">Thank you for registering. Please verify your email address to activate your account.</p>
          <div style="text-align:center; margin: 32px 0;">
            <a href="${verifyUrl}" class="btn">Verify My Email</a>
          </div>
          <p class="text" style="font-size:13px; color:#718096;">If the button doesn't work, copy and paste this link: <br/>${verifyUrl}</p>
          <p class="text" style="font-size:12px; color:#a0aec0;">This link expires in 24 hours.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} SureFix. All rights reserved.</p></div>
      </div>
    </body></html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SureFix <noreply@surefix.com>',
        to,
        subject: 'Verify your SureFix account',
        html,
    });
};

const sendPasswordResetEmail = async({ to, name, token }) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
    <!DOCTYPE html><html><head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header"><h1>SUREFIX</h1><p>Password Reset</p></div>
        <div class="body">
          <div class="greeting">Hello, ${name}</div>
          <p class="text">You requested a password reset. Click the button below to set a new password. This link is valid for 1 hour.</p>
          <div style="text-align:center; margin: 32px 0;">
            <a href="${resetUrl}" class="btn">Reset Your Password</a>
          </div>
          <p class="text" style="font-size:12px; color:#a0aec0;">If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} SureFix. All rights reserved.</p></div>
      </div>
    </body></html>
  `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SureFix <noreply@surefix.com>',
        to,
        subject: 'Your SureFix Password Reset Link',
        html,
    });
};

module.exports = { sendBookingConfirmation, sendCancellationEmail, sendVerificationEmail, sendPasswordResetEmail };