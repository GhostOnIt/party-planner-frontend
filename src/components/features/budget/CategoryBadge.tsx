import {
  MapPin,
  UtensilsCrossed,
  Sparkles,
  Music,
  Camera,
  Car,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BudgetCategory } from '@/types';

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  bgColor: string;
  textColor: string;
}

export const categoryConfig: Record<BudgetCategory, CategoryConfig> = {
  location: {
    label: 'Lieu',
    icon: MapPin,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  catering: {
    label: 'Traiteur',
    icon: UtensilsCrossed,
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
  decoration: {
    label: 'Decoration',
    icon: Sparkles,
    className: 'bg-pink-100 text-pink-700 border-pink-200',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-600',
  },
  entertainment: {
    label: 'Animation',
    icon: Music,
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
  },
  photography: {
    label: 'Photo',
    icon: Camera,
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
  },
  transportation: {
    label: 'Transport',
    icon: Car,
    className: 'bg-green-100 text-green-700 border-green-200',
    bgColor: 'bg-green-500',
    textColor: 'text-green-600',
  },
  other: {
    label: 'Autre',
    icon: MoreHorizontal,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-600',
  },
};

interface CategoryBadgeProps {
  category: BudgetCategory;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = true,
  className,
}: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

interface CategoryIconProps {
  category: BudgetCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        config.bgColor,
        className
      )}
    >
      <Icon className="h-4 w-4 text-white" />
    </div>
  );
}
