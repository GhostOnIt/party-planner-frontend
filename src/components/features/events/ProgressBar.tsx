import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  color?: 'green' | 'purple';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  label,
  color = 'green',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const gradientClasses =
    color === 'green'
      ? 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
      : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]';

  const textColor =
    color === 'green' ? 'text-[#10B981]' : 'text-[#4F46E5]';

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && label && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#6b7280]">{label}</span>
          <span className={cn('font-medium', textColor)}>
            {current}/{total}
          </span>
        </div>
      )}
      <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', gradientClasses)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

