import React from "react";
import { useNavigate } from "react-router-dom";

const CreateHousehold = () => {
  const navigate = useNavigate();
  return (
    <main className="p-6 md:ml-64 pt-20 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium shadow"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold text-green-700 mb-6">Create Household</h1>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <p className="text-gray-600 text-lg">This is the placeholder for the Create Household page.</p>
        {/* Add your form and logic here */}
      </div>
    </main>
  );
};

export default CreateHousehold;
