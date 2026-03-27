import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      navigate(`/dashboard/${res.data.role}`);
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      padding: '1rem'
    }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: '#64748b' }}>No-Due Clearance Management System</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#991b1b', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.625rem 0.75rem 0.625rem 2.5rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '0.5rem',
                  outline: 'none'
                }} 
                placeholder="Enter your username"
                required 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.625rem 0.75rem 0.625rem 2.5rem', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '0.5rem',
                  outline: 'none'
                }} 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          Contact administrator if you face any issues.
        </div>
      </div>
    </div>
  );
};

export default Login;
