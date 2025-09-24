import React, { useEffect, useState } from 'react';
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
        alert('Failed to load blotter requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="ml-64 pt-20 p-8 bg-white min-h-screen font-sans">
        <h1 className="text-3xl font-bold text-green-900 mb-6">My Blotter Requests</h1>
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <table className="min-w-full text-sm bg-white rounded overflow-hidden">
            <thead className="bg-green-200 text-green-900 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">ID</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Approved Date</th>
                <th className="px-6 py-3 text-left font-medium">Ticket Number</th>
                <th className="px-6 py-3 text-left font-medium">Admin Message</th>
                <th className="px-6 py-3 text-left font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No blotter requests found.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td className="px-6 py-4">{req.id}</td>
                    <td className="px-6 py-4">{req.status}</td>
                    <td className="px-6 py-4">{req.approved_date ? new Date(req.approved_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">{req.ticket_number || '-'}</td>
                    <td className="px-6 py-4">{req.admin_message || '-'}</td>
                    <td className="px-6 py-4">{req.created_at ? new Date(req.created_at).toLocaleString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default StatusBlotterRequests;