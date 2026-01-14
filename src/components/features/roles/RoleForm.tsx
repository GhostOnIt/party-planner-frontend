import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { PermissionModule, CustomRoleFormData } from '@/types';

const roleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional(),
  permissions: z.array(z.number()).min(1, 'Au moins une permission est requise'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: Partial<CustomRoleFormData>;
  permissions: PermissionModule[];
  onSubmit: (data: CustomRoleFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}


export function RoleForm({
  initialData,
  permissions,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Créer',
}: RoleFormProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      permissions: initialData?.permissions || [],
    },
  });

  const selectedPermissions = watch('permissions') || [];

  const toggleModule = (moduleName: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleName)) {
      newExpanded.delete(moduleName);
    } else {
      newExpanded.add(moduleName);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permissionId: number) => {
    const currentPermissions = selectedPermissions;
    let newPermissions: number[];

    if (currentPermissions.includes(permissionId)) {
      newPermissions = currentPermissions.filter(id => id !== permissionId);
    } else {
      newPermissions = [...currentPermissions, permissionId];
    }

    setValue('permissions', newPermissions);
  };

  const toggleModulePermissions = (modulePermissions: number[], checked: boolean) => {
    const currentPermissions = selectedPermissions;
    let newPermissions: number[];

    if (checked) {
      newPermissions = [...new Set([...currentPermissions, ...modulePermissions])];
    } else {
      newPermissions = currentPermissions.filter(id => !modulePermissions.includes(id));
    }

    setValue('permissions', newPermissions);
  };

  const handleFormSubmit = (data: RoleFormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    });
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nom du rôle *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="ex: Wedding Coordinator"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Décrivez le rôle et ses responsabilités..."
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

      </div>

      {/* Permissions */}
      <div>
        <Label className="text-base font-semibold">Permissions</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez les permissions que ce rôle devra avoir.
        </p>

        <div className="space-y-4">
          {permissions.map((module) => {
            const modulePermissions = module.permissions.map(p => p.id);
            const selectedInModule = modulePermissions.filter(id =>
              selectedPermissions.includes(id)
            );
            const isExpanded = expandedModules.has(module.name);

            return (
              <Card key={module.name}>
                <CardHeader
                  className="pb-3 cursor-pointer"
                  onClick={() => toggleModule(module.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="text-base">{module.label}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {selectedInModule.length}/{module.permissions.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedInModule.length === module.permissions.length}
                        onCheckedChange={(checked) => toggleModulePermissions(modulePermissions, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-muted-foreground">Tout sélectionner</span>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid gap-3">
                      {module.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {permission.display_name}
                            </div>
                            {permission.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {errors.permissions && (
          <p className="text-sm text-destructive mt-2">{errors.permissions.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
