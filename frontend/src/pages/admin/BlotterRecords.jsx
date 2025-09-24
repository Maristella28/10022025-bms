import React, { useState, useEffect, useMemo } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "../../utils/axiosConfig";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon as AlertIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import NewComplaint from "./modules/Blotter/NewComplaint";
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

const getComplaintTypeColor = (type) => {
  switch (type) {
    case 'Physical Injury':
      return 'bg-red-100 text-red-800';
    case 'Verbal Abuse':
      return 'bg-orange-100 text-orange-800';
    case 'Property Damage':
      return 'bg-yellow-100 text-yellow-800';
    case 'Theft':
      return 'bg-purple-100 text-purple-800';
    case 'Noise Complaint':
      return 'bg-blue-100 text-blue-800';
    case 'Other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getComplaintTypeIcon = (type) => {
  switch (type) {
    case 'Physical Injury':
      return <AlertIcon className="w-3 h-3" />;
    case 'Verbal Abuse':
      return <ChatBubbleLeftRightIcon className="w-3 h-3" />;
    case 'Property Damage':
      return <ShieldExclamationIcon className="w-3 h-3" />;
    case 'Theft':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Noise Complaint':
      return <DocumentTextIcon className="w-3 h-3" />;
    case 'Other':
      return <DocumentTextIcon className="w-3 h-3" />;
    default:
      return <DocumentTextIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Completed':
      return 'bg-blue-100 text-blue-800';
    case 'No Show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Scheduled':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'Cancelled':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Completed':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'No Show':
      return <XMarkIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const BlotterRecords = () => {
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Analytics state
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('complaints');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('');
  const [analyticsMonth, setAnalyticsMonth] = useState('');

  useEffect(() => {
    // Fetch blotter records from new API endpoint
    setLoading(true);
    axios.get("/blotter-records")
      .then(res => {
        const records = res.data.records || [];
        setBlotterRecords(records);
        setFilteredRecords(records);
        setChartData(generateChartData(records));
        setPieChartData(generatePieChartData(records));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRecords(
      blotterRecords.filter((record) => {
        const matchesSearch =
          (record.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.respondent_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.complaint_type || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.resident && `${record.resident.first_name} ${record.resident.last_name}`.toLowerCase().includes(search.toLowerCase()));
        let matchesDate = true;
        if (selectedYear && record.incident_date) {
          const date = new Date(record.incident_date);
          if (isNaN(date.getTime()) || date.getFullYear() !== parseInt(selectedYear)) {
            matchesDate = false;
          }
        }
        if (selectedMonth && record.incident_date && matchesDate) {
          const date = new Date(record.incident_date);
          if (date.getMonth() + 1 !== parseInt(selectedMonth)) {
            matchesDate = false;
          }
        }
        return matchesSearch && matchesDate;
      })
    );
  }, [search, selectedYear, selectedMonth, blotterRecords]);

  const availableYears = useMemo(() => {
    const dataYears = new Set();
    blotterRecords.forEach((record) => {
      if (record.incident_date) {
        const date = new Date(record.incident_date);
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
  }, [blotterRecords]);

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [selectedYear]);

  const analyticsAvailableYears = useMemo(() => {
    const dataYears = new Set();
    blotterRecords.forEach((record) => {
      if (record.created_at) {
        const date = new Date(record.created_at);
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
  }, [blotterRecords]);

  const analyticsAvailableMonths = useMemo(() => {
    if (!analyticsYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [analyticsYear]);

  const filteredAnalyticsRecords = useMemo(() => {
    return blotterRecords.filter((record) => {
      if (!record.created_at) return false;
      const date = new Date(record.created_at);
      if (isNaN(date.getTime())) return false;
      if (analyticsYear && date.getFullYear() !== parseInt(analyticsYear)) return false;
      if (analyticsMonth && date.getMonth() + 1 !== parseInt(analyticsMonth)) return false;
      return true;
    });
  }, [analyticsYear, analyticsMonth, blotterRecords]);

  useEffect(() => {
    setChartData(generateChartData(blotterRecords, analyticsYear, analyticsMonth));
    setPieChartData(generatePieChartData(filteredAnalyticsRecords));
  }, [analyticsYear, analyticsMonth, blotterRecords]);

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleEdit = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleSchedule = (record) => {
    setScheduleData(record);
    setShowScheduleModal(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setShowModal(false);
    setEditData({});
  };

  const handleScheduleSave = () => {
    // Handle schedule save logic here
    setShowScheduleModal(false);
    setScheduleData({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusCount = (status) => {
    return blotterRecords.filter(record => record.status === status).length;
  };

  // Generate chart data for monthly blotter records
  const generateChartData = (records, year = null, month = null) => {
    const monthlyData = {};
    let filteredRecords = records;
    if (year) {
      filteredRecords = records.filter(record => {
        if (!record.created_at) return false;
        const date = new Date(record.created_at);
        if (isNaN(date.getTime())) return false;
        if (date.getFullYear() !== parseInt(year)) return false;
        if (month && date.getMonth() + 1 !== parseInt(month)) return false;
        return true;
      });
    }
    filteredRecords.forEach(record => {
      if (record.created_at) {
        const date = new Date(record.created_at);
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
          complaints: monthlyData[key] || 0
        });
      }
    } else if (month) {
      // Single month
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        complaints: monthlyData[key] || 0
      });
    } else {
      // Full year
      for (let m = 1; m <= 12; m++) {
        const date = new Date(parseInt(year), m - 1, 1);
        const key = `${year}-${String(m).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          complaints: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Generate pie chart data for complaint types
  const generatePieChartData = (records) => {
    const typeCounts = {};
    records.forEach(record => {
      const type = record.complaint_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(typeCounts).map(([type, count], index) => ({
      name: type,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Get most common complaint type
  const getMostCommonComplaintType = (records) => {
    const typeCounts = {};
    records.forEach(record => {
      const type = record.complaint_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    let max = 0;
    let most = '';
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > max) {
        max = count;
        most = type;
      }
    }
    return { type: most, count: max };
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <ShieldExclamationIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Blotter Records & Appointments
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay blotter complaints and appointment scheduling with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Complaints"
              value={blotterRecords.length}
              icon={<ShieldExclamationIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Scheduled"
              value={getStatusCount('Scheduled')}
              icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              label="Pending"
              value={getStatusCount('Pending')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              label="Completed"
              value={getStatusCount('Completed')}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Blotter Analytics
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
                <Line type="monotone" dataKey="complaints" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <ShieldExclamationIcon className="w-4 h-4" />
                  Most Common Complaint in Selected Period
                </h4>
                <p className="text-lg font-bold text-red-900">{getMostCommonComplaintType(filteredAnalyticsRecords).type || 'N/A'}</p>
                <p className="text-sm text-red-700">{getMostCommonComplaintType(filteredAnalyticsRecords).count} cases</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertIcon className="w-4 h-4" />
                  Most Common Complaint Overall
                </h4>
                <p className="text-lg font-bold text-orange-900">{getMostCommonComplaintType(blotterRecords).type || 'N/A'}</p>
                <p className="text-sm text-orange-700">{getMostCommonComplaintType(blotterRecords).count} cases</p>
              </div>
            </div>
          </div>

          {/* Complaint Types Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Complaint Types Distribution
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

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Complaints
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule Appointments
                </button>
                <button
                  onClick={() => navigate('/admin/modules/Blotter/NewComplaint')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  New Complaint
                </button>
                <button
                  onClick={() => navigate('/admin/modules/Blotter/BlotterRequest')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Blotter Requests
                </button>
              </div>

              <div className="flex gap-2 items-center w-full max-w-md">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or complaint type..."
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
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center">
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5" />
                Blotter Records
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              {loading ? (
                <div className="p-16 text-center">
                  <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animation-delay-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold text-lg">Loading Blotter Records</p>
                      <p className="text-gray-500 text-sm mt-1">Fetching complaint data...</p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-300"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce animation-delay-500"></div>
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
                          ID
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <ShieldExclamationIcon className="w-4 h-4 text-gray-600" />
                          Case Number
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Complainant
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Respondent
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <AlertIcon className="w-4 h-4 text-gray-600" />
                          Complaint Type
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                          Incident Date
                        </div>
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Resident Name
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
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                <ShieldExclamationIcon className="w-10 h-10 text-gray-400" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="text-center max-w-md">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">No Blotter Records Found</h3>
                              <p className="text-gray-600 mb-4">
                                {search
                                  ? "No records match your current search criteria."
                                  : "There are no blotter records in the system yet."
                                }
                              </p>
                              {search && (
                                <button
                                  onClick={() => setSearch('')}
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
                      filteredRecords.map((record, index) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group border-b border-gray-100 hover:border-red-200 hover:shadow-sm animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4">
                            <div className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group-hover:shadow-md transition-all duration-300">
                              {record.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                              {record.case_number}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.complainant_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.respondent_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="transform group-hover:scale-105 transition-transform duration-300">
                              {badge(record.complaint_type, getComplaintTypeColor(record.complaint_type), getComplaintTypeIcon(record.complaint_type))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                                {record.incident_date}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.resident ? `${record.resident.first_name} ${record.resident.last_name}` : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleShowDetails(record)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(record)}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <PencilIcon className="w-3.5 h-3.5" />
                                Edit
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

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-red-50 to-orange-50 rounded-3xl shadow-2xl border border-red-200 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <PencilIcon className="w-7 h-7" />
                    Edit Blotter Record
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Red Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <ShieldExclamationIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg ring-2 ring-red-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Complaint</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-red-200 to-orange-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Details</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-red-200 to-orange-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Status</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-red-50/80 rounded-b-3xl animate-fadeIn">
                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Complaint Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-red-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                      <ShieldExclamationIcon className="w-5 h-5" /> Complaint Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Complaint Type</label>
                      <select
                        value={editData.complaint_type || ''}
                        onChange={(e) => setEditData({...editData, complaint_type: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Complaint Type</option>
                        <option value="Physical Injury">Physical Injury</option>
                        <option value="Verbal Abuse">Verbal Abuse</option>
                        <option value="Property Damage">Property Damage</option>
                        <option value="Theft">Theft</option>
                        <option value="Noise Complaint">Noise Complaint</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Status</label>
                      <select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-red-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-red-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5" /> Additional Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Complaint Details</label>
                      <textarea
                        value={editData.complaint_details || ''}
                        onChange={(e) => setEditData({...editData, complaint_details: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter complaint details"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Remarks</label>
                      <input
                        type="text"
                        value={editData.remarks || ''}
                        onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-red-100 sticky bottom-0 bg-gradient-to-r from-red-50 to-orange-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 text-red-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${editData.id}`, editData);
                      setShowModal(false);
                      setEditData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-3xl shadow-2xl border border-orange-200 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <CalendarIcon className="w-7 h-7" />
                    Schedule Appointment
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-white hover:text-orange-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Orange Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg ring-2 ring-orange-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Date</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-orange-200 to-red-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <ClockIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Time</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-orange-200 to-red-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Confirm</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-orange-50/80 rounded-b-3xl animate-fadeIn">
                {/* Resident Information Card */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Resident Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{scheduleData.resident?.name || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Complaint:</span> <span className="text-gray-900">{scheduleData.complaint_type || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Preferred Time:</span> <span className="text-gray-900">{scheduleData.preferred_time || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Case Number:</span> <span className="text-gray-900">{scheduleData.case_number || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Appointment Details Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-orange-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5" /> Appointment Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Appointment Date</label>
                      <input
                        type="date"
                        value={scheduleData.appointment_date || ''}
                        onChange={(e) => setScheduleData({...scheduleData, appointment_date: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-orange-300 text-orange-900 hover:shadow-md focus:shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Appointment Time</label>
                      <select
                        value={scheduleData.appointment_time || ''}
                        onChange={(e) => setScheduleData({...scheduleData, appointment_time: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-orange-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Time</option>
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-orange-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5" /> Additional Notes
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Additional Notes</label>
                      <textarea
                        value={scheduleData.remarks || ''}
                        onChange={(e) => setScheduleData({...scheduleData, remarks: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-orange-300 text-orange-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter any additional notes for the appointment"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-orange-100 sticky bottom-0 bg-gradient-to-r from-orange-50 to-red-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${scheduleData.id}`, scheduleData);
                      setShowScheduleModal(false);
                      setScheduleData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Scheduling...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Schedule Appointment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Complaint Modal */}
      </main>
    </>
  );
};

export default BlotterRecords;
