import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Logo } from '../common/Logo.jsx';

const sections = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'New Arrivals', to: '/products?sort=-createdAt' },
      { label: 'Featured', to: '/products?isFeatured=true' },
      { label: 'Sale', to: '/products?discount[gt]=0' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', to: '/help-center' },
      { label: 'Returns', to: '/returns' },
      { label: 'Shipping', to: '/shipping' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
      { label: 'Press', to: '/press' },
    ],
  },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: Instagram },
  { label: 'Twitter', href: 'https://www.twitter.com', icon: Twitter },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: Youtube },
];

export const Footer = () => {
  const navigate = useNavigate();

  const handleNavigate = (to) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 border-t border-white/10 bg-[#070b14]/95">
      <div className="container grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
            Premium products for modern living. Quality you can trust, delivered with a polished shopping experience.
          </p>
          <div className="mt-5 flex gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit LuxeCart on ${label}`}
                className="rounded-full border border-white/10 bg-white/[0.06] p-2 text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="mb-4 font-semibold text-white">{section.title}</h4>
            <ul className="space-y-1">
              {section.links.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(link.to)}
                    className="block w-full rounded-md py-1.5 text-left text-sm text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} LuxeCart. All rights reserved.
      </div>
    </footer>
  );
};
