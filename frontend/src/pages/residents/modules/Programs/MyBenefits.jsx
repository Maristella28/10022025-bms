import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/axiosConfig';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';

const MyBenefits = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [beneficiariesRes, submissionsRes] = await Promise.allSettled([
          axiosInstance.get('/my-benefits'),
          axiosInstance.get('/my-submissions')
        ]);

        const beneficiariesData = beneficiariesRes.status === 'fulfilled' ? beneficiariesRes.value.data : { beneficiaries: [] };
        const submissionsData = submissionsRes.status === 'fulfilled' ? submissionsRes.value.data : { submissions: [] };
        
        setBeneficiaries(beneficiariesData?.beneficiaries || []);
        setSubmissions(submissionsData?.submissions || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hasEnrollments = beneficiaries.length > 0;
  const hasSubmissions = submissions.length > 0;
  const hasAnyActivity = hasEnrollments || hasSubmissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbares />
      <Sidebares />
      <main className="ml-64 pt-20 px-6 pb-16 font-sans">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🎁</span>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                My Benefits
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Track your program enrollments and application submissions
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Loading Your Benefits</h3>
              <p className="text-gray-600">Please wait while we fetch your information...</p>
            </div>
          )}

          {!loading && !hasAnyActivity && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Program Activity Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't enrolled in any programs or submitted any applications yet. 
                Browse available programs and apply to start tracking your benefits here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/residents/enrolledPrograms')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    List of the Enrolled Program
                  </button>
                <button
                  onClick={() => navigate('/residents/projects')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Projects
                </button>
              </div>
            </div>
          )}

          {!loading && hasAnyActivity && (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-xl">✅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Enrolled Programs</p>
                      <p className="text-2xl font-bold text-gray-800">{beneficiaries.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📝</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Applications Submitted</p>
                      <p className="text-2xl font-bold text-gray-800">{submissions.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-xl">💰</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Benefits</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₱{beneficiaries.reduce((sum, b) => sum + (Number(b.amount) || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Programs */}
              {hasEnrollments && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      Enrolled Programs
                    </h2>
                  </div>
                  <div className="p-8">
                    <div className="space-y-6">
                      {beneficiaries.map((beneficiary, index) => (
                        <div key={beneficiary.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{beneficiary.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {beneficiary.beneficiary_type || beneficiary.beneficiaryType}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {beneficiary.assistance_type || beneficiary.assistanceType}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ₱{(beneficiary.amount || 0).toLocaleString()}
                              </div>
                              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                                beneficiary.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                beneficiary.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                beneficiary.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {beneficiary.status}
                              </div>
                            </div>
                          </div>
                          {beneficiary.remarks && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {beneficiary.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Application Submissions */}
              {hasSubmissions && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      Application Submissions
                    </h2>
                  </div>
                  <div className="p-8">
                    <div className="space-y-6">
                      {submissions.map((submission, index) => (
                        <div key={submission.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {submission.form?.title || 'Application Form'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                              submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                              submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              submission.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {submission.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                          {submission.admin_notes && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Admin Notes:</span> {submission.admin_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/residents/enrolledPrograms')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    List of the Enrolled Program
                  </button>
                  <button
                    onClick={() => navigate('/residents/projects')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    View All Projects
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBenefits;
