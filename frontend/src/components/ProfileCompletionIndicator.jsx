import React from 'react';
import { AlertCircle } from 'lucide-react';

const ProfileCompletionIndicator = ({ percentage, missingFields }) => {
  const getColorClass = (percent) => {
    if (percent < 30) return 'from-red-500 to-red-600';
    if (percent < 70) return 'from-yellow-500 to-yellow-600';
    if (percent < 100) return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
        
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full bg-gradient-to-r ${getColorClass(percentage)} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Required fields missing:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  {missingFields.map(field => (
                    <li key={field} className="text-yellow-700 text-sm">
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionIndicator;