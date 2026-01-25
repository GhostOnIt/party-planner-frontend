// Dashboard Statistics Types

export interface Trend {
  value: number
  isPositive: boolean
  previousValue: number
}

export interface BreakdownItem {
  label: string
  value: number
  color: string
}

export interface StatData {
  total: number
  breakdown: BreakdownItem[]
  trend: Trend
}

export interface DashboardStatsResponse {
  events: StatData
  guests: StatData
  tasks: StatData
  budget: StatData
}

// Confirmations Chart Types

export interface ConfirmationEvent {
  id: number
  name: string
  type: string
  month: string | null
  monthIndex: number
  confirmed: number
  declined: number
  pending: number
  total: number
  confirmRate: number
}

export interface ConfirmationsChartResponse {
  events: ConfirmationEvent[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  summary: {
    total_events: number
    total_guests: number
  }
}

// Events By Type Chart Types

export interface EventTypeData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export type EventsByTypeResponse = EventTypeData[]

// Recent Activity Types

export interface RecentActivity {
  id: string
  type: 'rsvp' | 'task' | 'comment' | 'payment' | 'event'
  message: string
  event: string
  time: string
  icon_type: string
}

export type RecentActivityResponse = RecentActivity[]

// Upcoming Events Types

export interface UpcomingEvent {
  id: number
  name: string
  type: string
  date: string | null
  location: string | null
}

export type UpcomingEventsResponse = UpcomingEvent[]

// Subscription Types

export interface SubscriptionResponse {
  plan_name: string
  events_created: number
  events_limit: number
  expires_at: string | null
  status: string
}

