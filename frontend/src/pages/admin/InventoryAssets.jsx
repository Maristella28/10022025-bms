import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'denied':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'denied':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return <CheckCircleIcon className="w-3 h-3" />;
    default:
      return <CurrencyDollarIcon className="w-3 h-3" />;
  }
};

const initialForm = {
  asset_id: '',
  request_date: '',
  status: 'pending',
};

const InventoryAssets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending: 0,
    denied: 0,
    paid: 0
  });

  // Analytics and search state
  const [chartData, setChartData] = useState([]);
  const [analyticsYear, setAnalyticsYear] = useState('');
  const [analyticsMonth, setAnalyticsMonth] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchRequests(currentPage);
    fetchAssets();
  }, [currentPage]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRequests(currentPage);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentPage]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchRequests(currentPage, true);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    setToastMessage({
      type: 'success',
      message: `Auto-refresh ${!autoRefresh ? 'enabled' : 'disabled'}`,
      duration: 2000
    });
  };

  // Filter requests based on search and date
  useEffect(() => {
    setFilteredRequests(
      requests.filter((request) => {
        const matchesSearch =
          (request.resident && request.resident.profile &&
            `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.toLowerCase().includes(search.toLowerCase())) ||
          (request.resident && request.resident.residents_id &&
            request.resident.residents_id.toLowerCase().includes(search.toLowerCase())) ||
          (request.asset && request.asset.name &&
            request.asset.name.toLowerCase().includes(search.toLowerCase()));
        let matchesDate = true;
        if (selectedYear && request.request_date) {
          const date = new Date(request.request_date);
          if (isNaN(date.getTime()) || date.getFullYear() !== parseInt(selectedYear)) {
            matchesDate = false;
          }
        }
        if (selectedMonth && request.request_date && matchesDate) {
          const date = new Date(request.request_date);
          if (date.getMonth() + 1 !== parseInt(selectedMonth)) {
            matchesDate = false;
          }
        }
        return matchesSearch && matchesDate;
      })
    );
  }, [search, selectedYear, selectedMonth, requests]);

  const availableYears = useMemo(() => {
    const dataYears = new Set();
    requests.forEach((request) => {
      if (request.request_date) {
        const date = new Date(request.request_date);
        if (!isNaN(date.getTime())) {
          dataYears.add(date.getFullYear());
        }
      }
    });
    const currentYear = new Date().getFullYear();
    const minYear = 2020;
    const allYears = new Set(dataYears);
    for (let y = minYear; y <= currentYear + 1; y++) {
      allYears.add(y);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [requests]);

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [selectedYear]);

  const analyticsAvailableYears = useMemo(() => {
    const dataYears = new Set();
    requests.forEach((request) => {
      if (request.created_at) {
        const date = new Date(request.created_at);
        if (!isNaN(date.getTime())) {
          dataYears.add(date.getFullYear());
        }
      }
    });
    const currentYear = new Date().getFullYear();
    const minYear = 2020;
    const allYears = new Set(dataYears);
    for (let y = minYear; y <= currentYear + 1; y++) {
      allYears.add(y);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [requests]);

  const analyticsAvailableMonths = useMemo(() => {
    if (!analyticsYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [analyticsYear]);

  const filteredAnalyticsRequests = useMemo(() => {
    return requests.filter((request) => {
      if (!request.created_at) return false;
      const date = new Date(request.created_at);
      if (isNaN(date.getTime())) return false;
      if (analyticsYear && date.getFullYear() !== parseInt(analyticsYear)) return false;
      if (analyticsMonth && date.getMonth() + 1 !== parseInt(analyticsMonth)) return false;
      return true;
    });
  }, [analyticsYear, analyticsMonth, requests]);

  useEffect(() => {
    setChartData(generateChartData(filteredAnalyticsRequests));
  }, [analyticsYear, analyticsMonth, requests]);

  // Generate chart data for monthly request creation
  const generateChartData = (requests, year = null, month = null) => {
    const monthlyData = {};
    let filteredRequests = requests;
    if (year) {
      filteredRequests = requests.filter(request => {
        if (!request.created_at) return false;
        const date = new Date(request.created_at);
        if (isNaN(date.getTime())) return false;
        if (date.getFullYear() !== parseInt(year)) return false;
        if (month && date.getMonth() + 1 !== parseInt(month)) return false;
        return true;
      });
    }
    filteredRequests.forEach(request => {
      if (request.created_at) {
        const date = new Date(request.created_at);
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const key = `${y}-${String(m).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      }
    });

    let data = [];
    if (!year) {
      // Last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          requests: monthlyData[key] || 0
        });
      }
    } else if (month) {
      // Single month
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        requests: monthlyData[key] || 0
      });
    } else {
      // Full year
      for (let m = 1; m <= 12; m++) {
        const date = new Date(parseInt(year), m - 1, 1);
        const key = `${year}-${String(m).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          requests: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Get most requested asset
  const getMostRequestedAsset = (requests) => {
    if (requests.length === 0) return { name: 'N/A', count: 0 };

    const counts = {};
    requests.forEach(request => {
      if (request.asset && request.asset.name) {
        counts[request.asset.name] = (counts[request.asset.name] || 0) + 1;
      }
    });

    let max = 0;
    let most = '';
    for (const [asset, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        most = asset;
      }
    }
    return { name: most, count: max };
  };

  // Get total revenue from paid requests
  const getTotalRevenue = (requests) => {
    return requests
      .filter(request => request.payment_status === 'paid')
      .reduce((total, request) => {
        return total + (parseFloat(request.total_amount) || 0);
      }, 0);
  };

  // Auto-hide toast messages
  React.useEffect(() => {
    if (toastMessage && toastMessage.duration > 0) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, toastMessage.duration);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Add logging to debug the fetchRequests function
  const fetchRequests = async (page = 1, showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    setLoading(true);
    console.log(`Fetching requests for page: ${page}`);

    try {
      // Fetch paginated requests
    const requestsRes = await axiosInstance.get(`/asset-requests?page=${page}&per_page=${perPage}`);
      console.log('Paginated requests response:', requestsRes.data);
      setRequests(requestsRes.data.data);
      setCurrentPage(requestsRes.data.current_page);
      setLastPage(requestsRes.data.last_page);
      setTotal(requestsRes.data.total);

      // Fetch status counts using the new optimized endpoint
  const statusRes = await axiosInstance.get('/asset-requests/status-counts');
      console.log('Status counts response:', statusRes.data);
      setStatusCounts({
        approved: statusRes.data.approved,
        pending: statusRes.data.pending,
        denied: statusRes.data.denied,
        paid: statusRes.data.paid
      });

      // Generate chart data from all requests
      setChartData(generateChartData(requestsRes.data.data));
      setLastRefresh(new Date());

      if (showRefreshIndicator) {
        setToastMessage({
          type: 'success',
          message: '🔄 Data refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      console.error('Failed to load requests:', err.response || err.message);
      alert('Failed to load requests');
      if (showRefreshIndicator) {
        setToastMessage({
          type: 'error',
          message: '❌ Failed to refresh data',
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const fetchAssets = () => {
  axiosInstance.get('/assets')
      .then(res => setAssets(res.data))
      .catch(() => alert('Failed to load assets'));
  };

  // CREATE
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    try {
  const res = await axiosInstance.post('/asset-requests', form);
      setRequests([...requests, res.data]);
      setForm(initialForm);
      alert('Request created!');
    } catch (err) {
      alert('Failed to create request');
    }
  };

  // UPDATE
  const handleEdit = (request) => {
    setEditingId(request.id);
    setForm({
      asset_id: request.asset_id,
      request_date: request.request_date,
      status: request.status,
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
  const res = await axiosInstance.patch(`/asset-requests/${editingId}`, form);
      setRequests(requests.map(r => r.id === editingId ? res.data : r));
      setEditingId(null);
      setForm(initialForm);
      alert('Request updated!');
    } catch (err) {
      alert('Failed to update request');
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
    await axiosInstance.delete(`/asset-requests/${id}`);
      setRequests(requests.filter(r => r.id !== id));
      alert('Request deleted!');
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  // Approve/Decline (status update)
  const handleApprove = async (id) => {
  await axiosInstance.patch(`/asset-requests/${id}`, { status: 'approved' });
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleDecline = async (id) => {
  await axiosInstance.patch(`/asset-requests/${id}`, { status: 'denied' });
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'denied' } : r));
  };

  // Process Payment
  const handlePayment = async (id) => {
    if (!window.confirm('Are you sure you want to process payment for this request?')) return;
    
    setProcessingPayment(id);
    try {
  const res = await axiosInstance.post(`/asset-requests/${id}/pay`);
      setRequests(requests.map(r => r.id === id ? { 
        ...r, 
        payment_status: 'paid',
        receipt_number: res.data.receipt_number,
        amount_paid: res.data.amount_paid,
        paid_at: new Date().toISOString()
      } : r));
      
      // Show success message with receipt details
      alert(`Payment processed successfully!\nReceipt Number: ${res.data.receipt_number}\nAmount: ₱${res.data.amount_paid}`);
      
      // Generate and download receipt
      await generateReceipt(res.data.asset_request, res.data.receipt_number, res.data.amount_paid);
      
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  // Generate Receipt
  const generateReceipt = async (assetRequest, receiptNumber, amount) => {
    try {
      // Call backend to generate PDF receipt
  const response = await axiosInstance.post('/asset-requests/generate-receipt', {
        asset_request_id: assetRequest.id,
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Toast Notification Component
  const ToastNotification = ({ message, type, onClose }) => (
    <div className={`fixed top-24 right-6 z-50 max-w-md rounded-xl shadow-2xl border-2 p-4 transition-all duration-500 transform ${
      message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success'
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
        : type === 'loading'
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
          {type === 'loading' && <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />}
          {type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{message}</div>
        </div>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <ToastNotification
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              GMAC
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Gabay sa Mamamayan Action Center - Comprehensive management system for barangay asset rental requests with real-time tracking and payment processing.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={total}
              icon={<BuildingOfficeIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Approved"
              value={statusCounts.approved}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending"
              value={statusCounts.pending}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Paid"
              value={statusCounts.paid}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Asset Request Analytics
              {(() => {
                if (analyticsYear) {
                  if (analyticsMonth) {
                    const monthDate = new Date(parseInt(analyticsYear), parseInt(analyticsMonth) - 1, 1);
                    return ` (${monthDate.toLocaleDateString('en-US', { month: 'long' })} ${analyticsYear})`;
                  } else {
                    return ` (${analyticsYear})`;
                  }
                } else {
                  return ' (Last 12 Months)';
                }
              })()}
            </h3>
            <div className="flex gap-2 mb-4 items-center">
              <select
                value={analyticsYear}
                onChange={(e) => {
                  setAnalyticsYear(e.target.value);
                  setAnalyticsMonth('');
                }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">All Years</option>
                {analyticsAvailableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {analyticsYear && (
                <select
                  value={analyticsMonth}
                  onChange={(e) => setAnalyticsMonth(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                >
                  <option value="">All Months</option>
                  {analyticsAvailableMonths.map((month) => (
                    <option key={month} value={month}>
                      {new Date(parseInt(analyticsYear), month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Most Requested Asset
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostRequestedAsset(requests).name}</p>
                <p className="text-sm text-green-700">{getMostRequestedAsset(requests).count} requests</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Total Revenue
                </h4>
                <p className="text-lg font-bold text-blue-900">₱{getTotalRevenue(requests).toLocaleString()}</p>
                <p className="text-sm text-blue-700">From paid requests</p>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <Link to="/admin/assets-management">
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                    <BuildingOfficeIcon className="w-5 h-5" />
                    Go to Assets Management
                  </button>
                </Link>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <PlusIcon className="w-5 h-5" />
                  Create New Request
                </button>
              </div>

              <div className="flex gap-4 items-center w-full max-w-3xl">
                {/* Auto-refresh controls */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border">
                  <button
                    onClick={toggleAutoRefresh}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      autoRefresh
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowPathIcon className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                    Auto
                  </button>
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <span className="text-xs text-gray-500">
                    {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>

                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or asset..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth('');
                    }}
                    className="px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Year</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {selectedYear && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">Month</option>
                      {availableMonths.map((month) => (
                        <option key={month} value={month}>
                          {new Date(parseInt(selectedYear), month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CREATE/UPDATE FORM */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">{editingId ? 'Edit Request' : 'Create New Request'}</h2>
            <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asset</label>
                  <select 
                    name="asset_id" 
                    value={form.asset_id} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Request Date</label>
                  <input 
                    name="request_date" 
                    type="date" 
                    value={form.request_date} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={handleFormChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditingId(null); setForm(initialForm); }} 
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                Asset Rental Requests
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Asset</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Request Date</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Payment Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-8 bg-gray-300 rounded w-32"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No asset rental requests found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-green-50 transition-all duration-200 group">
                        <td className="px-6 py-4">
                          <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                            {request.resident ? request.resident.residents_id || '' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">
                            {request.resident && request.resident.profile
                              ? `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.trim()
                              : request.user
                                ? request.user.name
                                : ''}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {request.asset ? request.asset.name || '' : ''}
                        </td>
                        <td className="px-4 py-4 text-gray-700">
                          {formatDate(request.request_date)}
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            request.status.charAt(0).toUpperCase() + request.status.slice(1), 
                            getStatusColor(request.status), 
                            getStatusIcon(request.status)
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {badge(
                            request.payment_status ? request.payment_status.charAt(0).toUpperCase() + request.payment_status.slice(1) : 'Unpaid',
                            getPaymentStatusColor(request.payment_status),
                            getPaymentStatusIcon(request.payment_status)
                          )}
                          {request.receipt_number && (
                            <div className="text-xs text-gray-600 mt-1">
                              Receipt: {request.receipt_number}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-green-600">
                            ₱{request.total_amount ? request.total_amount.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                >
                                  <CheckCircleIcon className="w-3 h-3" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecline(request.id)}
                                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                >
                                  <ExclamationTriangleIcon className="w-3 h-3" />
                                  Decline
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && request.payment_status !== 'paid' && (
                              <button
                                onClick={() => handlePayment(request.id)}
                                disabled={processingPayment === request.id}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                              >
                                <CurrencyDollarIcon className="w-3 h-3" />
                                {processingPayment === request.id ? 'Processing...' : 'Pay'}
                              </button>
                            )}
                            {request.payment_status === 'paid' && (
                              <button
                                onClick={async () => await generateReceipt(request, request.receipt_number, request.amount_paid)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <DocumentTextIcon className="w-3 h-3" />
                                Download Receipt
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(request)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                            >
                              <XMarkIcon className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * perPage, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                  disabled={currentPage === lastPage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === lastPage
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default InventoryAssets;