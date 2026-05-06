const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendOrderConfirmation = async (email, order) => {
  const itemsHtml = order.orderItems.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td></tr>`).join('');
  await transporter.sendMail({
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
        <p style="color:#c9a96e">— ShriniAura Candles Team</p>
      </div>
    `,
  });
};

exports.sendOrderStatusUpdate = async (email, order) => {
  const statusMessages = {
    Shipped: `Your order is on its way! 🚚`,
    Delivered: `Your order has been delivered! 🎉`,
    Cancelled: `Your order has been cancelled.`,
  };
  const msg = statusMessages[order.orderStatus];
  if (!msg) return;
  await transporter.sendMail({
    from: `"ShriniAura Candles" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order ${order.orderStatus} - #${order._id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#c9a96e">${msg}</h2>
        <p>Order ID: <strong>#${order._id}</strong></p>
        ${order.trackingNumber ? `<p>Tracking Number: <strong>${order.trackingNumber}</strong></p>` : ''}
        <p style="color:#c9a96e">— ShriniAura Candles Team</p>
      </div>
    `,
  });
};
