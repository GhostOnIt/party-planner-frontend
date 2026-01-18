import { useState } from "react"
import { X, Sparkles, CheckCircle2, ArrowRight, Gift } from "lucide-react"
import { useAvailableTrial, formatLimitValue } from "@/hooks/useAdminPlans"
import { useSubscribeToPlan } from "@/hooks/useSubscription"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface TrialBannerProps {
  onDismiss?: () => void
  dismissible?: boolean
}

export function TrialBanner({
  onDismiss,
  dismissible = true,
}: TrialBannerProps) {
  const { data: trialData, isLoading } = useAvailableTrial()
  const subscribeMutation = useSubscribeToPlan()
  const { toast } = useToast()
  const [isVisible, setIsVisible] = useState(true)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleSubscribe = async () => {
    if (!trialData?.data) return

    setIsSubscribing(true)
    try {
      await subscribeMutation.mutateAsync({ plan_id: trialData.data.id })
      toast({
        title: 'Essai gratuit activé',
        description: `Votre essai gratuit de ${trialData.data.duration_label} a été activé avec succès.`,
      })
      // Refresh the page to show updated subscription
      window.location.reload()
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description:
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Impossible d'activer l'essai gratuit.",
        variant: 'destructive',
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      null
    )
  }

  // No trial available (already used or doesn't exist)
  if (!trialData?.available || !trialData.data) {
    return null
  }

  if (!isVisible) return null

  const trialPlan = trialData.data
  const trialDays = trialPlan.duration_days || 14

  // Get key limits for display
  const eventsLimit = trialPlan.limits?.['events.creations_per_billing_period']
  const guestsLimit = trialPlan.limits?.['guests.max_per_event']

  // Build features list
  const features: string[] = []
  if (eventsLimit !== undefined) {
    features.push(`${formatLimitValue(eventsLimit)} événement${eventsLimit !== -1 && eventsLimit > 1 ? 's' : ''}`)
  }
  if (guestsLimit !== undefined) {
    features.push(`${formatLimitValue(guestsLimit)} invités`)
  }
  if (trialPlan.features?.['budget.enabled']) {
    features.push('Gestion budget & tâches')
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#7C3AED] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full" />

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Gift className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">{trialPlan.name}</span>
            </div>
            {trialPlan.is_trial && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm text-white/90">Offre spéciale</span>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {trialPlan.title}
          </h2>
          <p className="text-white/80 mb-4 max-w-xl">
            {trialPlan.description || ""}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1.5 text-white/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-center mb-2">
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-4xl font-bold text-white">{trialDays}</span>
              <span className="text-white/80 text-lg">jours</span>
            </div>
            <span className="text-white/60 text-sm">gratuits</span>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            className="group flex items-center gap-2 bg-white text-[#4F46E5] px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-all shadow-lg hover:shadow-xl hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {isSubscribing ? 'Activation...' : "Démarrer l'essai gratuit"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <span className="text-white/60 text-xs">Sans engagement, annulez à tout moment</span>
        </div>
      </div>
    </div>
  )
}
