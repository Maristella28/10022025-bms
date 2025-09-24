import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosConfig';
import Navbares from '../../Navbares';
import Sidebares from '../../../components/Sidebares';

const MyBenefits = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/my-benefits');
        if (!mounted) return;
        setData(res.data);
      } catch (err) {
        if (!mounted) return;
        setError(err.response ? err.response.data : { message: 'Network error' });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbares />
      <Sidebares />
      <main className="ml-64 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">My Benefits</h1>

          {loading && (
            <div className="p-6 bg-white rounded-lg shadow">Loading...</div>
          )}

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">{error.message || 'Access denied'}</p>
              {error.redirect && (
                <p className="mt-2 text-sm">Please complete your profile: <a href={error.redirect} className="underline">Go to Profile</a></p>
              )}
            </div>
          )}

          {data && (
            <div className="p-6 bg-white rounded-lg shadow">
              <p className="text-gray-700">This is a placeholder My Benefits page. Backend returned:</p>
              <pre className="mt-4 bg-gray-100 p-3 rounded text-sm text-gray-800">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBenefits;
