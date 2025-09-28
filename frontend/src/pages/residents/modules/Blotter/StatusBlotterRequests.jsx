import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt, FaClock, FaCheckCircle, FaTimes, FaSpinner, FaTicketAlt, FaComments, FaCalendarAlt, FaIdCard, FaExclamationTriangle } from 'react-icons/fa';
import axios from '../../../../utils/axiosConfig';
import Navbares from '../../../../components/Navbares';
import Sidebares from '../../../../components/Sidebares';

const StatusBlotterRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Fetch all blotter requests for the logged-in resident
        const res = await axios.get('/blotter-requests');
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load blotter requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'pending':
        return <FaClock className="w-4 h-4" />;
      case 'rejected':
        return <FaTimes className="w-4 h-4" />;
      case 'processing':
        return <FaSpinner className="w-4 h-4 animate-spin" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 min-h-screen ml-64 pt-36 px-6 py-12 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-blue-200/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/residents/blotterAppointment"
              className="inline-flex items-center bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blotter Management
            </Link>
          </div>

          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-emerald-600 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <FaFileAlt className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent tracking-tight leading-tight mb-4">
              My Blotter Requests
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Track and monitor the status of your submitted blotter reports and incidents.
              <span className="text-purple-600 font-semibold"> Stay informed every step of the way.</span>
            </p>
          </div>

          {/* Enhanced Table Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">Request History</h2>
                  <p className="text-white/80 text-sm">All your submitted blotter requests and their current status</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-spin">
                      <FaSpinner className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <p className="text-gray-600 mt-4 text-lg font-medium">Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaFileAlt className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Blotter Requests Found</h3>
                  <p className="text-gray-500 mb-6">You haven't submitted any blotter requests yet.</p>
                  <Link
                    to="/residents/generateBlotter"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <FaFileAlt className="mr-2" />
                    Create New Request
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="w-4 h-4 text-gray-500" />
                            Request ID
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4 text-gray-500" />
                            Status
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaTicketAlt className="w-4 h-4 text-gray-500" />
                            Ticket Number
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaComments className="w-4 h-4 text-gray-500" />
                            Admin Message
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                            Created Date
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="w-4 h-4 text-gray-500" />
                            Approved Scheduled Date
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map((req, index) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="py-6 px-6">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {req.id}
                              </div>
                              <span className="ml-3 font-medium text-gray-900">#{req.id}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                              {getStatusIcon(req.status)}
                              {req.status}
                            </span>
                          </td>
                          <td className="py-6 px-6">
                            {req.ticket_number ? (
                              <div className="flex items-center gap-2">
                                <FaTicketAlt className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{req.ticket_number}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not assigned</span>
                            )}
                          </td>
                          <td className="py-6 px-6">
                            {req.admin_message ? (
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-700 line-clamp-2">{req.admin_message}</p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No message</span>
                            )}
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{formatDate(req.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            {req.approved_date ? (
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-700">{formatDate(req.approved_date)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Not scheduled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          {!loading && requests.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
                    <p className="text-sm text-gray-600">Total Requests</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {requests.filter(req => req.status?.toLowerCase() === 'approved').length}
                    </p>
                    <p className="text-sm text-gray-600">Approved</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <FaClock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {requests.filter(req => req.status?.toLowerCase() === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <FaTimes className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {requests.filter(req => req.status?.toLowerCase() === 'rejected').length}
                    </p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default StatusBlotterRequests;