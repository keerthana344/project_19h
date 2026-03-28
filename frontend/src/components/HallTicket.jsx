import React from 'react';
import { CheckCircle2, ShieldCheck, Printer, Download } from 'lucide-react';

const HallTicket = ({ data }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="hall-ticket-container" style={{ padding: '2rem', background: 'white', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#6366f1', fontSize: '2rem' }}>COLLEGE OF EXCELLENCE</h1>
        <p style={{ margin: '0.5rem 0', fontWeight: '600', color: '#64748b' }}>OFFICIAL SEMESTER HALL TICKET</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', color: '#166534', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold', marginTop: '1rem' }}>
          <ShieldCheck size={18} /> FULLY CLEARED & ELIGIBLE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Student Name</p>
          <strong style={{ fontSize: '1.25rem' }}>{data.student.name}</strong>
          
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Department</p>
          <strong style={{ fontSize: '1.1rem' }}>{data.student.department}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Roll Number</p>
          <strong style={{ fontSize: '1.25rem' }}>{data.student.username}</strong>
          
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Clearance ID</p>
          <strong style={{ fontSize: '1.1rem' }}>#NDCS-{data.request_id}</strong>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '3rem' }}>
        <div style={{ background: '#f8fafc', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
          Approval Manifest
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Faculty Approved</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>HOD Signed</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 color="#10b981" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Admin Verified</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4rem' }}>
        <div style={{ width: '150px', borderTop: '1px solid #cbd5e1', textAlign: 'center', paddingTop: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', margin: 0 }}>Student Signature</p>
        </div>
        <div style={{ textAlign: 'center' }}>
           <div style={{ width: '80px', height: '80px', margin: '0 auto', background: '#f1f5f9', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>SEAL</div>
           <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Institution Seal</p>
        </div>
        <div style={{ width: '150px', borderTop: '1px solid #cbd5e1', textAlign: 'center', paddingTop: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', margin: 0 }}>Admin Authority</p>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Print Hall Ticket
        </button>
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .hall-ticket-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};

export default HallTicket;
