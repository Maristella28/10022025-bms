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
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <ShoppingBagIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Request Barangay Assets
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Browse and request available barangay assets for your community events and activities.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Assets"
              value={assets.length}
              icon={<ShoppingBagIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="In Stock"
              value={getStatusCount('In Stock')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Limited Stock"
              value={getStatusCount('Limited')}
              icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Available"
              value={getStatusCount('Available')}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Controls Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <Link to="/residents/statusassetrequests">
                <button className="flex items-center gap-3 px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <EyeIcon className="w-5 h-5" />
                  View Request Status
                </button>
              </Link>

              {/* Enhanced Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  />
                  <ShoppingBagIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6" /> Request Cart
              </h2>
              <ul className="divide-y divide-gray-100">
                {cart.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <img src={item.asset.image && item.asset.image.startsWith('/storage/') ? `http://localhost:8000${item.asset.image}` : item.asset.image} alt={item.asset.name} className="w-12 h-12 rounded-lg object-cover border" loading="lazy" />
                      <div>
                        <div className="font-semibold text-gray-900">{item.asset.name}</div>
                        <div className="text-sm text-gray-500">Date: {item.requestDate}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="p-2 rounded-full hover:bg-red-100 transition">
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleSubmitCart}
                disabled={submitting}
                className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit All Requests'}
              </button>
              {error && <div className="mt-2 text-red-600 font-medium">{error}</div>}
              {success && <div className="mt-2 text-green-600 font-medium">{success}</div>}
            </div>
          )}

          {/* Asset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : sortedAssets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <ShoppingBagIcon className="w-16 h-16 text-gray-300" />
                  <p className="text-gray-500 font-medium text-lg">No assets found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              sortedAssets.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => openDetailModal(item.id)}
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={item.image && item.image.startsWith('/storage/') ? `http://localhost:8000${item.image}` : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      {badge(item.availability || 'Available', getAvailabilityColor(item.availability || 'Available'), getAvailabilityIcon(item.availability || 'Available'))}
                    </div>
                    <div className="absolute top-3 right-3">
                      {badge(item.category, 'bg-blue-100 text-blue-800', <TagIcon className="w-3 h-3" />)}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
                      <span className="text-sm text-gray-600">({item.reviews || 0} reviews)</span>
                    </div>

                    {/* Price and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">₱{item.price && !isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{item.date || ''}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={e => { e.stopPropagation(); openRequestModal(item); }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                      disabled={item.stock < 1}
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      Request Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Asset Detail Modal */}
      {detailModal.open && detailModal.asset && (
        <Modal onClose={() => setDetailModal({ open: false, asset: null })}>
          <div className="max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-green-700">{detailModal.asset.name}</h2>
              <button onClick={() => setDetailModal({ open: false, asset: null })} className="p-2 rounded-full hover:bg-gray-100">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-700">Request: {requestModal.asset.name}</h2>
              <button onClick={() => setRequestModal({ open: false, asset: null })} className="p-2 rounded-full hover:bg-gray-100">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            {/* DEBUG: Show available_dates */}
            <div className="mb-2 text-xs text-gray-400">
              Available Dates (debug): {JSON.stringify(requestModal.asset.available_dates)}
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

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
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
