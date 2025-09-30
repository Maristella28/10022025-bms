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
    const res = await axiosInstance.get('/beneficiaries');
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

  // Toggle handler with toast feedback
  const toggleMyBenefits = async (beneficiary, enabled) => {
    const original = beneficiaries.slice();

    try {
      // Ensure CSRF token is set
      await fetch('/sanctum/csrf-cookie', { credentials: 'include' });

      console.log('Attempting to update My Benefits status:', { 
        beneficiary_id: beneficiary.id,
        enabled: enabled 
      });

      // Call the toggle endpoint
      const response = await axiosInstance.post(`/beneficiaries/${beneficiary.id}/toggle-benefits`, {
        enabled: enabled
      });

      console.log('Benefits update response:', response?.data);

      // Verify the response indicates success
      if (response?.data?.enabled !== enabled) {
        throw new Error('Server returned unexpected enabled state');
      }

      // Update local state if successful
      setBeneficiaries(prevBeneficiaries => 
        prevBeneficiaries.map(b => 
          b.id === beneficiary.id 
            ? { ...b, my_benefits_enabled: enabled }
            : b
        )
      );

      // Wait a short moment for backend updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to refresh profile using available endpoint
      try {
        const refreshSuccess = await refreshProfile();
        if (!refreshSuccess) {
          console.warn('Failed to refresh profile after benefits update');
        }
      } catch (profileErr) {
        console.warn('Error during profile refresh:', profileErr);
      }

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: {
          type: 'benefits-update',
          beneficiaryId: beneficiary.id,
          enabled: enabled,
          timestamp: new Date().toISOString(),
          message: `Benefits ${enabled ? 'enabled' : 'disabled'} for beneficiary ${beneficiary.name}`
        }
      }));

      // Also dispatch a more general profile refresh event
      window.dispatchEvent(new CustomEvent('profile-refresh-requested', {
        detail: {
          reason: 'benefits-toggled',
          beneficiaryId: beneficiary.id,
          enabled: enabled
        }
      }));

      setToast({
        type: 'success',
        message: response.data.message || 'Benefits status updated successfully'
      });

    } catch (err) {
      console.error('Failed to update benefits status:', err);
      setBeneficiaries(original); // Restore original state
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update benefits status'
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

  // --- Program-specific analytics (after beneficiaries is initialized) ---
  const totalBeneficiaries = beneficiaries.length;
  // Support both snake_case and camelCase for program fields
  const maxBeneficiary = program?.max_beneficiaries ?? program?.maxBeneficiaries ?? 'N/A';
  const programStatus = program?.status ?? 'N/A';
  const statusCounts = beneficiaries.reduce((acc, b) => {
    const status = b.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const statusLabels = Object.keys(statusCounts);

  // --- Comprehensive Analytics ---
  const startDate = program?.start_date || program?.startDate || '';
  const endDate = program?.end_date || program?.endDate || '';
  
  function cropDate(dateStr) {
    if (!dateStr) return '';
    // Accepts both '2025-08-18T00:00:00.000000Z' and '2025-08-18'
    return dateStr.split('T')[0];
  }

  // Calculate program metrics
  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const daysElapsed = start ? Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24))) : 0;
  const daysLeft = end ? Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24))) : 0;
  const daysTotal = start && end ? Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))) : 0;
  
  // Calculate completion percentage
  const completionPercentage = maxBeneficiary !== 'N/A' && !isNaN(Number(maxBeneficiary)) && Number(maxBeneficiary) > 0 
    ? Math.round((totalBeneficiaries / Number(maxBeneficiary)) * 100) 
    : 0;

  // Calculate time progress
  const timeProgress = daysTotal > 0 ? Math.round((daysElapsed / daysTotal) * 100) : 0;

  // Calculate average amount
  const totalAmount = beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const averageAmount = totalBeneficiaries > 0 ? Math.round(totalAmount / totalBeneficiaries) : 0;

  // Generate actionable suggestions
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Completion rate suggestions
    if (completionPercentage < 30 && timeProgress > 50) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Enrollment Rate',
        message: 'Program is more than halfway through but has less than 30% enrollment. Consider increasing outreach efforts.',
        action: 'Increase marketing and community outreach'
      });
    }
    
    if (completionPercentage > 90) {
      suggestions.push({
        type: 'success',
        icon: '✅',
        title: 'Excellent Enrollment',
        message: 'Program has reached over 90% of its target beneficiaries.',
        action: 'Consider expanding program capacity or creating similar programs'
      });
    }

    // Time-based suggestions
    if (daysLeft < 30 && completionPercentage < 80) {
      suggestions.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Program Ending Soon',
        message: `Only ${daysLeft} days left with ${100 - completionPercentage}% capacity remaining.`,
        action: 'Accelerate beneficiary processing and finalize remaining applications'
      });
    }

    // Status-based suggestions
    const pendingCount = statusCounts['Pending'] || 0;
    const processingCount = statusCounts['Processing'] || 0;
    const approvedCount = statusCounts['Approved'] || 0;
    
    if (pendingCount > approvedCount) {
      suggestions.push({
        type: 'info',
        icon: '📋',
        title: 'High Pending Applications',
        message: `${pendingCount} applications are pending review.`,
        action: 'Prioritize application review process'
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
    }

    // Default suggestion if no specific issues
    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        icon: '🎯',
        title: 'Program Running Smoothly',
        message: 'All metrics are within normal ranges.',
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
      const response = await axiosInstance.get(`/admin/program-application-forms/${formId}`);
      setSelectedFormSubmissions(response.data.data.submissions || []);
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
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-700">{completionPercentage}%</p>
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
                      <p className="text-sm text-blue-600 font-medium">Time Progress</p>
                      <p className="text-2xl font-bold text-blue-700">{timeProgress}%</p>
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
                      <p className="text-sm text-purple-600 font-medium">Days Remaining</p>
                      <p className="text-2xl font-bold text-purple-700">{daysLeft}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">📅</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-500 mt-1">
                    {daysLeft > 0 ? `${daysElapsed} days elapsed` : 'Program ended'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Avg. Amount</p>
                      <p className="text-2xl font-bold text-orange-700">₱{averageAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-lg">💰</span>
                    </div>
                  </div>
                  <p className="text-xs text-orange-500 mt-1">
                    Total: ₱{totalAmount.toLocaleString()}
                  </p>
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Assistance</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                    No beneficiaries for this program.
                  </td>
                </tr>
              ) : (
                beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-green-50 transition-all duration-200 group">
                    <td className="px-4 py-3 font-semibold text-gray-900">{beneficiary.name}</td>
                    <td className="px-4 py-3">{beneficiary.beneficiary_type || beneficiary.beneficiaryType}</td>
                    <td className="px-4 py-3">{beneficiary.assistance_type || beneficiary.assistanceType}</td>
                    <td className="px-4 py-3">{beneficiary.status}</td>
                    <td className="px-4 py-3 text-green-700 font-semibold">
                      ₱ {beneficiary.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {/* Enable/Disable My Benefits buttons (admin action) */}
                      <div className="flex gap-2 justify-end">
                        {beneficiary.my_benefits_enabled ? (
                          <button
                            className="px-3 py-1 rounded-full text-sm font-semibold transition bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => toggleMyBenefits(beneficiary, false)}
                            title="Disable My Benefits for this resident"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 rounded-full text-sm font-semibold transition bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => toggleMyBenefits(beneficiary, true)}
                            title="Enable My Benefits for this resident"
                          >
                            Enable
                          </button>
                        )}
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
                      const response = await axiosInstance.post('/beneficiaries', {
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
                    {/* DEBUG: Show residents array info */}
                    <div className="mb-2 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2">
                      Residents loaded: {Array.isArray(residents) ? residents.length : 'N/A'}<br />
                      {residents && residents.length > 0 && (
                        <pre className="max-h-24 overflow-y-auto whitespace-pre-wrap">{JSON.stringify(residents.slice(0,2), null, 2)}{residents.length > 2 ? '\n...more' : ''}</pre>
                      )}
                    </div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Resident</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm"
                      value={form.selectedResidentId || ''}
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
                          const selected = residents.find(r => String(r.id) === val);
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
                      <option value="">Select Resident</option>
                      {residents.map(r => (
                        <option key={r.id} value={r.id}>{`${r.first_name} ${r.last_name}`}</option>
                      ))}
                    </select>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
                <h3 className="text-white font-semibold text-lg">Form Submissions</h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-400">
                  Submissions viewer will be implemented here.
                  <br />
                  This will show all submitted applications with their data.
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmissionsModal(false);
                      setSelectedFormSubmissions([]);
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
        {/* Toast */}
        {toast && (
          <div className={`fixed right-6 bottom-6 z-50 p-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            <div className="font-semibold">{toast.type === 'success' ? 'Success' : 'Error'}</div>
            <div className="text-sm">{toast.message}</div>
          </div>
        )}
        </div>
      </main>
    </>
  );
};

export default ProgramDetails;
