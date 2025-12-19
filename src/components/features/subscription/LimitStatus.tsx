import { AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LimitStatusProps {
  current: number;
  limit: number | null;
  label?: string;
  className?: string;
}

export function LimitStatus({
  current,
  limit,
  label = 'Utilisation',
  className
}: LimitStatusProps) {
  // Unlimited plan
  if (limit === null) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Users className="h-4 w-4" />
        <span>{current} {label.toLowerCase()}</span>
        <span className="text-green-600">(illimite)</span>
      </div>
    );
  }

  const percentage = Math.min((current / limit) * 100, 100);
  const remaining = limit - current;
  const isAtLimit = remaining <= 0;
  const isNearLimit = remaining > 0 && remaining <= 5;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          {label}
        </span>
        <span className={cn(
          'flex items-center gap-1 font-medium',
          isAtLimit && 'text-destructive',
          isNearLimit && !isAtLimit && 'text-amber-600',
          !isAtLimit && !isNearLimit && 'text-muted-foreground'
        )}>
          {isAtLimit ? (
            <AlertCircle className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {current} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={cn(
          'h-2',
          isAtLimit && '[&>div]:bg-destructive',
          isNearLimit && !isAtLimit && '[&>div]:bg-amber-500'
        )}
      />
      {isAtLimit && (
        <p className="text-xs text-destructive">
          Limite atteinte. Passez au plan Pro pour ajouter plus d'invites.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-600">
          Plus que {remaining} place{remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}
