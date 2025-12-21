import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ServerErrorListener } from '@/components/ServerErrorListener';
import { Skeleton } from '@/components/ui/skeleton';

// Layouts (chargés immédiatement car utilisés partout)
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Auth components (chargés immédiatement)
import { PrivateRoute, PublicRoute, AdminRoute } from '@/components/auth';

// Lazy loading des pages pour améliorer les performances
// Auth pages
const LoginPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.ResetPasswordPage })));
const OtpPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.OtpPage })));
const SendOtpPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.SendOtpPage })));
const ResetPasswordOtpPage = lazy(() => import('@/pages/auth').then(m => ({ default: m.ResetPasswordOtpPage })));

// Main pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CollaborationsPage = lazy(() => import('@/pages/CollaborationsPage').then(m => ({ default: m.CollaborationsPage })));
const InvitationsPage = lazy(() => import('@/pages/InvitationsPage').then(m => ({ default: m.InvitationsPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const PlansPage = lazy(() => import('@/pages/PlansPage').then(m => ({ default: m.PlansPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Event pages
const EventsListPage = lazy(() => import('@/pages/events').then(m => ({ default: m.EventsListPage })));
const CreateEventPage = lazy(() => import('@/pages/events').then(m => ({ default: m.CreateEventPage })));
const EventDetailsPage = lazy(() => import('@/pages/events').then(m => ({ default: m.EventDetailsPage })));
const EditEventPage = lazy(() => import('@/pages/events').then(m => ({ default: m.EditEventPage })));

// Public pages
const InvitationResponsePage = lazy(() => import('@/pages/public').then(m => ({ default: m.InvitationResponsePage })));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminUsersPage })));
const AdminEventsPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminEventsPage })));
const AdminPaymentsPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminPaymentsPage })));
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminSubscriptionsPage })));
const AdminTemplatesPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminTemplatesPage })));
const AdminActivityLogsPage = lazy(() => import('@/pages/admin').then(m => ({ default: m.AdminActivityLogsPage })));

// Composant de chargement
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 w-full max-w-md p-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2 mt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
      <Toaster />
      <ServerErrorListener />
    </QueryClientProvider>
  );
}

export default App;
