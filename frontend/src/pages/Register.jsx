import { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  ServerIcon,
  ClockIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    contactNumber: '',
    gender: '',
    birthDate: '',
    address: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    privacyPolicyAccepted: false,
    role: 'residents',
  });

  const [verificationForm, setVerificationForm] = useState({
    verificationCode: '',
  });

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVerificationChange = (e) => {
    const { name, value } = e.target;
    setVerificationForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Registering...');
    setError('');
    setIsSuccess(false);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    if (!form.termsAccepted) {
      setError("You must accept the terms and conditions.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    if (!form.privacyPolicyAccepted) {
      setError("You must accept the privacy policy to register.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    // Name duplicate check removed as it's not implemented yet

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: `${form.firstName} ${form.middleName ? form.middleName + ' ' : ''}${form.lastName}${form.suffix ? ' ' + form.suffix : ''}`.trim(),
          first_name: form.firstName,
          middle_name: form.middleName,
          last_name: form.lastName,
          suffix: form.suffix,
          email: form.email,
          contact_number: form.contactNumber,
          gender: form.gender,
          birth_date: form.birthDate,
          address: form.address,
          password: form.password,
          role: form.role,
          agree_privacy_policy: form.privacyPolicyAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          // Handle validation errors
          const firstError = Object.values(data.errors)[0][0];
          setError(firstError || 'Validation failed');
        } else {
          setError(data.message || 'Registration failed.');
        }
        setStatus('');
        setIsSuccess(false);
        return;
      }

      if (data.requires_verification) {
        setRegisteredUserId(data.user_id);
        setRegisteredEmail(data.email);
        setStatus('Registration initiated! Please check your email for the verification code.');
        setError('');
        setShowVerificationForm(true);
        setTimeLeft(60);
        setIsTimerRunning(true);
        setIsSuccess(true);
      } else {
        setStatus('Registration successful!');
        setError('');
        setIsSuccess(true);
        // Redirect to login page after successful registration
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setStatus('Verifying code...');
    setError('');
    setIsSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/api/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: registeredUserId,
          verification_code: verificationForm.verificationCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus('Registration completed successfully!');
        setError('');
        setIsSuccess(true);
        window.location.href = '/login';
      } else {
        if (data.code_expired) {
          setError('Verification code has expired. Please request a new one.');
          setIsTimerRunning(false);
        } else {
          setError(data.message || 'Verification failed.');
        }
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleResendCode = async () => {
    setStatus('Sending new verification code...');
    setError('');
    setIsSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/api/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: registeredUserId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('New verification code sent successfully! Please check your inbox.');
        setError('');
        setTimeLeft(60);
        setIsTimerRunning(true);
        setVerificationForm({ verificationCode: '' });
        setIsSuccess(true);
      } else {
        setError(data.message || 'Failed to resend verification code.');
        setStatus('');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network or server error.');
      setStatus('');
    }
  };

  const handleBackToRegistration = () => {
    setShowVerificationForm(false);
    setRegisteredUserId(null);
    setRegisteredEmail('');
    setTimeLeft(60);
    setIsTimerRunning(false);
    setVerificationForm({ verificationCode: '' });
    setStatus('');
    setError('');
    setIsSuccess(false);
  };

  if (showVerificationForm) {
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
                Verify Your Email
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
                Enter Verification Code
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  We've sent a 3-digit verification code to <strong>{registeredEmail}</strong>
                </p>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {timeLeft > 0 ? 'Time remaining' : 'Code expired'}
                </p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="verificationCode"
                    value={verificationForm.verificationCode}
                    onChange={handleVerificationChange}
                    maxLength="3"
                    pattern="[0-9]{3}"
                    required
                    className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the 3-digit code from your email</p>
                </div>

                <button
                  type="submit"
                  disabled={timeLeft === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Verify & Complete Registration
                </button>
              </form>

              <div className="space-y-3">
                {timeLeft === 0 && (
                  <button
                    onClick={handleResendCode}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                  >
                    Resend Verification Code
                  </button>
                )}

                <button
                  onClick={handleBackToRegistration}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
                >
                  Back to Registration
                </button>
              </div>

              {status && <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?
                <a href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400"> Login here</a>
              </p>
            </div>
          </div>
        </section>
  
        {/* Privacy Policy Modal */}
        {showPrivacyPolicy && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-t-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
                      <p className="text-blue-100 text-sm">Barangay e-Governance System</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPrivacyPolicy(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
  
              <div className="p-8 space-y-6">
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
  
                <div className="space-y-6">
                  <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <UserGroupIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Information We Collect</h3>
                        <ul className="text-blue-800 space-y-1 text-sm">
                          <li>• Personal information (name, email, contact details)</li>
                          <li>• Residency information and documents</li>
                          <li>• Usage data and activity logs</li>
                          <li>• IP addresses and device information</li>
                        </ul>
                      </div>
                    </div>
                  </section>
  
                  <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LockClosedIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-900 mb-2">How We Protect Your Data</h3>
                        <ul className="text-green-800 space-y-1 text-sm">
                          <li>• End-to-end encryption for sensitive data</li>
                          <li>• Secure servers with regular security audits</li>
                          <li>• Access controls and user authentication</li>
                          <li>• Regular data backups and disaster recovery</li>
                        </ul>
                      </div>
                    </div>
                  </section>
  
                  <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-900 mb-2">Data Usage & Sharing</h3>
                        <ul className="text-purple-800 space-y-1 text-sm">
                          <li>• Used only for barangay services and administration</li>
                          <li>• Shared only with authorized barangay officials</li>
                          <li>• Never sold to third parties</li>
                          <li>• Retained according to legal requirements</li>
                        </ul>
                      </div>
                    </div>
                  </section>
  
                  <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DocumentTextIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-orange-900 mb-2">Your Rights</h3>
                        <ul className="text-orange-800 space-y-1 text-sm">
                          <li>• Right to access your personal data</li>
                          <li>• Right to correct inaccurate information</li>
                          <li>• Right to request data deletion</li>
                          <li>• Right to data portability</li>
                        </ul>
                      </div>
                    </div>
                  </section>
  
                  <section className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ServerIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Data Retention</h3>
                        <ul className="text-gray-800 space-y-1 text-sm">
                          <li>• Active accounts: Data retained while account is active</li>
                          <li>• Inactive accounts: Data retained for 7 years per RA 11038</li>
                          <li>• Audit logs: Retained for 5 years for compliance</li>
                          <li>• Backup data: Retained according to backup policies</li>
                        </ul>
                      </div>
                    </div>
                  </section>
  
                  <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-indigo-900 mb-2">Contact Information</h3>
                        <p className="text-indigo-800 text-sm mb-2">
                          For privacy-related concerns, contact our Data Protection Officer:
                        </p>
                        <div className="text-indigo-800 text-sm space-y-1">
                          <p>• Email: privacy@barangay.gov.ph</p>
                          <p>• Phone: (02) 123-4567</p>
                          <p>• Office: Barangay Hall, Privacy Office</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
  
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowPrivacyPolicy(false)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
              Barangay e-Governance
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
              Resident's Registration Portal
            </p>
          </div>


          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Suffix</label>
                <input
                  type="text"
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(Optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09XXXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Complete Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="House No., Street, Barangay, City/Municipality, Province"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  name="termsAccepted"
                  checked={form.termsAccepted}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm font-light text-gray-600 dark:text-gray-300">
                  I accept the
                  <a href="#" className="font-medium text-blue-600 hover:underline dark:text-blue-400"> Terms and Conditions</a>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="privacy"
                  type="checkbox"
                  name="privacyPolicyAccepted"
                  checked={form.privacyPolicyAccepted}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="privacy" className="text-sm font-light text-gray-600 dark:text-gray-300">
                  I have read and agree to the
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyPolicy(true);
                    }} 
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  > Privacy Policy</button>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Create an Account
            </button>

            {status && <p className={`text-sm text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{status}</p>}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <a href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400"> Login here</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
