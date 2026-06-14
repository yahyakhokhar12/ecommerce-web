import { motion } from 'framer-motion';
import { Sparkles, Users, Award, Globe } from 'lucide-react';

export const About = () => (
  <div>
    <section className="container py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="inline-flex glass px-4 py-1.5 rounded-full text-sm mb-4">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-500 mr-2" /> Our Story
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold">Crafting <span className="gradient-text">Excellence</span></h1>
        <p className="text-lg text-muted-foreground mt-6">
          We're on a mission to bring you the world's finest products with unmatched service.
        </p>
      </motion.div>
    </section>
    <section className="container py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { v: '50K+', l: 'Happy Customers', i: Users },
          { v: '10K+', l: 'Products', i: Award },
          { v: '150+', l: 'Countries', i: Globe },
          { v: '4.9★', l: 'Rating', i: Sparkles },
        ].map((s) => (
          <div key={s.l} className="glass p-6 rounded-2xl text-center">
            <s.i className="h-8 w-8 mx-auto text-fuchsia-500 mb-3" />
            <p className="text-3xl font-bold gradient-text">{s.v}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);
