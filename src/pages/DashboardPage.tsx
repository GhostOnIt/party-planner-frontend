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

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [filter, setFilter] = useState("7days")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>(undefined)
  const [showPromo, setShowPromo] = useState(true)

  const userName = user?.name || "Utilisateur"

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
        showPromo={showPromo}
        onPromoDismiss={() => setShowPromo(false)}
        promoCardProps={{
          type: "banner",
          badge: "En direct",
          badgeType: "live",
          title: "Party Planner Summit 2026",
          description: "Rejoignez plus de 2 000 organisateurs d'événements pour notre conférence annuelle. En direct depuis Paris.",
          primaryButton: { label: "Rejoindre", href: "https://example.com/stream" },
          secondaryButton: { label: "Voir les détails", href: "https://example.com/details" },
        }}
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
