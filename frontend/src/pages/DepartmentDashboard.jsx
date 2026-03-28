import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, FileText, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import ClearanceStatus from '../components/ClearanceStatus';
import NotificationBell from '../components/NotificationBell';
import HallTicketComponent from '../components/HallTicket';

const DepartmentDashboard = () => {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [cleared, setCleared] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHallTicket, setShowHallTicket] = useState(false);
  const [hallTicketData, setHallTicketData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/department/all-status');
      setPending(res.data);
      
      // Fetch fully approved requests (reflection)
      const allRes = await api.get('/admin/all-status'); 
      const fullyCleared = allRes.data.filter(r => r.status === 'approved');
      setCleared(fullyCleared);
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

  const approve = async (id) => {
    try {
      await api.post(`/department/approve/${id}`);
      fetchData();
    } catch (err) {
      alert("Approval failed");
    }
  };

  const fetchHallTicket = async (requestId) => {
    try {
      const res = await api.get(`/department/hall-ticket/request/${requestId}`);
      setHallTicketData(res.data);
      setShowHallTicket(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not generate hall ticket.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="glass-card" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Dept Portal</h3>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <Briefcase size={20} /> Department Dues
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <CheckCircle size={20} /> Cleared Students
          </div>
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', cursor: 'pointer', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2>{user?.department} Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <div className="status-badge" style={{ background: 'var(--glass)' }}>Staff: {user?.username}</div>
          </div>
        </header>

        {showHallTicket && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '850px' }}>
              <button 
                onClick={() => setShowHallTicket(false)} 
                style={{ position: 'absolute', right: '-1rem', top: '-1rem', background: 'var(--error)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={24} />
              </button>
              <HallTicketComponent data={hallTicketData} />
            </div>
          </div>
        )}

        <div className="glass-card animate-fade" style={{ marginBottom: '2rem' }}>
          <h3>Department Dues Monitoring</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Reflection of Admin status. Button enables after Admin signature.</p>
          <div style={{ listStyle: 'none', marginTop: '1.5rem' }}>
            {pending.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>Request #{item.request_id} - Student: {item.student_username}</span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status: <span style={{ color: 'var(--primary)' }}>{item.status}</span></p>
                  </div>
                  {item.status === 'approved' ? (
                     <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} /> Cleared
                     </div>
                  ) : item.is_ready ? (
                    <button className="btn-primary" onClick={() => approve(item.id)} style={{ background: 'var(--success)' }}>Clear Department Dues</button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
                       <ClockIcon size={16} /> Awaiting Admin Sign-off
                    </div>
                  )}
                </div>
                <ClearanceStatus requestId={item.request_id} />
              </div>
            ))}
            {pending.length === 0 && !loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No students in this department yet.</p>}
          </div>
        </div>

        <div className="glass-card animate-fade">
          <h3>Fully Cleared Students (Reflection)</h3>
          <div style={{ listStyle: 'none', marginTop: '1.5rem' }}>
            {cleared.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                 <div>
                   <span style={{ fontWeight: '600', marginRight: '1rem' }}>Request #{item.id} - Student {item.student_username}</span>
                   <span className="status-badge status-approved">Fully Cleared</span>
                 </div>
                 <button className="btn-primary tooltip" onClick={() => fetchHallTicket(item.id)} style={{ background: 'var(--success)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Generate Hall Ticket</button>
              </div>
            ))}
            {cleared.length === 0 && !loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No students fully cleared yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
