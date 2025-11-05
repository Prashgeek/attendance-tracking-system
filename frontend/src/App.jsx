// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

// Simple placeholders for Teacher and Student
const TeacherDashboard = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h2>Teacher Dashboard</h2>
    <p>Welcome, Teacher! Your dashboard is under development.</p>
  </div>
);

const StudentDashboard = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h2>Student Dashboard</h2>
    <p>Welcome, Student! Your dashboard is under development.</p>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Admin protected parent: /admin/* */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Teacher simple route */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student simple route */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
