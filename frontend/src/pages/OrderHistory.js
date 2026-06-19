import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/my-orders', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'var(--accent-2)';
      case 'processing':
        return 'var(--accent)';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return 'var(--success)';
      default:
        return 'var(--muted)';
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Please login to view your orders</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">No orders yet. Start shopping!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container stack">
        <h1>Order History</h1>
        {orders.map(order => (
          <div key={order._id} className="summary-card stack">
            <div className="filters__row" style={{ justifyContent: 'space-between' }}>
              <div>
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <div className="muted">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className="badge" style={{ background: getStatusColor(order.status) }}>
                {order.status}
              </span>
            </div>

            <div className="grid-list">
              {order.items.map((item, index) => (
                <div key={index} className="filters__row" style={{ justifyContent: 'space-between' }}>
                  <span>{item.product?.title || 'Product'} x {item.quantity}</span>
                  <span className="muted">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="filters__row" style={{ justifyContent: 'space-between' }}>
              <span>Total</span>
              <span className="price">${order.totalAmount.toFixed(2)}</span>
            </div>

            <div className="muted">Payment Method: {order.paymentMethod}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
