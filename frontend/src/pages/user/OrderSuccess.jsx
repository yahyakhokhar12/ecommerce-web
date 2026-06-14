import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetOrderQuery } from '../../api/apiSlice.js';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../features/cart/cartSlice.js';
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  Home,
  ShoppingBag,
  CreditCard,
  MapPin,
  Calendar,
  Copy,
  Download,
  Share2,
  Sparkles,
  ArrowRight,
  Receipt,
  Phone,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Separator } from '../../components/ui/separator.jsx';
import { formatPrice, formatDate } from '../../lib/utils.js';

const Confetti = () => {
  const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 6,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            top: -20,
            left: `${p.left}%`,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            top: '110%',
            rotate: p.rotate * 3,
            opacity: 0,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

const OrderStatusTimeline = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="relative">
      <div className="flex justify-between items-start">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= effectiveIndex;
          const isCurrent = i === effectiveIndex;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15, type: 'spring' }}
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'gradient-bg shadow-lg shadow-fuchsia-500/30'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-fuchsia-500/20' : ''}`}
              >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : ''}`} />
              </motion.div>
              <p
                className={`text-xs sm:text-sm font-medium mt-2 text-center ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
      <div className="absolute top-5 sm:top-6 left-0 right-0 h-0.5 bg-muted -z-0">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(effectiveIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full gradient-bg"
        />
      </div>
    </div>
  );
};

export const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showConfetti, setShowConfetti] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  const { data, isLoading, error } = useGetOrderQuery(id);
  const order = data?.data;

  useEffect(() => {
    dispatch(clearCart());
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => setEmailSent(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success('Order number copied!');
    }
  };

  const handleShare = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order ${order.orderNumber}`,
          text: `I just ordered from LuxeCart! Order #${order.orderNumber}`,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyOrderNumber();
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <Package className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="text-muted-foreground mt-2">
          We couldn't find this order. It may have been cancelled.
        </p>
        <Button asChild variant="gradient" className="mt-6">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="container py-8 max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mb-6 relative"
          >
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 2 }}
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            />
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Order <span className="gradient-text">Confirmed!</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Thank you for your purchase 🎉
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            A confirmation email has been sent to your inbox.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          <Button variant="outline" size="sm" onClick={handleCopyOrderNumber}>
            <Copy className="h-4 w-4" /> Copy Order #
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/v1/orders/${order._id}/invoice`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> Invoice
            </a>
          </Button>
        </motion.div>

        {/* Order Number Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6 overflow-hidden border-0">
            <div className="gradient-bg p-6 text-white relative">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="relative grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Order Number</p>
                  <p className="text-lg sm:text-xl font-bold mt-1 break-all">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Order Date</p>
                  <p className="text-lg font-semibold mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Total Amount</p>
                  <p className="text-lg sm:text-xl font-bold mt-1">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-fuchsia-500" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline status={order.orderStatus} />
              <div className="mt-6 p-4 glass rounded-xl flex items-start gap-3">
                <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Estimated Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(estimatedDelivery)} ({Math.ceil((estimatedDelivery - new Date()) / (1000 * 60 * 60 * 24))} days)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-fuchsia-500" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 glass rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2 text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary & Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-fuchsia-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
                    {order.shippingPrice === 0 ? (
                      <span className="text-emerald-500">Free</span>
                    ) : (
                      formatPrice(order.shippingPrice)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.taxPrice)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="gradient-text">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-fuchsia-500" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{order.shippingAddress.fullName}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-2">
                    <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-fuchsia-500" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{order.paymentInfo?.method}</p>
                    {order.paymentInfo?.transactionId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {order.paymentInfo.transactionId}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      order.paymentInfo?.status === 'paid' ? 'success' : 'secondary'
                    }
                  >
                    {order.paymentInfo?.status || 'pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Email Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center shrink-0">
                  {emailSent ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {emailSent ? 'Email confirmation sent' : 'Sending email...'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {emailSent
                      ? 'Check your inbox for order details and tracking information.'
                      : 'Just a moment while we send your order details.'}
                  </p>
                </div>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-fuchsia-500" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: Package,
                    title: 'Track Your Order',
                    desc: 'Get real-time updates',
                    link: `/orders/${order._id}`,
                    label: 'Track Now',
                  },
                  {
                    icon: ShoppingBag,
                    title: 'Continue Shopping',
                    desc: 'Discover more products',
                    link: '/products',
                    label: 'Browse',
                  },
                  {
                    icon: Home,
                    title: 'Back to Home',
                    desc: 'Return to homepage',
                    link: '/',
                    label: 'Go Home',
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      <Link
                        to={item.link}
                        className="block p-4 glass rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all group"
                      >
                        <Icon className="h-6 w-6 text-fuchsia-500 mb-3 group-hover:scale-110 transition" />
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        <p className="text-xs text-fuchsia-500 mt-3 flex items-center gap-1 font-medium">
                          {item.label} <ArrowRight className="h-3 w-3" />
                        </p>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Need help with your order?{' '}
            <Link to="/contact" className="text-fuchsia-500 hover:underline font-medium">
              Contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};
