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
    first_name: '',
    middle_name: '',
    last_name: '',
    name_suffix: 'none',
    email: '',
    contact_number: '',
    sex: '',
    birth_date: '',
    current_address: '',
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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds) timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Password validation function
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar
    };
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

    // Validate mobile number format
    if (form.contact_number.length !== 11 || !form.contact_number.startsWith('09') || !/^09[0-9]{9}$/.test(form.contact_number)) {
      setError("Mobile number must be exactly 11 digits and start with 09.");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    // Validate birth date (must be in the past, not today or future)
    if (form.birth_date && new Date(form.birth_date) >= new Date(new Date().setHours(0,0,0,0))) {
      setError("Birth date must be in the past (not today or future).");
      setStatus('');
      setIsSuccess(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setError("Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.");
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
          name: `${form.first_name} ${form.middle_name ? form.middle_name + ' ' : ''}${form.last_name}${form.name_suffix && form.name_suffix !== 'none' ? ' ' + form.name_suffix : ''}`.trim(),
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          name_suffix: form.name_suffix,
          email: form.email,
          contact_number: form.contact_number,
          sex: form.sex,
          birth_date: form.birth_date,
          current_address: form.current_address,
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
        setTimeLeft(300);
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
        setTimeLeft(300);
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
    setTimeLeft(600);
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
                <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {timeLeft > 0 ? 'Time remaining (5 minutes)' : 'Code expired'}
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
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">
                  💡 Don't worry if you make a typo! You can correct any misspelled names later in your profile.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={form.middle_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(Optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Suffix</label>
                  <select
                    name="name_suffix"
                    value={form.name_suffix}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
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
                name="contact_number"
                value={form.contact_number}
                onChange={handleChange}
                required
                maxLength="11"
                pattern="09[0-9]{9}"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09XXXXXXXXX"
                title="Please enter a valid 11-digit mobile number starting with 09"
              />
              {form.contact_number && (
                <div className="mt-1 text-xs">
                  {form.contact_number.length === 11 && form.contact_number.startsWith('09') && /^09[0-9]{9}$/.test(form.contact_number) ? (
                    <span className="text-green-600">✓ Valid mobile number</span>
                  ) : (
                    <span className="text-red-600">
                      Mobile number must be 11 digits and start with 09
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Sex</label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Birth Date</label>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  required
                  max={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Birth date must be in the past (not today or future)"
                />
                {form.birth_date && new Date(form.birth_date) >= new Date(new Date().setHours(0,0,0,0)) && (
                  <div className="mt-1 text-xs text-red-600">
                    Birth date must be in the past (not today or future)
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Complete Address</label>
              <input
                type="text"
                name="current_address"
                value={form.current_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="House No., Street, Barangay, City/Municipality, Province"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Password Requirements:</div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(form.password).minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(form.password).minLength ? '✓' : '✗'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(form.password).hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(form.password).hasUppercase ? '✓' : '✗'}</span>
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(form.password).hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(form.password).hasLowercase ? '✓' : '✗'}</span>
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(form.password).hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(form.password).hasNumber ? '✓' : '✗'}</span>
                      <span>One number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${validatePassword(form.password).hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{validatePassword(form.password).hasSpecialChar ? '✓' : '✗'}</span>
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {form.confirmPassword && (
                <div className="mt-1 text-xs">
                  {form.password === form.confirmPassword ? (
                    <span className="text-green-600">✓ Passwords match</span>
                  ) : (
                    <span className="text-red-600">✗ Passwords do not match</span>
                  )}
                </div>
              )}
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
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsAndConditions(true);
                    }} 
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  > Terms and Conditions</button>
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
                  onClick={() => {
                    setShowPrivacyPolicy(false);
                    setForm(prevForm => ({
                      ...prevForm,
                      privacyPolicyAccepted: true
                    }));
                  }}
                  className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTermsAndConditions && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Terms and Conditions</h2>
                    <p className="text-green-100 text-sm">Barangay e-Governance System</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTermsAndConditions(false)}
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
                <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserGroupIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900 mb-2">Acceptance of Terms</h3>
                      <p className="text-green-800 text-sm mb-2">
                        By registering and using the Barangay e-Governance System, you agree to be bound by these Terms and Conditions.
                      </p>
                      <ul className="text-green-800 space-y-1 text-sm">
                        <li>• You must be a legitimate resident of the barangay</li>
                        <li>• You must provide accurate and truthful information</li>
                        <li>• You are responsible for maintaining account security</li>
                        <li>• You must comply with all applicable laws and regulations</li>
                      </ul>
                    </div>
                  </div>
                </section>
    
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2">User Responsibilities</h3>
                      <ul className="text-blue-800 space-y-1 text-sm">
                        <li>• Keep your login credentials secure and confidential</li>
                        <li>• Notify us immediately of any unauthorized access</li>
                        <li>• Use the system only for legitimate barangay services</li>
                        <li>• Respect other users and barangay officials</li>
                        <li>• Do not attempt to hack or compromise the system</li>
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
                      <h3 className="text-lg font-bold text-purple-900 mb-2">Service Usage</h3>
                      <ul className="text-purple-800 space-y-1 text-sm">
                        <li>• Access to barangay services and information</li>
                        <li>• Online document requests and applications</li>
                        <li>• Communication with barangay officials</li>
                        <li>• Participation in barangay programs and activities</li>
                        <li>• Access to community announcements and updates</li>
                      </ul>
                    </div>
                  </div>
                </section>
    
                <section className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <LockClosedIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-900 mb-2">Prohibited Activities</h3>
                      <ul className="text-orange-800 space-y-1 text-sm">
                        <li>• Sharing false or misleading information</li>
                        <li>• Impersonating other users or officials</li>
                        <li>• Spamming or sending unsolicited messages</li>
                        <li>• Uploading malicious software or content</li>
                        <li>• Violating any local, national, or international laws</li>
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
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Account Termination</h3>
                      <p className="text-gray-800 text-sm mb-2">
                        We reserve the right to suspend or terminate your account if you violate these terms.
                      </p>
                      <ul className="text-gray-800 space-y-1 text-sm">
                        <li>• Immediate termination for serious violations</li>
                        <li>• Warning system for minor infractions</li>
                        <li>• Right to appeal account suspension</li>
                        <li>• Data retention according to legal requirements</li>
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
                        For questions about these Terms and Conditions, contact:
                      </p>
                      <div className="text-indigo-800 text-sm space-y-1">
                        <p>• Email: legal@barangay.gov.ph</p>
                        <p>• Phone: (02) 123-4567</p>
                        <p>• Office: Barangay Hall, Legal Department</p>
                        <p>• Hours: Monday to Friday, 8:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
    
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTermsAndConditions(false);
                    setForm(prevForm => ({
                      ...prevForm,
                      termsAccepted: true
                    }));
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-green-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
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
