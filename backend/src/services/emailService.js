const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: Number(process.env.EMAIL_PORT) === 465, // 587 => false, 465 => true
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   connectionTimeout: 15000,
//   greetingTimeout: 15000,
//   socketTimeout: 15000,
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 ke liye false
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});
// SMTP check on server start
transporter
  .verify()
  .then(() => {
    console.log('✅ Email server ready');
    console.log({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      passLoaded: !!process.env.EMAIL_PASS,
    });
  })
  .catch((err) => {
    console.error('❌ Email config failed:', err);
  });

exports.transporter = transporter;
const dns = require("dns");

dns.lookup("smtp.gmail.com", (err, address) => {
  console.log("DNS TEST:", err || address);
});
exports.sendOtp = async (
  email,
  otp,
  type = 'verify'
) => {
  const subject =
    type === 'verify'
      ? 'Verify Your Email — ShriniAura'
      : 'Reset Your Password — ShriniAura';

  const heading =
    type === 'verify'
      ? 'Verify Your Email 🕯️'
      : 'Reset Your Password 🔑';

  const message =
    type === 'verify'
      ? 'Use the OTP below to verify your email address. It expires in 10 minutes.'
      : 'Use the OTP below to reset your password. It expires in 10 minutes.';

  return await transporter.sendMail({
    from: `"ShriniAura Candles" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#faf7f2;border-radius:16px">
        <h2 style="color:#c9a96e;font-family:Georgia,serif">${heading}</h2>
        <p style="color:#444">${message}</p>
        <div style="background:#111;color:#c9a96e;font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:24px;border-radius:12px;margin:24px 0">${otp}</div>
        <p style="color:#888;font-size:12px">OTP expires in 10 minutes.</p>
        <p style="color:#c9a96e">— ShriniAura Candles Team</p>
      </div>
    `,
  });
};

exports.sendOrderConfirmation =
  async (email, order) => {
    const itemsHtml =
      order.orderItems
        .map(
          (i) =>
            `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td></tr>`
        )
        .join('');

    return await transporter.sendMail(
      {
        from: `"ShriniAura Candles" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmed #${order._id}`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#c9a96e">Thank you for your order! 🕯️</h2>
          <p>Your order <strong>#${order._id}</strong> has been confirmed.</p>
          <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
            ${itemsHtml}
          </table>
          <p><strong>Total: ₹${order.totalPrice}</strong></p>
          <p>We'll notify you when your order ships.</p>
        </div>
      `,
      }
    );
  };

exports.sendOrderStatusUpdate =
  async (email, order) => {
    const statusMessages = {
      Shipped:
        'Your order is on its way! 🚚',
      Delivered:
        'Your order has been delivered! 🎉',
      Cancelled:
        'Your order has been cancelled.',
    };

    const msg =
      statusMessages[
        order.orderStatus
      ];

    if (!msg) return;

    return await transporter.sendMail(
      {
        from: `"ShriniAura Candles" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order ${order.orderStatus} - #${order._id}`,
        html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#c9a96e">${msg}</h2>
          <p>Order ID: <strong>#${order._id}</strong></p>
          ${
            order.trackingNumber
              ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong></p>`
              : ''
          }
        </div>
      `,
      }
    );
  };