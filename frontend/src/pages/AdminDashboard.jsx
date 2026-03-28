import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, FileCheck, ShieldAlert, LogOut, CheckCircle2, Clock as ClockIcon } from 'lucide-react';
import ClearanceStatus from '../components/ClearanceStatus';
import NotificationBell from '../components/NotificationBell';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      const res = await api.get('/admin/all-status');
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve/${id}`);
      fetchData();
    } catch (err) {
      alert("Approval failed");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Admin Panel</h3>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <BarChart3 size={20} /> Analytics
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={20} /> Escalations
          </div>
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', cursor: 'pointer', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>System Management</h2>
            <p style={{ color: 'var(--text-muted)' }}>Monitoring every clearance stage in real-time.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <NotificationBell />
             <div className="status-badge" style={{ background: 'var(--glass)' }}>Role: Admin</div>
          </div>
        </header>

        <div className="glass-card animate-fade" style={{ marginBottom: '2rem' }}>
          <h3>Master Clearance Monitoring</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Reflection of every Faculty and HOD approval. Final button enables after HOD sign-off.</p>
          <div style={{ marginTop: '1rem' }}>
            {pending.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Request #{item.id} - Student: {item.student_username}</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: <span style={{ color: 'var(--primary)' }}>{item.status}</span></p>
                  </div>
                  {item.status === 'approved' ? (
                     <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={20} /> Fully Approved
                     </div>
                  ) : item.is_ready ? (
                    <button className="btn-primary" onClick={() => handleApprove(item.id)} style={{ background: 'var(--success)' }}>Issue Final Clearance</button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
                      <ClockIcon size={16} /> Awaiting HOD Sign-off
                    </div>
                  )}
                </div>
                <ClearanceStatus requestId={item.id} />
              </div>
            ))}
            {pending.length === 0 && !loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No requests in the system.</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <StatCard title="Total Users" value={stats?.total_users || 0} icon={<Users />} color="var(--primary)" />
          <StatCard title="Requests" value={stats?.total_requests || 0} icon={<FileCheck />} color="#8b5cf6" />
          <StatCard title="Approved" value={stats?.approved || 0} icon={<CheckCircle2 />} color="var(--success)" />
          <StatCard title="Pending" value={stats?.pending || 0} icon={<ClockIcon />} color="var(--pending)" />
        </div>

        <div className="glass-card animate-fade">
          <h3>Approval Trends</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '2rem 0' }}>
            <div style={{ width: '40px', height: '80%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '40px', height: '60%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '40px', height: '95%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
            <div style={{ width: '40px', height: '40%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card animate-fade" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
        <h2 style={{ margin: '0.5rem 0' }}>{value}</h2>
      </div>
      <div style={{ color }}>{React.cloneElement(icon, { size: 24 })}</div>
    </div>
  </div>
);

export default AdminDashboard;
