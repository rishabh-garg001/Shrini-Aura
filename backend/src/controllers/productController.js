const Product = require('../models/Product');

// @GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (category) query.category = category.includes(',') ? { $in: category.split(',') } : category;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };

    const sortMap = { newest: '-createdAt', popular: '-soldCount', rating: '-rating', 'price-asc': 'price', 'price-desc': '-price' };
    const sortBy = sortMap[sort] || '-createdAt';

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// @GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

// @POST /api/products (admin)


exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create({
      ...req.body,

      // use images coming from frontend JSON
      images: req.body.images || [],

      ingredients:
        typeof req.body.ingredients === 'string'
          ? req.body.ingredients
              .split(',')
              .map((i) => i.trim())
          : req.body.ingredients || [],
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};
// @PUT /api/products/:id (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

// @DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

// @POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) { next(err); }
};

// @GET /api/products/featured
exports.getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
    res.json(products);
  } catch (err) { next(err); }
};

// @GET /api/products/search-suggestions
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const products = await Product.find(
      { isActive: true, $or: [{ name: { $regex: q, $options: 'i' } }, { scent: { $regex: q, $options: 'i' } }] },
      'name category images'
    ).limit(5);
    res.json(products);
  } catch (err) { next(err); }
};
