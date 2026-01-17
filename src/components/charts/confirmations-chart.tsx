import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Calendar } from "lucide-react"
import { useConfirmationsChart } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { SearchInput } from "@/components/forms/search-input"

type SortField = "name" | "confirmed" | "declined" | "pending" | "confirmRate"
type SortOrder = "asc" | "desc"

interface ConfirmationsChartProps {
  filter?: string
  eventTypeFilter?: string
}

export function ConfirmationsChart({ filter = "7days", eventTypeFilter = "all" }: ConfirmationsChartProps) {
  const navigate = useNavigate()
  // Séparation pour éviter le re-render de l'UI pendant la frappe
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("confirmRate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const itemsPerPage = 5

  const { data, isLoading, isFetching, error } = useConfirmationsChart(filter, eventTypeFilter, {
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
    sort_by: sortField,
    sort_order: sortOrder,
  })

  // On considère le chargement "initial" (squelette) seulement si on n'a pas encore de données
  const isInitialLoading = isLoading && !data

  // Extraction des données avec valeurs par défaut pour éviter les crashs si data est undefined
  const paginatedEvents = data?.events || []
  const totalPages = data?.pagination?.last_page || 1
  const totalInvites = data?.summary?.total_guests || 0
  const totalEvents = data?.summary?.total_events || 0

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

  // Squelette spécifique au tableau pour s'aligner avec les colonnes
  const TableSkeleton = () => (
    <>
      {Array.from({ length: itemsPerPage }).map((_, i) => (
        <tr key={i} className="border-t border-[#e5e7eb]">
          <td className="py-3 px-3">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </td>
          <td className="text-center py-3 px-3">
            <Skeleton className="h-4 w-12 mx-auto" />
          </td>
          <td className="text-center py-3 px-3">
            <Skeleton className="h-4 w-12 mx-auto" />
          </td>
          <td className="text-center py-3 px-3">
            <Skeleton className="h-4 w-12 mx-auto" />
          </td>
          <td className="text-center py-3 px-3">
            <div className="flex flex-col items-center gap-1">
               <Skeleton className="h-5 w-10 rounded-full" />
               <Skeleton className="h-1.5 w-16 rounded-full" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
      {/* HEADER : Toujours visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold text-[#1a1a2e] mb-1">Confirmations par événement</h3>
          <p className="text-sm text-[#6b7280]">
            {isInitialLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>{totalEvents} événements • {totalInvites.toLocaleString()} invités au total</>
            )}
          </p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE : Toujours visible */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value)
            setDebouncedSearchQuery(value)
            if (currentPage !== 1) setCurrentPage(1)
          }}
          placeholder="Rechercher par nom ou type d'événement..."
          debounceMs={300}
          className="w-full"
        />
      </div>

      {/* GESTION D'ERREUR */}
      {error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 font-medium">Erreur lors du chargement des confirmations</p>
        </div>
      ) : (
        <>
          {/* TABLEAU */}
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] relative min-h-[300px]">
            
            {/* Overlay lors de la mise à jour (recherche/tri/pagination) */}
            {isFetching && !isInitialLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-200">
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-sm text-[#6b7280]">
                  <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                  Mise à jour...
                </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead className="bg-[#F5F7FA]">
                <tr>
                  <th className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1.5">Événement <SortIcon field="name" /></div>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-[#10B981] cursor-pointer hover:bg-[#eef0f4] transition-colors" onClick={() => handleSort("confirmed")}>
                    <div className="flex items-center justify-center gap-1.5">Confirmé <SortIcon field="confirmed" /></div>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-[#EF4444] cursor-pointer hover:bg-[#eef0f4] transition-colors" onClick={() => handleSort("declined")}>
                    <div className="flex items-center justify-center gap-1.5">Décliné <SortIcon field="declined" /></div>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-[#F59E0B] cursor-pointer hover:bg-[#eef0f4] transition-colors" onClick={() => handleSort("pending")}>
                    <div className="flex items-center justify-center gap-1.5">En attente <SortIcon field="pending" /></div>
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors" onClick={() => handleSort("confirmRate")}>
                    <div className="flex items-center justify-center gap-1.5">Taux <SortIcon field="confirmRate" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isInitialLoading ? (
                  <TableSkeleton />
                ) : paginatedEvents.length > 0 ? (
                  paginatedEvents.map((event, idx) => (
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
                  ))
                ) : (
                  <tr className="border-t border-[#e5e7eb]">
                    <td colSpan={5} className="py-12 text-center text-[#6b7280]">
                      <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-50 p-3 rounded-full mb-3">
                            <Calendar className="w-6 h-6 text-gray-400" />
                          </div>
                          <p>Aucun événement trouvé.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!isInitialLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280]">
                Affichage {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, data?.pagination?.total || 0)} sur {data?.pagination?.total || 0}{" "}
                événements
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || isFetching}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-medium text-[#6b7280] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Premier
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isFetching}
                  className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
                </button>
                
                <span className="text-sm text-gray-600 px-2 hidden sm:inline">Page {currentPage} / {totalPages}</span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isFetching}
                  className="p-2 rounded-lg border border-[#e5e7eb] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || isFetching}
                  className="px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-medium text-[#6b7280] hover:bg-[#F5F7FA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Dernier
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}