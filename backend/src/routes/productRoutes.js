const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeatured, getSearchSuggestions } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { validate, schemas } = require('../validators');

router.get('/featured', getFeatured);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/upload-image', protect, adminOnly, upload.array('images', 1), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.files[0].path, public_id: req.files[0].filename });
});
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, validate(schemas.review), addReview);

module.exports = router;
