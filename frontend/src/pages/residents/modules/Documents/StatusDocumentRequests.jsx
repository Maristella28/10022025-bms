import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import axios from '../../../../utils/axiosConfig';

const StatusDocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/document-requests/my');
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your document requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'Brgy Clearance':
        return 'bg-blue-100 text-blue-800';
      case 'Brgy Indigency':
        return 'bg-purple-100 text-purple-800';
      case 'Brgy Residency':
        return 'bg-orange-100 text-orange-800';
      case 'Brgy Business Permit':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleShowDetails = (request) => {
    if (selectedRequest?.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };

  const handleDownloadPdf = async (request) => {
    setDownloadingPdf(request.id);
    try {
      const response = await axios.get(`/document-requests/${request.id}/download-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${request.document_type}-${request.user?.name || 'certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setDownloadingPdf(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your document requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button 
            onClick={fetchMyRequests}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
            <DocumentTextIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Document Requests</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track the status of your barangay document requests and certificates
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status.toLowerCase() === 'pending').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.filter(r => r.status.toLowerCase() === 'processing').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status.toLowerCase() === 'approved').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Document Requests</h2>
          </div>
          
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No document requests found</h3>
              <p className="text-gray-500">You haven't submitted any document requests yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDocumentTypeColor(request.document_type)}`}>
                            {request.document_type}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.document_type}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              Requested: {formatDate(request.created_at)}
                            </span>
                            {request.status.toLowerCase() === 'approved' && (
                              <span className="flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Approved: {formatDate(request.updated_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                          <button
                            onClick={() => handleShowDetails(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {request.status.toLowerCase() === 'approved' && request.pdf_path && (
                            <button
                              onClick={() => handleDownloadPdf(request)}
                              disabled={downloadingPdf === request.id}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              <DocumentArrowDownIcon className="w-4 h-4" />
                              {downloadingPdf === request.id ? 'Downloading...' : 'Download PDF'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedRequest?.id === request.id && (
                    <div className="mt-6 bg-gray-50 rounded-xl p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Request Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5" />
                            Request Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium text-gray-700">Document Type:</span> {request.document_type}</div>
                            <div><span className="font-medium text-gray-700">Status:</span> {request.status}</div>
                            <div><span className="font-medium text-gray-700">Request Date:</span> {formatDate(request.created_at)}</div>
                            {request.status.toLowerCase() === 'approved' && (
                              <div><span className="font-medium text-gray-700">Approved Date:</span> {formatDate(request.updated_at)}</div>
                            )}
                            {request.fields?.purpose && (
                              <div><span className="font-medium text-gray-700">Purpose:</span> {request.fields.purpose}</div>
                            )}
                            {request.fields?.remarks && (
                              <div><span className="font-medium text-gray-700">Remarks:</span> {request.fields.remarks}</div>
                            )}
                          </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <UserIcon className="w-5 h-5" />
                            Personal Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            {request.resident && (
                              <>
                                <div><span className="font-medium text-gray-700">Full Name:</span> {`${request.resident.first_name} ${request.resident.middle_name ? request.resident.middle_name + ' ' : ''}${request.resident.last_name}${request.resident.name_suffix ? ' ' + request.resident.name_suffix : ''}`}</div>
                                <div><span className="font-medium text-gray-700">Age:</span> {request.resident.age}</div>
                                <div><span className="font-medium text-gray-700">Civil Status:</span> {request.resident.civil_status}</div>
                                <div><span className="font-medium text-gray-700">Gender:</span> {request.resident.sex}</div>
                                <div><span className="font-medium text-gray-700">Contact:</span> {request.resident.contact_number}</div>
                                <div><span className="font-medium text-gray-700">Email:</span> {request.resident.email}</div>
                                <div><span className="font-medium text-gray-700">Address:</span> {request.resident.full_address}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusDocumentRequests; 