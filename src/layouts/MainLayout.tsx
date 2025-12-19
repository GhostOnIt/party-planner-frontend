import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/stores/authStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useUnreadNotificationsCount } from '@/hooks/useNotifications';

export function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount } = useUnreadNotificationsCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
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
    <div className="min-h-screen bg-muted/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isAdmin={user.role === 'admin'} onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar isAdmin={user.role === 'admin'} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-64">
        <Header
          user={user}
          unreadNotifications={unreadCount || 0}
          onMenuClick={() => setMobileMenuOpen(true)}
          onNotificationsClick={handleNotificationsClick}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
