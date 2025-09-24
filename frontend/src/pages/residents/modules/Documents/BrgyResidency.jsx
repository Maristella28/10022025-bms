import React, { useState } from 'react';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";

const BrgyResidency = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    purpose: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Certificate of Residency Request:', formData);
    setSubmitted(true);
    setFormData({ fullName: '', address: '', purpose: '' });
  };

  return (
    <>
      <Navbares />
      <div className="flex min-h-screen bg-green-50">
        <Sidebares />
        <main className="flex-1 ml-64 pt-20 px-6">
          {/* Back Button outside the container */}
          <div className="max-w-3xl mx-auto mt-8 mb-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-green-200 text-green-800 hover:bg-green-300 px-4 py-2 rounded-md font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
          {/* Form Container */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg px-8 py-10 mb-12 border border-green-100">
            <h1 className="text-3xl font-bold text-green-800 mb-8 text-center">
              🏠 Certificate of Residency
            </h1>
            {submitted && (
              <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded mb-6 text-center font-medium">
                ✅ Your residency request has been submitted successfully.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block font-semibold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition border-green-300 focus:ring-green-500"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>
              {/* Address */}
              <div>
                <label htmlFor="address" className="block font-semibold text-gray-800 mb-2">
                  Complete Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition border-green-300 focus:ring-green-500"
                  placeholder="123 Purok St., Barangay Example"
                  required
                />
              </div>
              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block font-semibold text-gray-800 mb-2">
                  Purpose
                </label>
                <input
                  id="purpose"
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 transition border-green-300 focus:ring-green-500"
                  placeholder="e.g., Employment Requirement"
                  required
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex justify-center items-center"
              >
                Submit Request
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default BrgyResidency; 