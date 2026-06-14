import { Link } from 'react-router-dom';
import { Package, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useGetMyOrdersQuery, useGetWishlistQuery } from '../../api/apiSlice.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: ordersData } = useGetMyOrdersQuery();
  const { data: wishData } = useGetWishlistQuery();

  const stats = [
    { label: 'Total Orders', value: ordersData?.data?.orders?.length || 0, icon: Package, color: 'from-violet-500 to-purple-500' },
    { label: 'Wishlist Items', value: wishData?.data?.products?.length || 0, icon: Heart, color: 'from-pink-500 to-rose-500' },
    { label: 'Delivered', value: ordersData?.data?.orders?.filter(o => o.orderStatus === 'delivered').length || 0, icon: ShoppingBag, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.name} 👋</h1>
      <p className="text-muted-foreground mt-1">Manage your account and orders</p>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${s.color}`} />
            <CardContent className="p-6">
              <s.icon className="h-8 w-8 text-fuchsia-500 mb-3" />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <Link to="/orders" className="glass p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg transition">
          <Package className="h-8 w-8 text-fuchsia-500" />
          <div>
            <p className="font-semibold">View Orders</p>
            <p className="text-sm text-muted-foreground">Track your purchases</p>
          </div>
        </Link>
        <Link to="/profile" className="glass p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg transition">
          <UserIcon className="h-8 w-8 text-violet-500" />
          <div>
            <p className="font-semibold">Edit Profile</p>
            <p className="text-sm text-muted-foreground">Update your info</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
