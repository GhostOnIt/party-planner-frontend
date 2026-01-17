import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useConfirmationsChart } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

type SortField = "name" | "confirmed" | "declined" | "pending" | "confirmRate"
type SortOrder = "asc" | "desc"

interface ConfirmationsChartProps {
  filter?: string
  eventTypeFilter?: string
}

export function ConfirmationsChart({ filter = "7days", eventTypeFilter = "all" }: ConfirmationsChartProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("confirmRate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const itemsPerPage = 5

  const { data, isLoading, error } = useConfirmationsChart(filter, eventTypeFilter, {
    page: currentPage,
    per_page: itemsPerPage,
    search: searchQuery,
    sort_by: sortField,
    sort_order: sortOrder,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-4 rounded-lg" />
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-[#e5e7eb] last:border-b-0">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e5e7eb]">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
        <p className="text-sm text-red-500">Erreur lors du chargement des confirmations</p>
      </div>
    )
  }

  const paginatedEvents = data.events
  const totalPages = data.pagination.last_page
  const totalInvites = data.summary.total_guests

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-[#9ca3af]" />
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#4F46E5]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#4F46E5]" />
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold text-[#1a1a2e] mb-1">Confirmations par événement</h3>
          <p className="text-sm text-[#6b7280]">
            {data.summary.total_events} événements • {totalInvites.toLocaleString()} invités au total
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Rechercher par nom ou type d'événement..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full pl-10 pr-4 py-2.5 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
        />
      </div>

      {/* Tableau avec en-têtes triables */}
      <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA]">
            <tr>
              <th
                className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1.5">
                  Événement
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#10B981] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("confirmed")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Confirmé
                  <SortIcon field="confirmed" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#EF4444] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("declined")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Décliné
                  <SortIcon field="declined" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#F59E0B] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("pending")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  En attente
                  <SortIcon field="pending" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("confirmRate")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Taux
                  <SortIcon field="confirmRate" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event, idx) => (
              <tr
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className={`border-t border-[#e5e7eb] hover:bg-[#F5F7FA] transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}`}
              >
                <td className="py-3 px-3">
                  <div className="font-medium text-[#1a1a2e]">{event.name}</div>
                  <div className="text-xs text-[#9ca3af]">
                    {event.type} • {event.month} • {event.total} invités
                  </div>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-semibold text-[#10B981]">{event.confirmed}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-semibold text-[#EF4444]">{event.declined}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <span className="font-semibold text-[#F59E0B]">{event.pending}</span>
                </td>
                <td className="text-center py-3 px-3">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        event.confirmRate >= 70
                          ? "bg-[#ECFDF5] text-[#10B981]"
                          : event.confirmRate >= 50
                            ? "bg-[#FFFBEB] text-[#F59E0B]"
                            : "bg-[#FEF2F2] text-[#EF4444]"
                      }`}
                    >
                      {event.confirmRate}%
                    </span>
                    {/* Mini barre de progression */}
                    <div className="w-16 h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          event.confirmRate >= 70
                            ? "bg-[#10B981]"
                            : event.confirmRate >= 50
                              ? "bg-[#F59E0B]"
                              : "bg-[#EF4444]"
                        }`}
                        style={{ width: `${event.confirmRate}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination améliorée */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e5e7eb]">
        <p className="text-sm text-[#6b7280]">
          Affichage {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, data.pagination.total)} sur {data.pagination.total}{" "}
          événements
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-medium text-[#6b7280] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Premier
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
                      : "text-[#6b7280] hover:bg-[#F5F7FA]"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[#6b7280]" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-medium text-[#6b7280] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Dernier
          </button>
        </div>
      </div>
    </div>
  )
}

