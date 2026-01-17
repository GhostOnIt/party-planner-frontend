import { UserPlus, ArrowRight } from "lucide-react"
import { useAdminUsers } from "@/hooks/useAdmin"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

export function RecentUsersCard() {
  const { data: usersData, isLoading, error } = useAdminUsers({ per_page: 4 })
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
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
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
        Erreur de chargement des utilisateurs: {error.message}
      </div>
    )
  }

  const users = usersData?.data || []

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-[#1a1a2e]">Inscriptions récentes</h3>
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-[#6b7280] mb-4">Derniers utilisateurs inscrits</p>

      <div className="space-y-3 max-h-[320px] overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="flex items-start gap-3 p-3 rounded-lg border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#1a1a2e] truncate">{user.name}</span>
                   
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#6b7280]">
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="text-xs text-[#9ca3af] mt-0.5">
                    Inscrit le {format(parseISO(user.created_at), "dd MMM yyyy", { locale: fr })}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-[#6b7280] py-4">Aucun utilisateur récent.</p>
        )}
      </div>
    </div>
  )
}

