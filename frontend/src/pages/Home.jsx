import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Leaf, Award, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import { Button, SectionTitle, Spinner } from '../components/ui';

const CATEGORIES = [
  { name: 'Floral Bliss', img: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233707.png', desc: 'Romantic floral scents', emoji: '🌸' },
  { name: 'Vanilla Dreams', img: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233826.png', desc: 'Warm & indulgent', emoji: '🍦' },
  { name: 'Festive Lights', img: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/image.png?updatedAt=1778350220560', desc: 'Celebrate every moment', emoji: '✨' },
  { name: 'Ocean Breeze', img: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20223115.png?updatedAt=1778349753063', desc: 'Fresh coastal escape', emoji: '🌊' },
  { name: 'Luxury Gold', img: 'https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233907.png', desc: 'Premium & exclusive', emoji: '👑', category: 'Luxury Gold Collection' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai', text: 'The Gold Oud Royale is absolutely divine. My home smells like a luxury spa every single day!', rating: 5, avatar: 'P' },
  { name: 'Ananya M.', location: 'Delhi', text: 'Diwali Glow made our festival so special. The saffron scent is intoxicating and long-lasting.', rating: 5, avatar: 'A' },
  { name: 'Rohan K.', location: 'Bangalore', text: 'Best candles I\'ve ever bought. The packaging is gorgeous and the scent lasts for weeks!', rating: 5, avatar: 'R' },
];

const FEATURES = [
  { icon: Leaf, title: '100% Natural', desc: 'Pure soy & coconut wax, zero toxins, eco-friendly wicks' },
  { icon: Flame, title: 'Long Burn Time', desc: 'Up to 80 hours of continuous fragrance per candle' },
  { icon: Award, title: 'Handcrafted', desc: 'Every candle poured by hand with love in India' },
];

const TRUST = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders above ₹999' },
  { icon: RotateCcw, label: 'Easy Returns', sub: '7-day hassle-free returns' },
  { icon: Shield, label: 'Secure Payment', sub: 'Razorpay encrypted checkout' },
  { icon: Star, label: '4.9★ Rated', sub: 'By 2000+ happy customers' },
];

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get('/products/featured').then(r => r.data),
  });

  const featured = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/rishaabh/shrini%20Photos/Screenshot%202026-05-09%20233826.png"
            alt="hero candle"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-bold tracking-[0.15em] uppercase">Premium Handcrafted Candles</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Light Up Your<br />
              <span className="text-gradient">World</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
              Discover handmade scented candles crafted with the finest natural ingredients — transforming your space into a sanctuary of calm and luxury.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="shadow-2xl shadow-gold/30">
                  Shop Now <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/products?category=Luxury Gold Collection">
                <Button variant="white" size="lg">
                  Luxury Collection
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="flex gap-8 mt-14 pt-8 border-t border-white/10">
              {[['2000+', 'Happy Customers'], ['5', 'Collections'], ['100%', 'Natural Wax']].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white font-serif">{num}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-[#111111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST.map(({ icon: Icon, label, sub }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-white dark:bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-[#faf7f2] dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 hover:border-gold/30 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                    <Icon className="text-gold" size={26} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 bg-[#faf7f2] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle label="Explore" title="Our Collections" subtitle="Five unique scent families, each telling its own story of luxury and craftsmanship." />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <Link
                  to={`/products?category=${encodeURIComponent(cat.category || cat.name)}`}
                  className="group block relative overflow-hidden rounded-2xl aspect-[3/4] shadow-md hover:shadow-2xl transition-shadow duration-400">
                  <img
                    src={cat.img} alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-xl mb-1 block">{cat.emoji}</span>
                    <h3 className="font-serif text-white font-bold text-sm leading-tight">{cat.name}</h3>
                    <p className="text-gray-300 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{cat.desc}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-7 h-7 bg-white/0 group-hover:bg-white/10 rounded-full flex items-center justify-center transition-all duration-300">
                    <ArrowRight size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 bg-white dark:bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle label="Bestsellers" title="Featured Candles" subtitle="Our most loved scents, handpicked for you by our fragrance experts." />
          {isLoading ? <Spinner /> : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {featured?.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="text-center mt-12">
                <Link to="/products">
                  <Button variant="outline" size="lg">
                    View All Candles <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle label="Reviews" title="What Our Customers Say" light />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.12 }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-gold/30 transition-colors duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#c9a96e" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.location}</p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 text-5xl text-gold/10 font-serif leading-none">"</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://ik.imagekit.io/rishaabh/shrini%20Photos/image.png?updatedAt=1778350220560" alt="cta" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#111111]/80 to-[#111111]/60" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-gold text-xs font-bold tracking-widest uppercase">Limited Time Offer</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to Transform<br />Your Space?
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Free shipping on orders above ₹999.<br />
              Use code <span className="text-gold font-bold">AURA10</span> for 10% off your first order.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="shadow-2xl shadow-gold/30">
                  Shop the Collection <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/products?category=Luxury Gold Collection">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white hover:text-[#111111]">
                  Luxury Collection
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
