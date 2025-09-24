import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';

const ResidencyDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col font-sans">
      <Navbares />
      <Sidebares />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full py-8">
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-8 lg:px-12 pb-16 flex flex-col items-center justify-center">
          <div className="bg-white/95 shadow-xl rounded-3xl border border-gray-100 overflow-hidden mt-4 mb-10 w-full max-w-5xl mx-auto flex flex-col items-center" style={{zIndex: 20, position: 'relative'}}>
            <div className="p-6 md:p-14 flex flex-col items-center w-full">
              <div className="flex flex-col items-center">
                <div className="w-full bg-red-50 rounded-xl flex flex-col items-center py-8 shadow-sm mt-8">
                  <h3 className="text-2xl font-bold text-red-800 mb-6">Residency Verification Denied</h3>
                  <p className="text-sm text-red-600 mt-4 text-center max-w-2xl">
                    Your residency verification has been denied by barangay administrators. 
                    Please contact the barangay office for more information or to appeal this decision.
                  </p>
                  <div className="mt-8">
                    <button 
                      onClick={() => navigate('/residency-verification')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
                    >
                      Click here to reupload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResidencyDenied;