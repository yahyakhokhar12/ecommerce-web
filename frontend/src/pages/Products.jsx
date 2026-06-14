import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
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
  const sort = params.get('sort') || '-createdAt';
  const page = parseInt(params.get('page') || '1', 10);

  const { data: catData } = useGetCategoriesQuery();
  const { data, isLoading } = useGetProductsQuery({
    search: search || undefined,
    category: category || undefined,
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
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setFilterOpen(!filterOpen)} className="md:hidden">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className={`space-y-6 ${filterOpen ? 'block' : 'hidden md:block'}`}>
            <div>
              <h4 className="font-medium mb-3 text-sm">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded ${!category ? 'gradient-bg text-white' : 'hover:bg-accent'}`}
                >
                  All
                </button>
                {catData?.data?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setParam('category', c._id)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded ${category === c._id ? 'gradient-bg text-white' : 'hover:bg-accent'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Price</h4>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={10}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {pagination ? `${pagination.total} products` : ''}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
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
