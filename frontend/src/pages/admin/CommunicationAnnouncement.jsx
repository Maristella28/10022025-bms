import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosConfig';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpOnSquareIcon,
  EyeSlashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    case 'posted':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'posted':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'draft':
      return <ClockIcon className="w-3 h-3" />;
    case 'scheduled':
      return <CalendarIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const CommunicationAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: null,
    publishMode: 'now',      // 'now' | 'schedule'
    published_at: '',        // 'YYYY-MM-DDTHH:mm' for datetime-local
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Analytics state
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('announcements');

  // Analytics period selection
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected
  const currentYear = new Date().getFullYear();

  const { user, loading: authLoading } = useAuth();

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get('/admin/announcements');
      const fetchedAnnouncements = res.data.announcements || [];
      setAnnouncements(fetchedAnnouncements);
      setChartData(generateChartData(fetchedAnnouncements, selectedPeriod, selectedYear, selectedMonth));
      setPieChartData(generatePieChartData(fetchedAnnouncements, selectedPeriod, selectedYear, selectedMonth));
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError('Failed to load announcements.');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Update charts when filters change
  useEffect(() => {
    setChartData(generateChartData(announcements, selectedPeriod, selectedYear, selectedMonth));
    setPieChartData(generatePieChartData(announcements, selectedPeriod, selectedYear, selectedMonth));
  }, [announcements, selectedPeriod, selectedYear, selectedMonth]);

  // Update charts when filters change
  useEffect(() => {
    setChartData(generateChartData(announcements, selectedPeriod, selectedYear, selectedMonth));
    setPieChartData(generatePieChartData(announcements, selectedPeriod, selectedYear, selectedMonth));
  }, [announcements, selectedPeriod, selectedYear, selectedMonth]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to post.");
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);

    if (form.image instanceof File) {
      formData.append('image', form.image);
    }

    try {
      // Include schedule datetime if selected
      if (form.publishMode === 'schedule' && form.published_at) {
        try {
          const iso = new Date(form.published_at).toISOString();
          formData.append('published_at', iso);
        } catch (e) {
          console.warn('Invalid published_at, skipping');
        }
      }

      if (isEditing && selectedAnnouncement) {
        formData.append('_method', 'PUT');
        await axiosInstance.post(`/admin/announcements/${selectedAnnouncement.id}`, formData);
      } else {
        await axiosInstance.post('/admin/announcements', formData);
      }
      await fetchAnnouncements();
      setForm({ title: '', content: '', image: null });
      setShowForm(false);
      setIsEditing(false);
      setSelectedAnnouncement(null);
    } catch (err) {
      console.error("Error submitting announcement:", err);
      setError('Failed to submit announcement.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/admin/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axiosInstance.delete(`/admin/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error("Error deleting announcement:", err);
      }
    }
  };

  const handleEdit = (announcement) => {
    setForm({
      title: announcement.title,
      content: announcement.content,
      image: null,
      publishMode: announcement.status === 'scheduled' ? 'schedule' : 'now',
      published_at: announcement.published_at
        ? new Date(announcement.published_at).toISOString().slice(0, 16)
        : '',
    });
    setSelectedAnnouncement(announcement);
    setShowForm(true);
    setIsEditing(true);
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCount = (status) => {
    return announcements.filter(announcement => announcement.status === status).length;
  };

  // Generate chart data for announcement creation based on period, year, and month
  const generateChartData = (announcements, period = 'all', year = currentYear, month = 0) => {
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
      announcements.forEach(announcement => {
        if (announcement.created_at) {
          const date = new Date(announcement.created_at);
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
          announcements: dailyData[key] || 0
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
        announcements.forEach(announcement => {
          if (announcement.created_at) {
            const date = new Date(announcement.created_at);
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
            announcements: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        announcements.forEach(announcement => {
          if (announcement.created_at) {
            const date = new Date(announcement.created_at);
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
            announcements: yearlyData[key] || 0
          });
        }
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      announcements.forEach(announcement => {
        if (announcement.created_at) {
          const date = new Date(announcement.created_at);
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
          announcements: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Generate pie chart data for announcement status based on period, year, and month
  const generatePieChartData = (announcements, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredAnnouncements = announcements;
    if (period === 'month' && month > 0) {
      filteredAnnouncements = announcements.filter(announcement => {
        if (!announcement.created_at) return false;
        const date = new Date(announcement.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredAnnouncements = announcements.filter(announcement => {
          if (!announcement.created_at) return false;
          const date = new Date(announcement.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredAnnouncements = announcements.filter(announcement => {
          if (!announcement.created_at) return false;
          const date = new Date(announcement.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const statusCounts = {};
    filteredAnnouncements.forEach(announcement => {
      const status = announcement.status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const colors = ['#10b981', '#f59e0b', '#6b7280'];
    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Get most active announcement month based on period, year, and month
  const getMostActiveMonth = (announcements, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredAnnouncements = announcements;
    if (period === 'month' && month > 0) {
      filteredAnnouncements = announcements.filter(announcement => {
        if (!announcement.created_at) return false;
        const date = new Date(announcement.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredAnnouncements = announcements.filter(announcement => {
          if (!announcement.created_at) return false;
          const date = new Date(announcement.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredAnnouncements = announcements.filter(announcement => {
          if (!announcement.created_at) return false;
          const date = new Date(announcement.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const monthlyData = {};
    filteredAnnouncements.forEach(announcement => {
      if (announcement.created_at) {
        const date = new Date(announcement.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      }
    });

    let max = 0;
    let mostActive = '';
    for (const [month, count] of Object.entries(monthlyData)) {
      if (count > max) {
        max = count;
        mostActive = month;
      }
    }

    if (mostActive) {
      const [year, month] = mostActive.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        count: max
      };
    }
    return { month: 'N/A', count: 0 };
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <MegaphoneIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Commmunication & Announcement
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for community announcements with real-time publishing and status tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Total Announcements"
              value={announcements.length}
              icon={<MegaphoneIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Published"
              value={getStatusCount('posted')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Drafts"
              value={getStatusCount('draft')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Announcement Analytics
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
              {selectedPeriod === 'month' ? `Daily announcements created in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly announcements created in ${selectedYear || currentYear}` :
               'Announcements created over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedPeriod === 'month' || (selectedPeriod === 'year' && selectedMonth > 0) ? "name" : "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="announcements" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Most Active Month {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostActiveMonth(announcements, selectedPeriod, selectedYear, selectedMonth).month}</p>
                <p className="text-sm text-green-700">{getMostActiveMonth(announcements, selectedPeriod, selectedYear, selectedMonth).count} announcements</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Average per Month
                </h4>
                <p className="text-lg font-bold text-blue-900">{(announcements.length / 12).toFixed(1)}</p>
                <p className="text-sm text-blue-700">announcements per month</p>
              </div>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Announcement Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
              <p className="text-red-600 font-medium flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                {error}
              </p>
            </div>
          )}

          {/* Enhanced Add Announcement Form */}
          {user && showForm && (
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    {isEditing ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setSelectedAnnouncement(null);
                      setForm({ title: '', content: '', image: null, publishMode: 'now', published_at: '' });
                    }}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter announcement title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Content
                  </label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder="Enter announcement content..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                    />
                    {form.image && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        {form.image.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Publish options */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Publish Options
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="publishMode"
                        value="now"
                        checked={form.publishMode === 'now'}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600"
                      />
                      <span>Publish now</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="publishMode"
                        value="schedule"
                        checked={form.publishMode === 'schedule'}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600"
                      />
                      <span>Schedule</span>
                    </label>
                  </div>

                  {form.publishMode === 'schedule' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Publish date & time</label>
                      <input
                        type="datetime-local"
                        name="published_at"
                        value={form.published_at}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Will be posted automatically on this date/time.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? 'Update Announcement' : 'Publish Announcement'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Controls Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {user && (
                <button
                  onClick={() => {
                    setShowForm(prev => !prev);
                    setIsEditing(false);
                    setSelectedAnnouncement(null);
                    setForm({ title: '', content: '', image: null, publishMode: 'now', published_at: '' });
                  }}
                  className={`flex items-center gap-3 px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    showForm 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                  }`}
                >
                  {showForm ? (
                    <>
                      <XMarkIcon className="w-5 h-5" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Add Announcement
                    </>
                  )}
                </button>
              )}

              {/* Enhanced Search Bar */}
              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Announcements Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MegaphoneIcon className="w-5 h-5" />
                  Announcements ({filteredAnnouncements.length})
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  Active: {filteredAnnouncements.filter(a => a.status === 'posted').length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              {loading ? (
                <div className="p-16 text-center">
                  <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin animation-delay-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold text-lg">Loading Announcements</p>
                      <p className="text-gray-500 text-sm mt-1">Fetching announcement data...</p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce animation-delay-300"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-500"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                          Title & Content
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-gray-600" />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                          Date Created
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredAnnouncements.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                <MegaphoneIcon className="w-10 h-10 text-gray-400" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="text-center max-w-md">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">No Announcements Found</h3>
                              <p className="text-gray-600 mb-4">
                                {searchTerm
                                  ? "No announcements match your current search criteria."
                                  : "There are no announcements in the system yet."
                                }
                              </p>
                              {searchTerm && (
                                <button
                                  onClick={() => setSearchTerm('')}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
                                  Clear Search
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAnnouncements.map((announcement, index) => (
                        <tr
                          key={announcement.id}
                          className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group border-b border-gray-100 hover:border-green-200 hover:shadow-sm animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  <MegaphoneIcon className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 line-clamp-1">
                                  {announcement.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-md">
                                  {announcement.content.substring(0, 120)}...
                                </div>
                                {announcement.image && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-blue-600 font-medium">Has Image</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="transform group-hover:scale-105 transition-transform duration-300">
                              {badge(announcement.status, getStatusColor(announcement.status), getStatusIcon(announcement.status))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <div className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                                <div className="font-medium">{new Date(announcement.created_at).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{new Date(announcement.created_at).toLocaleTimeString()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedAnnouncement(announcement)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                                View
                              </button>

                              <button
                                onClick={() => toggleStatus(announcement.id)}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-lg ${
                                  announcement.status === 'posted'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white focus:ring-red-500'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white focus:ring-green-500'
                                }`}
                              >
                                {announcement.status === 'posted' ? (
                                  <EyeSlashIcon className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowUpOnSquareIcon className="w-3.5 h-3.5" />
                                )}
                                {announcement.status === 'posted' ? 'Hide' : 'Publish'}
                              </button>

                              <button
                                onClick={() => handleEdit(announcement)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <PencilIcon className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(announcement.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Modal Viewer */}
        {selectedAnnouncement && !isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl border border-green-200 max-w-4xl w-full max-h-[95vh] overflow-hidden animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <MegaphoneIcon className="w-7 h-7" />
                    Announcement Details
                  </h2>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="text-white hover:text-green-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Green Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <MegaphoneIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg ring-2 ring-green-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Content</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Status</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-green-100 mt-1">Date</span>
                  </div>
                </div>
              </div>

              <div className="p-10 overflow-y-auto max-h-[calc(95vh-120px)] bg-gradient-to-br from-white/80 to-green-50/80 rounded-b-3xl animate-fadeIn">
                {/* Announcement Header */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-800 leading-tight">{selectedAnnouncement.title}</h3>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                    {badge(selectedAnnouncement.status, getStatusColor(selectedAnnouncement.status), getStatusIcon(selectedAnnouncement.status))}
                  </div>
                </div>

                {/* Announcement Image */}
                {selectedAnnouncement.image && (
                  <div className="w-full mb-8 flex justify-center">
                    <div className="relative group">
                      <img
                        src={`http://localhost:8000/storage/${selectedAnnouncement.image}`}
                        alt="Announcement"
                        className="rounded-2xl object-cover max-w-full max-h-[500px] w-auto shadow-2xl border-4 border-white transition-all duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                )}

                {/* Announcement Content */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-8 mb-8 transition-all duration-300 hover:shadow-xl">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Announcement Content
                  </h4>
                  <div className="prose max-w-none">
                    <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedAnnouncement.content}
                    </p>
                  </div>
                </div>

                {/* Announcement Metadata */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Announcement Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-green-100">
                      <span className="text-sm font-semibold text-gray-700">Status:</span>
                      {badge(selectedAnnouncement.status, getStatusColor(selectedAnnouncement.status), getStatusIcon(selectedAnnouncement.status))}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-green-100">
                      <span className="text-sm font-semibold text-gray-700">Created:</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-green-100">
                      <span className="text-sm font-semibold text-gray-700">Time:</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(selectedAnnouncement.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-green-100">
                      <span className="text-sm font-semibold text-gray-700">ID:</span>
                      <span className="text-sm text-gray-600 font-mono">#{selectedAnnouncement.id}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-green-100 sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 rounded-b-3xl">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(null);
                      handleEdit(selectedAnnouncement);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CommunicationAnnouncement;