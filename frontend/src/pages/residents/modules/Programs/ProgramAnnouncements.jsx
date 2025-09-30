import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';
import axios from '../../../../utils/axiosConfig';

const ProgramAnnouncements = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const programId = searchParams.get('program');
  
  console.log('ProgramAnnouncements: Component loaded with programId:', programId);
  console.log('ProgramAnnouncements: Current URL:', window.location.href);
  console.log('ProgramAnnouncements: Component is rendering...');
  
  const [program, setProgram] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [applicationForms, setApplicationForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programError, setProgramError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [programId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('ProgramAnnouncements: Starting fetchData with programId:', programId);
      
      if (programId) {
        console.log('ProgramAnnouncements: Fetching program details for ID:', programId);
        // Fetch specific program details (only if it's not a draft)
        const programRes = await axios.get(`/programs/${programId}`);
        console.log('ProgramAnnouncements: Program response:', programRes.data);
        const program = programRes.data;
        
        // Only show the program if it's not in draft status
        if (program.status === 'draft') {
          console.log('ProgramAnnouncements: Program is in draft status, setting error');
          setProgram(null);
          setProgramError('This program is not available for viewing.');
          return;
        }
        
        setProgram(program);
        console.log('ProgramAnnouncements: Program set successfully');
        
        // Fetch announcements for this specific program
        console.log('ProgramAnnouncements: Fetching announcements for program:', programId);
        const announcementsRes = await axios.get(`/program-announcements?program_id=${programId}`);
        console.log('ProgramAnnouncements: Announcements response:', announcementsRes.data);
        setAnnouncements(announcementsRes.data.success ? announcementsRes.data.data : []);
        
        // Fetch application forms for this specific program
        console.log('ProgramAnnouncements: Fetching forms for program:', programId);
        const formsRes = await axios.get(`/program-application-forms?program_id=${programId}`);
        console.log('ProgramAnnouncements: Forms response:', formsRes.data);
        setApplicationForms(formsRes.data.success ? formsRes.data.data : []);
      } else {
        console.log('ProgramAnnouncements: No programId, fetching all data');
        // Fetch all announcements and forms (fallback)
        const announcementsRes = await axios.get('/program-announcements/residents/dashboard');
        setAnnouncements(announcementsRes.data.success ? announcementsRes.data.data : []);

        const formsRes = await axios.get('/program-application-forms/published');
        setApplicationForms(formsRes.data.success ? formsRes.data.data : []);
      }
    } catch (error) {
      console.error('ProgramAnnouncements: Error fetching data:', error);
      console.error('ProgramAnnouncements: Error response:', error.response);
      console.error('ProgramAnnouncements: Error status:', error.response?.status);
      console.error('ProgramAnnouncements: Error message:', error.message);
      setProgramError('Failed to load program details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForm) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      selectedForm.fields.forEach(field => {
        const value = formData[field.field_name];
        if (field.field_type === 'file' && value instanceof File) {
          formDataToSend.append(field.field_name, value);
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(field.field_name, value);
        }
      });

      const response = await fetch(`/api/program-application-forms/${selectedForm.id}/submit`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedForm(null);
        setFormData({});
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleFileChange = (fieldName, file) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const openApplicationForm = (form) => {
    setSelectedForm(form);
    setFormData({});
    setShowApplicationModal(true);
  };

  const handleBackToDashboard = () => {
    navigate('/residents/dashboard');
  };

  const renderFormField = (field) => {
    const value = formData[field.field_name] || '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.field_type}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required={field.is_required}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
            required={field.is_required}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required={field.is_required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            required={field.is_required}
          >
            <option value="">Select an option...</option>
            {field.field_options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {field.field_options?.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleInputChange(field.field_name, newValues);
                  }}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                />
                <span className="text-base text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                onChange={(e) => handleFileChange(field.field_name, e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                required={field.is_required}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 font-medium">
                📎 Supported formats: PDF, DOC, DOCX, JPG, PNG • Max size: 5MB
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-20 px-6 pb-16 font-sans">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Loading Program Details</h3>
              <p className="text-gray-600">Please wait while we fetch the latest information...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (programError) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className="bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 min-h-screen ml-64 pt-20 px-6 pb-16 font-sans">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">🚫</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Program Not Available</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">{programError}</p>
              <button
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-20 px-6 pb-16 font-sans overflow-x-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-200/20 via-indigo-100/15 to-purple-200/10 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto space-y-12 z-10">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/60 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                {program ? `${program.name}` : 'Program Announcements'}
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {program ? 'View program details, announcements, and submit applications' : 'Stay updated with the latest program announcements and submit applications'}
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>

          {/* Program Details Section (only when specific program is selected) */}
          {program && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Program Information</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{program.name}</h3>
                      <p className="text-gray-700 leading-relaxed text-lg">{program.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-gray-600 font-semibold">Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {program.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-gray-600 font-semibold">Beneficiary Type:</span>
                        <span className="text-gray-800 font-medium">{program.beneficiary_type || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-gray-600 font-semibold">Assistance Type:</span>
                        <span className="text-gray-800 font-medium">{program.assistance_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-gray-600 font-semibold">Amount:</span>
                        <span className="text-green-600 font-bold text-lg">₱{program.amount ? program.amount.toLocaleString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <span className="text-gray-600 font-semibold">Max Beneficiaries:</span>
                        <span className="text-gray-800 font-medium">{program.max_beneficiaries || 'Unlimited'}</span>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <span className="text-gray-600 font-semibold">Duration:</span>
                        <span className="text-gray-800 font-medium">
                          {program.start_date && program.end_date 
                            ? `${new Date(program.start_date).toLocaleDateString()} - ${new Date(program.end_date).toLocaleDateString()}`
                            : 'Ongoing'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Program Highlights
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-emerald-100">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 text-xl">🎯</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Target Audience</p>
                          <p className="text-xs text-gray-600">{program.beneficiary_type || 'All residents'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-emerald-100">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-xl">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Financial Support</p>
                          <p className="text-xs text-gray-600">₱{program.amount ? program.amount.toLocaleString() : 'TBD'} per beneficiary</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-emerald-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-xl">📋</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Application Required</p>
                          <p className="text-xs text-gray-600">Complete the form below to apply</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Announcements */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📢</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Latest Announcements</h2>
              </div>
            </div>
            <div className="p-8">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Announcements</h3>
                  <p className="text-gray-500">Check back later for updates from your barangay officials.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {announcements.map((announcement, index) => (
                    <article
                      key={announcement.id}
                      className={`group bg-white border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                        announcement.is_urgent 
                          ? 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50 hover:border-red-300' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              announcement.is_urgent 
                                ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                              <span className="text-white text-lg">
                                {announcement.is_urgent ? '🚨' : '📢'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                {announcement.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    announcement.is_urgent ? 'bg-red-400' : 'bg-blue-400'
                                  }`}></span>
                                  <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    announcement.is_urgent ? 'bg-pink-400' : 'bg-indigo-400'
                                  }`}></span>
                                  <span>{new Date(announcement.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {announcement.is_urgent && (
                                  <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
                                    URGENT
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4 text-base">{announcement.content}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-sm">🏛️</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 block">Barangay Official</span>
                            <span className="text-xs text-gray-500">Government Authority</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            announcement.is_urgent ? 'bg-red-400' : 'bg-green-400'
                          }`}></div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            announcement.is_urgent 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {announcement.is_urgent ? 'Urgent' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Forms */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📝</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Available Application Forms</h2>
              </div>
            </div>
            <div className="p-8">
              {applicationForms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Application Forms</h3>
                  <p className="text-gray-500">Check back later for available application forms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applicationForms.map((form, index) => (
                    <div 
                      key={form.id} 
                      className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white text-lg">📋</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                {form.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                  <span>{form.fields?.length || 0} fields</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                  <span>{form.deadline ? new Date(form.deadline).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4 text-sm line-clamp-3">{form.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Fields Required:</span>
                          <span className="font-medium text-gray-700">{form.fields?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Deadline:</span>
                          <span className="font-semibold text-purple-600">
                            {form.deadline ? new Date(form.deadline).toLocaleDateString() : 'No deadline'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-sm">📝</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600 block">Application Form</span>
                            <span className="text-xs text-gray-500">Click to apply</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openApplicationForm(form)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationModal && selectedForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">📝</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedForm.title}</h3>
                      <p className="text-purple-100">Complete the form below to apply</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setSelectedForm(null);
                      setFormData({});
                    }}
                    className="text-white hover:text-purple-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={handleFormSubmit} className="space-y-8">
                  {selectedForm.fields?.map((field, index) => (
                    <div key={field.id} className="space-y-3">
                      <label className="block text-lg font-bold text-gray-800">
                        {field.field_label}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.field_description && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {field.field_description}
                        </p>
                      )}
                      <div className="mt-2">
                        {renderFormField(field)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplicationModal(false);
                        setSelectedForm(null);
                        setFormData({});
                      }}
                      className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ProgramAnnouncements;
