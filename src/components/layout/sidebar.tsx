import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bell,
  Settings,
  LogOut,
  Crown,
  Mail,
  CreditCard,
  User,
  FileText,
  Activity,
  Package,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.png';

interface SidebarProps {
  isAdmin?: boolean;
  onLogout: () => void;
}

interface NavItem {
  to: string;
  icon: LucideIcon;
  labelKey: string;
  end?: boolean;
}

const mainNavItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/events', icon: Calendar, labelKey: 'nav.events' },
  { to: '/invitations', icon: Mail, labelKey: 'nav.invitations' },
  { to: '/subscriptions', icon: CreditCard, labelKey: 'nav.subscriptions' },
  { to: '/notifications', icon: Bell, labelKey: 'nav.notifications' },
];

const adminNavItems: NavItem[] = [
  { to: '/admin', icon: Crown, labelKey: 'nav.adminDashboard', end: true },
  { to: '/admin/users', icon: Users, labelKey: 'nav.adminUsers' },
  { to: '/admin/events', icon: Calendar, labelKey: 'nav.adminEvents' },
  { to: '/admin/payments', icon: CreditCard, labelKey: 'nav.adminPayments' },
  { to: '/admin/subscriptions', icon: FileText, labelKey: 'nav.adminSubscriptions' },
  { to: '/admin/plans', icon: Package, labelKey: 'nav.adminPlans' },
  { to: '/admin/templates', icon: FileText, labelKey: 'nav.adminTemplates' },
  { to: '/admin/activity-logs', icon: Activity, labelKey: 'nav.adminActivityLogs' },
];

const bottomNavItems: NavItem[] = [
  { to: '/profile', icon: User, labelKey: 'nav.profile' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function Sidebar({ isAdmin = false, onLogout }: SidebarProps) {
  const { t } = useTranslation();
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src={logo} alt={t('app.name')} className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold">{t('app.name')}</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <>
            <Separator className="my-4" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Administration
            </p>
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t p-3">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {t(item.labelKey)}
            </NavLink>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            {t('nav.logout')}
          </Button>
        </nav>
      </div>
    </aside>
  );
}
