import React, { useState, useEffect } from 'react';
import { HeartIcon, ChartBarIcon, UserIcon, CalendarIcon, DocumentTextIcon, ArrowPathIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from '../../../../utils/axiosConfig';

// Use axios for consistent API handling
const fetchPrograms = async () => {
  try {
    const res = await axios.get('/admin/programs');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

const fetchBeneficiaries = async () => {
  try {
    const res = await axios.get('/admin/beneficiaries');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return [];
  }
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
      payoutDate: '',
    });
  const [programFormError, setProgramFormError] = useState('');
  const [programFormLoading, setProgramFormLoading] = useState(false);
  const [programFormSuccess, setProgramFormSuccess] = useState('');
  const [showNotificationSuccessModal, setShowNotificationSuccessModal] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState(null);

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
      payoutDate: '',
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
      payoutDate: program.payout_date || program.payoutDate || '',
    });
    setProgramFormError('');
    setProgramFormSuccess('');
    setAddProgramMode(false);
    setShowProgramModal(true);
  };
  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await axios.delete(`/admin/programs/${programId}`);
      const updatedPrograms = await fetchPrograms();
      setPrograms(updatedPrograms);
    } catch (err) {
      console.error('Error deleting program:', err);
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

  const toInputDateTime = (dateString) => {
    if (!dateString) return '';
    // Handles ISO format like "2024-01-01T00:00:00.000000Z"
    const date = new Date(dateString);
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  // Enhanced Analytics Calculations
  const totalAmount = beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const averageAmount = totalBeneficiaries > 0 ? Math.round(totalAmount / totalBeneficiaries) : 0;
  const paidBeneficiariesCount = beneficiaries.filter(b => b.is_paid).length;
  const pendingPaymentCount = beneficiaries.filter(b => b.status === 'Approved' && !b.is_paid).length;
  const paymentRate = totalBeneficiaries > 0 ? Math.round((paidBeneficiariesCount / totalBeneficiaries) * 100) : 0;
  
  // Program health calculations
  const programHealthScores = programs.map(program => {
    const programBeneficiaries = beneficiaries.filter(b => b.program_id === program.id);
    const programPaidCount = programBeneficiaries.filter(b => b.is_paid).length;
    const programPaymentRate = programBeneficiaries.length > 0 ? (programPaidCount / programBeneficiaries.length) * 100 : 0;
    const completionRate = program.max_beneficiaries ? (programBeneficiaries.length / program.max_beneficiaries) * 100 : 0;
    
    // Calculate health score (0-100)
    let healthScore = 0;
    if (completionRate >= 90) healthScore += 40;
    else if (completionRate >= 70) healthScore += 30;
    else if (completionRate >= 50) healthScore += 20;
    else healthScore += 10;
    
    if (programPaymentRate >= 80) healthScore += 30;
    else if (programPaymentRate >= 60) healthScore += 20;
    else if (programPaymentRate >= 40) healthScore += 10;
    
    if (program.status === 'ongoing') healthScore += 20;
    else if (program.status === 'complete') healthScore += 15;
    else healthScore += 5;
    
    return {
      programId: program.id,
      programName: program.name,
      healthScore: Math.min(100, healthScore),
      completionRate,
      paymentRate: programPaymentRate,
      beneficiaryCount: programBeneficiaries.length,
      maxBeneficiaries: program.max_beneficiaries || 0
    };
  });

  const averageHealthScore = programHealthScores.length > 0 
    ? Math.round(programHealthScores.reduce((sum, p) => sum + p.healthScore, 0) / programHealthScores.length)
    : 0;

  // Generate actionable suggestions
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Low health score programs
    const lowHealthPrograms = programHealthScores.filter(p => p.healthScore < 50);
    if (lowHealthPrograms.length > 0) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Programs Need Attention',
        message: `${lowHealthPrograms.length} program${lowHealthPrograms.length > 1 ? 's' : ''} have health scores below 50%.`,
        action: 'Review program performance and implement improvements',
        programs: lowHealthPrograms.map(p => p.programName)
      });
    }

    // Low completion rates
    const lowCompletionPrograms = programHealthScores.filter(p => p.completionRate < 30);
    if (lowCompletionPrograms.length > 0) {
      suggestions.push({
        type: 'info',
        icon: '📈',
        title: 'Low Enrollment Programs',
        message: `${lowCompletionPrograms.length} program${lowCompletionPrograms.length > 1 ? 's' : ''} have less than 30% enrollment.`,
        action: 'Increase outreach efforts and marketing',
        programs: lowCompletionPrograms.map(p => p.programName)
      });
    }

    // Low payment rates
    const lowPaymentPrograms = programHealthScores.filter(p => p.paymentRate < 50 && p.beneficiaryCount > 0);
    if (lowPaymentPrograms.length > 0) {
      suggestions.push({
        type: 'urgent',
        icon: '💳',
        title: 'Payment Processing Issues',
        message: `${lowPaymentPrograms.length} program${lowPaymentPrograms.length > 1 ? 's' : ''} have low payment rates.`,
        action: 'Accelerate payment processing and follow up on pending payments',
        programs: lowPaymentPrograms.map(p => p.programName)
      });
    }

    // Draft programs
    if (draftPrograms > 0) {
      suggestions.push({
        type: 'info',
        icon: '📝',
        title: 'Draft Programs',
        message: `${draftPrograms} program${draftPrograms > 1 ? 's' : ''} are still in draft status.`,
        action: 'Review and publish ready programs to increase activity',
        programs: programs.filter(p => p.status === 'draft').map(p => p.name)
      });
    }

    // High performing programs
    const highPerformingPrograms = programHealthScores.filter(p => p.healthScore >= 80);
    if (highPerformingPrograms.length > 0) {
      suggestions.push({
        type: 'success',
        icon: '🎉',
        title: 'High Performing Programs',
        message: `${highPerformingPrograms.length} program${highPerformingPrograms.length > 1 ? 's' : ''} are performing excellently.`,
        action: 'Use these programs as templates for new initiatives',
        programs: highPerformingPrograms.map(p => p.programName)
      });
    }

    // No recent activity
    const recentPrograms = programs.filter(p => {
      const createdDate = new Date(p.created_at);
      const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
      return createdDate >= weekAgo;
    });
    
    if (recentPrograms.length === 0 && programs.length > 0) {
      suggestions.push({
        type: 'info',
        icon: '📊',
        title: 'No Recent Activity',
        message: 'No new programs created in the last 7 days.',
        action: 'Consider creating new programs or updating existing ones',
        programs: []
      });
    }

    // Default suggestion if no specific issues
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: '🎯',
        title: 'All Systems Running Smoothly',
        message: 'All programs are performing well within normal parameters.',
        action: 'Continue current operations and monitor for improvements',
        programs: []
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  // State for toggling analytics visibility
  const [showTopPrograms, setShowTopPrograms] = useState(true);
  const [showBeneficiariesBar, setShowBeneficiariesBar] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showHealthScoreBreakdown, setShowHealthScoreBreakdown] = useState(false);

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

          {/* Enhanced Financial and Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-700 group-hover:text-pink-600 transition-colors duration-300">{paymentRate}%</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Payment Rate</div>
              <div className="text-xs text-gray-500 mt-1">{paidBeneficiariesCount} paid</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 group-hover:text-blue-600 transition-colors duration-300">{averageHealthScore}/100</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Avg Health Score</div>
              <div className="text-xs text-gray-500 mt-1">across {totalPrograms} programs</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-700 group-hover:text-emerald-600 transition-colors duration-300">₱{totalAmount.toLocaleString()}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Total Budget</div>
              <div className="text-xs text-gray-500 mt-1">₱{averageAmount.toLocaleString()} avg</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-2xl hover:scale-105 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-700 group-hover:text-red-600 transition-colors duration-300">{pendingPaymentCount}</div>
              <div className="text-gray-600 text-sm mt-1 font-medium">Pending Payments</div>
              <div className="text-xs text-gray-500 mt-1">awaiting processing</div>
            </div>
          </div>

          {/* Program Health Score Overview */}
          <div 
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-6 cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setShowHealthScoreBreakdown(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-800">Overall Program Health Score</h3>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  averageHealthScore >= 80 ? 'bg-green-100 text-green-800' :
                  averageHealthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  averageHealthScore >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {averageHealthScore >= 80 ? 'Excellent' :
                   averageHealthScore >= 60 ? 'Good' :
                   averageHealthScore >= 40 ? 'Fair' : 'Poor'}
                </div>
                <span className="text-indigo-600 text-sm">Click to see breakdown</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      averageHealthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      averageHealthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      averageHealthScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${averageHealthScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-700">{averageHealthScore}/100</div>
            </div>
          </div>

          {/* Enhanced Program Analytics Dashboard */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  Program Analytics Dashboard
                </h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive insights into program performance and trends
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value !== 'month') setSelectedMonth(0);
                    setSelectedYear('');
                  }}
                  className="px-4 py-3 border-2 border-blue-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-semibold bg-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="px-4 py-3 border-2 border-blue-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-semibold bg-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="px-4 py-3 border-2 border-blue-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-semibold bg-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                    className="px-4 py-3 border-2 border-gray-300 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    <option>Select a year first</option>
                  </select>
                )}
              </div>
            </div>

            {/* Program Creation Timeline Chart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
                  </div>
                  Program Creation Timeline
                </h4>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {selectedPeriod === 'month' ? `Daily view - ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
                   selectedPeriod === 'year' ? `Monthly view - ${selectedYear || currentYear}` :
                   'Last 12 months overview'}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="programs" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Program Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Most Active Program */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-green-800">Most Active Program</h4>
                    <p className="text-sm text-green-600">
                      {selectedPeriod === 'month' ? `Month ${selectedMonth} ${selectedYear}` : 
                       selectedPeriod === 'year' ? `Year ${selectedYear}` : 'All Time'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-900 truncate">
                    {getMostActiveProgram(programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth).name || 'No Programs'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-green-700">
                      {getMostActiveProgram(programs, beneficiaries, selectedPeriod, selectedYear, selectedMonth).count}
                    </span>
                    <span className="text-sm text-green-600 font-medium">beneficiaries</span>
                  </div>
                </div>
              </div>

              {/* Average Performance */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-800">Average Performance</h4>
                    <p className="text-sm text-blue-600">Per Program</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-900">
                      {totalPrograms > 0 ? (totalBeneficiaries / totalPrograms).toFixed(1) : '0.0'}
                    </span>
                    <span className="text-sm text-blue-600 font-medium">beneficiaries</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Across {totalPrograms} programs
                  </div>
                </div>
              </div>

              {/* Program Status Overview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-purple-800">Status Distribution</h4>
                    <p className="text-sm text-purple-600">Program Status</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Ongoing</span>
                    <span className="text-lg font-bold text-purple-900">{activePrograms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Draft</span>
                    <span className="text-lg font-bold text-purple-900">{draftPrograms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Completed</span>
                    <span className="text-lg font-bold text-purple-900">{completedPrograms}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Status Distribution */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl border border-purple-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  Program Status Distribution
                </h3>
                <p className="text-gray-600 text-sm">
                  Visual breakdown of program statuses across your portfolio
                </p>
              </div>
              <div className="text-sm text-purple-600 bg-purple-100 px-4 py-2 rounded-full font-medium">
                {selectedPeriod === 'month' ? `Month ${selectedMonth} ${selectedYear}` : 
                 selectedPeriod === 'year' ? `Year ${selectedYear}` : 'All Time'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">Status Breakdown</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Legend */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Status Details</h4>
                {pieChartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{entry.value}</div>
                      <div className="text-sm text-gray-500">programs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Program Performance Comparison */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl border border-indigo-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  Program Performance Comparison
                </h3>
                <p className="text-gray-600 text-sm">
                  Top performing programs by beneficiary count
                </p>
              </div>
              <div className="text-sm text-indigo-600 bg-indigo-100 px-4 py-2 rounded-full font-medium">
                Top 8 Programs
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, 'Beneficiaries']}
                    labelFormatter={(label) => {
                      const item = barChartData.find(d => d.name === label);
                      return item ? item.fullName : label;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="beneficiaries" 
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
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

          {/* Top Programs Performance Table */}
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-2xl border border-emerald-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  Top Performing Programs
                </h3>
                <p className="text-gray-600 text-sm">
                  Programs ranked by beneficiary count and performance metrics
                </p>
              </div>
              <button
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => setShowTopPrograms(v => !v)}
              >
                {showTopPrograms ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            {showTopPrograms && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Program</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Date Range</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Beneficiaries</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">% of Total</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-emerald-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topPrograms.map((p, index) => {
                        const program = programs.find(pr => pr.id === p.id) || {};
                        const percent = totalBeneficiaries ? ((p.count / totalBeneficiaries) * 100).toFixed(1) : '0.0';
                        return (
                          <tr key={p.id} className="hover:bg-emerald-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-yellow-700' :
                                  'bg-gradient-to-br from-emerald-500 to-green-600'
                                }`}>
                                  {index + 1}
                                </div>
                                {index < 3 && (
                                  <span className="text-xs text-gray-500 font-medium">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{p.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs truncate">
                                {program.description || 'No description available'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {formatDate(program.start_date)} - {formatDate(program.end_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                program.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                program.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                program.status === 'complete' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-emerald-700">{p.count}</span>
                                <span className="text-sm text-gray-500">beneficiaries</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, parseFloat(percent))}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{percent}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
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
                </div>
              </div>
            )}
          </div>
          {/* Program Performance Overview */}
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-2xl border border-indigo-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  Program Performance Overview
                </h3>
                <p className="text-gray-600 text-sm">
                  Visual comparison of beneficiary distribution across all programs
                </p>
              </div>
              <button
                className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => setShowBeneficiariesBar(v => !v)}
              >
                {showBeneficiariesBar ? 'Hide Overview' : 'Show Overview'}
              </button>
            </div>
            
            {showBeneficiariesBar && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="space-y-4">
                  {beneficiariesPerProgram.map((p, index) => {
                    const maxCount = Math.max(...beneficiariesPerProgram.map(x => x.count), 1);
                    const percentage = totalBeneficiaries ? (p.count / maxCount) * 100 : 0;
                    const program = programs.find(pr => pr.id === p.id) || {};
                    
                    return (
                      <div key={p.id} className="group hover:bg-indigo-50 rounded-xl p-4 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                                {p.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {program.status ? program.status.charAt(0).toUpperCase() + program.status.slice(1) : 'Unknown Status'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-700">{p.count}</div>
                            <div className="text-sm text-gray-500">beneficiaries</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${percentage}%`, 
                                minWidth: p.count > 0 ? '8px' : '0' 
                              }}
                            ></div>
                          </div>
                          <div className="text-sm font-semibold text-indigo-700 min-w-[3rem] text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Suggestions Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Actionable Suggestions
              </h3>
              <button
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold text-sm shadow transition-all duration-200"
                onClick={() => setShowSuggestions(v => !v)}
              >
                {showSuggestions ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showSuggestions && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.type === 'urgent' ? 'bg-red-50 border-red-400' :
                      suggestion.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      suggestion.type === 'success' ? 'bg-green-50 border-green-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{suggestion.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          suggestion.type === 'urgent' ? 'text-red-800' :
                          suggestion.type === 'warning' ? 'text-yellow-800' :
                          suggestion.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {suggestion.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          suggestion.type === 'urgent' ? 'text-red-700' :
                          suggestion.type === 'warning' ? 'text-yellow-700' :
                          suggestion.type === 'success' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {suggestion.message}
                        </p>
                        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${
                          suggestion.type === 'urgent' ? 'bg-red-100 text-red-800' :
                          suggestion.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          suggestion.type === 'success' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          💡 {suggestion.action}
                        </div>
                        {suggestion.programs && suggestion.programs.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Affected Programs:</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.programs.map((programName, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {programName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Payout Date & Time (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={toInputDateTime(programForm.payoutDate)}
                          onChange={e => {
                            const value = e.target.value;
                            if (value) {
                              // Convert to ISO format for backend
                              const date = new Date(value);
                              setProgramForm(f => ({ ...f, payoutDate: date.toISOString() }));
                            } else {
                              setProgramForm(f => ({ ...f, payoutDate: '' }));
                            }
                          }}
                          min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                          className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                        />
                        {programForm.payoutDate && (
                          <button
                            type="button"
                            onClick={() => setProgramForm(f => ({ ...f, payoutDate: '' }))}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300"
                            title="Remove payout date"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Set a specific date and time for benefit payouts. Cannot be set to a past date/time.
                      </p>
                      {programForm.payoutDate && new Date(programForm.payoutDate) < new Date() && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Payout date cannot be in the past
                        </p>
                      )}
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
                      
                      // Validate payout date is not in the past
                      if (programForm.payoutDate && new Date(programForm.payoutDate) < new Date()) {
                        setProgramFormError('Payout date cannot be set to a past date/time.');
                        return;
                      }
                      
                      setProgramFormLoading(true);
                      try {
                        const data = {
                          name: programForm.name,
                          description: programForm.description,
                          start_date: programForm.startDate,
                          end_date: programForm.endDate,
                          status: programForm.status,
                          beneficiary_type: programForm.beneficiaryType,
                          assistance_type: programForm.assistanceType,
                          amount: programForm.amount,
                          max_beneficiaries: programForm.maxBeneficiaries,
                          payout_date: programForm.payoutDate || null,
                        };

                        // Check if payout date has changed for email notification
                        let payoutDateChanged = false;
                        let newPayoutDate = null;
                        
                        if (editProgram && editProgram.id) {
                          const originalPayoutDate = editProgram.payout_date || editProgram.payoutDate;
                          newPayoutDate = programForm.payoutDate;
                          payoutDateChanged = originalPayoutDate !== newPayoutDate;
                          
                          console.log('Payout Date Change Debug:', {
                            originalPayoutDate,
                            newPayoutDate,
                            payoutDateChanged,
                            hasNewPayoutDate: !!newPayoutDate
                          });
                          
                          await axios.put(`/admin/programs/${editProgram.id}`, data);
                          
                          // Send email notification if payout date changed
                          if (payoutDateChanged && newPayoutDate) {
                            console.log('Sending payout change notification...');
                            try {
                              const notificationResponse = await axios.post(`/api/admin/programs/${editProgram.id}/notify-payout-change`, {
                                new_payout_date: newPayoutDate,
                                program_name: programForm.name
                              });
                              console.log('Notification sent successfully:', notificationResponse.data);
                              
                              // Show success modal with notification details
                              setNotificationDetails({
                                emailsSent: notificationResponse.data.data.emails_sent,
                                notificationsCreated: notificationResponse.data.data.notifications_created,
                                totalBeneficiaries: notificationResponse.data.data.total_beneficiaries,
                                programName: programForm.name,
                                newPayoutDate: newPayoutDate
                              });
                              setShowNotificationSuccessModal(true);
                            } catch (emailError) {
                              console.error('Error sending payout change notification:', emailError);
                              // Don't fail the entire operation if email fails
                            }
                          } else {
                            console.log('No payout date change detected or no new payout date');
                          }
                        } else {
                          await axios.post('/admin/programs', data);
                        }
                        
                        const successMessage = editProgram && editProgram.id ? 'Program updated successfully!' : 'Program added successfully!';
                        if (payoutDateChanged && newPayoutDate) {
                          setProgramFormSuccess(successMessage + ' Email notifications sent to all beneficiaries.');
                        } else {
                          setProgramFormSuccess(successMessage);
                        }
                        setShowProgramModal(false);
                        setProgramForm({ name: '', description: '', startDate: '', endDate: '', status: '', beneficiaryType: '', assistanceType: '', amount: '', maxBeneficiaries: '', payoutDate: '' });
                        
                        // Refresh programs list
                        const updatedPrograms = await fetchPrograms();
                        setPrograms(updatedPrograms);
                      } catch (err) {
                        console.error('Error saving program:', err);
                        setProgramFormError((editProgram && editProgram.id ? 'Failed to update program. ' : 'Failed to add program. ') + (err?.response?.data?.message || err?.message || ''));
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

        {/* Health Score Breakdown Modal */}
        {showHealthScoreBreakdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Program Health Score Breakdown</h2>
                  <button
                    onClick={() => setShowHealthScoreBreakdown(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Overall Health Score */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-indigo-800">Overall Health Score</h3>
                      <div className="text-3xl font-bold text-indigo-700">
                        {averageHealthScore}/100
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1000 ${
                          averageHealthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          averageHealthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          averageHealthScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${averageHealthScore}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-indigo-600">
                      Average health score across {totalPrograms} programs
                    </div>
                  </div>

                  {/* Individual Program Scores */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Individual Program Health Scores</h3>
                    {programHealthScores.map((program, index) => (
                      <div key={program.programId} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{program.programName}</h4>
                          <span className="text-lg font-bold text-gray-700">{program.healthScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              program.healthScore >= 80 ? 'bg-green-500' :
                              program.healthScore >= 60 ? 'bg-yellow-500' :
                              program.healthScore >= 40 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${program.healthScore}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Completion:</span> {program.completionRate.toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Payment Rate:</span> {program.paymentRate.toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Beneficiaries:</span> {program.beneficiaryCount}/{program.maxBeneficiaries}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Health Score Explanation */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 How Health Scores Are Calculated</h3>
                    <div className="text-sm text-yellow-700 space-y-2">
                      <div><strong>Completion Rate (40 points max):</strong> Based on how many beneficiaries are enrolled vs. maximum capacity</div>
                      <div><strong>Payment Rate (30 points max):</strong> Percentage of approved beneficiaries who have been paid</div>
                      <div><strong>Program Status (20 points max):</strong> Ongoing programs get full points, completed get partial, draft gets minimal</div>
                      <div><strong>Additional Factors:</strong> Recent activity, beneficiary satisfaction, and program efficiency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Success Modal */}
      {showNotificationSuccessModal && notificationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">📧</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Notifications Sent!</h2>
                  <p className="text-green-100">Payout schedule updated successfully</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Program Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Program Details</h3>
                  <p className="text-gray-600"><strong>Program:</strong> {notificationDetails.programName}</p>
                  <p className="text-gray-600"><strong>New Payout Date:</strong> {new Date(notificationDetails.newPayoutDate).toLocaleString()}</p>
                </div>

                {/* Notification Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 text-xl">📧</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">{notificationDetails.emailsSent}</p>
                    <p className="text-sm text-blue-600">Emails Sent</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 text-xl">🔔</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">{notificationDetails.notificationsCreated}</p>
                    <p className="text-sm text-purple-600">In-App Notifications</p>
                  </div>
                </div>

                {/* Total Beneficiaries */}
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 text-xl">👥</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">{notificationDetails.totalBeneficiaries}</p>
                  <p className="text-sm text-green-600">Total Beneficiaries Notified</p>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">✅</span>
                    </div>
                    <div>
                      <h4 className="text-green-800 font-semibold">All Notifications Delivered!</h4>
                      <p className="text-green-700 text-sm">
                        Beneficiaries have been notified via email and in-app notifications about the payout schedule change.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowNotificationSuccessModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowNotificationSuccessModal(false);
                    // Optionally refresh the page or data
                    window.location.reload();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View Program Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SocialServices;
