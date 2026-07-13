// require('dotenv').config();
// const mongoose = require('mongoose');
// const Product = require('./src/models/Product');

// const updates = [
//   { slug: 'rose-garden-bliss', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233707.png' },
//   { slug: 'lavender-serenity', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233759.png' },
//   { slug: 'vanilla-velvet-dreams', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233826.png' },
//   { slug: 'spiced-vanilla-noir', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233729.png' },
//   { slug: 'diwali-glow', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/image.png?updatedAt=1778350220560' },
//   { slug: 'winter-solstice', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223157.png?updatedAt=1778349753499' },
//   { slug: 'ocean-mist', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223115.png?updatedAt=1778349753063' },
//   { slug: 'coastal-sunrise', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223048.png?updatedAt=1778349751774' },
//   { slug: 'gold-oud-royale', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233907.png' },
//   { slug: 'velvet-noir-luxe', url: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233707.png' },
// ];

// const run = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('Connected to MongoDB');
//     for (const u of updates) {
//       await Product.updateOne({ slug: u.slug }, { images: [{ url: u.url, public_id: u.slug }] });
//       console.log('✅ Updated:', u.slug);
//     }
//     process.exit(0);
//   } catch (err) {
//     console.error('Error:', err.message);
//     process.exit(1);
//   }
// };

// run();
