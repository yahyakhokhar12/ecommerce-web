import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Headphones, RefreshCw, Shield, Sparkles, Star, Truck } from 'lucide-react';
import { useGetProductsQuery } from '../api/apiSlice.js';
import { Button } from '../components/ui/button.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';

export const Home = () => {
  const { data, isLoading } = useGetProductsQuery({ limit: 8, isFeatured: true });
  const products = data?.data?.products || [];

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[calc(100vh-5rem)]">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&auto=format&fit=crop&q=85"
          alt="Premium fashion products"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050812] via-[#07101d]/88 to-[#07101d]/35" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="container relative flex min-h-[calc(100vh-5rem)] items-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-teal-300" />
              New collection live now
            </div>
            <h1 className="max-w-4xl text-6xl font-black leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
              Designed for people who buy with taste.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              Discover elevated essentials, standout accessories, and premium products curated for a sharper everyday life.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-slate-950 shadow-2xl shadow-black/30 hover:bg-slate-100">
                <Link to="/products">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10">
                <Link to="/products?discount[gt]=0">Explore Sale</Link>
              </Button>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {[
                { v: '10k+', l: 'Curated products' },
                { v: '50k+', l: 'Happy customers' },
                { v: '4.9', l: 'Average rating' },
              ].map((item) => (
                <div key={item.l} className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
                  <p className="text-3xl font-black text-white">{item.v}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-shell">
        <div className="container grid grid-cols-2 gap-4 py-10 lg:grid-cols-4">
          {[
            { icon: Truck, t: 'Free Shipping', d: 'On orders over $100' },
            { icon: Shield, t: 'Secure Payment', d: 'Encrypted checkout' },
            { icon: RefreshCw, t: 'Easy Returns', d: '30-day return window' },
            { icon: Headphones, t: 'Priority Support', d: 'Always-on help' },
          ].map(({ icon: Icon, t, d }) => (
            <motion.div
              key={t}
              whileHover={{ y: -4 }}
              className="premium-panel rounded-2xl p-5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08]">
                <Icon className="h-5 w-5 text-teal-300" />
              </div>
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-1 text-sm text-slate-400">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Star className="h-3.5 w-3.5 text-fuchsia-300" />
              Editor picks
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white lg:text-5xl">Featured Products</h2>
            <p className="mt-2 text-slate-400">Hand-picked pieces with premium materials, sharp design, and everyday utility.</p>
          </div>
          <Button asChild variant="outline" className="border-white/10 bg-white/[0.05] text-white hover:bg-white/10">
            <Link to="/products">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl bg-white/10" />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
};
