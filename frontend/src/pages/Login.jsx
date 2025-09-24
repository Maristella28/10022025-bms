import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationUserId, setVerificationUserId] = useState(null);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSuccess(false);

    try {
      const userData = await login(email, password);

      setStatus('Login successful! Redirecting...');
      setIsSuccess(true);

      // Use the user data returned from login function
      const { role, has_logged_in } = userData;
      
      console.log('Login successful, user data:', userData);
      console.log('User role:', role);

      // For residents, check residency verification status
      if (role === 'residents') {
        try {
          const token = localStorage.getItem('authToken');
          
          // Update login status if first time
          if (!has_logged_in) {
            const updateRes = await fetch('/api/user/update-login-status', {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            });

            if (!updateRes.ok) {
              const err = await updateRes.json();
              console.warn('⚠️ Error updating login status:', err);
            }
          }

          // Check if user has a profile and residency verification status
          const profileRes = await fetch('/api/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const verificationStatus = profileData.profile?.verification_status;

            // If no verification image uploaded
            if (!profileData.profile?.residency_verification_image) {
              navigate('/residency-verification');
              return;
            }

            // If verification is pending
            if (verificationStatus === 'pending') {
              navigate('/residency-verification');
              return;
            }

            // If verification is denied → show message and redirect
            if (verificationStatus === 'denied') {
              setStatus('Your residency verification was denied. Please re-upload a valid image.');
              setIsSuccess(false);
              setTimeout(() => {
                navigate('/residency-verification');
              }, 2000);
              return;
            }
            
            // If verification is approved
            if (verificationStatus === 'approved') {
              navigate('/user/profile');
              return;
            }
          } else {
            // No profile found
            navigate('/residency-verification');
            return;
          }
        } catch (error) {
          console.error('Error checking profile status:', error);
          navigate('/residency-verification');
          return;
        }
      }

      // Redirect based on role for non-residents
      setTimeout(() => {
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'treasurer':
            navigate('/treasurer/dashboard');
            break;
          case 'staff':
            navigate('/staff/dashboard');
            break;
          default:
            console.log('Unknown role, redirecting to dashboard');
            navigate(`/${role}/dashboard`);
        }
      }, 1000);

    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.requires_verification) {
        setVerificationUserId(err.response.data.user_id);
        setVerificationEmail(email);
        setShowVerification(true);
        setTimer(60);
        setIsTimerRunning(true);
        setStatus('');
        setResendStatus('');
        return;
      }
      setStatus(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setResendStatus('Resending code...');
    try {
      const res = await fetch('/api/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: verificationUserId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus('Verification code resent! Check your email.');
        setTimer(60);
        setIsTimerRunning(true);
        setVerificationCode('');
      } else {
        setResendStatus(data.message || 'Failed to resend code.');
      }
    } catch (error) {
      setResendStatus('Network error. Try again.');
    }
  };

  // Handle verification code submit
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setResendStatus('Verifying code...');
    try {
      const res = await fetch('/api/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          user_id: verificationUserId,
          verification_code: verificationCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setResendStatus('Email verified! Logging you in...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        if (data.code_expired) {
          setResendStatus('Code expired. Please resend.');
        } else {
          setResendStatus(data.message || 'Verification failed.');
        }
      }
    } catch (error) {
      setResendStatus('Network error. Try again.');
    }
  };

  // UI for verification
  if (showVerification) {
    return (
      <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 min-h-screen overflow-hidden">
        <section className="flex items-center justify-center px-4 py-12 min-h-screen">
          <div className="w-full max-w-md bg-white/60 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-gray-300 dark:ring-gray-600">
            <div className="flex flex-col items-center space-y-3">
              <img className="w-20 h-20 rounded-full shadow-lg" src="/assets/images/logo.jpg" alt="logo" />
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center">Email Verification Required</h1>
              <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
                Enter the 3-digit code sent to <strong>{verificationEmail}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${timer <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timer)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {timer > 0 ? 'Time remaining' : 'Code expired'}
                </p>
              </div>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={3}
                  pattern="[0-9]{3}"
                  required
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000"
                  disabled={timer === 0}
                />
                <button
                  type="submit"
                  disabled={timer === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Verify & Login
                </button>
              </form>
              <div className="space-y-3">
                <button
                  onClick={handleResendCode}
                  disabled={isTimerRunning}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  {isTimerRunning ? `Resend available in ${formatTime(timer)}` : 'Click here to resend verification code'}
                </button>
                <button
                  onClick={() => setShowVerification(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Back to Login
                </button>
              </div>
              {resendStatus && (
                <p className="text-sm text-center text-blue-600 dark:text-blue-400">{resendStatus}</p>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Normal login UI
  return (
    <div className="relative bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-900 dark:to-gray-800 min-h-screen overflow-hidden">
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
              Barangay e-Governance
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
            >
              Sign In
            </button>
          </form>

          {status && (
            <div className={`text-sm text-center p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status}
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                Register here
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
