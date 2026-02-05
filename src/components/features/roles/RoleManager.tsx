import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import type { CustomRole } from '@/types';
import { Link } from 'react-router-dom';

interface RoleManagerProps {
  eventId: string;
  canManage: boolean;
}

/**
 * Read-only display of roles for an event (system + owner's custom roles).
 * Role creation/editing is done in Settings.
 */
export function RoleManager({ eventId, canManage: _canManage }: RoleManagerProps) {
  const { data: rolesData, isLoading: rolesLoading } = useCustomRoles(eventId);

  const roles = rolesData?.roles || [];
  const systemRoles = roles.filter((role: CustomRole) => role.is_system);
  const customRoles = roles.filter((role: CustomRole) => !role.is_system);

  if (rolesLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rôles</h2>
          <p className="text-muted-foreground">
            Rôles système et personnalisés disponibles pour cet événement. Gérez les rôles personnalisés dans Paramètres.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/settings?tab=collaborator-roles">
            <Settings className="mr-2 h-4 w-4" />
            Gérer dans Paramètres
          </Link>
        </Button>
      </div>

      {/* System Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rôles système</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {systemRoles.map((role) => (
            <Card key={String(role.id)} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {role.name}
                  </CardTitle>
                  <Badge variant="secondary">Système</Badge>
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {(role.permissions || []).slice(0, 3).map((permission: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission.replace('.', ' › ')}
                    </Badge>
                  ))}
                  {(role.permissions || []).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(role.permissions || []).length - 3} autres
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rôles personnalisés</h3>
        {customRoles.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Aucun rôle personnalisé</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des rôles dans Paramètres pour les assigner aux collaborateurs.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/settings?tab=collaborator-roles">Paramètres → Rôles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {customRoles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {role.name}
                    </CardTitle>
                    <Badge variant="outline">Personnalisé</Badge>
                  </div>
                  {role.description && (
                    <CardDescription>{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {(role.permissions || []).slice(0, 3).map((permission: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission.replace('.', ' › ')}
                      </Badge>
                    ))}
                    {(role.permissions || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(role.permissions || []).length - 3} autres
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
