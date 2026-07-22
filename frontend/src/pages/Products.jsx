import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';
import { Spinner } from '../components/ui';

const CATEGORIES = ['T-Lights', 'Urlis', 'Plant Lovers', 'Baby Shower', 'Jar Glass'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];
const PRICE_RANGES = [
  { label: 'Under ₹500', min: '', max: '500' },
  { label: '₹500 – ₹1000', min: '500', max: '1000' },
  { label: '₹1000 – ₹2000', min: '1000', max: '2000' },
  { label: 'Above ₹2000', min: '2000', max: '' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Multi-select: stored as comma-separated string in URL
  const categoryParam = searchParams.get('category') || '';
  const selectedCategories = categoryParam ? categoryParam.split(',') : [];
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', { categoryParam, search, sort, minPrice, maxPrice, page }],    queryFn: () => api.get('/products', {
      params: { category: categoryParam, search, sort, minPrice, maxPrice, page, limit: 12 },
    }).then(r => r.data),
    keepPreviousData: true,
  });
  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then(res => res.data),
  });
 const categoryMap =
  categoryData?.categories?.reduce((acc, cat) => {
    acc[cat.slug] = cat;
    return acc;
  }, {}) || {};
  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const toggleCategory = (cat) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setParam('category', next.join(','));
  };

  const removeCategory = (cat) => {
    const next = selectedCategories.filter(c => c !== cat);
    setParam('category', next.join(','));
  };

  const clearAll = () => { setSearchParams({}); setPage(1); };
  const hasFilters = categoryParam || search || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">
                {categoryParam ? 'Collection' : search ? 'Search Results' : 'All Products'}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#111111] dark:text-[#f0ece4]">
                {selectedCategories.length === 1
  ? categoryMap[selectedCategories[0]]?.name || selectedCategories[0]
  : selectedCategories.length > 1
  ? `${selectedCategories.length} Collections`
  : search
  ? `"${search}"`
  : "All Candles"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {data?.total || 0} candles found
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setParam('sort', e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#1c1c1e] text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold cursor-pointer transition-colors">
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-2 rounded-xl transition-all ${showFilters
                  ? "border-gold bg-gold text-white"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] hover:border-gold"
                  }`}
              >
                <SlidersHorizontal size={15} />
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>
          </motion.div>

         
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-[100] md:hidden"
                onClick={() => setShowFilters(false)}
              >
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-0 h-full w-[92%] max-w-sm
             bg-white dark:bg-[#111111]
             overflow-y-auto px-5 pt-16 pb-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="pt-2">
                    <h2 className="font-bold text-lg text-[#111111] dark:text-white">
                      Filters
                    </h2>
</div>
                    <button
                      onClick={() => setShowFilters(false)}
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Categories */}
           <div className="bg-white dark:bg-[#1c1c1e] rounded-xl border border-gray-200 dark:border-gray-700 mb-5 overflow-hidden">
  <div className="p-4">
    <h3 className="font-bold text-sm uppercase tracking-wider">
      Category
    </h3>
  </div>

  <div className="px-4 pb-4 h-64 overflow-y-auto custom-scrollbar">
                    {/* <div className="space-y-2"> */}
                  {[...(categoryData?.categories || [])]
  .sort((a, b) => {
    const aSelected = selectedCategories.includes(a.slug);
    const bSelected = selectedCategories.includes(b.slug);

    if (aSelected === bSelected) return a.name.localeCompare(b.name);

    return aSelected ? -1 : 1;
  })
  .map(category => {
    const checked = selectedCategories.includes(category.slug);

                        return (
                          <label
  key={category._id}
  onClick={() => toggleCategory(category.slug)}
  className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-2 hover:bg-gold/5 transition-colors"
>
  <div
    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
      checked
        ? "bg-gold border-gold"
        : "border-gray-300"
    }`}
  >
    {checked && (
      <svg
        className="w-3 h-3 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )}
  </div>

  <span
    className={`text-sm transition-colors ${
      checked
        ? "text-gold font-medium"
        : "text-gray-700 dark:text-gray-300"
    }`}
  >
    {category.name}
  </span>
</label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-5">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
                      Price Range
                    </h3>

                    <div className="space-y-2">
                      {PRICE_RANGES.map((r) => {
                        const active =
                          minPrice === r.min &&
                          maxPrice === r.max;

                        return (
                          <button
                            key={r.label}
                            onClick={() => {
                              setParam(
                                "minPrice",
                                active ? "" : r.min
                              );
                              setParam(
                                "maxPrice",
                                active ? "" : r.max
                              );
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl ${active
                              ? "bg-gold text-white"
                              : "hover:bg-gold/10"
                              }`}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white dark:bg-[#111111] pt-4 pb-2">
  <button
    onClick={() => setShowFilters(false)}
    className="
w-full
bg-gold
text-white
py-3
rounded-xl
font-semibold
shadow-md
hover:shadow-lg
hover:scale-[1.02]
active:scale-95
transition-all
duration-300
"
  >
    Apply Filters
  </button>
</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 260 }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden md:block shrink-0 overflow-hidden">                <div className="w-64 space-y-6">

                  {/* Category Multi-Select */}
                  <div className="
bg-white
dark:bg-[#1c1c1e]
rounded-xl
p-4
border
border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-shadow
duration-300
mb-5
">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm text-[#111111] dark:text-[#f0ece4] uppercase tracking-wider">Category</h3>
                      {selectedCategories.length > 0 && (
                        <button onClick={() => setParam('category', '')}
                          className="text-xs text-gold hover:underline font-medium">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                     {categoryData?.categories?.map(category => {
  const checked = selectedCategories.includes(category.slug);

  return (
    <label
      key={category._id}
      onClick={() => toggleCategory(category.slug)}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
          checked
            ? "bg-gold border-gold"
            : "border-gray-300 dark:border-gray-600 group-hover:border-gold"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <span
        className={`text-sm transition-colors leading-tight ${
          checked
            ? "text-gold font-semibold"
            : "text-gray-600 dark:text-gray-400 group-hover:text-gold"
        }`}
      >
        {category.name}
      </span>
    </label>
  );
})}
                    </div>
                    {selectedCategories.length > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                     {selectedCategories.length} of {categoryData?.categories?.length || 0} selected
                      </p>
                    )}
                  </div>

                  {/* Price Filter */}
                  <div className="
bg-white
dark:bg-[#1c1c1e]
rounded-xl
p-4
border
border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-shadow
duration-300
mb-5
">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm text-[#111111] dark:text-[#f0ece4] uppercase tracking-wider">Price Range</h3>
                      {(minPrice || maxPrice) && (
                        <button onClick={() => { setParam('minPrice', ''); setParam('maxPrice', ''); }}
                          className="text-xs text-gold hover:underline font-medium">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {PRICE_RANGES.map(r => {
                        const active = minPrice === r.min && maxPrice === r.max;
                        return (
                          <button key={r.label}
                            onClick={() => { setParam('minPrice', active ? '' : r.min); setParam('maxPrice', active ? '' : r.max); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${active ? 'bg-gold text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gold/10 hover:text-gold'}`}>
                            {r.label}
                            {active && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setParam('minPrice', e.target.value)}
                        className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-transparent text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold" />
                      <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setParam('maxPrice', e.target.value)}
                        className="w-full text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-transparent text-[#111111] dark:text-[#f0ece4] outline-none focus:border-gold" />
                    </div>
                  </div>

                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? <Spinner /> : (
              <>
                <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {data?.products?.length === 0 && (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🕯️</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">No candles found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                    <button onClick={clearAll} className="text-gold font-semibold hover:underline text-sm">Clear all filters</button>
                  </div>
                )}
                {data?.pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-14 mb-6 flex-wrap">

                    {/* Prev */}
                    <button
                      onClick={() =>
                        setPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
        ${page === 1
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-[#1c1c1e] border border-gold text-gold hover:bg-gold hover:text-white hover:scale-105 hover:shadow-lg'
                        }`}
                    >
                      ← Prev
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {[...Array(data.pages)].map((_, i) => {
                        const pageNum = i + 1;

                        return (
                          <button
                            key={i}
                            onClick={() =>
                              setPage(pageNum)
                            }
                            className={`w-11 h-11 rounded-full text-sm font-bold transition-all duration-300
              ${page === pageNum
                                ? 'bg-gold text-white shadow-lg shadow-gold/30 scale-110'
                                : 'bg-white dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gold hover:text-gold hover:scale-105'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next */}
                    <button
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            prev + 1,
                            data.pages
                          )
                        )
                      }
                      disabled={
                        page === data.pages
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
        ${page === data.pages
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-[#1c1c1e] border border-gold text-gold hover:bg-gold hover:text-white hover:scale-105 hover:shadow-lg'
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

