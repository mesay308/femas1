'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = {
  category_id: string;
  name: string;
  slug: string;
  parent_category_id?: string | null;
  is_active?: boolean;
  display_order?: number;
};

const FALLBACK_CATEGORIES: { name: string; slug: string }[] = [
  { name: 'Freestanding Stoves', slug: 'freestanding-stoves' },
  { name: 'Compact Ovens', slug: 'compact-ovens' },
  { name: 'Kitchen Cabinets', slug: 'kitchen-cabinets' },
  { name: 'Custom Design', slug: 'custom-design' },
];

const POPULAR_SUGGESTIONS = [
  'Dual-Fuel Stove',
  'Round Oven',
  'All-Electric Stove',
  'Kitchen Cabinet',
  'Turkish Stove',
  'Custom Kitchen',
];

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [topCategories, setTopCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get('/categories')
      .then(res => {
        const all: Category[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const topLevel = all
          .filter(c => c.is_active !== false && !c.parent_category_id)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .slice(0, 4);
        setTopCategories(topLevel);
      })
      .catch(() => setTopCategories([]));
  }, [isOpen]);

  const categories: { name: string; slug: string }[] =
    topCategories.length > 0
      ? topCategories.map(c => ({ name: c.name, slug: c.slug }))
      : FALLBACK_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 relative border border-gray-100 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
              <Search className="text-gray-400 dark:text-gray-500" size={24} />
              <input
                type="text"
                placeholder="Search products, sizes, or scents..."
                className="w-full text-lg bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Popular Suggestions</h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20 hover:text-brand-blue dark:hover:text-blue-400 text-sm text-gray-600 dark:text-gray-300 rounded-lg transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Browse by Category</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group text-left"
                  >
                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
