import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

const ClearanceStatus = ({ requestId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/common/request/${requestId}/details`);
        setDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch clearance details", err);
      } finally {
        setLoading(false);
      }
    };
    if (requestId) fetchDetails();
  }, [requestId]);

  if (loading) return <div style={{ padding: '1rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={20} /></div>;
  if (!details) return null;

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
      <h5 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Clearance Progress Details</h5>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h6 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', opacity: 0.7 }}>Faculty Approvals</h6>
          {details.faculty_clearances.map(fc => (
            <div key={fc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>{fc.subject}</span>
              <StatusBadge status={fc.status} />
            </div>
          ))}
        </div>
        
        <div>
          <h6 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', opacity: 0.7 }}>Department Dues</h6>
          {details.department_clearances.map(dc => (
            <div key={dc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>{dc.dept_name}</span>
              <StatusBadge status={dc.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const color = status === 'approved' ? 'var(--success)' : status === 'rejected' ? 'var(--error)' : 'var(--text-muted)';
  const Icon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color }}>
      <Icon size={14} />
      <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{status}</span>
    </div>
  );
}

export default ClearanceStatus;
