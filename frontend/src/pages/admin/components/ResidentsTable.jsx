import React from 'react';
import { EyeIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function ResidentsTable({
  data,
  formatResidentName,
  getResidentStatus,
  handleShowDetails,
  handleDelete,
  handleUpdate,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Resident ID</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Update Status</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Verification</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Last Modified</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Review Flag</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((resident) => (
            <tr key={resident.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4 font-mono text-blue-600">{resident.resident_id}</td>
              <td onClick={() => handleShowDetails(resident.id)} className="px-6 py-4 font-medium text-gray-900 cursor-pointer group-hover:text-green-600 transition-colors duration-200">{formatResidentName(resident)}</td>
              <td className="px-6 py-4">
                {(() => {
                  const status = resident.update_status ?? getResidentStatus(resident) ?? 'Needs Verification';
                  const statusClass =
                    status === 'Active' ? 'bg-green-600 text-white' :
                    status === 'Outdated' ? 'bg-yellow-600 text-white' :
                    status === 'Needs Verification' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white';
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                      {status}
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  resident.verification_status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : resident.verification_status === 'denied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {resident.verification_status || 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{resident.last_modified ? new Date(resident.last_modified).toLocaleString() : 'Never'}</td>
              <td className="px-6 py-4">
                {resident.for_review ? (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">⚠️ For Review</span>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleDelete(resident)}
                  className="text-red-600 hover:text-red-900 ml-3"
                  title="Delete Resident"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
