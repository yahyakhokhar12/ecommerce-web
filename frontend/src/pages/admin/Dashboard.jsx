import { useGetDashboardQuery } from '../../api/apiSlice.js';
import { DollarSign, Package, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { Button } from '../../components/ui/button.jsx';
import { formatPrice } from '../../lib/utils.js';

const stats = [
  { label: 'Revenue', icon: DollarSign, key: 'totalRevenue', format: (value) => formatPrice(value || 0), accent: 'from-emerald-400 to-teal-300' },
  { label: 'Orders', icon: ShoppingBag, key: 'totalOrders', format: (value) => (value || 0).toLocaleString(), accent: 'from-violet-400 to-fuchsia-300' },
  { label: 'Products', icon: Package, key: 'totalProducts', format: (value) => (value || 0).toLocaleString(), accent: 'from-cyan-300 to-blue-300' },
  { label: 'Customers', icon: Users, key: 'totalCustomers', format: (value) => (value || 0).toLocaleString(), accent: 'from-amber-300 to-orange-300' },
];

export const AdminDashboard = () => {
  const { data, isLoading, isError, error, refetch } = useGetDashboardQuery();
  const dashboard = data?.data || {};

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
        <h1 className="text-2xl font-black text-white">Dashboard failed to load</h1>
        <p className="mt-2 text-sm text-red-200">
          {error?.data?.message || 'Check that your admin account is logged in and the backend is running.'}
        </p>
        <Button onClick={refetch} className="mt-6 bg-white text-slate-950 hover:bg-slate-100">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-teal-300" />
              Admin command center
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Dashboard</h1>
            <p className="mt-2 text-slate-400">Monitor revenue, orders, customers, and catalog health.</p>
          </div>
          <Button onClick={refetch} variant="outline" className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, icon: Icon, key, format, accent }) => (
          <div key={label} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-xl shadow-black/20">
            <div className={`h-1 bg-gradient-to-r ${accent}`} />
            <div className="p-6">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08]">
                <Icon className="h-5 w-5 text-teal-300" />
              </div>
              <p className="text-sm text-slate-400">{label}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-28 bg-white/10" />
              ) : (
                <p className="mt-1 text-3xl font-black text-white">{format(dashboard[key])}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-white">Order Pipeline</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.05] p-4">
              <p className="text-sm text-slate-400">Pending</p>
              <p className="mt-1 text-2xl font-black text-white">{dashboard.pendingOrders || 0}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-4">
              <p className="text-sm text-slate-400">Processing</p>
              <p className="mt-1 text-2xl font-black text-white">{dashboard.processingOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/20">
          <h2 className="text-xl font-bold text-white">System Status</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-400">
            <p className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-3"><span>API</span><span className="text-emerald-300">Online</span></p>
            <p className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-3"><span>Auth</span><span className="text-emerald-300">Protected</span></p>
            <p className="flex items-center justify-between rounded-2xl bg-white/[0.05] p-3"><span>Catalog</span><span className="text-emerald-300">Ready</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
