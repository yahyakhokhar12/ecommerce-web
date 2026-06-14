import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Sparkles } from 'lucide-react';
import { useGetProductsQuery } from '../api/apiSlice.js';
import { Button } from '../components/ui/button.jsx';
import { ProductCard } from '../components/common/ProductCard.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';

export const Home = () => {
  const { data, isLoading } = useGetProductsQuery({ limit: 8, isFeatured: true });
  const products = data?.data?.products || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        </div>
        <div className="container py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
              <span>New Collection 2025</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Discover <span className="gradient-text">Premium</span> Products
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Curated collection of the finest products, designed for the modern lifestyle.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gradient" size="lg">
                <Link to="/products">Shop Now <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
            <div className="flex gap-8 pt-6">
              {[
                { v: '10k+', l: 'Products' },
                { v: '50k+', l: 'Customers' },
                { v: '4.9★', l: 'Rating' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-bold gradient-text">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative aspect-square"
          >
            <div className="absolute inset-0 gradient-bg rounded-3xl rotate-6 opacity-20" />
            <div className="absolute inset-0 glass rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, t: 'Free Shipping', d: 'On orders over $100' },
            { icon: Shield, t: 'Secure Payment', d: '100% protected' },
            { icon: RefreshCw, t: 'Easy Returns', d: '30-day return' },
            { icon: Headphones, t: '24/7 Support', d: 'Dedicated help' },
          ].map((f) => (
            <div key={f.t} className="glass p-5 rounded-2xl">
              <f.icon className="h-6 w-6 text-fuchsia-500 mb-2" />
              <h3 className="font-semibold">{f.t}</h3>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Hand-picked favorites</p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/products">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)
            : products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
};
