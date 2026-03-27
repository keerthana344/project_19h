import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { UserCheck, Users, CheckCircle, XCircle } from 'lucide-react';

const HODDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hod/requests');
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
      await api.post(`/hod/approve/${id}`, { status, remarks });
      fetchRequests();
    } catch (err) {
      alert('Error recording action');
    }
  };

  const handleBulkApprove = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Approve ${selected.length} selected requests?`)) return;
    try {
      await api.post('/hod/bulk-approve', { request_ids: selected });
      setSelected([]);
      fetchRequests();
      alert('Bulk approval successful');
    } catch (err) {
      alert('Error in bulk approval');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (loading) return null;

  return (
    <Layout title="Final Approvals" role="HOD">
      <div style={{ display: 'grid', gap: '2rem' }}>
        {selected.length > 0 && (
          <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e0e7ff', border: '1px solid #818cf8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#3730a3', fontWeight: '600' }}>
              <Users size={20} />
              {selected.length} students selected for bulk approval
            </div>
            <button onClick={handleBulkApprove} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              Approve Selected
            </button>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => setSelected(e.target.checked ? requests.map(r => r.id) : [])} 
                    checked={selected.length === requests.length && requests.length > 0} 
                  />
                </th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Student Detail</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Current Stage</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No pending final approvals.</td>
                </tr>
              ) : (
                requests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(r.id)} 
                        onChange={() => toggleSelect(r.id)} 
                      />
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.roll_num}</div>
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button onClick={() => handleAction(r.id, 'approved')} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                          Final Approve
                        </button>
                        <button onClick={() => handleAction(r.id, 'rejected')} className="btn btn-danger" style={{ padding: '0.4rem 1rem' }}>
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
      </div>
    </Layout>
  );
};

export default HODDashboard;
