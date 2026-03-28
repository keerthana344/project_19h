import React from 'react';
import { Printer } from 'lucide-react';

const HallTicket = ({ data }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const dateObj = new Date(data.date);
  const formattedDate = dateObj.toLocaleDateString('en-GB'); 
  // Custom format to match "28/3/2026, 2:31:15 pm"
  const generatedTime = new Date().toLocaleString('en-GB', { 
    day: 'numeric', month: 'numeric', year: 'numeric', 
    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true 
  }).toLowerCase(); // strictly matched

  // Mocking the ticket ID hash to match the layout
  const hash = (data.request_id * 892347).toString(16).toUpperCase().padStart(8, '0');
  const ticketId = `HT-${data.student.username.toUpperCase()}-${hash}`;

  const labelStyle = { color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.35rem', marginTop: '1.5rem' };
  const valueStyle = { fontSize: '1.125rem', fontWeight: '700', color: '#111827' };

  return (
    <div className="hall-ticket-container" style={{ padding: '3rem 4rem', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}>
          🎓 No-Due Clearance Hall Ticket
        </h1>
        <p style={{ margin: '0.5rem 0 2rem 0', color: '#6b7280', fontSize: '1.25rem' }}>Official Document</p>
      </div>

      <hr style={{ border: 'none', borderTop: '3px solid #111827', marginBottom: '3rem' }} />

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ color: '#15803d', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Ticket: {ticketId}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '5rem' }}>
        {/* Left Column */}
        <div>
          <div style={{ ...labelStyle, marginTop: 0 }}>Student Name</div>
          <div style={valueStyle}>{data.student.name}</div>

          <div style={labelStyle}>Department</div>
          <div style={valueStyle}>{data.student.department}</div>

          <div style={labelStyle}>Email</div>
          <div style={valueStyle}>{data.student.email || `${data.student.username}@test.com`}</div>

          <div style={labelStyle}>Issued Date</div>
          <div style={valueStyle}>{formattedDate}</div>
        </div>

        {/* Right Column */}
        <div>
          <div style={{ ...labelStyle, marginTop: 0 }}>Roll Number</div>
          <div style={valueStyle}>{data.student.username.toUpperCase()}</div>

          <div style={labelStyle}>Semester</div>
          <div style={valueStyle}>8</div>

          <div style={labelStyle}>Issued By</div>
          <div style={valueStyle}>Test Staff</div>

          <div style={labelStyle}>Status</div>
          <div style={valueStyle}>✅ All Dues Cleared</div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '1.5rem' }} />

      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>This is a computer-generated document.</p>
        <p style={{ margin: 0 }}>Generated on {generatedTime}</p>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="no-print" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Print Hall Ticket
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .hall-ticket-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default HallTicket;
