import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../utils/axiosConfig';
import Notification from './Notification';

const Navbares = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const { user, fetchUser, logout } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const defaultAvatar = "https://flowbite.com/docs/images/people/profile-picture-5.jpg";

  const avatarUrl = useMemo(() => {
    const timestamp = new Date().getTime();
    // Check for avatar in profile data (both avatar and current_photo fields)
    const avatarPath = user?.profile?.avatar || user?.profile?.current_photo;
    if (avatarPath) {
      return `http://localhost:8000/storage/${avatarPath}?t=${timestamp}`;
    }
    return defaultAvatar;
  }, [user?.profile?.avatar, user?.profile?.current_photo, user?.profile]);

  // Removed duplicate fetchUser call; AuthContext already fetches user on app load

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      // The Notification component will handle refetching
    } catch (err) {
      // handle error
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    if (filter === 'read') return !!n.read_at;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-green-900 via-green-800 to-green-700 shadow-lg border-b border-green-900">
      <div className="px-4 py-3 lg:px-6 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center ml-2">
            <img
              src="/assets/images/logo.jpg"
              alt="Barangay Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full border-2 border-white shadow-lg hover:scale-105 transition duration-300"
            />


            <span className="ml-4 text-2xl font-extrabold text-white drop-shadow-sm hidden sm:block">
              Resident Portal
            </span>
          </Link>
        </div>

        {/* Avatar + Dropdown */}
        {user && (
          <div className="flex items-center gap-4">
            <Notification user={user} authToken={localStorage.getItem('authToken')} />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center p-1 rounded-full ring-2 ring-white/60 hover:ring-green-300 transition-all duration-200 shadow-md focus:outline-none focus:ring-4"
                aria-label="User menu"
              >
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-11 h-11 rounded-full object-cover hover:shadow-lg transition-transform transform hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl z-50 animate-fade-in-up border border-gray-200 overflow-hidden">
                  <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                    <p className="text-base font-semibold text-gray-900">
                      {user.name || 'Resident Name'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email || 'email@example.com'}
                    </p>
                  </div>
                  <ul className="py-2 text-sm text-gray-700">
                    <NavItem to="/" icon="fa-home" label="Home" />
                    <NavItem to="/user/profile" icon="fa-user" label="Profile" />
                    <NavItem to="/messages" icon="fa-envelope" label="Messages" />
                    <NavItem to="/settings" icon="fa-cog" label="Settings" />
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition duration-200 w-full text-left"
                      >
                        <i className="fas fa-sign-out-alt w-5 mr-2" /> Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// 🔧 Reusable nav item component
const NavItem = ({ to, icon, label }) => (
  <li>
    <Link
      to={to}
      className="flex items-center px-4 py-2 hover:bg-green-100 hover:text-green-700 transition duration-200"
    >
      <i className={`fas ${icon} w-5 mr-2 text-green-600`} />
      {label}
    </Link>
  </li>
);

export default Navbares;
