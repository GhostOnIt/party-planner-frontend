# Cahier des Charges - Frontend Party Planner

## 1. Présentation du Projet

### 1.1 Contexte
Party Planner est une application SaaS de gestion d'événements permettant aux utilisateurs de planifier et organiser des fêtes, mariages, anniversaires et autres célébrations.

### 1.2 Objectif
Développer une interface utilisateur React moderne, responsive et intuitive qui consomme l'API REST Party Planner.

### 1.3 Stack Technique Recommandée
| Technologie | Usage |
|-------------|-------|
| React 18+ | Framework UI |
| TypeScript | Typage statique |
| React Router v6 | Routing |
| TanStack Query (React Query) | Gestion des données serveur |
| Zustand ou Redux Toolkit | État global |
| Tailwind CSS | Styling |
| React Hook Form + Zod | Formulaires et validation |
| Axios | Client HTTP |
| date-fns | Manipulation des dates |
| Recharts ou Chart.js | Graphiques |

---

## 2. Configuration API

### 2.1 URL de Base
```
Développement: http://localhost:8000/api
Production: https://api.party-planner.com/api
```

### 2.2 Authentification
L'API utilise **Laravel Sanctum** avec des tokens Bearer.

```typescript
// Configuration Axios recommandée
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2.2.1 Authentification OTP (One-Time Password)

Le système supporte l'authentification par code OTP à 6 chiffres pour :
- **Verification a l'inscription** : Verification de l'email ou telephone avant activation du compte
- **Connexion (2FA)** : Authentification a deux facteurs optionnelle
- **Recuperation de compte** : Alternative au lien de reinitialisation par email

#### Canaux d'envoi supportes
| Canal | Service | Description |
|-------|---------|-------------|
| Email | Mailhog (dev) / SMTP (prod) | Code envoye par email |
| SMS | Twilio | Code envoye par SMS |
| WhatsApp | Twilio | Code envoye via WhatsApp |

#### Endpoints API
```typescript
// Envoyer un OTP
POST /auth/otp/send
{
  identifier: string;  // email ou telephone
  type: 'registration' | 'login' | 'password_reset';
  channel: 'email' | 'sms' | 'whatsapp';
}

// Verifier un OTP
POST /auth/otp/verify
{
  identifier: string;
  code: string;  // 6 chiffres
  type: 'registration' | 'login' | 'password_reset';
}

// Renvoyer un OTP
POST /auth/otp/resend
{
  otp_id: number;
}

// Reinitialiser mot de passe apres OTP
POST /auth/otp/reset-password
{
  identifier: string;
  reset_token: string;
  password: string;
  password_confirmation: string;
}
```

#### Flow utilisateur
```
1. Utilisateur choisit le canal (email/SMS/WhatsApp)
2. Systeme envoie un code a 6 chiffres (expire en 10 min)
3. Utilisateur saisit le code
4. Verification et action selon le type (login, reset, etc.)
```

### 2.3 Variables d'Environnement
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Party Planner
```

---

## 3. Types TypeScript

### 3.1 Modèles de Données

```typescript
// types/index.ts

// Enums
export type EventType = 'mariage' | 'anniversaire' | 'baby_shower' | 'soiree' | 'brunch' | 'autre';
export type EventStatus = 'draft' | 'planning' | 'confirmed' | 'completed' | 'cancelled';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'maybe';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type BudgetCategory = 'location' | 'catering' | 'decoration' | 'entertainment' | 'photography' | 'transportation' | 'other';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type PaymentMethod = 'mtn_mobile_money' | 'airtel_money';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PlanType = 'starter' | 'pro';
export type PhotoType = 'moodboard' | 'event_photo';

// User Role
export type UserRole = 'admin' | 'user';

// User
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  email_verified_at: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Event
export interface Event {
  id: number;
  title: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string | null;
  location: string | null;
  description: string | null;
  expected_guests: number | null;
  budget: number | null;
  theme: string | null;
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

// Guest
export interface Guest {
  id: number;
  event_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: RsvpStatus;
  plus_one: boolean;
  plus_one_name: string | null;
  dietary_restrictions: string | null;
  notes: string | null;
  table_number: string | null;
  checked_in_at: string | null;
  invitation_sent_at: string | null;
  invitation_token: string;
  created_at: string;
}

// Guest Statistics
export interface GuestStatistics {
  statistics: {
    total: number;
    by_status: {
      accepted: number;
      declined: number;
      pending: number;
      maybe: number;
    };
    invitations: {
      sent: number;
      not_sent: number;
    };
    check_in: {
      checked_in: number;
      not_checked_in: number;
    };
    with_email: number;
    without_email: number;
  };
  can_add_more: boolean;
  remaining_slots: number;
}

// Task
export interface Task {
  id: number;
  event_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: number | null;
  assignee?: User;
  completed_at: string | null;
  created_at: string;
}

// Budget Item
export interface BudgetItem {
  id: number;
  event_id: number;
  category: BudgetCategory;
  name: string;
  estimated_cost: number;
  actual_cost: number | null;
  paid: boolean;
  paid_at: string | null;
  vendor_name: string | null;
  notes: string | null;
  created_at: string;
}

// Photo
export interface Photo {
  id: number;
  event_id: number;
  url: string;
  thumbnail_url: string;
  type: PhotoType;
  caption: string | null;
  is_featured: boolean;
  created_at: string;
}

// Collaborator
export interface Collaborator {
  id: number;
  event_id: number;
  user_id: number;
  user: User;
  role: CollaboratorRole;
  accepted_at: string | null;
  created_at: string;
}

// Notification
export interface Notification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

// Subscription
export interface Subscription {
  id: number;
  event_id: number;
  plan: PlanType;
  status: string;
  starts_at: string;
  ends_at: string;
  guest_limit: number;
  collaborator_limit: number | null;
}

// Payment
export interface Payment {
  id: number;
  user_id: number;
  subscription_id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  phone_number: string;
  created_at: string;
}

// Event Template (Admin)
export interface EventTemplate {
  id: number;
  event_type: EventType;
  name: string;
  description: string | null;
  default_tasks: Array<{
    title: string;
    description?: string;
    priority?: TaskPriority;
  }>;
  default_budget_categories: Array<{
    name: string;
    category: BudgetCategory;
    estimated_cost?: number;
  }>;
  suggested_themes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Admin Activity Log (Audit)
export type AdminAction = 'login' | 'create' | 'update' | 'delete' | 'view' | 'update_role' | 'toggle_active';

export interface AdminActivityLog {
  id: number;
  admin_id: number;
  action: AdminAction;
  model_type: string | null;  // e.g., "App\\Models\\User"
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
  by_admin: Array<{
    admin_id: number;
    admin_name: string;
    count: number;
  }>;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
```

---

## 4. Architecture des Pages

### 4.1 Structure des Routes

```
/                           → Redirection vers /dashboard ou /login
/login                      → Page de connexion
/register                   → Page d'inscription
/forgot-password            → Mot de passe oublié
/reset-password/:token      → Réinitialisation du mot de passe

/dashboard                  → Tableau de bord principal
/events                     → Liste des événements
/events/create              → Créer un événement
/events/:id                 → Détails d'un événement (avec onglets)
/events/:id/edit            → Modifier un événement
/events/:id/guests          → Gestion des invités
/events/:id/tasks           → Gestion des tâches
/events/:id/budget          → Gestion du budget
/events/:id/gallery         → Galerie photos
/events/:id/collaborators   → Gestion des collaborateurs
/events/:id/settings        → Paramètres de l'événement
/events/:id/subscription    → Abonnement de l'événement

/collaborations             → Événements où je collabore
/invitations                → Invitations en attente

/notifications              → Centre de notifications
/profile                    → Profil utilisateur
/settings                   → Paramètres du compte

/admin                      → Dashboard admin (admin uniquement)
/admin/users                → Gestion des utilisateurs
/admin/events               → Gestion des événements
/admin/payments             → Gestion des paiements
/admin/subscriptions        → Gestion des abonnements
/admin/templates            → Gestion des templates
/admin/activity-logs        → Historique des actions admin

/invitation/:token          → Page publique de réponse à invitation (non authentifiée)
```

---

## 5. Spécifications des Pages

### 5.1 Pages d'Authentification

#### 5.1.1 Page de Connexion (`/login`)

**Fonctionnalités :**
- Formulaire de connexion (email, mot de passe)
- Option "Se souvenir de moi"
- Lien vers inscription
- Lien vers mot de passe oublié
- Messages d'erreur de validation

