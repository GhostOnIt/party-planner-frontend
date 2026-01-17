import { CreditCard, ArrowRight } from "lucide-react"
import { useAdminPayments } from "@/hooks/useAdmin"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "react-router-dom"

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: "bg-[#ECFDF5]", text: "text-[#10B981]" },
  pending: { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]" },
  failed: { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" },
  refunded: { bg: "bg-[#F3F4F6]", text: "text-[#6b7280]" },
}

const paymentStatusLabels: Record<string, string> = {
  completed: "Payé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA"
}

export function RecentPaymentsCard() {
  const { data: paymentsData, isLoading, error } = useAdminPayments({ per_page: 4 })
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
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB]">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb] text-center text-red-500">
        Erreur de chargement des paiements: {error.message}
      </div>
    )
  }

  const payments = paymentsData?.data || []

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-[#1a1a2e]">Paiements récents</h3>
        <button
          onClick={() => navigate("/admin/payments")}
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1a1a2e] transition-colors"
        >
          Voir tout
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-[#6b7280] mb-4">Dernières transactions</p>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {payments.length > 0 ? (
          payments.map((payment) => {
            const statusColors = paymentStatusColors[payment.status] || paymentStatusColors.pending
            // Try subscription.user first, then subscription.event.user
            const user = payment.subscription?.user || payment.subscription?.event?.user
            const userName = user?.name || "Utilisateur inconnu"

            return (
              <div
                key={payment.id}
                onClick={() => navigate(`/admin/payments`)}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${statusColors.bg}`}>
                  <CreditCard className={`w-4 h-4 ${statusColors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a2e] text-sm truncate">{userName}</p>
                  <p className="text-xs text-[#6b7280] truncate">
                    {format(parseISO(payment.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1a1a2e] text-sm">{formatCurrency(payment.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                    {paymentStatusLabels[payment.status] || payment.status}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-[#6b7280] py-4">Aucun paiement récent.</p>
        )}
      </div>
    </div>
  )
}

