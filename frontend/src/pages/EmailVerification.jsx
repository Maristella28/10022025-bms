import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function EmailVerification() {
  const [status, setStatus] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const id = searchParams.get('id');
      const hash = searchParams.get('hash');

      if (!id || !hash) {
        setError('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/email/verify/${id}/${hash}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('Email verified successfully!');
          setIsSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError('Network error. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-25" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="blur">
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
          <circle cx="200" cy="150" r="100" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="150;450;150" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="300" r="120" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="300;100;300" dur="25s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="500" r="80" fill="url(#grad1)" filter="url(#blur)">
            <animate attributeName="cy" values="500;200;500" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
          <div className="flex flex-col items-center space-y-3">
            <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center leading-tight tracking-wide">
              Email Verification
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
              {isSuccess ? 'Verification Complete' : 'Verifying Your Email'}
            </p>
          </div>

          <div className="space-y-4 text-center">
            {isSuccess ? (
              <>
                <div className="text-green-600 text-6xl mb-4">
                  ✓
                </div>
                <div className="text-green-600 text-lg font-semibold">
                  Email Verified Successfully!
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Your email address has been verified. You can now log in to your account and access all features.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Redirecting to login page...</strong>
                  </p>
                </div>
              </>
            ) : error ? (
              <>
                <div className="text-red-600 text-6xl mb-4">
                  ✗
                </div>
                <div className="text-red-600 text-lg font-semibold">
                  Verification Failed
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {error}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Note:</strong> If you're having trouble, please contact support or try registering again.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-blue-600 text-6xl mb-4 animate-spin">
                  ⏳
                </div>
                <div className="text-blue-600 text-lg font-semibold">
                  Verifying Your Email
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            <div className="space-y-3">
              {isSuccess && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Go to Login
                </button>
              )}
              
              {error && (
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Register Again
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
              >
                Go to Home
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help? Contact your barangay office for support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 