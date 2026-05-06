require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const products = [
  {
    name: 'Rose Garden Bliss',
    description: 'Immerse yourself in the delicate fragrance of fresh roses and jasmine. Hand-poured with 100% soy wax, this candle creates a romantic, floral ambiance perfect for evenings.',
    shortDescription: 'Fresh roses & jasmine — pure romance in a jar.',
    price: 799,
    discountPrice: 649,
    category: 'Floral Bliss',
    stock: 50,
    weight: '200g',
    burnTime: '40-45 hours',
    scent: 'Rose, Jasmine, Peony',
    ingredients: ['Soy Wax', 'Rose Essential Oil', 'Jasmine Absolute', 'Cotton Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800', public_id: 'rose_garden' }],
    rating: 4.8, numReviews: 24,
  },
  {
    name: 'Lavender Serenity',
    description: 'A calming blend of French lavender and chamomile that soothes the mind and body. Perfect for meditation, yoga, or winding down after a long day.',
    shortDescription: 'Lavender & chamomile for ultimate calm.',
    price: 749,
    discountPrice: 599,
    category: 'Floral Bliss',
    stock: 40,
    weight: '180g',
    burnTime: '35-40 hours',
    scent: 'Lavender, Chamomile, Eucalyptus',
    ingredients: ['Soy Wax', 'Lavender Essential Oil', 'Chamomile Extract', 'Cotton Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1608181831718-c9fca6b0f0e5?w=800', public_id: 'lavender' }],
    rating: 4.9, numReviews: 31,
  },
  {
    name: 'Vanilla Velvet Dreams',
    description: 'Rich, warm vanilla bean blended with hints of sandalwood and caramel. This indulgent scent wraps you in comfort like a cashmere blanket on a winter evening.',
    shortDescription: 'Warm vanilla & sandalwood — pure indulgence.',
    price: 849,
    discountPrice: 699,
    category: 'Vanilla Dreams',
    stock: 60,
    weight: '220g',
    burnTime: '45-50 hours',
    scent: 'Vanilla Bean, Sandalwood, Caramel',
    ingredients: ['Coconut Wax', 'Vanilla Absolute', 'Sandalwood Oil', 'Cotton Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800', public_id: 'vanilla' }],
    rating: 4.7, numReviews: 18,
  },
  {
    name: 'Spiced Vanilla Noir',
    description: 'A bold, mysterious blend of dark vanilla, black pepper, and amber resin. This sophisticated scent is perfect for creating an intimate, luxurious atmosphere.',
    shortDescription: 'Dark vanilla & black pepper — bold & mysterious.',
    price: 899,
    category: 'Vanilla Dreams',
    stock: 35,
    weight: '200g',
    burnTime: '40-45 hours',
    scent: 'Dark Vanilla, Black Pepper, Amber',
    ingredients: ['Soy Wax', 'Vanilla Absolute', 'Black Pepper EO', 'Amber Resin'],
    isFeatured: false,
    images: [{ url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800', public_id: 'vanilla_noir' }],
    rating: 4.6, numReviews: 12,
  },
  {
    name: 'Diwali Glow',
    description: 'Celebrate the festival of lights with this vibrant blend of marigold, saffron, and warm spices. Inspired by the joy and warmth of Diwali celebrations.',
    shortDescription: 'Marigold, saffron & spices — festive magic.',
    price: 999,
    discountPrice: 849,
    category: 'Festive Lights',
    stock: 80,
    weight: '250g',
    burnTime: '50-55 hours',
    scent: 'Marigold, Saffron, Cinnamon, Clove',
    ingredients: ['Soy Wax', 'Marigold Extract', 'Saffron Oil', 'Cinnamon EO', 'Cotton Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800', public_id: 'diwali' }],
    rating: 4.9, numReviews: 45,
  },
  {
    name: 'Winter Solstice',
    description: 'Embrace the magic of winter with pine needles, cinnamon sticks, and a hint of orange peel. This festive candle fills your home with the warmth of the holiday season.',
    shortDescription: 'Pine, cinnamon & orange — holiday warmth.',
    price: 949,
    category: 'Festive Lights',
    stock: 55,
    weight: '230g',
    burnTime: '45-50 hours',
    scent: 'Pine, Cinnamon, Orange Peel, Clove',
    ingredients: ['Beeswax Blend', 'Pine EO', 'Cinnamon EO', 'Orange EO'],
    isFeatured: false,
    images: [{ url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800', public_id: 'winter' }],
    rating: 4.7, numReviews: 22,
  },
  {
    name: 'Ocean Mist',
    description: 'Close your eyes and feel the sea breeze with this fresh blend of sea salt, driftwood, and aquatic notes. A refreshing escape to the coast, anytime.',
    shortDescription: 'Sea salt & driftwood — coastal escape.',
    price: 799,
    discountPrice: 649,
    category: 'Ocean Breeze',
    stock: 45,
    weight: '200g',
    burnTime: '40-45 hours',
    scent: 'Sea Salt, Driftwood, Aquatic, Coconut',
    ingredients: ['Soy Wax', 'Sea Salt Fragrance', 'Driftwood EO', 'Cotton Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', public_id: 'ocean' }],
    rating: 4.8, numReviews: 29,
  },
  {
    name: 'Coastal Sunrise',
    description: 'Wake up to the freshness of a coastal morning with bergamot, white tea, and a gentle ocean breeze. Light and uplifting for any time of day.',
    shortDescription: 'Bergamot & white tea — fresh morning vibes.',
    price: 849,
    category: 'Ocean Breeze',
    stock: 38,
    weight: '190g',
    burnTime: '38-42 hours',
    scent: 'Bergamot, White Tea, Ocean Breeze',
    ingredients: ['Soy Wax', 'Bergamot EO', 'White Tea Extract', 'Cotton Wick'],
    isFeatured: false,
    images: [{ url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', public_id: 'coastal' }],
    rating: 4.5, numReviews: 16,
  },
  {
    name: 'Gold Oud Royale',
    description: 'The pinnacle of luxury — rare oud wood, Bulgarian rose, and 24k gold flakes suspended in premium coconut wax. A statement piece for the most discerning connoisseur.',
    shortDescription: 'Rare oud & Bulgarian rose — ultimate luxury.',
    price: 2499,
    discountPrice: 1999,
    category: 'Luxury Gold Collection',
    stock: 20,
    weight: '300g',
    burnTime: '60-70 hours',
    scent: 'Oud Wood, Bulgarian Rose, Amber, Musk',
    ingredients: ['Premium Coconut Wax', 'Oud EO', 'Bulgarian Rose Absolute', '24k Gold Flakes', 'Wooden Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800', public_id: 'gold_oud' }],
    rating: 5.0, numReviews: 8,
  },
  {
    name: 'Velvet Noir Luxe',
    description: 'A sophisticated blend of black orchid, dark musk, and aged cedarwood in a hand-crafted obsidian vessel. The ultimate expression of modern luxury.',
    shortDescription: 'Black orchid & dark musk — sophisticated elegance.',
    price: 2999,
    category: 'Luxury Gold Collection',
    stock: 15,
    weight: '350g',
    burnTime: '70-80 hours',
    scent: 'Black Orchid, Dark Musk, Cedarwood, Vetiver',
    ingredients: ['Premium Soy Blend', 'Black Orchid Absolute', 'Cedarwood EO', 'Wooden Wick'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800', public_id: 'velvet_noir' }],
    rating: 4.9, numReviews: 6,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Product.deleteMany();

    // Create admin
    await User.create({ name: 'Admin', email: 'admin@shriniaura.com', password: 'Admin@123', role: 'admin', isVerified: true });
    // Create test user
    await User.create({ name: 'Test User', email: 'user@shriniaura.com', password: 'User@123', role: 'user', isVerified: true });

    await Product.insertMany(products);

    console.log('✅ Seed complete: 2 users + 10 products created');
    console.log('Admin: admin@shriniaura.com / Admin@123');
    console.log('User:  user@shriniaura.com / User@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
