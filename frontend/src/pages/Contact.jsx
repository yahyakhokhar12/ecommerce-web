import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from '../components/forms/ContactForm.jsx';

export const Contact = () => (
  <div className="container py-16">
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
        Support that feels human
      </div>
      <h1 className="text-5xl font-black tracking-tight text-white">Get in <span className="gradient-text">Touch</span></h1>
      <p className="mt-4 text-slate-400">Questions about orders, products, returns, or partnerships? Send a note and the team will help.</p>
    </div>
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        {[
          { i: Mail, t: 'Email', d: 'support@luxecart.com' },
          { i: Phone, t: 'Phone', d: '+1 (555) 123-4567' },
          { i: MapPin, t: 'Address', d: '123 Premium St, NY, USA' },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08]">
              <Icon className="h-5 w-5 text-teal-300" />
            </div>
            <p className="font-semibold text-white">{t}</p>
            <p className="mt-1 text-sm text-slate-400">{d}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20">
        <ContactForm />
      </div>
    </div>
  </div>
);
