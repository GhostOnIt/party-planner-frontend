import { Activity, UserPlus, Calendar, CheckCircle, MessageSquare, CreditCard } from "lucide-react"
import { useRecentActivity } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"

const iconMap: Record<string, { icon: typeof UserPlus; bg: string; color: string }> = {
  rsvp: { icon: UserPlus, bg: "bg-green-100", color: "text-green-500" },
  task: { icon: CheckCircle, bg: "bg-blue-100", color: "text-blue-500" },
  comment: { icon: MessageSquare, bg: "bg-purple-100", color: "text-purple-500" },
  payment: { icon: CreditCard, bg: "bg-emerald-100", color: "text-emerald-500" },
  event: { icon: Calendar, bg: "bg-pink-100", color: "text-pink-500" },
}

export function RecentActivity() {
  const { data: activities, isLoading, error } = useRecentActivity(6)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#1a1a2e]" />
          <h3 className="font-semibold text-[#1a1a2e]">Activite recente</h3>
        </div>
        <p className="text-sm text-[#6b7280]">Aucune activité récente</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[#1a1a2e]" />
        <h3 className="font-semibold text-[#1a1a2e]">Activite recente</h3>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {activities.map((activity) => {
          const iconConfig = iconMap[activity.icon_type] || iconMap.event
          const IconComponent = iconConfig.icon
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${iconConfig.bg} flex-shrink-0`}>
                <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1a1a2e] font-medium">{activity.message}</p>
                <p className="text-xs text-[#6b7280] truncate">{activity.event}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

