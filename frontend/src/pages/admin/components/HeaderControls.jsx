import React from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/solid";

export default function HeaderControls({
  search,
  setSearch,
  handleAddResidentClick,
  showResidentsUsers,
  setShowResidentsUsers,
  fetchResidentsUsers,
  showRecentlyDeleted,
  setShowRecentlyDeleted,
  fetchRecentlyDeletedResidents,
  statusFilter,
  setStatusFilter
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex gap-3">
          <button
            onClick={handleAddResidentClick}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Resident
          </button>
          <button
            onClick={() => {
              setShowResidentsUsers(!showResidentsUsers);
              if (!showResidentsUsers) {
                fetchResidentsUsers();
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {showResidentsUsers ? 'View Residents' : 'View Residents Users'}
          </button>
          <button
            onClick={() => {
              setShowRecentlyDeleted(!showRecentlyDeleted);
              if (!showRecentlyDeleted) {
                fetchRecentlyDeletedResidents();
              }
            }}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Recently Deleted
          </button>
        </div>

        <div className="flex gap-3 items-center w-full max-w-md">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300 focus:shadow-md"
              placeholder="Search residents by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="outdated">Outdated</option>
            <option value="needs_verification">Needs Verification</option>
            <option value="for_review">For Review</option>
          </select>
          <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            <FunnelIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
