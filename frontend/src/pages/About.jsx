import { motion } from 'framer-motion';
import { Award, Globe, Sparkles, Users } from 'lucide-react';

export const About = () => (
  <div className="overflow-hidden">
    <section className="relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(20,184,166,0.18),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(217,70,239,0.18),transparent_24rem)]" />
      <div className="container relative grid gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-teal-300" />
            Our Story
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-white lg:text-7xl">
            Commerce with taste, speed, and trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            LuxeCart brings together premium products, thoughtful curation, and a polished shopping experience built for modern customers.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-4 shadow-2xl shadow-black/30"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=85"
            alt="Modern retail space"
            className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
          />
        </motion.div>
      </div>
    </section>
    <section className="container py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { v: '50K+', l: 'Happy Customers', i: Users },
          { v: '10K+', l: 'Premium Products', i: Award },
          { v: '150+', l: 'Countries Served', i: Globe },
          { v: '4.9', l: 'Average Rating', i: Sparkles },
        ].map(({ v, l, i: Icon }) => (
          <motion.div key={l} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 text-center shadow-xl shadow-black/20">
            <Icon className="mx-auto mb-4 h-8 w-8 text-teal-300" />
            <p className="text-4xl font-black text-white">{v}</p>
            <p className="mt-2 text-sm text-slate-400">{l}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);
