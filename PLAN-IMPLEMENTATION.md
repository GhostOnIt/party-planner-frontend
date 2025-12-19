# Plan d'Implementation - Fonctionnalites Manquantes

## Resume

Le cahier des charges du frontend a ete aligne avec celui du backend. Apres analyse, **3 fonctionnalites** restent a implementer.

---

## Fonctionnalite 1: Page Admin Activity Logs

### Description
Page d'historique des actions effectuees par les administrateurs avec filtres et statistiques.

### Route
`/admin/activity-logs`

### API Endpoints
```
GET /api/admin/activity-logs?action=update_role&model_type=User&admin_id=1&from=2024-01-01&to=2024-12-31&search=role&per_page=15
GET /api/admin/activity-logs/stats
```

### Fichiers a creer

#### 1.1 Types (`src/types/index.ts`)
```typescript
// Ajouter ces types
export type AdminAction = 'login' | 'create' | 'update' | 'delete' | 'view' | 'update_role' | 'toggle_active';

export interface AdminActivityLog {
  id: number;
  admin_id: number;
  action: AdminAction;
  model_type: string | null;
  model_id: number | null;
  description: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: User;
}

export interface AdminActivityStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_action: Record<string, number>;
  by_model_type: Record<string, number>;
  by_admin: Array<{ admin_id: number; admin_name: string; count: number }>;
}

export interface AdminActivityLogFilters {
  action?: AdminAction;
  model_type?: string;
  admin_id?: number;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}
```

#### 1.2 Hooks (`src/hooks/useAdmin.ts`)
```typescript
// Ajouter ces hooks

export function useAdminActivityLogs(filters: AdminActivityLogFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', filters],
    queryFn: async (): Promise<PaginatedResponse<AdminActivityLog>> => {
      const response = await api.get('/admin/activity-logs', { params: filters });
      return response.data;
    },
  });
}

export function useAdminActivityStats() {
  return useQuery({
    queryKey: ['admin', 'activity-logs', 'stats'],
    queryFn: async (): Promise<AdminActivityStats> => {
      const response = await api.get('/admin/activity-logs/stats');
      return response.data.stats;
    },
  });
}
```

#### 1.3 Page (`src/pages/admin/AdminActivityLogsPage.tsx`)
Composants:
- Stats cards (total, today, week, month)
- Filtres (action, model_type, admin, date range, search)
- Table des logs avec pagination
- Modal detail action

#### 1.4 Route (`src/App.tsx`)
```typescript
<Route path="activity-logs" element={<AdminActivityLogsPage />} />
```

#### 1.5 Navigation (`src/layouts/AdminLayout.tsx`)
Ajouter lien "Historique" dans le menu admin

### Estimation: 2-3 heures

---

## Fonctionnalite 2: Import Invites CSV/Excel

### Description
Permettre l'import massif d'invites via fichier CSV ou Excel.

### API Endpoints
```
POST /api/events/:id/guests/import (multipart/form-data)
GET /api/events/:id/guests/import/template (telecharger template)
```

### Fichiers a creer/modifier

#### 2.1 Hook (`src/hooks/useGuests.ts`)
```typescript
// Ajouter ces hooks

export function useImportGuests(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/events/${eventId}/guests/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
    },
  });
}

export function useDownloadGuestTemplate(eventId: string) {
  return async () => {
    const response = await api.get(`/events/${eventId}/guests/import/template`, {
      responseType: 'blob',
    });
    // Telecharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_invites.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
}
```

#### 2.2 Composant (`src/components/features/guests/GuestImport.tsx`)
```typescript
// Composant avec:
// - Zone drag & drop pour fichier
// - Bouton telecharger template
// - Preview des donnees avant import
// - Mapping colonnes (optionnel)
// - Validation et rapport erreurs
// - Bouton confirmer import
```

#### 2.3 Page (`src/pages/events/GuestsPage.tsx`)
```typescript
// Ajouter bouton "Import" a cote du bouton "Export"
// Ouvrir modal GuestImport au clic
```

### Estimation: 3-4 heures

---

## Fonctionnalite 3: Selection Template Creation Evenement

### Description
Permettre aux utilisateurs de selectionner un template lors de la creation d'un evenement pour pre-remplir les taches et le budget.

### API Endpoints
```
GET /api/templates (liste templates actifs publics)
GET /api/templates/type/:type (templates par type d'evenement)
```

### Fichiers a creer/modifier

#### 3.1 Hook (`src/hooks/useTemplates.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import type { EventTemplate, EventType } from '@/types';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async (): Promise<EventTemplate[]> => {
      const response = await api.get('/templates');
      return response.data.data || response.data;
    },
  });
}

export function useTemplatesByType(type: EventType | null) {
  return useQuery({
    queryKey: ['templates', 'type', type],
    queryFn: async (): Promise<EventTemplate[]> => {
      const response = await api.get(`/templates/type/${type}`);
      return response.data.data || response.data;
    },
    enabled: !!type,
  });
}
```

#### 3.2 Composant (`src/components/features/events/TemplateSelector.tsx`)
```typescript
// Composant avec:
// - Checkbox "Utiliser un template"
// - Liste deroulante des templates filtres par type
// - Apercu du template selectionne (taches, budget)
```

#### 3.3 Page (`src/pages/events/CreateEventPage.tsx`)
```typescript
// Modifications:
// 1. Ajouter state pour template selectionne
// 2. Ajouter TemplateSelector apres selection du type
// 3. Au submit, envoyer template_id si selectionne
// 4. Backend appliquera les taches/budget du template
```

### Estimation: 1-2 heures

---

## Resume des Taches

| # | Fonctionnalite | Priorite | Complexite | Estimation |
|---|----------------|----------|------------|------------|
| 1 | Admin Activity Logs | Moyenne | Moyenne | 2-3h |
| 2 | Import Invites CSV/Excel | Haute | Moyenne | 3-4h |
| 3 | Selection Template | Basse | Faible | 1-2h |

**Total estime: 6-9 heures**

---

## Ordre d'Implementation Recommande

1. **Import Invites** (priorite haute, utilite immediate)
2. **Admin Activity Logs** (complete le panel admin)
3. **Selection Template** (amelioration UX)

---

## Notes Techniques

### Dependances existantes utilisees
- TanStack Query (React Query) pour les hooks
- React Hook Form + Zod pour les formulaires
- Tailwind CSS + shadcn/ui pour les composants
- date-fns pour les dates
- Lucide React pour les icones

### Conventions de code
- Hooks dans `src/hooks/`
- Pages dans `src/pages/`
- Composants features dans `src/components/features/`
- Types dans `src/types/index.ts`
