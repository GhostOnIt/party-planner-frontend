import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  User,
  Shield,
  Bell,
  Trash2,
  Loader2,
  Upload,
  Mail,
  Smartphone,
  Calendar,
  Users,
  Wallet,
  ClipboardList,
  UserCog,
  Settings,
  DollarSign,
  FileText,
  Pencil,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
  useDeleteAvatar,
} from '@/hooks/useProfile';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useSettings';
import { NotificationPreferences } from '@/types';
import { resolveUrl } from '@/lib/utils';
import { EventTypesManager } from '@/components/settings/EventTypesManager';
import { CollaboratorRolesManager } from '@/components/settings/CollaboratorRolesManager';
import { BudgetCategoriesManager } from '@/components/settings/BudgetCategoriesManager';
import { strongPasswordSchema } from '@/lib/passwordValidation';
import {
  useAdminLegalPages,
  useUpdateLegalPage,
  LegalPage as LegalPageType,
} from '@/hooks/useLegalPages';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Mot de passe actuel requis'),
    password: strongPasswordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Profile mutations
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeletingAvatar } = useDeleteAvatar();

  // Notification settings
  const { data: notificationSettings, isLoading: isLoadingSettings } = useNotificationSettings();
  const { mutate: updateNotificationSettings } = useUpdateNotificationSettings();

  // Legal pages (admin only)
  const isAdmin = user?.role === 'admin';
  const { data: legalPages, isLoading: isLoadingLegalPages } = useAdminLegalPages();
  const updateLegalPageMutation = useUpdateLegalPage();
  const [editingLegalPage, setEditingLegalPage] = useState<LegalPageType | null>(null);
  const [legalEditForm, setLegalEditForm] = useState({
    title: '',
    content: '',
    is_published: true,
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => {
        toast({
          title: 'Profil mis a jour',
          description: 'Vos informations ont ete mises a jour avec succes.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise a jour.',
          variant: 'destructive',
        });
      },
    });
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        toast({
          title: 'Mot de passe modifie',
          description: 'Votre mot de passe a ete change avec succes.',
        });
        passwordForm.reset();
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Le mot de passe actuel est incorrect.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez selectionner une image.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: "L'image ne doit pas depasser 2 Mo.",
        variant: 'destructive',
      });
      return;
    }

    uploadAvatar(file, {
      onSuccess: () => {
        toast({
          title: 'Avatar mis a jour',
          description: 'Votre photo de profil a ete mise a jour.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: "Une erreur est survenue lors de l'upload.",
          variant: 'destructive',
        });
      },
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = () => {
    deleteAvatar(undefined, {
      onSuccess: () => {
        toast({
          title: 'Avatar supprime',
          description: 'Votre photo de profil a ete supprimee.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression.',
          variant: 'destructive',
        });
      },
    });
  };


  const handleNotificationToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updateNotificationSettings(
      { [key]: value },
      {
        onSuccess: () => {
          toast({
            title: 'Parametres mis a jour',
            description: 'Vos preferences de notification ont ete sauvegardees.',
          });
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Une erreur est survenue.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Legal pages handlers (admin only)
  const handleEditLegalPage = (page: LegalPageType) => {
    setEditingLegalPage(page);
    setLegalEditForm({
      title: page.title,
      content: page.content,
      is_published: page.is_published,
    });
  };

  const handleSaveLegalPage = async () => {
    if (!editingLegalPage) return;
    try {
      await updateLegalPageMutation.mutateAsync({
        id: editingLegalPage.id,
        data: legalEditForm,
      });
      toast({
        title: 'Page mise à jour',
        description: 'Les modifications ont été enregistrées avec succès.',
      });
      setEditingLegalPage(null);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la page.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleLegalPagePublished = async (page: LegalPageType) => {
    try {
      await updateLegalPageMutation.mutateAsync({
        id: page.id,
        data: { is_published: !page.is_published },
      });
      toast({
        title: page.is_published ? 'Page dépubliée' : 'Page publiée',
        description: page.is_published
          ? 'La page n\'est plus visible publiquement.'
          : 'La page est maintenant visible publiquement.',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut de la page.',
        variant: 'destructive',
      });
    }
  };

  const getLegalSlugLabel = (slug: string) => {
    switch (slug) {
      case 'terms':
        return 'Conditions d\'utilisation';
      case 'privacy':
        return 'Politique de confidentialité';
      default:
        return slug;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-8 lg:w-[1150px]' : 'grid-cols-7 lg:w-[1000px]'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="event-types" className="flex items-center gap-2 min-w-fit">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{t('settings.eventTypes')}</span>
          </TabsTrigger>
          <TabsTrigger value="collaborator-roles" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.collaboratorRoles')}</span>
          </TabsTrigger>
          <TabsTrigger value="budget-categories" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.budgetCategories')}</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings.account')}</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="legal-pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pages légales</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Avatar section */}
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={resolveUrl(user.avatar_url)} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Changer
                  </Button>

                  {user.avatar_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar}
                    >
                      {isDeletingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG ou GIF. Max 2 Mo.
                </p>
              </CardContent>
            </Card>

            {/* Profile Info section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez a jour vos informations</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" {...profileForm.register('name')} />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telephone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+237 6XX XXX XXX"
                        {...profileForm.register('phone')}
                      />
                      {profileForm.formState.errors.phone && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={user.email} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas etre modifie
                    </p>
                  </div>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sauvegarder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Assurez-vous d'utiliser un mot de passe fort et unique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Mot de passe actuel</Label>
                    <Input
                      id="current_password"
                      type="password"
                      {...passwordForm.register('current_password')}
                    />
                    {passwordForm.formState.errors.current_password && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input id="password" type="password" {...passwordForm.register('password')} />
                    {passwordForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirmer</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      {...passwordForm.register('password_confirmation')}
                    />
                    {passwordForm.formState.errors.password_confirmation && (
                      <p className="text-sm text-destructive">
                        {passwordForm.formState.errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessions actives</CardTitle>
              <CardDescription>
                Gerez vos sessions de connexion sur differents appareils
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">Connecte depuis cet appareil</p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canaux de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez etre notifie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications par email</p>
                    <p className="text-sm text-muted-foreground">
                      Recevez les notifications importantes par email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.email_notifications ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle('email_notifications', checked)
                  }
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications push</p>
                    <p className="text-sm text-muted-foreground">
                      Recevez les notifications sur votre appareil
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.push_notifications ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle('push_notifications', checked)
                  }
                  disabled={isLoadingSettings}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types de notifications</CardTitle>
              <CardDescription>
                Selectionnez les types de notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rappels d'evenements</p>
                    <p className="text-sm text-muted-foreground">Rappels avant vos evenements</p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.event_reminder ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('event_reminder', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rappels de taches</p>
                    <p className="text-sm text-muted-foreground">
                      Rappels pour les taches a effectuer
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.task_reminder ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('task_reminder', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rappels d'invites</p>
                    <p className="text-sm text-muted-foreground">
                      Mises a jour sur les reponses des invites
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.guest_reminder ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('guest_reminder', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Wallet className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Alertes budget</p>
                    <p className="text-sm text-muted-foreground">
                      Alertes quand le budget approche la limite
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.budget_alert ?? true}
                  onCheckedChange={(checked) => handleNotificationToggle('budget_alert', checked)}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-pink-100 p-2">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Invitations de collaboration</p>
                    <p className="text-sm text-muted-foreground">
                      Quand quelqu'un vous invite a collaborer
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.collaboration_invite ?? true}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle('collaboration_invite', checked)
                  }
                  disabled={isLoadingSettings}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>Details de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type de compte</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email verifie</p>
                  <p className="font-medium">{user.email_verified_at ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Event Types Tab */}
        <TabsContent value="event-types" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Types d'événement</CardTitle>
              <CardDescription>
                Personnalisez les types d'événement disponibles pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventTypesManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborator Roles Tab */}
        <TabsContent value="collaborator-roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rôles de collaborateurs</CardTitle>
              <CardDescription>
                Personnalisez les rôles disponibles pour inviter des collaborateurs à vos événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollaboratorRolesManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Categories Tab */}
        <TabsContent value="budget-categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catégories de budget</CardTitle>
              <CardDescription>
                Personnalisez les catégories de budget disponibles pour vos événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetCategoriesManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Pages Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="legal-pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pages légales
                </CardTitle>
                <CardDescription>
                  Gérez les conditions d'utilisation et la politique de confidentialité affichées sur le site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLegalPages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Dernière mise à jour</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {legalPages?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{getLegalSlugLabel(page.slug)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{page.title}</TableCell>
                          <TableCell>
                            {page.is_published ? (
                              <Badge variant="default" className="bg-emerald-500">
                                <Eye className="h-3 w-3 mr-1" />
                                Publiée
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Brouillon
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(page.updated_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`/legal/${page.slug}`, '_blank')}
                                title="Voir la page"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleLegalPagePublished(page)}
                                title={page.is_published ? 'Dépublier' : 'Publier'}
                              >
                                {page.is_published ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditLegalPage(page)}
                                title="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!legalPages || legalPages.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Aucune page légale configurée. Exécutez le seeder pour créer les pages par défaut.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Edit Legal Page Dialog */}
            <Dialog open={!!editingLegalPage} onOpenChange={(open) => !open && setEditingLegalPage(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Modifier : {editingLegalPage && getLegalSlugLabel(editingLegalPage.slug)}
                  </DialogTitle>
                  <DialogDescription>
                    Modifiez le contenu avec l’éditeur ci‑dessous. Le contenu est enregistré en HTML.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="legal-title">Titre de la page</Label>
                    <Input
                      id="legal-title"
                      value={legalEditForm.title}
                      onChange={(e) => setLegalEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre affiché en haut de la page"
                    />
                  </div>

                  {/* Published Switch */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Publier la page</Label>
                      <p className="text-sm text-muted-foreground">
                        Si désactivé, la page ne sera pas accessible au public.
                      </p>
                    </div>
                    <Switch
                      checked={legalEditForm.is_published}
                      onCheckedChange={(checked) =>
                        setLegalEditForm((prev) => ({ ...prev, is_published: checked }))
                      }
                    />
                  </div>

                  {/* Content — éditeur WYSIWYG (stockage HTML inchangé) */}
                  <div className="space-y-2">
                    <Label id="legal-content-label">Contenu</Label>
                    <RichTextEditor
                      key={editingLegalPage?.id}
                      value={legalEditForm.content}
                      onChange={(html) =>
                        setLegalEditForm((prev) => ({ ...prev, content: html }))
                      }
                      placeholder="Saisissez le contenu de la page…"
                      minHeight="300px"
                      className="[&_.ProseMirror]:min-h-[260px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Utilisez la barre d’outils pour mettre en forme le texte (titres, listes, gras, italique). Le contenu est enregistré en HTML.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingLegalPage(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button onClick={handleSaveLegalPage} disabled={updateLegalPageMutation.isPending}>
                    {updateLegalPageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}
      </Tabs>

    </div>
  );
}
