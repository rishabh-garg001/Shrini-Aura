const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const orders = await Order.find({ user: req.params.id }).sort('-createdAt');
    const totalSpent = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.isPaid).length;

    res.json({ user, orders, totalSpent, totalOrders, paidOrders });
  } catch (err) { next(err); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueData] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly sales for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category sales
    const categorySales = await Order.aggregate([
      { $match: { isPaid: true } },
      { $unwind: '$orderItems' },
      { $lookup: { from: 'products', localField: 'orderItems.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', total: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
    ]);

    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user', 'name email');

    res.json({ totalOrders, totalUsers, totalProducts, totalRevenue, monthlySales, categorySales, recentOrders });
  } catch (err) { next(err); }
};
