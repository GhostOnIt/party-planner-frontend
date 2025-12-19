import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ServerErrorListener } from '@/components/ServerErrorListener';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';


// Auth components
import { PrivateRoute, PublicRoute, AdminRoute } from '@/components/auth';

// Auth pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OtpPage,
  SendOtpPage,
  ResetPasswordOtpPage,
} from '@/pages/auth';

// Main pages
import { DashboardPage } from '@/pages/DashboardPage';
import { CollaborationsPage } from '@/pages/CollaborationsPage';
import { InvitationsPage } from '@/pages/InvitationsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SubscriptionsPage } from '@/pages/SubscriptionsPage';
import { PlansPage } from '@/pages/PlansPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Event pages
import {
  EventsListPage,
  CreateEventPage,
  EventDetailsPage,
  EditEventPage,
} from '@/pages/events';

// Public pages (no auth required)
import { InvitationResponsePage } from '@/pages/public';

// Admin pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminEventsPage,
  AdminPaymentsPage,
  AdminSubscriptionsPage,
  AdminTemplatesPage,
  AdminActivityLogsPage,
} from '@/pages/admin';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes (redirect if authenticated) */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/send-otp" element={<SendOtpPage />} />
              <Route path="/reset-password-otp" element={<ResetPasswordOtpPage />} />
            </Route>
          </Route>

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/events" element={<EventsListPage />} />
              <Route path="/events/create" element={<CreateEventPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/events/:id/edit" element={<EditEventPage />} />
              <Route path="/collaborations" element={<CollaborationsPage />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/events" element={<AdminEventsPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="/admin/templates" element={<AdminTemplatesPage />} />
              <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
            </Route>
          </Route>

          {/* Public invitation page (no auth required) */}
          <Route path="/invitation/:token" element={<InvitationResponsePage />} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <ServerErrorListener />
    </QueryClientProvider>
  );
}

export default App;
