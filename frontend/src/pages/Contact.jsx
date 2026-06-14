import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '../components/forms/ContactForm.jsx';

export const Contact = () => (
  <div className="container py-12">
    <h1 className="text-4xl font-bold text-center mb-12">Get in <span className="gradient-text">Touch</span></h1>
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {[
          { i: Mail, t: 'Email', d: 'support@luxecart.com' },
          { i: Phone, t: 'Phone', d: '+1 (555) 123-4567' },
          { i: MapPin, t: 'Address', d: '123 Premium St, NY, USA' },
        ].map((c) => (
          <div key={c.t} className="glass p-6 rounded-2xl flex items-center gap-4">
            <div className="gradient-bg p-3 rounded-xl"><c.i className="h-5 w-5 text-white" /></div>
            <div>
              <p className="font-semibold">{c.t}</p>
              <p className="text-sm text-muted-foreground">{c.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="glass p-8 rounded-2xl">
        <ContactForm />
      </div>
    </div>
  </div>
);
