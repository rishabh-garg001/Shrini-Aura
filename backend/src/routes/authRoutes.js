const router = require('express').Router();
const { register, login, logout, refreshToken, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../validators');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
