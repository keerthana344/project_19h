import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bell, CheckCircle, XCircle, Clock, Send, LogOut } from 'lucide-react';

const StudentDashboard = () => {
    const [status, setStatus] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statusRes, notifRes] = await Promise.all([
                api.get('/student/status'),
                api.get('/notifications')
            ]);
            setStatus(statusRes.data);
            setNotifications(notifRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/read/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const getStepStatus = (stepName) => {
        if (!status) return 'pending';
        const order = ['pending', 'faculty_approved', 'admin_approved', 'hod_approved', 'completed'];
        const currentIdx = order.indexOf(status.status);
        const stepIdx = order.indexOf(stepName);

        if (status.status === 'rejected') return 'rejected';
        if (currentIdx >= stepIdx) return 'completed';
        if (currentIdx + 1 === stepIdx) return 'active';
        return 'pending';
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="animate-spin" style={{ width: '3rem', height: '3rem', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }}></div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Navbar */}
            <nav className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ background: '#4f46e5', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        <Send size={20} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>No-Due Portal</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={24} color="#64748b" />
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span style={{ position: 'absolute', top: -2, right: -2, background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '10px' }}>
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                        </button>
                        {showNotifs && (
                            <div className="card" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 20 }}>
                                <h4 style={{ marginBottom: '1rem' }}>Notifications</h4>
                                {notifications.length === 0 ? (
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>No notifications yet.</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', opacity: n.is_read ? 0.6 : 1 }}>
                                            <div>
                                                <p style={{ fontSize: '0.875rem' }}>{n.message}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.timestamp).toLocaleString()}</span>
                                            </div>
                                            {!n.is_read && (
                                                <button onClick={() => markAsRead(n.id)} style={{ fontSize: '0.7rem', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>Mark read</button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ color: '#ef4444', gap: '0.5rem' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Student Dashboard</h2>
                    <p style={{ color: '#64748b' }}>Manage your clearance requests and track their status in real-time.</p>
                </div>

                {!status || status.status === 'rejected' ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ background: '#eef2ff', color: '#4f46e5', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Send size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                            {status?.status === 'rejected' ? 'Your previous request was rejected' : 'Ready to start your clearance?'}
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                            Submit your request to start the multi-level approval process. Ensure your attendance is above 85% for faster processing.
                        </p>
                        <button onClick={submitRequest} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                            Submit Clearance Request
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {/* Status Tracker */}
                        <div className="card">
                            <h3 style={{ marginBottom: '2rem' }}>Clearance Progress</h3>
                            <div className="stepper">
                                {['pending', 'faculty_approved', 'admin_approved', 'hod_approved', 'completed'].map((step, i) => {
                                    const stepStatus = getStepStatus(step);
                                    const labels = ['Submission', 'Faculty', 'Admin', 'HOD', 'Staff'];
                                    return (
                                        <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                                            <div className={`step ${stepStatus}`} style={{ margin: '0 auto', marginBottom: '0.5rem' }}>
                                                {stepStatus === 'completed' ? <CheckCircle size={20} /> : i + 1}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: stepStatus === 'pending' ? '#94a3b8' : '#1e293b' }}>
                                                {labels[i]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {status.status === 'completed' ? (
                                    <CheckCircle size={24} color="#10b981" />
                                ) : (
                                    <Clock size={24} color="#f59e0b" />
                                )}
                                <div>
                                    <h4 style={{ fontSize: '1rem' }}>Current State: {status.status.replace('_', ' ').toUpperCase()}</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {status.status === 'completed' ? 'Your clearance is complete. You can now download your hall ticket.' : 'Your request is being reviewed by the respective authorities.'}
                                    </p>
                                </div>
                                {status.status === 'completed' && (
                                    <button onClick={handlePrint} className="btn btn-primary" style={{ marginLeft: 'auto', gap: '0.5rem' }}>
                                        <Send size={18} /> Print Hall Ticket
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Approval Timeline Details */}
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Approval Logs</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {status.approvals.length === 0 ? (
                                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Waiting for the first level of approval...</p>
                                ) : (
                                    status.approvals.map((a, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderLeft: '2px solid #e2e8f0' }}>
                                            <div style={{ marginTop: '0.25rem' }}>
                                                {a.status === 'approved' ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{a.role.toUpperCase()}</span>
                                                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                                                </div>
                                                {a.remarks && <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#475569' }}>"{a.remarks}"</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Print Styles */}
            <style>{`
                @media print {
                    nav, .btn, .badge, .stepper, h2, p, .card:not(.hall-ticket) {
                        display: none !important;
                    }
                    .hall-ticket {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        border: 2px solid #000;
                        padding: 2rem;
                    }
                }
                .hall-ticket { display: none; }
            `}</style>

            {/* Hidden Printable Hall Ticket */}
            <div className="hall-ticket" style={{ background: 'white' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>COLLEGE NO-DUE CLEARANCE</h1>
                    <p style={{ margin: '0.5rem 0' }}>OFFICIAL HALL TICKET</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <p><strong>Student Name:</strong> {status?.student_name || 'N/A'}</p>
                        <p><strong>Roll Number:</strong> {status?.roll_num || 'N/A'}</p>
                        <p><strong>Status:</strong> CLEARED</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
                        <div style={{ marginTop: '3rem' }}>
                            <div style={{ width: '150px', borderBottom: '1px solid black', marginLeft: 'auto' }}></div>
                            <p style={{ fontSize: '0.8rem' }}>Authorized Signatory</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
