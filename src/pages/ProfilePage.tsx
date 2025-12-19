import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
  useDeleteAvatar,
  useDeleteAccount,
} from '@/hooks/useProfile';
import { getStorageUrl } from '@/api/client';

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  password: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Mutations
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const { mutate: deleteAvatar, isPending: isDeletingAvatar } = useDeleteAvatar();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: (user as any)?.phone || '',
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez selectionner une image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas depasser 2 Mo.',
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
          description: 'Une erreur est survenue lors de l\'upload.',
          variant: 'destructive',
        });
      },
    });

    // Reset input
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

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre mot de passe.',
        variant: 'destructive',
      });
      return;
    }

    deleteAccount(deletePassword, {
      onSuccess: () => {
        toast({
          title: 'Compte supprime',
          description: 'Votre compte a ete supprime avec succes.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Mot de passe incorrect ou erreur lors de la suppression.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        description="Gerez vos informations personnelles"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar section */}
        <Card>
          <CardHeader>
            <CardTitle>Photo de profil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={getStorageUrl(user.avatar_url)} />
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
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                  />
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
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">L'email ne peut pas etre modifie</p>
              </div>
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Changer le mot de passe</CardTitle>
            <CardDescription>
              Assurez-vous d'utiliser un mot de passe fort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
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
                  <Input
                    id="password"
                    type="password"
                    {...passwordForm.register('password')}
                  />
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
              <Button type="submit" variant="outline" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Changer le mot de passe
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>
              Actions irreversibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de votre compte est definitive. Toutes vos donnees seront perdues.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer votre compte</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Tous vos evenements, invites, et donnees seront
              definitivement supprimes. Entrez votre mot de passe pour confirmer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="delete_password">Mot de passe</Label>
            <Input
              id="delete_password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAccount ? 'Suppression...' : 'Supprimer definitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
