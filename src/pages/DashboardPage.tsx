import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { StatCards } from "@/components/features/dashboard/stat-cards"
import { SubscriptionCard } from "@/components/features/subscription/subscription-card"
import { UpcomingEvents } from "@/components/features/dashboard/upcoming-events"
import { UrgentTasks } from "@/components/features/dashboard/urgent-tasks"
import { RecentActivity } from "@/components/features/dashboard/recent-activity"
import { ConfirmationsChart } from "@/components/charts/confirmations-chart"
import { DateFilter } from "@/components/features/dashboard/date-filter"
import { EventsByTypeChart } from "@/components/charts/events-by-type-chart"
import { BannersCarousel } from "@/components/features/dashboard/banners-carousel"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { useActiveSpots, useTrackClick, useVote } from "@/hooks/useCommunication"

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [filter, setFilter] = useState("all")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>(undefined)

  // Fetch active spots for dashboard
  const { data: activeSpots = [] } = useActiveSpots("dashboard")
  const { mutate: trackClick } = useTrackClick()
  const { mutate: vote } = useVote()

  const userName = user?.name || "Utilisateur"

  const handleSpotClick = (spotId: string, buttonType: "primary" | "secondary") => {
    trackClick({ spotId, buttonType })
  }

  const handleSpotVote = (spotId: string, optionId: string) => {
    vote({ spotId, optionId })
  }

  const handleFilterChange = (newFilter: string, customRangeParam?: { start: Date; end: Date }) => {
    setFilter(newFilter)
    setCustomRange(customRangeParam)
  }

  const handleEventTypeChange = (eventType: string) => {
    setEventTypeFilter(eventType)
  }

  return (
    <div>
      <BannersCarousel
        spots={activeSpots}
        onSpotClick={handleSpotClick}
        onSpotVote={handleSpotVote}
      />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Tableau de bord</h1>
          <p className="text-[#6b7280]">
            Bienvenue, <span className="font-semibold text-[#4F46E5]">{userName}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/events/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-[#4F46E5]/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nouvel evenement
        </button>
      </div>

      <DateFilter onFilterChange={handleFilterChange} onEventTypeChange={handleEventTypeChange} />

      <StatCards filter={filter} eventTypeFilter={eventTypeFilter} customRange={customRange} />

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <SubscriptionCard />
            <UpcomingEvents />
            <UrgentTasks />
          </div>
          <div className="lg:col-span-1">
            <EventsByTypeChart filter={filter} eventTypeFilter={eventTypeFilter} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ConfirmationsChart filter={filter} eventTypeFilter={eventTypeFilter} />
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
