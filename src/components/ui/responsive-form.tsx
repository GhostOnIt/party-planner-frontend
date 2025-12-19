import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

// Responsive grid for form fields
export function ResponsiveFormGrid({
  children,
  className,
  columns = 2,
}: ResponsiveFormGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center' | 'between';
}

// Responsive actions container for form buttons
export function ResponsiveFormActions({
  children,
  className,
  align = 'left',
}: ResponsiveFormActionsProps) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row',
        alignClass[align],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

// Responsive dialog content that adjusts for mobile
export function ResponsiveDialogContent({
  children,
  className,
}: ResponsiveDialogContentProps) {
  return (
    <div
      className={cn(
        'max-h-[80vh] overflow-y-auto px-1 sm:max-h-none sm:px-0',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'col' | 'responsive';
}

// Flexible stack component
export function Stack({
  children,
  className,
  gap = 'md',
  direction = 'col',
}: StackProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const directionClass = {
    row: 'flex-row',
    col: 'flex-col',
    responsive: 'flex-col sm:flex-row',
  };

  return (
    <div className={cn('flex', directionClass[direction], gapClass[gap], className)}>
      {children}
    </div>
  );
}
