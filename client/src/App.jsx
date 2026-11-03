import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProjectsList } from './pages/projects/ProjectsList';
import { ProjectDetail } from './pages/projects/ProjectDetail';
import { ActivitiesList } from './pages/activities/ActivitiesList';
import { SurvivalMonitoring } from './pages/survival/SurvivalMonitoring';
import { ProjectMap } from './pages/map/ProjectMap';
import { SmartAlerts } from './pages/alerts/SmartAlerts';
import { AuditHistory } from './pages/audit/AuditHistory';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Route Guard component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8faf9]">
        <LoadingSpinner text="Authenticating session tokens..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (Redirects away from login if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#081c15]">
        <LoadingSpinner text="Checking session..." size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Auth Route */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Protected SaaS Application Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="activities" element={<ActivitiesList />} />
                <Route path="survival" element={<SurvivalMonitoring />} />
                <Route path="map" element={<ProjectMap />} />
                <Route path="alerts" element={<SmartAlerts />} />
                <Route path="audit" element={<AuditHistory />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

