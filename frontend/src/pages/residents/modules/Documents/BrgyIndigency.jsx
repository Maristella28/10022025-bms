import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares"; 

const BrgyIndigency = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    purpose: '',
    houseNumber: '',
    street: '',
    purok: '',
    barangay: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Certificate of Indigency Request:', formData);
    setSubmitted(true);
    setFormData({
      fullName: '',
      purpose: '',
      houseNumber: '',
      street: '',
      purok: '',
      barangay: ''
    });
  };

  return (
    <>
      <Navbares />
      <div className="flex min-h-screen bg-green-50">
        <Sidebares />
        <main className="flex-1 ml-64 pt-20 px-6">
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
              📄 Certificate of Indigency
            </h1>
            {submitted && (
              <div className="bg-green-100 border border-green-400 text-green-800 p-4 mb-6 rounded text-center font-medium">
                ✅ Your request has been submitted successfully.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>
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
                  className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  placeholder="e.g., School Requirement"
                  required
                />
              </div>
              <div className="pt-6 border-t border-green-200">
                <h2 className="text-lg font-semibold text-green-800 mb-4">Complete Address</h2>
                <div>
                  <label htmlFor="houseNumber" className="block font-semibold text-gray-800 mb-2">
                    House Number
                  </label>
                  <input
                    id="houseNumber"
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="e.g., 123"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block font-semibold text-gray-800 mb-2 mt-4">
                    Street
                  </label>
                  <input
                    id="street"
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="e.g., Mabini St."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="purok" className="block font-semibold text-gray-800 mb-2 mt-4">
                    Purok
                  </label>
                  <input
                    id="purok"
                    type="text"
                    name="purok"
                    value={formData.purok}
                    onChange={handleChange}
                    className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="e.g., Purok 2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="barangay" className="block font-semibold text-gray-800 mb-2 mt-4">
                    Barangay
                  </label>
                  <input
                    id="barangay"
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="w-full border border-green-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    placeholder="e.g., Brgy. Maligaya"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-300"
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

export default BrgyIndigency;
