import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TestProvider } from './context/TestContext';

import LoginPage from './pages/LoginPage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import GroupSuggestionPage from './pages/GroupSuggestionPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ReportPage from './pages/ReportPage';
import AllReportsPage from './pages/AllReportsPage';

import './App.css';
import Sidebar from './components/Sidebar';

// Protect student routes — redirect to /login if not logged in
function StudentRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'teacher') return <Navigate to="/dashboard" replace />;
  return children;
}

// Protect teacher routes
function TeacherRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/test" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <BrowserRouter>
          <Sidebar>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/test" element={
              <StudentRoute><TestPage /></StudentRoute>
            } />
            <Route path="/result" element={
              <StudentRoute><ResultPage /></StudentRoute>
            } />
            <Route path="/group" element={
              <StudentRoute><GroupSuggestionPage /></StudentRoute>
            } />
            <Route path="/report" element={
              <StudentRoute><ReportPage /></StudentRoute>
            } />
            <Route path="/dashboard" element={
              <TeacherRoute><TeacherDashboard /></TeacherRoute>
            } />
            <Route path="/reports" element={
              <TeacherRoute><AllReportsPage /></TeacherRoute>
            } />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Sidebar>
        </BrowserRouter>
      </TestProvider>
    </AuthProvider>
  );
}

export default App;
