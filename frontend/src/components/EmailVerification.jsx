import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function EmailVerification({
  email,
  userId,
  onVerify,
  onResend,
  onBack,
  title = "Verify Your Email",
  subtitle = "Enter Verification Code",
  showBackButton = true,
  backButtonText = "Back to Login",
  verifyButtonText = "Verify & Complete",
  resendButtonText = "Resend Verification Code",
  className = ""
}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds) timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer when component mounts
  useEffect(() => {
    if (userId && email) {
      setTimeLeft(300);
      setIsTimerRunning(true);
    }
  }, [userId, email]);

  // Handle verification code input
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setError('');
    }
  };

  // Handle verification code submit
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter a complete 6-digit verification code.');
      return;
    }

    if (timeLeft === 0) {
      setError('Verification code has expired. Please request a new one.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setStatus('Verifying code...');

    try {
      const res = await fetch('/api/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          verification_code: verificationCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('Email verified successfully!');
        setError('');
        setIsSuccess(true);
        
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call the onVerify callback with the response data
        if (onVerify) {
          onVerify(data);
        }
      } else {
        if (data.code_expired) {
          setError('Verification code has expired. Please request a new one.');
          setIsTimerRunning(false);
        } else {
          setError(data.message || 'Verification failed. Please try again.');
        }
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error. Please try again.');
      setStatus('');
      setIsSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    setStatus('Sending new verification code...');

    try {
      const res = await fetch('/api/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('New verification code sent successfully! Please check your inbox.');
        setError('');
        setTimeLeft(300);
        setIsTimerRunning(true);
        setVerificationCode('');
        setIsSuccess(true);
        
        // Call the onResend callback
        if (onResend) {
          onResend(data);
        }
      } else {
        setError(data.message || 'Failed to resend verification code.');
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Network error. Please try again.');
      setStatus('');
      setIsSuccess(false);
    } finally {
      setIsResending(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className={`relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 min-h-screen overflow-hidden ${className}`}>
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

      <section className="flex items-center justify-center px-4 py-12 min-h-screen">
        <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
          <div className="flex flex-col items-center space-y-3">
            <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center leading-tight tracking-wide">
              {title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
              {subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300">
                We've sent a 6-digit verification code to <strong>{email}</strong>
              </p>
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {timeLeft > 0 ? 'Time remaining (5 minutes)' : 'Code expired'}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                  disabled={timeLeft === 0 || isVerifying}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="000000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code from your email</p>
              </div>

              <button
                type="submit"
                disabled={timeLeft === 0 || isVerifying || verificationCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : verifyButtonText}
              </button>
            </form>

            <div className="space-y-3">
              {timeLeft === 0 && (
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : resendButtonText}
                </button>
              )}

              {showBackButton && (
                <button
                  onClick={handleBack}
                  disabled={isVerifying || isResending}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out disabled:cursor-not-allowed"
                >
                  {backButtonText}
                </button>
              )}
            </div>

            {status && (
              <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {status}
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
