import React from 'react';
import { useEventPermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/stores/authStore';

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
  const { user } = useAuthStore();
  const { data: userPermissions, isLoading } = useEventPermissions(eventId);

  const isAdmin = user?.role === 'admin';

  // Admins can do everything: no restriction, show full content
  if (isAdmin) {
    return <>{children}</>;
  }

  // Show nothing while loading to avoid flickering
  if (isLoading) {
    return null;
  }

  // If no permissions data, deny access
  if (!userPermissions) {
    return <>{fallback}</>;
  }

  const userPerms = userPermissions.permissions || [];
  const hasPermission = requireAll
    ? permissions.every(p => userPerms.includes(p))
    : permissions.some(p => userPerms.includes(p));

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}