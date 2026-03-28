import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ cursor: 'pointer', position: 'relative', padding: '0.5rem', background: 'var(--glass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--error)', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '10px', border: '2px solid var(--bg)' }}>
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="glass-card animate-fade" style={{ position: 'absolute', top: '120%', right: 0, width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, padding: '1rem', border: '1px solid var(--glass-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            <X size={16} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: '0.75rem', background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.875rem', position: 'relative' }}>
                  <p style={{ margin: 0, color: n.is_read ? 'var(--text-muted)' : 'var(--text)' }}>{n.message}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</p>
                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
