const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');

// Initialize lazily so env vars are available at request time
const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/orders
const COUPONS = { 'AURA10': 0.10, 'SHRINI15': 0.15, 'WELCOME20': 0.20 };

exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${product?.name}` });
      itemsPrice += (product.discountPrice || product.price) * item.quantity;
    }

    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const rate = COUPONS[couponCode.toUpperCase()];
      if (!rate) return res.status(400).json({ message: 'Invalid coupon code' });
      discount = Math.round(itemsPrice * rate);
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round((itemsPrice - discount) * 0.18);
    const totalPrice = itemsPrice - discount + shippingPrice + taxPrice;

    const razorpayOrder = await getRazorpay().orders.create({
      amount: totalPrice * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discount,
      shippingPrice,
      taxPrice,
      totalPrice,
      couponCode: couponCode?.toUpperCase() || '',
      'paymentResult.razorpay_order_id': razorpayOrder.id,
    });

    res.status(201).json({ order, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { next(err); }
};

// @POST /api/orders/:id/verify-payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');

    if (expectedSign !== razorpay_signature) return res.status(400).json({ message: 'Payment verification failed' });

    const order = await Order.findOneAndUpdate(
      { 'paymentResult.razorpay_order_id': razorpay_order_id },
      { isPaid: true, paidAt: Date.now(), orderStatus: 'Processing', 'paymentResult.razorpay_payment_id': razorpay_payment_id, 'paymentResult.razorpay_signature': razorpay_signature, 'paymentResult.status': 'paid' },
      { new: true }
    ).populate('user', 'name email');

    // Deduct stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    // Send email — non-blocking, don't fail the order if email fails
    sendOrderConfirmation(order.user.email, order).catch(err =>
      console.error('Email send failed:', err.message)
    );
    res.json({ message: 'Payment verified', order });
  } catch (err) { next(err); }
};

// @GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('orderItems.product', 'name images');
    res.json(orders);
  } catch (err) { next(err); }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) { next(err); }
};

// @GET /api/admin/orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { orderStatus: status } : {};
    const orders = await Order.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).populate('user', 'name email');
    const total = await Order.countDocuments(query);
    res.json({ orders, total });
  } catch (err) { next(err); }
};

// @PUT /api/admin/orders/:id (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus, ...(trackingNumber && { trackingNumber }), ...(orderStatus === 'Delivered' && { deliveredAt: Date.now() }) }, { new: true }).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    sendOrderStatusUpdate(order.user.email, order).catch(err => console.error('Status email failed:', err.message));
    res.json(order);
  } catch (err) { next(err); }
};

// @PUT /api/orders/:id/cancel (user)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (!['Pending', 'Processing'].includes(order.orderStatus)) return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ message: 'Please provide a cancellation reason' });
    order.orderStatus = 'Cancelled';
    order.cancelReason = reason.trim();
    await order.save();
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }
    res.json({ message: 'Order cancelled', order });
  } catch (err) { next(err); }
};
