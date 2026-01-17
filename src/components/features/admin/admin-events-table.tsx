import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Users } from "lucide-react"
import { useAdminEvents } from "@/hooks/useAdmin"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { SearchInput } from "@/components/forms/search-input"

type SortField = "title" | "user" | "type" | "guests" | "date" | "status"
type SortOrder = "asc" | "desc"

interface AdminEventsTableProps {
  filter?: string
  customRange?: { start: Date; end: Date }
}

export function AdminEventsTable({ filter: _filter = "7days", customRange: _customRange }: AdminEventsTableProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const itemsPerPage = 5

  const { data, isLoading, isFetching, error } = useAdminEvents({
    page: currentPage,
    per_page: itemsPerPage,
    search: debouncedSearchQuery,
    sort_by: sortField === "user" ? "user.name" : sortField,
    sort_dir: sortOrder,
  })

  const events = data?.data || []
  const totalEvents = data?.total || 0
  const totalPages = data?.last_page || 1
  const isInitialLoading = isLoading && !data

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
        <div className="mb-5">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F7FA]">
                <th className="text-left py-3 px-3">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="text-left py-3 px-3">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-center py-3 px-3">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
                <th className="text-center py-3 px-3">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
                <th className="text-center py-3 px-3">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <tr key={i} className="border-t border-[#e5e7eb]">
                  <td className="py-3 px-3">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </td>
                  <td className="py-3 px-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6 text-center text-red-500">
        Erreur de chargement des événements: {error.message}
      </div>
    )
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-[#ECFDF5] text-[#10B981]"
      case "ongoing":
        return "bg-[#FFFBEB] text-[#F59E0B]"
      case "completed":
        return "bg-[#F3F4F6] text-[#6b7280]"
      case "cancelled":
        return "bg-[#FEF2F2] text-[#EF4444]"
      default:
        return "bg-[#F3F4F6] text-[#6b7280]"
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold text-[#1a1a2e] mb-1">Événements récents</h3>
          <p className="text-sm text-[#6b7280]">
            {totalEvents} événement{totalEvents > 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Voir tout
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value)
            setDebouncedSearchQuery(value)
            setCurrentPage(1)
          }}
          placeholder="Rechercher par nom ou type d'événement..."
          debounceMs={300}
          className="w-full"
        />
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] relative">
        {isFetching && !isInitialLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-[#6b7280]">
              <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
              Recherche en cours...
            </div>
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA]">
            <tr>
              <th
                className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1.5">
                  Événement
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("user")}
              >
                <div className="flex items-center gap-1.5">
                  Créateur
                  <SortIcon field="user" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Type
                  <SortIcon field="type" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("guests")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Invités
                  <SortIcon field="guests" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  Statut
                  <SortIcon field="status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !isInitialLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <tr key={i} className="border-t border-[#e5e7eb]">
                  <td className="py-3 px-3">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </td>
                  <td className="py-3 px-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </td>
                </tr>
              ))
            ) : events.length > 0 ? (
              events.map((event, idx) => (
                <tr
                  key={event.id}
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                  className={`border-t border-[#e5e7eb] hover:bg-[#F5F7FA] transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}`}
                >
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#1a1a2e]">{event.title}</div>
                    <div className="text-xs text-[#9ca3af]">ID: {event.id}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-sm text-[#1a1a2e]">{event.user?.name || "N/A"}</div>
                    <div className="text-xs text-[#9ca3af]">{event.user?.email || ""}</div>
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className="text-sm text-[#6b7280] capitalize">{event.type || "N/A"}</span>
                  </td>
                  <td className="text-center py-3 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#9ca3af]" />
                      <span className="font-medium text-[#1a1a2e]">{event.guests_count || 0}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-3">
                    {event.date ? (
                      <div className="flex items-center justify-center gap-1 text-sm text-[#6b7280]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(parseISO(event.date), "dd MMM yyyy", { locale: fr })}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[#9ca3af]">N/A</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                      {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : event.status === "completed" ? "Terminé" : "Annulé"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-[#e5e7eb]">
                <td colSpan={6} className="py-8 text-center text-[#6b7280]">
                  Aucun événement trouvé pour cette période.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e5e7eb]">
          <p className="text-sm text-[#6b7280]">
            Affichage {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, totalEvents)} sur {totalEvents} événements
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
      )}
    </div>
  )
}

