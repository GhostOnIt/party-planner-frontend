import React from 'react';
import { useEventPermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  eventId: string;
  permissions: string[];
  requireAll?: boolean; // true = AND, false = OR
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  eventId,
  permissions,
  requireAll = true,
  fallback = null,
  children
}: PermissionGateProps) {
  const { data: userPermissions, isLoading } = useEventPermissions(eventId);

  // Show nothing while loading to avoid flickering
  if (isLoading) {
    return null;
  }

  // If no permissions data, deny access
  if (!userPermissions) {
    return <>{fallback}</>;
  }

  const hasPermission = requireAll
    ? permissions.every(p => userPermissions.permissions?.includes(p))
    : permissions.some(p => userPermissions.permissions?.includes(p));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}