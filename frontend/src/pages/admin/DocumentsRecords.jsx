import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
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
  DocumentIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClockIcon as RefreshIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTestData, getTestDocumentRecords } from '../../testData/documentRecordsTestData';

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

const getDocumentTypeColor = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return 'bg-blue-100 text-blue-800';
    case 'Cedula':
      return 'bg-green-100 text-green-800';
    case 'Brgy Indigency':
      return 'bg-purple-100 text-purple-800';
    case 'Brgy Residency':
      return 'bg-orange-100 text-orange-800';
    case 'Brgy Business Permit':
      return 'bg-pink-100 text-pink-800';
    case 'Brgy Certification':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDocumentTypeIcon = (type) => {
  switch (type) {
    case 'Brgy Clearance':
      return <DocumentTextIcon className="w-3 h-3" />;
    case 'Cedula':
      return <DocumentIcon className="w-3 h-3" />;
    case 'Brgy Indigency':
      return <AcademicCapIcon className="w-3 h-3" />;
    case 'Brgy Residency':
      return <BuildingOfficeIcon className="w-3 h-3" />;
    case 'Brgy Business Permit':
      return <BuildingOfficeIcon className="w-3 h-3" />;
    case 'Brgy Certification':
      return <DocumentIcon className="w-3 h-3" />;
    default:
      return <DocumentTextIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Approved':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'Rejected':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Processing':
      return <ClockIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const DocumentsRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [confirmingPayment, setConfirmingPayment] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'records'
  const [selectedDocumentType, setSelectedDocumentType] = useState('all');
  const [activeDocumentType, setActiveDocumentType] = useState('all'); // For document type tabs

  // Fetch document requests from backend
  const fetchRecords = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      // Use test data if flag is enabled (similar to backend test_create_admin_user.php)
      if (useTestData) {
        console.log('📊 Using test data for DocumentsRecords component');
        const data = getTestDocumentRecords();
        setRecords(data);
        setFilteredRecords(data);
        setChartData(generateChartData(data, selectedPeriod, selectedYear, selectedMonth));
        setLastRefresh(new Date());

        if (showRefreshIndicator) {
          setToastMessage({
            type: 'success',
            message: '🔄 Test data loaded successfully',
            duration: 2000
          });
        }
      } else {
        const res = await axiosInstance.get('document-requests');
        console.log('Fetched document requests:', res.data);
        // Map backend data to table format
        const mapped = res.data.map((item) => ({
          id: item.id,
          user: item.user,
          resident: item.resident,
          documentType: item.document_type,
          certificationType: item.certification_type,
          certificationData: item.certification_data,
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          requestDate: item.created_at,
          approvedDate: item.status === 'approved' ? item.updated_at : null,
          completedAt: item.completed_at,
          priority: item.priority,
          processingNotes: item.processing_notes,
          estimatedCompletion: item.estimated_completion,
          purpose: item.fields?.purpose || '',
          remarks: item.fields?.remarks || '',
          pdfPath: item.pdf_path,
          photoPath: item.photo_path,
          photoType: item.photo_type,
          photoMetadata: item.photo_metadata,
          paymentAmount: item.payment_amount,
          paymentStatus: item.payment_status,
          paymentNotes: item.payment_notes,
          paymentApprovedAt: item.payment_approved_at,
          paymentConfirmedAt: item.payment_confirmed_at,
          paymentApprovedBy: item.payment_approved_by,
          paymentConfirmedBy: item.payment_confirmed_by,
        }));
        setRecords(mapped);
        setFilteredRecords(mapped);
        setChartData(generateChartData(mapped, selectedPeriod, selectedYear, selectedMonth));
        setLastRefresh(new Date());

        if (showRefreshIndicator) {
          setToastMessage({
            type: 'success',
            message: '🔄 Data refreshed successfully',
            duration: 2000
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch document records:', err);
      console.error('Error details:', {
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = '❌ Failed to load data: ';
      if (err.response) {
        errorMessage += err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += err.message || 'Unknown error occurred';
      }
      
      setToastMessage({
        type: 'error',
        message: errorMessage,
        duration: 4000
      });
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRecords();
  }, []);

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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveDocumentType('all'); // Reset document type filter when switching tabs
  };

  // Send notification to resident about approval
  const sendApprovalNotification = async (documentRequest) => {
    try {
      // This would typically call a notification API
      console.log('Sending approval notification to resident:', {
        residentId: documentRequest.user?.id,
        documentType: documentRequest.documentType,
        paymentAmount: documentRequest.paymentAmount,
        status: 'approved'
      });
      
      // In a real implementation, you would call:
      // await axiosInstance.post('/notifications', {
      //   user_id: documentRequest.user?.id,
      //   type: 'document_approval',
      //   title: 'Document Request Approved',
      //   message: `Your ${documentRequest.documentType} request has been approved. Payment required: ₱${documentRequest.paymentAmount}`,
      //   data: {
      //     document_request_id: documentRequest.id,
      //     payment_amount: documentRequest.paymentAmount
      //   }
      // });
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  };

  // Admin confirms payment for a document request
  const handleConfirmPayment = async (record) => {
    setConfirmingPayment(record.id);
    setToastMessage({
      type: 'loading',
      message: 'Confirming payment...',
      duration: 0
    });
    
    try {
      console.log('Confirming payment for record:', {
        id: record.id,
        status: record.status,
        paymentAmount: record.paymentAmount,
        paymentStatus: record.paymentStatus,
        documentType: record.documentType
      });
      
      const response = await axiosInstance.post(`/document-requests/${record.id}/admin-confirm-payment`);
      
      console.log('Payment confirmation response:', response.data);
      
      setToastMessage({
        type: 'success',
        message: `✅ Payment confirmed! ${record.documentType} has been moved to Document Records.`,
        duration: 4000
      });
      
      // Refresh records to update the UI
      await fetchRecords();
      
    } catch (err) {
      console.error('Error confirming payment:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 'Failed to confirm payment.';
      
      setToastMessage({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 4000
      });
    } finally {
      setConfirmingPayment(null);
    }
  };

  // Filter records based on active tab, search, and document type
  useEffect(() => {
    let filtered = records.filter((record) => {
      const name = record.user?.name || record.resident?.first_name + ' ' + record.resident?.last_name || '';
      const id = record.resident?.resident_id || record.user?.id ? `RES-${String(record.user?.id || record.resident?.id).padStart(3, '0')}` : '';
      
      // Search filter
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase()) ||
        record.documentType.toLowerCase().includes(search.toLowerCase());
      
      // Document type filter
      const matchesDocumentType = activeDocumentType === 'all' || record.documentType === activeDocumentType;
      
      // Tab-based filtering
      let matchesTab = true;
      if (activeTab === 'requests') {
        // Show all requests (pending, approved, rejected) that are not paid
        matchesTab = record.paymentStatus !== 'paid';
      } else if (activeTab === 'records') {
        // Show only paid and approved requests (finalized records)
        matchesTab = record.paymentStatus === 'paid' && record.status === 'Approved';
      }
      
      return matchesSearch && matchesDocumentType && matchesTab;
    });
    
    setFilteredRecords(filtered);
  }, [search, records, activeTab, activeDocumentType]);

  // Update chart data when records, period, year, or month changes
  useEffect(() => {
    setChartData(generateChartData(records, selectedPeriod, selectedYear, selectedMonth));
  }, [records, selectedPeriod, selectedYear, selectedMonth]);

  const handleShowDetails = (record) => {
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(record);
    }
  };

  const handleEdit = (record) => {
    setEditData({ ...record });
    setShowModal(true);
    setFeedback(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setFeedback({ type: 'loading', message: 'Saving changes...' });
    
    // Validate payment amount when approving
    if (editData.status.toLowerCase() === 'approved' && (!editData.paymentAmount || editData.paymentAmount <= 0)) {
      setFeedback({
        type: 'error',
        message: '❌ Payment amount is required when approving a document request.',
        details: 'Please enter a valid payment amount before approving.'
      });
      setLoading(false);
      return;
    }
    
    try {
      await axiosInstance.patch(`/document-requests/${editData.id}`, {
        status: editData.status.toLowerCase(),
        priority: editData.priority,
        estimated_completion: editData.estimatedCompletion,
        payment_amount: editData.paymentAmount || 0,
        payment_notes: editData.paymentNotes || '',
        fields: {
          purpose: editData.purpose,
          remarks: editData.remarks,
        },
      });
      
      setFeedback({
        type: 'success',
        message: editData.status.toLowerCase() === 'approved' 
          ? '✅ Document approved successfully! Payment notification sent to resident.'
          : '✅ Document record updated successfully!',
        details: editData.status.toLowerCase() === 'approved' 
          ? `Document approved with payment amount ₱${editData.paymentAmount}. Resident has been notified and can now make payment.`
          : `Status changed to ${editData.status}. All changes have been saved.`
      });
      
      // Show toast notification
      setToastMessage({
        type: 'success',
        message: `Document #${editData.id} updated successfully`,
        duration: 3000
      });
      
      // Send notification if approved
      if (editData.status.toLowerCase() === 'approved' && editData.paymentAmount > 0) {
        await sendApprovalNotification(editData);
      }
      
      setTimeout(() => {
        setShowModal(false);
        setEditData({});
        setFeedback(null);
      }, 1500);
      
      // Refresh records
      await fetchRecords();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save changes.';
      const errorCode = err.response?.status;
      
      setFeedback({
        type: 'error',
        message: `❌ ${errorMessage}`,
        details: errorCode ? `Error Code: ${errorCode}` : 'Please check your connection and try again.'
      });
      
      setToastMessage({
        type: 'error',
        message: 'Failed to update document record',
        duration: 4000
      });
    } finally {
      setLoading(false);
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

  const getStatusCount = (status) => {
    return records.filter(record => record.status === status).length;
  };

  const getDocumentTypeCount = (documentType) => {
    if (activeTab === 'requests') {
      return records.filter(record => 
        record.documentType === documentType && record.paymentStatus !== 'paid'
      ).length;
    } else {
      return records.filter(record => 
        record.documentType === documentType && 
        record.paymentStatus === 'paid' && 
        record.status === 'Approved'
      ).length;
    }
  };

  const handleGeneratePdf = async (record) => {
    setGeneratingPdf(record.id);
    setToastMessage({
      type: 'loading',
      message: `Generating PDF for ${record.documentType}...`,
      duration: 0
    });
    
    try {
  const response = await axiosInstance.post(`/document-requests/${record.id}/generate-pdf`);
      
      setToastMessage({
        type: 'success',
        message: `🎉 PDF certificate generated successfully for ${record.user?.name || 'resident'}!`,
        duration: 4000
      });
      
      // Refresh records to get updated PDF path
      await fetchRecords();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate PDF.';
      setToastMessage({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 5000
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleDownloadPdf = async (record) => {
    setToastMessage({
      type: 'loading',
      message: 'Preparing download...',
      duration: 0
    });
    
    try {
      // Log request details
      console.log('Downloading PDF for record:', {
        id: record.id,
        documentType: record.documentType,
        userName: record.user?.name
      });
      
      const response = await axiosInstance.get(`document-requests/${record.id}/download-pdf`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Validate response data
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF data from server');
      }
      
      // Log response details for debugging
      console.log('PDF download response:', {
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        blobSize: response.data.size
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Log blob details
      console.log('Created Blob:', {
        size: blob.size,
        type: blob.type,
        url: url
      });
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.documentType}-${record.user?.name || 'certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up URL after a short delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log('Cleaned up Blob URL:', url);
      }, 100);
      
      setToastMessage({
        type: 'success',
        message: `📄 PDF downloaded successfully!`,
        duration: 3000
      });
    } catch (err) {
      console.error('Download PDF error:', err);
      console.error('Error details:', {
        response: err.response,
        request: err.request,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = '❌ Failed to download PDF. ';
      if (err.response) {
        switch (err.response.status) {
          case 404:
            errorMessage += 'Document not found or not yet generated.';
            break;
          case 403:
            errorMessage += 'You do not have permission to download this document.';
            break;
          default:
            errorMessage += err.response?.data?.message || 'Please try again.';
        }
        console.error('Response error details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      } else if (err.request) {
        errorMessage += 'Network error. Please check your connection.';
        console.error('Network error details:', {
          request: err.request,
          config: err.config
        });
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setToastMessage({
        type: 'error',
        message: errorMessage,
        duration: 4000
      });
    }
  };

  const handleViewPdf = async (record) => {
    setToastMessage({
      type: 'loading',
      message: 'Opening PDF...',
      duration: 0
    });
    
    try {
      // Log request details
      console.log('Opening PDF for record:', {
        id: record.id,
        documentType: record.documentType,
        userName: record.user?.name
      });
      
      const response = await axiosInstance.get(`document-requests/${record.id}/download-pdf`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Validate response
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF data from server');
      }
      
      // Log response details
      console.log('PDF view response:', {
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        blobSize: response.data.size
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Log blob details
      console.log('Created Blob:', {
        size: blob.size,
        type: blob.type,
        url: url
      });
      
      // Open PDF in new window with improved options
      const pdfWindow = window.open(url, '_blank', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,toolbar=yes,menubar=yes');
      
      if (pdfWindow) {
        setToastMessage({
          type: 'success',
          message: `📄 PDF opened successfully!`,
          duration: 3000
        });
      } else {
        throw new Error('Popup window was blocked. Please allow popups for this site.');
      }
      
      // Clean up the URL after a delay to ensure PDF loads
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        console.log('Cleaned up Blob URL:', url);
      }, 1000);
      
    } catch (err) {
      console.error('View PDF error:', err);
      console.error('Error details:', {
        response: err.response,
        request: err.request,
        message: err.message,
        stack: err.stack
      });
      
      let errorMessage = '❌ Failed to open PDF. ';
      if (err.response) {
        switch (err.response.status) {
          case 404:
            errorMessage += 'Document not found or not yet generated.';
            break;
          case 403:
            errorMessage += 'You do not have permission to view this document.';
            break;
          default:
            errorMessage += err.response?.data?.message || 'Please try again.';
        }
        console.error('Response error details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      } else if (err.request) {
        errorMessage += 'Network error. Please check your connection.';
        console.error('Network error details:', {
          request: err.request,
          config: err.config
        });
      } else if (err.message.includes('blocked')) {
        errorMessage += 'Popup was blocked. Please allow popups and try again.';
      } else {
        errorMessage += err.message || 'Please try again.';
      }
      
      setToastMessage({
        type: 'error',
        message: errorMessage,
        duration: 4000
      });
    }
  };

  // Generate chart data for document requests based on period, year, and month
  const generateChartData = (records, period = 'all', year = '', month = 0) => {
    const now = new Date();
    let effectiveYear = year ? parseInt(year) : currentYear;
    let effectiveMonth = month;
    let data = [];

    if (period === 'month') {
      if (effectiveMonth === 0) {
        // If no specific month, use current month
        effectiveMonth = now.getMonth() + 1;
      }
      if (isNaN(effectiveYear)) {
        effectiveYear = now.getFullYear();
      }
      // Daily data for selected month and year
      const monthStart = new Date(effectiveYear, effectiveMonth - 1, 1);
      const monthEnd = new Date(effectiveYear, effectiveMonth, 0);
      const dailyData = {};
      records.forEach(record => {
        if (record.requestDate) {
          const date = new Date(record.requestDate);
          if (date >= monthStart && date <= monthEnd) {
            const dayKey = date.toISOString().split('T')[0];
            dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
          }
        }
      });
      // Fill all days of the month
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(effectiveYear, effectiveMonth - 1, day);
        const key = date.toISOString().split('T')[0];
        data.push({
          name: date.getDate().toString(),
          requests: dailyData[key] || 0
        });
      }
    } else if (period === 'year') {
      if (isNaN(effectiveYear)) {
        effectiveYear = currentYear;
      }
      if (effectiveMonth > 0) {
        // Daily data for selected month in the year
        const monthStart = new Date(effectiveYear, effectiveMonth - 1, 1);
        const monthEnd = new Date(effectiveYear, effectiveMonth, 0);
        const dailyData = {};
        records.forEach(record => {
          if (record.requestDate) {
            const date = new Date(record.requestDate);
            if (date >= monthStart && date <= monthEnd) {
              const dayKey = date.toISOString().split('T')[0];
              dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
            }
          }
        });
        // Fill all days of the month
        for (let day = 1; day <= monthEnd.getDate(); day++) {
          const date = new Date(effectiveYear, effectiveMonth - 1, day);
          const key = date.toISOString().split('T')[0];
          data.push({
            name: date.getDate().toString(),
            requests: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        records.forEach(record => {
          if (record.requestDate) {
            const date = new Date(record.requestDate);
            if (date.getFullYear() === effectiveYear) {
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              yearlyData[monthKey] = (yearlyData[monthKey] || 0) + 1;
            }
          }
        });
        // Fill all months of the year
        for (let m = 0; m < 12; m++) {
          const date = new Date(effectiveYear, m, 1);
          const key = `${effectiveYear}-${String(m + 1).padStart(2, '0')}`;
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            requests: yearlyData[key] || 0
          });
        }
      }
    } else {
      // All time - last 12 months
      const monthlyData = {};
      records.forEach(record => {
        if (record.requestDate) {
          const date = new Date(record.requestDate);
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
          requests: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Get most requested document type based on period, year, and month
  const getMostRequestedDocument = (records, period = 'all', year = '', month = 0) => {
    const yearNum = year ? parseInt(year) : currentYear;
    const monthNum = month;
    let filtered = records;
    if (period === 'month' && monthNum > 0) {
      filtered = records.filter(record => {
        if (!record.requestDate) return false;
        const date = new Date(record.requestDate);
        return date.getMonth() + 1 === monthNum && date.getFullYear() === yearNum;
      });
    } else if (period === 'year') {
      if (monthNum > 0) {
        filtered = records.filter(record => {
          if (!record.requestDate) return false;
          const date = new Date(record.requestDate);
          return date.getMonth() + 1 === monthNum && date.getFullYear() === yearNum;
        });
      } else {
        filtered = records.filter(record => {
          if (!record.requestDate) return false;
          const date = new Date(record.requestDate);
          return date.getFullYear() === yearNum;
        });
      }
    }
    // for 'all', use all records

    const counts = {};
    filtered.forEach(record => {
      counts[record.documentType] = (counts[record.documentType] || 0) + 1;
    });

    let max = 0;
    let most = Object.keys(counts).length > 0 ? '' : 'N/A';
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
          {type === 'error' && <ExclamationCircleIcon className="w-5 h-5 text-red-600" />}
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
      <Navbar />
      <Sidebar />
      
      {/* Toast Notification */}
      {toastMessage && (
        <ToastNotification
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
      
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <DocumentTextIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Documents & Certificates Records
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay document requests and certificate issuance with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Requests"
              value={records.length}
              icon={<DocumentTextIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Approved"
              value={getStatusCount('Approved')}
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
              label="Processing"
              value={getStatusCount('Processing')}
              icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Document Requests Analytics
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value !== 'month') setSelectedMonth(0);
                    if (e.target.value === 'all') {
                      setSelectedYear('');
                      setSelectedMonth(0);
                    }
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
              {selectedPeriod === 'month' ? `Daily requests in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly requests in ${selectedYear || currentYear}` :
               'Requests over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
        
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Most Requested in Selected Period
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostRequestedDocument(records, selectedPeriod, selectedYear, selectedMonth).type}</p>
                <p className="text-sm text-green-700">{getMostRequestedDocument(records, selectedPeriod, selectedYear, selectedMonth).count} requests</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Most Requested Overall
                </h4>
                <p className="text-lg font-bold text-blue-900">{getMostRequestedDocument(records, 'all').type}</p>
                <p className="text-sm text-blue-700">{getMostRequestedDocument(records, 'all').count} requests</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleTabChange('requests')}
                  className={`px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'requests'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Document Requests ({records.filter(r => r.paymentStatus !== 'paid').length})
                </button>
                <button 
                  onClick={() => handleTabChange('records')}
                  className={`px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'records'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <DocumentIcon className="w-5 h-5" />
                  Document Records ({records.filter(r => r.paymentStatus === 'paid' && r.status === 'Approved').length})
                </button>
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
                    <RefreshIcon className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
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
                    placeholder="Search by name, ID, or document type..."
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


          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                {activeTab === 'requests' 
                  ? (activeDocumentType === 'all' 
                      ? 'Document Requests' 
                      : `${activeDocumentType} Requests`)
                  : (activeDocumentType === 'all' 
                      ? 'Document Records' 
                      : `${activeDocumentType} Records`)
                }
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* Document Type Filter Row - Show for both tabs */}
                {(
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                    <tr>
                      <th colSpan="11" className="px-8 py-6">
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                              onClick={() => setActiveDocumentType('all')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'all'
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl ring-2 ring-blue-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className={`w-4 h-4 ${activeDocumentType === 'all' ? 'text-white' : 'text-blue-600'}`} />
                                <span>All Documents</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'all' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {activeTab === 'requests' 
                                    ? records.filter(r => r.paymentStatus !== 'paid').length 
                                    : records.filter(r => r.paymentStatus === 'paid' && r.status === 'Approved').length
                                  }
                                </span>
                              </div>
                              {activeDocumentType === 'all' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveDocumentType('Brgy Clearance')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'Brgy Clearance'
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl ring-2 ring-green-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className={`w-4 h-4 ${activeDocumentType === 'Brgy Clearance' ? 'text-white' : 'text-green-600'}`} />
                                <span>Barangay Clearance</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'Brgy Clearance' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {getDocumentTypeCount('Brgy Clearance')}
                                </span>
                              </div>
                              {activeDocumentType === 'Brgy Clearance' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveDocumentType('Brgy Business Permit')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'Brgy Business Permit'
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl ring-2 ring-purple-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className={`w-4 h-4 ${activeDocumentType === 'Brgy Business Permit' ? 'text-white' : 'text-purple-600'}`} />
                                <span>Business Permit</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'Brgy Business Permit' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {getDocumentTypeCount('Brgy Business Permit')}
                                </span>
                              </div>
                              {activeDocumentType === 'Brgy Business Permit' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveDocumentType('Brgy Indigency')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'Brgy Indigency'
                                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl ring-2 ring-orange-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <AcademicCapIcon className={`w-4 h-4 ${activeDocumentType === 'Brgy Indigency' ? 'text-white' : 'text-orange-600'}`} />
                                <span>Certificate of Indigency</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'Brgy Indigency' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {getDocumentTypeCount('Brgy Indigency')}
                                </span>
                              </div>
                              {activeDocumentType === 'Brgy Indigency' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveDocumentType('Brgy Residency')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'Brgy Residency'
                                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xl ring-2 ring-teal-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className={`w-4 h-4 ${activeDocumentType === 'Brgy Residency' ? 'text-white' : 'text-teal-600'}`} />
                                <span>Certificate of Residency</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'Brgy Residency' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-teal-100 text-teal-700'
                                }`}>
                                  {getDocumentTypeCount('Brgy Residency')}
                                </span>
                              </div>
                              {activeDocumentType === 'Brgy Residency' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setActiveDocumentType('Brgy Certification')}
                              className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                                activeDocumentType === 'Brgy Certification'
                                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xl ring-2 ring-indigo-200'
                                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <DocumentIcon className={`w-4 h-4 ${activeDocumentType === 'Brgy Certification' ? 'text-white' : 'text-indigo-600'}`} />
                                <span>Barangay Certification</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  activeDocumentType === 'Brgy Certification' 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {getDocumentTypeCount('Brgy Certification')}
                                </span>
                              </div>
                              {activeDocumentType === 'Brgy Certification' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>
                              )}
                            </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                )}
                
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Full Name</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">National ID</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Civil Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Gender</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Document Type</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Payment Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <DocumentTextIcon className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">
                            {activeTab === 'requests' 
                              ? (activeDocumentType === 'all' 
                                  ? 'No document requests found' 
                                  : `No ${activeDocumentType} requests found`)
                              : (activeDocumentType === 'all' 
                                  ? 'No document records found' 
                                  : `No ${activeDocumentType} records found`)
                            }
                          </p>
                          <p className="text-gray-400 text-sm">
                            {activeTab === 'requests' 
                              ? (activeDocumentType === 'all' 
                                  ? 'All document requests have been processed and moved to records' 
                                  : `No ${activeDocumentType} requests found. Try selecting a different document type.`)
                              : (activeDocumentType === 'all' 
                                  ? 'No paid document records found' 
                                  : `No ${activeDocumentType} records found. Try selecting a different document type.`)
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <tr className="hover:bg-green-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                              {record.resident?.resident_id || (record.user ? `RES-${String(record.user.id).padStart(3, '0')}` : 'N/A')}
                            </span>
                          </td>
                          <td
                            onClick={() => handleShowDetails(record)}
                            className="px-6 py-4 cursor-pointer group-hover:text-green-600 transition-colors duration-200"
                          >
                            <div className="font-semibold text-gray-900">
                              {record.user?.name || (record.resident ? `${record.resident.first_name} ${record.resident.last_name}` : 'N/A')}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <EyeIcon className="w-3 h-3" />
                              Click to view details
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.nationality || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                              {record.resident?.age || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.civil_status || 'N/A'}
                          </td>
                          <td className="px-4 py-4 text-gray-700">
                            {record.resident?.sex || 'N/A'}
                          </td>
                          <td className="px-4 py-4">
                            {badge(record.documentType, getDocumentTypeColor(record.documentType), getDocumentTypeIcon(record.documentType))}
                          </td>
                          <td className="px-4 py-4">
                            {badge(record.status, getStatusColor(record.status), getStatusIcon(record.status))}
                          </td>
                          <td className="px-4 py-4">
                            {record.paymentAmount && record.paymentAmount > 0 ? (
                              <div className="text-sm font-bold text-green-600">
                                ₱{parseFloat(record.paymentAmount).toFixed(2)}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No payment</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {record.paymentAmount && record.paymentAmount > 0 ? (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                record.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.paymentStatus === 'paid' ? (
                                  <>
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <ClockIcon className="w-3 h-3" />
                                    Unpaid
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                             <div className="flex gap-2">
                              <button
                                onClick={() => handleShowDetails(record)}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View
                              </button>
                              {/* Only show Edit button for requests, not for finalized records */}
                              {activeTab === 'requests' && (
                                <button
                                  onClick={() => handleEdit(record)}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                >
                                  <PencilIcon className="w-3 h-3" />
                                  Edit
                                </button>
                              )}
                              {/* Show Pay button for approved unpaid requests in Requests tab */}
                              {activeTab === 'requests' && record.status === 'Approved' && record.paymentAmount && record.paymentAmount > 0 && record.paymentStatus === 'unpaid' && (
                                <button
                                  onClick={() => handleConfirmPayment(record)}
                                  disabled={confirmingPayment === record.id}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                  title={`Confirm payment of ₱${parseFloat(record.paymentAmount).toFixed(2)}`}
                                >
                                  <CurrencyDollarIcon className="w-3 h-3" />
                                  {confirmingPayment === record.id ? 'Confirming...' : `Confirm Payment ₱${parseFloat(record.paymentAmount).toFixed(2)}`}
                                </button>
                              )}
                              {record.status === 'Approved' && (
                                <>
                                  {!record.pdfPath ? (
                                    <button
                                      onClick={() => handleGeneratePdf(record)}
                                      disabled={generatingPdf === record.id}
                                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                    >
                                      <DocumentTextIcon className="w-3 h-3" />
                                      {generatingPdf === record.id ? 'Generating...' : 'Generate PDF'}
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleViewPdf(record)}
                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                      >
                                        <EyeIcon className="w-3 h-3" />
                                        View PDF
                                      </button>
                                      <button
                                        onClick={() => handleDownloadPdf(record)}
                                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300 transform hover:scale-105"
                                      >
                                        <DocumentArrowDownIcon className="w-3 h-3" />
                                        Download
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {selectedRecord?.id === record.id && (
                          <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <td colSpan="11" className="px-8 py-8">
                              <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
                                <div className="flex flex-col lg:flex-row gap-8 items-start">
                                  {/* Document Information Card */}
                                  <div className="flex-1 space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5" /> Document Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Document Type:</span> <span className="text-gray-900">{selectedRecord.documentType}</span></div>
                                        {selectedRecord.certificationType && (
                                          <div><span className="font-medium text-gray-700">Certification Type:</span> <span className="text-gray-900">{selectedRecord.certificationType}</span></div>
                                        )}
                                        <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{selectedRecord.status}</span></div>
                                        {selectedRecord.priority && (
                                          <div><span className="font-medium text-gray-700">Priority:</span> <span className="text-gray-900 capitalize">{selectedRecord.priority}</span></div>
                                        )}
                                        <div><span className="font-medium text-gray-700">Request Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.requestDate)}</span></div>
                                        <div><span className="font-medium text-gray-700">Approved Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.approvedDate)}</span></div>
                                        {selectedRecord.completedAt && (
                                          <div><span className="font-medium text-gray-700">Completed Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.completedAt)}</span></div>
                                        )}
                                        {selectedRecord.estimatedCompletion && (
                                          <div><span className="font-medium text-gray-700">Estimated Completion:</span> <span className="text-gray-900">{formatDate(selectedRecord.estimatedCompletion)}</span></div>
                                        )}
                                        <div><span className="font-medium text-gray-700">Purpose:</span> <span className="text-gray-900">{selectedRecord.purpose}</span></div>
                                        <div><span className="font-medium text-gray-700">Remarks:</span> <span className="text-gray-900">{selectedRecord.remarks}</span></div>
                                        {selectedRecord.processingNotes && (
                                          <div className="md:col-span-2"><span className="font-medium text-gray-700">Processing Notes:</span> <span className="text-gray-900">{selectedRecord.processingNotes}</span></div>
                                        )}
                                        {selectedRecord.paymentAmount && selectedRecord.paymentAmount > 0 && (
                                          <>
                                            <div><span className="font-medium text-gray-700">Payment Amount:</span> <span className="text-gray-900 font-semibold">₱{parseFloat(selectedRecord.paymentAmount).toFixed(2)}</span></div>
                                            <div><span className="font-medium text-gray-700">Payment Status:</span> 
                                              <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedRecord.paymentStatus === 'paid' 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {selectedRecord.paymentStatus === 'paid' ? (
                                                  <>
                                                    <CheckCircleIcon className="w-3 h-3" />
                                                    Paid
                                                  </>
                                                ) : (
                                                  <>
                                                    <ClockIcon className="w-3 h-3" />
                                                    Unpaid
                                                  </>
                                                )}
                                              </span>
                                            </div>
                                            {selectedRecord.paymentNotes && (
                                              <div className="md:col-span-2"><span className="font-medium text-gray-700">Payment Notes:</span> <span className="text-gray-900">{selectedRecord.paymentNotes}</span></div>
                                            )}
                                            {selectedRecord.paymentApprovedAt && (
                                              <div><span className="font-medium text-gray-700">Payment Approved:</span> <span className="text-gray-900">{formatDate(selectedRecord.paymentApprovedAt)}</span></div>
                                            )}
                                            {selectedRecord.paymentConfirmedAt && (
                                              <div><span className="font-medium text-gray-700">Payment Confirmed:</span> <span className="text-gray-900">{formatDate(selectedRecord.paymentConfirmedAt)}</span></div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                      
                                      {/* Certification-specific data */}
                                      {selectedRecord.certificationData && Object.keys(selectedRecord.certificationData).length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                          <h5 className="text-md font-semibold text-green-800 mb-3">Certification Details</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {selectedRecord.certificationData.child_name && (
                                              <div><span className="font-medium text-gray-700">Child's Name:</span> <span className="text-gray-900">{selectedRecord.certificationData.child_name}</span></div>
                                            )}
                                            {selectedRecord.certificationData.child_birth_date && (
                                              <div><span className="font-medium text-gray-700">Child's Birth Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.certificationData.child_birth_date)}</span></div>
                                            )}
                                            {selectedRecord.certificationData.registration_office && (
                                              <div><span className="font-medium text-gray-700">Registration Office:</span> <span className="text-gray-900">{selectedRecord.certificationData.registration_office}</span></div>
                                            )}
                                            {selectedRecord.certificationData.registration_date && (
                                              <div><span className="font-medium text-gray-700">Registration Date:</span> <span className="text-gray-900">{formatDate(selectedRecord.certificationData.registration_date)}</span></div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>


                                    {/* Resident Information Card */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <UserIcon className="w-5 h-5" /> Resident Information
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-700">Resident ID:</span> <span className="text-gray-900">{selectedRecord.resident?.resident_id || (selectedRecord.user?.id ? `RES-${String(selectedRecord.user.id).padStart(3, '0')}` : 'N/A')}</span></div>
                                        <div><span className="font-medium text-gray-700">Full Name:</span> <span className="text-gray-900">{selectedRecord.user?.name || (selectedRecord.resident ? `${selectedRecord.resident.first_name} ${selectedRecord.resident.middle_name ? selectedRecord.resident.middle_name + ' ' : ''}${selectedRecord.resident.last_name}${selectedRecord.resident.name_suffix ? ' ' + selectedRecord.resident.name_suffix : ''}` : 'N/A')}</span></div>
                                        <div><span className="font-medium text-gray-700">Nationality:</span> <span className="text-gray-900">{selectedRecord.resident?.nationality || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{selectedRecord.resident?.age || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Civil Status:</span> <span className="text-gray-900">{selectedRecord.resident?.civil_status || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{selectedRecord.resident?.sex || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Contact Number:</span> <span className="text-gray-900">{selectedRecord.resident?.contact_number || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedRecord.resident?.email || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{selectedRecord.resident?.current_address || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Birth Date:</span> <span className="text-gray-900">{selectedRecord.resident?.birth_date ? formatDate(selectedRecord.resident.birth_date) : 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Birth Place:</span> <span className="text-gray-900">{selectedRecord.resident?.birth_place || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Religion:</span> <span className="text-gray-900">{selectedRecord.resident?.religion || 'N/A'}</span></div>
                                        <div><span className="font-medium text-gray-700">Years in Barangay:</span> <span className="text-gray-900">{selectedRecord.resident?.years_in_barangay || 'N/A'}</span></div>
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
            <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl border border-green-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PencilIcon className="w-6 h-6" />
                    Edit Document Record
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                    <select
                      value={editData.documentType || ''}
                      onChange={(e) => setEditData({...editData, documentType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      disabled
                    >
                      <option value="">Select Document Type</option>
                      <option value="Brgy Clearance">Brgy Clearance</option>
                      <option value="Cedula">Cedula</option>
                      <option value="Brgy Indigency">Brgy Indigency</option>
                      <option value="Brgy Residency">Brgy Residency</option>
                      <option value="Brgy Business Permit">Brgy Business Permit</option>
                      <option value="Brgy Certification">Brgy Certification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={editData.status || ''}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                    <input
                      type="text"
                      value={editData.purpose || ''}
                      onChange={(e) => setEditData({...editData, purpose: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter purpose"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                    <input
                      type="text"
                      value={editData.remarks || ''}
                      onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter remarks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={editData.priority || 'normal'}
                      onChange={(e) => setEditData({...editData, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Completion</label>
                    <input
                      type="date"
                      value={editData.estimatedCompletion ? new Date(editData.estimatedCompletion).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, estimatedCompletion: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Amount (₱) 
                      {editData.status?.toLowerCase() === 'approved' && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editData.paymentAmount || ''}
                      onChange={(e) => setEditData({...editData, paymentAmount: parseFloat(e.target.value) || 0})}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 ${
                        editData.status?.toLowerCase() === 'approved' && (!editData.paymentAmount || editData.paymentAmount <= 0)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                      placeholder={editData.status?.toLowerCase() === 'approved' ? "Required for approval" : "Enter payment amount"}
                      required={editData.status?.toLowerCase() === 'approved'}
                    />
                    {editData.status?.toLowerCase() === 'approved' && (!editData.paymentAmount || editData.paymentAmount <= 0) && (
                      <p className="text-red-500 text-xs mt-1">Payment amount is required when approving</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Notes</label>
                    <textarea
                      value={editData.paymentNotes || ''}
                      onChange={(e) => setEditData({...editData, paymentNotes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter payment notes (optional)"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {feedback && (
                  <div className={`rounded-xl p-4 mt-4 border-2 transition-all duration-300 ${
                    feedback.type === 'success'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                      : feedback.type === 'loading'
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {feedback.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                        {feedback.type === 'loading' && <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />}
                        {feedback.type === 'error' && <ExclamationCircleIcon className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base">{feedback.message}</div>
                        {feedback.details && (
                          <div className="text-sm opacity-80 mt-1">{feedback.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default DocumentsRecords;