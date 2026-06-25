const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendInviteEmail({ to, name, token }) {
  const link    = `${process.env.CLIENT_URL}/invite/${token}`;
  const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  await transporter.sendMail({
    from:    `"Yangon Nation" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Yangon Nation — Your Re-registration Invite',
    html: `
      <div style="background:#1A1A1A;padding:48px;font-family:sans-serif;color:#fff;max-width:600px;margin:0 auto;">
        <p style="font-size:10px;letter-spacing:0.3em;color:#C8A84B;text-transform:uppercase;margin:0;">AutoCult</p>
        <h1 style="font-size:36px;font-weight:900;letter-spacing:0.06em;color:#fff;margin:8px 0 0;">YANGON <span style="color:#C8A84B;">NATION</span></h1>
        <hr style="border:none;border-top:1px solid #333;margin:28px 0;">
        <h2 style="color:#fff;font-size:22px;">Welcome back, ${name}.</h2>
        <p style="color:rgba(255,255,255,0.55);line-height:1.75;margin:16px 0 28px;">
          You have been personally invited to complete your Yangon Nation re-registration.
          Your invite link is unique to you — do not share it.
        </p>
        <a href="${link}" style="display:inline-block;padding:14px 32px;background:#C8A84B;color:#1A1A1A;font-weight:700;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:3px;">Re-register Now →</a>
        <p style="color:rgba(255,255,255,0.25);font-size:11px;margin-top:24px;">Link expires: ${expires}. Single-use only.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="color:#333;font-size:10px;letter-spacing:0.15em;text-align:center;">YANGON NATION &bull; AUTOCULT &bull; 2025</p>
      </div>
    `,
  });
}

async function sendConfirmationEmail({ to, name }) {
  await transporter.sendMail({
    from:    `"Yangon Nation" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Yangon Nation — Registration Received',
    html: `
      <div style="background:#1A1A1A;padding:48px;font-family:sans-serif;color:#fff;max-width:600px;margin:0 auto;">
        <p style="font-size:10px;letter-spacing:0.3em;color:#C8A84B;text-transform:uppercase;margin:0;">AutoCult</p>
        <h1 style="font-size:36px;font-weight:900;letter-spacing:0.06em;color:#fff;margin:8px 0 0;">YANGON <span style="color:#C8A84B;">NATION</span></h1>
        <hr style="border:none;border-top:1px solid #333;margin:28px 0;">
        <h2 style="color:#fff;font-size:22px;">Thank you, ${name}.</h2>
        <p style="color:rgba(255,255,255,0.55);line-height:1.75;">
          Your registration has been received and is currently under review.
          Our admin team will contact you once your application has been processed.
        </p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="color:#333;font-size:10px;letter-spacing:0.15em;text-align:center;">YANGON NATION &bull; AUTOCULT &bull; 2025</p>
      </div>
    `,
  });
}

module.exports = { sendInviteEmail, sendConfirmationEmail };
