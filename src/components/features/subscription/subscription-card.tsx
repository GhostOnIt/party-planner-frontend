import { Crown, Calendar, ArrowUpRight } from "lucide-react"
import { useCurrentSubscription } from "@/hooks/useSubscription"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"

export function SubscriptionCard() {
  const { data, isLoading, error } = useCurrentSubscription()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40 mt-1" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-[#E91E8C]" />
          <span className="font-semibold text-[#1a1a2e]">Mon abonnement</span>
        </div>
        <p className="text-sm text-[#6b7280]">Aucun abonnement actif</p>
      </div>
    )
  }

  const quota = data.quota
  const subscription = data.subscription
  
  // Map plan type to display name
  const planNames: Record<string, string> = {
    starter: 'Starter',
    pro: 'Pro',
    agence: 'Agence',
  }
  const planType = subscription?.plan_type || subscription?.plan || null
  const planName = planType ? planNames[planType] || planType.toUpperCase() : "Aucun plan"
  
  const used = quota.used
  const total = quota.is_unlimited ? Infinity : quota.total_quota
  const remaining = quota.is_unlimited ? Infinity : quota.remaining
  const percentage = quota.is_unlimited ? 0 : quota.percentage_used

  const formattedExpiryDate = subscription?.expires_at
    ? format(new Date(subscription.expires_at), "d MMMM yyyy", { locale: fr })
    : null

  return (
    <div className="bg-white rounded-xl p-5 border border-[#e5e7eb]">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="w-5 h-5 text-[#E91E8C]" />
        <span className="font-semibold text-[#1a1a2e]">Mon abonnement</span>
        {subscription && (
          <span className="bg-[#4F46E5] text-white text-xs px-2 py-0.5 rounded font-medium">
            {planName.toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-sm text-[#6b7280] mb-4">Plan actif</p>

      {!quota.is_unlimited && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#6b7280]">Événements créés</span>
            <span className="text-[#1a1a2e] font-medium">
              {used} / {total}
            </span>
          </div>
          <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[#6b7280] mt-1">
            {remaining} événements restants
          </p>
        </div>
      )}

      {quota.is_unlimited && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#6b7280]">Événements créés</span>
            <span className="text-[#1a1a2e] font-medium">{used} / Illimité</span>
          </div>
        </div>
      )}

      {formattedExpiryDate && (
        <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
          <Calendar className="w-4 h-4" />
          <span>Expire le {formattedExpiryDate}</span>
        </div>
      )}

      <button
        onClick={() => navigate("/plans")}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#e5e7eb] rounded-lg text-[#1a1a2e] font-medium hover:bg-[#f3f4f6] transition-colors mb-2"
      >
        <ArrowUpRight className="w-4 h-4" />
        Upgrade
      </button>

      <button
        onClick={() => navigate("/subscriptions")}
        className="w-full text-center text-sm text-[#E91E8C] font-medium hover:underline"
      >
        Gérer mon abonnement
      </button>
    </div>
  )
}

