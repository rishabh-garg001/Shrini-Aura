const User = require('../models/User');
const Product = require('../models/Product');

exports.getProfile = async (req, res) => res.json(req.user);

exports.saveCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const cartItems = items.map(i => ({ product: i._id, quantity: i.quantity }));
    await User.findByIdAndUpdate(req.user._id, { cart: cartItems });
    res.json({ message: 'Cart saved' });
  } catch (err) { next(err); }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    const items = user.cart
      .filter(c => c.product)
      .map(c => ({ ...c.product.toObject(), quantity: c.quantity }));
    res.json(items);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, addresses }, { new: true, runValidators: true }).select('-password -refreshToken');
    res.json(user);
  } catch (err) { next(err); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.indexOf(productId);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) { next(err); }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (err) { next(err); }
};

// Admin - only show verified users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isVerified: true }).select('-password -refreshToken').sort('-createdAt');
    res.json(users);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};
