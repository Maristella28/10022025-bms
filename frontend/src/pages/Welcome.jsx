import React from 'react';
import { Link } from 'react-router-dom'; // if you're using react-router

const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-2xl w-full flex flex-col md:flex-row items-center gap-8">
        
        {/* Logo Section */}
        <div className="flex-shrink-0">
          <img
            src="/assets/images/logo.jpg" // 🔁 Replace with your logo path
            alt="Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        {/* Welcome Text & Login Button */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">Welcome to the Portal</h1>
          <p className="text-gray-600 mb-4">Your gateway to everything</p>
          <Link
            to="/login"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-full transition duration-300"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Welcome;
