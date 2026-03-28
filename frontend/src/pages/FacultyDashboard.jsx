import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Check, X, AlertTriangle, LogOut, Users, ClipboardCheck } from 'lucide-react';
import ClearanceStatus from '../components/ClearanceStatus';
import NotificationBell from '../components/NotificationBell';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await api.get('/faculty/pending');
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    const remarks = prompt("Enter remarks (optional):");
    try {
      await api.post(`/faculty/approve/${id}?status=${action === 'approve' ? 'approved' : 'rejected'}&remarks=${remarks || ''}`);
      fetchPending();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Faculty Portal</h3>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <ClipboardCheck size={20} /> Pending Approvals
          </div>
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', cursor: 'pointer', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2>Faculty Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <div className="status-badge" style={{ background: 'var(--glass)' }}>Dept: {user?.department || 'General'}</div>
          </div>
        </header>

        <div className="glass-card animate-fade">
          <h3>Approvals Needed</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Review student eligibility based on attendance (min 85%) and dues.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {pending.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Student Request #{item.request_id}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>Subject: <span style={{ color: 'var(--text)' }}>{item.subject}</span></p>
                    <p style={{ color: item.attendance < 85 ? 'var(--error)' : 'var(--success)' }}>
                      Attendance: {item.attendance}% {item.attendance < 85 && <AlertTriangle size={14} style={{ marginLeft: 4 }} />}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ background: 'var(--success)' }} onClick={() => handleAction(item.id, 'approve')}>Approve</button>
                    <button className="btn-primary" style={{ background: 'var(--error)' }} onClick={() => handleAction(item.id, 'reject')}>Reject</button>
                  </div>
                </div>
                
                {/* Visual Reflection: show what others have done */}
                <ClearanceStatus requestId={item.request_id} />
              </div>
            ))}
            {pending.length === 0 && !loading && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending approvals!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
