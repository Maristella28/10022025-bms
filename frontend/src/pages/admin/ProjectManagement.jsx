import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from '../../utils/axiosConfig';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  DocumentTextIcon,
  DocumentIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon,
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  TrophyIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('Planned');
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [recordFiles, setRecordFiles] = useState([]);
  const [recordFilePreviews, setRecordFilePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Additional fields for Project Records
  const [newRemarks, setNewRemarks] = useState('');
  const [newCompletedAt, setNewCompletedAt] = useState('');
  const [maxDateTime, setMaxDateTime] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [recordingProject, setRecordingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [feedbacks, setFeedbacks] = useState([]);
  const [openFeedbackProjectId, setOpenFeedbackProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllFeedbackProjectId, setShowAllFeedbackProjectId] = useState(null);
  const [viewingFilesForProject, setViewingFilesForProject] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrlToView, setPdfUrlToView] = useState('');
  const [reactionCounts, setReactionCounts] = useState({}); // { [projectId]: { like: 0, dislike: 0 } }
  const [activeTab, setActiveTab] = useState('posted'); // 'posted' or 'records'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showRecordDropdown, setShowRecordDropdown] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentToView, setDocumentToView] = useState(null);
  const [documentType, setDocumentType] = useState(''); // 'pdf' or 'docx'

  // Analytics and search state
  const [chartData, setChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Analytics period selection
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
    fetchFeedbacks();
    setMaxDateTimeForInput();
  }, []);

  // Debug document viewer state
  useEffect(() => {
    console.log('Document viewer state changed:', { showDocumentViewer, documentToView, documentType });
  }, [showDocumentViewer, documentToView, documentType]);

  // Set maximum date/time for input (current date/time)
  const setMaxDateTimeForInput = () => {
    const now = new Date();
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const maxDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setMaxDateTime(maxDateTime);
  };

  // Validate that the selected date/time is not in the future
  const validateDateTime = (dateTimeString) => {
    if (!dateTimeString) return true; // Empty is handled by required validation
    
    const selectedDate = new Date(dateTimeString);
    const now = new Date();
    
    return selectedDate <= now;
  };

  // Fetch reactions for each project when projects change
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        fetchReactionCounts(project.id);
      });
    }
  }, [projects]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchProjects();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchProjects(true);
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

  // Filter projects based on search, status, and active tab
  useEffect(() => {
    let filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.owner.toLowerCase().includes(search.toLowerCase())
    );

    // Apply tab-based filtering
    if (activeTab === 'posted') {
      // Posted projects: published projects visible to residents
      // Note: published field is stored as integer (1/0) in database, not boolean
      filtered = filtered.filter(project => project.published == true || project.published === 1);
    } else if (activeTab === 'records') {
      // Project records: completed projects only
      // Since we don't have created_by_admin/staff fields yet, we'll show completed projects
      filtered = filtered.filter(project => project.status === 'Completed');
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [search, projects, selectedStatus, activeTab]);

  // Update chart data when projects, period, year, or month changes
  useEffect(() => {
    setChartData(generateChartData(projects, selectedPeriod, selectedYear, selectedMonth));
  }, [projects, selectedPeriod, selectedYear, selectedMonth]);

  const currentYear = new Date().getFullYear();

  // Generate chart data for project creation based on period, year, and month
  const generateChartData = (projects, period = 'all', year = currentYear, month = 0) => {
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
      projects.forEach(project => {
        if (project.created_at) {
          const date = new Date(project.created_at);
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
          projects: dailyData[key] || 0
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
        projects.forEach(project => {
          if (project.created_at) {
            const date = new Date(project.created_at);
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
            projects: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        projects.forEach(project => {
          if (project.created_at) {
            const date = new Date(project.created_at);
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
            projects: yearlyData[key] || 0
          });
        }
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      projects.forEach(project => {
        if (project.created_at) {
          const date = new Date(project.created_at);
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
          projects: monthlyData[key] || 0
        });
      }
    }
    return data;
  };


  // Get most frequent project by feedback count based on period, year, and month
  const getMostFrequentProject = (period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filteredFeedbacks = feedbacks;
    if (period === 'month' && month > 0) {
      filteredFeedbacks = feedbacks.filter(fb => {
        if (!fb.created_at) return false;
        const date = new Date(fb.created_at);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filteredFeedbacks = feedbacks.filter(fb => {
          if (!fb.created_at) return false;
          const date = new Date(fb.created_at);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filteredFeedbacks = feedbacks.filter(fb => {
          if (!fb.created_at) return false;
          const date = new Date(fb.created_at);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const projectFeedbackCounts = {};
    filteredFeedbacks.forEach(fb => {
      if (fb.project_id) {
        projectFeedbackCounts[fb.project_id] = (projectFeedbackCounts[fb.project_id] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mostProjectId = null;
    for (const [id, count] of Object.entries(projectFeedbackCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostProjectId = id;
      }
    }
    if (!mostProjectId) return { name: 'N/A', count: 0 };

    const project = projects.find(p => p.id === parseInt(mostProjectId));
    return { name: project ? project.name : 'Unknown', count: maxCount };
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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRecordDropdown && !event.target.closest('.relative')) {
        setShowRecordDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRecordDropdown]);

  const fetchProjects = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    try {
      setLoading(true);
      const response = await axios.get('/admin/projects');
      setProjects(response.data);
      setChartData(generateChartData(response.data, selectedPeriod, selectedYear, selectedMonth));
      setLastRefresh(new Date());

      if (showRefreshIndicator) {
        setToastMessage({
          type: 'success',
          message: '🔄 Data refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
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

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('/admin/feedbacks');
      setFeedbacks(response.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  const fetchReactionCounts = async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}/reactions`);
      setReactionCounts(prev => ({ ...prev, [projectId]: response.data }));
    } catch (err) {
      console.error('Error fetching reaction counts:', err);
      // Set default values if fetch fails
      setReactionCounts(prev => ({ ...prev, [projectId]: { like: 0, dislike: 0 } }));
    }
  };

  const getProjectFeedbacks = (projectId) => {
    return feedbacks.filter(fb => fb.project_id === projectId);
  };

  const handleAddProject = async () => {
    if (!newProjectName || !newOwner || !newDeadline) return;

    // Validate deadline is not in the future
    if (!validateDateTime(newDeadline + 'T23:59')) {
      setToastMessage({
        type: 'error',
        message: '❌ Project deadline cannot be in the future',
        duration: 3000
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProjectName);
      formData.append('owner', newOwner);
      formData.append('deadline', newDeadline);
      formData.append('status', newStatus);
      // Add published default value (for UI only, backend should handle this in the future)
      formData.append('published', 'true');
      if (newPhoto) {
        formData.append('photo', newPhoto);
      }

      const response = await axios.post('/admin/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProjects([{...response.data, published: true, created_by_admin: true}, ...projects]);
      setNewProjectName('');
      setNewOwner('');
      setNewDeadline('');
      setNewStatus('Planned');
      setNewPhoto(null);
      setPhotoPreview('');
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add project');
      console.error('Error adding project:', err);
    }
  };

  const handleRecordProjectSubmit = async () => {
    // Validation
    if (!newProjectName.trim()) {
      setToastMessage({
        type: 'error',
        message: '❌ Project name is required',
        duration: 3000
      });
      return;
    }
    
    if (!newOwner.trim()) {
      setToastMessage({
        type: 'error',
        message: '❌ Project owner is required',
        duration: 3000
      });
      return;
    }
    
    if (!newDeadline) {
      setToastMessage({
        type: 'error',
        message: '❌ Project deadline is required',
        duration: 3000
      });
      return;
    }
    
    if (!newCompletedAt) {
      setToastMessage({
        type: 'error',
        message: '❌ Completion date and time is required',
        duration: 3000
      });
      return;
    }
    
    // Validate that completion date/time is not in the future
    if (!validateDateTime(newCompletedAt)) {
      setToastMessage({
        type: 'error',
        message: '❌ Completion date and time cannot be in the future',
        duration: 3000
      });
      return;
    }

    try {
      setToastMessage({
        type: 'loading',
        message: '📝 Creating project record...',
        duration: 0
      });

      const formData = new FormData();
      formData.append('name', newProjectName.trim());
      formData.append('owner', newOwner.trim());
      formData.append('deadline', newDeadline);
      formData.append('status', 'Completed');
      formData.append('published', 'false'); // Record projects are not published by default
      formData.append('remarks', newRemarks.trim());
      formData.append('completed_at', newCompletedAt);
      formData.append('created_by_admin', 'true'); // Mark as admin-created record
      
      // Add main photo if exists
      if (newPhoto) {
        formData.append('photo', newPhoto);
      }
      
      // Add multiple files for record project
      recordFiles.forEach((file, index) => {
        formData.append(`uploaded_files[${index}]`, file);
      });
      
      // Add file count
      formData.append('uploaded_files_count', recordFiles.length);

      const response = await axios.post('/admin/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProjects([{...response.data, published: false, created_by_admin: true}, ...projects]);
      
      // Reset form
      setNewProjectName('');
      setNewOwner('');
      setNewDeadline('');
      setNewStatus('Planned');
      setNewPhoto(null);
      setPhotoPreview('');
      setNewRemarks('');
      setNewCompletedAt('');
      setRecordFiles([]);
      setRecordFilePreviews([]);
      setShowRecordForm(false);
      setRecordingProject(null);
      
      setToastMessage({
        type: 'success',
        message: `📝 Project record created successfully with ${recordFiles.length} additional files!`,
        duration: 3000
      });
    } catch (err) {
      console.error('Error recording project:', err);
      setToastMessage({
        type: 'error',
        message: `❌ Failed to record project: ${err.response?.data?.message || err.message}`,
        duration: 4000
      });
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewOwner(project.owner);
    // Format deadline for date input (YYYY-MM-DD)
    const formattedDeadline = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '';
    setNewDeadline(formattedDeadline);
    setNewStatus(project.status);
    setNewPhoto(null);
    setPhotoPreview(project.photo ? `http://localhost:8000/${project.photo}` : '');
    
    // Set additional fields for Project Records
    setNewRemarks(project.remarks || '');
    setNewCompletedAt(project.completed_at ? new Date(project.completed_at).toISOString().slice(0, 16) : '');
    
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateProject = async () => {
    if (!newProjectName || !newOwner || !newDeadline) return;

    // Validate deadline is not in the future
    if (!validateDateTime(newDeadline + 'T23:59')) {
      setToastMessage({
        type: 'error',
        message: '❌ Project deadline cannot be in the future',
        duration: 3000
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProjectName);
      formData.append('owner', newOwner);
      formData.append('deadline', newDeadline);
      formData.append('status', newStatus);
      formData.append('_method', 'PUT'); // For Laravel to handle PUT request
      
      // Add additional fields for Project Records
      formData.append('remarks', newRemarks);
      if (newCompletedAt) {
        formData.append('completed_at', newCompletedAt);
      }
      
      if (newPhoto) {
        formData.append('photo', newPhoto);
      }

      const response = await axios.post(`/admin/projects/${editingProject.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProjects(projects.map(project => 
        project.id === editingProject.id ? {...response.data, created_by_admin: project.created_by_admin, created_by_staff: project.created_by_staff} : project
      ));
      
      // Reset form
      setNewProjectName('');
      setNewOwner('');
      setNewDeadline('');
      setNewStatus('Planned');
      setNewPhoto(null);
      setPhotoPreview('');
      setShowEditForm(false);
      setEditingProject(null);
    } catch (err) {
      setError('Failed to update project');
      console.error('Error updating project:', err);
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingProject(null);
    setNewProjectName('');
    setNewOwner('');
    setNewDeadline('');
    setNewStatus('Planned');
    setNewPhoto(null);
    setPhotoPreview('');
    
    // Reset additional fields
    setNewRemarks('');
    setNewCompletedAt('');
  };

  const cancelRecord = () => {
    setShowRecordForm(false);
    setRecordingProject(null);
    setNewProjectName('');
    setNewOwner('');
    setNewDeadline('');
    setNewStatus('Planned');
    setNewPhoto(null);
    setPhotoPreview('');
    
    // Reset additional fields
    setNewRemarks('');
    setNewCompletedAt('');
    setRecordFiles([]);
    setRecordFilePreviews([]);
    
    // Update max date/time for next use
    setMaxDateTimeForInput();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple file uploads for record project
  const handleRecordFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...recordFiles, ...files];
    setRecordFiles(newFiles);
    
    // Create previews for images
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordFilePreviews(prev => [...prev, {
            file,
            preview: reader.result,
            type: 'image'
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        setRecordFilePreviews(prev => [...prev, {
          file,
          preview: null,
          type: 'file',
          name: file.name,
          size: file.size
        }]);
      }
    });
  };

  // Remove file from record files
  const removeRecordFile = (index) => {
    const newFiles = recordFiles.filter((_, i) => i !== index);
    const newPreviews = recordFilePreviews.filter((_, i) => i !== index);
    setRecordFiles(newFiles);
    setRecordFilePreviews(newPreviews);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/admin/projects/${id}`);
        const updatedProjects = projects.filter((project) => project.id !== id);
        setProjects(updatedProjects);
      } catch (err) {
        setError('Failed to delete project');
        console.error('Error deleting project:', err);
      }
    }
  };

  const handleTogglePublish = (project) => {
    // For now, just toggle the published property in the UI
    setProjects(projects.map(p =>
      p.id === project.id ? { ...p, published: !p.published } : p
    ));
    // TODO: Implement backend logic to persist published status
  };

  const handleRefreshFeedbacks = async () => {
    await fetchFeedbacks();
  };

  const handleDownloadProjectRecordsPDF = async () => {
    if (activeTab !== 'records') return;
    
    setIsGeneratingPDF(true);
    try {
      // Get filtered projects for records tab
      const recordProjects = projects.filter(project => project.status === 'Completed');
      
      // Create PDF content
      const pdfContent = generateProjectRecordsPDF(recordProjects);
      
      // Create and download PDF
      const element = document.createElement('a');
      const file = new Blob([pdfContent], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `Project_Records_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setToastMessage({
        type: 'success',
        message: '📄 Project Records PDF generated successfully!',
        duration: 3000
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToastMessage({
        type: 'error',
        message: '❌ Failed to generate PDF',
        duration: 4000
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle project selection for recording
  const handleRecordProject = (project) => {
    // Set the project to be recorded
    setRecordingProject(project);
    
    // Update max date/time to current time
    setMaxDateTimeForInput();
    
    // Auto-fill the form with selected project data
    setNewProjectName(project.name);
    setNewOwner(project.owner);
    // Format deadline for date input (YYYY-MM-DD)
    const formattedDeadline = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '';
    setNewDeadline(formattedDeadline);
    setNewStatus('Completed'); // Set as completed for records
    setNewPhoto(null);
    setPhotoPreview(project.photo ? `http://localhost:8000/${project.photo}` : '');
    
    // Set additional fields for Project Records
    setNewRemarks(project.remarks || '');
    setNewCompletedAt(project.completed_at ? new Date(project.completed_at).toISOString().slice(0, 16) : '');
    
    // Open the record form (not the add form)
    setShowRecordForm(true);
    setShowRecordDropdown(false);
    
    setToastMessage({
      type: 'success',
      message: `📝 Project "${project.name}" selected for recording`,
      duration: 2000
    });
  };

  // Handle document viewing
  const handleViewDocument = (file) => {
    console.log('handleViewDocument called with file:', file);
    const fullFileUrl = `http://localhost:8000/${file.url}`;
    console.log('Full file URL:', fullFileUrl);
    console.log('File type:', file.type);
    
    setDocumentToView(file);
    
    if (file.type === 'application/pdf') {
      console.log('Detected PDF file');
      setDocumentType('pdf');
    } else if (file.type && file.type.includes('wordprocessingml')) {
      console.log('Detected DOCX file');
      setDocumentType('docx');
    } else {
      console.log('Other file type, opening in new tab');
      // For other file types, open in new tab
      window.open(fullFileUrl, '_blank');
      return;
    }
    
    console.log('Setting showDocumentViewer to true');
    setShowDocumentViewer(true);
  };

  const generateProjectRecordsPDF = (projects) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const completedCount = projects.length;
    const totalValue = projects.reduce((sum, project) => sum + (project.estimated_cost || 0), 0);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Records Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .summary {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        .summary h2 {
            color: #059669;
            margin-bottom: 20px;
            font-size: 22px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #10b981;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
        }
        .stat-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 5px;
        }
        .projects-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .table-header {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
        }
        .table-header h2 {
            margin: 0;
            font-size: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        tr:hover {
            background-color: #f9fafb;
        }
        .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-completed {
            background: #d1fae5;
            color: #065f46;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .no-projects {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Project Records Report</h1>
        <p>Generated on ${currentDate}</p>
    </div>

    <div class="summary">
        <h2>📊 Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${completedCount}</div>
                <div class="stat-label">Completed Projects</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${projects.length > 0 ? Math.round(100) : 0}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">₱${totalValue.toLocaleString()}</div>
                <div class="stat-label">Total Value</div>
            </div>
        </div>
    </div>

    <div class="projects-table">
        <div class="table-header">
            <h2>📁 Completed Project Records</h2>
        </div>
        ${projects.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Project Name</th>
                    <th>Owner/Team</th>
                    <th>Completion Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Files & Documents</th>
                </tr>
            </thead>
            <tbody>
                ${projects.map(project => `
                    <tr>
                        <td><strong>${project.name}</strong></td>
                        <td>${project.owner}</td>
                        <td>${project.completed_at ? new Date(project.completed_at).toLocaleDateString() : 'N/A'}</td>
                        <td><span class="status-badge status-completed">${project.status}</span></td>
                        <td>${project.remarks || 'No remarks'}</td>
                        <td>${project.uploaded_files && project.uploaded_files.length > 0 ? `${project.uploaded_files.length} file(s)` : 'No files'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : `
        <div class="no-projects">
            <h3>No completed projects found</h3>
            <p>There are currently no completed projects to display in the records.</p>
        </div>
        `}
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Barangay Management System</p>
        <p>For questions or concerns, please contact the Barangay Administration Office</p>
    </div>
</body>
</html>
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'In Progress':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'Planned':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <TrophyIcon className="w-4 h-4" />;
      case 'In Progress':
        return <RocketLaunchIcon className="w-4 h-4" />;
      case 'Planned':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
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

      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          
          {/* Enhanced Header with Animation */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-2xl mb-6 transform hover:scale-110 transition-all duration-300">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Project Management
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Comprehensive management system for barangay development projects with real-time tracking and status updates.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-2 rounded-full text-sm font-medium border border-blue-200">
                {projects.length} Total Projects
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-6 py-2 rounded-full text-sm font-medium border border-indigo-200">
                {projects.filter(p => p.published == true || p.published === 1).length} Posted
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-2 rounded-full text-sm font-medium border border-green-200">
                {projects.filter(p => p.status === 'Completed').length} Records
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl mb-6 flex items-center shadow-lg animate-bounce">
              <svg className="w-8 h-8 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">{error}</span>
            </div>
          )}


          {/* Enhanced Stats Cards with Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Projects</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">{projects.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Posted Projects</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
                    {projects.filter(p => p.published == true || p.published === 1).length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <PhotoIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Project Records</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-green-600 transition-all duration-300">
                    {projects.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <TrophyIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300">
                    {projects.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <CheckCircleIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Project Analytics
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value !== 'month') setSelectedMonth(0);
                    setSelectedYear('');
                  }}
                  className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-medium bg-white shadow-sm"
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
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-medium bg-white shadow-sm"
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
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-xl text-sm font-medium bg-white shadow-sm"
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
              {selectedPeriod === 'month' ? `Daily projects created in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly projects created in ${selectedYear || currentYear}` :
               'Projects created over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="projects" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4" />
                  Most Frequent Project Posted {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <p className="text-lg font-bold text-indigo-900">{getMostFrequentProject(selectedPeriod, selectedYear, selectedMonth).name || 'N/A'}</p>
                <p className="text-sm text-indigo-700">{getMostFrequentProject(selectedPeriod, selectedYear, selectedMonth).count} feedbacks</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <HandThumbUpIcon className="w-4 h-4" />
                  Total Reactions {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <HandThumbUpIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-bold text-blue-800">
                      {Object.values(reactionCounts).reduce((sum, counts) => sum + (counts?.like || 0), 0)} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HandThumbDownIcon className="w-4 h-4 text-red-600" />
                    <span className="text-lg font-bold text-red-800">
                      {Object.values(reactionCounts).reduce((sum, counts) => sum + (counts?.dislike || 0), 0)} Dislikes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white px-10 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <PlusIcon className="w-6 h-6" />
                {showAddForm ? 'Cancel' : 'Add New Project'}
              </button>

              <div className="flex gap-4 items-center w-full max-w-3xl">
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
                    className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-2xl text-base shadow-lg transition-all duration-300"
                    placeholder="Search projects by name or owner..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-4 text-gray-400" />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 rounded-2xl text-base font-medium shadow-lg transition-all duration-300 bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Add Form */}
          {showAddForm && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 p-8 mb-8 animate-slide-down">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
                  Create New Project
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-2 border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Project Name</label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Assigned Team / Owner</label>
                  <input
                    type="text"
                    placeholder="Enter team or owner name"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    max={maxDateTime.split('T')[0]} // Restrict to current date
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500">Cannot select future dates</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Enhanced Photo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Project Photo</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-2">Upload JPG, PNG, or GIF (max 2MB)</p>
                    </div>
                  </div>
                  {photoPreview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddProject}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Project
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Record Project Form */}
          {showRecordForm && (
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-3xl shadow-2xl border border-purple-200 p-8 mb-8 animate-slide-down">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <DocumentTextIcon className="w-8 h-8 mr-3 text-purple-600" />
                  Record Project: {recordingProject?.name}
                </h2>
                <button
                  onClick={cancelRecord}
                  className="flex items-center gap-2 border-2 border-purple-600 text-purple-700 hover:bg-purple-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl border border-purple-200">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800">Project Recording Guidelines</h4>
                    <p className="text-xs text-purple-700 mt-1">
                      This form is for recording completed projects as official records. The project will be marked as completed and stored in the project records.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Project Name</label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Assigned Team / Owner</label>
                  <input
                    type="text"
                    placeholder="Enter team or owner name"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Original Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Auto-filled from selected project</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                    disabled
                  >
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Record Keeping Details - Always shown for recording */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Record Keeping Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Date & Time Completed
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newCompletedAt}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewCompletedAt(value);
                        
                        // Real-time validation feedback
                        if (value && !validateDateTime(value)) {
                          e.target.setCustomValidity('Completion date and time cannot be in the future');
                        } else {
                          e.target.setCustomValidity('');
                        }
                      }}
                      max={maxDateTime}
                      className={`w-full border-2 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 transition-all duration-300 ${
                        newCompletedAt && !validateDateTime(newCompletedAt)
                          ? 'border-red-300 focus:ring-red-100 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-purple-100 focus:border-purple-500'
                      }`}
                      placeholder="Select completion date and time"
                      required
                    />
                    <p className="text-xs text-gray-500">When was this project officially completed?</p>
                    {newCompletedAt && !validateDateTime(newCompletedAt) && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Cannot select future date/time
                      </p>
                    )}
                    <p className="text-xs text-purple-600 font-medium">
                      Maximum allowed: {new Date(maxDateTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Completion Remarks
                    </label>
                    <input
                      type="text"
                      value={newRemarks}
                      onChange={(e) => setNewRemarks(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                      placeholder="Enter completion notes or remarks"
                    />
                    <p className="text-xs text-gray-500">Additional notes about project completion</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Photo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Main Project Photo</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-2">Upload JPG, PNG, or GIF (max 2MB)</p>
                    </div>
                  </div>
                  {photoPreview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Multiple Files Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Additional Files & Documents
                  <span className="text-gray-500 font-normal ml-2">(Images, PDFs, Documents, etc.)</span>
                </label>
                
                {/* File Upload Area */}
                <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={handleRecordFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="record-files-upload"
                  />
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-purple-700 mb-2">Click to upload multiple files</p>
                    <p className="text-sm text-purple-600 mb-4">
                      Images, PDFs, Documents, Spreadsheets, Archives
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Max file size: 10MB per file
                    </p>
                    
                    {/* Fallback Button */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('record-files-upload').click()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Choose Files
                    </button>
                  </div>
                </div>

                {/* File Previews */}
                {recordFilePreviews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Selected Files ({recordFilePreviews.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recordFilePreviews.map((filePreview, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-3">
                            {/* File Icon/Preview */}
                            <div className="flex-shrink-0">
                              {filePreview.type === 'image' ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={filePreview.preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {filePreview.type === 'file' ? filePreview.name : `Image ${index + 1}`}
                              </p>
                              {filePreview.type === 'file' && (
                                <p className="text-xs text-gray-500">
                                  {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              )}
                              <p className="text-xs text-purple-600 font-medium">
                                {filePreview.type === 'image' ? 'Image' : 'Document'}
                              </p>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeRecordFile(index)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                              title="Remove file"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Record Project button clicked');
                    console.log('Form data:', {
                      name: newProjectName,
                      owner: newOwner,
                      deadline: newDeadline,
                      completedAt: newCompletedAt,
                      remarks: newRemarks,
                      files: recordFiles.length
                    });
                    handleRecordProjectSubmit();
                  }}
                  type="button"
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Record Project
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Edit Form */}
          {showEditForm && (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-2xl border border-green-200 p-8 mb-8 animate-slide-down">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <PencilIcon className="w-8 h-8 mr-3 text-green-600" />
                  Edit Project: {editingProject?.name}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Project Name</label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Assigned Team / Owner</label>
                  <input
                    type="text"
                    placeholder="Enter team or owner name"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    max={maxDateTime.split('T')[0]} // Restrict to current date
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500">Cannot select future dates</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Additional Fields for Project Records - Only show when editing */}
              {activeTab === 'records' && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Record Keeping Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Date & Time Completed
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={newCompletedAt}
                        onChange={(e) => setNewCompletedAt(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                        placeholder="Select completion date and time"
                      />
                      <p className="text-xs text-gray-500">When was this project officially completed?</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Completion Remarks
                      </label>
                      <input
                        type="text"
                        value={newRemarks}
                        onChange={(e) => setNewRemarks(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                        placeholder="Enter completion notes or remarks"
                      />
                      <p className="text-xs text-gray-500">Additional notes about project completion</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800">Record Keeping Guidelines</h4>
                        <p className="text-xs text-blue-700 mt-1">
                          These fields are specifically for administrative record keeping and will help maintain accurate project completion records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Photo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Project Photo</label>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-green-500 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500 mt-2">Upload JPG, PNG, or GIF (max 2MB) - Leave empty to keep current photo</p>
                    </div>
                  </div>
                  {photoPreview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateProject}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-teal-600 hover:to-green-600 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Update Project
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Projects Table */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className={`px-8 py-6 ${
              activeTab === 'posted' 
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' 
                : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold text-xl flex items-center gap-3">
                    {activeTab === 'posted' ? (
                      <>
                        <PhotoIcon className="w-6 h-6" />
                        Posted Projects
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="w-6 h-6" />
                        Project Records
                      </>
                    )}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {activeTab === 'posted' 
                      ? 'Projects published and visible to residents'
                      : 'Completed projects and admin/staff created projects'
                    }
                  </p>
                </div>
                
                {/* Action Buttons - Only show for Project Records tab */}
                {activeTab === 'records' && (
                  <div className="flex gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowRecordDropdown(!showRecordDropdown)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 bg-white/20 hover:bg-white/30 text-white hover:shadow-lg"
                        title="Record a project from completed projects"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Record a Project
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showRecordDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                          <div className="p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <DocumentTextIcon className="w-5 h-5 text-green-600" />
                              Select Completed Project
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">Choose a completed project to record</p>
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto">
                            {projects.filter(p => p.status === 'Completed').length === 0 ? (
                              <div className="p-6 text-center text-gray-500">
                                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No completed projects found</p>
                                <p className="text-sm">Complete some projects first to record them</p>
                              </div>
                            ) : (
                              projects
                                .filter(p => p.status === 'Completed')
                                .map(project => (
                                  <button
                                    key={project.id}
                                    onClick={() => handleRecordProject(project)}
                                    className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <DocumentTextIcon className="w-5 h-5 text-green-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                                        <p className="text-sm text-gray-600 truncate">Owner: {project.owner}</p>
                                        <p className="text-xs text-gray-500">
                                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                                        </p>
                                        {project.completed_at && (
                                          <p className="text-xs text-green-600 font-medium">
                                            Completed: {new Date(project.completed_at).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Completed
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))
                            )}
                          </div>
                          
                          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                            <button
                              onClick={() => {
                                setShowAddForm(true);
                                setShowRecordDropdown(false);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Create New Project Instead
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleDownloadProjectRecordsPDF}
                      disabled={isGeneratingPDF || filteredProjects.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isGeneratingPDF || filteredProjects.length === 0
                          ? 'bg-white/20 text-white/50 cursor-not-allowed'
                          : 'bg-white/20 hover:bg-white/30 text-white hover:shadow-lg'
                      }`}
                      title={filteredProjects.length === 0 ? 'No completed projects to download' : 'Download Project Records as PDF'}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Tab Navigation Separator */}
            <div className="mt-8 mb-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mx-6">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('posted')}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'posted'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border-2 border-blue-300'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeTab === 'posted' 
                          ? 'bg-white/20' 
                          : 'bg-blue-100'
                      }`}>
                        <PhotoIcon className={`w-5 h-5 ${
                          activeTab === 'posted' ? 'text-white' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">Posted Projects</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          activeTab === 'posted'
                            ? 'bg-white/30 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {projects.filter(p => p.published == true || p.published === 1).length}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'records'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-2 border-green-300'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeTab === 'records' 
                          ? 'bg-white/20' 
                          : 'bg-green-100'
                      }`}>
                        <DocumentTextIcon className={`w-5 h-5 ${
                          activeTab === 'records' ? 'text-white' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">Project Records</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          activeTab === 'records'
                            ? 'bg-white/30 text-white'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {projects.filter(p => p.status === 'Completed').length}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-6 text-left font-bold text-gray-700">Project Name</th>
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Owner</th>
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Deadline</th>
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Status</th>
                    {activeTab === 'records' && (
                      <>
                        <th className="px-6 py-6 text-left font-bold text-gray-700">Completed At</th>
                        <th className="px-6 py-6 text-left font-bold text-gray-700">Remarks</th>
                        <th className="px-6 py-6 text-left font-bold text-gray-700">Files & Documents</th>
                      </>
                    )}
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Reactions</th>
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Feedback</th>
                    <th className="px-6 py-6 text-left font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={activeTab === 'records' ? "10" : "7"} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 font-semibold text-lg">Loading projects...</p>
                          <p className="text-gray-400">Please wait while we fetch your data</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === 'records' ? "10" : "7"} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-semibold text-lg">No {activeTab === 'posted' ? 'posted projects' : 'project records'} found</p>
                          <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project, index) => {
                      const projectFeedbacks = getProjectFeedbacks(project.id);
                      return (
                        <tr
                          key={project.id}
                          className={`transition-all duration-300 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50`}
                        >
                          <td className="px-6 py-6">
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-lg">
                              {project.name}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <UserGroupIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-gray-700 font-medium">{project.owner}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
                                {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md border-2 border-white ${
                              project.status === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                              project.status === 'In Progress' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                              'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          
                          {/* Additional columns for Project Records */}
                          {activeTab === 'records' && (
                            <>
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
                                    {project.completed_at ? new Date(project.completed_at).toLocaleString() : 'Not set'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="max-w-xs">
                                  <span className="text-gray-700 text-sm">
                                    {project.remarks || 'No remarks'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-2">
                                  {project.uploaded_files && project.uploaded_files.length > 0 ? (
                                    <button
                                      onClick={() => {
                                        console.log('Files button clicked for project:', project.name);
                                        console.log('Project uploaded_files:', project.uploaded_files);
                                        setSelectedProject(project);
                                        setViewingFilesForProject(project);
                                      }}
                                      className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 px-3 py-2 rounded-full border border-blue-200 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                                      title="Click to view files"
                                    >
                                      <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span className="text-blue-800 font-bold text-sm group-hover:text-blue-900">
                                        {project.uploaded_files.length} file{project.uploaded_files.length !== 1 ? 's' : ''}
                                      </span>
                                      <svg className="w-3 h-3 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                  ) : (
                                    <span className="text-gray-400 text-sm italic">No files</span>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-full border border-blue-200">
                                <HandThumbUpIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-800 font-bold text-sm">
                                  {reactionCounts[project.id]?.like || 0}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 bg-gradient-to-r from-red-100 to-rose-100 px-3 py-2 rounded-full border border-red-200">
                                <HandThumbDownIcon className="w-4 h-4 text-red-600" />
                                <span className="text-red-800 font-bold text-sm">
                                  {reactionCounts[project.id]?.dislike || 0}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 relative">
                            <button
                              className="relative bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold hover:from-blue-200 hover:to-indigo-200 focus:outline-none shadow-md transition-all duration-300 transform hover:scale-105"
                              onClick={() => setOpenFeedbackProjectId(openFeedbackProjectId === project.id ? null : project.id)}
                              title="View feedback"
                            >
                              <span className="font-bold">{projectFeedbacks.length}</span> Feedback
                            </button>
                            {openFeedbackProjectId === project.id && (
                              <div className="absolute left-0 mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <span className="font-bold text-gray-800 text-lg">Feedback</span>
                                  <div className="flex gap-2">
                                    <button
                                      className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
                                      onClick={handleRefreshFeedbacks}
                                      title="Refresh Feedback"
                                    >
                                      Refresh
                                    </button>
                                    <button
                                      className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md"
                                      onClick={() => setShowAllFeedbackProjectId(project.id)}
                                      title="View All Feedback"
                                    >
                                      View All
                                    </button>
                                    <button
                                      className="text-gray-400 hover:text-gray-700 text-lg font-bold ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                      onClick={() => setOpenFeedbackProjectId(null)}
                                      title="Close"
                                    >×</button>
                                  </div>
                                </div>
                                {projectFeedbacks.length === 0 ? (
                                  <div className="text-gray-400 text-sm text-center py-4">No feedback yet.</div>
                                ) : (
                                  <ul className="max-h-48 overflow-y-auto space-y-3">
                                    {projectFeedbacks.slice(0, 5).map(fb => (
                                      <li key={fb.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md">
                                          {fb.user?.name?.[0] || 'R'}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-bold text-green-700 text-sm">{fb.user?.name || 'Resident'}</div>
                                          <div className="text-gray-700 text-sm">{fb.subject}</div>
                                          <div className="text-gray-500 italic text-xs">{fb.message}</div>
                                          <div className="text-gray-400 text-xs mt-1">{new Date(fb.created_at).toLocaleString()}</div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </td>
                          {/* All Feedback Modal */}
                          {showAllFeedbackProjectId === project.id && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-lg w-full max-h-[90vh] overflow-hidden animate-fadeIn flex flex-col">
                                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                                  <h2 className="text-lg font-bold text-gray-800">All Feedback for {project.name}</h2>
                                  <button
                                    onClick={() => setShowAllFeedbackProjectId(null)}
                                    className="p-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors hover:bg-gray-100"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="overflow-y-auto p-6 space-y-4">
                                  {projectFeedbacks.length === 0 ? (
                                    <div className="text-gray-400 text-sm text-center">No feedback yet.</div>
                                  ) : (
                                    projectFeedbacks.map(fb => (
                                      <div key={fb.id} className="flex items-start gap-4 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-4 border border-gray-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                                          {fb.user?.name?.[0] || 'R'}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-base font-bold text-gray-900">{fb.user?.name || 'Resident'}</div>
                                          <div className="text-sm text-gray-700 whitespace-pre-line mt-1">{fb.message}</div>
                                          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(fb.created_at).toLocaleString()}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <td className="px-6 py-6">
                            <div className="flex gap-3">
                              <button
                                onClick={() => setSelectedProject(project)}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                title="View Project"
                              >
                                <EyeIcon className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(project)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                title="Edit Project"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Edit
                              </button>
                              {activeTab === 'records' && (
                                <button
                                  onClick={() => handleDownloadProjectRecordsPDF()}
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                  title="Download Project Record as PDF"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  PDF
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                                title="Delete Project"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                              </button>
                              <button
                                onClick={() => handleTogglePublish(project)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${project.published ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'}`}
                                title={project.published ? 'Hide Project' : 'Publish Project'}
                              >
                                {project.published ? 'Hide' : 'Publish'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Files Viewer Modal */}
      {viewingFilesForProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Uploaded Files</h2>
                  <p className="text-blue-100">Project: {viewingFilesForProject.name}</p>
                </div>
                <button
                  onClick={() => setViewingFilesForProject(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Files Grid */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {viewingFilesForProject.uploaded_files && viewingFilesForProject.uploaded_files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {viewingFilesForProject.uploaded_files.map((file, index) => {
                    // Create full URL for file access
                    const fullFileUrl = `http://localhost:8000/${file.url}`;
                    console.log('File URL constructed in viewer:', fullFileUrl, 'Original file.url:', file.url);
                    
                    // Get user-friendly file type
                    const getFileTypeDisplay = (mimeType) => {
                      if (!mimeType) return 'Unknown type';
                      if (mimeType.startsWith('image/')) return 'Image';
                      if (mimeType.includes('pdf')) return 'PDF Document';
                      if (mimeType.includes('wordprocessingml')) return 'Word Document';
                      if (mimeType.includes('spreadsheetml')) return 'Excel Spreadsheet';
                      if (mimeType.includes('presentationml')) return 'PowerPoint Presentation';
                      if (mimeType.includes('text/')) return 'Text Document';
                      if (mimeType.includes('zip')) return 'ZIP Archive';
                      if (mimeType.includes('rar')) return 'RAR Archive';
                      return mimeType.split('/')[1]?.toUpperCase() || 'Document';
                    };

                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={() => handleViewDocument(file)}>
                        <div className="text-center">
                          <div className="mb-3">
                            {file.type && file.type.startsWith('image/') ? (
                              <img 
                                src={fullFileUrl} 
                                alt={file.name}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 mx-auto group-hover:border-blue-400 transition-colors duration-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-20 h-20 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mx-auto transition-colors duration-200 ${file.type && file.type.startsWith('image/') ? 'hidden' : ''}`}>
                              <DocumentIcon className="w-10 h-10 text-blue-600 group-hover:text-blue-700" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate" title={file.name}>
                            {file.name}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-500">
                            <p>{file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}</p>
                            <p className="truncate" title={file.type || 'Unknown type'}>{getFileTypeDisplay(file.type)}</p>
                          </div>
                            <div className="mt-3 flex items-center justify-center gap-1 text-blue-500">
                              {file.type === 'application/pdf' ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span className="text-xs font-medium">Click to view</span>
                                </>
                              ) : file.type && file.type.includes('wordprocessingml') ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span className="text-xs font-medium">Click to view</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  <span className="text-xs font-medium">Click to open</span>
                                </>
                              )}
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No files uploaded</h3>
                  <p className="text-gray-500">This project doesn't have any additional files.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {viewingFilesForProject.uploaded_files?.length || 0} file{(viewingFilesForProject.uploaded_files?.length || 0) !== 1 ? 's' : ''} total
                </div>
                <button
                  onClick={() => setViewingFilesForProject(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">PDF Viewer</h2>
                <p className="text-blue-100 text-sm">Viewing PDF document</p>
              </div>
              <button
                onClick={() => {
                  setShowPdfViewer(false);
                  setPdfUrlToView('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-grow p-4">
              <iframe
                src={pdfUrlToView}
                className="w-full h-full border-0 rounded-lg shadow-lg"
                title="PDF Viewer"
                style={{ minHeight: '500px' }}
              >
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">PDF Viewer Not Supported</h3>
                    <p className="text-gray-500 mb-4">Your browser doesn't support embedded PDF viewing.</p>
                    <a 
                      href={pdfUrlToView} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              </iframe>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-3xl border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">PDF Document</span> • Click and drag to navigate
              </div>
              <div className="flex gap-3">
                <a 
                  href={pdfUrlToView} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowPdfViewer(false);
                    setPdfUrlToView('');
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && documentToView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Document Viewer</h2>
                <p className="text-blue-100 text-sm">{documentToView.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowDocumentViewer(false);
                  setDocumentToView(null);
                  setDocumentType('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-grow p-4">
              {documentType === 'pdf' ? (
                <iframe
                  src={`http://localhost:8000/${documentToView.url}`}
                  className="w-full h-full border-0 rounded-lg shadow-lg"
                  title="PDF Viewer"
                  style={{ minHeight: '600px' }}
                >
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">PDF Viewer Not Supported</h3>
                      <p className="text-gray-500 mb-4">Your browser doesn't support embedded PDF viewing.</p>
                      <a 
                        href={`http://localhost:8000/${documentToView.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                  </div>
                </iframe>
              ) : documentType === 'docx' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Word Document</h3>
                    <p className="text-gray-600 mb-6">
                      This is a Microsoft Word document. Click the button below to download and view it in your default application.
                    </p>
                    <div className="space-y-3">
                      <a 
                        href={`http://localhost:8000/${documentToView.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download & Open Document
                      </a>
                      <p className="text-sm text-gray-500">
                        File size: {documentToView.size ? `${(documentToView.size / 1024).toFixed(1)} KB` : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentIcon className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Unsupported File Type</h3>
                    <p className="text-gray-500 mb-4">This file type cannot be previewed in the browser.</p>
                    <a 
                      href={`http://localhost:8000/${documentToView.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {documentType === 'pdf' ? 'PDF Document' : 
                   documentType === 'docx' ? 'Word Document' : 
                   'Document'}
                </span> • {documentToView.size ? `${(documentToView.size / 1024).toFixed(1)} KB` : 'Unknown size'}
              </div>
              <div className="flex gap-3">
                <a 
                  href={`http://localhost:8000/${documentToView.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowDocumentViewer(false);
                    setDocumentToView(null);
                    setDocumentType('');
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add a modal for viewing project details, including the photo */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-2xl border border-green-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{selectedProject.name}</h2>
                  <div className="flex items-center gap-4 text-green-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedProject.status === 'Completed' ? 'bg-green-300' :
                        selectedProject.status === 'In Progress' ? 'bg-yellow-300' :
                        'bg-blue-300'
                      }`}></div>
                      <span className="text-sm font-medium">{selectedProject.status}</span>
                    </div>
                    {selectedProject.published && (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <PhotoIcon className="w-3 h-3" />
                        <span className="text-xs">Published</span>
                      </div>
                    )}
                    {selectedProject.created_by_admin && (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Admin Record</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Image */}
              {selectedProject.photo && (
                <div className="flex justify-center">
                  <img
                    src={`http://localhost:8000/${selectedProject.photo}`}
                    alt="Project"
                    className="rounded-xl object-cover shadow-lg max-h-64 w-full"
                    onError={e => { e.target.onerror = null; e.target.src = '/default-project.png'; }}
                  />
                </div>
              )}

              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Owner */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <UserGroupIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-700">Project Owner</span>
                  </div>
                  <p className="text-gray-900 text-lg">{selectedProject.owner}</p>
                </div>

                {/* Original Deadline */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">Original Deadline</span>
                  </div>
                  <p className="text-gray-900 text-lg">
                    {selectedProject.deadline
                      ? new Date(selectedProject.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not set'}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedProject.status === 'Completed' ? 'bg-green-500' :
                      selectedProject.status === 'In Progress' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {getStatusIcon(selectedProject.status)}
                    </div>
                    <span className="font-semibold text-gray-700">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProject.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedProject.status}
                  </span>
                </div>

                {/* Created Date */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-700">Created</span>
                  </div>
                  <p className="text-gray-900 text-sm">
                    {selectedProject.created_at
                      ? new Date(selectedProject.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Project Records Specific Information */}
              {activeTab === 'records' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" />
                    Record Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Completion Date */}
                    {selectedProject.completed_at && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-gray-700 text-sm">Completed At</span>
                        </div>
                        <p className="text-gray-900">
                          {new Date(selectedProject.completed_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Remarks */}
                    {selectedProject.remarks && (
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-semibold text-gray-700 text-sm">Completion Remarks</span>
                        </div>
                        <p className="text-gray-900 text-sm">{selectedProject.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Uploaded Files - Only show for Project Records */}
              {activeTab === 'records' && selectedProject.uploaded_files && selectedProject.uploaded_files.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <DocumentIcon className="w-5 h-5" />
                    Uploaded Files
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedProject.uploaded_files.map((file, index) => {
                      // Create full URL for file access
                      const fullFileUrl = `http://localhost:8000/${file.url}`;
                      console.log('File URL constructed:', fullFileUrl, 'Original file.url:', file.url);
                      
                      // Get user-friendly file type
                      const getFileTypeDisplay = (mimeType) => {
                        if (!mimeType) return 'Unknown type';
                        if (mimeType.startsWith('image/')) return 'Image';
                        if (mimeType.includes('pdf')) return 'PDF Document';
                        if (mimeType.includes('wordprocessingml')) return 'Word Document';
                        if (mimeType.includes('spreadsheetml')) return 'Excel Spreadsheet';
                        if (mimeType.includes('presentationml')) return 'PowerPoint Presentation';
                        if (mimeType.includes('text/')) return 'Text Document';
                        if (mimeType.includes('zip')) return 'ZIP Archive';
                        if (mimeType.includes('rar')) return 'RAR Archive';
                        return mimeType.split('/')[1]?.toUpperCase() || 'Document';
                      };

                      return (
                        <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-105 group cursor-pointer" onClick={() => handleViewDocument(file)}>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {file.type && file.type.startsWith('image/') ? (
                                <img 
                                  src={fullFileUrl} 
                                  alt={file.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-blue-200 group-hover:border-blue-400 transition-colors duration-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors duration-200 ${file.type && file.type.startsWith('image/') ? 'hidden' : ''}`}>
                                <DocumentIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-blue-900 group-hover:text-blue-700 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate" title={file.type || 'Unknown type'}>
                                {getFileTypeDisplay(file.type)}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                {file.type === 'application/pdf' ? (
                                  <>
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-xs text-blue-500 font-medium">Click to view</span>
                                  </>
                                ) : file.type && file.type.includes('wordprocessingml') ? (
                                  <>
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-xs text-blue-500 font-medium">Click to view</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span className="text-xs text-blue-500 font-medium">Click to open</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      {selectedProject.uploaded_files.length} file{selectedProject.uploaded_files.length !== 1 ? 's' : ''} uploaded
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProject.description && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                </div>
              )}

              {/* Reactions and Feedback */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <HandThumbUpIcon className="w-5 h-5 text-blue-600" />
                  Community Engagement
                </h3>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border border-blue-200">
                    <HandThumbUpIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-bold">
                      {reactionCounts[selectedProject.id]?.like || 0} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 px-4 py-2 rounded-full border border-red-200">
                    <HandThumbDownIcon className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 font-bold">
                      {reactionCounts[selectedProject.id]?.dislike || 0} Dislikes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-green-800 font-bold">
                      {getProjectFeedbacks(selectedProject.id).length} Feedback
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Metadata */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Project Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Project ID:</span>
                    <span className="ml-2 font-mono text-gray-900">#{selectedProject.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Visibility:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProject.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProject.published ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Record Type:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedProject.created_by_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedProject.created_by_admin ? 'Admin Record' : 'User Created'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    handleEdit(selectedProject);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectManagement;