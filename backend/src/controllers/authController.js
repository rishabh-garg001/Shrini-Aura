const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtp } = require('../services/emailService');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
  };
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const sendTokens = (res, accessToken, refreshToken, data) => {
  setCookies(res, accessToken, refreshToken);
  // Also send tokens in response body for cross-domain production use
  return { ...data, accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Delete any existing unverified account with this email
    await User.deleteOne({ email, isVerified: false });

    if (await User.findOne({ email, isVerified: true })) 
      return res.status(400).json({ message: 'Email already registered' });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.create({ name, email, password, emailOtp: otp, emailOtpExpiry: otpExpiry });
    await sendOtp(email, otp, 'verify').catch(err => console.error('OTP email failed:', err.message));
    res.status(201).json({ message: 'OTP sent to your email. Please verify.', email });
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    if (!user.emailOtp || user.emailOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.emailOtpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired. Please register again.' });
    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { isVerified: true, emailOtp: '', emailOtpExpiry: null, refreshToken });
    setCookies(res, accessToken, refreshToken);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    const otp = generateOtp();
    await User.findByIdAndUpdate(user._id, { emailOtp: otp, emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOtp(email, otp, 'verify').catch(err => console.error('OTP email failed:', err.message));
    res.json({ message: 'OTP resent successfully' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const otp = generateOtp();
    await User.findByIdAndUpdate(user._id, { resetOtp: otp, resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOtp(email, otp, 'reset').catch(err => console.error('Reset OTP email failed:', err.message));
    res.json({ message: 'OTP sent to your email', email });
  } catch (err) { next(err); }
};

exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.resetOtpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired. Please try again.' });
    res.json({ message: 'OTP verified', email });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.resetOtp || user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.resetOtpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired' });
    user.password = newPassword;
    user.resetOtp = '';
    user.resetOtpExpiry = null;
    await user.save();
    res.json({ message: 'Password reset successfully. Please login.' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first', email, needsVerification: true });
    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setCookies(res, accessToken, refreshToken);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'strict' };
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    // Accept token from cookie OR request body (for cross-domain production)
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) return res.status(401).json({ message: 'Invalid refresh token' });
    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });
    setCookies(res, accessToken, refreshToken);
    res.json({ message: 'Token refreshed', accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
