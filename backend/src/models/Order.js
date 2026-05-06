const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true },
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
  },
  paymentMethod: { type: String, default: 'razorpay' },
  paymentResult: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: String,
  },
  itemsPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveredAt: Date,
  trackingNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
