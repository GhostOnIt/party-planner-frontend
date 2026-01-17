import { useState } from "react"
import { AdminStatCards } from "@/components/features/admin/admin-stat-cards"
import { RecentUsersCard } from "@/components/features/admin/recent-users-card"
import { RecentPaymentsCard } from "@/components/features/admin/recent-payments-card"
import { PlatformActivityCard } from "@/components/features/admin/platform-activity-card"
import { PlanDistributionChart } from "@/components/charts/plan-distribution-chart"
import { AdminEventsTable } from "@/components/features/admin/admin-events-table"
import { DateFilter } from "@/components/features/dashboard/date-filter"

export function AdminDashboardPage() {
  const [filter, setFilter] = useState("7days")
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>(undefined)

  const handleFilterChange = (newFilter: string, customRangeParam?: { start: Date; end: Date }) => {
    setFilter(newFilter)
    setCustomRange(customRangeParam)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Administration</h1>
          <p className="text-[#6b7280]">
            Vue d'ensemble de la plateforme
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter onFilterChange={handleFilterChange} />

      {/* Stats Cards */}
      <AdminStatCards filter={filter} customRange={customRange} />

      {/* Main Content Grid */}
      <div className="mt-6 space-y-6">
        {/* First Row: Recent Users, Recent Payments, Platform Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentUsersCard />
          <RecentPaymentsCard />
          <PlatformActivityCard />
        </div>

        {/* Second Row: Plan Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <PlanDistributionChart />
          </div>
          <div className="lg:col-span-3">
            <AdminEventsTable filter={filter} customRange={customRange} />
          </div>
        </div>
      </div>
    </div>
  )
}
