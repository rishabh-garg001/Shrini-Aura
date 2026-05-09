import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui';

export default function Cart() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + ((i.discountPrice > 0 ? i.discountPrice : i.price)) * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  const savings = items.reduce((s, i) => s + (i.discountPrice ? (i.price - i.discountPrice) * i.quantity : 0), 0);

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a]  flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
        <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gold" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4] mb-3">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          Discover our beautiful handcrafted candle collections and find your perfect scent.
        </p>
        <Link to="/products"><Button size="lg">Explore Candles <ArrowRight size={16} /></Button></Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4]">Shopping Cart</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/products" className="text-sm text-gold hover:underline font-medium flex items-center gap-1">
            ← Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-5 flex gap-5 border border-gray-100 dark:border-gray-800 hover:border-gold/20 transition-colors">
                  <Link to={`/products/${item._id}`} className="shrink-0">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=200'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">{item.category}</p>
                        <h3 className="font-serif font-bold text-[#111111] dark:text-[#f0ece4] text-base leading-snug">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-gray-100 dark:border-gray-700 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors text-gray-500 dark:text-gray-400">
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[#111111] dark:text-[#f0ece4]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors text-gray-500 dark:text-gray-400">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-[#111111] dark:text-[#f0ece4]">
                          ₹{(item.discountPrice || item.price) * item.quantity}
                        </p>
                        {item.discountPrice && (
                          <p className="text-xs text-gray-400 line-through">₹{item.price * item.quantity}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Savings Banner */}
            {savings > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3">
                <Tag size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  You're saving ₹{savings} on this order! 🎉
                </p>
              </motion.div>
            )}

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-[#111111] dark:text-[#f0ece4]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#111111] dark:text-[#f0ece4]'}`}>
                    {shipping === 0 ? '✓ Free' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">GST (18%)</span>
                  <span className="font-semibold text-[#111111] dark:text-[#f0ece4]">₹{tax}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount savings</span>
                    <span className="font-semibold">-₹{savings}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-bold text-base text-[#111111] dark:text-[#f0ece4]">Total</span>
                  <span className="font-bold text-xl text-[#111111] dark:text-[#f0ece4]">₹{total}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium text-center">
                    🚚 Add ₹{999 - subtotal} more for <strong>FREE shipping!</strong>
                  </p>
                </div>
              )}

              <Button onClick={() => navigate('/checkout')} className="w-full" size="lg">
                Proceed to Checkout <ArrowRight size={16} />
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
