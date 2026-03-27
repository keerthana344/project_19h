import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HODDashboard from './pages/HODDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Analytics from './pages/Analytics';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard/student" 
          element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard/faculty" 
          element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard/admin" 
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard/hod" 
          element={<ProtectedRoute allowedRoles={['hod']}><HODDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard/staff" 
          element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/analytics" 
          element={<ProtectedRoute allowedRoles={['admin', 'hod']}><Analytics /></ProtectedRoute>} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
