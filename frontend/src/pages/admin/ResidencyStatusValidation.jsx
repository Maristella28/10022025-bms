import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid';

const ResidencyStatusValidation = () => {
  const [usersForReview, setUsersForReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    residency_status: '',
    status_notes: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsersForReview();
  }, []);

  const fetchUsersForReview = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/residents');
      const residents = response.data.residents || [];
      const mapped = residents.map((r) => ({
        id: r?.user?.id ?? r.id,
        name: r?.user?.name ?? [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(' ').trim(),
        email: r?.user?.email ?? r.email ?? '',
        residency_status: r?.user?.residency_status ?? 'for_review',
        last_activity_at: r.updated_at ?? r?.user?.updated_at ?? null,
        status_updated_at: r?.user?.updated_at ?? null,
        resident_id: r.id,
        verification_status: r.verification_status ?? r?.profile?.verification_status ?? null,
        residency_verification_image: r?.profile?.residency_verification_image ?? r.residency_verification_image ?? null,
      }));
      // Show only items needing action (pending/denied verification or flagged for review)
      const needAction = mapped.filter((u) => ['pending', 'denied'].includes((u.verification_status || '').toLowerCase()) || u.residency_status === 'for_review');
      setUsersForReview(needAction);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users for review');
      console.error('Error fetching users for review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (user) => {
    setSelectedUser(user);
    setUpdateForm({
      residency_status: user.residency_status || 'active',
      status_notes: user.status_notes || '',
    });
    setShowUpdateModal(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedUser || !updateForm.residency_status) return;

    try {
      setUpdating(true);
      await axios.post(`/admin/residency-status/${selectedUser.id}`, updateForm);

      // Refresh the list
      await fetchUsersForReview();

      // Close modal and reset form
      setShowUpdateModal(false);
      setSelectedUser(null);
      setUpdateForm({ residency_status: '', status_notes: '' });

      alert('Residency status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update residency status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      inactive: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      for_review: { color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon },
      deceased: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      relocated: { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon },
    };

    const config = statusConfig[status] || statusConfig.for_review;
    const IconComponent = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {status?.replace('_', ' ').toUpperCase() || 'FOR REVIEW'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading users for review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-xl mb-4 transform transition-transform duration-300 hover:scale-110">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight animate-slide-in">
            Residency Status Validation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            Review and validate residency status for users flagged for manual verification.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="text-red-800 font-semibold">Error Loading Data</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">For Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {usersForReview.filter(u => u.residency_status === 'for_review').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Inactive</p>
                <p className="text-3xl font-bold text-gray-900">
                  {usersForReview.filter(u => u.residency_status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ArrowPathIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Relocated</p>
                <p className="text-3xl font-bold text-gray-900">
                  {usersForReview.filter(u => u.residency_status === 'relocated').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Deceased</p>
                <p className="text-3xl font-bold text-gray-900">
                  {usersForReview.filter(u => u.residency_status === 'deceased').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Users Requiring Status Validation
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Current Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Last Activity</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700 border-r border-gray-200">Status Updated</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersForReview.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <CheckCircleIcon className="w-12 h-12 text-green-300" />
                        <p className="text-gray-500 font-medium">No users require status validation</p>
                        <p className="text-gray-400 text-sm">All users are up to date</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  usersForReview.map((user) => (
                    <tr key={user.id} className="hover:bg-orange-50 transition-all duration-200 border-b border-gray-100 hover:border-orange-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.residency_status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(user.last_activity_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(user.status_updated_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(user)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">User Details</h2>
                      <p className="text-blue-100 text-sm">{selectedUser.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                        Basic Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900">{selectedUser.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium text-gray-900">{selectedUser.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                        Status Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Current Status:</span>
                          {getStatusBadge(selectedUser.residency_status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Activity:</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedUser.last_activity_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status Updated:</span>
                          <span className="font-medium text-gray-900">{formatDate(selectedUser.status_updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedUser.status_notes && (
                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        Status Notes
                      </h4>
                      <p className="text-yellow-800">{selectedUser.status_notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowPathIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Update Status</h2>
                      <p className="text-green-100 text-sm">{selectedUser.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Residency Status</label>
                    <select
                      value={updateForm.residency_status}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, residency_status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="for_review">For Review</option>
                      <option value="deceased">Deceased</option>
                      <option value="relocated">Relocated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status Notes (Optional)</label>
                    <textarea
                      value={updateForm.status_notes}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, status_notes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Add notes about this status change..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStatusUpdate}
                    disabled={updating || !updateForm.residency_status}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidencyStatusValidation;