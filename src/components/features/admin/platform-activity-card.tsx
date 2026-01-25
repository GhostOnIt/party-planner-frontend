import { Activity, UserPlus, Calendar, CreditCard, CheckCircle } from "lucide-react"
import { useRecentActivity } from "@/hooks/useAdmin"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

const iconMap: Record<string, { icon: typeof UserPlus; bg: string; color: string }> = {
  user_registered: { icon: UserPlus, bg: "bg-green-100", color: "text-green-500" },
  event_created: { icon: Calendar, bg: "bg-blue-100", color: "text-blue-500" },
  payment_completed: { icon: CreditCard, bg: "bg-emerald-100", color: "text-emerald-500" },
  subscription_created: { icon: CheckCircle, bg: "bg-purple-100", color: "text-purple-500" },
}

export function PlatformActivityCard() {
  const { data: activities, isLoading, error } = useRecentActivity(6)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center text-red-500">
        Erreur de chargement de l'activité: {error.message}
      </div>
    )
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr })
    } catch {
      return "Récemment"
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-[#1a1a2e]" />
        <h3 className="font-semibold text-[#1a1a2e]">Activité plateforme</h3>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const iconConfig = iconMap[activity.type] || iconMap.user_registered
            const IconComponent = iconConfig.icon
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <div className={`p-2 rounded-lg ${iconConfig.bg} flex-shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${iconConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1a1a2e] font-medium">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-[#6b7280] truncate">{activity.user.name}</p>
                  )}
                  <p className="text-xs text-[#9CA3AF] mt-1">{formatTime(activity.created_at)}</p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center py-4 text-center text-[#6b7280]">
            <Activity className="w-8 h-8 mb-2 text-[#9CA3AF]" />
            <p>Aucune activité récente.</p>
          </div>
        )}
      </div>
    </div>
  )
}

