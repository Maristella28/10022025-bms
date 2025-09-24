import React, { useState, useEffect } from 'react';
import { HeartIcon, ChartBarIcon, UserIcon, CalendarIcon, DocumentTextIcon, ArrowPathIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Use relative URLs to leverage Vite proxy
const fetchPrograms = async () => {
  const res = await fetch('/api/programs');
  return await res.json();
};
const fetchBeneficiaries = async () => {
  const res = await fetch('/api/beneficiaries');
  return await res.json();
};

const SocialServices = () => {
  const [programs, setPrograms] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const navigate = useNavigate();
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProgram, setEditProgram] = useState({});
  const [editData, setEditData] = useState({});
  const [addProgramMode, setAddProgramMode] = useState(false);
  const [addBeneficiaryMode, setAddBeneficiaryMode] = useState(false);
  const [currentProgramForBeneficiary, setCurrentProgramForBeneficiary] = useState(null);

  // Add Program form state
    const [programForm, setProgramForm] = useState({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: '',
      beneficiaryType: '',
      assistanceType: '',
      amount: '',
      maxBeneficiaries: '',
    });
  const [programFormError, setProgramFormError] = useState('');
  const [programFormLoading, setProgramFormLoading] = useState(false);
  const [programFormSuccess, setProgramFormSuccess] = useState('');

  // Analytics state
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('programs');

  // Analytics period selection
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadData = async () => {
      const programsData = await fetchPrograms();
      const beneficiariesData = await fetchBeneficiaries();
      setPrograms(programsData);
      setBeneficiaries(beneficiariesData);
      setChartData(generateChartData(programsData, selectedPeriod, selectedYear, selectedMonth));
      setPieChartData(generatePieChartData(programsData, selectedPeriod, selectedYear, selectedMonth));
      setBarChartData(generateBarChartData(programsData, beneficiariesData, selectedPeriod, selectedYear, selectedMonth));
    };
    loadData();
  }, []);

  const getBeneficiariesByProgram = (programId) => beneficiaries.filter(b => b.program_id === programId);

  const handleAddProgramClick = () => {
    setEditProgram({});
    setProgramForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: '',
      beneficiaryType: '',
      assistanceType: '',
      amount: '',
      maxBeneficiaries: '',
    });
    setProgramFormError('');
    setProgramFormSuccess('');
    setAddProgramMode(true);
    setShowProgramModal(true);
  };

  const handleEditProgramClick = (program) => {
    setEditProgram(program);
    setProgramForm({
      name: program.name || '',
      description: program.description || '',
      startDate: program.start_date || program.startDate || '',
      endDate: program.end_date || program.endDate || '',
      status: program.status || 'draft',
      beneficiaryType: program.beneficiary_type || program.beneficiaryType || '',
      assistanceType: program.assistance_type || program.assistanceType || '',
      amount: program.amount || '',
      maxBeneficiaries: program.max_beneficiaries || program.maxBeneficiaries || '',
    });
    setProgramFormError('');
    setProgramFormSuccess('');
    setAddProgramMode(false);
    setShowProgramModal(true);
  };
  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        alert('Failed to delete program.');
        return;
      }
      fetchPrograms().then(setPrograms);
    } catch (err) {
      alert('Failed to delete program. ' + (err?.message || ''));
    }
  };
  const handleModalClose = () => {
    setShowModal(false);
    setEditData({});
    setAddBeneficiaryMode(false);
    setCurrentProgramForBeneficiary(null);
  };
  const handleProgramModalClose = () => {
    setShowProgramModal(false);
    setAddProgramMode(false);
    setProgramFormError('');
    setProgramFormSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const toInputDate = (dateString) => {
    if (!dateString) return '';
    // Handles ISO format like "2024-01-01T00:00:00.000000Z"
    return dateString.split('T')[0];
  };

  // --- Enhanced Analytics calculations ---
  const totalPrograms = programs.length;
  const totalBeneficiaries = beneficiaries.length;
  let earliestStart = null, latestEnd = null;
  let activePrograms = 0;
  let completedPrograms = 0;
  let draftPrograms = 0;
  const today = new Date();
  const beneficiariesPerProgram = programs.map(p => ({
    id: p.id,
    name: p.name,
    count: beneficiaries.filter(b => b.program_id === p.id).length
  }));
  programs.forEach(p => {
    if (p.start_date && (!earliestStart || new Date(p.start_date) < new Date(earliestStart))) {
      earliestStart = p.start_date;
    }
    if (p.end_date && (!latestEnd || new Date(p.end_date) > new Date(latestEnd))) {
      latestEnd = p.end_date;
    }
    // Status counts (use status field if present, else fallback to date logic)
    if (p.status) {
      if (p.status === 'ongoing') activePrograms++;
      else if (p.status === 'complete') completedPrograms++;
      else if (p.status === 'draft') draftPrograms++;
    } else if (p.start_date && p.end_date) {
      const start = new Date(p.start_date);
      const end = new Date(p.end_date);
      if (today >= start && today <= end) activePrograms++;
      else if (today < start) draftPrograms++;
      else if (today > end) completedPrograms++;
    }
  });

  // Top 3 programs by beneficiaries
  const topPrograms = [...beneficiariesPerProgram].sort((a, b) => b.count - a.count).slice(0, 3);

  // State for toggling analytics visibility
  const [showTopPrograms, setShowTopPrograms] = useState(true);
  const [showBeneficiariesBar, setShowBeneficiariesBar] = useState(true);

  // Update charts when filters change
  useEffect(() => {
    setChartData(generateChartData(programs, selectedPeriod, selectedYear, selectedMonth));
    setPieChartData(generatePieChartData(programs, selectedPeriod, selectedYear, selectedMonth));
    setBarChartData(generateBarChartData(programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth));
  }, [programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth]);

  // Generate chart data for program creation based on period, year, and month
  const generateChartData = (programs, period = 'all', year = currentYear, month = 0) => {
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
      programs.forEach(program => {
        if (program.created_at) {
          const date = new Date(program.created_at);
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
          programs: dailyData[key] || 0
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
        programs.forEach(program => {
          if (program.created_at) {
            const date = new Date(program.created_at);
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
            programs: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        programs.forEach(program => {
          if (program.created_at) {
            const date = new Date(program.created_at);
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
            programs: yearlyData[key] || 0
          });
        }
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      programs.forEach(program => {
        if (program.created_at) {
          const date = new Date(program.created_at);
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
          programs: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Generate pie chart data for program status based on period, year, and month
  const generatePieChartData = (programs, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredPrograms = programs;
    if (period === 'month' && month > 0) {
      filteredPrograms = programs.filter(program => {
        if (!program.created_at) return false;
        const date = new Date(program.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const statusCounts = {};
    filteredPrograms.forEach(program => {
      const status = program.status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const colors = ['#10b981', '#f59e0b', '#6b7280', '#ef4444'];
    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Generate bar chart data for beneficiaries per program based on period, year, and month
  const generateBarChartData = (programs, beneficiaries, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredPrograms = programs;
    let filteredBeneficiaries = beneficiaries;
    if (period === 'month' && month > 0) {
      filteredPrograms = programs.filter(program => {
        if (!program.created_at) return false;
        const date = new Date(program.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
      filteredBeneficiaries = beneficiaries.filter(beneficiary => {
        if (!beneficiary.created_at) return false;
        const date = new Date(beneficiary.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
        filteredBeneficiaries = beneficiaries.filter(beneficiary => {
          if (!beneficiary.created_at) return false;
          const date = new Date(beneficiary.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getFullYear() === year;
        });
        filteredBeneficiaries = beneficiaries.filter(beneficiary => {
          if (!beneficiary.created_at) return false;
          const date = new Date(beneficiary.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    return filteredPrograms.map(program => ({
      name: program.name.length > 15 ? program.name.substring(0, 15) + '...' : program.name,
      beneficiaries: filteredBeneficiaries.filter(b => b.program_id === program.id).length,
      fullName: program.name
    })).sort((a, b) => b.beneficiaries - a.beneficiaries).slice(0, 8);
  };

  // Get most active program by beneficiaries based on period, year, and month
  const getMostActiveProgram = (programs, beneficiaries, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredPrograms = programs;
    let filteredBeneficiaries = beneficiaries;
    if (period === 'month' && month > 0) {
      filteredPrograms = programs.filter(program => {
        if (!program.created_at) return false;
        const date = new Date(program.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
      filteredBeneficiaries = beneficiaries.filter(beneficiary => {
        if (!beneficiary.created_at) return false;
        const date = new Date(beneficiary.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
        filteredBeneficiaries = beneficiaries.filter(beneficiary => {
          if (!beneficiary.created_at) return false;
          const date = new Date(beneficiary.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredPrograms = programs.filter(program => {
          if (!program.created_at) return false;
          const date = new Date(program.created_at);
          return date.getFullYear() === year;
        });
        filteredBeneficiaries = beneficiaries.filter(beneficiary => {
          if (!beneficiary.created_at) return false;
          const date = new Date(beneficiary.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    let max = 0;
    let mostActive = '';
    filteredPrograms.forEach(program => {
      const count = filteredBeneficiaries.filter(b => b.program_id === program.id).length;
      if (count > max) {
        max = count;
        mostActive = program.name;
      }
    });
    return { name: mostActive, count: max };
  };

  return (
    <main className="bg-gradient-to-br from-green-50 to-white min-h-screen pt-20 px-2 sm:px-4 md:px-8 pb-10 font-sans lg:ml-64">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">Government Programs Management</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Manage social assistance programs and their beneficiaries in a modern, card-based dashboard.</p>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="w-full flex flex-col gap-6 mb-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-700 group-hover:text-emerald-600 transition-colors duration-300">{totalPrograms}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Total Programs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-700 group-hover:text-indigo-600 transition-colors duration-300">{totalBeneficiaries}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Total Beneficiaries</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-semibold text-indigo-700 group-hover:text-purple-600 transition-colors duration-300 text-center">
                {earliestStart ? formatDate(earliestStart) : 'N/A'} - {latestEnd ? formatDate(latestEnd) : 'N/A'}
              </div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Programs Date Range</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 group-hover:text-teal-600 transition-colors duration-300">{activePrograms}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Ongoing Programs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-yellow-700 group-hover:text-orange-600 transition-colors duration-300">{draftPrograms}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Draft Programs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-700 group-hover:text-slate-600 transition-colors duration-300">{completedPrograms}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Completed Programs</div>
            </div>
          </div>

          {/* Enhanced Analytics Charts */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Program Analytics
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
              {selectedPeriod === 'month' ? `Daily programs created in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly programs created in ${selectedYear || currentYear}` :
               'Programs created over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedPeriod === 'month' || (selectedPeriod === 'year' && selectedMonth > 0) ? "name" : "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="programs" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Most Active Program {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostActiveProgram(programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth).name || 'N/A'}</p>
                <p className="text-sm text-green-700">{getMostActiveProgram(programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth).count} beneficiaries</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Average Beneficiaries per Program
                </h4>
                <p className="text-lg font-bold text-blue-900">{totalPrograms > 0 ? (totalBeneficiaries / totalPrograms).toFixed(1) : '0.0'}</p>
                <p className="text-sm text-blue-700">beneficiaries per program</p>
              </div>
            </div>
          </div>

          {/* Program Status Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Program Status Distribution
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

          {/* Beneficiaries per Program Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Beneficiaries per Program (Top 8)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, 'Beneficiaries']}
                  labelFormatter={(label) => {
                    const item = barChartData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Legend />
                <Bar dataKey="beneficiaries" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Add New Program Button - Before Top Programs */}
          <div className="flex justify-end mb-6">
            <button
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={handleAddProgramClick}
            >
              <PlusIcon className="w-5 h-5" />
              Add New Program
            </button>
          </div>

          {/* Top Programs Table with toggle */}
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-blue-700">Top 3 Programs by Beneficiaries (Detailed)</div>
              <button
                className="text-xs px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition"
                onClick={() => setShowTopPrograms(v => !v)}
              >
                {showTopPrograms ? 'Hide' : 'Show'}
              </button>
            </div>
            {showTopPrograms && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1">Program</th>
                    <th className="py-1">Description</th>
                    <th className="py-1">Date Range</th>
                    <th className="py-1">Status</th>
                    <th className="py-1">Beneficiaries</th>
                    <th className="py-1">% of Total</th>
                    <th className="py-1">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {topPrograms.map(p => {
                    const program = programs.find(pr => pr.id === p.id) || {};
                    const percent = totalBeneficiaries ? ((p.count / totalBeneficiaries) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="py-1 font-medium">{p.name}</td>
                        <td className="py-1">{program.description || 'N/A'}</td>
                        <td className="py-1">{formatDate(program.start_date)} - {formatDate(program.end_date)}</td>
                        <td className="py-1">{program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'N/A'}</td>
                        <td className="py-1">{p.count}</td>
                        <td className="py-1">{percent}%</td>
                        <td className="py-1">
                          <button
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                            onClick={() => navigate(`/admin/social-services/program/${p.id}`)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {/* Simple Bar Chart Visualization with toggle */}
          <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-indigo-700">Beneficiaries per Program</div>
              <button
                className="text-xs px-3 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition"
                onClick={() => setShowBeneficiariesBar(v => !v)}
              >
                {showBeneficiariesBar ? 'Hide' : 'Show'}
              </button>
            </div>
            {showBeneficiariesBar && (
              <div className="w-full flex flex-col gap-2">
                {beneficiariesPerProgram.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="w-32 truncate text-gray-700 text-xs">{p.name}</span>
                    <div className="flex-1 bg-indigo-100 rounded h-4 relative">
                      <div
                        className="bg-indigo-500 h-4 rounded"
                        style={{ width: `${totalBeneficiaries ? (p.count / Math.max(...beneficiariesPerProgram.map(x => x.count), 1)) * 100 : 0}%`, minWidth: p.count > 0 ? '8px' : '0' }}
                      ></div>
                    </div>
                    <span className="ml-2 text-indigo-700 font-semibold text-xs">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className="rounded-2xl shadow-xl border-2 border-gray-100 bg-white p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/admin/social-services/program/${program.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-700 group-hover:text-emerald-600 transition-colors duration-300">{program.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        program.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        program.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        program.status === 'complete' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-full text-sm font-bold shadow-sm group-hover:shadow-md transition-all duration-300">
                    {getBeneficiariesByProgram(program.id).length}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Beneficiaries</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">{program.description}</p>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-4 border border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">Duration</span>
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  {formatDate(program.start_date)} - {formatDate(program.end_date)}
                </div>
              </div>

              {program.amount && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span className="font-medium">Assistance Amount</span>
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    ₱{parseFloat(program.amount).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  onClick={e => { e.stopPropagation(); handleDeleteProgram(program.id); }}
                >
                  <TrashIcon className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
                <button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                  onClick={e => { e.stopPropagation(); handleEditProgramClick(program); }}
                >
                  <PencilIcon className="w-4 h-4 inline mr-1" />
                  Edit
                </button>
                <button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  onClick={e => { e.stopPropagation(); navigate(`/admin/social-services/program/${program.id}`); }}
                >
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Beneficiary Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {addBeneficiaryMode ? '+ Add Beneficiary' : 'Edit Beneficiary'}
                  </h2>
                  <button
                    onClick={handleModalClose}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    X
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* ...beneficiary form fields here... */}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Add/Edit Program Modal */}
        {showProgramModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 w-full max-w-lg max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    {addProgramMode ? <PlusIcon className="w-7 h-7" /> : <PencilIcon className="w-7 h-7" />}
                    {addProgramMode ? 'Add New Program' : 'Edit Program'}
                  </h2>
                  <button
                    onClick={handleProgramModalClose}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Blue Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <DocumentTextIcon className="w-6 h-6 text-white bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 shadow-lg ring-2 ring-blue-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-blue-100 mt-1">Details</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-blue-100 mt-1">Schedule</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-blue-100 mt-1">Confirm</span>
                  </div>
                </div>
              </div>
              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-blue-50/80 rounded-b-3xl animate-fadeIn">
                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Program Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5" /> Program Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Program Name</label>
                      <input
                        type="text"
                        value={programForm.name}
                        onChange={e => setProgramForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter program name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Description</label>
                      <textarea
                        value={programForm.description}
                        onChange={e => setProgramForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter description"
                        rows="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Status</label>
                      <select
                        value={programForm.status}
                        onChange={e => setProgramForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="draft">Draft</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule & Capacity Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5" /> Schedule & Capacity
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={toInputDate(programForm.startDate)}
                          onChange={e => setProgramForm(f => ({ ...f, startDate: e.target.value }))}
                          className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={toInputDate(programForm.endDate)}
                          onChange={e => setProgramForm(f => ({ ...f, endDate: e.target.value }))}
                          className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Maximum Beneficiaries</label>
                      <input
                        type="number"
                        min="1"
                        value={programForm.maxBeneficiaries}
                        onChange={e => setProgramForm(f => ({ ...f, maxBeneficiaries: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter maximum number"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Assistance Details Section */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                    <HeartIcon className="w-5 h-5" /> Assistance Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Beneficiary Type</label>
                      <input
                        type="text"
                        value={programForm.beneficiaryType}
                        onChange={e => setProgramForm(f => ({ ...f, beneficiaryType: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter beneficiary type"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Assistance Type</label>
                      <input
                        type="text"
                        value={programForm.assistanceType}
                        onChange={e => setProgramForm(f => ({ ...f, assistanceType: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter assistance type"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Amount (₱)</label>
                      <input
                        type="number"
                        value={programForm.amount}
                        onChange={e => setProgramForm(f => ({ ...f, amount: e.target.value }))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-blue-300 text-blue-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Messages */}
                {programFormError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                      <div>
                        <h4 className="text-red-800 font-semibold">Error</h4>
                        <p className="text-red-700 text-sm">{programFormError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {programFormSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="text-green-800 font-semibold">Success</h4>
                        <p className="text-green-700 text-sm">{programFormSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-blue-100 sticky bottom-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleProgramModalClose}
                    className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={programFormLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={async e => {
                      e.preventDefault();
                      setProgramFormError('');
                      setProgramFormSuccess('');
                      setProgramFormLoading(true);
                      try {
                        let url = '/api/programs';
                        let method = 'POST';
                        if (editProgram && editProgram.id) {
                          url = `/api/programs/${editProgram.id}`;
                          method = 'PUT';
                        }
                        const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: programForm.name,
                            description: programForm.description,
                            start_date: programForm.startDate,
                            end_date: programForm.endDate,
                            status: programForm.status,
                            beneficiary_type: programForm.beneficiaryType,
                            assistance_type: programForm.assistanceType,
                            amount: programForm.amount,
                            max_beneficiaries: programForm.maxBeneficiaries,
                          }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setProgramFormError(data?.message || (editProgram && editProgram.id ? 'Failed to update program.' : 'Failed to add program.'));
                          return;
                        }
                        setProgramFormSuccess(editProgram && editProgram.id ? 'Program updated successfully!' : 'Program added successfully!');
                        setShowProgramModal(false);
                        setProgramForm({ name: '', description: '', startDate: '', endDate: '', status: '', beneficiaryType: '', assistanceType: '', amount: '', maxBeneficiaries: '' });
                        fetchPrograms().then(setPrograms);
                      } catch (err) {
                        setProgramFormError((editProgram && editProgram.id ? 'Failed to update program. ' : 'Failed to add program. ') + (err?.message || ''));
                      } finally {
                        setProgramFormLoading(false);
                      }
                    }}
                  >
                    {programFormLoading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Save Program</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default SocialServices;
