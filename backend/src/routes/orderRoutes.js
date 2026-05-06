const router = require('express').Router();
const { createOrder, verifyPayment, getMyOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.post('/', protect, validate(schemas.createOrder), createOrder);
router.post('/validate-coupon', protect, (req, res) => {
  const COUPONS = { 'AURA10': 0.10, 'SHRINI15': 0.15, 'WELCOME20': 0.20 };
  const code = req.body.code?.toUpperCase();
  const rate = COUPONS[code];
  if (!rate) return res.status(400).json({ message: 'Invalid coupon code' });
  res.json({ code, discount: rate * 100, message: `${rate * 100}% discount applied!` });
});
router.post('/:id/verify-payment', protect, verifyPayment);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
