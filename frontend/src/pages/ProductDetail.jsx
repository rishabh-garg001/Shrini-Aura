import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, Flame, Clock, Leaf, ArrowLeft, Share2, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button, StarRating, Badge, Spinner } from '../components/ui';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';

const RECENTLY_VIEWED_KEY = 'recently_viewed';

function useRecentlyViewed(productId, productData) {
  const [recentIds, setRecentIds] = useState([]);

  useEffect(() => {
    if (!productId || !productData) return;
   const stored = [
  ...new Set(
    JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]")
  )
];
    const updated = [productId, ...stored.filter(id => id !== productId)].slice(0, 5);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    setRecentIds(updated.filter(id => id !== productId));
  }, [productId, productData]);

  return recentIds;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const addItem = useCartStore(s => s.addItem);
  const { user } = useAuthStore();

  const { data: product, isLoading, refetch } = useQuery({
    
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data),
  });
  console.log("Category Object:", product?.category);

  const recentIds = useRecentlyViewed(id, product);

  // Related products (same category)
  const { data: relatedData } = useQuery({
   queryKey: ['related', product?.category?.slug, id],
    queryFn: () => api.get('/products', { params: {  category: product.category?.slug, limit: 4 } }).then(r => r.data),
    enabled: !!product?.category,
  });
  const related = relatedData?.products?.filter(p => p._id !== id) || [];

  // Recently viewed products
  const { data: recentData } = useQuery({
    queryKey: ['recent-viewed', recentIds.join(',')],
    queryFn: async () => {
      if (!recentIds.length) return [];
      const results = await Promise.all(
  recentIds.map(async (rid) => {
    try {
      const { data } = await api.get(`/products/${rid}`);
      return data;
    } catch {
      // Remove invalid id from localStorage
      const stored = [
  ...new Set(
    JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]")
  )
];

      const updated = stored.filter(id => id !== rid);

      localStorage.setItem(
        RECENTLY_VIEWED_KEY,
        JSON.stringify(updated)
      );

      return null;
    }
  })
);

return results.filter(Boolean);
    },
    enabled: recentIds.length > 0,
  });

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${qty} × ${product.name} added to cart! 🕯️`, {
      style: { background: '#111', color: '#f0ece4', border: '1px solid #c9a96e33' },
    });
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Please login first');
    await api.put(`/users/wishlist/${id}`);
    toast.success('Wishlist updated!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (isLoading) return <div className=""><Spinner /></div>;
  if (!product) return <div className=" text-center text-[#111111] dark:text-[#f0ece4]">Product not found</div>;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0 ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/products" className="flex items-center gap-1 hover:text-gold transition-colors">
            <ArrowLeft size={14} /> All Candles
          </Link>
          <span>/</span>
         <Link
         to={`/products?category=${encodeURIComponent(product.category?.slug)}`}
  className="hover:text-gold transition-colors"
>
  {product.category?.name}
</Link>
          <span>/</span>
          <span className="text-[#111111] dark:text-[#f0ece4] font-medium line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div key={activeImg} initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}
              className="rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-[#1c1c1e] shadow-xl">
              <img src={product.images?.[activeImg]?.url || 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800'}
                alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-gold shadow-lg shadow-gold/20' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Badge color="gold">{product.category?.name}</Badge>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#111111] dark:text-[#f0ece4] mt-3 mb-3 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size={16} />
                <span className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4]">{product.rating?.toFixed(1)}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">({product.numReviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 py-4 border-y-2 border-gray-100 dark:border-gray-800">
              <span className="text-4xl font-bold text-[#111111] dark:text-[#f0ece4]">₹{price}</span>
              {product.discountPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  <Badge color="red">{discount}% OFF</Badge>
                </>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">{product.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Flame, label: 'Burn Time', value: product.burnTime },
                { icon: Clock, label: 'Weight', value: product.weight },
                { icon: Leaf, label: 'Scent', value: product.scent },
              ].filter(d => d.value).map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
                  <Icon size={20} className="text-gold mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#f0ece4] mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors text-gray-500 dark:text-gray-400">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-[#111111] dark:text-[#f0ece4]">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors text-gray-500 dark:text-gray-400">
                    <Plus size={16} />
                  </button>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="flex-1" disabled={product.stock === 0}>
                  <ShoppingCart size={18} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleWishlist}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-500 transition-all">
                  <Heart size={16} /> Save to Wishlist
                </button>
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-gold hover:text-gold transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {product.stock > 0 && product.stock < 10 && (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                <span className="text-amber-500">⚡</span>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Only {product.stock} left in stock!</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Secure checkout · Free shipping above ₹999 · 7-day returns</span>
            </div>

            {product.ingredients?.length > 0 && (
              <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-[#111111] dark:text-[#f0ece4] mb-3">Ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map(ing => <Badge key={ing} color="gold">{ing}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentData?.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4] mb-8">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {recentData.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-20  border-t-2 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#111111] dark:text-[#f0ece4]">
              Customer Reviews <span className="text-gold">({product.numReviews})</span>
            </h2>
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} size={18} />
                <span className="font-bold text-lg text-[#111111] dark:text-[#f0ece4]">{product.rating?.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {product.reviews?.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-2xl mb-2">🕯️</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first!</p>
                </div>
              )}
              {product.reviews?.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gold/10 rounded-full flex items-center justify-center text-gold font-bold text-sm">
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm text-[#111111] dark:text-[#f0ece4]">{r.name}</span>
                    </div>
                    <StarRating rating={r.rating} size={13} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>
                </motion.div>
              ))}
            </div>

            {user ? (
              <form onSubmit={handleReview} className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 h-fit">
                <h3 className="font-bold text-[#111111] dark:text-[#f0ece4] mb-5">Write a Review</h3>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-2 block">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}
                        className={`text-3xl transition-transform hover:scale-110 ${s <= review.rating ? 'text-gold' : 'text-gray-200 dark:text-gray-700'}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-2 block">Your Review</label>
                  <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                    placeholder="Share your experience with this candle..." rows={4} required
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold resize-none transition-colors" />
                </div>
                <Button type="submit" className="w-full">Submit Review</Button>
              </form>
            ) : (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Login to write a review</p>
                <Link to="/login"><Button variant="outline">Sign In</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
