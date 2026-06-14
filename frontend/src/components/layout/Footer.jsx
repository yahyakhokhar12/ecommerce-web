import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import { Logo } from '../common/Logo.jsx';

const sections = [
  { title: 'Shop', links: ['All Products', 'New Arrivals', 'Featured', 'Sale'] },
  { title: 'Support', links: ['Help Center', 'Returns', 'Shipping', 'Contact'] },
  { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
];

export const Footer = () => (
  <footer className="border-t bg-card mt-20">
    <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <Logo />
        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
          Premium products for modern living. Quality you can trust, delivered to your door.
        </p>
        <div className="flex gap-2 mt-4">
          {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="p-2 rounded-full glass hover:scale-110 transition">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      {sections.map((s) => (
        <div key={s.title}>
          <h4 className="font-semibold mb-4">{s.title}</h4>
          <ul className="space-y-2">
            {s.links.map((l) => (
              <li key={l}>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">{l}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} LuxeCart. All rights reserved.
    </div>
  </footer>
);
