import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { resolveUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromoCard } from '@/components/features/dashboard/promo-card';
import type {
  CommunicationSpot,
  CreateSpotFormData,
  SpotType,
  BadgeType,
  DisplayLocation,
} from '@/types/communication';

interface SpotFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: CommunicationSpot | null;
  onSubmit: (data: CreateSpotFormData) => void;
  isSubmitting: boolean;
}

const defaultFormData: CreateSpotFormData = {
  type: 'banner',
  title: '',
  description: '',
  badge: '',
  badgeType: 'new',
  primaryButton: { label: '', href: '' },
  secondaryButton: { label: '', href: '' },
  pollQuestion: '',
  pollOptions: [{ label: '' }, { label: '' }],
  isActive: true,
  displayLocations: ['dashboard'],
  priority: 0,
  targetRoles: [],
  targetLanguages: [],
};

export function SpotFormDialog({
  open,
  onOpenChange,
  spot,
  onSubmit,
  isSubmitting,
}: SpotFormDialogProps) {
  const [formData, setFormData] = useState<CreateSpotFormData>(defaultFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset form when spot changes
  useEffect(() => {
    if (spot) {
      setFormData({
        type: spot.type,
        title: spot.title || '',
        description: spot.description || '',
        image: spot.image,
        badge: spot.badge || '',
        badgeType: spot.badgeType || 'new',
        primaryButton: spot.primaryButton || { label: '', href: '' },
        secondaryButton: spot.secondaryButton || { label: '', href: '' },
        pollQuestion: spot.pollQuestion || '',
        pollOptions: spot.pollOptions?.map((opt) => ({ label: opt.label })) || [
          { label: '' },
          { label: '' },
        ],
        isActive: spot.isActive,
        displayLocations: spot.displayLocations,
        priority: spot.priority,
        startDate: spot.startDate,
        endDate: spot.endDate,
        targetRoles: spot.targetRoles || [],
        targetLanguages: spot.targetLanguages || [],
      });
      setImagePreview(spot.image ? resolveUrl(spot.image) ?? null : null);
    } else {
      setFormData(defaultFormData);
      setImagePreview(null);
    }
  }, [spot, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    setImagePreview(null);
  };

  const handleLocationChange = (location: DisplayLocation, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      displayLocations: checked
        ? [...prev.displayLocations, location]
        : prev.displayLocations.filter((l) => l !== location),
    }));
  };

  const addPollOption = () => {
    setFormData((prev) => ({
      ...prev,
      pollOptions: [...(prev.pollOptions || []), { label: '' }],
    }));
  };

  const removePollOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pollOptions: prev.pollOptions?.filter((_, i) => i !== index),
    }));
  };

  const updatePollOption = (index: number, label: string) => {
    setFormData((prev) => ({
      ...prev,
      pollOptions: prev.pollOptions?.map((opt, i) =>
        i === index ? { label } : opt
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Build preview props
  const previewProps = formData.type === 'banner'
    ? {
        type: 'banner' as const,
        badge: formData.badge || undefined,
        badgeType: formData.badgeType,
        title: formData.title || 'Titre de la bannière',
        description: formData.description || 'Description de la bannière',
        primaryButton: formData.primaryButton?.label
          ? formData.primaryButton
          : undefined,
        secondaryButton: formData.secondaryButton?.label
          ? formData.secondaryButton
          : undefined,
      }
    : {
        type: 'poll' as const,
        pollQuestion: formData.pollQuestion || 'Question du sondage ?',
        pollOptions: formData.pollOptions?.filter((opt) => opt.label).map((opt, i) => ({
          id: String(i),
          label: opt.label,
          votes: 0,
        })) || [],
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spot ? 'Modifier le spot' : 'Créer un spot'}</DialogTitle>
          <DialogDescription>
            {spot
              ? 'Modifiez les informations du spot publicitaire'
              : 'Créez une nouvelle bannière ou un sondage'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Type de spot</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: SpotType) =>
                    setFormData((prev) => {
                      const next = { ...prev, type: value };
                      // Les sondages ne peuvent pas être sur la page de connexion
                      if (value === 'poll' && prev.displayLocations.includes('login')) {
                        next.displayLocations = prev.displayLocations.filter((l) => l !== 'login');
                        if (next.displayLocations.length === 0) next.displayLocations = ['dashboard'];
                      }
                      return next;
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Bannière</SelectItem>
                    <SelectItem value="poll">Sondage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="display">Affichage</TabsTrigger>
                  <TabsTrigger value="targeting">Ciblage</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4 mt-4">
                  {formData.type === 'banner' ? (
                    <>
                      {/* Banner Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="Titre de la bannière"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Description de la bannière"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="badge">Badge</Label>
                          <Input
                            id="badge"
                            value={formData.badge}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, badge: e.target.value }))
                            }
                            placeholder="Ex: Nouveau"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type de badge</Label>
                          <Select
                            value={formData.badgeType}
                            onValueChange={(value: BadgeType) =>
                              setFormData((prev) => ({ ...prev, badgeType: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="live">Live</SelectItem>
                              <SelectItem value="new">Nouveau</SelectItem>
                              <SelectItem value="promo">Promo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Primary Button */}
                      <div className="space-y-2">
                        <Label>Bouton principal (optionnel)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={formData.primaryButton?.label || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                primaryButton: {
                                  ...prev.primaryButton!,
                                  label: e.target.value,
                                },
                              }))
                            }
                            placeholder="Libellé"
                          />
                          <Input
                            value={formData.primaryButton?.href || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                primaryButton: {
                                  ...prev.primaryButton!,
                                  href: e.target.value,
                                },
                              }))
                            }
                            placeholder="URL"
                          />
                        </div>
                      </div>

                      {/* Secondary Button */}
                      <div className="space-y-2">
                        <Label>Bouton secondaire (optionnel)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={formData.secondaryButton?.label || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                secondaryButton: {
                                  ...prev.secondaryButton!,
                                  label: e.target.value,
                                },
                              }))
                            }
                            placeholder="Libellé"
                          />
                          <Input
                            value={formData.secondaryButton?.href || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                secondaryButton: {
                                  ...prev.secondaryButton!,
                                  href: e.target.value,
                                },
                              }))
                            }
                            placeholder="URL"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Poll Fields */}
                      <div className="space-y-2">
                        <Label htmlFor="pollQuestion">Question</Label>
                        <Textarea
                          id="pollQuestion"
                          value={formData.pollQuestion}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, pollQuestion: e.target.value }))
                          }
                          placeholder="Quelle est votre question ?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Options de réponse</Label>
                        <div className="space-y-2">
                          {formData.pollOptions?.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option.label}
                                onChange={(e) => updatePollOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                              />
                              {(formData.pollOptions?.length || 0) > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePollOption(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPollOption}
                          className="mt-2"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter une option
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Image (optionnelle)</Label>
                    {imagePreview ? (
                      <div className="flex flex-col items-start gap-2">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 max-w-full rounded object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 hover:bg-muted w-full justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Choisir une image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="display" className="space-y-4 mt-4">
                  {/* Display Locations */}
                  <div className="space-y-2">
                    <Label>Emplacements d'affichage</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="loc-dashboard"
                          checked={formData.displayLocations.includes('dashboard')}
                          onCheckedChange={(checked) =>
                            handleLocationChange('dashboard', checked as boolean)
                          }
                        />
                        <Label htmlFor="loc-dashboard" className="font-normal">
                          Dashboard
                        </Label>
                      </div>
                      {formData.type === 'banner' && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="loc-login"
                            checked={formData.displayLocations.includes('login')}
                            onCheckedChange={(checked) =>
                              handleLocationChange('login', checked as boolean)
                            }
                          />
                          <Label htmlFor="loc-login" className="font-normal">
                            Page de connexion
                          </Label>
                        </div>
                      )}
                    </div>
                    {formData.type === 'poll' && (
                      <p className="text-xs text-muted-foreground">
                        Les sondages ne peuvent être affichés que sur le dashboard (pas sur la page de connexion).
                      </p>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                      }
                    />
                    <Label htmlFor="isActive" className="font-normal">
                      Activer immédiatement
                    </Label>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorité (0 = plus haute)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min={0}
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  {/* Schedule - Only show start date if not activating immediately */}
                  <div className={formData.isActive ? "" : "grid grid-cols-2 gap-4"}>
                    {!formData.isActive && (
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Date de fin (optionnelle)</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="targeting" className="space-y-4 mt-4">
                  {/* Target Roles */}
                  <div className="space-y-2">
                    <Label>Rôles cibles (laisser vide pour tous)</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="role-user"
                          checked={formData.targetRoles?.includes('user')}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              targetRoles: checked
                                ? [...(prev.targetRoles || []), 'user']
                                : prev.targetRoles?.filter((r) => r !== 'user'),
                            }))
                          }
                        />
                        <Label htmlFor="role-user" className="font-normal">
                          Utilisateurs
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="role-admin"
                          checked={formData.targetRoles?.includes('admin')}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              targetRoles: checked
                                ? [...(prev.targetRoles || []), 'admin']
                                : prev.targetRoles?.filter((r) => r !== 'admin'),
                            }))
                          }
                        />
                        <Label htmlFor="role-admin" className="font-normal">
                          Administrateurs
                        </Label>
                      </div>
                    </div>
                  </div>

                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <Label>Prévisualisation</Label>
              <div className="rounded-lg border p-4 bg-muted/50">
                <PromoCard
                  {...previewProps}
                  dismissible={false}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Aperçu approximatif du rendu final
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? spot
                  ? 'Modification...'
                  : 'Création...'
                : spot
                ? 'Enregistrer'
                : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
