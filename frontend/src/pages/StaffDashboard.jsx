import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { Ticket, Download, Printer, User as UserIcon, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingStudent, setPrintingStudent] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/staff/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (student) => {
    try {
      await api.post(`/staff/issue/${student.id}`);
      setPrintingStudent(student);
      setTimeout(() => {
          window.print();
          setPrintingStudent(null);
          fetchRequests();
      }, 500);
    } catch (err) {
      alert('Error issuing hall ticket');
    }
  };

  if (loading) return null;

  return (
    <Layout title="Hall Ticket Issuance" role="Department Staff">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {requests.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
            <div style={{ background: '#f8fafc', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Ticket size={32} color="#94a3b8" />
            </div>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No pending hall tickets</h3>
            <p style={{ color: '#64748b' }}>When students complete all approval levels, they will appear here for issuance.</p>
          </div>
        ) : (
          requests.map(r => (
            <div key={r.id} className="card" style={{ border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#eef2ff', p: '0.75rem', borderRadius: '0.75rem', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={24} color="#4f46e5" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>{r.student_name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Roll: {r.roll_num}</p>
                  </div>
                </div>
                <div className="badge badge-approved" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                   <CheckCircle size={12} /> Approved
                </div>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <p style={{ color: '#475569', marginBottom: '0.5rem' }}><strong>Clearance Level:</strong> 100% Complete</p>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#10b981' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleIssue(r)} className="btn btn-primary" style={{ flex: 1, gap: '0.5rem' }}>
                  <Printer size={18} /> Issue Ticket
                </button>
                <button className="btn" style={{ background: '#f1f5f9', color: '#475569' }}>
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Print Styles */}
      <style>{`
          @media print {
              #root > div > div:not(.hall-ticket-print), nav, .btn, .badge, h2, .card {
                  display: none !important;
              }
              .hall-ticket-print {
                  display: block !important;
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  border: 2px solid #000;
                  padding: 2rem;
                  background: white;
                  color: black;
              }
          }
          .hall-ticket-print { display: none; }
      `}</style>

      {/* Hidden Printable Hall Ticket */}
      {printingStudent && (
          <div className="hall-ticket-print">
              <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '2rem', margin: 0 }}>COLLEGE NO-DUE CLEARANCE</h1>
                  <p style={{ margin: '0.5rem 0' }}>OFFICIAL HALL TICKET</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                      <p><strong>Student Name:</strong> {printingStudent.student_name}</p>
                      <p><strong>Roll Number:</strong> {printingStudent.roll_num}</p>
                      <p><strong>Status:</strong> CLEARED & ISSUED</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                      <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                      <div style={{ marginTop: '3rem' }}>
                          <div style={{ width: '150px', borderBottom: '1px solid black', marginLeft: 'auto' }}></div>
                          <p style={{ fontSize: '0.8rem' }}>Authorized Staff Signatory</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default StaffDashboard;
