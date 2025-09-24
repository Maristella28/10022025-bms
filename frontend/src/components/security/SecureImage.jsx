import React, { useState } from 'react';
import { sanitizeUrl } from '../../utils/sanitize';

const SecureImage = ({ src, alt, className, fallbackSrc = 'https://flowbite.com/docs/images/people/profile-picture-5.jpg' }) => {
  const [error, setError] = useState(false);

  // Sanitize and validate image source
  const secureSrc = () => {
    if (error) return fallbackSrc;
    
    try {
      if (!src) return fallbackSrc;
      
      if (typeof src === 'string') {
        // Only allow specific domains
        const allowedDomains = [
          'localhost:8000',
          'flowbite.com'
        ];
        
        const url = new URL(src);
        if (!allowedDomains.some(domain => url.host.includes(domain))) {
          console.error('Invalid image domain');
          return fallbackSrc;
        }
        
        return sanitizeUrl(src);
      }
      
      if (src instanceof File) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(src.type)) {
          console.error('Invalid file type');
          return fallbackSrc;
        }
        return URL.createObjectURL(src);
      }
      
      return fallbackSrc;
    } catch (e) {
      console.error('Error processing image source:', e);
      return fallbackSrc;
    }
  };

  return (
    <img
      src={secureSrc()}
      alt={alt || 'Image'} // Provide default alt text
      className={className}
      onError={(e) => {
        setError(true);
        e.target.src = fallbackSrc;
      }}
    />
  );
};

export default SecureImage;