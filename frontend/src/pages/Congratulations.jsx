import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';

const Congratulations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="bg-white border border-green-200 rounded-3xl shadow-xl p-10 flex flex-col items-center max-w-lg w-full">
        <BadgeCheck className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-green-700 mb-4">Congratulations!</h1>
        <p className="text-lg text-green-800 mb-8 text-center">
          Your profile is complete and verified.<br />
          You now have access to all modules and services.
        </p>
        <button
          onClick={() => navigate('/residents/dashboard')}
          className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Congratulations;
