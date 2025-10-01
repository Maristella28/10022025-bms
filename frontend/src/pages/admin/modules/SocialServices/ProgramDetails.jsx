import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useResidents from '../../../../hooks/useResidents';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import FormBuilder from '../../../../components/FormBuilder';

// Use relative URLs to leverage Vite proxy

// Fetch programs using axios
const fetchPrograms = async () => {
  try {
    const res = await axiosInstance.get('/admin/programs');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

// Fetch beneficiaries for a program
const fetchBeneficiaries = async (programId) => {
  try {
    const res = await axiosInstance.get('/admin/beneficiaries');
    const all = res.data || [];
    return all.filter((b) => String(b.program_id) === String(programId));
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return [];
  }
};

// Fetch announcements for a program
const fetchAnnouncements = async (programId) => {
  try {
    const res = await axiosInstance.get(`/admin/program-announcements?program_id=${programId}`);
    return res.data?.success ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

// Fetch application forms for a program
const fetchApplicationForms = async (programId) => {
  try {
    const res = await axiosInstance.get(`/admin/program-application-forms?program_id=${programId}`);
    return res.data?.success ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching application forms:', error);
    return [];
  }
};

// Fetch qualified residents (those with approved submissions for ALL published forms)
const fetchQualifiedResidents = async (programId) => {
  try {
    const res = await axiosInstance.get(`/admin/programs/${programId}/qualified-residents`);
    return res.data?.success ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching qualified residents:', error);
    return [];
  }
};

const ProgramDetails = () => {
  // State to toggle analytics visibility
  const [showAnalytics, setShowAnalytics] = useState(true);
  // --- Program-specific analytics ---
  // Move analytics code below beneficiaries state initialization
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  
  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  // Application forms state
  const [applicationForms, setApplicationForms] = useState([]);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedFormSubmissions, setSelectedFormSubmissions] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubmissionForReject, setSelectedSubmissionForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [paidBeneficiaries, setPaidBeneficiaries] = useState(new Set());
  const [receiptData, setReceiptData] = useState({});
  const [showHealthScoreBreakdown, setShowHealthScoreBreakdown] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    beneficiaryType: '',
    assistanceType: '',
    status: '',
    amount: '',
    contactNumber: '',
    email: '',
    fullAddress: '',
    remarks: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [qualifiedResidents, setQualifiedResidents] = useState([]);
  const [qualifiedResidentsLoading, setQualifiedResidentsLoading] = useState(false);
  const [qualificationDebugInfo, setQualificationDebugInfo] = useState(null);
  const { residents, loading: residentsLoading, error: residentsError } = useResidents();

    // Profile refresh with retries and proper error handling
  const refreshProfile = async () => {
    try {
      // First ensure CSRF is set
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

      // Try the main profile endpoint
      try {
        console.log('Attempting to refresh profile...');
        const profileResp = await axiosInstance.get('/profile');
        if (profileResp?.data) {
          console.log('Profile refresh successful:', profileResp.data);
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              profile: profileResp.data,
              timestamp: new Date().toISOString()
            }
          }));
          return true;
        }
      } catch (firstErr) {
        console.log('Main profile endpoint failed:', firstErr);
      }

      // Try debug endpoint as fallback
      try {
        console.log('Attempting debug profile endpoint...');
        const debugResp = await axiosInstance.get('/profile/debug');
        if (debugResp?.data) {
          console.log('Debug profile refresh successful:', debugResp.data);
          window.dispatchEvent(new CustomEvent('profile-updated', {
            detail: {
              profile: debugResp.data,
              timestamp: new Date().toISOString()
            }
          }));
          return true;
        }
      } catch (secondErr) {
        console.log('Debug profile endpoint failed:', secondErr);
      }

      console.warn('All profile refresh attempts failed');
      return false;
    } catch (err) {
      console.warn('Profile refresh failed completely:', err);
      return false;
    }
  };

  // Toggle visibility handler with toast feedback
  const toggleVisibility = async (beneficiary, visible) => {
    const original = beneficiaries.slice();

    try {
      // Ensure CSRF token is set
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

      console.log('Attempting to update visibility status:', { 
        beneficiary_id: beneficiary.id,
        visible: visible 
      });

      // Call the toggle endpoint
      const response = await axiosInstance.post(`/admin/beneficiaries/${beneficiary.id}/toggle-visibility`, {
        visible: visible
      });

      console.log('Visibility update response:', response?.data);

      // Verify the response indicates success
      if (response?.data?.visible !== visible) {
        throw new Error('Server returned unexpected visibility state');
      }

      // Update local state if successful
      setBeneficiaries(prevBeneficiaries => 
        prevBeneficiaries.map(b => 
          b.id === beneficiary.id 
            ? { ...b, visible_to_resident: visible }
            : b
        )
      );

      setToast({
        type: 'success',
        message: response.data.message || 'Visibility status updated successfully'
      });

    } catch (err) {
      console.error('Failed to update visibility status:', err);
      setBeneficiaries(original); // Restore original state
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update visibility status'
      });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        const programs = await fetchPrograms();
        const found = programs.find((p) => String(p.id) === String(id));
        setProgram(found);
        
        const beneficiaries = await fetchBeneficiaries(id);
        setBeneficiaries(beneficiaries);
        
        // Load paid status for beneficiaries
        const paidIds = new Set(beneficiaries.filter(b => b.is_paid).map(b => b.id));
        setPaidBeneficiaries(paidIds);
        
        // Load receipt data for paid beneficiaries
        const receiptDataMap = {};
        beneficiaries.filter(b => b.is_paid && b.receipt_path).forEach(b => {
          receiptDataMap[b.id] = {
            url: `/admin/beneficiaries/${b.id}/download-receipt`,
            filename: `${b.receipt_number || 'receipt'}.pdf`,
            receipt_number: b.receipt_number
          };
        });
        setReceiptData(receiptDataMap);
        
        const announcements = await fetchAnnouncements(id);
        setAnnouncements(announcements);
        
        const applicationForms = await fetchApplicationForms(id);
        setApplicationForms(applicationForms);
      } catch (error) {
        console.error('Error loading program data:', error);
      }
    };
    
    loadData();
  }, [id]);

  // Fetch qualified residents when modal opens
  useEffect(() => {
    const loadQualifiedResidents = async () => {
      if (showModal && id) {
        setQualifiedResidentsLoading(true);
        try {
          const response = await axiosInstance.get(`/admin/programs/${id}/qualified-residents`);
          const qualified = response.data?.success ? response.data.data : [];
          const meta = response.data?.meta || {};
          
          console.log('Qualified residents response:', {
            qualified: qualified,
            meta: meta,
            debug_info: response.data?.meta?.debug_info
          });
          
          setQualifiedResidents(qualified);
          setQualificationDebugInfo(response.data?.meta?.debug_info);
        } catch (error) {
          console.error('Error loading qualified residents:', error);
          setQualifiedResidents([]);
        } finally {
          setQualifiedResidentsLoading(false);
        }
      }
    };
    
    loadQualifiedResidents();
  }, [showModal, id]);



  // Autofill Beneficiary Type, Assistance Type, and Amount only if empty when opening modal
  useEffect(() => {
    if (showModal && program) {
      setForm(f => ({
        ...f,
        beneficiaryType: f.beneficiaryType || program.beneficiary_type || program.beneficiaryType || '',
        assistanceType: f.assistanceType || program.assistance_type || program.assistanceType || '',
        amount: f.amount || program.amount || '',
      }));
    }
    // eslint-disable-next-line
  }, [showModal, program]);
  // Reset resident selection and autofilled fields when modal closes (must be outside render)
  useEffect(() => {
    if (!showModal) {
      setForm({
        name: '',
        beneficiaryType: '',
        assistanceType: '',
        status: '',
        amount: '',
        contactNumber: '',
        email: '',
        fullAddress: '',
        remarks: '',
        selectedResidentId: '',
      });
    }
  }, [showModal]);

  if (!program) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 text-xl font-bold mb-4">Program not found</div>
        <div className="text-gray-600 mb-4">
          The program with ID <span className="font-mono">{id}</span> does not exist or was deleted.
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg text-sm font-semibold transition-all duration-300"
        >
          &larr; Back to Programs
        </button>
      </div>
    );
  }

  // --- Enhanced Program Analytics ---
  const totalBeneficiaries = beneficiaries.length;
  const maxBeneficiary = program?.max_beneficiaries ?? program?.maxBeneficiaries ?? 'N/A';
  const programStatus = program?.status ?? 'N/A';
  
  // Enhanced status analysis
  const statusCounts = beneficiaries.reduce((acc, b) => {
    const status = b.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusLabels = Object.keys(statusCounts);

  // Payment analysis
  const paidBeneficiariesCount = beneficiaries.filter(b => b.is_paid).length;
  const pendingPaymentCount = beneficiaries.filter(b => b.status === 'Approved' && !b.is_paid).length;
  const paymentRate = totalBeneficiaries > 0 ? Math.round((paidBeneficiariesCount / totalBeneficiaries) * 100) : 0;
  
  // Financial analysis
  const totalAmount = beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const averageAmount = totalBeneficiaries > 0 ? Math.round(totalAmount / totalBeneficiaries) : 0;
  const paidAmount = beneficiaries.filter(b => b.is_paid).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const pendingAmount = beneficiaries.filter(b => b.status === 'Approved' && !b.is_paid).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  
  // Three-Phase Program Analytics
  const startDate = program?.start_date || program?.startDate || '';
  const endDate = program?.end_date || program?.endDate || '';
  const payoutDate = program?.payout_date || program?.payoutDate || '';
  
  function cropDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const payout = payoutDate ? new Date(payoutDate) : null;
  
  // Phase 1: Gathering Period (Start Date → End Date)
  const gatheringDaysElapsed = start ? Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24))) : 0;
  const gatheringDaysLeft = end ? Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24))) : 0;
  const gatheringDaysTotal = start && end ? Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))) : 0;
  
  // Phase 2: Processing Period (End Date → Payout Date)
  const processingDaysElapsed = end ? Math.max(0, Math.round((today - end) / (1000 * 60 * 60 * 24))) : 0;
  const processingDaysLeft = payout ? Math.max(0, Math.round((payout - today) / (1000 * 60 * 60 * 24))) : 0;
  const processingDaysTotal = end && payout ? Math.max(1, Math.round((payout - end) / (1000 * 60 * 60 * 24))) : 0;
  
  // Phase 3: Payout Period (Payout Date)
  const payoutDaysElapsed = payout ? Math.max(0, Math.round((today - payout) / (1000 * 60 * 60 * 24))) : 0;
  
  // Total Program Duration (Start Date → Payout Date)
  const totalProgramDuration = start && payout ? Math.max(1, Math.round((payout - start) / (1000 * 60 * 60 * 24))) : 0;
  const totalDaysElapsed = start ? Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24))) : 0;
  const totalDaysLeft = payout ? Math.max(0, Math.round((payout - today) / (1000 * 60 * 60 * 24))) : 0;
  
  // Determine current phase
  const getCurrentPhase = () => {
    if (!start || !end) return 'planning';
    if (today < start) return 'upcoming';
    if (today >= start && today <= end) return 'gathering';
    if (today > end && (!payout || today < payout)) return 'processing';
    if (payout && today >= payout) return 'payout';
    return 'completed';
  };
  
  const currentPhase = getCurrentPhase();
  
  // Phase-specific metrics
  const phaseMetrics = {
    gathering: {
      progress: gatheringDaysTotal > 0 ? Math.round((gatheringDaysElapsed / gatheringDaysTotal) * 100) : 0,
      status: currentPhase === 'gathering' ? 'active' : currentPhase === 'upcoming' ? 'upcoming' : 'completed',
      daysElapsed: gatheringDaysElapsed,
      daysLeft: gatheringDaysLeft,
      daysTotal: gatheringDaysTotal
    },
    processing: {
      progress: processingDaysTotal > 0 ? Math.round((processingDaysElapsed / processingDaysTotal) * 100) : 0,
      status: currentPhase === 'processing' ? 'active' : currentPhase === 'gathering' ? 'upcoming' : 'completed',
      daysElapsed: processingDaysElapsed,
      daysLeft: processingDaysLeft,
      daysTotal: processingDaysTotal
    },
    payout: {
      progress: payout ? (payoutDaysElapsed > 0 ? 100 : 0) : 0,
      status: currentPhase === 'payout' ? 'active' : currentPhase === 'completed' ? 'completed' : 'upcoming',
      daysElapsed: payoutDaysElapsed,
      daysLeft: 0,
      daysTotal: 1
    }
  };
  
  // Enhanced completion metrics
  const completionPercentage = maxBeneficiary !== 'N/A' && !isNaN(Number(maxBeneficiary)) && Number(maxBeneficiary) > 0 
    ? Math.round((totalBeneficiaries / Number(maxBeneficiary)) * 100) 
    : 0;

  // Overall progress based on total program duration
  const timeProgress = totalProgramDuration > 0 ? Math.round((totalDaysElapsed / totalProgramDuration) * 100) : 0;
  
  // Program health score (0-100) - phase-aware
  const healthScore = calculateHealthScore({
    completionPercentage,
    timeProgress,
    paymentRate,
    daysLeft: totalDaysLeft,
    statusCounts,
    currentPhase,
    phaseMetrics
  });

  // Calculate detailed health score breakdown
  const getHealthScoreBreakdown = () => {
    const phaseWeights = {
      gathering: { completion: 40, time: 30, status: 30, payment: 0 },
      processing: { completion: 20, time: 20, status: 30, payment: 30 },
      payout: { completion: 10, time: 10, status: 20, payment: 60 },
      completed: { completion: 20, time: 20, status: 20, payment: 40 }
    };
    
    const weights = phaseWeights[currentPhase] || phaseWeights.gathering;
    
    // Calculate each score component
    let completionScore = 0;
    if (completionPercentage >= 90) completionScore = weights.completion;
    else if (completionPercentage >= 70) completionScore = weights.completion * 0.8;
    else if (completionPercentage >= 50) completionScore = weights.completion * 0.6;
    else if (completionPercentage >= 30) completionScore = weights.completion * 0.4;
    else completionScore = weights.completion * 0.2;

    let timeScore = 0;
    if (currentPhase === 'gathering') {
      const gatheringProgress = phaseMetrics.gathering.progress;
      if (gatheringProgress <= 100) {
        if (gatheringProgress <= 50) timeScore = weights.time;
        else if (gatheringProgress <= 75) timeScore = weights.time * 0.8;
        else if (gatheringProgress <= 90) timeScore = weights.time * 0.6;
        else timeScore = weights.time * 0.4;
      } else {
        timeScore = weights.time * 0.2;
      }
    } else {
      if (timeProgress <= 100) {
        if (timeProgress <= 50) timeScore = weights.time;
        else if (timeProgress <= 75) timeScore = weights.time * 0.8;
        else if (timeProgress <= 90) timeScore = weights.time * 0.6;
        else timeScore = weights.time * 0.4;
      } else {
        timeScore = weights.time * 0.2;
      }
    }

    let paymentScore = 0;
    if (paymentRate >= 80) paymentScore = weights.payment;
    else if (paymentRate >= 60) paymentScore = weights.payment * 0.8;
    else if (paymentRate >= 40) paymentScore = weights.payment * 0.6;
    else if (paymentRate >= 20) paymentScore = weights.payment * 0.4;
    else paymentScore = weights.payment * 0.2;

    const approvedCount = statusCounts['Approved'] || 0;
    const pendingCount = statusCounts['Pending'] || 0;
    const rejectedCount = statusCounts['Rejected'] || 0;
    const total = approvedCount + pendingCount + rejectedCount;
    
    let statusScore = 0;
    if (total > 0) {
      const approvalRate = (approvedCount / total) * 100;
      if (approvalRate >= 80) statusScore = weights.status;
      else if (approvalRate >= 60) statusScore = weights.status * 0.8;
      else if (approvalRate >= 40) statusScore = weights.status * 0.6;
      else statusScore = weights.status * 0.4;
    } else {
      statusScore = weights.status * 0.5;
    }

    const totalScore = completionScore + timeScore + paymentScore + statusScore;
    const finalScore = Math.min(100, Math.max(0, totalScore));

    return {
      weights,
      scores: {
        completion: { points: completionScore, max: weights.completion, percentage: completionPercentage },
        time: { points: timeScore, max: weights.time, progress: currentPhase === 'gathering' ? phaseMetrics.gathering.progress : timeProgress },
        payment: { points: paymentScore, max: weights.payment, rate: paymentRate },
        status: { points: statusScore, max: weights.status, approvalRate: total > 0 ? (approvedCount / total) * 100 : 0 }
      },
      total: { points: totalScore, final: finalScore }
    };
  };
  
  // Recent activity (last 7 days)
  const recentBeneficiaries = beneficiaries.filter(b => {
    const createdDate = new Date(b.created_at);
    const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    return createdDate >= weekAgo;
  }).length;
  
  // Efficiency metrics
  const avgProcessingTime = calculateAvgProcessingTime(beneficiaries);
  const efficiencyScore = calculateEfficiencyScore(avgProcessingTime, timeProgress, completionPercentage);

  // Helper functions for enhanced analytics
  function calculateHealthScore({ completionPercentage, timeProgress, paymentRate, daysLeft, statusCounts, currentPhase, phaseMetrics }) {
    let score = 0;
    
    // Phase-specific scoring weights
    const phaseWeights = {
      gathering: { completion: 40, time: 30, status: 30, payment: 0 },
      processing: { completion: 20, time: 20, status: 30, payment: 30 },
      payout: { completion: 10, time: 10, status: 20, payment: 60 },
      completed: { completion: 20, time: 20, status: 20, payment: 40 }
    };
    
    const weights = phaseWeights[currentPhase] || phaseWeights.gathering;
    
    // Completion score
    if (completionPercentage >= 90) score += weights.completion;
    else if (completionPercentage >= 70) score += weights.completion * 0.8;
    else if (completionPercentage >= 50) score += weights.completion * 0.6;
    else if (completionPercentage >= 30) score += weights.completion * 0.4;
    else score += weights.completion * 0.2;
    
    // Time management score (phase-aware)
    if (currentPhase === 'gathering') {
      const gatheringProgress = phaseMetrics.gathering.progress;
      if (gatheringProgress <= 100) {
        if (gatheringProgress <= 50) score += weights.time;
        else if (gatheringProgress <= 75) score += weights.time * 0.8;
        else if (gatheringProgress <= 90) score += weights.time * 0.6;
        else score += weights.time * 0.4;
      } else {
        score += weights.time * 0.2; // Overdue
      }
    } else {
      // For processing and payout phases, use overall time progress
      if (timeProgress <= 100) {
        if (timeProgress <= 50) score += weights.time;
        else if (timeProgress <= 75) score += weights.time * 0.8;
        else if (timeProgress <= 90) score += weights.time * 0.6;
        else score += weights.time * 0.4;
      } else {
        score += weights.time * 0.2;
      }
    }
    
    // Payment efficiency score (more important in later phases)
    if (paymentRate >= 80) score += weights.payment;
    else if (paymentRate >= 60) score += weights.payment * 0.8;
    else if (paymentRate >= 40) score += weights.payment * 0.6;
    else if (paymentRate >= 20) score += weights.payment * 0.4;
    else score += weights.payment * 0.2;
    
    // Status distribution score
    const approvedCount = statusCounts['Approved'] || 0;
    const pendingCount = statusCounts['Pending'] || 0;
    const rejectedCount = statusCounts['Rejected'] || 0;
    const total = approvedCount + pendingCount + rejectedCount;
    
    if (total > 0) {
      const approvalRate = (approvedCount / total) * 100;
      if (approvalRate >= 80) score += weights.status;
      else if (approvalRate >= 60) score += weights.status * 0.8;
      else if (approvalRate >= 40) score += weights.status * 0.6;
      else score += weights.status * 0.4;
    } else {
      score += weights.status * 0.5; // No data yet
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  function calculateAvgProcessingTime(beneficiaries) {
    const processedBeneficiaries = beneficiaries.filter(b => 
      b.status === 'Approved' && b.created_at && b.updated_at
    );
    
    if (processedBeneficiaries.length === 0) return 0;
    
    const totalDays = processedBeneficiaries.reduce((sum, b) => {
      const created = new Date(b.created_at);
      const updated = new Date(b.updated_at);
      return sum + Math.round((updated - created) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / processedBeneficiaries.length);
  }
  
  function calculateEfficiencyScore(avgProcessingTime, timeProgress, completionPercentage) {
    let score = 0;
    
    // Processing speed score (50% weight)
    if (avgProcessingTime <= 1) score += 50;
    else if (avgProcessingTime <= 3) score += 40;
    else if (avgProcessingTime <= 7) score += 30;
    else if (avgProcessingTime <= 14) score += 20;
    else score += 10;
    
    // Progress efficiency score (50% weight)
    const progressEfficiency = completionPercentage / Math.max(timeProgress, 1);
    if (progressEfficiency >= 1.2) score += 50;
    else if (progressEfficiency >= 1.0) score += 40;
    else if (progressEfficiency >= 0.8) score += 30;
    else if (progressEfficiency >= 0.6) score += 20;
    else score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // Generate enhanced actionable suggestions (phase-aware)
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Phase-specific suggestions
    if (currentPhase === 'gathering') {
      if (phaseMetrics.gathering.progress < 30 && phaseMetrics.gathering.daysLeft < 7) {
        suggestions.push({
          type: 'urgent',
          icon: '📢',
          title: 'Gathering Phase - Low Enrollment',
          message: `Only ${phaseMetrics.gathering.progress}% of gathering period completed with ${phaseMetrics.gathering.daysLeft} days left.`,
          action: 'Increase outreach efforts and extend gathering period if needed'
        });
      }
      
      if (completionPercentage < 50 && phaseMetrics.gathering.progress > 50) {
        suggestions.push({
          type: 'warning',
          icon: '📈',
          title: 'Gathering Phase - Enrollment Behind',
          message: `Gathering is ${phaseMetrics.gathering.progress}% complete but only ${completionPercentage}% of target reached.`,
          action: 'Boost enrollment efforts and review application process'
        });
      }
    }
    
    if (currentPhase === 'processing') {
      if (!payoutDate) {
        suggestions.push({
          type: 'info',
          icon: '📅',
          title: 'Processing Phase - Set Payout Date',
          message: 'Gathering period completed. Set a payout date to proceed with benefit distribution.',
          action: 'Edit program to set payout date and notify beneficiaries'
        });
      } else if (phaseMetrics.processing.daysLeft < 7) {
        suggestions.push({
          type: 'warning',
          icon: '⏰',
          title: 'Processing Phase - Payout Approaching',
          message: `Payout scheduled in ${phaseMetrics.processing.daysLeft} days. Prepare for distribution.`,
          action: 'Finalize beneficiary list and prepare payment materials'
        });
      }
    }
    
    if (currentPhase === 'payout') {
      if (paymentRate < 50) {
        suggestions.push({
          type: 'urgent',
          icon: '💳',
          title: 'Payout Phase - Low Payment Rate',
          message: `Only ${paymentRate}% of beneficiaries have been paid. ${pendingPaymentCount} payments pending.`,
          action: 'Accelerate payment processing and follow up on pending payments'
        });
      }
    }
    
    // Health score based suggestions
    if (healthScore < 30) {
      suggestions.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Critical Program Health',
        message: `Program health score is ${healthScore}/100. Multiple areas need immediate attention.`,
        action: 'Review all program metrics and implement comprehensive improvements'
      });
    } else if (healthScore < 60) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Program Health Concerns',
        message: `Program health score is ${healthScore}/100. Some areas need improvement.`,
        action: 'Focus on identified weak areas and optimize processes'
      });
    }
    
    // Completion rate suggestions
    if (completionPercentage < 30 && timeProgress > 50) {
      suggestions.push({
        type: 'warning',
        icon: '📉',
        title: 'Low Enrollment Rate',
        message: 'Program is more than halfway through but has less than 30% enrollment. Consider increasing outreach efforts.',
        action: 'Increase marketing and community outreach'
      });
    }
    
    if (completionPercentage > 90) {
      suggestions.push({
        type: 'success',
        icon: '🎉',
        title: 'Excellent Enrollment',
        message: 'Program has reached over 90% of its target beneficiaries.',
        action: 'Consider expanding program capacity or creating similar programs'
      });
    }

    // Payment efficiency suggestions
    if (paymentRate < 50 && pendingPaymentCount > 0) {
      suggestions.push({
        type: 'warning',
        icon: '💳',
        title: 'Low Payment Rate',
        message: `Only ${paymentRate}% of approved beneficiaries have been paid. ${pendingPaymentCount} payments pending.`,
        action: 'Accelerate payment processing and follow up on pending payments'
      });
    }

    // Time-based suggestions
    if (totalDaysLeft < 30 && completionPercentage < 80) {
      suggestions.push({
        type: 'urgent',
        icon: '⏰',
        title: 'Program Ending Soon',
        message: `Only ${totalDaysLeft} days left with ${100 - completionPercentage}% capacity remaining.`,
        action: 'Accelerate beneficiary processing and finalize remaining applications'
      });
    }

    // Efficiency suggestions
    if (efficiencyScore < 50) {
      suggestions.push({
        type: 'info',
        icon: '⚡',
        title: 'Low Efficiency Score',
        message: `Efficiency score is ${efficiencyScore}/100. Average processing time is ${avgProcessingTime} days.`,
        action: 'Streamline approval processes and reduce processing bottlenecks'
      });
    }

    // Status-based suggestions
    const pendingCount = statusCounts['Pending'] || 0;
    const processingCount = statusCounts['Processing'] || 0;
    const approvedCount = statusCounts['Approved'] || 0;
    const rejectedCount = statusCounts['Rejected'] || 0;
    
    if (pendingCount > approvedCount) {
      suggestions.push({
        type: 'info',
        icon: '📋',
        title: 'High Pending Applications',
        message: `${pendingCount} applications are pending review.`,
        action: 'Prioritize application review process and allocate more resources'
      });
    }

    if (processingCount > 0 && processingCount > approvedCount * 0.5) {
      suggestions.push({
        type: 'info',
        icon: '⚙️',
        title: 'Processing Bottleneck',
        message: `${processingCount} applications are in processing stage.`,
        action: 'Review processing workflow for efficiency improvements'
      });
    }

    // Rejection rate suggestions
    const totalProcessed = approvedCount + rejectedCount;
    if (totalProcessed > 0) {
      const rejectionRate = (rejectedCount / totalProcessed) * 100;
      if (rejectionRate > 30) {
        suggestions.push({
          type: 'warning',
          icon: '❌',
          title: 'High Rejection Rate',
          message: `${rejectionRate.toFixed(1)}% of applications are being rejected.`,
          action: 'Review application criteria and improve communication with applicants'
        });
      }
    }

    // Financial suggestions
    if (averageAmount > 0) {
      const totalBudget = Number(maxBeneficiary) * averageAmount;
      const usedBudget = totalAmount;
      const budgetUtilization = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;
      
      if (budgetUtilization > 90) {
        suggestions.push({
          type: 'warning',
          icon: '💰',
          title: 'Budget Near Limit',
          message: `${budgetUtilization}% of estimated budget has been utilized.`,
          action: 'Review budget allocation and consider additional funding'
        });
      }
      
      if (pendingAmount > 0) {
        suggestions.push({
          type: 'info',
          icon: '💸',
          title: 'Pending Payments',
          message: `₱${pendingAmount.toLocaleString()} in approved benefits awaiting payment.`,
          action: 'Process pending payments to complete beneficiary transactions'
        });
      }
    }

    // Recent activity suggestions
    if (recentBeneficiaries === 0 && totalDaysElapsed > 7) {
      suggestions.push({
        type: 'info',
        icon: '📊',
        title: 'No Recent Activity',
        message: 'No new beneficiaries added in the last 7 days.',
        action: 'Increase program visibility and outreach efforts'
      });
    }

    // Default suggestion if no specific issues
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: '🎯',
        title: 'Program Running Smoothly',
        message: 'All metrics are within normal ranges. Program is performing well.',
        action: 'Continue current operations and monitor for improvements'
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  // Announcement handlers
  const createAnnouncement = async (announcementData) => {
    try {
      const response = await axiosInstance.post('/admin/program-announcements', {
        ...announcementData,
        program_id: id,
      });

      setAnnouncements([...announcements, response.data.data]);
      setToast({ type: 'success', message: 'Announcement created successfully!' });
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create announcement' });
    }
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  const updateAnnouncement = async (announcementData) => {
    try {
      const response = await axiosInstance.put(`/admin/program-announcements/${editingAnnouncement.id}`, announcementData);

      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? response.data.data : a));
      setEditingAnnouncement(null);
      setShowAnnouncementModal(false);
      setToast({ type: 'success', message: 'Announcement updated successfully!' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to update announcement' });
    }
  };

  const publishAnnouncement = async (announcementId) => {
    try {
      const response = await axiosInstance.post(`/admin/program-announcements/${announcementId}/publish`);

      setAnnouncements(announcements.map(a => a.id === announcementId ? response.data.data : a));
      setToast({ 
        type: 'success', 
        message: 'Announcement published successfully! Residents can now see this program on their dashboard.' 
      });
    } catch (error) {
      console.error('Error publishing announcement:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to publish announcement' });
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axiosInstance.delete(`/admin/program-announcements/${announcementId}`);
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
      setToast({ type: 'success', message: 'Announcement deleted successfully!' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete announcement' });
    }
  };

  // Application form handlers
  const createForm = async (formData) => {
    try {
      const response = await axiosInstance.post('/admin/program-application-forms', {
        ...formData,
        program_id: id,
      });

      setApplicationForms([...applicationForms, response.data.data]);
      setToast({ type: 'success', message: 'Application form created successfully!' });
      setShowFormBuilderModal(false);
    } catch (error) {
      console.error('Error creating application form:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to create application form' });
    }
  };

  const editForm = (form) => {
    setEditingForm(form);
    setShowFormBuilderModal(true);
  };

  const updateForm = async (formData) => {
    try {
      const response = await axiosInstance.put(`/admin/program-application-forms/${editingForm.id}`, formData);

      setApplicationForms(applicationForms.map(f => f.id === editingForm.id ? response.data.data : f));
      setEditingForm(null);
      setShowFormBuilderModal(false);
      setToast({ type: 'success', message: 'Application form updated successfully!' });
    } catch (error) {
      console.error('Error updating application form:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to update application form' });
    }
  };

  const publishForm = async (formId) => {
    try {
      const response = await axiosInstance.post(`/admin/program-application-forms/${formId}/publish`);

      setApplicationForms(applicationForms.map(f => f.id === formId ? response.data.data : f));
      setToast({ 
        type: 'success', 
        message: 'Application form published successfully! Residents can now apply for this program.' 
      });
    } catch (error) {
      console.error('Error publishing application form:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to publish application form' });
    }
  };

  const viewSubmissions = async (formId) => {
    try {
      const response = await axiosInstance.get(`/admin/program-application-forms/${formId}/submissions`);
      setSelectedFormSubmissions(response.data.data.submissions || []);
      setSelectedForm(response.data.data.form);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error loading submissions:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to load submissions' });
    }
  };

  const deleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this application form?')) return;

    try {
      await axiosInstance.delete(`/admin/program-application-forms/${formId}`);
      setApplicationForms(applicationForms.filter(f => f.id !== formId));
      setToast({ type: 'success', message: 'Application form deleted successfully!' });
    } catch (error) {
      console.error('Error deleting application form:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete application form' });
    }
  };

  // Handle submission status updates
  const updateSubmissionStatus = async (submissionId, newStatus, adminNotes = '') => {
    try {
      const response = await axiosInstance.put(`/admin/program-application-forms/submissions/${submissionId}/status`, {
        status: newStatus,
        admin_notes: adminNotes
      });

      // Update the local state
      setSelectedFormSubmissions(prevSubmissions => 
        prevSubmissions.map(submission => 
          submission.id === submissionId 
            ? { 
                ...submission, 
                status: newStatus,
                admin_notes: adminNotes,
                reviewed_at: new Date().toISOString(),
                reviewer: { name: 'Current Admin' } // You might want to get this from auth context
              }
            : submission
        )
      );

      setToast({ 
        type: 'success', 
        message: `Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!` 
      });
    } catch (error) {
      console.error('Error updating submission status:', error);
      setToast({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update application status' 
      });
    }
  };

  // Handle approve action
  const handleApprove = async (submission) => {
    if (window.confirm(`Are you sure you want to approve ${submission.resident.name}'s application?`)) {
      await updateSubmissionStatus(submission.id, 'approved');
    }
  };

  // Handle reject action - show modal for reason
  const handleReject = (submission) => {
    setSelectedSubmissionForReject(submission);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Handle reject confirmation
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setToast({ type: 'error', message: 'Please provide a reason for rejection.' });
      return;
    }

    await updateSubmissionStatus(selectedSubmissionForReject.id, 'rejected', rejectReason);
    setShowRejectModal(false);
    setSelectedSubmissionForReject(null);
    setRejectReason('');
  };

  // Handle paid action
  const handlePaid = async (beneficiary) => {
    try {
      // Ensure CSRF token is set
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

      console.log('Marking beneficiary as paid:', beneficiary.id);

      // Call the paid endpoint
      const response = await axiosInstance.post(`/admin/beneficiaries/${beneficiary.id}/mark-paid`);

      console.log('Paid response:', response?.data);

      // Update local state
      setPaidBeneficiaries(prev => new Set([...prev, beneficiary.id]));
      
      // Store receipt data
      if (response.data.receipt) {
        setReceiptData(prev => ({
          ...prev,
          [beneficiary.id]: response.data.receipt
        }));
      }

      setToast({
        type: 'success',
        message: response.data.message || 'Beneficiary marked as paid successfully'
      });

    } catch (err) {
      console.error('Failed to mark beneficiary as paid:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to mark beneficiary as paid'
      });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  // Handle receipt download
  const handleDownloadReceipt = async (beneficiary) => {
    try {
      const response = await axiosInstance.get(`/admin/beneficiaries/${beneficiary.id}/download-receipt`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${beneficiary.receipt_number || 'receipt'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Failed to download receipt:', err);
      setToast({
        type: 'error',
        message: 'Failed to download receipt'
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-5xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="text-green-700 hover:underline mb-4">
          &larr; Back to Programs
        </button>

        {/* Comprehensive Analytics Section with Hide/Show Button */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-300 p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-bold text-2xl text-emerald-700">Program Analytics</span>
            </div>
            <button
              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-semibold text-sm shadow transition-all duration-200"
              onClick={() => setShowAnalytics(v => !v)}
            >
              {showAnalytics ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showAnalytics && (
            <div className="space-y-6">
              {/* Program Health Score */}
              <div 
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-6 cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setShowHealthScoreBreakdown(true)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-indigo-800">Program Health Score</h3>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      healthScore >= 80 ? 'bg-green-100 text-green-800' :
                      healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      healthScore >= 40 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {healthScore >= 80 ? 'Excellent' :
                       healthScore >= 60 ? 'Good' :
                       healthScore >= 40 ? 'Fair' : 'Poor'}
                    </div>
                    <span className="text-indigo-600 text-sm">Click to see breakdown</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          healthScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">{healthScore}/100</div>
                </div>
              </div>

              {/* Program Phase Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-800">Program Phase Overview</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    currentPhase === 'gathering' ? 'bg-green-100 text-green-800' :
                    currentPhase === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    currentPhase === 'payout' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentPhase === 'gathering' ? 'Gathering Phase' :
                     currentPhase === 'processing' ? 'Processing Phase' :
                     currentPhase === 'payout' ? 'Payout Phase' :
                     'Planning Phase'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Phase 1: Gathering */}
                  <div className={`p-4 rounded-lg border-2 ${
                    currentPhase === 'gathering' ? 'border-green-300 bg-green-50' :
                    phaseMetrics.gathering.status === 'completed' ? 'border-green-200 bg-green-25' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Phase 1: Gathering</h4>
                      <span className="text-lg">📝</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {startDate && endDate ? 
                        `${cropDate(startDate)} to ${cropDate(endDate)}` : 
                        'Not set'
                      }
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          phaseMetrics.gathering.status === 'completed' ? 'bg-green-500' :
                          currentPhase === 'gathering' ? 'bg-green-400' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${Math.min(100, phaseMetrics.gathering.progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{phaseMetrics.gathering.daysElapsed} days elapsed</span>
                      <span>{phaseMetrics.gathering.daysLeft} days left</span>
                    </div>
                  </div>

                  {/* Phase 2: Processing */}
                  <div className={`p-4 rounded-lg border-2 ${
                    currentPhase === 'processing' ? 'border-yellow-300 bg-yellow-50' :
                    phaseMetrics.processing.status === 'completed' ? 'border-yellow-200 bg-yellow-25' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Phase 2: Processing</h4>
                      <span className="text-lg">⚙️</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {endDate && payoutDate ? 
                        `${cropDate(endDate)} to ${cropDate(payoutDate)}` : 
                        payoutDate ? `Until ${cropDate(payoutDate)}` : 'Not set'
                      }
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          phaseMetrics.processing.status === 'completed' ? 'bg-yellow-500' :
                          currentPhase === 'processing' ? 'bg-yellow-400' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${Math.min(100, phaseMetrics.processing.progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{phaseMetrics.processing.daysElapsed} days elapsed</span>
                      <span>{phaseMetrics.processing.daysLeft} days left</span>
                    </div>
                  </div>

                  {/* Phase 3: Payout */}
                  <div className={`p-4 rounded-lg border-2 ${
                    currentPhase === 'payout' ? 'border-blue-300 bg-blue-50' :
                    phaseMetrics.payout.status === 'completed' ? 'border-blue-200 bg-blue-25' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">Phase 3: Payout</h4>
                      <span className="text-lg">💰</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {payoutDate ? 
                        `Starting ${cropDate(payoutDate)}` : 
                        'Not scheduled'
                      }
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          phaseMetrics.payout.status === 'completed' ? 'bg-blue-500' :
                          currentPhase === 'payout' ? 'bg-blue-400' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${Math.min(100, phaseMetrics.payout.progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{phaseMetrics.payout.daysElapsed} days elapsed</span>
                      <span>{phaseMetrics.payout.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-700">{completionPercentage}%</p>
                      <p className="text-xs text-green-500 mt-1">{totalBeneficiaries}/{maxBeneficiary} beneficiaries</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">📊</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, completionPercentage)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Overall Progress</p>
                      <p className="text-2xl font-bold text-blue-700">{timeProgress}%</p>
                      <p className="text-xs text-blue-500 mt-1">{totalDaysElapsed}/{totalProgramDuration} days</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">⏱️</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, timeProgress)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Payment Rate</p>
                      <p className="text-2xl font-bold text-purple-700">{paymentRate}%</p>
                      <p className="text-xs text-purple-500 mt-1">{paidBeneficiariesCount} paid</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">💳</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, paymentRate)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Efficiency Score</p>
                      <p className="text-2xl font-bold text-orange-700">{efficiencyScore}/100</p>
                      <p className="text-xs text-orange-500 mt-1">{avgProcessingTime} days avg</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-lg">⚡</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, efficiencyScore)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Total Budget</p>
                      <p className="text-xl font-bold text-emerald-700">₱{totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-bold">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Paid Amount</p>
                      <p className="text-xl font-bold text-blue-700">₱{paidAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Pending Amount</p>
                      <p className="text-xl font-bold text-yellow-700">₱{pendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-bold">⏳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline and Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-indigo-800">Program Timeline</h4>
                    <span className="text-indigo-600 text-lg">📅</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Days Elapsed</span>
                      <span className="font-semibold text-indigo-800">{totalDaysElapsed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Days Remaining</span>
                      <span className="font-semibold text-indigo-800">{totalDaysLeft}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Total Duration</span>
                      <span className="font-semibold text-indigo-800">{totalProgramDuration}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-pink-800">Recent Activity</h4>
                    <span className="text-pink-600 text-lg">📈</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-pink-600">New This Week</span>
                      <span className="font-semibold text-pink-800">{recentBeneficiaries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-pink-600">Avg Processing</span>
                      <span className="font-semibold text-pink-800">{avgProcessingTime} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-pink-600">Efficiency</span>
                      <span className="font-semibold text-pink-800">{efficiencyScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Actionable Suggestions
                </h3>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Program Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-green-100 p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-700">{totalBeneficiaries}</div>
            <div className="text-gray-600 text-sm mt-1">Total Beneficiaries</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-blue-700">{maxBeneficiary}</div>
            <div className="text-gray-600 text-sm mt-1">Maximum Beneficiaries Allowed</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-6 flex flex-col items-center justify-center">
            <div className="text-lg font-semibold text-indigo-700">{programStatus}</div>
            <div className="text-gray-600 text-sm mt-1">Program Status</div>
          </div>
        </div>
        {/* Beneficiary Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="font-bold text-lg text-gray-700 mb-2">Beneficiary Status Breakdown</div>
          <div className="flex flex-wrap gap-4">
            {statusLabels.length === 0 ? (
              <div className="text-gray-400">No beneficiaries yet.</div>
            ) : (
              statusLabels.map(label => (
                <div key={label} className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                  <span className="text-xl font-bold text-green-700">{statusCounts[label]}</span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Program Details Card */}
        <div className="rounded-2xl shadow-xl border-2 border-green-500 bg-white p-8">
          <h2 className="text-3xl font-bold text-green-700 mb-2">{program.name}</h2>
          <p className="text-gray-600 mb-2">{program.description}</p>
          <div className="text-xs text-gray-500 mb-4">
            {cropDate(program.start_date || program.startDate)} - {cropDate(program.end_date || program.endDate)}
          </div>
          <button
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-xl shadow-lg text-sm font-semibold transition-all duration-300 mt-2"
            onClick={() => setShowModal(true)}
          >
            + Add Beneficiary
          </button>
        </div>

        {/* Announcements Management */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">Program Announcements</h3>
              <button
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                onClick={() => setShowAnnouncementModal(true)}
              >
                + Create Announcement
              </button>
            </div>
          </div>
          <div className="p-6">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No announcements created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                    announcement.is_urgent ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                          {announcement.is_urgent && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              URGENT
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            announcement.status === 'published' ? 'bg-green-100 text-green-800' :
                            announcement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                        <div className="text-xs text-gray-500">
                          Published: {announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : 'Not published'}
                          {announcement.expires_at && (
                            <span> • Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                          onClick={() => editAnnouncement(announcement)}
                        >
                          Edit
                        </button>
                        {announcement.status === 'draft' && (
                          <button
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                            onClick={() => publishAnnouncement(announcement.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Application Forms Management */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">Application Forms</h3>
              <button
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                onClick={() => setShowFormBuilderModal(true)}
              >
                + Create Form
              </button>
            </div>
          </div>
          <div className="p-6">
            {applicationForms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No application forms created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applicationForms.map((form) => (
                  <div key={form.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{form.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            form.status === 'published' ? 'bg-green-100 text-green-800' :
                            form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {form.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{form.description}</p>
                        <div className="text-xs text-gray-500">
                          Fields: {form.fields?.length || 0} • 
                          Submissions: {form.submissions?.length || 0} • 
                          Published: {form.published_at ? new Date(form.published_at).toLocaleDateString() : 'Not published'}
                          {form.deadline && (
                            <span> • Deadline: {new Date(form.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                          onClick={() => editForm(form)}
                        >
                          Edit
                        </button>
                        {form.status === 'draft' && (
                          <button
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                            onClick={() => publishForm(form.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                          onClick={() => viewSubmissions(form.id)}
                        >
                          View Submissions
                        </button>
                        <button
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                          onClick={() => deleteForm(form.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Beneficiaries Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h3 className="text-white font-semibold text-lg">Beneficiaries</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Control #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Assistance</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No beneficiaries for this program.
                  </td>
                </tr>
              ) : (
                // Sort beneficiaries by ID for FIFO order
                beneficiaries
                  .sort((a, b) => a.id - b.id)
                  .map((beneficiary, index) => (
                  <tr key={beneficiary.id} className="hover:bg-green-50 transition-all duration-200 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="text-xs text-gray-500">ID: {beneficiary.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{beneficiary.name}</td>
                    <td className="px-4 py-3">{beneficiary.beneficiary_type || beneficiary.beneficiaryType}</td>
                    <td className="px-4 py-3">{beneficiary.assistance_type || beneficiary.assistanceType}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          beneficiary.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          beneficiary.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          beneficiary.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {beneficiary.status}
                        </span>
                        {paidBeneficiaries.has(beneficiary.id) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Paid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-green-700 font-semibold">
                      ₱ {beneficiary.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {/* Admin Controls */}
                      <div className="flex flex-col gap-2">
                        {/* Paid Action */}
                        <div className="flex gap-2">
                          {paidBeneficiaries.has(beneficiary.id) ? (
                            <div className="flex flex-col gap-1">
                          <button
                                className="px-3 py-1 rounded-full text-sm font-semibold transition bg-emerald-100 text-emerald-700 cursor-default"
                                disabled
                                title="Already marked as paid"
                              >
                                ✓ Paid
                          </button>
                              <button
                                className="px-3 py-1 rounded-full text-sm font-semibold transition bg-blue-100 text-blue-700 hover:bg-blue-200"
                                onClick={() => handleDownloadReceipt(beneficiary)}
                                title="Download receipt"
                              >
                                📄 Receipt
                              </button>
                            </div>
                        ) : (
                          <button
                            className="px-3 py-1 rounded-full text-sm font-semibold transition bg-green-100 text-green-700 hover:bg-green-200"
                              onClick={() => handlePaid(beneficiary)}
                              title="Mark as paid"
                          >
                              Mark Paid
                          </button>
                        )}
                        </div>
                        
                        
                        {/* Visibility Toggle */}
                        <div className="flex gap-2">
                          {beneficiary.visible_to_resident ? (
                            <button
                              className="px-3 py-1 rounded-full text-sm font-semibold transition bg-orange-100 text-orange-700 hover:bg-orange-200"
                              onClick={() => toggleVisibility(beneficiary, false)}
                              title="Hide this program from resident's My Benefits"
                            >
                              Hide from Resident
                            </button>
                          ) : (
                            <button
                              className="px-3 py-1 rounded-full text-sm font-semibold transition bg-blue-100 text-blue-700 hover:bg-blue-200"
                              onClick={() => toggleVisibility(beneficiary, true)}
                              title="Show this program in resident's My Benefits"
                            >
                              Show to Resident
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Beneficiary Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    + Add Beneficiary
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    X
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormError('');
                    setFormSuccess('');
                    setFormLoading(true);
                    try {
                      const response = await axiosInstance.post('/admin/beneficiaries', {
                        name: form.name,
                        beneficiary_type: form.beneficiaryType,
                        assistance_type: form.assistanceType,
                        status: form.status,
                        amount: form.amount,
                        contact_number: form.contactNumber,
                        email: form.email,
                        full_address: form.fullAddress,
                        remarks: form.remarks,
                        program_id: program.id,
                      });

                      setFormSuccess('Beneficiary added successfully!');
                      setShowModal(false);
                      setForm({
                        name: '',
                        beneficiaryType: '',
                        assistanceType: '',
                        status: '',
                        amount: '',
                        contactNumber: '',
                        email: '',
                        fullAddress: '',
                        remarks: '',
                      });
                      const updatedBeneficiaries = await fetchBeneficiaries(id);
                      setBeneficiaries(updatedBeneficiaries);
                    } catch (err) {
                      setFormError('Failed to add beneficiary. ' + (err?.response?.data?.message || err?.message || ''));
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                >
                  <div>
                    {/* Qualified Residents Info */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="text-sm font-bold text-green-800">Qualified Residents Only</h4>
                      </div>
                      <p className="text-xs text-green-700 mb-2">
                        Only residents who have <strong>approved submissions for ALL published forms</strong> of this program are shown below.
                      </p>
                      {qualifiedResidentsLoading ? (
                        <div className="text-xs text-green-600">Loading qualified residents...</div>
                      ) : (
                        <div className="text-xs text-green-600">
                          Found {qualifiedResidents.length} qualified resident{qualifiedResidents.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Qualified Resident</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                      value={form.selectedResidentId || ''}
                      disabled={qualifiedResidentsLoading}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          setForm(f => ({
                            ...f,
                            selectedResidentId: '',
                            name: '',
                            contactNumber: '',
                            email: '',
                            fullAddress: '',
                          }));
                        } else {
                          const selected = qualifiedResidents.find(r => String(r.id) === val);
                          setForm(f => ({
                            ...f,
                            selectedResidentId: val,
                            name: selected ? `${selected.first_name} ${selected.last_name}` : '',
                            contactNumber: selected && (selected.mobile_number || selected.contact_number || selected.contactNumber) ? String(selected.mobile_number || selected.contact_number || selected.contactNumber) : '',
                            email: selected && (selected.email || selected.email_address) ? String(selected.email || selected.email_address) : '',
                            fullAddress: selected && (selected.current_address || selected.full_address || selected.address) ? String(selected.current_address || selected.full_address || selected.address) : '',
                          }));
                        }
                      }}
                    >
                      <option value="">
                        {qualifiedResidentsLoading ? 'Loading qualified residents...' : 'Select Qualified Resident'}
                      </option>
                      {qualifiedResidents.map(r => (
                        <option key={r.id} value={r.id}>
                          {`${r.first_name} ${r.last_name}`} (ID: {r.resident_id})
                        </option>
                      ))}
                    </select>
                    
                    {qualifiedResidents.length === 0 && !qualifiedResidentsLoading && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-yellow-800 font-medium">No Qualified Residents</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          No residents have approved submissions for all published forms of this program yet.
                        </p>
                        
                        {qualificationDebugInfo && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                            <div className="font-medium text-blue-800 mb-1">Debug Information:</div>
                            <div className="text-blue-700">
                              <div>Published Forms Required: {qualificationDebugInfo.published_forms?.length || 0}</div>
                              {qualificationDebugInfo.published_forms?.map((form, index) => (
                                <div key={index} className="ml-2">• {form.title} (ID: {form.id})</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Beneficiary Type</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-100"
                        required
                        value={form.beneficiaryType}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Assistance Type</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-100"
                        required
                        value={form.assistanceType}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-100"
                        required
                        value={form.amount}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        value={form.contactNumber}
                        onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        value={form.fullAddress}
                        onChange={(e) => setForm((f) => ({ ...f, fullAddress: e.target.value }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        value={form.remarks}
                        onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                      />
                    </div>
                  </div>
                  {formError && <div className="text-red-600 text-center mt-2">{formError}</div>}
                  {formSuccess && <div className="text-green-600 text-center mt-2">{formSuccess}</div>}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-60"
                    >
                      {formLoading ? 'Saving...' : 'Save Beneficiary'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
                <h3 className="text-white font-semibold text-lg">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = {
                    title: formData.get('title'),
                    content: formData.get('content'),
                    status: formData.get('status'),
                    is_urgent: formData.get('is_urgent') === 'on',
                    expires_at: formData.get('expires_at') || null,
                    target_audience: formData.get('target_audience') ? formData.get('target_audience').split(',') : ['all']
                  };
                  
                  if (editingAnnouncement) {
                    updateAnnouncement(data);
                  } else {
                    createAnnouncement(data);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        defaultValue={editingAnnouncement?.title || ''}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                      <textarea
                        name="content"
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        required
                        defaultValue={editingAnnouncement?.content || ''}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                          name="status"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                          defaultValue={editingAnnouncement?.status || 'draft'}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At</label>
                        <input
                          type="datetime-local"
                          name="expires_at"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                          defaultValue={editingAnnouncement?.expires_at ? new Date(editingAnnouncement.expires_at).toISOString().slice(0, 16) : ''}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_urgent"
                          className="mr-2"
                          defaultChecked={editingAnnouncement?.is_urgent || false}
                        />
                        <span className="text-sm font-semibold text-gray-700">Mark as Urgent</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience (comma-separated)</label>
                      <input
                        type="text"
                        name="target_audience"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                        placeholder="all, specific_beneficiaries, pending_applicants"
                        defaultValue={editingAnnouncement?.target_audience?.join(', ') || 'all'}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnnouncementModal(false);
                        setEditingAnnouncement(null);
                      }}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300"
                    >
                      {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Form Builder Modal */}
        {showFormBuilderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
                <h3 className="text-white font-semibold text-lg">
                  {editingForm ? 'Edit Application Form' : 'Create Application Form'}
                </h3>
              </div>
              <div className="p-6">
                <FormBuilder
                  form={editingForm}
                  onSave={(formData) => {
                    if (editingForm) {
                      updateForm(formData);
                    } else {
                      createForm(formData);
                    }
                  }}
                  onCancel={() => {
                    setShowFormBuilderModal(false);
                    setEditingForm(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submissions Modal */}
        {showSubmissionsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold text-lg">
                    Form Submissions - {selectedForm?.title || 'Application Form'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowSubmissionsModal(false);
                      setSelectedFormSubmissions([]);
                      setSelectedForm(null);
                      setSubmissionFilter('all');
                      setExpandedSubmission(null);
                    }}
                    className="text-white hover:text-purple-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                {selectedFormSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📭</span>
                </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-500">No applications have been submitted for this form yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Filter Controls */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSubmissionFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            submissionFilter === 'all' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All ({selectedFormSubmissions.length})
                        </button>
                        <button
                          onClick={() => setSubmissionFilter('pending')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            submissionFilter === 'pending' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Pending ({selectedFormSubmissions.filter(s => s.status === 'pending').length})
                        </button>
                        <button
                          onClick={() => setSubmissionFilter('approved')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            submissionFilter === 'approved' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Approved ({selectedFormSubmissions.filter(s => s.status === 'approved').length})
                        </button>
                        <button
                          onClick={() => setSubmissionFilter('rejected')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            submissionFilter === 'rejected' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Rejected ({selectedFormSubmissions.filter(s => s.status === 'rejected').length})
                        </button>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-lg">📊</span>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Total Submissions</p>
                            <p className="text-2xl font-bold text-blue-800">{selectedFormSubmissions.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 text-lg">⏳</span>
                          </div>
                          <div>
                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-800">
                              {selectedFormSubmissions.filter(s => s.status === 'pending').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-lg">✅</span>
                          </div>
                          <div>
                            <p className="text-sm text-green-600 font-medium">Approved</p>
                            <p className="text-2xl font-bold text-green-800">
                              {selectedFormSubmissions.filter(s => s.status === 'approved').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 text-lg">❌</span>
                          </div>
                          <div>
                            <p className="text-sm text-red-600 font-medium">Rejected</p>
                            <p className="text-2xl font-bold text-red-800">
                              {selectedFormSubmissions.filter(s => s.status === 'rejected').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-4">
                      {selectedFormSubmissions
                        .filter(submission => submissionFilter === 'all' || submission.status === submissionFilter)
                        .map((submission, index) => {
                          const isExpanded = expandedSubmission === submission.id;
                          return (
                            <div key={submission.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                              {/* Compact Card Header - Always Visible */}
                              <div 
                                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                onClick={() => setExpandedSubmission(isExpanded ? null : submission.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                          {submission.resident.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold text-gray-800">{submission.resident.name}</h4>
                                        <p className="text-sm text-gray-600">Resident ID: {submission.resident.resident_id}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                        <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                        <span>Email: {submission.resident.email}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        <span>Contact: {submission.resident.contact_number || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      submission.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {submission.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <div className="text-gray-400">
                                      {isExpanded ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                      ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content - Only Visible When Clicked */}
                              {isExpanded && (
                                <div className="border-t border-gray-100 px-6 pb-6">
                                  <div className="pt-4">
                                    <h5 className="text-sm font-bold text-gray-700 mb-3">Application Details:</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(submission.submission_data).map(([fieldName, fieldData]) => (
                                        <div key={fieldName} className="space-y-1">
                                          <label className="text-sm font-medium text-gray-600">{fieldData.label}:</label>
                                          <div className="text-sm text-gray-800">
                                            {fieldData.is_file ? (
                                              <div className="flex items-center gap-2">
                                                <span className="text-blue-600">📎</span>
                                                <a 
                                                  href={fieldData.file_url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:text-blue-800 underline"
                                                >
                                                  {fieldData.file_original_name}
                                                </a>
                                                <span className="text-gray-500 text-xs">
                                                  ({(fieldData.file_size / 1024).toFixed(1)} KB)
                                                </span>
                                              </div>
                                            ) : fieldData.type === 'checkbox' ? (
                                              <div className="flex flex-wrap gap-1">
                                                {Array.isArray(fieldData.value) ? fieldData.value.map((item, idx) => (
                                                  <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                    {item}
                                                  </span>
                                                )) : (
                                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                                    {fieldData.value}
                                                  </span>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="bg-gray-50 p-2 rounded border">
                                                {fieldData.value || 'No response'}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Admin Notes */}
                                  {submission.admin_notes && (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                      <h5 className="text-sm font-bold text-gray-700 mb-2">Admin Notes:</h5>
                                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                        <p className="text-sm text-gray-700">{submission.admin_notes}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Admin Actions */}
                                  {submission.status === 'pending' && (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                      <h5 className="text-sm font-bold text-gray-700 mb-3">Admin Actions:</h5>
                                      <div className="flex gap-3">
                                        <button
                                          onClick={() => handleApprove(submission)}
                                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Approve Application
                                        </button>
                                        <button
                                          onClick={() => handleReject(submission)}
                                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          Reject Application
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Review Info */}
                                  {submission.reviewed_at && (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Reviewed: {new Date(submission.reviewed_at).toLocaleDateString()}</span>
                                        {submission.reviewer && (
                                          <span>By: {submission.reviewer.name}</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmissionsModal(false);
                      setSelectedFormSubmissions([]);
                      setSelectedForm(null);
                      setSubmissionFilter('all');
                      setExpandedSubmission(null);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Rejection Modal */}
        {showRejectModal && selectedSubmissionForReject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 rounded-t-2xl">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Reject Application
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    You are about to reject <strong>{selectedSubmissionForReject.resident.name}</strong>'s application.
                  </p>
                  <p className="text-sm text-gray-600">
                    Please provide a reason for rejection. This will be visible to the applicant.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none"
                    rows="4"
                    placeholder="Please provide a detailed reason for rejecting this application..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {rejectReason.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedSubmissionForReject(null);
                      setRejectReason('');
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed right-6 bottom-6 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            <div className="font-semibold">{toast.type === 'success' ? 'Success' : 'Error'}</div>
            <div className="text-sm">{toast.message}</div>
          </div>
        )}
        </div>
      </main>

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

              {(() => {
                const breakdown = getHealthScoreBreakdown();
                const phaseNames = {
                  gathering: 'Gathering Phase',
                  processing: 'Processing Phase', 
                  payout: 'Payout Phase',
                  completed: 'Completed Phase'
                };

                return (
                  <div className="space-y-6">
                    {/* Current Phase Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Phase: {phaseNames[currentPhase] || 'Unknown'}</h3>
                      <p className="text-blue-600 text-sm">
                        Different phases have different scoring weights based on what's most important at that stage.
                      </p>
                    </div>

                    {/* Scoring Weights */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Scoring Weights for {phaseNames[currentPhase]}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{breakdown.weights.completion}%</div>
                          <div className="text-sm text-gray-600">Completion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{breakdown.weights.time}%</div>
                          <div className="text-sm text-gray-600">Time Management</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{breakdown.weights.payment}%</div>
                          <div className="text-sm text-gray-600">Payment Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{breakdown.weights.status}%</div>
                          <div className="text-sm text-gray-600">Status Quality</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Scores */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Detailed Score Calculation</h3>
                      
                      {/* Completion Score */}
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-700">Completion Score</h4>
                          <span className="text-lg font-bold text-green-600">
                            {breakdown.scores.completion.points.toFixed(1)}/{breakdown.scores.completion.max}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Enrollment: {breakdown.scores.completion.percentage}% ({totalBeneficiaries}/{maxBeneficiary} beneficiaries)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(breakdown.scores.completion.points / breakdown.scores.completion.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Score */}
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-700">Time Management Score</h4>
                          <span className="text-lg font-bold text-blue-600">
                            {breakdown.scores.time.points.toFixed(1)}/{breakdown.scores.time.max}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Progress: {breakdown.scores.time.progress.toFixed(1)}% 
                          {currentPhase === 'gathering' ? ' (Gathering Phase)' : ' (Overall Program)'}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(breakdown.scores.time.points / breakdown.scores.time.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Payment Score */}
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-purple-700">Payment Efficiency Score</h4>
                          <span className="text-lg font-bold text-purple-600">
                            {breakdown.scores.payment.points.toFixed(1)}/{breakdown.scores.payment.max}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Payment Rate: {breakdown.scores.payment.rate}% ({paidBeneficiariesCount} paid)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(breakdown.scores.payment.points / breakdown.scores.payment.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Status Score */}
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-orange-700">Status Quality Score</h4>
                          <span className="text-lg font-bold text-orange-600">
                            {breakdown.scores.status.points.toFixed(1)}/{breakdown.scores.status.max}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Approval Rate: {breakdown.scores.status.approvalRate.toFixed(1)}% 
                          ({statusCounts['Approved'] || 0} approved, {statusCounts['Pending'] || 0} pending, {statusCounts['Rejected'] || 0} rejected)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(breakdown.scores.status.points / breakdown.scores.status.max) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-indigo-800">Total Health Score</h3>
                        <div className="text-3xl font-bold text-indigo-700">
                          {breakdown.total.final}/100
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-1000 ${
                            breakdown.total.final >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            breakdown.total.final >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            breakdown.total.final >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                            'bg-gradient-to-r from-red-500 to-red-600'
                          }`}
                          style={{ width: `${breakdown.total.final}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-indigo-600">
                        Raw Score: {breakdown.total.points.toFixed(1)} points (capped at 100)
                      </div>
                    </div>

                    {/* Improvement Tips */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 How to Improve Your Score</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {breakdown.scores.completion.points < breakdown.scores.completion.max * 0.8 && (
                          <li>• Increase enrollment to reach target beneficiaries</li>
                        )}
                        {breakdown.scores.time.points < breakdown.scores.time.max * 0.8 && (
                          <li>• Stay on schedule or improve time management</li>
                        )}
                        {breakdown.scores.payment.points < breakdown.scores.payment.max * 0.8 && (
                          <li>• Process more payments to improve payment rate</li>
                        )}
                        {breakdown.scores.status.points < breakdown.scores.status.max * 0.8 && (
                          <li>• Review and approve pending applications</li>
                        )}
                        {breakdown.scores.completion.points >= breakdown.scores.completion.max * 0.8 && 
                         breakdown.scores.time.points >= breakdown.scores.time.max * 0.8 && 
                         breakdown.scores.payment.points >= breakdown.scores.payment.max * 0.8 && 
                         breakdown.scores.status.points >= breakdown.scores.status.max * 0.8 && (
                          <li>• Great job! All metrics are performing well</li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProgramDetails;
