import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useEventsByType } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"

interface EventsByTypeChartProps {
  filter?: string
  eventTypeFilter?: string
}

export function EventsByTypeChart({ filter = "7days", eventTypeFilter = "all" }: EventsByTypeChartProps) {
  const { data, isLoading, error } = useEventsByType(filter, eventTypeFilter)

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb]">
        <div className="mb-3">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        <div className="mt-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Répartition par type</h3>
          <p className="text-sm text-[#6b7280]">Distribution de vos événements</p>
        </div>
        <p className="text-sm text-red-500">Erreur lors du chargement des données</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb]">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Répartition par type</h3>
          <p className="text-sm text-[#6b7280]">Distribution de vos événements</p>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-sm text-[#6b7280]">Aucun événement dans cette période</p>
        </div>
        <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6b7280]">Total événements</span>
            <span className="text-xl font-bold text-[#1a1a2e]">0</span>
          </div>
        </div>
      </div>
    )
  }

  const filteredData = data
  const total = filteredData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-[#e5e7eb]">
          <p className="font-semibold text-[#1a1a2e]">{data.name}</p>
          <p className="text-sm text-[#6b7280]">
            {data.value} événements ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb]">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-[#1a1a2e]">Répartition par type</h3>
        <p className="text-sm text-[#6b7280]">Distribution de vos événements</p>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 max-h-[120px] overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {filteredData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#6b7280] whitespace-nowrap">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#e5e7eb]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6b7280]">Total événements</span>
          <span className="text-xl font-bold text-[#1a1a2e]">{total}</span>
        </div>
      </div>
    </div>
  )
}

