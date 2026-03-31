import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { restaurantAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { Search, Star, Clock, ChevronRight, Flame, Leaf, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CUISINES = ['All', 'South Indian', 'North Indian', 'Biryani', 'Burgers', 'Pizza', 'Chinese', 'Fast Food'];

export default function CustomerHome() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRestaurants = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const params = { page: reset ? 1 : page, limit: 9 };
      if (search) params.search = search;
      if (cuisine !== 'All') params.cuisine = cuisine;
      if (sort) params.sort = sort;
      const res = await restaurantAPI.getAll(params);
      const data = res.data.restaurants;
      setRestaurants(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === 9);
      if (reset) setPage(1);
    } catch {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [search, cuisine, sort, page]);

  useEffect(() => { fetchRestaurants(true); }, [search, cuisine, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero */}
      <div className="bg-gradient-to-r from-brand-500 to-orange-400 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">
            Hey {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-brand-100 mb-6">What are you craving today?</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              placeholder="Search restaurants or cuisines..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-1 shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              <option value="">Sort: Default</option>
              <option value="rating">Top Rated</option>
              <option value="deliveryTime">Fastest Delivery</option>
            </select>
          </div>
          <div className="flex gap-2 shrink-0">
            {CUISINES.map(c => (
              <button key={c} onClick={() => setCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  cuisine === c ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        {loading && restaurants.length === 0 ? (
          <LoadingSpinner size="lg" />
        ) : restaurants.length === 0 ? (
          <EmptyState icon={Search} title="No restaurants found" subtitle="Try adjusting your search or filters" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.map(r => <RestaurantCard key={r._id} restaurant={r} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => { setPage(p => p + 1); fetchRestaurants(); }} className="btn-secondary">
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant: r }) {
  return (
    <Link to={`/customer/restaurant/${r._id}`} className="card group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {r.image ? (
          <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}
        {!r.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-sm font-bold px-4 py-1.5 rounded-full">Closed</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {r.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="badge bg-white/90 text-gray-700 backdrop-blur-sm">
              {tag === 'Popular' && <Flame className="w-3 h-3 text-orange-500" />}
              {tag === 'Veg' && <Leaf className="w-3 h-3 text-green-500" />}
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base">{r.name}</h3>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <p className="text-xs text-gray-400 mb-3">{r.cuisine?.join(' · ')}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 font-semibold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {r.rating > 0 ? r.rating.toFixed(1) : 'New'}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.deliveryTime}</span>
          <span>Min ₹{r.minimumOrder}</span>
        </div>
      </div>
    </Link>
  );
}
