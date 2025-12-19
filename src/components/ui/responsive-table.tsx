import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

// Wrapper that adds horizontal scroll on mobile
export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn('w-full overflow-auto', className)}>
      <div className="min-w-[600px] lg:min-w-0">{children}</div>
    </div>
  );
}

// Mobile card view for table rows
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCard({ children, className }: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm lg:hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileCardRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileCardRow({ label, children, className }: MobileCardRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

// Responsive container that shows table on desktop, cards on mobile
interface ResponsiveDataViewProps {
  children: React.ReactNode;
  mobileView: React.ReactNode;
  className?: string;
}

export function ResponsiveDataView({
  children,
  mobileView,
  className,
}: ResponsiveDataViewProps) {
  return (
    <div className={className}>
      {/* Desktop Table View */}
      <div className="hidden lg:block">{children}</div>
      {/* Mobile Card View */}
      <div className="lg:hidden">{mobileView}</div>
    </div>
  );
}
