import React, { useState } from 'react';
import { Bell, LogOut, Send, User, BarChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, title, role }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]); // Simplified for now
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { label: 'Dashboard', path: `/dashboard/${localStorage.getItem('role')}`, icon: <BarChart size={18} /> },
  ];

  if (['admin', 'hod'].includes(localStorage.getItem('role'))) {
    navItems.push({ label: 'Analytics', path: '/analytics', icon: <BarChart size={18} /> });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav className="glass" style={{ padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#4f46e5', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Send size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', lineHeight: 1 }}>No-Due Portal</h1>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role} Panel</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {navItems.map(item => (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: location.pathname === item.path ? '#4f46e5' : '#64748b',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: location.pathname === item.path ? '#eef2ff' : 'transparent'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn" style={{ background: 'none', border: 'none', position: 'relative', padding: '0.5rem' }}>
            <Bell size={22} color="#64748b" />
          </button>
          
          <div style={{ height: '2rem', width: '1px', background: '#e2e8f0' }}></div>
          
          <button onClick={handleLogout} className="btn" style={{ color: '#ef4444', gap: '0.5rem', padding: '0.5rem' }}>
            <LogOut size={18} /> <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Logout</span>
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