**API :**
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { message, user, token }
```

**Wireframe :**
```
┌─────────────────────────────────────┐
│           Party Planner             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email                        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Mot de passe            👁  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ☐ Se souvenir de moi               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Se connecter          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Mot de passe oublié ?              │
│  Pas de compte ? S'inscrire         │
└─────────────────────────────────────┘
```

#### 5.1.2 Page d'Inscription (`/register`)

**Fonctionnalités :**
- Formulaire d'inscription (nom, email, mot de passe, confirmation)
- Validation en temps réel
- Redirection automatique après inscription

**API :**
```typescript
POST /api/auth/register
Body: { name, email, password, password_confirmation }
Response: { message, user, token }
```

#### 5.1.3 Mot de Passe Oublié (`/forgot-password`)

**API :**
```typescript
POST /api/auth/forgot-password
Body: { email }
```

#### 5.1.4 Réinitialisation (`/reset-password/:token`)

**API :**
```typescript
POST /api/auth/reset-password
Body: { token, email, password, password_confirmation }
```

#### 5.1.5 Envoi OTP (`/send-otp`)

**Fonctionnalités :**
- Selection du canal d'envoi (Email, SMS, WhatsApp)
- Saisie de l'identifiant (email ou telephone)
- Type d'OTP selon le contexte (?type=registration|login|password_reset)

**API :**
```typescript
POST /api/auth/otp/send
Body: { identifier, type, channel }
Response: { message, otp_id, expires_in }
```

**Wireframe :**
```
┌─────────────────────────────────────┐
│        Reinitialiser le mot         │
│           de passe                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Email ou telephone          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recevoir le code par :             │
│  ┌─────┐ ┌─────┐ ┌─────────┐       │
│  │Email│ │ SMS │ │WhatsApp │       │
│  └─────┘ └─────┘ └─────────┘       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Envoyer le code         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ← Retour a la connexion            │
└─────────────────────────────────────┘
```

#### 5.1.6 Verification OTP (`/otp`)

**Fonctionnalités :**
- Saisie du code a 6 chiffres
- Auto-submit quand le code est complet
- Bouton de renvoi avec countdown (60s)
- Affichage du canal et identifiant masque

**API :**
```typescript
POST /api/auth/otp/verify
Body: { identifier, code, type }
Response: { success, message, verified, verification_token?, reset_token?, user?, token? }
```

**Wireframe :**
```
┌─────────────────────────────────────┐
│        Verification OTP             │
│                                     │
│     Un code a ete envoye a          │
│     vo***@email.com                 │
│                                     │
│    ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐         │
│    │ │ │ │ │ │ │ │ │ │ │ │         │
│    └─┘ └─┘ └─┘ └─┘ └─┘ └─┘         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Verifier le code        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Pas recu ? Renvoyer (45s)          │
│                                     │
│  ← Retour a la connexion            │
└─────────────────────────────────────┘
```

#### 5.1.7 Nouveau mot de passe OTP (`/reset-password-otp`)

**Fonctionnalités :**
- Formulaire de nouveau mot de passe apres verification OTP
- Validation de la confirmation
- Connexion automatique apres reinitialisation

**API :**
```typescript
POST /api/auth/otp/reset-password
Body: { identifier, reset_token, password, password_confirmation }
Response: { success, message, user, token }
```

---

### 5.2 Dashboard (`/dashboard`)

**Fonctionnalités :**
- Vue d'ensemble de tous les événements
- Statistiques globales (événements actifs, invités totaux, tâches en cours)
- Événements à venir (prochains 30 jours)
- Tâches urgentes (haute priorité, bientôt dues)
- Graphique d'évolution (invités confirmés par événement)
- Accès rapide à la création d'événement
- Notifications récentes

**API :**
```typescript
GET /api/events                    // Liste des événements
GET /api/dashboard/user-stats      // Statistiques utilisateur
GET /api/dashboard/chart-data      // Données pour graphiques
GET /api/notifications/recent      // Notifications récentes
GET /api/collaborations            // Événements collaboratifs
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard                              🔔 (3)  👤 John Doe ▼  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 5        │ │ 234      │ │ 12       │ │ 45 000 € │              │
│  │ Événements│ │ Invités  │ │ Tâches   │ │ Budget   │              │
│  │ actifs   │ │ confirmés│ │ en cours │ │ total    │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                    │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐ │
│  │ Événements à venir          │ │ Tâches urgentes              │ │
│  │ ─────────────────────────── │ │ ──────────────────────────── │ │
│  │ 🎂 Anniversaire Marie  15/02│ │ ⚠️ Réserver traiteur   13/02 │ │
│  │ 💒 Mariage Jean       01/06 │ │ ⚠️ Confirmer DJ        14/02 │ │
│  │ 🎉 Soirée entreprise  20/03 │ │ ⚠️ Envoyer invitations 15/02 │ │
│  └─────────────────────────────┘ └──────────────────────────────┘ │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │ Confirmations par événement                                    ││
│  │ [=============== Graphique barres ================]            ││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                    │
│                    [+ Créer un événement]                          │
└────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Liste des Événements (`/events`)

**Fonctionnalités :**
- Liste paginée des événements
- Filtres : statut, type, recherche
- Tri par date, nom, statut
- Vue grille et vue liste
- Actions rapides : voir, modifier, dupliquer, supprimer
- Badge de statut coloré
- Affichage du nombre d'invités confirmés

**API :**
```typescript
GET /api/events?status=planning&type=mariage&search=jean&per_page=12&page=1
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  📅 Mes Événements                        [+ Nouvel événement]     │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...   │ Statut ▼ │ Type ▼ │   ☰ Liste  ⊞ Grille    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────┐│
│  │ 💒                  │ │ 🎂                  │ │ 🎉             ││
│  │ Mariage de Jean     │ │ Anniversaire Marie  │ │ Soirée Enter.  ││
│  │ ───────────────────│ │ ───────────────────│ │ ───────────────││
│  │ 📍 Paris            │ │ 📍 Lyon             │ │ 📍 Marseille   ││
│  │ 📅 01 Juin 2024     │ │ 📅 15 Février 2024  │ │ 📅 20 Mars 2024││
│  │ 👥 120/150 invités  │ │ 👥 25/30 invités    │ │ 👥 80/100      ││
│  │ [Planning] ●        │ │ [Confirmé] ●        │ │ [Brouillon] ●  ││
│  │                     │ │                     │ │                ││
│  │ 👁 ✏️ 📋 🗑        │ │ 👁 ✏️ 📋 🗑        │ │ 👁 ✏️ 📋 🗑   ││
│  └─────────────────────┘ └─────────────────────┘ └────────────────┘│
│                                                                    │
│                    < 1  2  3  ...  10 >                            │
└────────────────────────────────────────────────────────────────────┘
```

---

### 5.4 Création d'Événement (`/events/create`)

**Fonctionnalités :**
- Formulaire multi-étapes ou formulaire unique
- Sélection du type avec icônes
- Sélecteur de date/heure
- Champ de localisation
- Budget prévisionnel
- Option d'utiliser un template

**API :**
```typescript
POST /api/events
Body: {
  title: string,
  type: EventType,
  date: string,      // YYYY-MM-DD
  time?: string,     // HH:mm
  location?: string,
  description?: string,
  expected_guests?: number,
  budget?: number,
  theme?: string
}

GET /api/templates              // Templates disponibles
GET /api/templates/type/:type   // Templates par type
```

