import { useGetDashboardQuery } from '../../api/apiSlice.js';
import { Card, CardContent } from '../../components/ui/card.jsx';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { formatPrice } from '../../lib/utils.js';

const stats = [
  { label: 'Revenue', icon: DollarSign, color: 'from-emerald-500 to-teal-500', key: 'totalRevenue', prefix: '$' },
  { label: 'Orders', icon: ShoppingBag, color: 'from-violet-500 to-purple-500', key: 'totalOrders' },
  { label: 'Products', icon: Package, color: 'from-pink-500 to-rose-500', key: 'totalProducts' },
  { label: 'Customers', icon: Users, color: 'from-blue-500 to-cyan-500', key: 'totalCustomers' },
];

export const AdminDashboard = () => {
  const { data, isLoading } = useGetDashboardQuery();
  const d = data?.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${s.color}`} />
            <CardContent className="p-6">
              <s.icon className="h-8 w-8 text-fuchsia-500 mb-3" />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> :
                <p className="text-3xl font-bold mt-1">{s.prefix || ''}{d?.[s.key]?.toLocaleString() || 0}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
