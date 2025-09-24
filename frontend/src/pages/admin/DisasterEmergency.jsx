import React, { useState, useEffect } from 'react';
import AddDisasterEmergencyRecord from './modules/Disaster&Emergency/AddDisasterEmergencyRecord';
import axios from '../../utils/axiosConfig';
import EmergencyHotlinesTable from './modules/Disaster&Emergency/EmergencyHotlinesTable';
import { ExclamationTriangleIcon, PhoneIcon, PlusIcon, TableCellsIcon, DocumentTextIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, ClockIcon, XMarkIcon, ArrowPathIcon, ChartBarIcon, UserIcon, CalendarIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DisasterEmergency = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    date: '',
    location: '',
    description: '',
    actions_taken: '',
    casualties: '',
    reported_by: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotlinesTable, setShowHotlinesTable] = useState(false);
  const [showAddHotlineModal, setShowAddHotlineModal] = useState(false);
  const [hotlinesCount, setHotlinesCount] = useState(0);

  // Analytics and search state
  const [search, setSearch] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Analytics period selection
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected
  const currentYear = new Date().getFullYear();

  const fetchRecords = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/disaster-emergencies');
      setRecords(res.data);
      setFilteredRecords(res.data);
      setChartData(generateChartData(res.data, selectedPeriod, selectedYear, selectedMonth));
      setLastRefresh(new Date());

      if (showRefreshIndicator) {
        setToastMessage({
          type: 'success',
          message: '🔄 Data refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      setError('Failed to fetch records');
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

  const fetchHotlinesCount = async () => {
    try {
      const res = await axios.get('/emergency-hotlines');
      setHotlinesCount(res.data.length);
    } catch {}
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRecords();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchRecords(true);
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

  // Filter records on search
  useEffect(() => {
    setFilteredRecords(
      records.filter((record) => {
        const searchLower = search.toLowerCase();
        return (
          record.type?.toLowerCase().includes(searchLower) ||
          record.location?.toLowerCase().includes(searchLower) ||
          record.description?.toLowerCase().includes(searchLower) ||
          record.reported_by?.toLowerCase().includes(searchLower)
        );
      })
    );
  }, [search, records]);

  // Update chart data when records, period, year, or month changes
  useEffect(() => {
    setChartData(generateChartData(records, selectedPeriod, selectedYear, selectedMonth));
  }, [records, selectedPeriod, selectedYear, selectedMonth]);

  // Generate chart data for disaster/emergency records based on period, year, and month
  const generateChartData = (records, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let data = [];

    if (period === 'month') {
      if (!year || month === 0) {
        // If no specific year/month, use current month
        const today = new Date();
        year = today.getFullYear();
        month = today.getMonth() + 1;
      }
      // Daily data for selected month and year
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const dailyData = {};
      records.forEach(record => {
        if (record.date) {
          const date = new Date(record.date);
          if (date >= monthStart && date <= monthEnd) {
            const dayKey = date.toISOString().split('T')[0];
            dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
          }
        }
      });
      // Fill all days of the month
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const key = date.toISOString().split('T')[0];
        data.push({
          name: date.getDate().toString(),
          incidents: dailyData[key] || 0
        });
      }
    } else if (period === 'year') {
      if (!year) {
        year = currentYear;
      }
      if (month > 0) {
        // Daily data for selected month in the year
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const dailyData = {};
        records.forEach(record => {
          if (record.date) {
            const date = new Date(record.date);
            if (date >= monthStart && date <= monthEnd) {
              const dayKey = date.toISOString().split('T')[0];
              dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
            }
          }
        });
        // Fill all days of the month
        for (let day = 1; day <= monthEnd.getDate(); day++) {
          const date = new Date(year, month - 1, day);
          const key = date.toISOString().split('T')[0];
          data.push({
            name: date.getDate().toString(),
            incidents: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        records.forEach(record => {
          if (record.date) {
            const date = new Date(record.date);
            if (date.getFullYear() === year) {
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              yearlyData[monthKey] = (yearlyData[monthKey] || 0) + 1;
            }
          }
        });
        // Fill all months of the year
        for (let m = 0; m < 12; m++) {
          const date = new Date(year, m, 1);
          const key = `${year}-${String(m + 1).padStart(2, '0')}`;
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            incidents: yearlyData[key] || 0
          });
        }
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      records.forEach(record => {
        if (record.date) {
          const date = new Date(record.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
      });

      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          incidents: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Get most common disaster type based on period, year, and month
  const getMostCommonDisasterType = (records, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filtered = records;
    if (period === 'month' && month > 0) {
      filtered = records.filter(record => {
        if (!record.date) return false;
        const date = new Date(record.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filtered = records.filter(record => {
          if (!record.date) return false;
          const date = new Date(record.date);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filtered = records.filter(record => {
          if (!record.date) return false;
          const date = new Date(record.date);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const counts = {};
    filtered.forEach(record => {
      if (record.type) {
        counts[record.type] = (counts[record.type] || 0) + 1;
      }
    });

    let max = 0;
    let most = '';
    for (const [type, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        most = type;
      }
    }
    return { type: most, count: max };
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

  useEffect(() => {
    fetchRecords();
    fetchHotlinesCount();
  }, []);

  const handleEdit = (record) => {
    setEditId(record.id);
    setEditForm({ ...record });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put(`/disaster-emergencies/${editId}`, editForm);
      setShowEditModal(false);
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/disaster-emergencies/${id}`);
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
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

      <main className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* Animated Header */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-400 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
            <ExclamationTriangleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Disaster & Emergency Management
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Comprehensive management for barangay disaster and emergency records, hotlines, and response procedures.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-2 rounded-full text-sm font-medium border border-green-200">
              {records.length} Total Disaster/Emergency Records
            </div>
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-6 py-2 rounded-full text-sm font-medium border border-emerald-200">
              {hotlinesCount} Emergency Hotlines
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="w-full flex flex-col gap-6 mb-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-700 group-hover:text-emerald-600 transition-colors duration-300">{records.length}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Total Incidents</div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 group-hover:text-indigo-600 transition-colors duration-300">{getMostCommonDisasterType(records, true).count}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">This Month</div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <PhoneIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-700 group-hover:text-pink-600 transition-colors duration-300">{hotlinesCount}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Hotlines</div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-700 group-hover:text-red-600 transition-colors duration-300">{records.reduce((sum, rec) => sum + (parseInt(rec.casualties) || 0), 0)}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Total Casualties</div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Disaster & Emergency Trends
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value !== 'month') setSelectedMonth(0);
                    setSelectedYear('');
                  }}
                  className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                >
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && (
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth(0);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 16 }, (_, i) => currentYear - 10 + i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                )}
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && selectedYear && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                  >
                    <option value={0}>All Months</option>
                    {[
                      { value: 1, name: 'January' },
                      { value: 2, name: 'February' },
                      { value: 3, name: 'March' },
                      { value: 4, name: 'April' },
                      { value: 5, name: 'May' },
                      { value: 6, name: 'June' },
                      { value: 7, name: 'July' },
                      { value: 8, name: 'August' },
                      { value: 9, name: 'September' },
                      { value: 10, name: 'October' },
                      { value: 11, name: 'November' },
                      { value: 12, name: 'December' }
                    ].map(m => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                )}
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && !selectedYear && (
                  <select
                    disabled
                    className="px-4 py-2 border-2 border-gray-300 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium cursor-not-allowed"
                  >
                    <option>Select a year first</option>
                  </select>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {selectedPeriod === 'month' ? `Daily incidents in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly incidents in ${selectedYear || currentYear}` :
               'Incidents over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedPeriod === 'month' || (selectedPeriod === 'year' && selectedMonth > 0) ? "name" : "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incidents" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Most Common {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostCommonDisasterType(records, selectedPeriod, selectedYear, selectedMonth).type || 'N/A'}</p>
                <p className="text-sm text-green-700">{getMostCommonDisasterType(records, selectedPeriod, selectedYear, selectedMonth).count} incidents</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Most Common Overall
                </h4>
                <p className="text-lg font-bold text-blue-900">{getMostCommonDisasterType(records, 'all').type || 'N/A'}</p>
                <p className="text-sm text-blue-700">{getMostCommonDisasterType(records, 'all').count} incidents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex gap-3">
              <button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowAddHotlineModal(true)}
              >
                <PhoneIcon className="w-6 h-6" />
                Add Emergency Hotline
              </button>
              <button
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowHotlinesTable((prev) => !prev)}
              >
                <TableCellsIcon className="w-6 h-6" />
                {showHotlinesTable ? 'Hide' : 'Show'} Emergency Hotlines Table
              </button>
              <AddDisasterEmergencyRecord onSuccess={fetchRecords} />
            </div>

            <div className="flex gap-3 items-center w-full max-w-2xl">
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

              <div className="relative flex-grow">
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  placeholder="Search by type, location, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              </div>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300">
                <FunnelIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowAddHotlineModal(true)}
          >
            <PhoneIcon className="w-6 h-6" />
            Add Emergency Hotline
          </button>
          <button
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
            onClick={() => setShowHotlinesTable((prev) => !prev)}
          >
            <TableCellsIcon className="w-6 h-6" />
            {showHotlinesTable ? 'Hide' : 'Show'} Emergency Hotlines Table
          </button>
          <AddDisasterEmergencyRecord onSuccess={fetchRecords} />
        </div>
        {/* Placeholder for Add Emergency Hotline Modal */}
        {showAddHotlineModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
                <PhoneIcon className="w-6 h-6" /> Add Emergency Hotline
              </h2>
              <p className="text-gray-500">(Hotline add form goes here.)</p>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setShowAddHotlineModal(false)} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">Close</button>
              </div>
            </div>
          </div>
        )}
        {/* Emergency Hotlines Table */}
        {showHotlinesTable && (
          <div className="animate-fade-in">
            <EmergencyHotlinesTable />
          </div>
        )}
        {/* Card-style section for Disaster/Emergency Records */}
        <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 px-8 py-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              Disaster and Emergency Records ({filteredRecords.length})
            </h3>
          </div>
          <div className="overflow-x-auto p-8">
            {error && <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-8 py-6 rounded-2xl mb-6 flex items-center shadow-lg animate-bounce">{error}</div>}
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <tr>
                  <th className="px-8 py-6 text-left font-bold text-emerald-700">Type</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Date</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Location</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Description</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Actions Taken</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Casualties</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Reported By</th>
                  <th className="px-6 py-6 text-left font-bold text-emerald-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-emerald-600 font-semibold text-lg">No disaster or emergency records found</p>
                        <p className="text-emerald-400 text-sm">Try adjusting your search criteria or click the button above to add a new record</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => (
                    <tr key={rec.id} className={`transition-all duration-300 group ${idx % 2 === 0 ? 'bg-white' : 'bg-green-50'} hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50`}>
                      <td className="px-6 py-6 font-bold text-emerald-900 group-hover:text-emerald-600 transition-colors duration-300">{rec.type}</td>
                      <td className="px-6 py-6">{rec.date}</td>
                      <td className="px-6 py-6">{rec.location}</td>
                      <td className="px-6 py-6 max-w-xs truncate" title={rec.description}>{rec.description}</td>
                      <td className="px-6 py-6 max-w-xs truncate" title={rec.actions_taken}>{rec.actions_taken}</td>
                      <td className="px-6 py-6">{rec.casualties}</td>
                      <td className="px-6 py-6">{rec.reported_by}</td>
                      <td className="px-6 py-6 flex gap-2">
                        <button onClick={() => handleEdit(rec)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105" title="Edit Record">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(rec.id)} className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105" title="Delete Record">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
            <form
              onSubmit={handleEditSubmit}
              className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg space-y-4"
            >
              <h2 className="text-2xl font-bold mb-2 text-emerald-700 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6" /> Edit Disaster/Emergency Record
              </h2>
              <input name="type" value={editForm.type} onChange={handleEditChange} required placeholder="Type (e.g. Fire, Flood)" className="w-full border rounded px-4 py-2" />
              <input name="date" value={editForm.date} onChange={handleEditChange} required type="date" className="w-full border rounded px-4 py-2" />
              <input name="location" value={editForm.location} onChange={handleEditChange} required placeholder="Location" className="w-full border rounded px-4 py-2" />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} required placeholder="Description" className="w-full border rounded px-4 py-2" />
              <textarea name="actions_taken" value={editForm.actions_taken} onChange={handleEditChange} placeholder="Actions Taken" className="w-full border rounded px-4 py-2" />
              <input name="casualties" value={editForm.casualties} onChange={handleEditChange} placeholder="Casualties (optional)" className="w-full border rounded px-4 py-2" />
              <input name="reported_by" value={editForm.reported_by} onChange={handleEditChange} placeholder="Reported By (optional)" className="w-full border rounded px-4 py-2" />
              <div className="flex gap-4 mt-4">
                <button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700">
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-300 px-6 py-2 rounded-xl font-bold hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      </main>
    </>
  );
};

export default DisasterEmergency;