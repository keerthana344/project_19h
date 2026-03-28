import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, XCircle, Clock, LayoutDashboard, FileText, Bell, LogOut } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import HallTicketComponent from '../components/HallTicket';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [request, setRequest] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHallTicket, setShowHallTicket] = useState(false);
  const [hallTicketData, setHallTicketData] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/student/details');
      setRequest(res.data.request);
      setDetails(res.data);
    } catch (err) {
      console.log("No request found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const submitRequest = async () => {
    try {
      await api.post('/student/request');
      fetchStatus();
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  const fetchHallTicket = async () => {
    try {
      const res = await api.get('/student/hall-ticket');
      setHallTicketData(res.data);
      setShowHallTicket(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not generate hall ticket. Ensure all clearances are approved.");
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}><Loader2 className="animate-spin" /></div>;

  const isFullyApproved = request?.status === 'approved' && details?.department_clearances.every(dc => dc.status === 'approved');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="glass-card" style={{ width: '260px', borderRadius: '0', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>No-Due Portal</h3>
        <nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <FileText size={20} /> My Requests
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <Bell size={20} /> Notifications
          </div>
        </nav>
        <div style={{ position: 'absolute', bottom: '2rem', cursor: 'pointer', color: 'var(--error)' }} onClick={logout}>
          <LogOut size={20} /> Logout
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2>Welcome, {user?.username}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isFullyApproved && (
              <button className="btn-primary animate-fade" onClick={fetchHallTicket} style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> Generate Hall Ticket
              </button>
            )}
            <NotificationBell />
            <div className="status-badge" style={{ background: 'var(--glass)' }}>Role: Student</div>
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

        {!request ? (
          <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '4rem' }}>
            <FileText size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3>No Active Clearance Request</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Submit a new request to start the clearance process.</p>
            <button className="btn-primary" onClick={submitRequest}>Start Clearance Process</button>
          </div>
        ) : (
          <div className="animate-fade">
            <div className="glass-card" style={{ marginBottom: '2rem' }}>
              <h3>Clearance Progress</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', position: 'relative' }}>
                <ProgressBar request={request} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="glass-card">
                <h4>Faculty Approvals</h4>
                <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                  {details?.faculty_clearances.map(fc => (
                    <li key={fc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span>{fc.subject}</span>
                      <StatusSpan status={fc.status} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card">
                <h4>Department Dues</h4>
                <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                  {details?.department_clearances.map(dc => (
                    <li key={dc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                      <span>{dc.dept_name}</span>
                      <StatusSpan status={dc.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusSpan = ({ status }) => {
  const className = status === 'approved' ? 'status-approved' : status === 'rejected' ? 'status-rejected' : 'status-pending';
  return <span className={`status-badge ${className}`}>{status}</span>;
}

const ProgressBar = ({ request }) => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 1rem' }}>
      <Step name="Submitted" done />
      <Step name="Faculty" done={request.status !== 'pending'} />
      <Step name="HOD" done={request.status === 'hod_approved' || request.status === 'admin_approved' || request.status === 'approved'} />
      <Step name="Depts & Admin" done={request.status === 'approved'} />
    </div>
  );
}

const Step = ({ name, done }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      width: '32px', height: '32px', borderRadius: '50%', background: done ? 'var(--success)' : 'var(--glass)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' 
    }}>
      {done ? <CheckCircle2 size={16} /> : <Clock size={16} />}
    </div>
    <span style={{ fontSize: '0.875rem' }}>{name}</span>
  </div>
);

export default StudentDashboard;
