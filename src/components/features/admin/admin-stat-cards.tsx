import { Users, Calendar, CreditCard, TrendingUp, TrendingDown } from "lucide-react"
import { useAdminDashboardStats } from "@/hooks/useAdmin"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminStatCardsProps {
  filter?: string
  customRange?: { start: Date; end: Date }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA"
}

export function AdminStatCards({ filter = "7days", customRange }: AdminStatCardsProps) {
  const { data, isLoading, error } = useAdminDashboardStats(filter, customRange)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-3 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div>
                  <Skeleton className="h-2.5 w-16 mb-1.5" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#f3f4f6]">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <p className="text-sm text-red-500">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  const stats = [
    {
      icon: Users,
      label: "Utilisateurs",
      value: data.users.total,
      data: data.users,
      bgColor: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
    },
    {
      icon: Calendar,
      label: "Événements",
      value: data.events.total,
      data: data.events,
      bgColor: "bg-[#FFF7ED]",
      iconColor: "text-[#F97316]",
    },
    {
      icon: CreditCard,
      label: "Abonnements",
      value: data.subscriptions.total,
      data: data.subscriptions,
      bgColor: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      icon: TrendingUp,
      label: "Revenus",
      value: formatCurrency(data.revenue.total),
      data: data.revenue,
      bgColor: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
      isCurrency: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow`}
        >
          {/* Header with icon and trend */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-[10px] text-[#6b7280] uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg font-bold text-[#1a1a2e]">
                  {typeof stat.value === "number" ? stat.value : stat.value}
                </p>
              </div>
            </div>

            {/* Trend indicator */}
            {stat.data?.trend && (
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  stat.data.trend.isPositive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FEF2F2] text-[#EF4444]"
                }`}
              >
                {stat.data.trend.isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                <span>
                  {stat.data.trend.isPositive ? "+" : "-"}
                  {stat.data.trend.value}%
                </span>
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-[#f3f4f6]">
            {stat.data?.breakdown.map((item: { label: string; value: number; color: string }) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#6b7280]">{item.label}</span>
                </div>
                <span className="font-medium text-[#1a1a2e]">
                  {stat.isCurrency ? formatCurrency(item.value) : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

