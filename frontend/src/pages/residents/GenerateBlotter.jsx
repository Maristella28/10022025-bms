import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaFileAlt, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaGavel, FaUser, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';

const GenerateBlotter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [step, setStep] = useState('instructions');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [residentLoading, setResidentLoading] = useState(true);

  useEffect(() => {
    const fetchResident = async () => {
      setResidentLoading(true);
      try {
        // Use the /profile endpoint for the current user
        const response = await axios.get('/profile');
        const residentData = response.data.profile;
        console.log('Profile response:', response.data);
        console.log('Resident data from profile:', residentData);
        setResident(residentData);
      } catch (error) {
        setResident(null);
        console.error('Failed to fetch resident:', error);
      } finally {
        setResidentLoading(false);
      }
    };
    fetchResident();
  }, []);

  const handleProceed = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log('Resident data being sent:', resident);
      if (!resident || !resident.id) {
        setResult({ success: false, message: 'No resident record found for current user.' });
        setLoading(false);
        return;
      }
      console.log('Sending resident_id:', resident.id);
      const response = await axios.post('/blotter-requests', { resident_id: resident.id });
      setResult({ success: true, message: 'Your blotter request has been generated successfully!' });
    } catch (error) {
      let message = 'Failed to generate blotter request.';
      console.error('Blotter request error:', error);
      if (error.response && error.response.status === 401) {
        message += ' Please log in to generate a blotter request.';
      } else if (error.response && error.response.data && error.response.data.error) {
        message += ' ' + error.response.data.error;
      }
      setResult({ success: false, message });
    } finally {
      setLoading(false);
      setStep('result');
    }
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 py-12 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-ping"></div>
        </div>

        <div className="w-full max-w-6xl mx-auto relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blotter Management
            </button>
          </div>

          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <FaGavel className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              Generate Blotter Report
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Submit a formal blotter report for incidents, disputes, or complaints within the barangay.
              <span className="text-emerald-600 font-semibold"> Professional and confidential handling guaranteed.</span>
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {residentLoading ? (
              <div className="p-12">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center animate-spin">
                      <FaSpinner className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Your Profile</h3>
                    <p className="text-gray-500">Please wait while we verify your resident information...</p>
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : !resident ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaExclamationTriangle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Resident Profile Not Found</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  We couldn't find a resident record associated with your account. Please contact the barangay office 
                  to register your resident information before submitting blotter reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaArrowLeft className="mr-2" />
                    Go Back
                  </button>
                  <button
                    onClick={() => navigate('/user/profile')}
                    className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaUser className="mr-2" />
                    Complete Profile
                  </button>
                </div>
              </div>
            ) : step === 'instructions' && (
              <div className="p-8 lg:p-12">
                {/* Resident Info Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 mb-8 border border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Resident Information Verified</h3>
                      <p className="text-gray-600">
                        {resident.first_name} {resident.middle_name ? resident.middle_name + ' ' : ''}{resident.last_name}
                        {resident.name_suffix ? ' ' + resident.name_suffix : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FaInfoCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Important Guidelines</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FaShieldAlt className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-blue-800 mb-1">Authority to File</h4>
                          <p className="text-sm text-blue-700">Ensure you are the concerned party or have proper authority to file this blotter report.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <FaGavel className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-emerald-800 mb-1">Scope of Coverage</h4>
                          <p className="text-sm text-emerald-700">Blotter requests are for reporting incidents or disputes within the barangay jurisdiction.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <FaFileAlt className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-purple-800 mb-1">Review Process</h4>
                          <p className="text-sm text-purple-700">Your request will be reviewed by barangay officials and processed according to standard procedures.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <FaExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800 mb-1">Legal Responsibility</h4>
                          <p className="text-sm text-red-700">False or malicious reports are subject to penalties under applicable laws and regulations.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={handleProceed}
                    disabled={loading}
                    className="inline-flex items-center bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                        Generating Request...
                      </>
                    ) : (
                      <>
                        <FaGavel className="w-5 h-5 mr-3" />
                        Generate Blotter Report
                      </>
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    By clicking this button, you confirm that you have read and understood the guidelines above.
                  </p>
                </div>
              </div>
            )}

            {/* Result Section */}
            {step === 'result' && result && (
              <div className="p-8 lg:p-12">
                <div className={`rounded-2xl p-8 text-center ${
                  result.success 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
                }`}>
                  <div className="relative inline-flex items-center justify-center mb-6">
                    {result.success ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center">
                          <FaCheckCircle className="w-10 h-10 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-2xl flex items-center justify-center">
                          <FaExclamationTriangle className="w-10 h-10 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-4 ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Request Submitted Successfully!' : 'Submission Failed'}
                  </h3>
                  
                  <p className={`text-lg mb-6 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.success && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-green-200">
                      <p className="text-sm text-green-800">
                        Your blotter request has been submitted and is now under review. You will receive updates on the status of your request.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/residents/statusBlotterRequests')}
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaFileAlt className="mr-2" />
                      View My Requests
                    </button>
                    <button
                      onClick={() => navigate('/residents/blotterAppointment')}
                      className="inline-flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaArrowLeft className="mr-2" />
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default GenerateBlotter;
