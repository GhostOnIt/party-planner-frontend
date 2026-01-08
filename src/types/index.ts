// Enums
export type EventType = 'mariage' | 'anniversaire' | 'baby_shower' | 'soiree' | 'brunch' | 'autre';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'maybe';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type BudgetCategory =
  | 'location'
  | 'catering'
  | 'decoration'
  | 'entertainment'
  | 'photography'
  | 'transportation'
  | 'other';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type PaymentMethod = 'mtn_mobile_money' | 'airtel_money';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PlanType = 'starter' | 'pro';
export type PhotoType = 'moodboard' | 'event_photo';
export type UserRole = 'admin' | 'user';

// User
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  email_verified_at: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Notification Preferences
export interface NotificationPreferences {
  task_reminder: boolean;
  guest_reminder: boolean;
  budget_alert: boolean;
  event_reminder: boolean;
  collaboration_invite: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
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
  featured_photo?: {
    id: number;
    url: string;
    thumbnail_url: string;
  } | null;
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
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string;
  type: PhotoType;
  caption: string | null;
  size: number;
  mime_type: string;
  is_featured: boolean;
  uploaded_by: number;
  uploader?: User;
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
  title?: string;
  message?: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  event_id?: number;
}

// Subscription
export interface Subscription {
  id: number;
  user_id: number;
  event_id: number;
  plan_type: PlanType;
  base_price: string;
  guest_count: number;
  guest_price_per_unit: string;
  total_price: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Computed/legacy fields for compatibility
  plan?: PlanType;
  status?: string;
  starts_at?: string;
  ends_at?: string;
  guest_limit?: number | null;
  collaborator_limit?: number | null;
}

// Payment
export interface Payment {  id: number;  subscription_id: number;  amount: number;  currency: string;  payment_method: PaymentMethod | null;  transaction_reference: string | null;  status: PaymentStatus;  metadata: Record<string, unknown> | null;  created_at: string;  updated_at: string;}

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

// API Response Types
export interface PaginatedResponse<T> {  data: T[];  current_page: number;  last_page: number;  per_page: number;  total: number;  from: number | null;  to: number | null;}

// Guest Statistics
export interface GuestStats {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
  checked_in: number;
}

// Paginated response with optional stats (for guests)
export interface PaginatedGuestsResponse extends PaginatedResponse<Guest> {
  stats?: GuestStats;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// OTP Types
export type OtpChannel = 'email' | 'sms' | 'whatsapp';
export type OtpType = 'registration' | 'login' | 'password_reset';

export interface OtpSendRequest {
  identifier: string;
  type: OtpType;
  channel: OtpChannel;
}

export interface OtpVerifyRequest {
  identifier: string;
  code: string;
  type: OtpType;
}

export interface OtpResendRequest {
  otp_id: number;
}

export interface OtpSendResponse {
  message: string;
  otp_id: number;
  expires_in: number;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  verified?: boolean;
  verification_token?: string;
  reset_token?: string;
  user?: User;
  token?: string;
}

export interface OtpResetPasswordRequest {
  identifier: string;
  reset_token: string;
  password: string;
  password_confirmation: string;
}

// Dashboard Stats
export interface DashboardStats {
  events_count: number;
  guests_confirmed: number;
  tasks_pending: number;
  total_budget: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateEventFormData {
  title: string;
  type: EventType;
  date: string;
  time?: string;
  location?: string;
  description?: string;
  expected_guests?: number;
  budget?: number;
  theme?: string;
}

export interface CreateGuestFormData {
  name: string;
  email?: string;
  phone?: string;
  plus_one?: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  notes?: string;
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  assigned_to?: number;
}

export interface CreateBudgetItemFormData {
  category: BudgetCategory;
  name: string;
  estimated_cost: number;
  actual_cost?: number;
  vendor_name?: string;
  notes?: string;
}

export interface InviteCollaboratorFormData {
  email: string;
  role: CollaboratorRole;
}

export interface PaymentFormData {
  event_id: number;
  plan: PlanType;
  payment_method: PaymentMethod;
  phone_number: string;
}

export interface RsvpResponseFormData {
  response: 'accepted' | 'declined' | 'maybe';
  plus_one_attending?: boolean;
  plus_one_name?: string;
  dietary_restrictions?: string;
  message?: string;
}

// Filters
export interface EventFilters {
  status?: EventStatus;
  type?: EventType;
  search?: string;
  per_page?: number;
  page?: number;
  to?: number;
}

export interface GuestFilters {
  rsvp_status?: RsvpStatus;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
}

export interface BudgetFilters {
  category?: BudgetCategory;
  paid?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface PhotoFilters {
  type?: PhotoType;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CollaboratorFilters {
  role?: CollaboratorRole;
  search?: string;
}

// Budget Statistics
export interface BudgetStats {
  total_estimated: number;
  total_actual: number;
  total_paid: number;
  items_count: number;
  by_category: Array<{
    category: BudgetCategory;
    estimated: number;
    actual: number;
    count: number;
  }>;
}

// Invitation (collaboration invite received)
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  id: number;
  event_id: number;
  event: Event;
  user_id: number;
  user?: User;
  inviter_id: number;
  inviter: User;
  role: CollaboratorRole;
  status: InvitationStatus;
  message?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

// Collaboration (event where user is collaborator)
export interface Collaboration {
  id: number;
  event_id: number;
  event: Event;
  user_id: number;
  role: CollaboratorRole;
  accepted_at: string;
  created_at: string;
}

// Admin Types
export interface AdminStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
  };
  events: {
    total: number;
    active: number;
    by_type: Record<EventType, number>;
  };
  subscriptions: {
    total: number;
    active: number;
    by_plan: Record<PlanType, number>;
  };
  revenue: {
    total: number;
    this_month: number;
    last_month: number;
    this_year: number;
    by_method: Record<string, number>;
    count: number;
    pending_count: number;
    completed_count: number;
  };
}

export interface AdminUser extends User {
  events_count?: number;
  subscriptions_count?: number;
  last_login_at?: string | null;
  is_active?: boolean;
}

export interface AdminEvent extends Event {
  owner?: User;
  guests_count?: number;
  subscription?: Subscription;
}

export interface AdminUserFilters {
  role?: UserRole;
  search?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface AdminEventFilters {
  type?: EventType;
  status?: EventStatus;
  user_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AdminSubscriptionFilters {
  plan_type?: PlanType;
  payment_status?: 'pending' | 'paid' | 'failed';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AdminPaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface UpdateUserFormData {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface CreateTemplateFormData {
  event_type: EventType;
  name: string;
  description?: string;
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
}
