import React from 'react';
import { XMarkIcon, EyeIcon, DocumentTextIcon } from "@heroicons/react/24/solid";

const ImageModal = ({ 
  showModal, 
  selectedImage, 
  selectedImageTitle, 
  imageLoading,
  onClose,
  setImageLoading 
}) => {
  if (!showModal || !selectedImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900">{selectedImageTitle}</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(selectedImage, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            >
              <EyeIcon className="w-4 h-4" />
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded-full p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="relative">
            {imageLoading && (
              <div className="flex items-center justify-center w-full h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={selectedImage}
              alt={selectedImageTitle}
              className={`w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg transition-all duration-300 ${imageLoading ? 'hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                console.error("Image failed to load:", selectedImage);
                setImageLoading(false);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center justify-center w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 transition-all duration-300">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Image failed to load</p>
                <p className="text-gray-400 text-sm">The image may have been deleted or moved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;