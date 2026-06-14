import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useGetMyOrdersQuery } from '../../api/apiSlice.js';
import { Badge } from '../../components/ui/badge.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { formatPrice, formatDate } from '../../lib/utils.js';

const statusColors = {
  pending: 'warning', processing: 'default', shipped: 'secondary', delivered: 'success', cancelled: 'destructive',
};

export const Orders = () => {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = data?.data?.orders || [];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : !orders.length ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="block glass p-6 rounded-2xl hover:shadow-lg transition">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order #{o.orderNumber}</p>
                  <p className="text-sm">{formatDate(o.createdAt)}</p>
                </div>
                <Badge variant={statusColors[o.orderStatus] || 'default'}>{o.orderStatus}</Badge>
                <p className="font-bold text-lg">{formatPrice(o.totalPrice)}</p>
              </div>
              <div className="flex gap-2 mt-4">
                {o.items.slice(0, 4).map((i, idx) => (
                  <img key={idx} src={i.image} className="h-12 w-12 rounded object-cover" />
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
