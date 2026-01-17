import { useState, useEffect } from "react"
import { X, Sparkles, Clock, CheckCircle2, ArrowRight, Gift } from "lucide-react"

interface TrialBannerProps {
  trialDays?: number
  features?: string[]
  onStartTrial?: () => void
  onDismiss?: () => void
  dismissible?: boolean
}

export function TrialBanner({
  trialDays = 14,
  features = ["Événements illimités", "Invitations personnalisées", "Analyses avancées", "Support prioritaire"],
  onStartTrial,
  onDismiss,
  dismissible = true,
}: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#7C3AED] p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
              <span className="text-sm font-medium text-white">Offre spéciale</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm text-white/90 font-mono">
                {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Essayez Party Planner Pro gratuitement pendant {trialDays} jours
          </h2>
          <p className="text-white/80 mb-4 max-w-xl">
            Débloquez toutes les fonctionnalités premium et transformez vos événements. Aucune carte bancaire requise.
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
            onClick={onStartTrial}
            className="group flex items-center gap-2 bg-white text-[#4F46E5] px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-all shadow-lg hover:shadow-xl hover:shadow-white/20"
          >
            <Sparkles className="w-5 h-5" />
            Démarrer l'essai gratuit
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <span className="text-white/60 text-xs">Sans engagement, annulez à tout moment</span>
        </div>
      </div>
    </div>
  )
}
