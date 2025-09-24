import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
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
        setResult({ success: false, message: '❌ No resident record found for current user.' });
        setLoading(false);
        return;
      }
      console.log('Sending resident_id:', resident.resident_id || resident.id);
      const response = await axios.post('/blotter-requests', { resident_id: resident.resident_id || resident.id });
      setResult({ success: true, message: '✅ Your blotter request has been generated successfully!' });
    } catch (error) {
      let message = '❌ Failed to generate blotter request.';
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
      <main className="min-h-screen ml-64 pt-24 bg-green-50 font-sans px-4 sm:px-10">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center bg-green-200 text-green-800 hover:bg-green-300 font-semibold px-4 py-2 rounded-lg transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">📝 Generate Blotter Appointment</h1>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg px-6 py-10 mb-12">
          {residentLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                <div className="h-4 bg-gray-300 rounded w-3/6"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          ) : !resident ? (
            <div className="text-center text-red-600 font-semibold mb-6">
              No resident record found for your account. Please contact the barangay office to register your resident information.<br/>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 bg-green-200 text-green-800 hover:bg-green-300 font-semibold px-4 py-2 rounded-lg transition"
              >
                Go Back
              </button>
            </div>
          ) : step === 'instructions' && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-green-700 mb-2">Instructions</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Ensure you are the concerned party or have the authority to file a blotter.</li>
                  <li>Blotter requests are for reporting incidents or disputes within the barangay.</li>
                  <li>Once generated, your request will be reviewed by barangay officials.</li>
                  <li>False or malicious reports are subject to penalties.</li>
                  <li>Click the button below to generate your blotter request.</li>
                </ul>
              </div>
              <button
                onClick={handleProceed}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Proceed to Generate Blotter'}
              </button>
            </>
          )}

          {step === 'result' && result && (
            <div className={`p-4 rounded text-center mb-6 ${result.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              {result.message}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default GenerateBlotter;
