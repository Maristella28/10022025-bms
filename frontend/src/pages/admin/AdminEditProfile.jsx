import React, { useState, useEffect, useRef } from 'react';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminEditProfile = () => {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', avatar: '', phone: '', address: '', position: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      console.log('AdminEditProfile user data:', user);
      setForm({
        name: user.name || user.profile?.name || '',
        email: user.email || user.profile?.email || '',
        avatar: user.avatar || user.profile?.avatar || '',
        phone: user.phone || user.profile?.phone || '',
        address: user.address || user.profile?.address || '',
        position: user.position || user.profile?.position || '',
      });
      setAvatarPreview(user.avatar || user.profile?.avatar || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Send data as JSON instead of FormData to avoid multipart parsing issues
      const dataToSend = { ...form };
      
      // Debug: Log what's being sent
      console.log('AdminEditProfile data being sent:', dataToSend);
      
      await axios.put('/admin/profile', dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });
      await fetchUser();
      setSuccess('Profile successfully updated!');
      // Store success message in sessionStorage to show on dashboard
      sessionStorage.setItem('adminProfileSuccess', 'Profile successfully updated!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1200);
    } catch (err) {
      console.error('AdminEditProfile error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white shadow-xl rounded-2xl p-10 border border-green-100">
          <div className="flex items-center mb-8">
            <div className="flex-shrink-0 relative group">
              <img
                className="h-20 w-20 rounded-full border-4 border-green-200 shadow-md object-cover"
                src={avatarPreview || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'}
                alt="Profile avatar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-green-700 text-white rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 transition group-hover:scale-110"
                title="Change avatar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l2 2a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
                </svg>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-extrabold text-green-900 tracking-tight mb-1">Edit Profile</h2>
              <p className="text-green-700 text-sm">Update your account information</p>
            </div>
          </div>
          {error && <div className="mb-4 text-red-600 font-semibold text-center bg-red-50 border border-red-200 rounded py-2">{error}</div>}
          {success && <div className="mb-4 text-green-700 font-semibold text-center bg-green-50 border border-green-200 rounded py-2">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-green-900 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-2 border border-green-200 rounded-lg shadow-sm placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-green-900 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-2 border border-green-200 rounded-lg shadow-sm placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  required
                />
              </div>
            </div>
            {/* Avatar URL field replaced by file upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-green-900 font-semibold mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-2 border border-green-200 rounded-lg shadow-sm placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  placeholder="e.g. 0917xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-green-900 font-semibold mb-2">Position</label>
                <input
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-2 border border-green-200 rounded-lg shadow-sm placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                  placeholder="e.g. Administrator"
                />
              </div>
            </div>
            <div>
              <label className="block text-green-900 font-semibold mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-2 border border-green-200 rounded-lg shadow-sm placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
                placeholder="e.g. 123 Main St, City"
              />
            </div>
            {/* Bio field removed */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-60"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProfile;
