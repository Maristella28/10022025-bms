// Utility function to sanitize strings against XSS
export const sanitizeString = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;');
};

// Sanitize all fields in an object
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Sanitize URL parameters
export const sanitizeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.toString();
  } catch {
    // If not a valid URL, return a safe default
    return '#';
  }
};

// Validate and sanitize file types
export const validateFileType = (file, allowedTypes) => {
  if (!file || !file.type) return false;
  return allowedTypes.includes(file.type.toLowerCase());
};

// Content Security Policy headers (to be used in meta tags)
export const CSP_META = `
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