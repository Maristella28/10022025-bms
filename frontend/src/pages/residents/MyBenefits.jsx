import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';

const MyBenefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyBenefits = async () => {
      try {
        const response = await axiosInstance.get('/my-benefits');
        setBenefits(response.data);
      } catch (err) {
        console.error('Error fetching benefits:', err);
        setError(err.response?.data?.message || 'Failed to fetch benefits');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBenefits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 lg:ml-64">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 lg:ml-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 px-4 lg:ml-64">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-700 mb-6">My Benefits</h1>
        
        {benefits.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            You currently have no enabled benefits.
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Program</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {benefits.map((benefit) => (
                    <tr key={benefit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {benefit.program?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {benefit.program?.description || 'No description available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {benefit.beneficiary_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ₱{benefit.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${benefit.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            benefit.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {benefit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyBenefits;