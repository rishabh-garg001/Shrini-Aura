// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { Heart, ShoppingCart, Eye } from 'lucide-react';
// import { useCartStore } from '../../store/cartStore';
// import { useAuthStore } from '../../store/authStore';
// import { StarRating, Badge } from '../ui';
// import api from '../../lib/api';
// import toast from 'react-hot-toast';

// export default function ProductCard({ product }) {
//   const addItem = useCartStore(s => s.addItem);
//   const { user } = useAuthStore();

//   const handleAddToCart = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     addItem(product);
//     toast.success(`${product.name} added to cart!`, {
//       icon: '🕯️',
//       style: { background: '#111', color: '#f0ece4', border: '1px solid #c9a96e33' },
//     });
//   };

//   const handleWishlist = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!user) return toast.error('Please login first');
//     try {
//       await api.put(`/users/wishlist/${product._id}`);
//       toast.success('Wishlist updated!');
//     } catch { toast.error('Failed'); }
//   };

//   const price = product.discountPrice > 0 ? product.discountPrice : product.price;
//   const discount = product.discountPrice > 0 ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 24 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: '-50px' }}
//       transition={{ duration: 0.4 }}
//       className="group relative bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-400 border border-gray-100 dark:border-gray-800">

//       {/* Image */}
//       <Link to={`/products/${product._id}`}>
//         <div className="relative overflow-hidden aspect-square bg-gray-50 dark:bg-[#2c2c2e]">
//           <img
//             src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600'}
//             alt={product.name}
//             loading="lazy"
//             className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
//             style={{ '--tw-scale-x': 'var(--scale)', '--tw-scale-y': 'var(--scale)' }}
//           />

//           {/* Overlay on hover */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//           {/* Badges */}
//           <div className="absolute top-3 left-3 flex flex-col gap-1.5">
//             {discount > 0 && <Badge color="red">{discount}% OFF</Badge>}
//             {product.isFeatured && <Badge color="gold">✦ Featured</Badge>}
//           </div>

//           {/* Action Buttons */}
//           <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
//             <button
//               onClick={handleWishlist}
//               className="w-9 h-9 bg-white dark:bg-[#1c1c1e] rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:scale-110 transition-all">
//               <Heart size={15} />
//             </button>
//             <Link
//               to={`/products/${product._id}`}
//               className="w-9 h-9 bg-white dark:bg-[#1c1c1e] rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gold hover:scale-110 transition-all">
//               <Eye size={15} />
//             </Link>
//           </div>

//           {/* Quick Add - slides up on hover */}
//           <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//             <button
//               onClick={handleAddToCart}
//               className="w-full bg-gold text-white text-sm font-semibold py-3 flex items-center justify-center gap-2 hover:bg-[#b8924f] transition-colors">
//               <ShoppingCart size={16} />
//               Add to Cart
//             </button>
//           </div>
//         </div>

//         {/* Info */}
//         <div className="p-4">
//           <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1.5">{product.category}</p>
//           <h3 className="font-serif font-bold text-[#111111] dark:text-[#f0ece4] mb-1 line-clamp-1 text-base leading-snug">
//             {product.name}
//           </h3>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
//             {product.shortDescription}
//           </p>

//           <div className="flex items-center gap-2 mb-3">
//             <StarRating rating={product.rating} size={12} />
//             <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({product.numReviews})</span>
//           </div>

//           <div className="flex items-center justify-between">
//             <div className="flex items-baseline gap-2">
//               <span className="text-lg font-bold text-[#111111] dark:text-[#f0ece4]">₹{price}</span>
//               {product.discountPrice > 0 && (
//                 <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
//               )}
//             </div>
//             <button
//               onClick={handleAddToCart}
//               className="w-9 h-9 bg-gold/10 hover:bg-gold text-gold hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-gold/30">
//               <ShoppingCart size={15} />
//             </button>
//           </div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }


import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { StarRating, Badge } from '../ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuthStore();

  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.images?.length) return;

    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.images?.length) return;

    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product);

    toast.success(`${product.name} added to cart!`, {
      icon: '🕯️',
      style: {
        background: '#111',
        color: '#f0ece4',
        border: '1px solid #c9a96e33',
      },
    });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return toast.error('Please login first');

    try {
      await api.put(`/users/wishlist/${product._id}`);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Failed');
    }
  };

  const price =
    product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const discount =
    product.discountPrice > 0
      ? Math.round(
          (1 - product.discountPrice / product.price) *
            100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 transition-all duration-400 border border-gray-100 dark:border-gray-800"
    >
      {/* Image */}
      <Link to={`/products/${product._id}`}>
        <div className="relative overflow-hidden aspect-square bg-gray-50 dark:bg-[#2c2c2e]">
          <img
            src={
              product.images?.[currentImage]?.url ||
              'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600'
            }
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            style={{
              '--tw-scale-x': 'var(--scale)',
              '--tw-scale-y': 'var(--scale)',
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Slider Buttons */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <ChevronRight size={16} />
              </button>

              {/* Dots */}
{/* <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
                {product.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImage
                        ? 'bg-white scale-110'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div> */}
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge color="red">
                {discount}% OFF
              </Badge>
            )}

            {product.isFeatured && (
              <Badge color="gold">
                ✦ Featured
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={handleWishlist}
              className="w-9 h-9 bg-white dark:bg-[#1c1c1e] rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:scale-110 transition-all"
            >
              <Heart size={15} />
            </button>

            <Link
              to={`/products/${product._id}`}
              className="w-9 h-9 bg-white dark:bg-[#1c1c1e] rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gold hover:scale-110 transition-all"
            >
              <Eye size={15} />
            </Link>
          </div>

          {/* Quick Add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gold text-white text-sm font-semibold py-3 flex items-center justify-center gap-2 hover:bg-[#b8924f] transition-colors"
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1.5">
            {product.category}
          </p>

          <h3 className="font-serif font-bold text-[#111111] dark:text-[#f0ece4] mb-1 line-clamp-1 text-base leading-snug">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <StarRating
              rating={product.rating}
              size={12}
            />

            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              ({product.numReviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#111111] dark:text-[#f0ece4]">
                ₹{price}
              </span>

              {product.discountPrice > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-9 h-9 bg-gold/10 hover:bg-gold text-gold hover:text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-gold/30"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}