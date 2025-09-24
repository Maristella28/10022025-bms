import React, { useEffect } from 'react';
import { sanitizeObject, sanitizeUrl, validateFileType } from '../../utils/sanitize';

// Security wrapper for form handling
export const withSecurityWrapper = (WrappedComponent) => {
  return function SecureComponent(props) {
    useEffect(() => {
      // Add security headers via meta tags
      const metaCSP = document.createElement('meta');
      metaCSP.httpEquiv = 'Content-Security-Policy';
      metaCSP.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: http://localhost:8000;
        font-src 'self';
        connect-src 'self' http://localhost:8000;
        frame-src 'none';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `;
      document.head.appendChild(metaCSP);

      // Cleanup
      return () => {
        try {
          if (metaCSP && metaCSP.parentNode) {
            document.head.removeChild(metaCSP);
          }
        } catch (error) {
          console.warn('Failed to remove meta tag during cleanup:', error);
        }
      };
    }, []);

    // Secure form submission wrapper
    const secureHandleSubmit = async (e, originalHandler) => {
      e.preventDefault();
      
      // Validate and sanitize form data
      const formData = new FormData(e.target);
      const sanitizedData = {};
      
      for (let [key, value] of formData.entries()) {
        // Handle file uploads
        if (value instanceof File) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
          if (!validateFileType(value, allowedTypes)) {
            console.error('Invalid file type');
            return;
          }
          sanitizedData[key] = value;
        } else {
          // Sanitize string values
          sanitizedData[key] = sanitizeObject(value);
        }
      }

      // Call original handler with sanitized data
      return originalHandler(sanitizedData);
    };

    // Secure URL handler
    const secureHandleUrl = (url) => {
      return sanitizeUrl(url);
    };

    // Secure image source handler
    const secureImageSrc = (src) => {
      if (!src) return 'https://flowbite.com/docs/images/people/profile-picture-5.jpg';
      
      if (typeof src === 'string' && src.startsWith('http://localhost:8000/storage/')) {
        return sanitizeUrl(src);
      }
      
      if (src instanceof File) {
        return URL.createObjectURL(src);
      }
      
      return 'https://flowbite.com/docs/images/people/profile-picture-5.jpg';
    };

    // Enhanced error handling
    const secureHandleError = (error) => {
      // Sanitize error messages before displaying
      const sanitizedMessage = sanitizeObject(error?.message || 'An error occurred');
      console.error('Sanitized error:', sanitizedMessage);
      return sanitizedMessage;
    };

    // Add security props to the wrapped component
    const securityProps = {
      secureHandleSubmit,
      secureHandleUrl,
      secureImageSrc,
      secureHandleError,
      // Wrap form state in a Proxy for real-time sanitization
      secureFormState: new Proxy(props.form || {}, {
        get: (target, prop) => {
          return sanitizeObject(target[prop]);
        },
        set: (target, prop, value) => {
          target[prop] = sanitizeObject(value);
          return true;
        }
      })
    };

    return <WrappedComponent {...props} {...securityProps} />;
  };
};

export default withSecurityWrapper;