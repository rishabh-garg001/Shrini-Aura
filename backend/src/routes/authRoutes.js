const router = require('express').Router();
const { register, login, logout, refreshToken, getMe, verifyEmail, resendOtp, forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.post('/register', validate(schemas.register), register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/login', validate(schemas.login), login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
