import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  CheckIcon,
  ClockIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axiosInstance from '../utils/axiosConfig';

const Notification = ({ user, authToken }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    if (!user || !authToken) return;
    try {
      const res = await axiosInstance.get('/notifications', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const notifList = res.data.notifications || [];
      setNotifications(notifList);
      setUnreadCount(notifList.filter(n => !n.read_at).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Fetch only when user ID or authToken changes
  useEffect(() => {
    if (user?.id && authToken) {
      fetchNotifications();
      // Optional: enable polling every 60s if needed
      // const interval = setInterval(fetchNotifications, 60000);
      // return () => clearInterval(interval);
    }
  }, [user?.id, authToken]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    if (filter === 'read') return !!n.read_at;
    return true;
  });

  const getNotificationIcon = (iconType) => {
    const iconClass = "w-4 h-4 text-white";
    switch (iconType) {
      case 'clock': return <ClockIcon className={iconClass} />;
      case 'cog': return <CogIcon className={iconClass} />;
      case 'check-circle': return <CheckCircleIcon className={iconClass} />;
      case 'x-circle': return <XCircleIcon className={iconClass} />;
      case 'document-check': return <DocumentCheckIcon className={iconClass} />;
      case 'document': return <DocumentTextIcon className={iconClass} />;
      case 'warning': return <ExclamationTriangleIcon className={iconClass} />;
      default: return <BellIcon className={iconClass} />;
    }
  };

  const getNotificationIconBg = (color) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'emerald': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getNotificationBgColor = (color) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'blue': return 'bg-blue-50 border-l-4 border-blue-400';
      case 'green': return 'bg-green-50 border-l-4 border-green-400 font-semibold';
      case 'red': return 'bg-red-50 border-l-4 border-red-400';
      case 'emerald': return 'bg-emerald-50 border-l-4 border-emerald-400';
      default: return 'bg-green-50 font-semibold';
    }
  };

  const getDocumentTypeBadge = (docType) => {
    switch (docType) {
      case 'Brgy Clearance': return 'bg-blue-100 text-blue-800';
      case 'Brgy Business Permit': return 'bg-purple-100 text-purple-800';
      case 'Brgy Indigency': return 'bg-orange-100 text-orange-800';
      case 'Brgy Residency': return 'bg-teal-100 text-teal-800';
      case 'Brgy Certification': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setNotifOpen(!notifOpen)}
        className="relative p-2 rounded-full hover:bg-green-100 transition"
        aria-label="Notifications"
      >
        <BellIcon className="w-7 h-7 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>
      {notifOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b font-bold text-green-700 flex items-center justify-between">
            Notifications
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-2 py-1 rounded ${filter==='all'?'bg-green-100 text-green-700':''}`}>All</button>
              <button onClick={() => setFilter('unread')} className={`px-2 py-1 rounded ${filter==='unread'?'bg-green-100 text-green-700':''}`}>Unread</button>
              <button onClick={() => setFilter('read')} className={`px-2 py-1 rounded ${filter==='read'?'bg-green-100 text-green-700':''}`}>Read</button>
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-center">No notifications</li>
            ) : (
              filteredNotifications.map(n => (
                <li key={n.id} className={`px-4 py-3 border-b ${n.read_at ? 'bg-white' : getNotificationBgColor(n.data.color || 'green')}`}>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationIconBg(n.data.color || 'green')}`}>
                          {getNotificationIcon(n.data.icon || 'bell')}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm mb-1">
                            {n.data.title || 'Notification'}
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed">
                            {n.data.message}
                          </div>
                          {n.data.document_type && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeBadge(n.data.document_type)}`}>
                                {n.data.certification_type || n.data.document_type}
                              </span>
                            </div>
                          )}
                          {n.data.status && (
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(n.data.status)}`}>
                                Status: {n.data.status}
                              </span>
                            </div>
                          )}
                          {Array.isArray(n.data.items) && n.data.items.length > 0 && (
                            <ul className="mt-2 ml-2 text-xs text-gray-600 list-disc">
                              {n.data.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.asset_name} (Qty: {item.quantity}, Date: {item.request_date})
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                            <span>{new Date(n.created_at).toLocaleString()}</span>
                            {n.data.document_request_id && (
                              <span className="text-gray-500">• Request #{n.data.document_request_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!n.read_at && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-4 h-4 text-gray-500 hover:text-green-600" />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notification;
