import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/apiSlice.js';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Button } from '../components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { Slider } from '../components/ui/slider.jsx'; // build with @radix-ui/react-slider
import { useDebounce } from '../hooks/useDebounce.js';

export const Products = () => {
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const search = useDebounce(params.get('search') || '', 400);
  const category = params.get('category') || '';
  const isFeatured = params.get('isFeatured') || '';
  const discountGt = params.get('discount[gt]') || '';
  const sort = params.get('sort') || '-createdAt';
  const page = parseInt(params.get('page') || '1', 10);

  const { data: catData } = useGetCategoriesQuery();
  const { data, isLoading } = useGetProductsQuery({
    search: search || undefined,
    category: category || undefined,
    isFeatured: isFeatured || undefined,
    'discount[gt]': discountGt || undefined,
    'price[gte]': priceRange[0],
    'price[lte]': priceRange[1],
    sort,
    page,
    limit: 12,
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  const setParam = (key, val) => {
    const p = new URLSearchParams(params);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setParams(p);
  };

  return (
    <div className="container py-10">
      <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5 text-teal-300" />
              Shop catalog
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">Explore Products</h1>
            <p className="mt-2 text-slate-400">Filter, compare, and discover premium products curated for modern living.</p>
          </div>
          <p className="text-sm text-slate-400">{pagination ? `${pagination.total} products available` : ''}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-72">
          <div className="sticky top-28 space-y-6 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setFilterOpen(!filterOpen)} className="md:hidden">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className={`space-y-6 ${filterOpen ? 'block' : 'hidden md:block'}`}>
            <div>
              <h4 className="font-medium mb-3 text-sm text-slate-300">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const p = new URLSearchParams(params);
                    p.delete('category');
                    p.delete('isFeatured');
                    p.delete('discount[gt]');
                    p.delete('page');
                    setParams(p);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${!category && !isFeatured && !discountGt ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(params);
                    p.set('isFeatured', 'true');
                    p.delete('category');
                    p.delete('discount[gt]');
                    p.delete('page');
                    setParams(p);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${isFeatured === 'true' ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  Featured
                </button>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(params);
                    p.set('discount[gt]', '0');
                    p.delete('category');
                    p.delete('isFeatured');
                    p.delete('page');
                    setParams(p);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${discountGt === '0' ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  Sale
                </button>
                {catData?.data?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setParam('category', c._id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${category === c._id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm text-slate-300">Price</h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={10}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-sm text-slate-400">
              {isLoading ? 'Loading products...' : `${products.length} shown`}
            </p>
            <Select value={sort} onValueChange={(v) => setParam('sort', v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-rating">Top Rated</SelectItem>
                <SelectItem value="-sold">Best Selling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl bg-white/10" />)
              : products.length
                ? products.map((p) => <ProductCard key={p._id} product={p} />)
                : <p className="col-span-full text-center text-muted-foreground py-20">No products found</p>}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setParam('page', i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
