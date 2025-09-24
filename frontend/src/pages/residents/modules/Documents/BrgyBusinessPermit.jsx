import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";

const BrgyBusinessPermit = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    businessOwner: '',
    amount: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Business Permit Request:', formData);
    setSubmitted(true);
    setFormData({ businessName: '', businessOwner: '', amount: '' });
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="min-h-screen ml-64 pt-20 bg-green-50 font-sans px-4 sm:px-10">

        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/residents/requestDocuments')}
            className="inline-flex items-center bg-green-200 text-green-800 hover:bg-green-300 font-semibold px-4 py-2 rounded-lg transition"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg px-8 py-10 mt-4 mb-12 border border-green-100">
          <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">
            🧾 Barangay Business Permit
          </h1>

          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-800 p-4 mb-6 rounded text-center font-medium">
              ✅ Your business permit request has been submitted!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Enter business name"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Business Owner</label>
              <input
                type="text"
                name="businessOwner"
                value={formData.businessOwner}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Enter owner's full name"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Enter amount"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default BrgyBusinessPermit;