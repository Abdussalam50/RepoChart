import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Dashboard & Features
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ClientList } from './pages/clients/ClientList';
import { ClientForm } from './pages/clients/ClientForm';
import { UploadPage } from './pages/upload/UploadPage';

import { ChartBuilderPage } from './pages/report/ChartBuilderPage';
import { ReportBuilder } from './pages/report/ReportBuilder';
import { ReportList } from './pages/report/ReportList';
import { ReportPreviewPage } from './pages/report/ReportPreviewPage';
import { SharedDashboardPage } from './pages/dashboard/SharedDashboardPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminInvoicesPage } from './pages/admin/AdminInvoicesPage';
import { AdminSubscriptionsPage } from './pages/admin/AdminSubscriptionsPage';
import { AdminBroadcastPage } from './pages/admin/AdminBroadcastPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminManualPaymentsPage } from './pages/admin/AdminManualPaymentsPage';
import { AdminLayout } from './components/admin/AdminLayout';

function PrivateRoute() {
  const { token } = useAuthStore();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { token, user } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

export function App() {
  const { token, fetchMe } = useAuthStore();

  // Refresh user plan from backend on every app load so subscription status
  // (free → pro after Xendit payment webhook) is always current.
  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/:token" element={<SharedDashboardPage />} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/admin/broadcast" element={<AdminBroadcastPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/manual-payments" element={<AdminManualPaymentsPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />

          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id/builder" element={<ChartBuilderPage />} />
          <Route path="/reports/:id" element={<ReportBuilder />} />
        </Route>

        {/* Special Route for Backend PDF Generation */}
        <Route path="/report-preview/:id" element={<ReportPreviewPage />} />

        {/* Payment Redirects from Xendit */}
        <Route path="/payment-success" element={<Navigate to="/dashboard?payment=success" replace />} />
        <Route path="/payment-failure" element={<Navigate to="/dashboard?payment=failure" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
