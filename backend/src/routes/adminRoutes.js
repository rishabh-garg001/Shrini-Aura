const router = require('express').Router();
const { getDashboard, getUserDetails } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users/:id', protect, adminOnly, getUserDetails);

module.exports = router;
