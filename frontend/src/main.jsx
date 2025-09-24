import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load heavy CSS imports
const loadFlowbite = () => import('flowbite');
const loadFontAwesome = () => import('@fortawesome/fontawesome-free/css/all.min.css');

// Load non-critical resources after initial render
setTimeout(() => {
  loadFlowbite();
  loadFontAwesome();
}, 100);

import './utils/axiosConfig';

// Error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Handle specific DOM manipulation errors
    if (error.message && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error detected, attempting cleanup...');
      // Clean up any lingering DOM elements that might cause issues
      try {
        const poppers = document.querySelectorAll('.react-datepicker-popper');
        poppers.forEach(popper => {
          if (popper && popper.parentNode) {
            popper.parentNode.removeChild(popper);
          }
        });
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
