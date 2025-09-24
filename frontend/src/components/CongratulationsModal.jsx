import React from 'react';

export default function CongratulationsModal({ open, onGetStarted }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        <p className="mb-6">Your profile is complete. You can now access all modules.</p>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
