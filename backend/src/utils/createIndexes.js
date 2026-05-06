const mongoose = require('mongoose');

// Run once after DB connects to ensure indexes exist
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    // Products: text search index
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1, isActive: 1 });
    await db.collection('products').createIndex({ isFeatured: 1, isActive: 1 });
    await db.collection('products').createIndex({ price: 1 });
    // Orders
    await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ 'paymentResult.razorpay_order_id': 1 });
    // Users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ DB indexes ensured');
  } catch (err) {
    console.error('Index creation error:', err.message);
  }
};

module.exports = createIndexes;
