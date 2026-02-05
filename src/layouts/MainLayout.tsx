import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/stores/authStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // After logout, redirect to login and remember where the user was coming from.
    navigate('/login', { state: { from: location } });
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

        <main className="mt-16 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
