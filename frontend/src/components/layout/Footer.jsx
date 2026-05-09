import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const InstagramIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>;
const FacebookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const TwitterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>;

const COLLECTIONS = ['Floral Bliss', 'Vanilla Dreams', 'Festive Lights', 'Ocean Breeze', 'Luxury Gold Collection'];
const HELP_LINKS = ['FAQ', 'Shipping Policy', 'Return Policy', 'Track Order', 'Contact Us'];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-gray-400">
      {/* Top Banner */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-8 text-sm">
              {[
                { icon: '🚚', text: 'Free shipping above ₹999' },
                { icon: '↩️', text: '7-day easy returns' },
                { icon: '🔒', text: 'Secure payments' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-gray-300">
                  <span>{icon}</span>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {[
                { Icon: InstagramIcon, href: 'https://www.instagram.com/shrini_aura_?igsh=MWlseGEzOXE1bXoxdA==' },
                { Icon: FacebookIcon, href: '#' },
                { Icon: TwitterIcon, href: '#' },
              ].map(({ Icon, href }, i) => (
                <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors duration-200">
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-serif text-xl font-bold text-white">ShriniAura</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Handcrafted with love and the finest natural ingredients. Each candle is a sensory journey — premium scents for premium moments.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} className="text-gold shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={14} className="text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} className="text-gold shrink-0" />
                <span>hello@shriniaura.com</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Collections</h4>
            <ul className="space-y-3">
              {COLLECTIONS.map(c => (
                <li key={c}>
                  <Link to={`/products?category=${encodeURIComponent(c)}`}
                    className="text-sm text-gray-400 hover:text-gold transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-200 overflow-hidden" />
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Help</h4>
            <ul className="space-y-3">
              {HELP_LINKS.map(item => (
                <li key={item}>
                  <a href="#"
                    className="text-sm text-gray-400 hover:text-gold transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-200 overflow-hidden" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Subscribe and get <span className="text-gold font-semibold">10% off</span> your first order. No spam, ever.
            </p>
            <form className="space-y-3" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-gold transition-colors placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-full bg-gold text-white text-sm font-semibold px-4 py-3 rounded-xl hover:bg-[#b8924f] transition-colors shadow-lg shadow-gold/20">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ShriniAura Candles. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <span className="text-gold">🕯️</span> in India
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
