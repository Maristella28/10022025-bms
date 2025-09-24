import React, { useEffect, useState } from 'react';
import axios from '../../../../utils/axiosConfig'; // Adjust path if needed
import { Link } from 'react-router-dom';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";

const StatusAssetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/asset-requests');
      
      // Handle the response data properly
      let data = response.data;
      
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        setRequests(data);
      }
      // If data has a data property (common Laravel API structure)
      else if (data && Array.isArray(data.data)) {
        setRequests(data.data);
      }
      else {
        // If we can't parse the response, show empty array
        setRequests([]);
      }
    } catch (err) {
      console.error('Error fetching asset requests:', err);
      setError('Failed to load requests');
      // Show empty array on error
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // No longer using localStorage
  const updateLocalStorage = (newRequests) => {
    // Not implemented - we're using the API instead
  };

  const handleDelete = async (indexToRemove) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const itemToDelete = requests[indexToRemove];
        // Call API to delete the request
        await axios.delete(`/asset-requests/${itemToDelete.id}`);
        
        // Update local state
        const updated = requests.filter((_, i) => i !== indexToRemove);
        setRequests(updated);
        setLastDeleted({ item: itemToDelete, index: indexToRemove });
      } catch (err) {
        console.error('Error deleting request:', err);
        alert('Failed to delete request. Please try again.');
      }
    }
  };

  const handleUndo = async () => {
    if (lastDeleted) {
      // We can't actually undo a delete operation, so we'll just remove the undo state
      setLastDeleted(null);
      // Refresh the list to show current state
      await fetchRequests();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to refresh the request list? This will clear any local changes.')) {
      // Refresh the list from the API
      await fetchRequests();
      setLastDeleted(null);
    }
  };

  // Helper function to safely render text content
  const renderText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') {
      // If it's an object, try to find a name or title property
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.asset_name) return value.asset_name;
      // If none found, return a string representation
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Helper function to get asset name
  const getAssetName = (item) => {
    // Handle the API structure from admin controller
    if (item.asset && typeof item.asset === 'object' && item.asset.name) {
      return item.asset.name;
    }
    // Fallback for other structures
    if (typeof item.asset === 'string') return item.asset;
    if (item.asset_name) return item.asset_name;
    if (item.name) return item.name;
    return 'Unknown Asset';
  };

  // Helper function to get date
  const getDate = (item) => {
    // Handle the API structure from admin controller
    if (item.request_date) return item.request_date;
    if (item.date) return item.date;
    if (item.created_at) return new Date(item.created_at).toLocaleDateString();
    return 'N/A';
  };

  // Helper function to get status
  const getStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.status) return item.status;
    if (item.request_status) return item.request_status;
    return 'Pending';
  };

  // Helper function to get payment status
  const getPaymentStatus = (item) => {
    // Handle the API structure from admin controller
    if (item.payment_status) return item.payment_status;
    return 'unpaid';
  };

  // Helper function to get receipt number
  const getReceiptNumber = (item) => {
    // Handle the API structure from admin controller
    if (item.receipt_number) return item.receipt_number;
    return null;
  };

  // Helper function to get amount
  const getAmount = (item) => {
    let amount = 0;
    
    // Handle the API structure from admin controller
    if (item.amount_paid !== null && item.amount_paid !== undefined) {
      amount = parseFloat(item.amount_paid) || 0;
    } else if (item.total_amount !== null && item.total_amount !== undefined) {
      amount = parseFloat(item.total_amount) || 0;
    } else if (item.amount !== null && item.amount !== undefined) {
      amount = parseFloat(item.amount) || 0;
    }
    
    return amount;
  };

  // Generate Receipt
  const generateReceipt = async (item) => {
    try {
      // Get the receipt number and amount from the item
      const receiptNumber = getReceiptNumber(item);
      const amount = getAmount(item) || 0;
      const assetName = getAssetName(item);
      const date = getDate(item);
      
      // Call backend to generate PDF receipt
      const response = await axios.post('/asset-requests/generate-receipt', {
        asset_request_id: item.id,
        receipt_number: receiptNumber,
        amount_paid: amount
      }, {
        responseType: 'blob'
      });

      // Create download link for PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbares />
        <Sidebares />
        <main className="ml-64 pt-20 p-8 bg-white min-h-screen font-sans">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-300 rounded w-1/4 animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-300 rounded w-24 animate-pulse"></div>
              <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <div className="space-y-4 animate-pulse">
              {/* Table header skeleton */}
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
                <div className="h-6 bg-gray-300 rounded w-1/6"></div>
              </div>
              
              {/* Table rows skeleton */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 py-3 border-t border-gray-200">
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="ml-64 pt-20 p-8 bg-white min-h-screen font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-900">Asset Request Status</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchRequests}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded shadow"
            >
              Refresh
            </button>
            <Link to="/residents/requestassets">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-5 rounded shadow">
                ← Back to Request Assets
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          {lastDeleted && (
            <button
              onClick={handleUndo}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm shadow"
            >
              Undo Delete
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm shadow ml-auto"
          >
            Clear All User Requests
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <table className="min-w-full text-sm bg-white rounded overflow-hidden">
            <thead className="bg-green-200 text-green-900 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Asset</th>
                <th className="px-6 py-3 text-left font-medium">Date Requested</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Payment Status</th>
                <th className="px-6 py-3 text-left font-medium">Amount</th>
                <th className="px-6 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item, index) => (
                <tr key={index} className="border-t hover:bg-green-50">
                  <td className="px-6 py-4">{renderText(getAssetName(item))}</td>
                  <td className="px-6 py-4">{renderText(getDate(item))}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        getStatus(item) === 'Approved'
                          ? 'bg-green-100 text-green-700'
                          : getStatus(item) === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {renderText(getStatus(item))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        getPaymentStatus(item) === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {getPaymentStatus(item) === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    {getReceiptNumber(item) && (
                      <div className="text-xs text-gray-600 mt-1">
                        Receipt: {getReceiptNumber(item)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    ₱{(getAmount(item) || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {getPaymentStatus(item) === 'paid' && getReceiptNumber(item) && (
                      <button
                        onClick={() => generateReceipt(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs mr-2"
                      >
                        Download Receipt
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-4">
                    No asset requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default StatusAssetRequests;