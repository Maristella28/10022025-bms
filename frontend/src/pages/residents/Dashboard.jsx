import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import axios from '../../utils/axiosConfig';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaUser, FaEnvelope, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaPhoneAlt, FaListOl, FaChartLine, FaBullhorn, FaClipboardList, FaPhone } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State management
  const [announcements, setAnnouncements] = useState([]);
  const [hotlines, setHotlines] = useState([]);
  const [expandedHotline, setExpandedHotline] = useState(null);
  const [error, setError] = useState('');
  const [hotlineError, setHotlineError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hotlineLoading, setHotlineLoading] = useState(true);
  
  // Programs state
  const [programs, setPrograms] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState('');
  
  // Program modal state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  
  // Welcome toast state
  const [showWelcome, setShowWelcome] = useState(false);

  // Mock data for the chart
  const financialData = [
    { month: 'Jan', income: 12000, expenses: 8000 },
    { month: 'Feb', income: 15000, expenses: 9000 },
    { month: 'Mar', income: 14000, expenses: 9500 },
    { month: 'Apr', income: 17000, expenses: 11000 },
    { month: 'May', income: 16000, expenses: 10500 },
    { month: 'Jun', income: 18000, expenses: 12000 },
  ];

  // Helper: fallback for new hotline fields
  const getHotlineDetails = (hotline) => ({
    contactPerson: hotline.contactPerson || 'N/A',
    email: hotline.email || 'N/A',
    type: hotline.type || 'General',
    description: hotline.description || 'No description provided.',
    responseProcedure: hotline.responseProcedure || hotline.emergency_response_procedure || hotline.procedure || 'No emergency response procedure provided.',
    hotline: hotline.hotline,
    id: hotline.id,
  });

  // Welcome message effect
  useEffect(() => {
    if (window.location.state && window.location.state.profileCompleted) {
      setShowWelcome(true);
      window.history.replaceState({}, document.title);
    } else if (sessionStorage.getItem('showWelcomeDashboard') === '1') {
      setShowWelcome(true);
      sessionStorage.removeItem('showWelcomeDashboard');
    }
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/announcements');
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('❌ Failed to load announcements. Please login or try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Fetch hotlines
  useEffect(() => {
    const fetchHotlines = async () => {
      try {
        setHotlineLoading(true);
        const res = await axios.get('/emergency-hotlines');
        setHotlines(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching hotlines:', err);
        setHotlineError('❌ Failed to load emergency hotlines.');
      } finally {
        setHotlineLoading(false);
      }
    };
    fetchHotlines();
  }, []);

  // Fetch available programs (only non-draft programs for residents)
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setProgramLoading(true);
        
        // Fetch available programs (filtered for residents - no draft programs)
        const programsRes = await axios.get('/programs/residents');
        setPrograms(programsRes.data || []);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setProgramError('❌ Failed to load available programs.');
      } finally {
        setProgramLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const toggleExpand = (id) => {
    setExpandedHotline(expandedHotline === id ? null : id);
  };

  const openProgramModal = (program) => {
    setSelectedProgram(program);
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedProgram(null);
  };

  const viewFullDetails = (program) => {
    console.log('Dashboard: Attempting navigation to program:', program);
    console.log('Dashboard: Navigation URL:', `/residents/modules/Programs/ProgramAnnouncements?program=${program.id}`);
    // Navigate to the program details page with the program ID as a query parameter
    navigate(`/residents/modules/Programs/ProgramAnnouncements?program=${program.id}`);
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      
      {/* Welcome Toast */}
      {showWelcome && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-green-200 animate-fadeInUp">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Welcome! Your profile is now complete.</div>
              <div className="text-sm font-medium">You can now access all barangay services and dashboard features.</div>
            </div>
          </div>
        </div>
      )}

      <main className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen ml-64 pt-20 px-6 pb-16 font-sans overflow-x-hidden">
        {/* Custom Styles */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slideInRight {
            animation: slideInRight 0.6s ease-out forwards;
          }
        `}</style>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-200/20 via-indigo-100/15 to-purple-200/10 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto space-y-12 z-10">
          
          {/* Header Section */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🏠</span>
              </div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Resident Dashboard
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome to your barangay management portal. Stay updated with announcements, programs, and emergency services.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
          </div>


          {/* Financial Overview Section */}
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Financial Overview</h2>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontWeight: 600 }} />
                  <YAxis tick={{ fill: '#475569', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255,255,255,0.95)', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0', 
                      color: '#475569',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#10b981' }} 
                    activeDot={{ r: 8, fill: '#059669' }} 
                    name="Income" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: '#ef4444' }} 
                    activeDot={{ r: 8, fill: '#dc2626' }} 
                    name="Expenses" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column - Announcements */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Available Programs */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <FaClipboardList className="text-white text-2xl" />
                    <h2 className="text-2xl font-bold text-white">Available Programs</h2>
                  </div>
                </div>
                <div className="p-8">
                  {programLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : programError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="font-medium">{programError}</span>
                      </div>
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📭</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Available</h3>
                      <p className="text-gray-500">Check back later for new programs and opportunities.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {programs.map((program) => (
                        <div key={program.id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-white text-lg">🎯</span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                                    {program.name}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                      <span>{program.status || 'Active'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                                      <span>{program.beneficiary_type || 'General'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-4 text-sm line-clamp-3">{program.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Assistance Type:</span>
                              <span className="font-medium text-gray-700">{program.assistance_type || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-semibold text-green-600">₱{program.amount ? program.amount.toLocaleString() : 'TBD'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Max Beneficiaries:</span>
                              <span className="font-medium text-gray-700">{program.max_beneficiaries || 'Unlimited'}</span>
                            </div>
                          </div>

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
                            <button
                              onClick={() => openProgramModal(program)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* General Announcements */}
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <FaBullhorn className="text-white text-2xl" />
                    <h2 className="text-2xl font-bold text-white">Latest Announcements</h2>
                  </div>
                </div>
                <div className="p-8">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                          className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                  <span className="text-white text-lg">📢</span>
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {announcement.title}
                                  </h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                      <span>{new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                                      <span>{new Date(announcement.published_at || announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-4 text-base">{announcement.content}</p>
                          {announcement.image && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 shadow-md">
                              <img
                                src={`http://localhost:8000/storage/${announcement.image}`}
                                alt="Announcement"
                                className="w-full max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}
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
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                Active
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Emergency Hotlines */}
            <div className="xl:col-span-1">
              <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-white text-2xl" />
                    <h2 className="text-2xl font-bold text-white">Emergency Hotlines</h2>
                  </div>
                </div>
                <div className="p-8">
                  {hotlineLoading ? (
                    <div className="text-gray-500 text-center text-lg italic">Loading hotlines...</div>
                  ) : hotlineError ? (
                    <div className="text-red-600 text-center text-lg italic">{hotlineError}</div>
                  ) : hotlines.length === 0 ? (
                    <div className="text-gray-500 text-lg italic bg-gray-50 p-6 border rounded-xl text-center">
                      No emergency hotlines available at the moment.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {hotlines.map((hotline) => {
                        const details = getHotlineDetails(hotline);
                        const isExpanded = expandedHotline === hotline.id;
                        return (
                          <div
                            key={hotline.id}
                            className="bg-white border border-red-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                    <FaExclamationTriangle className="mr-2 text-red-500" />
                                    {details.type}
                                  </span>
                                  <a
                                    href={`tel:${details.hotline}`}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full font-bold shadow-lg hover:from-red-600 hover:to-rose-600 transition-colors duration-300 text-sm"
                                  >
                                    Call Now
                                  </a>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xl font-bold text-red-700">
                                  <FaPhoneAlt className="text-red-500" />
                                  {details.hotline}
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <FaUser className="text-emerald-600" />
                                    <span className="font-semibold">Contact:</span> {details.contactPerson}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-emerald-600" />
                                    <span className="font-semibold">Email:</span> {details.email}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Description:</span> {details.description}
                                  </div>
                                </div>
                                
                                <div>
                                  <button
                                    className="flex items-center gap-2 text-red-600 hover:underline text-sm font-semibold focus:outline-none"
                                    onClick={() => toggleExpand(hotline.id)}
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    {isExpanded ? 'Hide Procedure' : 'Show Procedure'}
                                  </button>
                                  <div
                                    className={`transition-all duration-300 overflow-hidden ${
                                      isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    {isExpanded && (
                                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-gray-700 text-sm">
                                        <span className="font-semibold block mb-2 text-red-700 flex items-center gap-2">
                                          <FaExclamationTriangle className="text-red-600" />
                                          Emergency Response Procedure
                                        </span>
                                        {Array.isArray(details.responseProcedure) ? (
                                          <ol className="list-decimal pl-4 space-y-1">
                                            {details.responseProcedure.map((step, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <FaListOl className="mt-1 text-red-400" />
                                                <span>{step}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (typeof details.responseProcedure === 'string' && details.responseProcedure.includes('\n')) ? (
                                          <ol className="list-decimal pl-4 space-y-1">
                                            {details.responseProcedure.split(/\r?\n|\d+\./).filter(Boolean).map((step, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <FaListOl className="mt-1 text-red-400" />
                                                <span>{step.trim()}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (
                                          <span>{details.responseProcedure}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Program Details Modal */}
        {showProgramModal && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">🎯</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedProgram.name}</h2>
                      <p className="text-purple-100">Program Details</p>
                    </div>
                  </div>
                  <button
                    onClick={closeProgramModal}
                    className="text-white hover:text-purple-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Program Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Program Information</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedProgram.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedProgram.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                          selectedProgram.status === 'complete' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedProgram.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Beneficiary Type:</span>
                        <span className="text-gray-800">{selectedProgram.beneficiary_type || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Assistance Type:</span>
                        <span className="text-gray-800">{selectedProgram.assistance_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="text-green-600 font-semibold">₱{selectedProgram.amount ? selectedProgram.amount.toLocaleString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Max Beneficiaries:</span>
                        <span className="text-gray-800">{selectedProgram.max_beneficiaries || 'Unlimited'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">Duration:</span>
                        <span className="text-gray-800">
                          {selectedProgram.start_date && selectedProgram.end_date 
                            ? `${new Date(selectedProgram.start_date).toLocaleDateString()} - ${new Date(selectedProgram.end_date).toLocaleDateString()}`
                            : 'Ongoing'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Program Highlights */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Program Highlights</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-lg">🎯</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Target Audience</p>
                          <p className="text-xs text-gray-600">{selectedProgram.beneficiary_type || 'All residents'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Financial Support</p>
                          <p className="text-xs text-gray-600">₱{selectedProgram.amount ? selectedProgram.amount.toLocaleString() : 'TBD'} per beneficiary</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📋</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Application Required</p>
                          <p className="text-xs text-gray-600">Complete the application form to apply</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <span className="text-pink-600 text-lg">📅</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Program Duration</p>
                          <p className="text-xs text-gray-600">
                            {selectedProgram.start_date && selectedProgram.end_date 
                              ? `${new Date(selectedProgram.start_date).toLocaleDateString()} - ${new Date(selectedProgram.end_date).toLocaleDateString()}`
                              : 'Ongoing program'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={closeProgramModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => viewFullDetails(selectedProgram)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    View Full Details & Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;