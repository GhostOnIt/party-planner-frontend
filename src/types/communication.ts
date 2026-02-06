// Communication Spot Types

export type SpotType = "banner" | "poll";
export type BadgeType = "live" | "new" | "promo";
export type DisplayLocation = "login" | "dashboard";
export type SpotStatus = "active" | "inactive" | "scheduled" | "expired";

export interface SpotButton {
  label: string;
  href: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes?: number;
  percentage?: number;
}

export interface SpotStats {
  views: number;
  clicks: number;
  votes?: Record<string, number>;
}

export interface CommunicationSpot {
  id: string;
  type: SpotType;

  // Content
  title?: string;
  description?: string;
  image?: string;
  badge?: string;
  badgeType?: BadgeType;

  // Banner specific
  primaryButton?: SpotButton;
  secondaryButton?: SpotButton;

  // Poll specific
  pollQuestion?: string;
  pollOptions?: PollOption[];
  /** Présent quand l’utilisateur connecté a déjà voté (liste des spots actifs). */
  hasVoted?: boolean;
  /** Option choisie par l’utilisateur (après vote ou au rechargement). */
  userVoteOptionId?: string | null;

  // Administration
  isActive: boolean;
  displayLocations: DisplayLocation[];
  priority: number;
  startDate?: string;
  endDate?: string;

  // Targeting
  targetRoles?: string[];
  targetLanguages?: string[];

  // Stats (read-only)
  stats: SpotStats;

  createdAt: string;
  updatedAt: string;
}

// Form data for creating/updating spots
export interface CreateSpotFormData {
  type: SpotType;
  title?: string;
  description?: string;
  image?: File | string;
  badge?: string;
  badgeType?: BadgeType;
  primaryButton?: SpotButton;
  secondaryButton?: SpotButton;
  pollQuestion?: string;
  pollOptions?: Omit<PollOption, "id">[];
  isActive: boolean;
  displayLocations: DisplayLocation[];
  priority: number;
  startDate?: string;
  endDate?: string;
  targetRoles?: string[];
  targetLanguages?: string[];
}

export interface UpdateSpotFormData extends Partial<CreateSpotFormData> {
  id: string;
}

// Filters for listing spots
export interface SpotFilters {
  type?: SpotType;
  status?: SpotStatus;
  location?: DisplayLocation;
  search?: string;
  page?: number;
  per_page?: number;
}

// Poll results
export interface PollResults {
  spotId: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
  closedAt?: string;
}

// API response types
export interface SpotsResponse {
  data: CommunicationSpot[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ActiveSpotsResponse {
  data: CommunicationSpot[];
}

// Track click/vote types
export interface TrackClickData {
  spotId: string;
  buttonType: "primary" | "secondary";
}

export interface VoteData {
  spotId: string;
  optionId: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  hasVoted: boolean;
}
