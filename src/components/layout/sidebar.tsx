import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  Mail,
  CreditCard,
  Bell,
  Users,
  FileText,
  Settings,
  Activity,
  FileCheck,
  Layers,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  { to: '/admin', icon: LayoutDashboard, labelKey: 'nav.adminDashboard', end: true },
  { to: '/admin/users', icon: Users, labelKey: 'nav.adminUsers' },
  { to: '/admin/events', icon: Calendar, labelKey: 'nav.adminEvents' },
  { to: '/admin/payments', icon: CreditCard, labelKey: 'nav.adminPayments' },
  { to: '/admin/subscriptions', icon: FileText, labelKey: 'nav.adminSubscriptions' },
  { to: '/admin/plans', icon: Layers, labelKey: 'nav.adminPlans' },
  { to: '/admin/templates', icon: FileCheck, labelKey: 'nav.adminTemplates' },
  { to: '/admin/activity-logs', icon: Activity, labelKey: 'nav.adminActivityLogs' },
];

export function Sidebar({ isAdmin = false, onLogout }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Détecter si on est dans la section admin
  const isInAdminSection = location.pathname.startsWith('/admin');
  // Vérifier si on vient de la section admin (via sessionStorage)
  const fromAdminSection = sessionStorage.getItem('fromAdminSection') === 'true';
  
  // Nettoyer le flag quand on revient à une route admin ou qu'on navigue ailleurs que /events/:id
  useEffect(() => {
    if (isInAdminSection) {
      // Si on revient à une route admin, nettoyer le flag
      sessionStorage.removeItem('fromAdminSection');
    } else if (!location.pathname.startsWith('/events/')) {
      // Si on navigue vers une route qui n'est pas /events/:id, nettoyer aussi le flag
      sessionStorage.removeItem('fromAdminSection');
    }
  }, [location.pathname, isInAdminSection]);
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-white border-r border-[#e5e7eb] flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <img src={logo} alt={t('app.name')} className="h-8 w-8 object-contain" />
          <span className="font-semibold text-[#1a1a2e] text-lg">{t('app.name')}</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                // Si on est dans la section admin ou qu'on vient de la section admin, ne pas activer les onglets de la section principale
                const shouldBeActive = (isInAdminSection || fromAdminSection) ? false : isActive;
                return cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                  shouldBeActive
                    ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                    : "text-[#6b7280] hover:bg-[#f3f4f6]"
                );
              }}
            >
              <item.icon className="w-5 h-5" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
              Administration
            </p>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => {
                    // Pour les routes admin, vérifier si on est dans la section admin
                    // Si on est sur /events/:id mais qu'on vient de /admin/events, garder l'onglet admin actif
                    let shouldBeActive = isActive;
                    if (item.to === '/admin/events' && location.pathname.startsWith('/events/') && fromAdminSection) {
                      shouldBeActive = true;
                    }
                    return cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                      shouldBeActive
                        ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                        : "text-[#6b7280] hover:bg-[#f3f4f6]"
                    );
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Separator */}
      <div className="border-t border-[#e5e7eb] mx-3"></div>

      {/* Bottom section */}
      <div className="px-3 py-4 space-y-2 shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
              isActive
                ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                : "text-[#6b7280] hover:bg-[#f3f4f6]"
            )
          }
        >
          <Settings className="w-5 h-5" />
          {t('nav.settings')}
        </NavLink>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
