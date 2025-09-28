import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../../utils/axiosConfig'; // Adjust path if needed
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const RequestAssets = () => {
  const [assets, setAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState({ open: false, asset: null });
  const [requestModal, setRequestModal] = useState({ open: false, asset: null });
  const [requestDate, setRequestDate] = useState(null);
  const [requestQty, setRequestQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Cache for assets data
  const [assetsCache, setAssetsCache] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  // Cache timeout (5 minutes)
  const CACHE_TIMEOUT = 5 * 60 * 1000;

  useEffect(() => {
    // Check if we have valid cached data
    const now = Date.now();
    if (assetsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TIMEOUT) {
      setAssets(assetsCache);
      setLoading(false);
      return;
    }
    
    // Fetch fresh data
    axios.get('/assets')
      .then(res => {
        setAssets(res.data);
        setAssetsCache(res.data);
        setCacheTimestamp(now);
      })
      .catch(() => alert('Failed to load assets'))
      .finally(() => setLoading(false));
  }, []);

  // Cleanup effect to prevent DOM manipulation errors
  useEffect(() => {
    return () => {
      // Clean up any lingering DatePicker poppers
      const poppers = document.querySelectorAll('.react-datepicker-popper');
      poppers.forEach(popper => {
        if (popper && popper.parentNode) {
          try {
            popper.parentNode.removeChild(popper);
          } catch (e) {
            console.warn('DatePicker cleanup warning on unmount:', e);
          }
        }
      });
    };
  }, []);

  // Fetch asset details for modal
  const openDetailModal = async (assetId) => {
    setDetailModal({ open: true, asset: null });
    try {
      const res = await axios.get(`/assets/${assetId}`);
      setDetailModal({ open: true, asset: res.data });
    } catch {
      setDetailModal({ open: false, asset: null });
      alert('Failed to load asset details');
    }
  };

  // Open request modal for asset
  const openRequestModal = (asset) => {
    setRequestModal({ open: true, asset });
    setRequestDate(null);
    setRequestQty(1);
    setError('');
  };

  // Add item to cart
  const addToCart = () => {
    if (!requestDate) {
      setError('Please select a date');
      return;
    }
    if (requestQty < 1 || requestQty > (requestModal.asset?.stock || 1)) {
      setError('Invalid quantity');
      return;
    }
    // Prevent duplicate asset+date in cart
    if (cart.some(item => item.asset.id === requestModal.asset.id && item.requestDate === requestDate.toISOString().slice(0,10))) {
      setError('You already added this asset for this date');
      return;
    }
    setCart([...cart, {
      asset: requestModal.asset,
      requestDate: requestDate.toISOString().slice(0,10),
      quantity: requestQty
    }]);
    setRequestModal({ open: false, asset: null });
    setRequestDate(null);
    setRequestQty(1);
    setError('');
  };

  // Remove item from cart
  const removeFromCart = (idx) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  // Submit all requests in cart
  const handleSubmitCart = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const items = cart.map(item => ({
        asset_id: item.asset.id,
        request_date: item.requestDate,
        quantity: item.quantity
      }));
      await axios.post('/assets/request', { items });
      setSuccess('Request(s) submitted!');
      setCart([]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Request failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', ...new Set(assets.map(item => item.category))];

  const filteredAssets = assets.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getStatusCount = (availability) => {
    return assets.filter(item => (item.availability || '').toLowerCase() === availability.toLowerCase()).length;
  };

  // Get available dates for date picker
  const getAvailableDates = (asset) => {
    if (!asset?.available_dates) return [];
    return asset.available_dates.map(dateStr => new Date(dateStr));
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <ShoppingBagIcon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Request Barangay Assets
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Browse and request available barangay assets for your community events and activities.
              <span className="text-emerald-600 font-semibold"> Discover what's available for your next project.</span>
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Assets"
              value={assets.length}
              icon={<ShoppingBagIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              label="In Stock"
              value={getStatusCount('In Stock')}
              icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              label="Limited Stock"
              value={getStatusCount('Limited')}
              icon={<ExclamationTriangleIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-yellow-500 to-orange-500"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              label="Available"
              value={getStatusCount('Available')}
              icon={<ClockIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
              gradient="from-blue-500 to-indigo-600"
            />
          </div>

          {/* Enhanced Controls Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <Link to="/residents/statusassetrequests">
                <button className="group flex items-center gap-3 px-8 py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white border-2 border-green-400 hover:border-green-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <EyeIcon className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">View Request Status</span>
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </button>
              </Link>

              {/* Enhanced Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-3xl">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search assets by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  />
                  <ShoppingBagIcon className="w-6 h-6 absolute left-4 top-4 text-gray-400" />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 rounded-2xl text-sm shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Sort by Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          {cart.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-700 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-6 h-6 text-white" />
                  </div>
                  Request Cart ({cart.length} items)
                </h2>
                <div className="text-sm text-gray-500 font-medium">
                  Ready to submit
                </div>
              </div>
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={item.asset.image && item.asset.image.startsWith('/storage/') ? `http://localhost:8000${item.asset.image}` : item.asset.image} 
                            alt={item.asset.name} 
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-green-300 transition-colors duration-300" 
                            loading="lazy" 
                          />
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.quantity}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{item.asset.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {item.requestDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              ₱{(item.asset.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(idx)} 
                        className="p-3 rounded-full hover:bg-red-100 transition-all duration-300 group-hover:scale-110"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-lg font-semibold text-gray-700">
                    Total: ₱{cart.reduce((sum, item) => sum + (item.asset.price * item.quantity), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={handleSubmitCart}
                  disabled={submitting}
                  className="group w-full bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-green-400 hover:border-green-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {submitting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white relative z-10"></div>
                  ) : (
                    <ShoppingBagIcon className="w-6 h-6 relative z-10" />
                  )}
                  <span className="relative z-10">
                    {submitting ? 'Submitting...' : 'Submit All Requests'}
                  </span>
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </button>
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    {success}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Asset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              // Enhanced loading skeleton
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded-xl w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-300 rounded-lg w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-300 rounded-lg w-1/3"></div>
                      <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
                    </div>
                    <div className="h-12 bg-gray-300 rounded-2xl w-full"></div>
                  </div>
                </div>
              ))
            ) : sortedAssets.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-bold text-xl mb-2">No assets found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters to find what you're looking for</p>
                  </div>
                </div>
              </div>
            ) : (
              sortedAssets.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden cursor-pointer"
                  onClick={() => openDetailModal(item.id)}
                >
                  {/* Image Section */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={item.image && item.image.startsWith('/storage/') ? `http://localhost:8000${item.image}` : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      {badge(item.availability || 'Available', getAvailabilityColor(item.availability || 'Available'), getAvailabilityIcon(item.availability || 'Available'))}
                    </div>
                    <div className="absolute top-4 right-4">
                      {badge(item.category, 'bg-blue-100 text-blue-800', <TagIcon className="w-3 h-3" />)}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-sm font-medium text-gray-800">Click to view details</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${(i < Math.floor(item.rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">({item.reviews || 0} reviews)</span>
                    </div>

                    {/* Price and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">₱{item.price && !isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-medium">{item.date || ''}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={e => { e.stopPropagation(); openRequestModal(item); }}
                      className="group/btn w-full bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-green-400 hover:border-green-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.stock < 1}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <ShoppingBagIcon className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Request Now</span>
                      <div className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>

      {/* Asset Detail Modal */}
      {detailModal.open && detailModal.asset && (
        <Modal onClose={() => setDetailModal({ open: false, asset: null })}>
          <div className="max-w-lg w-full p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-700">{detailModal.asset.name}</h2>
            </div>
            <img src={detailModal.asset.image && detailModal.asset.image.startsWith('/storage/') ? `http://localhost:8000${detailModal.asset.image}` : detailModal.asset.image} alt={detailModal.asset.name} className="w-full h-56 object-cover rounded-xl mb-4" loading="lazy" />
            <div className="mb-2 text-gray-700">{detailModal.asset.description}</div>
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              <span className="text-lg font-bold text-green-600">₱{detailModal.asset.price && !isNaN(Number(detailModal.asset.price)) ? Number(detailModal.asset.price).toFixed(2) : '0.00'}</span>
            </div>
            <div className="mb-2 text-gray-500">Category: {detailModal.asset.category}</div>
            <div className="mb-2 text-gray-500">Stock: {detailModal.asset.stock}</div>
            <div className="mb-2 text-gray-500">Available Dates: {detailModal.asset.available_dates?.join(', ') || 'N/A'}</div>
            <button
              onClick={() => { setDetailModal({ open: false, asset: null }); openRequestModal(detailModal.asset); }}
              className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              disabled={detailModal.asset.stock < 1}
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Request This Asset
            </button>
          </div>
        </Modal>
      )}

      {/* Request Modal */}
      {requestModal.open && requestModal.asset && (
        <Modal onClose={() => setRequestModal({ open: false, asset: null })}>
          <div className="max-w-md w-full p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-green-700">Request: {requestModal.asset.name}</h2>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <DatePicker
                selected={requestDate}
                onChange={date => setRequestDate(date)}
                includeDates={getAvailableDates(requestModal.asset)}
                minDate={new Date()}
                placeholderText="Select available date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                dateFormat="yyyy-MM-dd"
                popperContainer={({ children }) => (
                  <div className="datepicker-popper-container">
                    {children}
                  </div>
                )}
                onCalendarOpen={() => {
                  // Ensure proper DOM cleanup
                  const popper = document.querySelector('.react-datepicker-popper');
                  if (popper) {
                    popper.style.zIndex = '9999';
                  }
                }}
                onCalendarClose={() => {
                  // Clean up any lingering DOM elements
                  const poppers = document.querySelectorAll('.react-datepicker-popper');
                  poppers.forEach(popper => {
                    if (popper && popper.parentNode) {
                      try {
                        popper.parentNode.removeChild(popper);
                      } catch (e) {
                        console.warn('DatePicker cleanup warning:', e);
                      }
                    }
                  });
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={requestModal.asset.stock}
                value={requestQty}
                onChange={e => setRequestQty(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-400 mt-1">Available: {requestModal.asset.stock}</div>
            </div>
            {error && <div className="mb-2 text-red-600 font-medium">{error}</div>}
            <button
              onClick={addToCart}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" /> Add to Cart
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

const StatCard = ({ label, value, icon, iconBg, gradient }) => (
  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 flex justify-between items-center transform hover:-translate-y-2 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>{value}</p>
    </div>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

const getAvailabilityColor = (availability) => {
  switch (availability) {
    case 'In Stock':
      return 'bg-green-100 text-green-800';
    case 'Limited':
      return 'bg-yellow-100 text-yellow-800';
    case 'Available':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getAvailabilityIcon = (availability) => {
  switch (availability) {
    case 'In Stock':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Limited':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Available':
      return <ClockIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

// Modal component
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-2xl shadow-2xl relative animate-fade-in-up">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        aria-label="Close"
      >
        <XMarkIcon className="w-6 h-6 text-gray-500" />
      </button>
      {children}
    </div>
  </div>
);

export default RequestAssets;
