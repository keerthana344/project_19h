import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch notifications - trying without trailing slash for compatibility
      const res = await api.get('/notifications');
      const newNotifs = res.data;
      const unread = newNotifs.filter(n => !n.is_read);
      
      // If unread count increased, show toast
      if (unread.length > unreadCount) {
        setToast(unread[0].message);
        setTimeout(() => setToast(null), 5000);
      }
      
      setNotifications(newNotifs);
      setUnreadCount(unread.length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [user, unreadCount]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds for "instant" feel
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead }}>
      {children}
      {toast && (
        <div className="glass-card animate-fade" style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, 
          padding: '1rem', borderLeft: '4px solid var(--primary)', 
          maxWidth: '320px', background: 'rgba(15, 23, 42, 0.9)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h4 style={{ color: 'var(--primary)', margin: 0 }}>New Notification</h4>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>{toast}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
