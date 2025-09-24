import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
        <div className="h-4 bg-gray-300 rounded w-3/6"></div>
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex justify-end space-x-3 mt-8">
        <div className="h-10 bg-gray-300 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );
};

export const DocumentRequestSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Document cards skeleton - reduced for better performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 border-2 border-white/50 rounded-3xl p-6 h-40" />
        ))}
      </div>
      
      {/* Info section skeleton */}
      <div className="bg-gray-200 rounded-2xl p-6 h-24" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Table header skeleton */}
        <div className="flex space-x-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        {/* Table rows skeleton - reduced for better performance */}
        {[...Array(Math.min(rows, 3))].map((_, i) => (
          <div key={i} className="flex space-x-4 py-3 border-t border-gray-200">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar skeleton */}
        <div className="rounded-full bg-gray-300 h-32 w-32"></div>
        
        {/* Name skeleton */}
        <div className="h-6 bg-gray-300 rounded w-48"></div>
        
        {/* Details skeleton */}
        <div className="space-y-2 w-full">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;