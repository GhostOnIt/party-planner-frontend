// Admin Dashboard Statistics Types

import { StatData } from './dashboard'

export interface AdminDashboardStatsResponse {
  users: StatData
  events: StatData
  subscriptions: StatData
  revenue: StatData
}

export interface PlanDistributionData {
  name: string
  value: number
  color: string
}

export type PlanDistributionResponse = PlanDistributionData[]

