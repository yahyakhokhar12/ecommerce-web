import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Truck,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Loader2,
  Download,
  MoreVertical,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../api/ordersApi.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import { formatPrice, formatDate } from '../../lib/utils.js';

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock, color: 'text-yellow-500' },
  processing: { label: 'Processing', variant: 'default', icon: Package, color: 'text-blue-500' },
  shipped: { label: 'Shipped', variant: 'secondary', icon: Truck, color: 'text-violet-500' },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2, color: 'text-emerald-500' },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle, color: 'text-red-500' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="capitalize">
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

const OrderRow = ({ order, onView, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.orderStatus] || statusConfig.pending;
  const Icon = config.icon;

  const copyOrderNumber = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(order.orderNumber);
    toast.success('Order number copied');
  };

  return (
    <>
      <tr
        className="border-b hover:bg-muted/50 cursor-pointer transition"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div>
              <div className="flex items-center gap-1">
                <p className="font-medium text-sm">{order.orderNumber}</p>
                <button
                  onClick={copyOrderNumber}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          {order.user ? (
            <div>
              <p className="font-medium text-sm">{order.user.name}</p>
              <p className="text-xs text-muted-foreground">{order.user.email}</p>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">N/A</span>
          )}
        </td>
        <td className="p-4">
          <p className="text-sm font-medium">{order.items.length}</p>
          <p className="text-xs text-muted-foreground">items</p>
        </td>
        <td className="p-4 font-semibold">{formatPrice(order.totalPrice)}</td>
        <td className="p-4">
          <StatusBadge status={order.orderStatus} />
        </td>
        <td className="p-4">
          <Badge variant={order.paymentInfo?.status === 'paid' ? 'success' : 'secondary'}>
            {order.paymentInfo?.status || 'pending'}
          </Badge>
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onView(order);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(order);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="p-0">
              <motion.tr
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/30"
              >
                <td colSpan={7} className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-fuchsia-500" />
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2 glass rounded-lg"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Shipping & Payment */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-fuchsia-500" />
                          Shipping Address
                        </h4>
                        <div className="p-3 glass rounded-lg text-sm space-y-1">
                          <p className="font-medium">{order.shippingAddress.fullName}</p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.zipCode}
                          </p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress.country}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1 pt-1">
                            <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-fuchsia-500" />
                            Tracking
                          </h4>
                          <div className="p-3 glass rounded-lg text-sm space-y-1">
                            <p>
                              <span className="text-muted-foreground">Carrier:</span>{' '}
                              {order.carrier}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Tracking #:</span>{' '}
                              <span className="font-mono">{order.trackingNumber}</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </motion.tr>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

const UpdateStatusDialog = ({ order, open, onOpenChange }) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      orderStatus: order?.orderStatus || 'pending',
      trackingNumber: order?.trackingNumber || '',
      carrier: order?.carrier || '',
      notes: order?.notes || '',
    },
  });

  const selectedStatus = watch('orderStatus');

  const onSubmit = async (data) => {
    try {
      await updateOrderStatus({
        id: order._id,
        status: data.orderStatus,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
      }).unwrap();
      toast.success('Order updated successfully');
      onOpenChange(false);
      reset();
    } catch (e) {
      toast.error(e?.data?.message || 'Failed to update order');
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Order {order.orderNumber} — {formatPrice(order.totalPrice)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Order Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setValue('orderStatus', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="processing">📦 Processing</SelectItem>
                <SelectItem value="shipped">🚚 Shipped</SelectItem>
                <SelectItem value="delivered">✅ Delivered</SelectItem>
                <SelectItem value="cancelled">❌ Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(selectedStatus === 'shipped' || order.trackingNumber) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Carrier</Label>
                  <Input
                    placeholder="UPS, FedEx, DHL..."
                    {...register('carrier')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tracking Number</Label>
                  <Input
                    placeholder="1Z999..."
                    {...register('trackingNumber')}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Internal Notes (Optional)</Label>
            <Textarea
              rows={3}
              placeholder="Add a note about this order update..."
              {...register('notes')}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                'Update Order'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ViewOrderDialog = ({ order, open, onOpenChange }) => {
  if (!order) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            {order.orderNumber} • {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Status Row */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.orderStatus} />
            <Badge variant={order.paymentInfo?.status === 'paid' ? 'success' : 'secondary'}>
              <CreditCard className="h-3 w-3 mr-1" />
              {order.paymentInfo?.status || 'pending'}
            </Badge>
          </div>

          {/* Customer */}
          {order.user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-fuchsia-500" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{order.user.name}</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {order.user.email}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-fuchsia-500" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="gradient-text">{formatPrice(order.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-fuchsia-500" />
                Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.street}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);
  const [updateOrder, setUpdateOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    page,
    limit: 15,
  });

  const orders = data?.data?.orders || [];
  const total = data?.data?.total || 0;
  const pages = Math.ceil(total / 15);

  // Filter orders locally
  const filteredOrders = orders.filter((order) => {
    if (search) {
      const s = search.toLowerCase();
      const matches =
        order.orderNumber.toLowerCase().includes(s) ||
        order.user?.name?.toLowerCase().includes(s) ||
        order.user?.email?.toLowerCase().includes(s) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(s);
      if (!matches) return false;
    }
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) return false;
    if (paymentFilter !== 'all' && order.paymentInfo?.status !== paymentFilter) return false;
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(order.createdAt) < cutoff) return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'pending').length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    revenue: orders
      .filter((o) => o.paymentInfo?.status === 'paid')
      .reduce((sum, o) => sum + o.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'from-slate-500 to-slate-600', icon: Package },
          { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500', icon: Clock },
          { label: 'Processing', value: stats.processing, color: 'from-blue-500 to-cyan-500', icon: Package },
          { label: 'Shipped', value: stats.shipped, color: 'from-violet-500 to-purple-500', icon: Truck },
          { label: 'Delivered', value: stats.delivered, color: 'from-emerald-500 to-teal-500', icon: CheckCircle2 },
          { label: 'Revenue', value: formatPrice(stats.revenue), color: 'from-pink-500 to-rose-500', icon: DollarSign, isPrice: true },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${s.color}`} />
                <CardContent className="p-4">
                  <Icon className="h-4 w-4 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`font-bold ${s.isPrice ? 'text-sm' : 'text-2xl'}`}>
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-4 font-medium">Order</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Items</th>
                <th className="text-left p-4 font-medium">Total</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Payment</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={7} className="p-4">
                      <Skeleton className="h-12 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onView={(o) => {
                      setViewOrder(o);
                      setViewDialogOpen(true);
                    }}
                    onUpdateStatus={(o) => {
                      setUpdateOrder(o);
                      setUpdateDialogOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pages) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ViewOrderDialog
        order={viewOrder}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      <UpdateStatusDialog
        order={updateOrder}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
      />
    </div>
  );
};
