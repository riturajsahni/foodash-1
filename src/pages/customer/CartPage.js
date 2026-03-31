import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import { formatCurrency, EmptyState } from '../../components/common';
import { ShoppingCart, Minus, Plus, Trash2, MapPin, CreditCard, Bike } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, restaurantId, restaurantName, addItem, removeItem, deleteItem, clearCart, subtotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  });
  const [instructions, setInstructions] = useState('');
  const [placing, setPlacing] = useState(false);

  const deliveryFee = 30;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city) return toast.error('Please enter delivery address');
    if (items.length === 0) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        menuItemId: i._id,
        quantity: i.qty,
        customizations: []
      }));
      const res = await orderAPI.place({
        restaurantId,
        items: orderItems,
        deliveryAddress: address,
        paymentMethod,
        specialInstructions: instructions
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/customer/orders/${res.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          subtitle="Add items from a restaurant to get started"
          action={<button onClick={() => navigate('/customer')} className="btn-primary">Browse Restaurants</button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-3 space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">{restaurantName}</h2>
                  <p className="text-xs text-gray-400">{itemCount} item{itemCount > 1 ? 's' : ''}</p>
                </div>
                <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-sm text-brand-600 font-bold mt-0.5">{formatCurrency((item.discountedPrice || item.price) * item.qty)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
                      <button onClick={() => removeItem(item._id)} className="text-brand-500 hover:text-brand-700">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => addItem(item, { _id: restaurantId, name: restaurantName })} className="text-brand-500 hover:text-brand-700">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => deleteItem(item._id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Special instructions */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Special Instructions (Optional)</h3>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
                className="input text-sm resize-none" rows={2} placeholder="Any special requests..." />
            </div>

            {/* Delivery Address */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-brand-500" />
                <h3 className="font-semibold text-gray-800">Delivery Address</h3>
              </div>
              <div className="space-y-2">
                <input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))}
                  className="input text-sm" placeholder="Street address *" required />
                <div className="grid grid-cols-2 gap-2">
                  <input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                    className="input text-sm" placeholder="City *" required />
                  <input value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))}
                    className="input text-sm" placeholder="Pincode" />
                </div>
                <input value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))}
                  className="input text-sm" placeholder="State" />
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <h3 className="font-semibold text-gray-800">Payment Method</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  { value: 'online', label: 'Pay Online', icon: '💳' },
                ].map(pm => (
                  <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === pm.value ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-xl block mb-1">{pm.icon}</span>
                    <span className={`text-sm font-semibold ${paymentMethod === pm.value ? 'text-brand-700' : 'text-gray-700'}`}>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Bike className="w-3.5 h-3.5" /> Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (5%)</span><span>{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing}
                className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                {placing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                ) : `Place Order · ${formatCurrency(total)}`}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Estimated delivery: 30–45 mins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
