import { ArrowRight, Clock, AlertTriangle, Calendar } from "lucide-react"
import { useUrgentTasks } from "@/hooks/useDashboard"
import { format, isToday, isPast } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

const statusLabels = {
  overdue: { label: "En retard", color: "text-red-500" },
  today: { label: "Aujourd'hui", color: "text-orange-500" },
  upcoming: { label: "À venir", color: "text-[#6b7280]" },
}

function getTaskStatus(dueDate: string | null): "overdue" | "today" | "upcoming" {
  if (!dueDate) return "upcoming"
  const date = new Date(dueDate)
  if (isPast(date) && !isToday(date)) return "overdue"
  if (isToday(date)) return "today"
  return "upcoming"
}

export function UrgentTasks() {
  const { data: tasks, isLoading, error } = useUrgentTasks(4)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB]">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="w-4 h-4 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <h3 className="font-semibold text-[#1a1a2e] mb-1">Taches urgentes</h3>
        <p className="text-sm text-[#6b7280] mb-4">Taches a traiter en priorite</p>
        <p className="text-sm text-[#6b7280]">Aucune tâche urgente</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-[#1a1a2e]">Taches urgentes</h3>
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-[#6b7280] mb-4">Taches a traiter en priorite</p>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {tasks.map((task: any) => {
          const status = getTaskStatus(task.due_date)
          const formattedDate = task.due_date
            ? format(new Date(task.due_date), "d MMM yyyy", { locale: fr })
            : null
          const eventName = (task.event as any)?.title || "Événement"
          const eventId = (task.event as any)?.id || task.event_id

          return (
          <div
            key={task.id}
            onClick={() => eventId && navigate(`/events/${eventId}?tab=tasks`)}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <div className={`p-2 rounded-lg ${task.priority === "high" ? "bg-red-100" : "bg-orange-100"}`}>
              {task.status === "overdue" ? (
                <AlertTriangle className={`w-4 h-4 ${task.priority === "high" ? "text-red-500" : "text-orange-500"}`} />
              ) : (
                <Clock className={`w-4 h-4 ${task.priority === "high" ? "text-red-500" : "text-orange-500"}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a2e] text-sm truncate">{task.title}</p>
              <p className="text-xs text-[#6b7280] truncate">{eventName}</p>
              {formattedDate && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                  <span className={`text-xs ${statusLabels[status].color}`}>
                    {formattedDate} • {statusLabels[status].label}
                  </span>
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

