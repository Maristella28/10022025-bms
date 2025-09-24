import React, { useEffect, useState } from 'react';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import axios from '../../utils/axiosConfig'; // ✅ Make sure this path is correct
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaUser, FaEnvelope, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaPhoneAlt, FaListOl } from 'react-icons/fa';

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [hotlines, setHotlines] = useState([]);
  const [expandedHotline, setExpandedHotline] = useState(null);
  const [error, setError] = useState('');
  const [hotlineError, setHotlineError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hotlineLoading, setHotlineLoading] = useState(true);
  // Welcome toast state
  const [showWelcome, setShowWelcome] = useState(false);
  // Show welcome message if redirected from profile completion
  useEffect(() => {
    if (window.location.state && window.location.state.profileCompleted) {
      setShowWelcome(true);
      window.history.replaceState({}, document.title); // Remove state after showing
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

  // Mock data for the chart
  const financialData = [
    { month: 'Jan', income: 12000, expenses: 8000 },
    { month: 'Feb', income: 15000, expenses: 9000 },
    { month: 'Mar', income: 14000, expenses: 9500 },
    { month: 'Apr', income: 17000, expenses: 11000 },
    { month: 'May', income: 16000, expenses: 10500 },
    { month: 'Jun', income: 18000, expenses: 12000 },
  ];

  // Helper: fallback for new hotline fields (mock if missing)
  const getHotlineDetails = (hotline) => ({
    contactPerson: hotline.contactPerson || 'N/A',
    email: hotline.email || 'N/A',
    type: hotline.type || 'General',
    description: hotline.description || 'No description provided.',
    responseProcedure: hotline.responseProcedure || hotline.emergency_response_procedure || hotline.procedure || 'No emergency response procedure provided.',
    hotline: hotline.hotline,
    id: hotline.id,
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true); // start loading
        const res = await axios.get('/announcements');
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('❌ Failed to load announcements. Please login or try again later.');
      } finally {
        setLoading(false); // stop loading
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchHotlines = async () => {
      try {
        setHotlineLoading(true);
        const res = await axios.get('/emergency-hotlines');
        console.log(res.data); // <--- Add this line
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

  const toggleExpand = (id) => {
    setExpandedHotline(expandedHotline === id ? null : id);
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
      <main className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 min-h-screen ml-64 pt-36 px-6 pb-16 font-sans overflow-x-hidden">
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
      }
    `}</style>
        {/* Soft background pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-gradient-to-br from-green-200/30 via-emerald-100/20 to-teal-200/10 rounded-full blur-3xl opacity-60"></div>
        </div>
        <div className="relative w-full max-w-7xl mx-auto space-y-16 z-10">

    {/* Line Graph Section */}
    <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-green-900 mb-4 flex items-center gap-3">
              <span className="bg-white/60 rounded-full p-2 shadow-md backdrop-blur"><span className="text-2xl">📈</span></span>
              Barangay Financial Overview
            </h2>
            <div className="bg-white/60 border border-green-100 rounded-3xl shadow-2xl p-8 h-[380px] flex flex-col items-center justify-center text-gray-400 italic backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-emerald-50/40 pointer-events-none"></div>
              <div className="flex flex-col items-center z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="month" tick={{ fill: '#047857', fontWeight: 600 }} />
                    <YAxis tick={{ fill: '#047857', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', borderRadius: '1rem', border: '1px solid #a7f3d0', color: '#047857' }} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
      </div>
    </div>

    {/* Main Grid Layout: Announcements + Hotlines */}
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_2fr] gap-0">

      {/* Announcements Section */}
      <div>
        {/* Header */}
        <div className="text-center relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-3xl blur-3xl"></div>
          <div className="relative">
                  <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 tracking-tight mb-4 drop-shadow-lg">
              📢 Latest Announcements
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest news, events, and important information from your barangay community.
            </p>
          </div>
        </div>

        {/* Announcements Logic */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-lg text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500 text-lg">Check back later for updates from your barangay officials.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                      className="group relative bg-white/70 backdrop-blur-lg border border-white/60 rounded-3xl p-10 shadow-2xl hover:shadow-emerald-200/60 hover:scale-[1.025] transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeInUp 0.6s ease-out forwards' }}
              >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-emerald-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-3 group-hover:text-green-700 transition-colors duration-300">
                        {announcement.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span>Posted on {new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          <span>{new Date(announcement.published_at || announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                          <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <span className="text-2xl">📢</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg font-medium mb-6">{announcement.content}</p>
                  {announcement.image && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-500">
                      <img
                        src={`http://localhost:8000/storage/${announcement.image}`}
                        alt="Announcement"
                        className="w-full max-h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow">
                        <span className="text-green-600 text-sm">🏛️</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">Barangay Official</span>
                    </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full shadow">
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotlines Section */}
            <div className="relative pt-16 lg:pt-28 pl-2">
              <div className="bg-white/70 border border-red-200 rounded-3xl shadow-2xl p-8 sticky top-36 backdrop-blur-lg">
                <h2 className="text-3xl font-extrabold text-red-700 mb-6 flex items-center gap-3">
                  <span className="bg-white/60 rounded-full p-2 shadow-md backdrop-blur"><span className="text-2xl">🚨</span></span>
                  Emergency Hotlines
          </h2>
          {hotlineLoading ? (
            <div className="text-gray-500 text-center text-lg italic">Loading hotlines...</div>
          ) : hotlineError ? (
            <div className="text-red-600 text-center text-lg italic">{hotlineError}</div>
          ) : hotlines.length === 0 ? (
            <div className="text-gray-500 text-lg italic bg-white p-6 border rounded-xl shadow text-center">
              No emergency hotlines available at the moment.
            </div>
          ) : (
                  <ul className="space-y-7">
                    {hotlines.map((hotline) => {
                      const details = getHotlineDetails(hotline);
                      const isExpanded = expandedHotline === hotline.id;
                      return (
                <li
                  key={hotline.id}
                          className="relative flex flex-col md:flex-row bg-white/90 border border-red-100 rounded-3xl shadow-xl hover:shadow-rose-300/70 hover:border-rose-300 transition-all duration-300 group overflow-hidden"
                        >
                          {/* Vertical Accent Bar */}
                          <div className="hidden md:block w-2 bg-gradient-to-b from-red-400 via-rose-400 to-rose-200 rounded-l-3xl" />
                          {/* Card Content */}
                          <div className="flex-1 p-6 flex flex-col gap-3">
                            {/* Header: Type Badge and Hotline Number */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-200 to-rose-200 text-red-800 rounded-full text-xs font-bold shadow-sm">
                                <FaExclamationTriangle className="mr-2 text-red-500" />
                                {details.type}
                              </span>
                              <span className="flex items-center gap-2 text-2xl font-extrabold text-red-700 tracking-wider font-mono ml-0 sm:ml-6">
                                <FaPhoneAlt className="text-xl text-red-500" />
                                {details.hotline}
                              </span>
                              <a
                                href={`tel:${details.hotline}`}
                                className="ml-auto px-5 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full font-bold shadow-lg hover:from-red-600 hover:to-rose-600 transition-colors duration-300 text-base ring-2 ring-red-200 hover:ring-rose-300"
                              >
                                Call Now
                              </a>
                            </div>
                            {/* Two-column layout for contact and description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Contact Info */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-700 text-base">
                                  <FaUser className="text-emerald-600" />
                                  <span className="font-semibold">Contact:</span> {details.contactPerson}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 text-base">
                                  <FaEnvelope className="text-emerald-600" />
                                  <span className="font-semibold">Email:</span> {details.email}
                                </div>
                              </div>
                              {/* Description */}
                              <div className="text-gray-700 text-base">
                                <span className="font-semibold">Description:</span> {details.description}
                              </div>
                            </div>
                            {/* Expandable Emergency Response Procedure */}
                            <div className="mt-2">
                              <button
                                className="flex items-center gap-2 text-red-600 hover:underline text-sm font-semibold focus:outline-none select-none"
                                onClick={() => toggleExpand(hotline.id)}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                {isExpanded ? 'Hide Emergency Response Procedure' : 'See Emergency Response Procedure'}
                              </button>
                              <div
                                className={`transition-all duration-400 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                              >
                                {isExpanded && (
                                  <div className="p-5 bg-gradient-to-br from-red-50/90 to-rose-50/90 border border-red-100 rounded-2xl shadow-inner text-gray-700 text-base animate-fadeInUp ring-2 ring-rose-100">
                                    <span className="font-semibold block mb-3 text-red-700 flex items-center gap-2 text-lg">
                                      <FaExclamationTriangle className="text-xl text-red-600" />
                                      Emergency Response Procedure
                                    </span>
                                    {/* Render as numbered list if possible */}
                                    {Array.isArray(details.responseProcedure)
                                      ? (
                                        <ol className="list-decimal pl-6 space-y-2">
                                          {details.responseProcedure.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                              <FaListOl className="mt-1 text-red-400" />
                                              <span>{step}</span>
                                            </li>
                                          ))}
                                        </ol>
                                      )
                                      : (typeof details.responseProcedure === 'string' && details.responseProcedure.includes('\n'))
                                        ? (
                                          <ol className="list-decimal pl-6 space-y-2">
                                            {details.responseProcedure.split(/\r?\n|\d+\./).filter(Boolean).map((step, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <FaListOl className="mt-1 text-red-400" />
                                                <span>{step.trim()}</span>
                </li>
              ))}
                                          </ol>
                                        )
                                        : <span>{details.responseProcedure}</span>
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
            </ul>
          )}
        </div>
      </div>
    </div>

    <style>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
            .animate-fadeInUp {
              animation: fadeInUp 0.6s ease-out forwards;
            }
    `}</style>
  </div>
</main>



    </>
  );
};

export default Dashboard;
