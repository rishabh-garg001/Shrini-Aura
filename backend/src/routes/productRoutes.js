const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeatured, getSearchSuggestions } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { validate, schemas } = require('../validators');

router.get('/featured', getFeatured);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post(
  '/upload-image',
  protect,
  adminOnly,
  upload.array('images', 5),
  (req, res) => {
    if (!req.files?.length) {
      return res
        .status(400)
        .json({ message: 'No file uploaded' });
    }

    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    res.json(uploadedImages);
  }
);
// router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, validate(schemas.review), addReview);

module.exports = router;
