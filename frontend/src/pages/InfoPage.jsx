import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Briefcase, FileText, HelpCircle, Newspaper, PackageCheck, Truck } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

const pages = {
  '/help-center': { icon: HelpCircle, title: 'Help Center', body: 'Find quick answers about orders, accounts, payments, and product support.', points: ['Track orders from your dashboard', 'Manage account and password settings', 'Contact support for order-specific help'], cta: { label: 'Contact Support', to: '/contact' } },
  '/returns': { icon: PackageCheck, title: 'Returns', body: 'Start a return for eligible products within 30 days of delivery.', points: ['Items must be unused and in original packaging', 'Refunds are processed after inspection', 'Return shipping details are shared by email'], cta: { label: 'View Orders', to: '/orders' } },
  '/shipping': { icon: Truck, title: 'Shipping', body: 'We offer reliable delivery options with clear order updates.', points: ['Free standard shipping on qualifying orders', 'Tracking numbers appear after dispatch', 'Delivery windows vary by destination'], cta: { label: 'Shop Products', to: '/products' } },
  '/careers': { icon: Briefcase, title: 'Careers', body: 'Join the LuxeCart team and help build a better shopping experience.', points: ['Product, engineering, design, and operations roles', 'Remote-friendly collaboration', 'Customer-obsessed culture'], cta: { label: 'Send Your Profile', to: '/contact' } },
  '/blog': { icon: Newspaper, title: 'Blog', body: 'Read buying guides, product stories, and updates from LuxeCart.', points: ['New arrival roundups', 'Gift guides and seasonal edits', 'Behind-the-scenes product notes'], cta: { label: 'Browse Products', to: '/products' } },
  '/press': { icon: FileText, title: 'Press', body: 'Media resources and company information for press inquiries.', points: ['Brand assets available on request', 'Company background and milestones', 'Media inquiries handled by support'], cta: { label: 'Contact Press', to: '/contact' } },
};

export const InfoPage = () => {
  const { pathname } = useLocation();
  const page = pages[pathname] || pages['/help-center'];
  const Icon = page.icon;

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/20">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.08] text-teal-300">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white">{page.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">{page.body}</p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {page.points.map((point) => (
            <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-400">
              {point}
            </div>
          ))}
        </div>
        <Button asChild className="mt-8 bg-white text-slate-950 hover:bg-slate-100">
          <Link to={page.cta.to}>
            {page.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
