import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navbares from "../../../../components/Navbares";
import Sidebares from "../../../../components/Sidebares";

const BrgyClearance = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    periodOfStay: '',
    dateOfBirth: '',
    gender: '',
    civilStatus: '',
    birthplace: '',
    age: '',
    purpose: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Barangay Clearance Request:', formData);
    setSubmitted(true);
    setFormData({
      name: '',
      address: '',
      periodOfStay: '',
      dateOfBirth: '',
      gender: '',
      civilStatus: '',
      birthplace: '',
      age: '',
      purpose: ''
    });
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="min-h-screen ml-64 pt-24 bg-green-50 font-sans px-4 sm:px-10">
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
        {/* Form Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg px-6 py-10 mb-12">
          <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
            📄 Barangay Clearance Request
          </h1>
          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-4 mb-6 rounded text-center">
              ✅ Your request has been submitted successfully!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Period of Stay:</label>
              <input
                type="text"
                name="periodOfStay"
                value={formData.periodOfStay}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Civil Status:</label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              >
                <option value="">Select Civil Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Divorced</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Birthplace:</label>
              <input
                type="text"
                name="birthplace"
                value={formData.birthplace}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Age:</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full border border-green-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Purpose of Clearance:</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows="4"
                className="w-full border border-green-300 rounded-lg p-2"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Submit Request
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default BrgyClearance;