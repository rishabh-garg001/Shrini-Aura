import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Menu, X, Sun, Moon, Search, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import api from '../../lib/api';

const CATEGORIES = ['Floral Bliss', 'Vanilla Dreams', 'Festive Lights', 'Ocean Breeze', 'Luxury Gold Collection'];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const items = useCartStore(s => s.items);
  const clearCart = useCartStore(s => s.clearCart);
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const suggestTimer = useRef(null);

  const userMenuRef = useRef(null);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setOpen(false); setUserMenuOpen(false); }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live search suggestions
  useEffect(() => {
    clearTimeout(suggestTimer.current);
    if (search.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/products/search-suggestions', { params: { q: search } });
        setSuggestions(data);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(suggestTimer.current);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setSearch(''); setSuggestions([]); setSearchOpen(false);
    }
  };

  const navTextClass = scrolled || !isHome ? 'text-[#111111] dark:text-[#f0ece4]' : 'text-white';
  const navBg = scrolled || !isHome
    ? 'bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800'
    : 'bg-gradient-to-b from-black/40 to-transparent';

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500`}>
        {/* Announcement Banner */}
        <div className="bg-gold text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wide">
          <span className="hidden sm:inline">🕯️ Free shipping on orders above ₹999 &nbsp;·&nbsp; Use code <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold">AURA10</span> for 10% off &nbsp;·&nbsp; New collections available!</span>
          <span className="sm:hidden">🕯️ Use code <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold">AURA10</span> for 10% off · Free shipping ₹999+</span>
        </div>
        {/* Main Navbar */}
        <div className={`transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/30">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className={`font-serif text-xl font-bold tracking-wide transition-colors ${navTextClass}`}>ShriniAura</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link to="/products" className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                All Candles
              </Link>
              <div className="relative group">
                <button className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                  Collections <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {CATEGORIES.map(c => (
                    <Link key={c} to={`/products?category=${encodeURIComponent(c)}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />{c}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                <Search size={18} />
              </button>
              <button onClick={toggle} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {user && (
                <Link to="/wishlist" className={`p-2.5 rounded-full transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                  <Heart size={18} />
                </Link>
              )}
              <Link to="/cart" className={`relative p-2.5 rounded-full transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 transition-all">
                    <div className="w-7 h-7 bg-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${navTextClass}`}>{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`${navTextClass} transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-[100]">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="font-semibold text-sm text-[#111111] dark:text-[#f0ece4]">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                        {[
                          { to: '/profile', icon: Settings, label: 'Profile' },
                          ...(user.role !== 'admin' ? [{ to: '/orders', icon: Package, label: 'My Orders' }] : []),
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-gold hover:bg-gold/5 transition-colors">
                            <Icon size={15} /> {label}
                          </Link>
                        ))}
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold hover:bg-gold/5 transition-colors font-medium">
                            <span className="text-xs bg-gold text-white px-1.5 py-0.5 rounded font-bold">A</span> Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                          <button onClick={async () => { await logout(); navigate('/'); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link to="/login" className={`text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-gold/10 hover:text-gold ${navTextClass}`}>Login</Link>
                  <Link to="/register" className="text-sm font-semibold px-4 py-2 rounded-full bg-gold text-white hover:bg-[#b8924f] shadow-md shadow-gold/25 transition-all">Sign Up</Link>
                </div>
              )}

              <button className={`lg:hidden p-2.5 rounded-full transition-all hover:bg-gold/10 ${navTextClass}`} onClick={() => setOpen(!open)}>
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-gray-800">
              <div className="px-4 py-5 space-y-1">
                <Link to="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#111111] dark:text-[#f0ece4] hover:bg-gold/10 hover:text-gold transition-colors">All Candles</Link>
                <p className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Collections</p>
                {CATEGORIES.map(c => (
                  <Link key={c} to={`/products?category=${encodeURIComponent(c)}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:text-gold hover:bg-gold/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" /> {c}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay with Live Suggestions */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={() => { setSearchOpen(false); setSuggestions([]); }}>
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl overflow-hidden">
              <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
                <Search size={20} className="text-gold shrink-0" />
                <input ref={searchRef} autoFocus value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search for candles, scents, collections..."
                  className="flex-1 text-base bg-transparent outline-none text-[#111111] dark:text-[#f0ece4] placeholder-gray-400" />
                <button type="button" onClick={() => { setSearchOpen(false); setSuggestions([]); }}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </form>

              {/* Live Suggestions */}
              {suggestions.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  {suggestions.map(p => (
                    <Link key={p._id} to={`/products/${p._id}`}
                      onClick={() => { setSearchOpen(false); setSuggestions([]); setSearch(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gold/5 transition-colors">
                      <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4]">{p.name}</p>
                        <p className="text-xs text-gold">{p.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Popular searches */}
              {suggestions.length === 0 && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Rose', 'Lavender', 'Vanilla', 'Oud', 'Festive', 'Luxury'].map(t => (
                      <button key={t} onClick={() => { setSearch(t); navigate(`/products?search=${t}`); setSearchOpen(false); }}
                        className="px-3 py-1.5 bg-gold/10 text-gold text-xs font-medium rounded-full hover:bg-gold hover:text-white transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
