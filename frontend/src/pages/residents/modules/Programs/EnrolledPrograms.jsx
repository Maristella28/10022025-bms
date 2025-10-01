import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';

const EnrolledPrograms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [error, setError] = useState(null);
  const [trackingModal, setTrackingModal] = useState({ isOpen: false, data: null });
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [proofComment, setProofComment] = useState('');

  useEffect(() => {
    const fetchEnrolledPrograms = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/my-benefits');
        setBeneficiaries(response.data?.beneficiaries || []);
      } catch (err) {
        console.error('Error fetching enrolled programs:', err);
        setError(err.response?.data?.message || 'Failed to load enrolled programs');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledPrograms();
  }, []);

  const handleBackToBenefits = () => {
    navigate('/residents/myBenefits');
  };

  const handleBackToDashboard = () => {
    navigate('/residents/dashboard');
  };

  const handleTrackProgram = async (beneficiaryId) => {
    try {
      setTrackingLoading(true);
      const response = await axiosInstance.get(`/my-benefits/${beneficiaryId}/track`);
      setTrackingModal({
        isOpen: true,
        data: response.data.data
      });
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.response?.data?.message || 'Failed to load tracking information');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCloseTrackingModal = () => {
    setTrackingModal({ isOpen: false, data: null });
    setSelectedFile(null);
    setProofComment('');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file (JPEG, PNG, or PDF)');
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !trackingModal.data) return;

    if (!proofComment.trim()) {
      alert('Please provide a comment about the proof of payout');
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('proof_file', selectedFile);
      formData.append('comment', proofComment);

      const response = await axiosInstance.post(
        `/my-benefits/${trackingModal.data.beneficiary.id}/upload-proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the tracking data with the new proof
      setTrackingModal(prev => ({
        ...prev,
        data: {
          ...prev.data,
          beneficiary: {
            ...prev.data.beneficiary,
            proof_of_payout: response.data.data.proof_url,
            proof_of_payout_url: response.data.data.proof_url
          },
          tracking: {
            ...prev.data.tracking,
            current_stage: 4
          }
        }
      }));

      setSelectedFile(null);
      setProofComment('');
      setError(null);
    } catch (err) {
      console.error('Error uploading proof:', err);
      setError(err.response?.data?.message || 'Failed to upload proof of payout');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbares />
      <Sidebares />
      <main className="ml-64 pt-20 px-6 pb-16 font-sans">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={handleBackToBenefits}
                className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/60 hover:-translate-y-1 mr-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to My Benefits
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-white/60 hover:-translate-y-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0H9" />
                </svg>
                Dashboard
              </button>
            </div>
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                Enrolled Programs
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              View all your enrolled programs and track their status
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Loading Enrolled Programs</h3>
              <p className="text-gray-600">Please wait while we fetch your enrolled programs...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Programs</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && beneficiaries.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Enrolled Programs</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't enrolled in any programs yet. Browse available programs and apply to start your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleBackToDashboard}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Browse Available Programs
                </button>
                <button
                  onClick={handleBackToBenefits}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Back to My Benefits
                </button>
              </div>
            </div>
          )}

          {/* Programs List */}
          {!loading && !error && beneficiaries.length > 0 && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Program Overview</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{beneficiaries.length}</div>
                      <div className="text-sm text-gray-600">Total Programs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        ₱{beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Benefits</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Programs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beneficiaries.map((beneficiary, index) => (
                  <div 
                    key={beneficiary.id} 
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Program Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white text-lg">🎯</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                            {beneficiary.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Enrolled Program</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                        beneficiary.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        beneficiary.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        beneficiary.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {beneficiary.status}
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Beneficiary Type:</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {beneficiary.beneficiary_type || beneficiary.beneficiaryType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Assistance Type:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {beneficiary.assistance_type || beneficiary.assistanceType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Amount:</span>
                        <span className="text-green-600 font-bold text-lg">
                          ₱{(beneficiary.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Program Description/Notes */}
                    {beneficiary.remarks && (
                      <div className="bg-gray-50 p-3 rounded-xl mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium text-gray-800">Notes:</span> {beneficiary.remarks}
                        </p>
                      </div>
                    )}

                    {/* Program Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 text-sm">🏛️</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 block">Barangay Program</span>
                          <span className="text-xs text-gray-500">Government Initiative</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          beneficiary.status === 'Approved' ? 'bg-green-400' :
                          beneficiary.status === 'Pending' ? 'bg-yellow-400' :
                          beneficiary.status === 'Processing' ? 'bg-blue-400' :
                          'bg-red-400'
                        }`}></div>
                        <span className="text-xs text-gray-500">
                          {beneficiary.status === 'Approved' ? 'Active' : 
                           beneficiary.status === 'Pending' ? 'Pending' :
                           beneficiary.status === 'Processing' ? 'Processing' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Track Program Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleTrackProgram(beneficiary.id)}
                        disabled={trackingLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none"
                      >
                        {trackingLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Track Program Status
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Browse More Programs
                  </button>
                  <button
                    onClick={handleBackToBenefits}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Back to My Benefits
                  </button>
                  <button
                    onClick={() => navigate('/residents/projects')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View All Projects
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Program Tracking Modal */}
      {trackingModal.isOpen && trackingModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Program Tracking</h2>
                    <p className="text-gray-600">{trackingModal.data.beneficiary.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseTrackingModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Program Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Program Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Program Name:</span>
                    <p className="text-gray-800 font-semibold">{trackingModal.data.program?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Benefit Amount:</span>
                    <p className="text-green-600 font-bold text-lg">₱{(trackingModal.data.beneficiary.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trackingModal.data.beneficiary.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trackingModal.data.beneficiary.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Application Date:</span>
                    <p className="text-gray-800">{trackingModal.data.beneficiary.application_date || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Progress Tracking</h3>
                <div className="space-y-4">
                  {trackingModal.data.tracking.stages.map((stage, index) => (
                    <div key={stage.stage} className="flex items-start gap-4">
                      {/* Stage Number */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                        stage.completed 
                          ? 'bg-green-500 text-white' 
                          : stage.active 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {stage.completed ? '✓' : stage.stage}
                      </div>
                      
                      {/* Stage Content */}
                      <div className="flex-1">
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          stage.completed 
                            ? 'bg-green-50 border-green-200' 
                            : stage.active 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                        }`}>
                          <h4 className={`font-bold text-lg ${
                            stage.completed ? 'text-green-800' : stage.active ? 'text-blue-800' : 'text-gray-600'
                          }`}>
                            {stage.title}
                          </h4>
                          <p className={`text-sm ${
                            stage.completed ? 'text-green-600' : stage.active ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {stage.description}
                          </p>
                          
                          {/* Show payout date if available */}
                          {stage.stage === 2 && trackingModal.data.tracking.payout_date && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-blue-800 font-medium">
                                  Scheduled for: {new Date(trackingModal.data.tracking.payout_date).toLocaleString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Stage 1: Show Application Data */}
                          {stage.stage === 1 && stage.completed && trackingModal.data.submission && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                              <h5 className="font-semibold text-gray-800 mb-3">Application Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(trackingModal.data.submission.submission_data).map(([key, field]) => (
                                  <div key={key}>
                                    <span className="text-sm font-medium text-gray-600">{field.label}:</span>
                                    <div className="text-gray-800">
                                      {field.is_file ? (
                                        <a 
                                          href={field.file_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          {field.file_original_name || 'View File'}
                                        </a>
                                      ) : (
                                        field.value || 'N/A'
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Stage 3: Upload Proof of Payout */}
                          {stage.stage === 3 && stage.active && (
                            <div className={`mt-4 p-4 rounded-lg border-2 ${
                              trackingModal.data.beneficiary.is_paid 
                                ? 'bg-green-50 border-green-300' 
                                : 'bg-white border-gray-200'
                            }`}>
                              <h5 className={`font-semibold mb-3 ${
                                trackingModal.data.beneficiary.is_paid 
                                  ? 'text-green-800' 
                                  : 'text-gray-800'
                              }`}>
                                Upload Proof of Payout
                                {trackingModal.data.beneficiary.is_paid && (
                                  <span className="ml-2 text-green-600">✓ Ready to upload</span>
                                )}
                              </h5>
                              <div className="space-y-4">
                                {trackingModal.data.beneficiary.proof_of_payout_url ? (
                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-green-800 font-medium mb-2">✓ Proof of payout uploaded</p>
                                    <a 
                                      href={trackingModal.data.beneficiary.proof_of_payout_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                      View uploaded proof
                                    </a>
                                    {trackingModal.data.beneficiary.proof_comment && (
                                      <div className="mt-2 p-2 bg-white rounded border">
                                        <p className="text-sm text-gray-600">
                                          <strong>Comment:</strong> {trackingModal.data.beneficiary.proof_comment}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comment about the proof of payout *
                                      </label>
                                      <textarea
                                        value={proofComment}
                                        onChange={(e) => setProofComment(e.target.value)}
                                        placeholder="Please describe the proof of payout (e.g., receipt number, transaction details, etc.)"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows="3"
                                        required
                                      />
                                    </div>
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      onChange={handleFileSelect}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="text-xs text-gray-500">
                                      Accepted formats: JPEG, PNG, PDF (Max 10MB)
                                    </div>
                                    {selectedFile && proofComment.trim() && (
                                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-blue-800 font-medium">{selectedFile.name}</span>
                                        <button
                                          onClick={handleUploadProof}
                                          disabled={uploadLoading}
                                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                          {uploadLoading ? 'Uploading...' : 'Upload Proof'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Stage 4: Completed */}
                          {stage.stage === 4 && stage.completed && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 text-xl">🎉</span>
                                <p className="text-green-800 font-medium">Program completed successfully!</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              {trackingModal.data.submission?.admin_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="font-bold text-yellow-800 mb-2">Admin Notes</h4>
                  <p className="text-yellow-700">{trackingModal.data.submission.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 rounded-b-3xl">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseTrackingModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledPrograms;
