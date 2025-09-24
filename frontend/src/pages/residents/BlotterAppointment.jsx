import React from 'react';
import { Link } from 'react-router-dom';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";

const BlotterAppointment = () => {
  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="bg-green-50 min-h-screen ml-64 pt-36 px-6 py-12 font-sans flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-10">

          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-green-900 tracking-tight border-b-4 border-green-500 inline-block pb-2">
              📋 Blotter Report
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Manage and generate blotter reports with ease.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Charter List Button */}
            <Link
              to="/residents/charterList"
              className="bg-green-100 hover:bg-green-200 transition-all duration-200 text-green-900 px-6 py-8 rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center justify-center w-full"
            >
              <div className="text-5xl mb-4">📄</div>
              <div className="text-lg font-semibold">Show Blotter Instructions</div>
              <p className="text-sm text-green-700 mt-1 text-center">Learn how to file a barangay blotter</p>
            </Link>

            {/* Generate Blotter Button */}
            <Link
              to="/residents/generateBlotter"
              className="bg-green-100 hover:bg-green-300 transition-all duration-200 text-green-900 px-6 py-8 rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center justify-center w-full"
            >
              <div className="text-5xl mb-4">📝</div>
              <div className="text-lg font-semibold">Generate Blotter Appointment</div>
              <p className="text-sm text-green-700 mt-1 text-center">Create and schedule a new blotter entry</p>
            </Link>

            {/* Status Blotter Requests Button */}
            <Link
              to="/residents/statusBlotterRequests"
              className="bg-green-100 hover:bg-green-300 transition-all duration-200 text-green-900 px-6 py-8 rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center justify-center w-full"
            >
              <div className="text-5xl mb-4">🔎</div>
              <div className="text-lg font-semibold">View My Blotter Requests</div>
              <p className="text-sm text-green-700 mt-1 text-center">Check the status and ticket of your blotter requests</p>
            </Link>
          </div>

        </div>
      </main>
    </>
  );
};

export default BlotterAppointment;
