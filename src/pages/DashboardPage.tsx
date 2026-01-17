import { Calendar, Users, CheckSquare, Wallet, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { StatsCard, UpcomingEvents, UrgentTasks, RecentActivity } from '@/components/features/dashboard';
import { AccountSubscriptionCard } from '@/components/features/subscription/AccountSubscriptionCard';
import { TrialBanner } from '@/components/features/subscription/TrialBanner';
import { RsvpBarChart } from '@/components/charts';
import { useDashboard } from '@/hooks/useDashboard';
import { useRsvpChartData } from '@/hooks/useChartData';
import { useRecentNotifications } from '@/hooks/useNotifications';
import { useCurrentSubscription } from '@/hooks/useSubscription';

export function DashboardPage() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard();
  const { data: rsvpChartData, isLoading: isChartLoading } = useRsvpChartData();
  const { data: recentNotifications, isLoading: isNotificationsLoading } = useRecentNotifications(5);
  const { data: subscriptionData } = useCurrentSubscription();

  const stats = dashboardData?.stats;
  const upcomingEvents = dashboardData?.upcoming_events || [];
  const urgentTasks = dashboardData?.urgent_tasks || [];
  const hasActiveSubscription = subscriptionData?.has_subscription || false;

  const formatCurrency = (value: number | null | undefined) => {
    const safeValue = value ?? 0;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0,
    }).format(safeValue);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur Party Planner"
        actions={
          <Link to="/events/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel evenement
            </Button>
          </Link>
        }
      />

      {/* Trial Banner - Only show if no active subscription */}
      {!hasActiveSubscription && <TrialBanner />}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Evenements actifs"
          value={stats?.events_count ?? 0}
          icon={Calendar}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          isLoading={isDashboardLoading}
        />
        <StatsCard
          title="Invites confirmes"
          value={stats?.guests_confirmed ?? 0}
          icon={Users}
          iconColor="text-event-mariage"
          iconBgColor="bg-event-mariage/10"
          isLoading={isDashboardLoading}
        />
        <StatsCard
          title="Taches en cours"
          value={stats?.tasks_pending ?? 0}
          icon={CheckSquare}
          iconColor="text-success"
          iconBgColor="bg-success/10"
          isLoading={isDashboardLoading}
        />
        <StatsCard
          title="Budget total"
          value={formatCurrency(stats?.total_budget)}
          icon={Wallet}
          iconColor="text-warning"
          iconBgColor="bg-warning/10"
          isLoading={isDashboardLoading}
        />
      </div>

      {/* Subscription Card and Events, Tasks and Activity */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Subscription Card - Always visible */}
        <div className="lg:col-span-1">
          <AccountSubscriptionCard />
        </div>

        {/* Events, Tasks and Activity */}
        <div className="lg:col-span-3 grid gap-6 lg:grid-cols-3">
          <UpcomingEvents events={upcomingEvents} isLoading={isDashboardLoading} />
          <UrgentTasks tasks={urgentTasks} isLoading={isDashboardLoading} />
          <RecentActivity notifications={recentNotifications || []} isLoading={isNotificationsLoading} />
        </div>
      </div>

      {/* RSVP Chart */}
      <RsvpBarChart data={rsvpChartData || []} isLoading={isChartLoading} />
    </div>
  );
}
