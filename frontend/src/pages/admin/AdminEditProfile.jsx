import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCamera, FaSave, 
  FaSpinner, FaCheckCircle, FaExclamationTriangle, FaIdCard, FaBuilding, 
  FaLinkedin, FaTwitter, FaGithub, FaGlobe, FaUserCheck, FaShieldAlt,
  FaEdit, FaTimes, FaPlus, FaMinus, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const AdminEditProfile = () => {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({ 
    name: '', email: '', avatar: '', phone: '', address: '', position: '',
    department: '', employeeId: '', bio: '', linkedin: '', twitter: '', github: '', website: '',
    emergencyContact: '', emergencyPhone: '', certifications: []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [newCertification, setNewCertification] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      console.log('AdminEditProfile user data:', user);
      const initialForm = {
        name: user.name || user.profile?.name || '',
        email: user.email || user.profile?.email || '',
        avatar: user.avatar || user.profile?.avatar || '',
        phone: user.phone || user.profile?.phone || '',
        address: user.address || user.profile?.address || '',
        position: user.position || user.profile?.position || '',
        department: user.department || user.profile?.department || '',
        employeeId: user.employeeId || user.profile?.employeeId || '',
        bio: user.bio || user.profile?.bio || '',
        linkedin: user.linkedin || user.profile?.linkedin || '',
        twitter: user.twitter || user.profile?.twitter || '',
        github: user.github || user.profile?.github || '',
        website: user.website || user.profile?.website || '',
        emergencyContact: user.emergencyContact || user.profile?.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || user.profile?.emergencyPhone || '',
        certifications: user.certifications || user.profile?.certifications || [],
      };
      setForm(initialForm);
      setAvatarPreview(user.avatar || user.profile?.avatar || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg');
      setHasChanges(false);
      calculateProfileCompletion(initialForm);
    }
  }, [user]);

  const calculateProfileCompletion = (formData) => {
    const requiredFields = ['name', 'email', 'phone', 'position', 'department'];
    const optionalFields = ['address', 'bio', 'linkedin', 'emergencyContact'];
    
    const requiredCompleted = requiredFields.filter(field => formData[field] && formData[field].trim() !== '').length;
    const optionalCompleted = optionalFields.filter(field => formData[field] && formData[field].trim() !== '').length;
    
    const completion = Math.round(((requiredCompleted / requiredFields.length) * 0.7 + (optionalCompleted / optionalFields.length) * 0.3) * 100);
    setProfileCompletion(completion);
  };

  const validatePhoneNumber = (phone) => {
    // Philippine phone number validation
    const phoneRegex = /^(09|\+639)[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with 639, add + prefix
    if (cleaned.startsWith('639') && !cleaned.startsWith('+639')) {
      cleaned = '+' + cleaned;
    }
    
    // Limit to 13 characters (+639XXXXXXXXX)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && !validatePhoneNumber(value)) {
          errors.phone = 'Please enter a valid Philippine phone number';
        } else {
          delete errors.phone;
        }
        break;
      case 'linkedin':
        if (value && !value.includes('linkedin.com')) {
          errors.linkedin = 'Please enter a valid LinkedIn URL';
        } else {
          delete errors.linkedin;
        }
        break;
      case 'twitter':
        if (value && !value.includes('twitter.com') && !value.includes('x.com')) {
          errors.twitter = 'Please enter a valid Twitter/X URL';
        } else {
          delete errors.twitter;
        }
        break;
      case 'github':
        if (value && !value.includes('github.com')) {
          errors.github = 'Please enter a valid GitHub URL';
        } else {
          delete errors.github;
        }
        break;
      case 'website':
        if (value && !value.startsWith('http')) {
          errors.website = 'Please enter a valid website URL (include http:// or https://)';
        } else {
          delete errors.website;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number if it's the phone field
    if (name === 'phone') {
      const formattedValue = formatPhoneNumber(value);
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
      setHasChanges(true);
      validateField(name, formattedValue);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setHasChanges(true);
      validateField(name, value);
    }
    
    // Recalculate profile completion
    const updatedForm = { ...form, [name]: value };
    calculateProfileCompletion(updatedForm);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setHasChanges(true);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
      setHasChanges(true);
    }
  };

  const removeCertification = (index) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    // Validate all fields before submission
    const hasErrors = Object.keys(fieldErrors).length > 0;
    if (hasErrors) {
      setError('Please fix all validation errors before submitting');
      setLoading(false);
      setIsUpdating(false);
      return;
    }
    
    // Validate phone number before submission
    if (form.phone && !validatePhoneNumber(form.phone)) {
      setPhoneError('Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)');
      setLoading(false);
      setIsUpdating(false);
      return;
    }
    
    try {
      // Send data as JSON instead of FormData to avoid multipart parsing issues
      const dataToSend = { ...form };
      
      // Debug: Log what's being sent
      console.log('AdminEditProfile data being sent:', dataToSend);
      
      await axios.put('/admin/profile', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Refresh user data to show updated information
      await fetchUser();
      setSuccess('Profile successfully updated!');
      setHasChanges(false);
      
      // Store success message in sessionStorage to show on dashboard
      sessionStorage.setItem('adminProfileSuccess', 'Profile successfully updated!');
      
      // Show success state for 2 seconds before navigating
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      console.error('AdminEditProfile error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-emerald-600 transition-colors">
            Dashboard
          </button>
          <FaChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Edit Profile</span>
        </nav>

        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
              <FaUser className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
            Professional Profile
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-6">
            Update your account information and professional details.
            <span className="text-emerald-600 font-semibold"> Keep your profile current and accurate.</span>
          </p>

          {/* Profile Completion Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-emerald-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {profileCompletion < 50 ? 'Complete more fields to improve your profile' : 
               profileCompletion < 80 ? 'Great progress! Almost there' : 
               'Excellent! Your profile is well-completed'}
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <FaUser className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Profile Information</h2>
                <p className="text-white/80 text-sm">Manage your personal and professional details</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'personal', label: 'Personal', icon: FaUser },
                { id: 'professional', label: 'Professional', icon: FaBriefcase },
                { id: 'contact', label: 'Contact', icon: FaPhone },
                { id: 'social', label: 'Social & Links', icon: FaGlobe },
                { id: 'emergency', label: 'Emergency', icon: FaShieldAlt }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-blue-100">
                  <img
                    className="w-full h-full object-cover"
                    src={avatarPreview || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
                    alt="Profile avatar"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-full p-3 shadow-lg opacity-90 hover:opacity-100 transition-all duration-200 group-hover:scale-110 hover:shadow-xl"
                  title="Change avatar"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-gray-600 text-sm mt-3 font-medium">Click the camera icon to change your profile picture</p>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Tab Content */}
              {activeTab === 'personal' && (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaUser className="w-5 h-5 text-emerald-600" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-emerald-600" />
                        Full Name
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                      {fieldErrors.name && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4 text-emerald-600" />
                        Email Address
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                        required
                      />
                      {fieldErrors.email && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-emerald-600" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g. 123 Main St, City"
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-emerald-600" />
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                      placeholder="Tell us about yourself, your experience, and professional background..."
                    />
                    <p className="text-gray-500 text-xs">
                      {form.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaBriefcase className="w-5 h-5 text-blue-600" />
                    Professional Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaBriefcase className="w-4 h-4 text-blue-600" />
                        Position/Title
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. Administrator, Manager"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaBuilding className="w-4 h-4 text-blue-600" />
                        Department
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. IT, Administration, Finance"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaIdCard className="w-4 h-4 text-blue-600" />
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g. EMP001, 2024-001"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaUserCheck className="w-4 h-4 text-blue-600" />
                      Professional Certifications
                    </label>
                    <div className="space-y-3">
                      {form.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <span className="flex-1 text-sm text-gray-700">{cert}</span>
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Add a certification..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addCertification}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <FaPlus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaPhone className="w-5 h-5 text-purple-600" />
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaPhone className="w-4 h-4 text-purple-600" />
                        Phone Number
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g. 09171234567 or +639171234567"
                        maxLength={13}
                        pattern="^(09|\+639)[0-9]{9}$"
                        required
                      />
                      {fieldErrors.phone && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.phone}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        Enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaGlobe className="w-4 h-4 text-purple-600" />
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.website ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://yourwebsite.com"
                      />
                      {fieldErrors.website && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.website}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaGlobe className="w-5 h-5 text-indigo-600" />
                    Social Media & Professional Links
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaLinkedin className="w-4 h-4 text-indigo-600" />
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                          fieldErrors.linkedin ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {fieldErrors.linkedin && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          {fieldErrors.linkedin}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaTwitter className="w-4 h-4 text-indigo-600" />
                          Twitter/X Profile
                        </label>
                        <input
                          type="url"
                          name="twitter"
                          value={form.twitter}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                            fieldErrors.twitter ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://twitter.com/yourhandle"
                        />
                        {fieldErrors.twitter && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3" />
                            {fieldErrors.twitter}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FaGithub className="w-4 h-4 text-indigo-600" />
                          GitHub Profile
                        </label>
                        <input
                          type="url"
                          name="github"
                          value={form.github}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md ${
                            fieldErrors.github ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://github.com/yourusername"
                        />
                        {fieldErrors.github && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <FaExclamationTriangle className="w-3 h-3" />
                            {fieldErrors.github}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FaShieldAlt className="w-5 h-5 text-red-600" />
                    Emergency Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-red-600" />
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={form.emergencyContact}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaPhone className="w-4 h-4 text-red-600" />
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={form.emergencyPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g. 09171234567 or +639171234567"
                        maxLength={13}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'personal' ? 'emergency' : 
                      activeTab === 'professional' ? 'personal' :
                      activeTab === 'contact' ? 'professional' :
                      activeTab === 'social' ? 'contact' : 'social')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Previous Tab
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'personal' ? 'professional' : 
                      activeTab === 'professional' ? 'contact' :
                      activeTab === 'contact' ? 'social' :
                      activeTab === 'social' ? 'emergency' : 'personal')}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Next Tab
                  </button>
                  
                  <button
                    type="submit"
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                      hasChanges && Object.keys(fieldErrors).length === 0
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={loading || !hasChanges || Object.keys(fieldErrors).length > 0}
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        {isUpdating ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminEditProfile;
