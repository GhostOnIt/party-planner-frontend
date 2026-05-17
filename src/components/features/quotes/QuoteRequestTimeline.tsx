import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QuoteRequestStage, QuoteRequestActivity } from '@/hooks/useQuoteRequests';

interface QuoteRequestTimelineProps {
  stages: QuoteRequestStage[];
  currentStageId: string | null;
  activities?: QuoteRequestActivity[];
  onAdvance?: () => void;
  canAdvance?: boolean;
}

export function QuoteRequestTimeline({
  stages,
  currentStageId,
  activities = [],
  onAdvance,
  canAdvance = true,
}: QuoteRequestTimelineProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);

  const getActivitiesForStage = (stageIndex: number): QuoteRequestActivity[] => {
    if (!activities.length || stages.length === 0) return [];

    // Group activities by stage transition times
    // Activities between stage[i] and stage[i+1] transitions belong to stage[i]
    const stageSlug = stages[stageIndex]?.slug;
    return activities.filter((a) => {
      const meta = a.metadata as Record<string, unknown> | null;
      if (meta?.stage_slug === stageSlug || meta?.stage_id === stages[stageIndex]?.id) {
        return true;
      }
      return false;
    });
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-1">
      {stages.map((stage, index) => {
        const isReached = currentIndex >= 0 && index <= currentIndex;
        const isCurrent = stage.id === currentStageId;
        const isLast = index === stages.length - 1;
        const stageActivities = getActivitiesForStage(index);

        return (
          <div key={stage.id} className="relative flex gap-3">
            {/* Vertical line + node */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'animate-pulse border-primary bg-primary text-primary-foreground'
                    : isReached
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground/50'
                }`}
              >
                {isReached && !isCurrent ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    isReached && index < currentIndex ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                  }`}
                />
              )}
            </div>

            {/* Stage content */}
            <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-primary font-semibold' : isReached ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stage.name}
                </p>
                {isCurrent && onAdvance && canAdvance && !isLast && (
                  <Button size="sm" variant="outline" className="h-6 text-xs" onClick={onAdvance}>
                    Avancer
                  </Button>
                )}
              </div>

              {/* Activities for this stage */}
              {stageActivities.length > 0 && (
                <div className="mt-1 space-y-1">
                  {stageActivities
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start gap-1.5">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {activity.message ?? activity.activity_type}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">{formatDateTime(activity.created_at)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
