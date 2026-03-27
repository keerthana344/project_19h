import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { Check, X, AlertCircle, User as UserIcon } from 'lucide-react';

const FacultyDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/faculty/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const remarks = prompt(`Enter remarks for ${status}:`);
    if (remarks === null) return;
    try {
      await api.post(`/faculty/approve/${id}`, { status, remarks });
      fetchRequests();
    } catch (err) {
      alert('Error recording action');
    }
  };

  if (loading) return null;

  return (
    <Layout title="Student Requests" role="Faculty">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Student Detail</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Attendance</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No pending requests found.</td>
              </tr>
            ) : (
              requests.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ background: '#f1f5f9', p: '0.5rem', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={16} color="#64748b" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.roll_num}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {r.attendance.map((a, i) => (
                        <div key={i} style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.375rem',
                          background: a.percentage < 85 ? '#fee2e2' : '#f1f5f9',
                          color: a.percentage < 85 ? '#991b1b' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {a.percentage < 85 && <AlertCircle size={12} />}
                          {a.subject}: {a.percentage}%
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${r.status === 'pending' ? 'pending' : r.status === 'rejected' ? 'rejected' : 'approved'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => handleAction(r.id, 'approved')} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', gap: '0.25rem' }}>
                          <Check size={16} /> Approve
                        </button>
                        <button onClick={() => handleAction(r.id, 'rejected')} className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', gap: '0.25rem' }}>
                          <X size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