**Validation :**
- `title` : requis, max 255 caractères
- `type` : requis, valeur enum valide
- `date` : requis, format YYYY-MM-DD, date future

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  ← Retour          Créer un événement                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Type d'événement *                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │  💒    │ │  🎂    │ │  👶    │ │  🎉    │ │  ☕    │ │  📅    ││
│  │Mariage │ │Anniv.  │ │Baby S. │ │Soirée  │ │Brunch  │ │Autre   ││
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│
│                                                                    │
│  Titre de l'événement *                                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Ex: Mariage de Marie et Pierre                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌───────────────────────┐  ┌───────────────────────┐             │
│  │ Date *          📅    │  │ Heure          🕐    │             │
│  │ 15/06/2024            │  │ 14:00                 │             │
│  └───────────────────────┘  └───────────────────────┘             │
│                                                                    │
│  Lieu                                                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 📍 Château de Versailles, France                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌───────────────────────┐  ┌───────────────────────┐             │
│  │ Invités prévus        │  │ Budget (XAF)          │             │
│  │ 150                   │  │ 5 000 000             │             │
│  └───────────────────────┘  └───────────────────────┘             │
│                                                                    │
│  Description                                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                                                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ☐ Utiliser un template                                            │
│                                                                    │
│              [Annuler]                    [Créer l'événement]      │
└────────────────────────────────────────────────────────────────────┘
```

---

### 5.5 Détails d'un Événement (`/events/:id`)

**Structure :**
Page avec navigation par onglets :

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Événements     Mariage de Jean & Marie           [⚙️] [✏️]     │
│                   💒 Mariage • 01 Juin 2024 • Paris                │
├────────────────────────────────────────────────────────────────────┤
│  [Vue d'ensemble] [Invités] [Tâches] [Budget] [Galerie] [Équipe]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                    (Contenu de l'onglet actif)                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.5.1 Onglet Vue d'ensemble

**API :**
```typescript
GET /api/events/:id
GET /api/events/:id/dashboard
```

**Contenu :**
- Informations générales (date, lieu, description)
- Statistiques rapides (invités, tâches, budget)
- Progression globale
- Actions rapides
- Activité récente

#### 5.5.2 Onglet Invités (`/events/:id/guests`)

**Fonctionnalités :**
- Liste des invités avec pagination
- Filtres par statut RSVP
- Recherche par nom/email
- Import CSV/Excel
- Export CSV/PDF/Excel
- Envoi d'invitations (individuel ou en masse)
- Check-in le jour J
- Ajout/modification/suppression d'invités
- Vue des accompagnants (plus_one)
- Gestion des restrictions alimentaires

**API :**
```typescript
GET /api/events/:id/guests?status=accepted&search=marie&per_page=20
POST /api/events/:id/guests
PUT /api/events/:id/guests/:guestId
DELETE /api/events/:id/guests/:guestId
POST /api/events/:id/guests/:guestId/send-invitation
POST /api/events/:id/guests/:guestId/check-in
POST /api/events/:id/guests/:guestId/undo-check-in

// Statistiques des invités
GET /api/events/:id/guests/statistics
Response: {
  statistics: {
    total: number,
    by_status: { accepted: number, declined: number, pending: number, maybe: number },
    invitations: { sent: number, not_sent: number },
    check_in: { checked_in: number, not_checked_in: number },
    with_email: number,
    without_email: number
  },
  can_add_more: boolean,      // Peut ajouter plus d'invités selon le plan
  remaining_slots: number     // Places restantes
}

// Exports
GET /api/events/:id/exports/guests/csv
GET /api/events/:id/exports/guests/pdf
GET /api/events/:id/exports/guests/xlsx
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Invités (145)                                                     │
│  ─────────────────────────────────────────────────────────────────│
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │  145   │ │   98   │ │   12   │ │   35   │                      │
│  │ Total  │ │Confirmés│ │Déclinés│ │En attente│                    │
│  └────────┘ └────────┘ └────────┘ └────────┘                      │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...  │ Statut ▼ │  [📤 Import] [📥 Export ▼]        │
│                                  [✉️ Envoyer toutes invitations]   │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ☐ │ Nom           │ Email              │ RSVP    │ Actions   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ ☐ │ Marie Dupont  │ marie@email.com    │ ✅ Oui  │ ✏️ 🗑 ✉️ │ │
│  │ ☐ │   └ +1 Pierre │                    │         │           │ │
│  │ ☐ │ Jean Martin   │ jean@email.com     │ ⏳ Att. │ ✏️ 🗑 ✉️ │ │
│  │ ☐ │ Sophie Bernard│ sophie@email.com   │ ❌ Non  │ ✏️ 🗑    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [+ Ajouter un invité]              < 1 2 3 ... 8 >               │
└────────────────────────────────────────────────────────────────────┘
```

**Modal Ajout/Édition Invité :**
```
┌────────────────────────────────────────────┐
│  Ajouter un invité                    ✕   │
├────────────────────────────────────────────┤
│                                            │
│  Nom complet *                             │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Email                                     │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Téléphone                                 │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ☐ Avec accompagnant (+1)                  │
│                                            │
│  Restrictions alimentaires                 │
│  ┌──────────────────────────────────────┐ │
│  │ Végétarien, sans gluten...           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Notes                                     │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│         [Annuler]        [Enregistrer]     │
└────────────────────────────────────────────┘
```

#### 5.5.3 Onglet Tâches (`/events/:id/tasks`)

**Fonctionnalités :**
- Vue Kanban (colonnes par statut) ou vue liste
- Filtres par priorité, assigné, statut
- Drag & drop pour changer le statut
- Création rapide de tâche
- Attribution à un collaborateur
- Date d'échéance avec alertes
- Marquer comme complété

**API :**
```typescript
GET /api/events/:id/tasks
POST /api/events/:id/tasks
PUT /api/events/:id/tasks/:taskId
DELETE /api/events/:id/tasks/:taskId
POST /api/events/:id/tasks/:taskId/complete
POST /api/events/:id/tasks/:taskId/reopen
```

**Wireframe Vue Kanban :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Tâches                          [+ Nouvelle tâche]  ☰ Liste  ⊞   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  À faire (5)       │  En cours (3)     │  Terminé (12)            │
│  ─────────────────│──────────────────│─────────────────          │
│  ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐          │
│  │ 🔴 Réserver  │ │ │ 🟡 Choisir   │ │ │ ✅ Envoyer   │          │
│  │ traiteur     │ │ │ le menu      │ │ │ save-the-date│          │
│  │ 📅 15/02     │ │ │ 👤 Marie     │ │ │              │          │
│  │ 👤 Non assigné│ │ │ 📅 20/02    │ │ │              │          │
│  └──────────────┘ │ └──────────────┘ │ └──────────────┘          │
│  ┌──────────────┐ │ ┌──────────────┐ │ ┌──────────────┐          │
│  │ 🟡 Commander │ │ │ 🔴 Confirmer │ │ │ ✅ Réserver  │          │
│  │ les fleurs   │ │ │ DJ           │ │ │ hôtel        │          │
│  │ 📅 01/03     │ │ │ 📅 18/02     │ │ │              │          │
│  └──────────────┘ │ └──────────────┘ │ └──────────────┘          │
│                   │                   │                           │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.5.4 Onglet Budget (`/events/:id/budget`)

**Fonctionnalités :**
- Vue par catégorie avec totaux
- Graphique camembert par catégorie
- Comparaison estimé vs réel
- Marquage payé/non payé
- Progression du budget
- Alertes dépassement
- Export PDF/CSV/Excel

**API :**
```typescript
GET /api/events/:id/budget
GET /api/events/:id/budget/statistics
POST /api/events/:id/budget/items
PUT /api/events/:id/budget/items/:itemId
DELETE /api/events/:id/budget/items/:itemId
POST /api/events/:id/budget/items/:itemId/mark-paid
POST /api/events/:id/budget/items/:itemId/mark-unpaid

// Exports
GET /api/events/:id/exports/budget/csv
GET /api/events/:id/exports/budget/pdf
GET /api/events/:id/exports/budget/xlsx
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Budget                                        [📥 Export ▼]       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐      │
│  │ 5 000 000 XAF   │ │ 4 200 000 XAF   │ │ 3 500 000 XAF   │      │
│  │ Budget estimé   │ │ Dépenses réelles│ │ Déjà payé       │      │
│  │                 │ │ -800 000 ✅     │ │                 │      │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘      │
│                                                                    │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐ │
│  │     Répartition par          │  │ Par catégorie              │ │
│  │       catégorie              │  │                            │ │
│  │                              │  │ 🍽 Traiteur    2 000 000   │ │
│  │      [Pie Chart]             │  │ 📍 Lieu        1 500 000   │ │
│  │                              │  │ 🎵 Animation     500 000   │ │
│  │                              │  │ 📸 Photo        300 000   │ │
│  │                              │  │ 🚗 Transport     200 000   │ │
│  └──────────────────────────────┘  └────────────────────────────┘ │
│                                                                    │
│  Détail des dépenses                         [+ Ajouter dépense]  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Catégorie  │ Nom           │ Estimé    │ Réel      │ Payé    │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 🍽 Traiteur│ Menu principal│ 1 800 000 │ 1 900 000 │ ✅      │ │
│  │ 🍽 Traiteur│ Boissons      │   200 000 │   180 000 │ ☐       │ │
│  │ 📍 Lieu   │ Château       │ 1 500 000 │ 1 500 000 │ ✅      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.5.5 Onglet Galerie (`/events/:id/gallery`)

**Fonctionnalités :**
- Grille de photos responsive
- Deux types : Moodboard (inspiration) et Photos événement
- Upload multiple avec drag & drop
- Lightbox pour visualisation
- Définir photo en vedette
- Suppression individuelle et en masse
- Téléchargement

**API :**
```typescript
GET /api/events/:id/photos
GET /api/events/:id/photos/statistics
POST /api/events/:id/photos              // multipart/form-data
PUT /api/events/:id/photos/:photoId
DELETE /api/events/:id/photos/:photoId
POST /api/events/:id/photos/:photoId/set-featured
POST /api/events/:id/photos/:photoId/toggle-featured
POST /api/events/:id/photos/bulk-delete
POST /api/events/:id/photos/bulk-update-type
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Galerie                                                           │
├────────────────────────────────────────────────────────────────────┤
│  [Moodboard (15)]  [Photos événement (32)]     [📤 Ajouter photos] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │  ⭐     │ │         │ │         │ │         │ │         │     │
│  │  📷     │ │   📷    │ │   📷    │ │   📷    │ │   📷    │     │
│  │         │ │         │ │         │ │         │ │         │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │         │ │         │ │         │ │         │ │         │     │
│  │   📷    │ │   📷    │ │   📷    │ │   📷    │ │   📷    │     │
│  │         │ │         │ │         │ │         │ │         │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │     Glissez-déposez vos photos ici ou cliquez pour          │  │
│  │                    sélectionner                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.5.6 Onglet Équipe/Collaborateurs (`/events/:id/collaborators`)

**Fonctionnalités :**
- Liste des collaborateurs avec rôles
- Invitation par email
- Modification des rôles
- Révocation d'accès
- Renvoi d'invitation

**API :**
```typescript
GET /api/events/:id/collaborators
GET /api/events/:id/collaborators/statistics
POST /api/events/:id/collaborators         // { email, role }
PUT /api/events/:id/collaborators/:userId  // { role }
DELETE /api/events/:id/collaborators/:userId
POST /api/events/:id/collaborators/:userId/resend
```

**Rôles :**
| Rôle | Permissions |
|------|-------------|
| `owner` | Accès total, peut supprimer l'événement |
| `editor` | Peut modifier, ajouter invités/tâches/budget |
| `viewer` | Lecture seule |

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Équipe (4 membres)                      [+ Inviter collaborateur] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 👤  Jean Dupont          │ Propriétaire │                    │ │
│  │     jean@email.com       │ 👑           │                    │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 👤  Marie Martin         │ Éditeur ▼    │ 🗑                 │ │
│  │     marie@email.com      │              │                    │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 👤  Pierre Bernard       │ Lecteur ▼    │ 🗑                 │ │
│  │     pierre@email.com     │              │                    │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 👤  Sophie Durand        │ En attente   │ 📧 🗑              │ │
│  │     sophie@email.com     │ ⏳           │ Renvoyer           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Limites : 2/5 collaborateurs (Plan Starter)                       │
│  [Passer au plan Pro pour collaborateurs illimités]                │
└────────────────────────────────────────────────────────────────────┘
```

---

### 5.6 Collaborations (`/collaborations`)

**Fonctionnalités :**
- Liste des événements où l'utilisateur collabore
- Indication du rôle
- Accès rapide à l'événement
- Option de quitter

**API :**
```typescript
GET /api/collaborations
POST /api/events/:id/collaborators/leave
```

---

### 5.7 Invitations en attente (`/invitations`)

**Fonctionnalités :**
- Liste des invitations reçues non acceptées
- Accepter/Décliner une invitation

**API :**
```typescript
GET /api/collaborations/pending
POST /api/events/:id/collaborators/accept
POST /api/events/:id/collaborators/decline
```

---

### 5.8 Notifications (`/notifications`)

**Fonctionnalités :**
- Liste des notifications avec pagination
- Marquer comme lu (individuel/tout)
- Supprimer
- Filtrer (lues/non lues)
- Clic pour naviguer vers l'élément concerné

**API :**
```typescript
GET /api/notifications
GET /api/notifications/unread-count
GET /api/notifications/recent
PUT /api/notifications/:id/read
PUT /api/notifications/read-all
DELETE /api/notifications/:id
DELETE /api/notifications/clear-read
```

**Types de notifications :**
- `event_reminder` - Rappel d'événement
- `task_reminder` - Rappel de tâche
- `task_assigned` - Tâche assignée
- `guest_rsvp` - Réponse d'un invité
- `collaboration_invitation` - Invitation à collaborer
- `payment_success` - Paiement réussi
- `payment_failed` - Échec de paiement

---

### 5.9 Profil Utilisateur (`/profile`)

**Fonctionnalités :**
- Modifier nom, email
- Changer avatar
- Changer mot de passe
- Supprimer le compte

**API :**
```typescript
GET /api/user
// Note: Créer un endpoint API pour la mise à jour du profil
PUT /api/auth/password
```

---

### 5.10 Administration (Super Admin)

Les pages d'administration sont accessibles uniquement aux utilisateurs ayant le rôle `admin`.

#### 5.10.1 Dashboard Admin (`/admin`)

**Fonctionnalités :**
- Vue d'ensemble globale de la plateforme
- Statistiques clés (utilisateurs, événements, revenus)
- Graphiques d'évolution (inscriptions, paiements)
- Événements récents
- Paiements récents
- Accès rapide aux sections d'administration

**API :**
```typescript
GET /api/admin/stats
Response: {
  stats: {
    users: { total, new_this_month, growth_percentage },
    events: { total, active, completed, by_type },
    revenue: { total, this_month, last_month, growth_percentage },
    subscriptions: { total_active, by_plan: { starter, pro } }
  }
}

GET /api/admin/chart-data?period=month|week|year
Response: {
  chart_data: {
    users_growth: [{ date, count }],
    events_created: [{ date, count }],
    revenue: [{ date, amount }],
    subscriptions_by_plan: { starter, pro }
  },
  period: string
}
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  👑 Administration                          🔔 (3)  👤 Admin ▼      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 1,234    │ │ 456      │ │ 2.5M XAF │ │ 89       │              │
│  │ Utilisat.│ │ Événem.  │ │ Revenus  │ │ Abonn.   │              │
│  │ +12% ↑   │ │ +8% ↑    │ │ ce mois  │ │ actifs   │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                    │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐ │
│  │ Croissance utilisateurs     │ │ Revenus mensuels             │ │
│  │                             │ │                              │ │
│  │      [Line Chart]           │ │      [Bar Chart]             │ │
│  │                             │ │                              │ │
│  └─────────────────────────────┘ └──────────────────────────────┘ │
│                                                                    │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐ │
│  │ Derniers événements         │ │ Derniers paiements           │ │
│  │ ─────────────────────────── │ │ ──────────────────────────── │ │
│  │ Mariage Jean    - Planning  │ │ 15 000 XAF - MTN - ✅        │ │
│  │ Anniv. Marie    - Confirmé  │ │  5 000 XAF - Airtel - ⏳     │ │
│  │ Soirée Corp.    - Brouillon │ │ 15 000 XAF - MTN - ✅        │ │
│  └─────────────────────────────┘ └──────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.10.2 Gestion des Utilisateurs (`/admin/users`)

**Fonctionnalités :**
- Liste paginée de tous les utilisateurs
- Recherche par nom/email
- Filtre par rôle (admin/user)
- Tri par date d'inscription, nom, événements
- Voir le détail d'un utilisateur
- Modifier le rôle d'un utilisateur
- Supprimer un utilisateur (sauf admin)

**API :**
```typescript
GET /api/admin/users?search=jean&role=user&sort_by=created_at&sort_dir=desc&per_page=15
Response: PaginatedResponse<User & { events_count, collaborations_count }>

GET /api/admin/users/:id
Response: {
  user: User & { events, collaborations },
  stats: { events_count, guests_total, ... }
}

PUT /api/admin/users/:id/role
Body: { role: 'admin' | 'user' }
Response: { message, user }

DELETE /api/admin/users/:id
Response: { message }
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  👥 Gestion des Utilisateurs (1,234)                               │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...          │ Rôle ▼ │ Tri ▼                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 👤 │ Nom           │ Email              │ Rôle  │ Événem. │ ⚙ │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 👤 │ Jean Dupont   │ jean@email.com     │ 👑 Admin│   12   │ 👁│ │
│  │ 👤 │ Marie Martin  │ marie@email.com    │ User    │    5   │👁✏🗑│
│  │ 👤 │ Pierre B.     │ pierre@email.com   │ User    │    3   │👁✏🗑│
│  │ 👤 │ Sophie D.     │ sophie@email.com   │ User    │    8   │👁✏🗑│
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3  ...  82 >                        │
└────────────────────────────────────────────────────────────────────┘
```

**Modal Détail Utilisateur :**
```
┌────────────────────────────────────────────┐
│  Détails Utilisateur                   ✕   │
├────────────────────────────────────────────┤
│                                            │
│  👤 Jean Dupont                            │
│  📧 jean@email.com                         │
│  📅 Inscrit le 15/01/2024                  │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  Statistiques                              │
│  ┌────────┐ ┌────────┐ ┌────────┐         │
│  │   12   │ │   450  │ │   89   │         │
│  │ Événem.│ │ Invités│ │ Tâches │         │
│  └────────┘ └────────┘ └────────┘         │
│                                            │
│  Rôle actuel : User                        │
│  ┌──────────────────────────────────────┐ │
│  │ Changer le rôle ▼                    │ │
│  │  ○ User                              │ │
│  │  ○ Admin                             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│      [Annuler]        [Enregistrer]        │
└────────────────────────────────────────────┘
```

#### 5.10.3 Gestion des Événements (`/admin/events`)

**Fonctionnalités :**
- Liste de tous les événements de la plateforme
- Filtres par type, statut
- Recherche par titre
- Voir le détail (redirection vers la page événement)
- Statistiques par événement (invités, tâches, budget)

**API :**
```typescript
GET /api/admin/events?search=mariage&type=mariage&status=planning&sort_by=created_at&sort_dir=desc&per_page=15
Response: PaginatedResponse<Event & { user, guests_count, tasks_count, budget_items_count }>
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  📅 Gestion des Événements (456)                                    │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...      │ Type ▼ │ Statut ▼ │ Tri ▼                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Titre          │ Type      │ Créateur      │ Statut  │ Invités│ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Mariage Jean   │ 💒 Mariage│ Jean Dupont   │ Planning│  120   │ │
│  │ Anniv. Marie   │ 🎂 Anniv. │ Marie Martin  │ Confirmé│   30   │ │
│  │ Soirée Corp.   │ 🎉 Soirée │ Pierre B.     │ Draft   │   80   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3  ...  31 >                        │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.10.4 Gestion des Paiements (`/admin/payments`)

**Fonctionnalités :**
- Liste de tous les paiements
- Filtres par statut (pending, completed, failed)
- Filtre par méthode (MTN, Airtel)
- Filtre par période
- Total des revenus affiché
- Export des données

**API :**
```typescript
GET /api/admin/payments?status=completed&method=mtn_mobile_money&from=2024-01-01&to=2024-12-31&sort_by=created_at&sort_dir=desc&per_page=15
Response: PaginatedResponse<Payment & { user, subscription }>
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  💰 Gestion des Paiements                      Total: 12.5M XAF    │
├────────────────────────────────────────────────────────────────────┤
│  Statut ▼ │ Méthode ▼ │ Du 📅  │ Au 📅  │               [📥 Export]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Réf.         │ Utilisateur  │ Montant   │ Méthode│ Statut    │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ PAY-2024-001 │ Jean Dupont  │ 15 000 XAF│ 🟡 MTN │ ✅ Complété│ │
│  │ PAY-2024-002 │ Marie Martin │  5 000 XAF│ 🔴Airtel│ ⏳ En cours│ │
│  │ PAY-2024-003 │ Pierre B.    │ 15 000 XAF│ 🟡 MTN │ ❌ Échoué │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3  ...  120 >                       │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.10.5 Gestion des Abonnements (`/admin/subscriptions`)

**Fonctionnalités :**
- Liste de tous les abonnements
- Filtres par plan (starter, pro)
- Filtre par statut de paiement
- Statistiques par plan

**API :**
```typescript
GET /api/admin/subscriptions?plan=pro&status=paid&sort_by=created_at&sort_dir=desc&per_page=15
Response: PaginatedResponse<Subscription & { event, event.user }>
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  📋 Gestion des Abonnements                                        │
├────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐                                    │
│  │    156     │ │     89     │                                    │
│  │  Starter   │ │    Pro     │                                    │
│  └────────────┘ └────────────┘                                    │
├────────────────────────────────────────────────────────────────────┤
│  Plan ▼ │ Statut ▼ │ Tri ▼                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Événement       │ Créateur      │ Plan    │ Statut │ Expire  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Mariage Jean    │ Jean Dupont   │ Pro     │ ✅ Payé│ 01/06/25│ │
│  │ Anniv. Marie    │ Marie Martin  │ Starter │ ✅ Payé│ 15/02/25│ │
│  │ Soirée Corp.    │ Pierre B.     │ Pro     │ ⏳ Att.│ --      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3  ...  17 >                        │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.10.6 Gestion des Templates (`/admin/templates`)

**Fonctionnalités :**
- Liste de tous les templates d'événements
- Créer/modifier/supprimer des templates
- Activer/désactiver un template
- Prévisualiser un template
- Filtrer par type d'événement

**API :**
```typescript
GET /api/admin/templates?type=mariage&active=true&search=classique&sort_by=created_at&sort_dir=desc&per_page=15
Response: PaginatedResponse<EventTemplate>

POST /api/admin/templates
Body: {
  event_type: EventType,
  name: string,
  description?: string,
  default_tasks?: Array<{ title, description?, priority? }>,
  default_budget_categories?: Array<{ name, category, estimated_cost? }>,
  suggested_themes?: string[],
  is_active?: boolean
}
Response: { message, template }

PUT /api/admin/templates/:id
Body: { ... same as POST ... }
Response: { message, template }

DELETE /api/admin/templates/:id
Response: { message }

POST /api/admin/templates/:id/toggle-active
Response: { message, is_active }
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  📝 Gestion des Templates                      [+ Nouveau template] │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...      │ Type ▼ │ Actif ▼                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Nom               │ Type      │ Tâches │ Budget │ Actif │ ⚙  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ Mariage Classique │ 💒 Mariage│   25   │   12   │ ✅    │✏️🗑│ │
│  │ Anniv. Enfant     │ 🎂 Anniv. │   15   │    8   │ ✅    │✏️🗑│ │
│  │ Baby Shower Rose  │ 👶 Baby S.│   12   │    6   │ ❌    │✏️🗑│ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3 >                                 │
└────────────────────────────────────────────────────────────────────┘
```

**Modal Création/Édition Template :**
```
┌────────────────────────────────────────────────────────────────────┐
│  Créer un template                                             ✕   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Type d'événement *                                                │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ 💒 Mariage ▼                                                │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Nom du template *                                                 │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Ex: Mariage Champêtre                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Description                                                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Tâches par défaut                           [+ Ajouter tâche]     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ • Réserver la salle              [Haute ▼]            🗑   │   │
│  │ • Choisir le traiteur            [Moyenne ▼]          🗑   │   │
│  │ • Commander les fleurs           [Basse ▼]            🗑   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Catégories budget par défaut                [+ Ajouter]           │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ • Lieu        │ Location     │ 1 500 000 XAF         🗑   │   │
│  │ • Traiteur    │ Catering     │ 2 000 000 XAF         🗑   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Thèmes suggérés (séparés par virgule)                             │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Champêtre, Bohème, Vintage, Romantique                      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ☑ Template actif                                                  │
│                                                                    │
│              [Annuler]                    [Enregistrer]            │
└────────────────────────────────────────────────────────────────────┘
```

#### 5.10.7 Historique des Actions Admin (`/admin/activity-logs`)

**Fonctionnalités :**
- Liste paginée de toutes les actions effectuées par les administrateurs
- Filtres par type d'action (login, create, update, delete, etc.)
- Filtre par type de modèle (User, EventTemplate, Event)
- Filtre par administrateur
- Filtre par période (date de début, date de fin)
- Recherche dans la description
- Statistiques des activités (total, aujourd'hui, cette semaine, ce mois)
- Détail des modifications (anciennes/nouvelles valeurs)

**API :**
```typescript
GET /api/admin/activity-logs?action=update_role&model_type=App%5CModels%5CUser&admin_id=1&from=2024-01-01&to=2024-12-31&search=rôle&per_page=15
Response: PaginatedResponse<AdminActivityLog>

GET /api/admin/activity-logs/stats
Response: {
  stats: {
    total: number,
    today: number,
    this_week: number,
    this_month: number,
    by_action: Record<string, number>,
    by_model_type: Record<string, number>,
    by_admin: Array<{ admin_id, admin_name, count }>
  }
}
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│  📋 Historique des Actions Admin                                    │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │   1,234  │ │    45    │ │   156    │ │   523    │              │
│  │  Total   │ │ Auj.     │ │ Semaine  │ │ Mois     │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...  │ Action ▼ │ Type ▼ │ Admin ▼ │ Du 📅 │ Au 📅 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Date/Heure      │ Admin        │ Action    │ Description      │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 13/12 14:32     │ Alex Sonicka │ 🔄 update │ Changement rôle  │ │
│  │                 │              │   _role   │ de Jean Dupont   │ │
│  │                 │              │           │ user → admin     │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 13/12 14:15     │ Alex Sonicka │ 🗑 delete │ Suppression de   │ │
│  │                 │              │           │ Marie Martin     │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 13/12 10:22     │ Alex Sonicka │ ➕ create │ Création template│ │
│  │                 │              │           │ "Mariage Chic"   │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 13/12 09:00     │ Alex Sonicka │ 🔑 login  │ Connexion admin  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                        < 1  2  3  ...  82 >                        │
└────────────────────────────────────────────────────────────────────┘
```

**Modal Détail Action :**
```
┌────────────────────────────────────────────┐
│  Détails de l'action                   ✕   │
├────────────────────────────────────────────┤
│                                            │
│  📅 13 décembre 2024 à 14:32               │
│  👤 Admin : Alex Sonicka                   │
│  🔄 Action : update_role                   │
│  📦 Modèle : User #42                      │
│                                            │
│  Description :                             │
│  Changement de rôle de Jean Dupont         │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  Modifications :                           │
│  ┌──────────────────────────────────────┐ │
│  │ Champ  │ Avant    │ Après            │ │
│  ├──────────────────────────────────────┤ │
│  │ role   │ user     │ admin            │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ─────────────────────────────────────────│
│                                            │
│  🌐 IP : 192.168.1.1                       │
│  💻 Mozilla/5.0 (Windows NT 10.0...)       │
│                                            │
│                              [Fermer]      │
└────────────────────────────────────────────┘
```

**Types d'actions :**
| Action | Icône | Description |
|--------|-------|-------------|
| `login` | 🔑 | Connexion au panel admin |
| `create` | ➕ | Création d'un élément |
| `update` | 🔄 | Modification d'un élément |
| `delete` | 🗑 | Suppression d'un élément |
| `view` | 👁 | Consultation d'un élément |
| `update_role` | 👤 | Changement de rôle utilisateur |
| `toggle_active` | ⚡ | Activation/désactivation |

**Types de modèles concernés :**
- `App\Models\User` - Actions sur les utilisateurs
- `App\Models\EventTemplate` - Actions sur les templates
- `App\Models\Event` - Actions sur les événements
- `null` - Actions système (login)

#### 5.10.8 Routes Admin

```
/admin                  → Dashboard Admin
/admin/users            → Liste des utilisateurs
/admin/users/:id        → Détail utilisateur (modal ou page)
/admin/events           → Liste des événements
/admin/payments         → Liste des paiements
/admin/subscriptions    → Liste des abonnements
/admin/templates        → Liste des templates
/admin/templates/create → Créer template (modal ou page)
/admin/templates/:id    → Éditer template (modal ou page)
/admin/activity-logs    → Historique des actions admin
```

#### 5.10.9 Protection des Routes Admin

```typescript
// PrivateRoute.tsx - Vérification du rôle admin
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';  // Ajouter ce champ
  // ...
}

// AdminRoute wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

#### 5.10.10 Navigation Admin

Ajouter un lien "Administration" dans le sidebar/header uniquement visible pour les admins :

```typescript
// Sidebar.tsx
{user.role === 'admin' && (
  <NavLink to="/admin">
    <Crown className="w-5 h-5" />
    Administration
  </NavLink>
)}
```

---

### 5.11 Abonnement (`/events/:id/subscription`)

**Fonctionnalités :**
- Voir le plan actuel
- Limites (invités, collaborateurs)
- Upgrader le plan
- Historique des paiements
- Renouveler

**API :**
```typescript
GET /api/events/:id/subscription
GET /api/events/:id/subscription/calculate-price?plan=pro&guest_count=200
GET /api/events/:id/subscription/check-limits
POST /api/events/:id/subscription           // S'abonner
POST /api/events/:id/subscription/upgrade
POST /api/events/:id/subscription/cancel
POST /api/events/:id/subscription/renew
```

**Plans :**
| Plan | Prix | Invités | Collaborateurs |
|------|------|---------|----------------|
| Starter | 5 000 XAF | 50 | 2 |
| Pro | 15 000 XAF | 200 | Illimité |

---

### 5.11 Paiement Mobile Money

**Flow de paiement :**
1. Utilisateur sélectionne plan et méthode (MTN/Airtel)
2. Saisie du numéro de téléphone
3. Initiation du paiement → API retourne référence
4. Polling du statut jusqu'à `completed` ou `failed`
5. Affichage du résultat

**API :**
```typescript
POST /api/payments/initiate
// ou
POST /api/payments/mtn/initiate
POST /api/payments/airtel/initiate

Body: {
  event_id: number,
  plan: 'starter' | 'pro',
  payment_method: 'mtn_mobile_money' | 'airtel_money',
  phone_number: string  // Format: +242 XX XXX XX XX
}

// Polling
GET /api/payments/:id/poll
GET /api/payments/:id/status
POST /api/payments/:id/retry
```

**Wireframe Paiement :**
```
┌────────────────────────────────────────────┐
│  Paiement - Plan Pro                       │
├────────────────────────────────────────────┤
│                                            │
│  Montant : 15 000 XAF                      │
│                                            │
│  Méthode de paiement                       │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ 🟡 MTN      │  │ 🔴 Airtel    │       │
│  │ Mobile Money│  │ Money        │       │
│  └──────────────┘  └──────────────┘       │
│                                            │
│  Numéro de téléphone                       │
│  ┌──────────────────────────────────────┐ │
│  │ +242 XX XXX XX XX                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ⚠️ Vous recevrez une demande de          │
│  confirmation sur votre téléphone          │
│                                            │
│            [Payer 15 000 XAF]              │
└────────────────────────────────────────────┘
```

**État Pending :**
```
┌────────────────────────────────────────────┐
│  Paiement en cours...                      │
├────────────────────────────────────────────┤
│                                            │
│              ⏳                            │
│                                            │
│  Veuillez confirmer le paiement            │
│  sur votre téléphone                       │
│                                            │
│  Référence : PAY-2024-XXXX                 │
│                                            │
│  [Polling animation]                       │
│                                            │
└────────────────────────────────────────────┘
```

---

### 5.12 Page d'Invitation Publique (`/invitation/:token`)

**Page non authentifiée** accessible via le lien envoyé aux invités.

**Fonctionnalités :**
- Afficher les détails de l'événement
- Formulaire de réponse RSVP
- Confirmation accompagnant
- Restrictions alimentaires
- Message personnel

**API :**
```typescript
GET /api/invitations/:token
POST /api/invitations/:token/respond
Body: {
  response: 'accepted' | 'declined' | 'maybe',
  plus_one_attending?: boolean,
  plus_one_name?: string,
  dietary_restrictions?: string,
  message?: string
}
```

**Wireframe :**
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                         💒                                         │
│                                                                    │
│              Mariage de Jean & Marie                               │
│                                                                    │
│              📅 1er Juin 2024 à 14h00                              │
│              📍 Château de Versailles                              │
│                                                                    │
│  ─────────────────────────────────────────────────────────────── │
│                                                                    │
│  Bonjour Pierre,                                                   │
│                                                                    │
│  Vous êtes cordialement invité(e) à notre mariage.                │
│  Merci de nous confirmer votre présence.                          │
│                                                                    │
│  ─────────────────────────────────────────────────────────────── │
│                                                                    │
│  Votre réponse :                                                   │
│                                                                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                     │
│  │ ✅ Je      │ │ ❌ Je ne   │ │ ❓ Peut-   │                     │
│  │ participe  │ │ participe  │ │ être       │                     │
│  │            │ │ pas        │ │            │                     │
│  └────────────┘ └────────────┘ └────────────┘                     │
│                                                                    │
│  ☐ Je viendrai avec un accompagnant                                │
│    Nom de l'accompagnant : ___________________                     │
│                                                                    │
│  Restrictions alimentaires :                                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Végétarien, allergie aux noix...                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Message pour les mariés (optionnel) :                             │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│                    [Envoyer ma réponse]                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Composants Réutilisables

### 6.1 Liste des Composants à Créer

```
components/
├── ui/                         # Composants UI de base
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Checkbox.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Dropdown.tsx
│   ├── Tabs.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Spinner.tsx
│   ├── Alert.tsx
│   ├── Toast.tsx
│   ├── Progress.tsx
│   ├── EmptyState.tsx
│   └── Skeleton.tsx
│
├── forms/                      # Composants de formulaire
│   ├── FormField.tsx
│   ├── DatePicker.tsx
│   ├── TimePicker.tsx
│   ├── FileUpload.tsx
│   ├── PhoneInput.tsx
│   └── SearchInput.tsx
│
├── layout/                     # Composants de mise en page
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── PageHeader.tsx
│   ├── Container.tsx
│   └── AuthLayout.tsx
│
├── features/                   # Composants métier
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventTypeSelector.tsx
│   │   └── EventStatusBadge.tsx
│   │
│   ├── guests/
│   │   ├── GuestList.tsx
│   │   ├── GuestForm.tsx
│   │   ├── GuestImport.tsx
│   │   ├── GuestCard.tsx
│   │   └── RsvpBadge.tsx
│   │
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskKanban.tsx
│   │   └── PriorityBadge.tsx
│   │
│   ├── budget/
│   │   ├── BudgetOverview.tsx
│   │   ├── BudgetItemForm.tsx
│   │   ├── BudgetChart.tsx
│   │   └── CategoryIcon.tsx
│   │
│   ├── photos/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── Lightbox.tsx
│   │   └── PhotoCard.tsx
│   │
│   ├── collaborators/
│   │   ├── CollaboratorList.tsx
│   │   ├── InviteForm.tsx
│   │   └── RoleBadge.tsx
│   │
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationList.tsx
│   │   └── NotificationItem.tsx
│   │
│   └── payments/
│       ├── PlanCard.tsx
│       ├── PaymentForm.tsx
│       └── PaymentStatus.tsx
│
└── charts/                     # Composants graphiques
    ├── PieChart.tsx
    ├── BarChart.tsx
    └── ProgressChart.tsx
```

---

## 7. Gestion d'État

### 7.1 État Global (Zustand)

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// stores/notificationStore.ts
interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
}
```

### 7.2 État Serveur (TanStack Query)

```typescript
// hooks/useEvents.ts
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => api.get('/events', { params: filters }),
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.get(`/events/${id}`),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventData) => api.post('/events', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
```

---

## 8. Gestion des Erreurs

### 8.1 Types d'Erreurs

```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
```

### 8.2 Affichage des Erreurs

| Code | Comportement |
|------|--------------|
| 400 | Toast d'erreur avec message |
| 401 | Redirection vers /login |
| 403 | Toast "Accès non autorisé" |
| 404 | Page 404 ou Toast selon contexte |
| 422 | Afficher erreurs de validation sous les champs |
| 500 | Toast "Erreur serveur, réessayez plus tard" |

### 8.3 États de Chargement

- Utiliser des Skeletons pour les listes
- Spinner pour les actions (boutons)
- Progress bar pour les uploads

---

## 9. Responsive Design

### 9.1 Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 9.2 Adaptations Mobile

- Sidebar → Bottom navigation ou hamburger menu
- Tables → Cards empilées
- Kanban → Liste verticale
- Grille photos → 2 colonnes
- Formulaires → Pleine largeur

---

## 10. Accessibilité (a11y)

### 10.1 Exigences

- Labels pour tous les champs de formulaire
- ARIA attributes pour les composants custom
- Navigation au clavier
- Contraste de couleurs suffisant (WCAG AA)
- Focus visible
- Messages d'erreur associés aux champs

---

## 11. Performance

### 11.1 Optimisations

- Lazy loading des routes
- Pagination côté serveur
- Debounce sur les recherches
- Optimistic updates pour les actions rapides
- Mise en cache avec React Query
- Compression des images avant upload

### 11.2 Code Splitting

```typescript
// Routes avec lazy loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
```

---

## 12. Tests

### 12.1 Types de Tests

| Type | Outil | Couverture |
|------|-------|------------|
| Unitaires | Vitest | Hooks, utils, stores |
| Composants | Testing Library | Composants UI |
| E2E | Playwright | Parcours critiques |

### 12.2 Parcours E2E Critiques

1. Inscription → Création événement → Ajout invité
2. Connexion → Voir événement → Modifier tâche
3. Réponse invitation publique
4. Processus de paiement

---

## 13. Internationalisation (i18n)

### 13.1 Configuration

L'application doit être préparée pour le multilingue (français par défaut).

```typescript
// Utiliser react-i18next
// Fichiers de traduction dans /locales/fr.json, /locales/en.json
```

### 13.2 Éléments à Traduire

- Labels et placeholders
- Messages d'erreur
- Notifications
- Boutons et actions
- Dates (format local)
- Montants (devise locale)

---

## 14. Sécurité

### 14.1 Bonnes Pratiques

- Sanitization des inputs (XSS)
- Token stocké en localStorage (ou httpOnly cookie pour plus de sécurité)
- HTTPS obligatoire en production
- Validation côté client ET serveur
- Pas de données sensibles dans les URLs
- Protection CSRF (gérée par Sanctum)

---

## 15. Livrables Attendus

### 15.1 Structure du Projet

```
frontend/
├── public/
├── src/
│   ├── api/           # Configuration Axios, endpoints
│   ├── assets/        # Images, fonts
│   ├── components/    # Composants réutilisables
│   ├── hooks/         # Hooks custom
│   ├── layouts/       # Layouts de page
│   ├── pages/         # Pages/Routes
│   ├── stores/        # État global (Zustand)
│   ├── styles/        # CSS global, Tailwind config
│   ├── types/         # Types TypeScript
│   ├── utils/         # Fonctions utilitaires
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 15.2 Documentation

- README avec instructions d'installation
- Documentation des composants (Storybook optionnel)
- Variables d'environnement documentées

### 15.3 Qualité de Code

- ESLint + Prettier configurés
- Pas d'erreurs TypeScript
- Tests passants
- Code review avant merge

---

## 16. Planning Suggéré

### Phase 1 : Setup & Auth
- Configuration projet (Vite, TS, Tailwind)
- Composants UI de base
- Pages d'authentification
- Store auth + intercepteurs

### Phase 2 : Core Features
- Dashboard
- Liste et création d'événements
- Page détails événement (structure onglets)

### Phase 3 : Gestion Événement
- Onglet Invités (CRUD, import/export)
- Onglet Tâches (liste + kanban)
- Onglet Budget

### Phase 4 : Fonctionnalités Avancées
- Galerie photos
- Collaborateurs
- Notifications

### Phase 5 : Paiements & Finitions
- Abonnements
- Paiements Mobile Money
- Page invitation publique
- Tests E2E

### Phase 6 : Optimisation
- Performance
- Accessibilité
- Tests
- Documentation

---

## 17. Policies et Autorisations Backend

Le backend utilise des **Policies Laravel** pour gerer les autorisations. Voici les policies disponibles que le frontend doit prendre en compte :

### 17.1 EventPolicy

| Methode | Autorise |
|---------|----------|
| `viewAny` | Tous les utilisateurs authentifies |
| `view` | Proprietaire, collaborateur ou admin |
| `create` | Tous les utilisateurs authentifies |
| `update` | Proprietaire, editeur collaborateur ou admin |
| `delete` | Proprietaire uniquement ou admin |
| `collaborate` | Proprietaire ou admin |
| `export` | Proprietaire, collaborateur ou admin |

### 17.2 PaymentPolicy

| Methode | Autorise |
|---------|----------|
| `viewAny` | Tous les utilisateurs authentifies |
| `view` | Proprietaire de l'abonnement ou admin |
| `create` | Tous les utilisateurs authentifies |
| `initiate` | Proprietaire de l'abonnement ou admin |
| `checkStatus` | Proprietaire de l'abonnement ou admin |
| `retry` | Proprietaire + paiement echoue, ou admin |
| `cancel` | Proprietaire + paiement en attente, ou admin |
| `requestRefund` | Proprietaire + paiement complete, ou admin |

### 17.3 CollaboratorPolicy

| Methode | Autorise |
|---------|----------|
| `viewAny` | Peut voir l'evenement |
| `view` | Peut voir l'evenement |
| `create` | Proprietaire de l'evenement ou collaborateur owner |
| `update` | Proprietaire ou collaborateur owner (sauf autres owners) |
| `delete` | Proprietaire ou collaborateur owner (sauf event owner) |
| `accept` | Utilisateur invite uniquement (non accepte) |
| `decline` | Utilisateur invite uniquement (non accepte) |
| `leave` | Collaborateur lui-meme (sauf proprietaire de l'evenement) |
| `resendInvitation` | Proprietaire ou collaborateur owner |

### 17.4 AdminPolicy

| Methode | Autorise |
|---------|----------|
| `access` | Admin uniquement |
| `viewDashboard` | Admin uniquement |
| `manageUsers` | Admin uniquement |
| `viewUser` | Admin uniquement |
| `updateUserRole` | Admin (sauf sur soi-meme) |
| `deleteUser` | Admin (sauf sur soi-meme et autres admins) |
| `viewAllEvents` | Admin uniquement |
| `viewAllPayments` | Admin uniquement |
| `viewAllSubscriptions` | Admin uniquement |
| `viewActivityLogs` | Admin uniquement |
| `manageTemplates` | Admin uniquement |

### 17.5 Gestion des erreurs d'autorisation

Le frontend doit gerer les erreurs 403 (Forbidden) renvoyees par les policies :

```typescript
// Dans l'intercepteur Axios
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Afficher un message ou rediriger
      toast.error("Vous n'avez pas les permissions pour cette action");
    }
    return Promise.reject(error);
  }
);
```

---

## 18. Request Classes Backend (Validation)

Le backend utilise des **Form Request Classes** pour valider les donnees entrantes. Voici les regles de validation pour les endpoints admin :

### 18.1 ListUsersRequest

| Champ | Type | Regles |
|-------|------|--------|
| `search` | string | optionnel, max 255 caracteres |
| `role` | enum | optionnel, `admin` ou `user` |
| `sort_by` | string | optionnel, `name`, `email`, `created_at`, `role` |
| `sort_dir` | string | optionnel, `asc` ou `desc` |
| `per_page` | integer | optionnel, 1-100 |

### 18.2 UpdateUserRoleRequest

| Champ | Type | Regles |
|-------|------|--------|
| `role` | enum | requis, `admin` ou `user` |

> **Note:** Un admin ne peut pas modifier son propre role.

### 18.3 ListEventsRequest

| Champ | Type | Regles |
|-------|------|--------|
| `search` | string | optionnel, max 255 caracteres |
| `type` | enum | optionnel, EventType |
| `status` | enum | optionnel, EventStatus |
| `user_id` | integer | optionnel, doit exister |
| `from` | date | optionnel |
| `to` | date | optionnel, apres ou egal a `from` |
| `sort_by` | string | optionnel |
| `sort_dir` | string | optionnel, `asc` ou `desc` |
| `per_page` | integer | optionnel, 1-100 |

### 18.4 ListPaymentsRequest

| Champ | Type | Regles |
|-------|------|--------|
| `status` | enum | optionnel, PaymentStatus |
| `method` | enum | optionnel, PaymentMethod |
| `user_id` | integer | optionnel, doit exister |
| `from` | date | optionnel |
| `to` | date | optionnel, apres ou egal a `from` |
| `min_amount` | numeric | optionnel, >= 0 |
| `max_amount` | numeric | optionnel, >= min_amount |
| `sort_by` | string | optionnel |
| `sort_dir` | string | optionnel, `asc` ou `desc` |
| `per_page` | integer | optionnel, 1-100 |

### 18.5 ListSubscriptionsRequest

| Champ | Type | Regles |
|-------|------|--------|
| `plan` | enum | optionnel, PlanType |
| `status` | enum | optionnel, PaymentStatus |
| `user_id` | integer | optionnel, doit exister |
| `event_id` | integer | optionnel, doit exister |
| `expired` | boolean | optionnel |
| `from` | date | optionnel |
| `to` | date | optionnel, apres ou egal a `from` |
| `sort_by` | string | optionnel |
| `sort_dir` | string | optionnel, `asc` ou `desc` |
| `per_page` | integer | optionnel, 1-100 |

### 18.6 ListActivityLogsRequest

| Champ | Type | Regles |
|-------|------|--------|
| `admin_id` | integer | optionnel, doit exister |
| `action` | enum | optionnel, actions predefinies |
| `model_type` | enum | optionnel, `User`, `Event`, `Payment`, etc. |
| `model_id` | integer | optionnel |
| `search` | string | optionnel, max 255 caracteres |
| `from` | date | optionnel |
| `to` | date | optionnel, apres ou egal a `from` |
| `sort_by` | string | optionnel |
| `sort_dir` | string | optionnel, `asc` ou `desc` |
| `per_page` | integer | optionnel, 1-100 |

### 18.7 StoreTemplateRequest / UpdateTemplateRequest

| Champ | Type | Regles |
|-------|------|--------|
| `name` | string | requis, max 255 caracteres |
| `description` | string | optionnel, max 1000 caracteres |
| `type` | enum | requis, EventType |
| `theme` | string | optionnel, max 100 caracteres |
| `is_active` | boolean | optionnel |
| `is_featured` | boolean | optionnel |
| `preview_image` | file | optionnel, image, max 2MB |
| `tasks` | array | optionnel, tableau de taches |
| `tasks.*.title` | string | requis si tasks present, max 255 |
| `tasks.*.priority` | enum | optionnel, `low`, `medium`, `high` |
| `budget_items` | array | optionnel, tableau d'items budget |
| `budget_items.*.category` | string | requis si budget_items present |
| `budget_items.*.name` | string | requis si budget_items present |
| `guest_categories` | array | optionnel, tableau de strings |
| `colors.primary` | string | optionnel, format hex (#RRGGBB) |
| `colors.secondary` | string | optionnel, format hex (#RRGGBB) |
| `colors.accent` | string | optionnel, format hex (#RRGGBB) |

---

## 19. Tests Backend Disponibles

Le backend dispose de tests automatises pour valider le bon fonctionnement de l'API :

| Fichier de Test | Couverture |
|-----------------|------------|
| `PaymentControllerTest.php` | Index, initiate MTN/Airtel, status, poll, retry |
| `NotificationControllerTest.php` | Index, markAsRead, bulkDelete, settings |
| `SubscriptionControllerTest.php` | Show, subscribe, upgrade, cancel, renew |
| `ExportControllerTest.php` | Export CSV/PDF/XLSX pour guests, budget, tasks |
| `WebhookControllerTest.php` | MTN/Airtel webhooks, signatures, error handling |

Pour executer les tests backend :
```bash
php artisan test
```

---

## 20. Contacts & Support

- **Documentation API** : `docs/API.md`
- **Specification OpenAPI** : `docs/openapi.yaml`
- **Swagger UI** : `/api/documentation` (apres installation l5-swagger)

---

## Annexes

### A. Palette de Couleurs Suggérée

```css
/* Couleurs principales */
--primary: #6366f1;      /* Indigo - Actions principales */
--secondary: #8b5cf6;    /* Violet - Accents */

