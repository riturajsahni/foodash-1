import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import Navbar from '../../components/common/Navbar';
import { LoadingSpinner, StatusBadge, formatCurrency, formatDate, formatTime } from '../../components/common';
import { CheckCircle, Clock, ChefHat, Bike, Package, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { status: 'pending',          icon: Clock,       label: 'Order Placed' },
  { status: 'confirmed',        icon: CheckCircle, label: 'Confirmed' },
  { status: 'preparing',        icon: ChefHat,     label: 'Preparing' },
  { status: 'ready',            icon: Package,     label: 'Ready' },
  { status: 'out_for_delivery', icon: Bike,        label: 'On the Way' },
  { status: 'delivered',        icon: CheckCircle, label: 'Delivered' },
];

const ORDER_STATUS_INDEX = {
  pending: 0, confirmed: 1, preparing: 2, ready: 3,
  picked_up: 3, out_for_delivery: 4, delivered: 5, cancelled: -1, rejected: -1
};

export default function OrderTracking() {
  const { id } = useParams();
  const socketRef = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(res => { setOrder(res.data.order); setRated(!!res.data.order.rating); })
      .catch(() => toast.error('Could not load order'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    socket.emit('track_order', id);
    socket.on('order_status_update', ({ orderId, order: updatedOrder }) => {
      if (orderId === id || orderId === order?._id) {
        setOrder(updatedOrder);
        toast.success(`Order status: ${updatedOrder.status.replace('_', ' ').toUpperCase()}`);
      }
    });
    return () => { socket.off('order_status_update'); socket.emit('stop_tracking', id); };
  }, [id, socketRef, order?._id]);

  const handleRate = async () => {
    if (!rating) return toast.error('Please select a rating');
    try {
      await orderAPI.rate(id, { rating, review });
      setRated(true);
      toast.success('Thank you for your feedback!');
    } catch { toast.error('Failed to submit rating'); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><LoadingSpinner size="lg" /></div>;
  if (!order) return <div className="min-h-screen bg-gray-50"><Navbar /><p className="text-center py-16">Order not found</p></div>;

  const stepIndex = ORDER_STATUS_INDEX[order.status] ?? 0;
  const isCancelled = ['cancelled', 'rejected'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link to="/customer/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="card p-5 mb-4">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-400 font-medium">Order #{order.orderNumber}</p>
              <h1 className="font-display text-xl font-bold text-gray-900">{order.restaurant?.name}</h1>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">{formatDate(order.createdAt)} at {formatTime(order.createdAt)}</p>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="card p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-5 text-sm">Live Tracking</h2>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
              <div className="absolute top-5 left-5 h-0.5 bg-brand-400 transition-all duration-500"
                style={{ width: stepIndex > 0 ? `${(stepIndex / (STEPS.length - 1)) * 100}%` : '0%' }} />
              <div className="relative flex justify-between">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= stepIndex;
                  const active = idx === stepIndex;
                  return (
                    <div key={step.status} className="flex flex-col items-center gap-2 w-14">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                        done ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-gray-200 text-gray-300'
                      } ${active ? 'ring-4 ring-brand-100 scale-110' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-center leading-tight text-xs font-medium ${done ? 'text-brand-600' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {order.deliveryPartner && (
              <div className="mt-5 bg-brand-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {order.deliveryPartner.name?.[0] || 'D'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.deliveryPartner.name}</p>
                  <p className="text-xs text-gray-500">{order.deliveryPartner.phone} · Delivery Partner</p>
                </div>
                <Bike className="w-5 h-5 text-brand-400 ml-auto" />
              </div>
            )}
          </div>
        )}

        {/* Order items */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Order Items</h2>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-gray-500">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.pricing.subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery fee</span><span>{formatCurrency(order.pricing.deliveryFee)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.pricing.tax)}</span></div>
            <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatCurrency(order.pricing.total)}</span>
            </div>
          </div>
        </div>

        {/* Rate order */}
        {order.status === 'delivered' && !rated && (
          <div className="card p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-3">Rate Your Experience</h2>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star className={`w-7 h-7 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`} />
                </button>
              ))}
            </div>
            <textarea value={review} onChange={e => setReview(e.target.value)}
              className="input text-sm resize-none mb-3" rows={2} placeholder="Tell us about your experience..." />
            <button onClick={handleRate} className="btn-primary">Submit Review</button>
          </div>
        )}
        {rated && <div className="card p-4 mb-4 bg-green-50 border border-green-100 text-center text-sm text-green-700 font-semibold">✅ Review submitted. Thank you!</div>}
      </div>
    </div>
  );
}
