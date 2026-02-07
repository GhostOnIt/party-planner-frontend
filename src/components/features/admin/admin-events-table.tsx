import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Calendar, Users, AlertCircle } from "lucide-react"
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
  // Séparation explicite de l'input et de la query pour éviter les re-renders trop fréquents
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
  
  // On considère le chargement initial seulement si on n'a aucune donnée affichable
  const isInitialLoading = isLoading && !data

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
      case "upcoming": return "bg-[#ECFDF5] text-[#10B981]"
      case "ongoing": return "bg-[#FFFBEB] text-[#F59E0B]"
      case "completed": return "bg-[#F3F4F6] text-[#6b7280]"
      case "cancelled": return "bg-[#FEF2F2] text-[#EF4444]"
      default: return "bg-[#F3F4F6] text-[#6b7280]"
    }
  }

  // --- RENDU DU SKELETON (Extrait pour propreté) ---
  const TableSkeleton = () => (
    <tbody>
      {Array.from({ length: itemsPerPage }).map((_, i) => (
        <tr key={i} className="border-t border-[#e5e7eb]">
          <td className="py-3 px-3">
            <Skeleton className="h-4 w-48 mb-1" />
            <Skeleton className="h-3 w-32" />
          </td>
          <td className="py-3 px-3"><Skeleton className="h-4 w-32" /></td>
          <td className="py-3 px-3"><Skeleton className="h-4 w-16 mx-auto" /></td>
          <td className="py-3 px-3"><Skeleton className="h-4 w-12 mx-auto" /></td>
          <td className="py-3 px-3"><Skeleton className="h-4 w-20 mx-auto" /></td>
          <td className="py-3 px-3"><Skeleton className="h-4 w-16 mx-auto" /></td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] mt-6">
      {/* HEADER ET SEARCH BAR 
         Ils sont rendus en premier, indépendamment de l'état de chargement (loading/error)
         Cela garantit que l'input ne disparaît jamais.
      */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h3 className="font-semibold text-[#1a1a2e] mb-1">Événements récents</h3>
          <p className="text-sm text-[#6b7280]">
            {/* Afficher un skeleton discret sur le compteur si chargement initial */}
            {isInitialLoading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              <>{totalEvents} événement{totalEvents > 1 ? "s" : ""} au total</>
            )}
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

      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value)
            setDebouncedSearchQuery(value) // Suppose que SearchInput gère déjà le délai, sinon utiliser un useEffect
            if (currentPage !== 1) setCurrentPage(1)
          }}
          placeholder="Rechercher par nom ou type d'événement..."
          debounceMs={300}
          className="w-full"
        />
      </div>

      {/* CONTENU DU TABLEAU 
          Ici on gère les états : Erreur, Chargement Initial, ou Données.
      */}
      {error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Erreur de chargement</p>
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
          <button 
             onClick={() => window.location.reload()} 
             className="mt-4 text-sm underline text-red-700 hover:text-red-900"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] relative min-h-[300px]">
            
            {/* Overlay de chargement (pour les recherches suivantes, pas la première) */}
            {isFetching && !isInitialLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all duration-200">
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-sm text-[#6b7280]">
                  </div>
              </div>
            )}

            <table className="w-full text-sm">
              <thead className="bg-[#F5F7FA]">
                <tr>
                  <th onClick={() => handleSort("title")} className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center gap-1.5">Événement <SortIcon field="title" /></div>
                  </th>
                  <th onClick={() => handleSort("user")} className="text-left py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center gap-1.5">Créé par <SortIcon field="user" /></div>
                  </th>
                  <th onClick={() => handleSort("type")} className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center justify-center gap-1.5">Type <SortIcon field="type" /></div>
                  </th>
                  <th onClick={() => handleSort("guests")} className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center justify-center gap-1.5">Invités <SortIcon field="guests" /></div>
                  </th>
                  <th onClick={() => handleSort("date")} className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center justify-center gap-1.5">Date <SortIcon field="date" /></div>
                  </th>
                  <th onClick={() => handleSort("status")} className="text-center py-3 px-3 font-medium text-[#6b7280] cursor-pointer hover:bg-[#eef0f4] transition-colors">
                    <div className="flex items-center justify-center gap-1.5">Statut <SortIcon field="status" /></div>
                  </th>
                </tr>
              </thead>
              
              {/* Le corps du tableau change selon l'état */}
              {isInitialLoading ? (
                <TableSkeleton />
              ) : (
                <tbody>
                  {events.length > 0 ? (
                    events.map((event, idx) => (
                      <tr
                        key={event.id}
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className={`border-t border-[#e5e7eb] hover:bg-[#F5F7FA] transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}`}
                      >
                         <td className="py-3 px-3">
                          <div className="font-medium text-[#1a1a2e]">{event.title}</div>
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
                          ) : <span className="text-sm text-[#9ca3af]">N/A</span>}
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
                      <td colSpan={6} className="py-12 text-center text-[#6b7280]">
                        <div className="flex flex-col items-center justify-center">
                           <div className="bg-gray-50 p-3 rounded-full mb-3">
                             <Calendar className="w-6 h-6 text-gray-400" />
                           </div>
                           <p>Aucun événement trouvé.</p>
                           {searchQuery && <p className="text-xs mt-1">Essayez de modifier votre recherche.</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination (visible uniquement si on a des données et pas en chargement initial) */}
          {!isInitialLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-[#e5e7eb]">
              <p className="text-sm text-[#6b7280]">
                Affichage {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalEvents)} sur {totalEvents} événements
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
                
                {/* Pagination numérotée (simplifiée) */}
                <span className="text-sm text-gray-600 px-2">Page {currentPage} / {totalPages}</span>

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