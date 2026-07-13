const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0 },
  category: { type: String, required: true, enum: ['T-Lights', 'Urlis', 'Plant Lovers', 'Baby Shower', 'Jar Glass'] },
  images: [{ url: String, public_id: String }],
  stock: { type: Number, required: true, default: 0 },
  weight: { type: String },
  burnTime: { type: String },
  scent: { type: String },
  ingredients: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate slug
// productSchema.pre('save', function (next) {
//   if (this.isModified('name')) {
//     this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
//   }
//   next();
// });
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});
module.exports = mongoose.model('Product', productSchema);
