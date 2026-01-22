import { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Copy,
  Trash2,
  Users,
  CheckSquare,
  Wallet,
  Image,
  UserPlus,
  Calendar,
  MapPin,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ListTodo,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { EventStatusBadge, EventTypeBadge } from '@/components/features/events';
import { DietaryRestrictionsCard } from '@/components/features/guests';
import { useEvent, useDeleteEvent, useDuplicateEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/stores/authStore';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { GuestsPage } from './GuestsPage';
import { TasksPage } from './TasksPage';
import { BudgetPage } from './BudgetPage';
import { PhotosPage } from './PhotosPage';
import { CollaboratorsPage } from './CollaboratorsPage';
import { getApiErrorMessage } from '@/api/client';
import { cn } from '@/lib/utils';
import { resolveUrl } from '@/lib/utils';

// Utility functions
const formatBudget = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '0 FCFA';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0 FCFA';

  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M FCFA`;
  }
  return `${numAmount.toLocaleString('fr-FR')} FCFA`;
};

const getProgressPercent = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

const getDaysUntilEvent = (dateStr: string): { days: number; label: string; isUrgent: boolean } => {
  const eventDate = parseISO(dateStr);
  const days = differenceInDays(eventDate, new Date());

  if (isToday(eventDate)) {
    return { days: 0, label: "C'est aujourd'hui !", isUrgent: true };
  }
  if (isPast(eventDate)) {
    return { days: Math.abs(days), label: `Il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`, isUrgent: false };
  }
  if (days <= 7) {
    return { days, label: `Dans ${days} jour${days > 1 ? 's' : ''}`, isUrgent: true };
  }
  if (days <= 30) {
    return { days, label: `Dans ${days} jours`, isUrgent: false };
  }
  const weeks = Math.floor(days / 7);
  return { days, label: `Dans ${weeks} semaine${weeks > 1 ? 's' : ''}`, isUrgent: false };
};

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuthStore();

  const validTabs = ['overview', 'guests', 'tasks', 'budget', 'photos', 'collaborators'];
  const tabFromUrl = searchParams.get('tab');
  const activeTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const { data: event, isLoading, error } = useEvent(id);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: duplicateEvent } = useDuplicateEvent();
  const featureAccess = useFeatureAccess(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Calendar}
          title="Événement introuvable"
          description={
            error ? getApiErrorMessage(error) : "Cet événement n'existe pas ou a été supprimé"
          }
          action={{
            label: 'Retour aux événements',
            onClick: () => navigate('/events'),
          }}
        />
      </div>
    );
  }

  const handleDelete = () => {
    deleteEvent(event.id);
    setShowDeleteDialog(false);
  };

  const handleDuplicate = () => {
    duplicateEvent(event.id);
  };

  // Calculate statistics
  const guestsTotal = event.guests_count || 0;
  const guestsConfirmed = event.guests_confirmed_count || 0;
  const guestsDeclined = event.guests_declined_count || 0;
  const guestsPending = event.guests_pending_count || 0;
  const tasksTotal = event.tasks_count || 0;
  const tasksCompleted = event.tasks_completed_count || 0;
  const budgetTotal = event.budget || 0;
  const budgetSpent = typeof event.budget_spent === 'string' ? parseFloat(event.budget_spent) : (event.budget_spent || 0);

  const guestsProgress = getProgressPercent(guestsConfirmed, guestsTotal);
  const tasksProgress = getProgressPercent(tasksCompleted, tasksTotal);
  const budgetProgress = getProgressPercent(budgetSpent, budgetTotal);

  const countdown = getDaysUntilEvent(event.date);
  const imageUrl = event.featured_photo?.url || event.featured_photo?.thumbnail_url;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image or Gradient */}
        <div className="h-64 w-full overflow-hidden">
          {imageUrl ? (
            <img
              src={resolveUrl(imageUrl)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-[#4F46E5] via-[#7C3AED] to-[#E91E8C]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Event Header Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link to="/events">
                    <Button variant="ghost" size="sm" className="gap-2 text-white/80 hover:text-white hover:bg-white/10">
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <EventTypeBadge type={event.type} />
                  <EventStatusBadge status={event.status} />
                  {user && event.user_id !== user.id && (
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Collaborateur
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    {event.time && ` à ${event.time.replace(':', 'h')}`}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>

           
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-2">
              <Copy className="h-4 w-4" />
              Dupliquer
            </Button>
            <Link to={`/events/${event.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab || 'overview'} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border border-[#e5e7eb] p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            {featureAccess.guests.canAccess && (
              <TabsTrigger
                value="guests"
                className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Invités
              </TabsTrigger>
            )}
            {featureAccess.tasks.canAccess && (
              <TabsTrigger
                value="tasks"
                className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white"
              >
                <CheckSquare className="h-4 w-4" />
                Tâches
              </TabsTrigger>
            )}
            {featureAccess.budget.canAccess && (
              <TabsTrigger
                value="budget"
                className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white"
              >
                <Wallet className="h-4 w-4" />
                Budget
              </TabsTrigger>
            )}
            <TabsTrigger value="photos" className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
            {featureAccess.collaborators.canAccess && (
              <TabsTrigger
                value="collaborators"
                className="gap-2 rounded-lg data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white"
              >
                <UserPlus className="h-4 w-4" />
                Collaborateurs
              </TabsTrigger>
            )}
          </TabsList>

          {/* Vue d'ensemble Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Stats Row */}
            <div className={cn(
              "grid gap-4",
              // Calculer le nombre de colonnes en fonction des cartes visibles
              (() => {
                const visibleCards = [
                  featureAccess.guests.canAccess,
                  featureAccess.tasks.canAccess,
                  featureAccess.budget.canAccess,
                  true, // Date stat toujours visible
                ].filter(Boolean).length;
                
                if (visibleCards === 1) return "grid-cols-1";
                if (visibleCards === 2) return "grid-cols-1 sm:grid-cols-2";
                if (visibleCards === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
              })()
            )}>
              {/* Guests Stat */}
              {featureAccess.guests.canAccess && (
                <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] hover:shadow-lg hover:shadow-[#4F46E5]/5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <span className="text-3xl font-bold text-[#1a1a2e]">{guestsTotal}</span>
                  </div>
                  <p className="text-sm font-medium text-[#6b7280] mb-3">Invités</p>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#10B981] to-[#34D399] transition-all"
                        style={{ width: `${guestsProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#10B981] font-medium">{guestsConfirmed} confirmés</span>
                      <span className="text-[#6b7280]">{guestsProgress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks Stat */}
              {featureAccess.tasks.canAccess && (
                <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] hover:shadow-lg hover:shadow-[#4F46E5]/5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
                      <ListTodo className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <span className="text-3xl font-bold text-[#1a1a2e]">{tasksTotal}</span>
                  </div>
                  <p className="text-sm font-medium text-[#6b7280] mb-3">Tâches</p>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#4F46E5] to-[#7C3AED] transition-all"
                        style={{ width: `${tasksProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4F46E5] font-medium">{tasksCompleted} complétées</span>
                      <span className="text-[#6b7280]">{tasksProgress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Budget Stat */}
              {featureAccess.budget.canAccess && (
                <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] hover:shadow-lg hover:shadow-[#4F46E5]/5 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <span className="text-lg font-bold text-[#1a1a2e]">{formatBudget(budgetTotal)}</span>
                  </div>
                  <p className="text-sm font-medium text-[#6b7280] mb-3">Budget</p>
                  <div className="space-y-2">
                    <div className="h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          budgetProgress > 100 
                            ? "bg-linear-to-r from-[#EF4444] to-[#F87171]" 
                            : "bg-linear-to-r from-[#F59E0B] to-[#FBBF24]"
                        )}
                        style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn("font-medium", budgetProgress > 100 ? "text-[#EF4444]" : "text-[#F59E0B]")}>
                        {formatBudget(budgetSpent)} dépensé
                      </span>
                      <span className="text-[#6b7280]">{budgetProgress}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Date Stat */}
              <div className="rounded-2xl p-5 border bg-white border-[#e5e7eb] hover:shadow-lg hover:shadow-[#4F46E5]/5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#E91E8C]/10">
                    <Clock className="w-6 h-6 text-[#E91E8C]" />
                  </div>
                  {countdown.days > 0 && !isPast(parseISO(event.date)) && (
                    <span className="text-3xl font-bold text-[#1a1a2e]">
                      {countdown.days}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#6b7280] mb-1">
                  {countdown.days > 0 && !isPast(parseISO(event.date)) ? 'Jours restants' : 'Date'}
                </p>
                <p className="text-sm font-semibold text-[#1a1a2e]">
                  {countdown.label}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Description & Theme */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description Card */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
                    <h3 className="font-semibold text-[#1a1a2e]">Description</h3>
                  </div>
                  <div className="p-6">
                    {event.description ? (
                      <p className="text-[#6b7280] whitespace-pre-wrap leading-relaxed">{event.description}</p>
                    ) : (
                      <p className="text-[#9ca3af] italic">Aucune description ajoutée</p>
                    )}
                  </div>
                </div>

                {/* Guest Breakdown & Dietary Restrictions */}
                {featureAccess.guests.canAccess && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Guest Breakdown */}
                    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
                        <h3 className="font-semibold text-[#1a1a2e]">Répartition des invités</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-xl bg-[#f9fafb]">
                            <div className="w-10 h-10 rounded-full bg-[#6b7280]/10 flex items-center justify-center mx-auto mb-2">
                              <Users className="w-5 h-5 text-[#6b7280]" />
                            </div>
                            <p className="text-2xl font-bold text-[#1a1a2e]">{guestsTotal}</p>
                            <p className="text-xs text-[#6b7280]">Total</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[#10B981]/5">
                            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                            </div>
                            <p className="text-2xl font-bold text-[#10B981]">{guestsConfirmed}</p>
                            <p className="text-xs text-[#6b7280]">Confirmés</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[#F59E0B]/5">
                            <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-2">
                              <HelpCircle className="w-5 h-5 text-[#F59E0B]" />
                            </div>
                            <p className="text-2xl font-bold text-[#F59E0B]">{guestsPending}</p>
                            <p className="text-xs text-[#6b7280]">En attente</p>
                          </div>
                          <div className="text-center p-4 rounded-xl bg-[#EF4444]/5">
                            <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center mx-auto mb-2">
                              <XCircle className="w-5 h-5 text-[#EF4444]" />
                            </div>
                            <p className="text-2xl font-bold text-[#EF4444]">{guestsDeclined}</p>
                            <p className="text-xs text-[#6b7280]">Déclinés</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    {id && (
                      <DietaryRestrictionsCard 
                        eventId={id} 
                        totalGuests={guestsConfirmed} 
                      />
                    )}
                  </div>
                )}

                {/* Budget Breakdown */}
                {featureAccess.budget.canAccess && budgetTotal > 0 && (
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
                      <h3 className="font-semibold text-[#1a1a2e]">Aperçu du budget</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-[#6b7280] mb-1">Budget prévu</p>
                          <p className="text-lg font-bold text-[#1a1a2e]">{formatBudget(budgetTotal)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#6b7280] mb-1">Dépensé</p>
                          <p className={cn("text-lg font-bold", budgetProgress > 100 ? "text-[#EF4444]" : "text-[#F59E0B]")}>
                            {formatBudget(budgetSpent)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-[#6b7280] mb-1">Restant</p>
                          <p className={cn("text-lg font-bold", budgetTotal - budgetSpent < 0 ? "text-[#EF4444]" : "text-[#10B981]")}>
                            {formatBudget(budgetTotal - budgetSpent)}
                          </p>
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-[#f3f4f6] overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            budgetProgress > 100 
                              ? "bg-linear-to-r from-[#EF4444] to-[#F87171]" 
                              : budgetProgress > 80 
                                ? "bg-linear-to-r from-[#F59E0B] to-[#FBBF24]"
                                : "bg-linear-to-r from-[#10B981] to-[#34D399]"
                          )}
                          style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                        />
                      </div>
                      <p className="text-center text-sm text-[#6b7280] mt-2">{budgetProgress}% utilisé</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Quick Info */}
              <div className="space-y-6">
                {/* Event Details Card */}
                <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
                    <h3 className="font-semibold text-[#1a1a2e]">Détails</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6b7280] mb-0.5">Date & heure</p>
                        <p className="font-medium text-[#1a1a2e]">
                          {format(parseISO(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                        </p>
                        {event.time && (
                          <p className="text-sm text-[#6b7280]">{event.time.replace(':', 'h')}</p>
                        )}
                      </div>
                    </div>

                    {event.location && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] mb-0.5">Lieu</p>
                          <p className="font-medium text-[#1a1a2e]">{event.location}</p>
                        </div>
                      </div>
                    )}

                    {event.theme && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-[#E91E8C]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] mb-0.5">Thème</p>
                          <p className="font-medium text-[#1a1a2e]">{event.theme}</p>
                        </div>
                      </div>
                    )}

                    {event.expected_guests && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#6b7280] mb-0.5">Invités attendus</p>
                          <p className="font-medium text-[#1a1a2e]">{event.expected_guests} personnes</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Creator Info */}
                {event.user && (
                  <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
                      <h3 className="font-semibold text-[#1a1a2e]">Créateur</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-semibold">
                          {event.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a2e]">{event.user.name}</p>
                          <p className="text-sm text-[#6b7280]">Créé le {format(parseISO(event.created_at), 'dd/MM/yyyy', { locale: fr })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              
              </div>
            </div>
          </TabsContent>

          <TabsContent value="guests">
            <PermissionGuard
              eventId={id!}
              permissions={['guests.view']}
              fallback={
                <EmptyState
                  icon={Users}
                  title="Accès restreint"
                  description={
                    !featureAccess.guests.canAccess
                      ? 'Cette fonctionnalité nécessite un abonnement actif.'
                      : "Vous n'avez pas les permissions nécessaires pour consulter les invités de cet événement."
                  }
                />
              }
            >
              <GuestsPage eventId={id} />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="tasks">
            <PermissionGuard
              eventId={id!}
              permissions={['tasks.view']}
              fallback={
                <EmptyState
                  icon={CheckSquare}
                  title="Accès restreint"
                  description={
                    !featureAccess.tasks.canAccess
                      ? 'Cette fonctionnalité nécessite un abonnement actif.'
                      : "Vous n'avez pas les permissions nécessaires pour consulter les tâches de cet événement."
                  }
                />
              }
            >
              <TasksPage eventId={id} />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="budget">
            <PermissionGuard
              eventId={id!}
              permissions={['budget.view']}
              fallback={
                <EmptyState
                  icon={Wallet}
                  title="Accès restreint"
                  description={
                    !featureAccess.budget.canAccess
                      ? 'Cette fonctionnalité nécessite un abonnement actif.'
                      : "Vous n'avez pas les permissions nécessaires pour consulter le budget de cet événement."
                  }
                />
              }
            >
              <BudgetPage eventId={id} />
            </PermissionGuard>
          </TabsContent>

          <TabsContent value="photos">
            <PhotosPage eventId={id} />
          </TabsContent>

          <TabsContent value="collaborators">
            <PermissionGuard
              eventId={id!}
              permissions={['collaborators.view']}
              fallback={
                <EmptyState
                  icon={UserPlus}
                  title="Accès restreint"
                  description={
                    !featureAccess.collaborators.canAccess
                      ? 'Cette fonctionnalité nécessite un abonnement actif.'
                      : "Vous n'avez pas les permissions nécessaires pour consulter les collaborateurs de cet événement."
                  }
                />
              }
            >
              <CollaboratorsPage eventId={id} />
            </PermissionGuard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{event.title}" ? Cette action est irréversible et
              supprimera également tous les invités, tâches et autres données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
