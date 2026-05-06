const router = require('express').Router();
const { getProfile, updateProfile, updatePassword, toggleWishlist, getWishlist, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/wishlist', protect, getWishlist);
router.put('/wishlist/:productId', protect, toggleWishlist);
router.get('/', protect, adminOnly, getAllUsers);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
