import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/stores/authStore';
  import api from '@/api/client';
 import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { OnboardingRunner } from '@/components/onboarding/OnboardingRunner';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminSection = location.pathname.startsWith('/admin');
   const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 
  const handleLogout = async () => {
    // Call API to revoke access token + refresh token cookie before clearing local state
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors (token may already be expired)
    }
     logout();
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isAdmin={user.role === 'admin'} onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] p-0">
          <Sidebar isAdmin={user.role === 'admin'} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-[250px]">
        <Header
          user={user}
          onMenuClick={() => setMobileMenuOpen(true)}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />

        <main className={cn('mt-16 p-4 lg:p-6', isAdminSection && 'bg-slate-50/80 min-h-[calc(100vh-4rem)]')}>
          {isAdminSection && (
            <div
              className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950"
              role="status"
            >
              <strong className="font-semibold">Administration plateforme</strong>
              <span className="text-indigo-900/90">
                {' '}
                — Paiements, utilisateurs et statistiques globales (hors contexte d&apos;un seul événement).
              </span>
            </div>
          )}
          <OnboardingRunner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
