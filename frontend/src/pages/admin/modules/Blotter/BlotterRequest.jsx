import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';

const BlotterRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [approveModal, setApproveModal] = useState({ open: false, id: null });
  const [approveDate, setApproveDate] = useState('');
  const [approveTime, setApproveTime] = useState('');
  const navigate = useNavigate();

  // Fetch all blotter requests for admin
  const fetchRequests = () => {
    setLoading(true);
    axiosInstance.get('/admin/blotter-requests')
      .then(res => setRequests(res.data))
      .catch(err => {
        if (err.response && err.response.status === 403) {
          alert('You do not have permission to view blotter requests. Please log in as an admin.');
        } else if (err.response && err.response.status === 401) {
          alert('You are not authenticated. Please log in.');
        } else {
          alert('Failed to fetch blotter requests.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update status of a blotter request (approve/decline)
  const handleAction = async (id, status, date = null) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (status === 'approved') {
  await axiosInstance.patch(`/blotter-requests/${id}`, { status, approved_date: date });
      } else {
  await axiosInstance.patch(`/blotter-requests/${id}`, { status });
      }
      fetchRequests();
    } catch (e) {
      if (e.response && e.response.status === 403) {
        alert('You do not have permission to update blotter requests. Please log in as an admin.');
      } else if (e.response && e.response.status === 401) {
        alert('You are not authenticated. Please log in.');
      } else {
        alert('Failed to update status.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
      setApproveModal({ open: false, id: null });
      setApproveDate('');
      setApproveTime('');
    }
  };

  // Handle approve button click
  const openApproveModal = (id) => {
    setApproveModal({ open: true, id });
    setApproveDate('');
    setApproveTime('');
  };

  // Handle approve modal submit
  const submitApprove = () => {
    if (!approveDate) {
      alert('Please select an approval date.');
      return;
    }
    // Combine date and time for approved_date
    let approvedDateTime = approveDate;
    if (approveTime) {
      approvedDateTime += 'T' + approveTime;
    }
    handleAction(approveModal.id, 'approved', approvedDateTime);
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Header and Navigation Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">All Blotter Requests</h1>
              <p className="text-gray-600 text-lg">Overview of all blotter requests submitted by residents.</p>
            </div>
            <button
              onClick={() => navigate('/admin/blotterRecords')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300"
            >
              Go to Blotter Appoints Request Table
            </button>
          </div>

          {/* Approve Modal */}
          {approveModal.open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-green-800">Approve Blotter Request</h2>
                <label className="block mb-2 font-semibold">Select Approval Date:</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-2"
                  value={approveDate}
                  onChange={e => setApproveDate(e.target.value)}
                />
                <label className="block mb-2 font-semibold">Select Approval Time:</label>
                <TimePicker
                  onChange={setApproveTime}
                  value={approveTime}
                  disableClock={true}
                  className="mb-4 w-full"
                  format="hh:mm a"   // <-- This enables AM/PM
                  clearIcon={null}   // Optional: hides the clear button
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setApproveModal({ open: false, id: null })}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-white font-semibold text-lg">Blotter Requests Table</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">User Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Approved Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Ticket Number</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Created At</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-500">No blotter requests found.</td>
                    </tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req.id} className="hover:bg-green-50 transition-all duration-200">
                        <td className="px-6 py-4 font-mono text-green-700">{req.id}</td>
                        <td className="px-6 py-4">{req.user?.name || 'N/A'}</td>
                        <td className="px-6 py-4">{req.resident?.residents_id || req.resident_id}</td>
                        <td className="px-6 py-4">
                          {req.resident
                            ? [req.resident.first_name, req.resident.middle_name, req.resident.last_name].filter(Boolean).join(' ')
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'completed' ? 'bg-blue-100 text-blue-800' : req.status === 'approved' ? 'bg-green-100 text-green-800' : req.status === 'declined' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{req.status}</span>
                        </td>
                        <td className="px-6 py-4">{req.approved_date ? new Date(req.approved_date).toLocaleDateString() : '-'}</td>
                        <td className="px-6 py-4">{req.ticket_number || '-'}</td>
                        <td className="px-6 py-4">{req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4">
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openApproveModal(req.id)}
                                disabled={actionLoading[req.id]}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow transition-all duration-200 disabled:opacity-60"
                              >
                                {actionLoading[req.id] ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleAction(req.id, 'declined')}
                                disabled={actionLoading[req.id]}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow transition-all duration-200 disabled:opacity-60"
                              >
                                {actionLoading[req.id] ? 'Declining...' : 'Decline'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default BlotterRequest; 