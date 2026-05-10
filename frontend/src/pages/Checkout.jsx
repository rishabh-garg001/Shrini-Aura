import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MapPin, Phone, ArrowRight, ShieldCheck, Tag, X } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import toast from 'react-hot-toast';

const STEPS = ['Cart', 'Shipping', 'Payment'];

export default function Checkout() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discount }
  const [couponLoading, setCouponLoading] = useState(false);
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + ((i.discountPrice > 0 ? i.discountPrice : i.price)) * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const couponDiscount = coupon ? Math.round(subtotal * coupon.discount / 100) : 0;
  const tax = Math.round((subtotal - couponDiscount) * 0.18);
  const total = subtotal - couponDiscount + shipping + tax;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/orders/validate-coupon', { code: couponInput });
      setCoupon({ code: data.code, discount: data.discount });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(''); };

  const onSubmit = async (formData) => {
    if (!user) return navigate('/login');
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        product: i._id, name: i.name,
        image: i.images?.[0]?.url,
        price: (i.discountPrice > 0 ? i.discountPrice : i.price),
        quantity: i.quantity,
      }));
      const { data } = await api.post('/orders', {
        orderItems, shippingAddress: formData,
        paymentMethod: 'razorpay',
        couponCode: coupon?.code || '',
      });

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.key, amount: data.amount, currency: data.currency,
          order_id: data.razorpayOrderId,
          name: 'ShriniAura Candles', description: 'Handcrafted Scented Candles',
          prefill: { name: user.name, email: user.email, contact: formData.phone },
          theme: { color: '#c9a96e' },
          handler: async (response) => {
            try {
              await api.post(`/orders/${data.order._id}/verify-payment`, response);
              clearCart();
              toast.success('Order placed successfully! 🎉');
              navigate(`/orders/${data.order._id}`);
            } catch { toast.error('Payment verification failed'); }
          },
        });
        rzp.open();
      };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'street', label: 'Street Address', placeholder: '123, MG Road, Andheri West', full: true },
    { name: 'city', label: 'City', placeholder: 'Mumbai' },
    { name: 'state', label: 'State', placeholder: 'Maharashtra' },
    { name: 'pincode', label: 'Pincode', placeholder: '400001' },
    { name: 'phone', label: 'Phone Number', placeholder: '+91 9876543210', full: true },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${i === 1 ? 'bg-gold text-white shadow-lg shadow-gold/25' : i < 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                  {i < 1 ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-4 sm:w-8 h-px bg-gray-200 dark:bg-gray-700" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Shipping Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-7 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <MapPin size={18} className="text-gold" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4]">Shipping Address</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Where should we deliver your candles?</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(field => (
                    <div key={field.name} className={field.full ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">{field.label}</label>
                      <input {...register(field.name, { required: `${field.label} is required` })}
                        placeholder={field.placeholder}
                        className={`w-full border-2 ${errors[field.name] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-gold transition-colors`} />
                      {errors[field.name] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[field.name].message}</p>}
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-[#111111] dark:text-[#f0ece4] mb-1.5">
                    <span className="flex items-center gap-1.5"><Tag size={13} /> Coupon Code</span>
                  </label>
                  {coupon ? (
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                      <Tag size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{coupon.code} — {coupon.discount}% OFF applied!</span>
                      <button type="button" onClick={removeCoupon} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g. AURA10)"
                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#2c2c2e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 outline-none focus:border-gold transition-colors uppercase" />
                      <Button type="button" variant="outline" onClick={applyCoupon} loading={couponLoading} size="md">Apply</Button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Try: AURA10, SHRINI15, WELCOME20</p>
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    Pay ₹{total} with Razorpay <ArrowRight size={16} />
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>256-bit SSL encrypted & secured by Razorpay</span>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
              <h2 className="font-serif text-lg font-bold text-[#111111] dark:text-[#f0ece4] mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto overflow-x-visible scrollbar-hide px-1 pt-2">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <div className="relative shrink-0 overflow-visible">
                      <img src={item.images?.[0]?.url} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                    </div>
                    <span className="text-sm font-bold text-[#111111] dark:text-[#f0ece4] shrink-0">
                      ₹{(item.discountPrice || item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-[#111111] dark:text-[#f0ece4]">₹{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Coupon ({coupon.code})</span>
                    <span className="font-semibold">-₹{couponDiscount}</span>
                  </div>
                )}
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
                <div className="border-t-2 border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="font-bold text-[#111111] dark:text-[#f0ece4]">Total</span>
                  <span className="font-bold text-xl text-[#111111] dark:text-[#f0ece4]">₹{total}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
