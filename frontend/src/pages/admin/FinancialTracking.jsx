import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import axios from '../../utils/axiosConfig';

const StatCard = ({ label, value, icon, iconBg, valueColor = "text-green-600" }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-3xl font-bold ${valueColor} group-hover:text-emerald-600 transition`}>₱ {value.toLocaleString()}</p>
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

const getTransactionTypeColor = (type) => {
  switch (type) {
    case 'Income':
      return 'bg-green-100 text-green-800';
    case 'Expense':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTransactionTypeIcon = (type) => {
  switch (type) {
    case 'Income':
      return <ArrowUpIcon className="w-3 h-3" />;
    case 'Expense':
      return <ArrowDownIcon className="w-3 h-3" />;
    default:
      return <CurrencyDollarIcon className="w-3 h-3" />;
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Permit Fees':
      return 'bg-blue-100 text-blue-800';
    case 'Donations':
      return 'bg-purple-100 text-purple-800';
    case 'Office Supplies':
      return 'bg-orange-100 text-orange-800';
    case 'Event Supplies':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const pieColors = ['#34d399', '#f87171', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6', '#facc15'];

const FinancialTracking = () => {
  const [records, setRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [monthFilter, setMonthFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch records from backend
  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/financial-records');
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtering logic
  useEffect(() => {
    setFilteredData(
      records.filter((record) =>
        (categoryFilter === 'All' || record.category === categoryFilter) &&
        (typeFilter === 'All' || record.type === typeFilter) &&
        (monthFilter === 'All' || record.date.slice(5, 7) === monthFilter) &&
        (yearFilter === 'All' || record.date.slice(0, 4) === yearFilter) &&
        (
          (record.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (record.category || '').toLowerCase().includes(search.toLowerCase()) ||
          (record.reference || '').toLowerCase().includes(search.toLowerCase())
        )
      )
    );
  }, [records, search, monthFilter, yearFilter, categoryFilter, typeFilter]);

  // Chart data (use filteredData for charts)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((m, idx) => {
    const monthStr = `2025-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      income: filteredData.filter(d => d.type === 'Income' && d.date.startsWith(monthStr)).reduce((sum, d) => sum + Number(d.amount), 0),
      expense: filteredData.filter(d => d.type === 'Expense' && d.date.startsWith(monthStr)).reduce((sum, d) => sum + Number(d.amount), 0),
    };
  });
  const expenseByCategory = Object.entries(
    filteredData.filter(d => d.type === 'Expense').reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + Number(d.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Add/Edit Modal logic
  const handleEdit = (record) => {
    setEditData(record);
    setEditFile(null);
    setShowModal(true);
  };
  const handleAdd = () => {
    setEditData({ date: '', type: '', category: '', amount: '', description: '', reference: '', approved_by: '', status: 'Completed' });
    setEditFile(null);
    setShowModal(true);
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([k, v]) => formData.append(k, v));
      if (editFile) formData.append('attachment', editFile);
      let res;
      if (editData.id) {
        res = await axios.post(`/financial-records/${editData.id}?_method=PUT`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await axios.post('/financial-records', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      setEditData({});
      setEditFile(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to save record');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/financial-records/${id}`);
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Reference', 'Approved By', 'Status'];
    const rows = filteredData.map(r => [r.date, r.type, r.category, r.amount, r.description, r.reference, r.approved_by, r.status]);
    const csv = [headers, ...rows].map(row => row.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import CSV
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    const keys = header.replace(/"/g, '').split(',');
    for (const row of rows) {
      const values = row.match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || row.split(',');
      const record = {};
      keys.forEach((k, i) => record[k.trim().replace(/ /g, '_').toLowerCase()] = values[i]);
      try {
        await axios.post('/financial-records', record);
      } catch {}
    }
    fetchRecords();
    alert('Import complete!');
  };

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
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

  // Calculate summary
  const totalIncome = filteredData
    .filter(item => item.type === 'Income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = filteredData
    .filter(item => item.type === 'Expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const netBalance = totalIncome - totalExpense;

  const getTransactionCount = (type) => {
    return filteredData.filter(record => record.type === type).length;
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2"><ArrowUpIcon className="w-5 h-5 text-green-400" /> Income vs. Expenses (2025)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                  <XAxis dataKey="month" tick={{ fill: '#047857', fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#047857', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '1rem', border: '1px solid #a7f3d0', color: '#047857' }} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Expense" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center">
              <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2"><ArrowDownIcon className="w-5 h-5 text-red-400" /> Expense Breakdown by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {expenseByCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <CurrencyDollarIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Financial Tracking & Records
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive financial management system for barangay income, expenses, and budget tracking with real-time analytics.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Income"
              value={totalIncome}
              icon={<ArrowUpIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
              valueColor="text-green-600"
            />
            <StatCard
              label="Total Expenses"
              value={totalExpense}
              icon={<ArrowDownIcon className="w-6 h-6 text-red-600" />}
              iconBg="bg-red-100"
              valueColor="text-red-600"
            />
            <StatCard
              label="Net Balance"
              value={netBalance}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
              valueColor={netBalance >= 0 ? "text-emerald-600" : "text-red-600"}
            />
            <StatCard
              label="Total Transactions"
              value={filteredData.length}
              icon={<DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
              valueColor="text-blue-600"
            />
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button onClick={handleAdd} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <PlusIcon className="w-5 h-5" />
                  Add Transaction
                </button>
                <button onClick={handleExportCSV} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105">
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export CSV
                </button>
                <label className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer">
                  <CalendarIcon className="w-5 h-5" />
                  Import CSV
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>
              </div>

              <div className="flex gap-3 items-center w-full max-w-md">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by description, category, or reference..."
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

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Categories</option>
                <option value="Permit Fees">Permit Fees</option>
                <option value="Donations">Donations</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Event Supplies">Event Supplies</option>
              </select>
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Financial Records
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Attachment</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <CurrencyDollarIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No financial records found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => (
                      <React.Fragment key={record.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{formatDate(record.date)}</td>
                          <td className="px-4 py-4">
                            {badge(record.type, getTransactionTypeColor(record.type), getTransactionTypeIcon(record.type))}
                          </td>
                          <td className="px-4 py-4">
                            {badge(record.category, getCategoryColor(record.category))}
                          </td>
                          <td onClick={() => handleShowDetails(record)} className="px-4 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200">
                            <div className={`font-semibold ${record.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>₱ {Number(record.amount).toLocaleString()}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" />
                              Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{record.description}</td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.attachment ? (
                              <a href={record.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleShowDetails(record)} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105">
                                <EyeIcon className="w-3 h-3" />
                                View
                              </button>
                              <button onClick={() => handleEdit(record)} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105">
                                <PencilIcon className="w-3 h-3" />
                                Edit
                              </button>
                              <button onClick={() => handleDelete(record.id)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {selectedRecord?.id === record.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="8" className="px-8 py-8">
                              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                  {/* Transaction Information Card */}
                                  <div className="flex-1 space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <CurrencyDollarIcon className="w-5 h-5" /> Transaction Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Reference:</span> <span className="text-gray-900">{selectedRecord.reference}</span></div>
                                        <div><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-900">{selectedRecord.type}</span></div>
                                        <div><span className="font-medium text-gray-700">Category:</span> <span className="text-gray-900">{selectedRecord.category}</span></div>
                                        <div><span className="font-medium text-gray-700">Amount:</span> <span className={`font-semibold ${selectedRecord.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>₱ {Number(selectedRecord.amount).toLocaleString()}</span></div>
                                        <div><span className="font-medium text-gray-700">Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.date)}</span></div>
                                        <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{selectedRecord.status}</span></div>
                                        <div><span className="font-medium text-gray-700">Approved By:</span> <span className="text-gray-900">{selectedRecord.approved_by}</span></div>
                                        <div><span className="font-medium text-gray-700">Description:</span> <span className="text-gray-900">{selectedRecord.description}</span></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <form onSubmit={handleSave} className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
                  <PencilIcon className="w-6 h-6" />
                  {editData.id ? 'Edit' : 'Add'} Financial Record
                </h2>
                <button onClick={() => setShowModal(false)} type="button" className="text-green-700 hover:text-red-400 transition-colors duration-200">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                  <select name="type" value={editData.type || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" required>
                    <option value="">Select Type</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select name="category" value={editData.category || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" required>
                    <option value="">Select Category</option>
                    <option value="Permit Fees">Permit Fees</option>
                    <option value="Donations">Donations</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Event Supplies">Event Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                  <input name="amount" type="number" value={editData.amount || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" placeholder="Enter amount" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input name="date" type="date" value={editData.date || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <input name="description" type="text" value={editData.description || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" placeholder="Enter description" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reference</label>
                  <input name="reference" type="text" value={editData.reference || ''} onChange={handleEditChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" placeholder="Reference (optional)" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment (optional)</label>
                  <input name="attachment" type="file" onChange={handleFileChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300" />
                  {editData.attachment && (
                    <a href={editData.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 inline-block">View Current Attachment</a>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105">{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </form>
          </div>
        )}
      </main>
    </>
  );
};

export default FinancialTracking;