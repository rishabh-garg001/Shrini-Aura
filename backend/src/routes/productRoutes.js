const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeatured, getSearchSuggestions } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
// const { upload } = require('../config/cloudinary');
const { validate, schemas } = require('../validators');
const streamifier = require("streamifier");
const { cloudinary, upload } = require("../config/cloudinary");
router.get('/featured', getFeatured);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post(
  "/upload-image",
  protect,
  adminOnly,
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadToCloudinary = (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "shrini_aura/products",
              transformation: [
                {
                  width: 800,
                  height: 800,
                  crop: "limit",
                  quality: "auto",
                },
              ],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });

      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file))
      );

      res.json(uploadedImages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);
// router.post(
//   '/upload-image',
//   protect,
//   adminOnly,
//   upload.array('images', 5),
//   (req, res) => {
//     if (!req.files?.length) {
//       return res
//         .status(400)
//         .json({ message: 'No file uploaded' });
//     }

//     const uploadedImages = req.files.map((file) => ({
//       url: file.path,
//       public_id: file.filename,
//     }));

//     res.json(uploadedImages);
//   }
// );
// router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, validate(schemas.review), addReview);

module.exports = router;
