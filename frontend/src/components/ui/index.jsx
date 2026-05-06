import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none';
  const variants = {
    primary: 'bg-gold text-white hover:bg-[#b8924f] shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:shadow-xl active:scale-95',
    outline: 'border-2 border-gold text-gold hover:bg-gold hover:text-white active:scale-95',
    ghost: 'text-gold hover:bg-gold/10 active:scale-95',
    dark: 'bg-[#111111] text-white hover:bg-[#222222] shadow-lg active:scale-95',
    white: 'bg-white text-[#111111] hover:bg-gray-100 shadow-lg active:scale-95',
  };
  const sizes = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-6 py-2.5 text-sm gap-2',
    lg: 'px-8 py-3.5 text-base gap-2',
  };
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
      {children}
    </motion.button>
  );
}

export function Badge({ children, color = 'gold' }) {
  const colors = {
    gold: 'bg-gold/15 text-[#8a6020] dark:bg-gold/20 dark:text-gold border border-gold/20',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
  };
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Spinner({ fullPage = false }) {
  const inner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gold/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold animate-spin" />
      </div>
      <p className="text-sm text-gold/70 font-medium tracking-wide">Loading...</p>
    </div>
  );
  if (fullPage) return <div className="min-h-screen flex items-center justify-center">{inner}</div>;
  return <div className="flex items-center justify-center py-24">{inner}</div>;
}

export function StarRating({ rating, size = 14, interactive = false, onRate }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg
          key={s}
          width={size} height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#c9a96e' : 'none'}
          stroke={s <= Math.round(rating) ? '#c9a96e' : '#d1d5db'}
          strokeWidth="1.5"
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          onClick={() => interactive && onRate?.(s)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function SectionTitle({ label, title, subtitle, light = false }) {
  return (
    <div className="text-center mb-14">
      {label && (
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-gold" />
          <p className={`text-xs font-bold tracking-[0.2em] uppercase ${light ? 'text-gold' : 'text-gold'}`}>{label}</p>
          <div className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${light ? 'text-white' : 'text-[#111111] dark:text-[#f0ece4]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base max-w-xl mx-auto leading-relaxed ${light ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] block">{label}</label>}
      <input
        className={`w-full border-2 ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 text-sm bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-gold transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
}
