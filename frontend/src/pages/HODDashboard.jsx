import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Award, CheckCircle, Clock } from 'lucide-react';
import ClearanceStatus from '../components/ClearanceStatus';
import NotificationBell from '../components/NotificationBell';

const HODDashboard = () => {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await api.get('/hod/pending-all');
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

  const handleApprove = async (id) => {
    try {
      await api.post(`/hod/approve/${id}`);
      fetchPending();
    } catch (err) {
      alert("Final approval failed");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>HOD Portal</h3>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <Award size={20} /> Final Approvals
          </div>
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', cursor: 'pointer', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2>HOD Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <div className="status-badge" style={{ background: 'var(--glass)' }}>Role: HOD</div>
          </div>
        </header>

        <div className="glass-card animate-fade" style={{ marginBottom: '2rem' }}>
          <h3>All Ongoing Clearance Requests</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Monitoring all student progress. Action button enables once all Faculty members approve.</p>
          <div style={{ marginTop: '1rem' }}>
            {pending.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Request #{item.id} - Student: {item.student_username}</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: <span style={{ color: 'var(--primary)' }}>{item.status}</span></p>
                  </div>
                  {item.is_ready ? (
                    <button className="btn-primary" onClick={() => handleApprove(item.id)} style={{ background: 'var(--success)' }}>
                      <CheckCircle size={18} style={{ marginRight: '0.5rem' }} /> Final Sign-off
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
                      <Clock size={16} /> Awaiting Faculty Approvals
                    </div>
                  )}
                </div>
                <ClearanceStatus requestId={item.id} />
              </div>
            ))}
            {pending.length === 0 && !loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No student requests in progress.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
