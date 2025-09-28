import React, { useEffect, useState } from 'react';
import axios from '../../../../utils/axiosConfig'; // Adjust path if needed
import { Link } from 'react-router-dom';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";
import {
  EyeIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const StatusAssetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/asset-requests');
      
      // Handle the response data properly
      let data = response.data;
      
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        setRequests(data);
      }
      // If data has a data property (common Laravel API structure)
      else if (data && Array.isArray(data.data)) {
        setRequests(data.data);
      }
      else {
        // If we can't parse the response, show empty array
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching asset requests:', err);
      setError('Failed to load requests');
      // Show empty array on error
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // No longer using localStorage
  const updateLocalStorage = (newRequests) => {
    // Not implemented - we're using the API instead
  };

  const handleDelete = async (indexToRemove) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const itemToDelete = requests[indexToRemove];
        // Call API to delete the request
        await axios.delete(`/asset-requests/${itemToDelete.id}`);
        
        // Update local state
        const updated = requests.filter((_, i) => i !== indexToRemove);
        setRequests(updated);
        setLastDeleted({ item: itemToDelete, index: indexToRemove });
      } catch (err) {
        console.error('Error deleting request:', err);
        alert('Failed to delete request. Please try again.');
      }
    }
  };

  const handleUndo = async () => {
    if (lastDeleted) {
      // We can't actually undo a delete operation, so we'll just remove the undo state
      setLastDeleted(null);
      // Refresh the list to show current state
      await fetchRequests();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to refresh the request list? This will clear any local changes.')) {
      // Refresh the list from the API
      await fetchRequests();
      setLastDeleted(null);
    }
  };

  // Helper function to safely render text content
  const renderText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      // If it's an object, try to find a name or title property
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.asset_name) return value.asset_name;
      // If none found, return a string representation
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Helper function to get asset name
  const getAssetName = (item) => {
    // Handle the API structure from admin controller
    if (item.asset && typeof item.asset === 'object' && item.asset.name) {
      return item.asset.name;
    }
    // Fallback for other structures
    if (typeof item.asset === 'string') return item.asset;
    if (item.asset_name) return item.asset_name;
    if (item.name) return item.name;
    return 'Unknown Asset';
  };

  // Helper function to get date
  const getDate = (item) => {
    // Handle the API structure from admin controller
    if (item.request_date) return item.request_date;
    if (item.date) return item.date;
    if (item.created_at) return new Date(item.created_at).toLocaleDateString();
    return 'N/A';
  };

  // Helper function to get status
  const getStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.status) return item.status;
    if (item.request_status) return item.request_status;
    return 'Pending';
  };

  // Helper function to get payment status
  const getPaymentStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.payment_status) return item.payment_status;
    return 'unpaid';
  };

  // Helper function to get receipt number
  const getReceiptNumber = (item) => {
    // Handle the API structure from admin controller
    if (item.receipt_number) return item.receipt_number;
    return null;
  };

  // Helper function to get amount
  const getAmount = (item) => {
    let amount = 0;
    
    // Handle the API structure from admin controller
    if (item.amount_paid !== null && item.amount_paid !== undefined) {
      amount = parseFloat(item.amount_paid) || 0;
    } else if (item.total_amount !== null && item.total_amount !== undefined) {
      amount = parseFloat(item.total_amount) || 0;
    } else if (item.amount !== null && item.amount !== undefined) {
      amount = parseFloat(item.amount) || 0;
    }
    
    return amount;
  };

  // Generate Receipt
  const generateReceipt = async (item) => {
    try {
      // Get the receipt number and amount from the item
      const receiptNumber = getReceiptNumber(item);
      const amount = getAmount(item) || 0;
      const assetName = getAssetName(item);
      const date = getDate(item);
      
      // Call backend to generate PDF receipt
      const response = await axios.post('/asset-requests/generate-receipt', {
        asset_request_id: item.id,
        receipt_number: receiptNumber,
        amount_paid: amount
      }, {
        responseType: 'blob'
      });

      // Create download link for PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
            {/* Header Skeleton */}
            <div className="text-center space-y-6">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-300 rounded-xl w-1/3 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded-lg w-1/2 mx-auto animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-8 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="space-y-6">
                {/* Table header skeleton */}
                <div className="grid grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-300 rounded-lg animate-pulse"></div>
                  ))}
                </div>
                
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 py-4 border-t border-gray-200">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Calculate statistics
  const totalRequests = requests.length;
  const approvedRequests = requests.filter(item => getStatus(item) === 'Approved').length;
  const pendingRequests = requests.filter(item => getStatus(item) === 'Pending').length;
  const paidRequests = requests.filter(item => getPaymentStatus(item) === 'paid').length;
  const totalAmount = requests.reduce((sum, item) => sum + getAmount(item), 0);

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
                <EyeIcon className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Asset Request Status
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Track and manage your barangay asset requests.
              <span className="text-emerald-600 font-semibold"> Stay updated on your requests and payments.</span>
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={totalRequests}
              icon={<EyeIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              label="Approved"
              value={approvedRequests}
              icon={<CheckCircleIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              label="Pending"
              value={pendingRequests}
              icon={<ClockIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-yellow-500 to-orange-500"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              label="Paid"
              value={paidRequests}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              label="Total Amount"
              value={`₱${totalAmount.toFixed(2)}`}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
              iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
              gradient="from-purple-500 to-pink-600"
            />
          </div>

          {/* Enhanced Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchRequests}
                  className="group flex items-center gap-3 px-6 py-3 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 hover:from-green-700 hover:via-emerald-700 hover:to-blue-700 text-white border-2 border-green-400 hover:border-green-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <ArrowPathIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Refresh</span>
                </button>
                <Link to="/residents/requestAssets">
                  <button className="group flex items-center gap-3 px-6 py-3 font-bold rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-2 border-gray-400 hover:border-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <EyeIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">← Back to Request Assets</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-medium flex items-center gap-3 mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            {lastDeleted && (
              <button
                onClick={handleUndo}
                className="group flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Undo Delete
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="group flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 ml-auto"
            >
              <TrashIcon className="w-4 h-4" />
              Clear All User Requests
            </button>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Date Requested</th>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((item, index) => (
                    <tr key={index} className="group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                            <EyeIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{renderText(getAssetName(item))}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          {renderText(getDate(item))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={getStatus(item)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <PaymentBadge status={getPaymentStatus(item)} />
                          {getReceiptNumber(item) && (
                            <div className="text-xs text-gray-500 font-medium">
                              Receipt: {getReceiptNumber(item)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                          <CurrencyDollarIcon className="w-5 h-5" />
                          ₱{(getAmount(item) || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentStatus(item) === 'paid' && getReceiptNumber(item) && (
                            <button
                              onClick={() => generateReceipt(item)}
                              className="group/btn flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4" />
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(index)}
                            className="group/btn flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-16">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <EyeIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-500 font-bold text-lg">No asset requests found</p>
                            <p className="text-gray-400 text-sm">Your requests will appear here once submitted</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
    </>
  );
};

// StatCard Component
const StatCard = ({ label, value, icon, iconBg, gradient }) => (
  <div className="group bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 flex justify-between items-center transform hover:-translate-y-2 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
      {icon}
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <CheckCircleIcon className="w-4 h-4" />
        };
      case 'Pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <ClockIcon className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: <XCircleIcon className="w-4 h-4" />
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

// Payment Badge Component
const PaymentBadge = ({ status }) => {
  const isPaid = status === 'paid';
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
      isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      <CurrencyDollarIcon className="w-4 h-4" />
      {isPaid ? 'Paid' : 'Unpaid'}
    </span>
  );
};

export default StatusAssetRequests;