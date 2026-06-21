import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, CreditCard, PackageCheck, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';

const showcase = {
  login: {
    eyebrow: 'Premium member access',
    title: 'Welcome back to',
    highlight: 'LuxeCart',
    body: 'Manage orders, save wishlists, and discover curated products from a secure, personalized shopping space.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    product: 'Velocity Runner',
    price: '$189.00',
    metric: '4.9',
    metricLabel: 'avg. rating',
    timeline: ['Order secured', 'Priority dispatch', 'Delivery tracked'],
    stats: [
      { icon: ShieldCheck, label: 'Secure checkout' },
      { icon: Truck, label: 'Fast delivery' },
      { icon: Sparkles, label: 'Curated drops' },
    ],
  },
  register: {
    eyebrow: 'Secure account setup',
    title: 'Build your',
    highlight: 'premium cart',
    body: 'Save favorites, checkout faster, and get personalized product drops with a LuxeCart account.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
    product: 'Nordic Watch',
    price: '$249.00',
    metric: '30%',
    metricLabel: 'faster checkout',
    timeline: ['Create profile', 'Save favorites', 'Unlock drops'],
    stats: [
      { icon: Sparkles, label: 'Recommendations' },
      { icon: PackageCheck, label: 'Order history' },
      { icon: CreditCard, label: 'Fast sign-up' },
    ],
  },
};

export const AuthShowcase = ({ variant = 'login' }) => {
  const data = showcase[variant];

  return (
    <div className="hidden lg:flex min-h-[calc(100vh-4rem)] flex-col justify-between p-12">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm text-slate-300 shadow-xl shadow-black/20 backdrop-blur"
      >
        <Sparkles className="h-4 w-4 text-fuchsia-300" />
        {data.eyebrow}
      </motion.div>

      <div className="grid items-center gap-10 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="max-w-xl"
        >
          <h2 className="text-6xl font-black leading-tight tracking-tight">
            {data.title}{' '}
            <span className="bg-gradient-to-r from-fuchsia-300 via-violet-200 to-teal-200 bg-clip-text text-transparent">
              {data.highlight}
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">{data.body}</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {data.stats.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-lg shadow-black/20 backdrop-blur"
              >
                <Icon className="h-5 w-5 text-teal-300" />
                <p className="mt-3 text-sm font-medium text-slate-200">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24, rotate: 1.5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/35 via-violet-500/20 to-teal-400/35 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-4 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
              <img src={data.image} alt={data.product} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-[#080b12]/20 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Featured drop
                </span>
                <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium text-teal-200 backdrop-blur">
                  In stock
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Today&apos;s pick</p>
                      <h3 className="mt-1 text-xl font-bold text-white">{data.product}</h3>
                    </div>
                    <p className="text-lg font-black text-teal-200">{data.price}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.08] px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Star className="h-4 w-4 fill-fuchsia-300 text-fuchsia-300" />
                      {data.metric} <span className="text-slate-500">{data.metricLabel}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="absolute -bottom-8 -left-8 w-64 rounded-2xl border border-white/10 bg-[#10131f]/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live flow</p>
            <div className="mt-3 space-y-3">
              {data.timeline.map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-400/15 text-teal-200">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item}</p>
                    <p className="text-xs text-slate-500">Step {index + 1} complete</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <p className="text-sm text-slate-500">
        A polished commerce account experience for shoppers who expect every click to feel considered.
      </p>
    </div>
  );
};
