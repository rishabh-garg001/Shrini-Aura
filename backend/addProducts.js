require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// const products = [
//   {
//     name: 'Couple Candle',
//     slug: 'couple-candle',
//     description: 'A beautifully crafted candle set designed for two — perfect for romantic evenings, anniversaries, and special moments shared together. Hand-poured with premium soy wax and infused with a warm rose and sandalwood fragrance that sets the mood for love.',
//     shortDescription: 'Romantic candle set for two — perfect for special moments.',
//     price: 899, discountPrice: 749, category: 'Floral Bliss', stock: 40,
//     weight: '200g', burnTime: '40-45 hours', scent: 'Rose, Sandalwood, Musk',
//     ingredients: ['Soy Wax', 'Rose Essential Oil', 'Sandalwood Oil', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223157.png?updatedAt=1778349753499', public_id: 'couple_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220705.png', public_id: 'couple_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220716.png', public_id: 'couple_3' },
//     ],
//     rating: 4.9, numReviews: 32,
//   },
//   {
//     name: 'Donut Candle',
//     slug: 'donut-candle',
//     description: 'A fun and quirky donut-shaped candle that looks good enough to eat! Made with premium wax and a sweet vanilla-caramel fragrance, this novelty candle is perfect as a gift or a playful addition to any room decor.',
//     shortDescription: 'Sweet donut-shaped candle with vanilla-caramel fragrance.',
//     price: 649, discountPrice: 549, category: 'Vanilla Dreams', stock: 55,
//     weight: '150g', burnTime: '30-35 hours', scent: 'Vanilla, Caramel, Sugar',
//     ingredients: ['Paraffin Wax', 'Vanilla Fragrance', 'Caramel Oil', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220829.png', public_id: 'donut_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220843.png', public_id: 'donut_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223115.png?updatedAt=1778349753063', public_id: 'donut_3' },
//     ],
//     rating: 4.7, numReviews: 28,
//   },
//   {
//     name: 'Teddy Cake Candle',
//     slug: 'teddy-cake-candle',
//     description: 'An adorable teddy bear sitting atop a birthday cake candle — the perfect gift for birthdays, baby showers, and celebrations. Crafted with love using natural soy wax and a sweet birthday cake fragrance that fills the room with joy.',
//     shortDescription: 'Adorable teddy on a cake — perfect birthday gift candle.',
//     price: 799, discountPrice: 649, category: 'Festive Lights', stock: 45,
//     weight: '180g', burnTime: '35-40 hours', scent: 'Birthday Cake, Vanilla, Butter',
//     ingredients: ['Soy Wax', 'Cake Fragrance Oil', 'Vanilla Absolute', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220913.png', public_id: 'teddy_cake_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220903.png', public_id: 'teddy_cake_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223048.png?updatedAt=1778349751774', public_id: 'teddy_cake_3' },
//     ],
//     rating: 4.8, numReviews: 41,
//   },
//   {
//     name: 'Ladoo Sweets Candle',
//     slug: 'ladoo-sweets-candle',
//     description: 'Inspired by the beloved Indian sweet, this Ladoo candle captures the warm, festive essence of celebrations. Crafted to resemble traditional ladoos, it carries a rich saffron and cardamom fragrance that evokes memories of festivals and family gatherings.',
//     shortDescription: 'Festive ladoo-shaped candle with saffron & cardamom scent.',
//     price: 749, discountPrice: 599, category: 'Festive Lights', stock: 60,
//     weight: '160g', burnTime: '30-35 hours', scent: 'Saffron, Cardamom, Ghee',
//     ingredients: ['Soy Wax', 'Saffron Oil', 'Cardamom EO', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233907.png?updatedAt=1778350701588', public_id: 'ladoo_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221009.png', public_id: 'ladoo_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221000.png', public_id: 'ladoo_3' },
//     ],
//     rating: 4.8, numReviews: 37,
//   },
//   {
//     name: 'Red Wine Candle',
//     slug: 'red-wine-candle',
//     description: 'Elegantly crafted to resemble a glass of red wine, this candle is a sophisticated addition to any space. Infused with deep notes of dark berries, oak, and a hint of musk, it creates a warm, luxurious ambiance perfect for evenings of relaxation.',
//     shortDescription: 'Elegant red wine glass candle with dark berry & oak scent.',
//     price: 999, discountPrice: 849, category: 'Luxury Gold Collection', stock: 30,
//     weight: '220g', burnTime: '45-50 hours', scent: 'Dark Berry, Oak, Musk',
//     ingredients: ['Coconut Wax', 'Berry Fragrance', 'Oak EO', 'Wooden Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233707.png?updatedAt=1778350486377', public_id: 'red_wine_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220559.png', public_id: 'red_wine_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220610.png', public_id: 'red_wine_3' },
//     ],
//     rating: 4.9, numReviews: 19,
//   },
//   {
//     name: 'Teddy Candle',
//     slug: 'teddy-candle',
//     description: 'A charming teddy bear candle that melts hearts before it melts wax! Handcrafted with soft soy wax and a gentle lavender-vanilla fragrance, this adorable candle makes the perfect gift for loved ones of all ages.',
//     shortDescription: 'Charming teddy bear candle with lavender-vanilla fragrance.',
//     price: 699, discountPrice: 579, category: 'Floral Bliss', stock: 50,
//     weight: '170g', burnTime: '35-40 hours', scent: 'Lavender, Vanilla, Chamomile',
//     ingredients: ['Soy Wax', 'Lavender EO', 'Vanilla Absolute', 'Cotton Wick'],
//     isFeatured: false, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233759.png?updatedAt=1778350484345', public_id: 'teddy_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221118.png', public_id: 'teddy_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221042.png', public_id: 'teddy_3' },
//     ],
//     rating: 4.7, numReviews: 24,
//   },
//   {
//     name: 'Glass Jar Candles',
//     slug: 'glass-jar-candles',
//     description: 'Premium hand-poured candles in elegant glass jars — a timeless classic for every home. Available in a variety of fresh ocean and floral fragrances, these candles add a touch of sophistication to any room while filling it with a long-lasting, beautiful scent.',
//     shortDescription: 'Elegant glass jar candles with fresh ocean & floral scents.',
//     price: 849, discountPrice: 699, category: 'Ocean Breeze', stock: 65,
//     weight: '250g', burnTime: '50-55 hours', scent: 'Sea Salt, Jasmine, Driftwood',
//     ingredients: ['Soy Wax', 'Sea Salt Fragrance', 'Jasmine Absolute', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221426.png', public_id: 'glass_jar_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221414.png', public_id: 'glass_jar_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221521.png', public_id: 'glass_jar_3' },
//     ],
//     rating: 4.8, numReviews: 45,
//   },
//   {
//     name: 'White Wine Candle',
//     slug: 'white-wine-candle',
//     description: 'A crisp and refreshing candle inspired by a chilled glass of white wine. Crafted with premium coconut wax and infused with notes of citrus, white peach, and a hint of floral, this candle brings a light, airy elegance to any space.',
//     shortDescription: 'Crisp white wine candle with citrus, peach & floral notes.',
//     price: 999, discountPrice: 849, category: 'Luxury Gold Collection', stock: 28,
//     weight: '220g', burnTime: '45-50 hours', scent: 'Citrus, White Peach, Floral',
//     ingredients: ['Coconut Wax', 'Citrus EO', 'Peach Fragrance', 'Wooden Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/image.png?updatedAt=1778350220560', public_id: 'white_wine_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220519.png', public_id: 'white_wine_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220451.png', public_id: 'white_wine_3' },
//     ],
//     rating: 4.9, numReviews: 22,
//   },
//   {
//     name: 'Tea Light Candles',
//     slug: 'tea-light-candles',
//     description: 'A set of beautifully crafted tea light candles perfect for creating a warm, cozy atmosphere. Ideal for decorating dinner tables, bathrooms, and festive occasions. Each tea light burns cleanly with a gentle, soothing fragrance that lasts for hours.',
//     shortDescription: 'Elegant tea light candles — perfect for any occasion.',
//     price: 549, discountPrice: 449, category: 'Festive Lights', stock: 100,
//     weight: '100g', burnTime: '20-25 hours', scent: 'Jasmine, Vanilla, Sandalwood',
//     ingredients: ['Soy Wax', 'Jasmine EO', 'Vanilla Fragrance', 'Cotton Wick'],
//     isFeatured: false, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221545.png', public_id: 'tea_light_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221645.png', public_id: 'tea_light_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20221623.png', public_id: 'tea_light_3' },
//     ],
//     rating: 4.6, numReviews: 58,
//   },
//   {
//     name: 'Heart Shape Candle',
//     slug: 'heart-shape-candle',
//     description: 'A stunning heart-shaped candle that speaks the language of love. Handcrafted with premium soy wax and infused with a romantic blend of rose, jasmine, and ylang-ylang, this candle is the ultimate gift for Valentine\'s Day, anniversaries, or anyone you love.',
//     shortDescription: 'Romantic heart-shaped candle with rose & jasmine fragrance.',
//     price: 849, discountPrice: 699, category: 'Floral Bliss', stock: 35,
//     weight: '190g', burnTime: '40-45 hours', scent: 'Rose, Jasmine, Ylang-Ylang',
//     ingredients: ['Soy Wax', 'Rose Absolute', 'Jasmine EO', 'Ylang-Ylang Oil', 'Cotton Wick'],
//     isFeatured: true, isActive: true,
//     images: [
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220035.png', public_id: 'heart_1' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220232.png', public_id: 'heart_2' },
//       { url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-11%20220323.png', public_id: 'heart_3' },
//     ],
//     rating: 5.0, numReviews: 14,
//   },
// ];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products inserted with 3 images each`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

run();
