import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Error registering user";
      alert(msg);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
      <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
              <input name="username" type="text" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} onChange={handleChange} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
              <input name="full_name" type="text" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
            <input name="email" type="email" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input name="password" type="password" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Department</label>
            <input name="department" type="text" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} defaultValue="Computer Science" onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
            <select name="role" className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white' }} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="faculty">Teaching Faculty</option>
              <option value="dept_staff">Department Staff</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
