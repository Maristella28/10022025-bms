import React from 'react';
import { UserIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const DeletedResidentsTable = ({ residents, onRestore, loading }) => {
  const formatResidentName = (resident) => {
    if (!resident) return '';
    const { first_name, middle_name, last_name, name_suffix } = resident;
    return (
      first_name +
      (middle_name ? ` ${middle_name}` : '') +
      (last_name ? ` ${last_name}` : '') +
      (name_suffix && name_suffix.toLowerCase() !== 'none' ? ` ${name_suffix}` : '')
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden transition-all duration-300 hover:shadow-2xl mt-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <TrashIcon className="w-5 h-5" />
          Recently Deleted Residents
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-red-50 border-b border-red-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-red-700 border-r border-red-200">Profile</th>
              <th className="px-4 py-4 text-left font-semibold text-red-700 border-r border-red-200">Resident ID</th>
              <th className="px-6 py-4 text-left font-semibold text-red-700 border-r border-red-200">Name</th>
              <th className="px-4 py-4 text-left font-semibold text-red-700 border-r border-red-200">Deleted Date</th>
              <th className="px-4 py-4 text-left font-semibold text-red-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-red-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-red-500 font-medium">Loading deleted residents...</p>
                  </div>
                </td>
              </tr>
            ) : residents.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserIcon className="w-12 h-12 text-red-300" />
                    <p className="text-red-500 font-medium">No deleted residents found</p>
                    <p className="text-red-400 text-sm">Deleted residents will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              residents.map((resident) => (
                <tr key={resident.id} className="hover:bg-red-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    {resident.avatar ? (
                      <img
                        src={`http://localhost:8000/storage/${resident.avatar}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                      {resident.resident_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{formatResidentName(resident)}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {new Date(resident.deleted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onRestore(resident)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeletedResidentsTable;