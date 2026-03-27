import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { BarChart3, PieChart, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/analytics');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return null;

    const cards = [
        { title: 'Total Requests', value: stats.total, icon: <BarChart3 size={24} />, color: '#4f46e5' },
        { title: 'Completed', value: stats.completed, icon: <CheckCircle size={24} />, color: '#10b981' },
        { title: 'Pending', value: stats.pending, icon: <Clock size={24} />, color: '#f59e0b' },
        { title: 'Rejected', value: stats.rejected, icon: <XCircle size={24} />, color: '#ef4444' },
    ];

    return (
        <Layout title="System Analytics" role="Admin/HOD">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {cards.map((c, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: `${c.color}20`, color: c.color, padding: '0.75rem', borderRadius: '0.75rem' }}>
                            {c.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{c.title}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{c.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Request Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', padding: '1rem 0' }}>
                    {cards.slice(1).map((c, i) => {
                        const height = stats.total > 0 ? (c.value / stats.total) * 100 : 0;
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: `${height}%`, 
                                    background: c.color, 
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: '4px',
                                    transition: 'height 1s ease-out'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