/* Statuts */
--success: #22c55e;      /* Vert - Succès, confirmé */
--warning: #f59e0b;      /* Orange - Attention, en attente */
--error: #ef4444;        /* Rouge - Erreur, décliné */
--info: #3b82f6;         /* Bleu - Information */

/* Priorités */
--priority-low: #22c55e;
--priority-medium: #f59e0b;
--priority-high: #ef4444;

/* Types d'événements */
--event-mariage: #ec4899;    /* Pink */
--event-anniversaire: #8b5cf6; /* Purple */
--event-baby-shower: #3b82f6;  /* Blue */
--event-soiree: #eab308;       /* Yellow */
--event-brunch: #f97316;       /* Orange */
--event-autre: #6b7280;        /* Gray */
```

### B. Icônes Recommandées

Utiliser **Lucide React** ou **Heroicons** :

| Concept | Icône |
|---------|-------|
| Événement | Calendar |
| Invités | Users |
| Tâches | CheckSquare |
| Budget | Wallet |
| Photos | Image |
| Collaborateurs | UserPlus |
| Notifications | Bell |
| Paramètres | Settings |
| Mariage | Heart |
| Anniversaire | Cake |
| Baby Shower | Baby |
| Soirée | Music |
| Brunch | Coffee |

### C. Animations

Utiliser **Framer Motion** pour :
- Transitions de pages
- Apparition de modals
- Drag & drop (Kanban)
- Notifications toast
- Accordéons
