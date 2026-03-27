import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, Info, CreditCard } from 'lucide-react';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/requests');
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
      await api.post(`/admin/approve/${id}`, { status, remarks });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error recording action');
    }
  };

  if (loading) return null;

  return (
    <Layout title="Dues Clearance" role="Admin">
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Student Detail</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Dues Status</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No pending admin approvals.</td>
                </tr>
              ) : (
                requests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.roll_num}</div>
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {r.dues.map((d, i) => (
                          <div key={i} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.875rem',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.5rem',
                            background: d.is_cleared ? '#d1fae5' : '#fee2e2',
                            color: d.is_cleared ? '#065f46' : '#991b1b'
                          }}>
                            {d.is_cleared ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            <span style={{ textTransform: 'capitalize' }}>{d.type}: {d.amount > 0 ? `₹${d.amount}` : 'Clear'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button onClick={() => handleAction(r.id, 'approved')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                          Approve Clearance
                        </button>
                        <button onClick={() => handleAction(r.id, 'rejected')} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', background: '#eff6ff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bfdbfe', color: '#1e40af' }}>
          <Info size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Administrator Note</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              Admin approval is only possible once all student dues (Library, Hostel, Accounts) are marked as cleared in the database. 
              The system automatically validates this before allowing approval.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
