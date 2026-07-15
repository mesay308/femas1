'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

interface Category {
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean | number;
  parent_category_id: string | null;
  description?: string | null;
  short_description?: string | null;
  cover_image_url?: string | null;
  display_order?: number;
}

interface MegaMenuProps {
  category: string;
}

const MegaMenu = ({ category }: MegaMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category !== 'PRODUCTS') return;
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/categories');
        const list: Category[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCategories(list.filter(c => c.is_active));
      } catch (err) {
        console.error('MegaMenu fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [category]);

  if (category !== 'PRODUCTS') return null;

  const topLevel = categories
    .filter(c => !c.parent_category_id)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400 gap-2 text-sm">
        <Loader2 size={18} className="animate-spin text-brand-blue" />
        Loading categories...
      </div>
    );
  }

  if (topLevel.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 italic">
        Categories will appear here as they are added in the admin.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {topLevel.map(cat => (
        <Link
          key={cat.category_id}
          href={`/category/${cat.slug}`}
          className="group flex flex-col rounded-xl border border-slate-700 bg-slate-800 overflow-hidden hover:border-brand-orange/40 hover:shadow-md transition-all"
        >
          <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-900">
            <Image
              src={resolveImageUrl(cat.cover_image_url || null)}
              alt={cat.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1">
            <h4 className="font-bold text-white text-sm group-hover:text-brand-orange transition-colors">
              {cat.name}
            </h4>
            {(cat.short_description || cat.description) && (
              <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                {cat.short_description || cat.description}
              </p>
            )}
            <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <ArrowRight size={12} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MegaMenu;
