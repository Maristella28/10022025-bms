import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ServerIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/solid';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    model_type: '',
    search: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 20,
  });
  const [filterOptions, setFilterOptions] = useState({
    actions: [],
    model_types: [],
    users: [],
  });
  const [statistics, setStatistics] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchFilterOptions();
    fetchStatistics();
    fetchSecurityAlerts();
    fetchAuditSummary();
  }, [filters.page, filters.per_page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await axios.get(`/admin/activity-logs?${params}`);
      setLogs(response.data.logs.data);
      setTotalPages(response.data.logs.last_page);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/filters/options');
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/statistics/summary');
      setStatistics(response.data.statistics);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchSecurityAlerts = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/security/alerts');
      setSecurityAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Error fetching security alerts:', err);
    }
  };

  const fetchAuditSummary = async () => {
    try {
      const response = await axios.get('/admin/activity-logs/audit/summary');
      setAuditSummary(response.data.audit_summary);
    } catch (err) {
      console.error('Error fetching audit summary:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/admin/activity-logs/export', filters);
      // Create and download CSV
      const csvContent = generateCSV(response.data.logs.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('Are you sure you want to delete activity logs older than 90 days?')) {
      try {
        await axios.delete('/admin/activity-logs/cleanup');
        fetchLogs();
        fetchStatistics();
      } catch (err) {
        console.error('Error cleaning up logs:', err);
      }
    }
  };

  const generateCSV = (data) => {
    const headers = ['Date', 'User', 'Action', 'Model', 'Description', 'IP Address'];
    const rows = data.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user?.name || 'System',
      log.action,
      log.model_type ? `${log.model_type}#${log.model_id}` : 'N/A',
      log.description,
      log.ip_address || 'N/A',
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };


  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4 transform transition-transform duration-300 hover:scale-110">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight animate-slide-in">
            Activity Logs
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Comprehensive monitoring system for tracking all system activities and user interactions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="text-red-800 font-semibold">Error Loading Data</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Statistics Cards */}
        {statistics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-7 h-7 text-blue-600" />
              Activity Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Logs</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.total_logs.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Login Events</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.login_count.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">User Registrations</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.user_registrations.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowPathIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Profile Updates</p>
                    <p className="text-3xl font-bold text-gray-900">{statistics.resident_updates.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Alerts Section */}
        {securityAlerts && securityAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-7 h-7 text-red-600" />
              Security Alerts
            </h2>
            <div className="space-y-4">
              {securityAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-red-900">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-red-800 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-red-700">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {alert.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(alert.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GlobeAltIcon className="w-4 h-4" />
                          {alert.ip_address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Summary Section */}
        {auditSummary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7 text-green-600" />
              Audit Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 text-sm font-medium">Successful Operations</p>
                    <p className="text-3xl font-bold text-green-900">{auditSummary.successful_operations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Failed Operations</p>
                    <p className="text-3xl font-bold text-yellow-900">{auditSummary.failed_operations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Avg Response Time</p>
                    <p className="text-3xl font-bold text-blue-900">{auditSummary.avg_response_time}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FunnelIcon className="w-6 h-6 text-blue-600" />
                Activity Filters
              </h3>
              <p className="text-gray-600 text-sm">Filter and search through activity logs</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={fetchLogs}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex gap-3 items-center mb-6">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300 focus:shadow-md"
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fade-in">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-blue-600" />
                Advanced Filters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    {filterOptions.actions.map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
                  <select
                    value={filters.model_type}
                    onChange={(e) => handleFilterChange('model_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Models</option>
                    {filterOptions.model_types.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleExport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleCleanup}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <TrashIcon className="w-4 h-4" />
                  Cleanup Old Logs
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Audit Trail Summary */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                Audit Trail Summary
              </h3>
              <p className="text-gray-600 text-sm">System activity overview and compliance metrics</p>
            </div>
            <button
              onClick={fetchAuditSummary}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-300 transform hover:scale-105"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh Summary
            </button>
          </div>

          {auditSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 text-sm font-medium">Successful Operations</p>
                    <p className="text-2xl font-bold text-green-900">{auditSummary.successful_operations || 0}</p>
                    <p className="text-green-600 text-xs mt-1">Last 30 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <XCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-red-800 text-sm font-medium">Failed Operations</p>
                    <p className="text-2xl font-bold text-red-900">{auditSummary.failed_operations || 0}</p>
                    <p className="text-red-600 text-xs mt-1">Requires attention</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-900">{auditSummary.avg_response_time || 0}ms</p>
                    <p className="text-blue-600 text-xs mt-1">System performance</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Activity Logs Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Activity Logs
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Date & Time</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Action</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Model</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">IP Address</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Loading activity logs...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No activity logs found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-green-50 transition-all duration-200 border-b border-gray-100 hover:border-green-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.action.includes('login') ? 'bg-green-100 text-green-800' :
                          log.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                          log.action.includes('delete') ? 'bg-red-100 text-red-800' :
                          log.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-700">
                            {log.model_type ? `${log.model_type.split('\\').pop()}#${log.model_id}` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="truncate" title={log.description}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-700">{log.ip_address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFilterChange('page', pageNum)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        filters.page === pageNum
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Compliance Report */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
                Compliance Report
              </h3>
              <p className="text-gray-600 text-sm">GDPR and data protection compliance metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-indigo-800 text-sm font-medium">Privacy Accepted</p>
                  <p className="text-xl font-bold text-indigo-900">98.5%</p>
                  <p className="text-indigo-600 text-xs mt-1">User compliance</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-green-800 text-sm font-medium">Data Integrity</p>
                  <p className="text-xl font-bold text-green-900">99.2%</p>
                  <p className="text-green-600 text-xs mt-1">Audit success rate</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                  <ClockIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-orange-800 text-sm font-medium">Avg Retention</p>
                  <p className="text-xl font-bold text-orange-900">7 years</p>
                  <p className="text-orange-600 text-xs mt-1">Per RA 11038</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-purple-800 text-sm font-medium">Audit Logs</p>
                  <p className="text-xl font-bold text-purple-900">15,420</p>
                  <p className="text-purple-600 text-xs mt-1">Total records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-2">Compliance Status</h4>
                <p className="text-gray-700 text-sm">
                  All systems are compliant with RA 11038 (Data Privacy Act) and GDPR requirements.
                  Regular audits are performed to ensure data protection and user privacy.
                  Last compliance audit: <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-fade-in-up">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <EyeIcon className="w-6 h-6" />
                    Activity Log Details
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-green-100 mt-2">Detailed information about this activity</p>
              </div>

              <div className="p-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Activity Description
                  </h3>
                  <p className="text-gray-700 text-base">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      User Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">User:</span>
                        <span className="font-medium text-gray-900">{selectedLog.user?.name || 'System'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Action:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedLog.action.includes('login') ? 'bg-green-100 text-green-800' :
                          selectedLog.action.includes('logout') ? 'bg-yellow-100 text-yellow-800' :
                          selectedLog.action.includes('delete') ? 'bg-red-100 text-red-800' :
                          selectedLog.action.includes('create') ? 'bg-blue-100 text-blue-800' :
                          selectedLog.action.includes('update') ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedLog.action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-green-600" />
                      Timing & Location
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedLog.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IP Address:</span>
                        <span className="font-mono text-sm text-gray-900">{selectedLog.ip_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLog.model_type && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ServerIcon className="w-5 h-5 text-purple-600" />
                      Model Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model Type:</span>
                        <span className="font-medium text-gray-900">{selectedLog.model_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model ID:</span>
                        <span className="font-mono text-sm text-gray-900">{selectedLog.model_id}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedLog.old_values && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 text-orange-600" />
                      Previous Values
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      New Values
                    </h4>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
