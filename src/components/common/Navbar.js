import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, ChefHat, Truck, LayoutDashboard } from 'lucide-react';

const roleNavItems = {
  customer: [
    { label: 'Home', path: '/customer' },
    { label: 'My Orders', path: '/customer/orders' },
    { label: 'Profile', path: '/customer/profile' },
  ],
  restaurant: [
    { label: 'Dashboard', path: '/restaurant' },
    { label: 'Orders', path: '/restaurant/orders' },
    { label: 'Menu', path: '/restaurant/menu' },
    { label: 'Profile', path: '/restaurant/profile' },
  ],
  delivery: [
    { label: 'Dashboard', path: '/delivery' },
    { label: 'Deliveries', path: '/delivery/orders' },
    { label: 'Earnings', path: '/delivery/earnings' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Restaurants', path: '/admin/restaurants' },
    { label: 'Orders', path: '/admin/orders' },
  ]
};

const roleColors = {
  customer: 'bg-brand-500',
  restaurant: 'bg-purple-600',
  delivery: 'bg-green-600',
  admin: 'bg-slate-800'
};

const RoleIcon = ({ role }) => {
  const cls = "w-4 h-4";
  if (role === 'restaurant') return <ChefHat className={cls} />;
  if (role === 'delivery') return <Truck className={cls} />;
  if (role === 'admin') return <LayoutDashboard className={cls} />;
  return <User className={cls} />;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navItems = roleNavItems[user.role] || [];
  const accentColor = roleColors[user.role] || 'bg-brand-500';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={`/${user.role}`} className="flex items-center gap-2">
            <div className={`${accentColor} text-white w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-sm`}>F</div>
            <span className="font-display font-bold text-xl text-gray-900">FooDash</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
              user.role === 'customer' ? 'bg-brand-100 text-brand-700' :
              user.role === 'restaurant' ? 'bg-purple-100 text-purple-700' :
              user.role === 'delivery' ? 'bg-green-100 text-green-700' :
              'bg-slate-100 text-slate-700'
            }`}>{user.role}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user.role === 'customer' && (
              <Link to="/customer/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className={`w-8 h-8 ${accentColor} rounded-full flex items-center justify-center text-white`}>
                <RoleIcon role={user.role} />
              </div>
              <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">{user.name}</span>
            </div>

            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t border-gray-100 animate-fade-in">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-1 mb-1 ${
                  location.pathname === item.path ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
