import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { useUpcomingEvents } from "@/hooks/useDashboard"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

const typeColors: Record<string, string> = {
  mariage: "bg-[#E91E8C]",
  anniversaire: "bg-[#4F46E5]",
  conférence: "bg-[#F59E0B]",
  "fête privée": "bg-[#10B981]",
  séminaire: "bg-[#8B5CF6]",
  baptême: "bg-[#06B6D4]",
  gala: "bg-[#EC4899]",
  baby_shower: "bg-[#10B981]",
  soiree: "bg-[#F59E0B]",
  brunch: "bg-[#8B5CF6]",
  autre: "bg-[#6B7280]",
}

export function UpcomingEvents() {
  const { data: events, isLoading, error } = useUpcomingEvents(4)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb]">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !events || events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <h3 className="font-semibold text-[#1a1a2e] mb-1">Evenements a venir</h3>
        <p className="text-sm text-[#6b7280] mb-4">Vos prochains evenements</p>
        <p className="text-sm text-[#6b7280]">Aucun événement à venir</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-[#1a1a2e]">Evenements a venir</h3>
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-[#6b7280] mb-4">Vos prochains evenements</p>

      <div className="space-y-3 max-h-[320px] overflow-y-auto">
        {events.map((event, index) => {
          const formattedDate = event.date
            ? format(new Date(event.date), "d MMM yyyy", { locale: fr })
            : null
          const typeColor = typeColors[event.type.toLowerCase()] || typeColors.autre

          return (
          <div
            key={index}
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#FCE7F3] rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-[#E91E8C]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[#1a1a2e] truncate">{event.name}</span>
                <span className={`${typeColor} text-white text-xs px-2 py-0.5 rounded font-medium`}>
                  {event.type}
                </span>
              </div>
              {formattedDate && (
                <div className="flex items-center gap-1 text-sm text-[#6b7280]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1 text-sm text-[#6b7280] mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

