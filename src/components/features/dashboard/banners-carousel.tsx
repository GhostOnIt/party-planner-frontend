import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TrialBanner } from "./trial-banner"
import { NonRenewalBanner } from "./non-renewal-banner"
import { PromoCard } from "./promo-card"
import { useCurrentSubscription } from "@/hooks/useSubscription"
import { useAuthStore } from "@/stores/authStore"
import { useAvailableTrial } from "@/hooks/useAdminPlans"
import type { CommunicationSpot } from "@/types/communication"

interface BannersCarouselProps {
  // Dynamic spots from API
  spots?: CommunicationSpot[]
  onSpotDismiss?: (spotId: string) => void
  onSpotClick?: (spotId: string, buttonType: "primary" | "secondary") => void
  onSpotVote?: (spotId: string, optionId: string) => void
  // Legacy props for backwards compatibility
  showPromo?: boolean
  onPromoDismiss?: () => void
  promoCardProps?: {
    type?: "banner" | "poll"
    badge?: string
    badgeType?: "live" | "new" | "promo"
    title?: string
    description?: string
    primaryButton?: {
      label: string
      href: string
    }
    secondaryButton?: {
      label: string
      href: string
    }
    pollQuestion?: string
    pollOptions?: Array<{ id: string; label: string; votes: number }>
    onVote?: (optionId: string) => void
  }
}

const AUTO_PLAY_INTERVAL = 5000 // 5 secondes

type SlideType = "non_renewal" | "trial" | "promo" | `spot-${string}`

export function BannersCarousel({
  spots = [],
  onSpotDismiss,
  onSpotClick,
  onSpotVote,
  showPromo = false,
  onPromoDismiss,
  promoCardProps,
}: Readonly<BannersCarouselProps>) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const { data: trialData, isLoading: isLoadingTrial } = useAvailableTrial()
  const { data: currentSubscriptionData } = useCurrentSubscription()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [trialVisible, setTrialVisible] = useState(true)
  const [dismissedSpots, setDismissedSpots] = useState<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Vérifier si le trial est disponible
  const hasTrial = useMemo(() => {
    if (isAdmin) return false
    if (isLoadingTrial) return false
    return trialData?.available && trialData?.data && trialVisible
  }, [trialData, isLoadingTrial, trialVisible, isAdmin])

  // Vérifier si la promo legacy est disponible
  const hasLegacyPromo = showPromo && promoCardProps
  const lifecyclePhase = currentSubscriptionData?.lifecycle?.phase
  const hasNonRenewalBanner = ['renewal_due', 'renewal_last_day', 'grace_period', 'archived', 'expired'].includes(
    lifecyclePhase ?? ''
  )

  // Filtrer les spots non dismissés
  const activeSpots = useMemo(() => {
    return spots.filter(spot => !dismissedSpots.has(spot.id))
  }, [spots, dismissedSpots])

  // Créer un tableau des slides disponibles
  const availableSlides = useMemo(() => {
    const slides: SlideType[] = []
    if (hasNonRenewalBanner) slides.push("non_renewal")
    if (hasTrial) slides.push("trial")
    // Add dynamic spots
    activeSpots.forEach(spot => {
      slides.push(`spot-${spot.id}` as SlideType)
    })
    // Add legacy promo if no dynamic spots and showPromo is true
    if (hasLegacyPromo && activeSpots.length === 0) {
      slides.push("promo")
    }
    return slides
  }, [hasTrial, activeSpots, hasLegacyPromo, hasNonRenewalBanner])

  const totalSlides = availableSlides.length

  // Réinitialiser l'index si nécessaire
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0)
    }
  }, [currentIndex, totalSlides])

  // Auto-play avec pause au survol
  useEffect(() => {
    // Pas d'auto-play s'il n'y a qu'un seul slide ou moins
    if (totalSlides <= 1) {
      return
    }

    // Nettoyer l'intervalle existant
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Si on est en hover, ne pas démarrer l'auto-play
    if (isHovered) {
      return
    }

    // Démarrer l'auto-play
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, AUTO_PLAY_INTERVAL)

    // Nettoyer à la fin
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [totalSlides, isHovered])

  const handlePrevious = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const handleNext = () => {
    if (totalSlides <= 1) return
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const handleTrialDismiss = () => {
    setTrialVisible(false)
  }

  const handlePromoDismiss = () => {
    onPromoDismiss?.()
  }

  const handleSpotDismiss = (spotId: string) => {
    setDismissedSpots(prev => new Set(prev).add(spotId))
    onSpotDismiss?.(spotId)
  }

  // Si aucun slide disponible, ne rien afficher
  if (totalSlides === 0) {
    return null
  }

  const currentSlide = availableSlides[currentIndex]

  // Convert spot to PromoCard props (inclut le vote utilisateur pour persistance au reload)
  const spotToPromoProps = (spot: CommunicationSpot) => {
    return {
      type: spot.type,
      badge: spot.badge,
      badgeType: spot.badgeType,
      title: spot.title,
      description: spot.description,
      primaryButton: spot.primaryButton,
      secondaryButton: spot.secondaryButton,
      pollQuestion: spot.pollQuestion,
      pollOptions: spot.pollOptions?.map(opt => ({
        id: opt.id,
        label: opt.label,
        votes: opt.votes ?? spot.stats.votes?.[opt.id] ?? 0,
        percentage: opt.percentage,
      })),
      hasVoted: spot.hasVoted,
      userVoteOptionId: spot.userVoteOptionId ?? undefined,
      onVote: (optionId: string) => onSpotVote?.(spot.id, optionId),
      onButtonClick: (buttonType: "primary" | "secondary") => onSpotClick?.(spot.id, buttonType),
    }
  }

  return (
    <section
      className="relative mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-label="Carrousel de bannières"
    >
      {/* Carrousel container - hauteur fixe pour un centrage constant */}
      <div className="relative overflow-hidden rounded-2xl min-h-[200px]">
        {/* Slides container - grid avec tous les slides dans la même cellule, centrés verticalement */}
        <div className="grid min-h-[200px] *:col-start-1 *:row-start-1">
          {/* Trial Banner */}
          {hasNonRenewalBanner && (
            <div
              className={`flex items-center transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl [&>div]:w-full ${
                currentSlide === "non_renewal"
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <NonRenewalBanner />
            </div>
          )}

          {/* Trial Banner */}
          {hasTrial && (
            <div
              className={`flex items-center transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl [&>div]:w-full ${
                currentSlide === "trial"
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <TrialBanner dismissible={true} onDismiss={handleTrialDismiss} />
            </div>
          )}

          {/* Dynamic Spots */}
          {activeSpots.map(spot => (
            <div
              key={spot.id}
              className={`flex items-center transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl [&>div]:w-full ${
                currentSlide === `spot-${spot.id}`
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <PromoCard
                {...spotToPromoProps(spot)}
                dismissible={true}
                onDismiss={() => handleSpotDismiss(spot.id)}
                spotId={spot.id}
              />
            </div>
          ))}

          {/* Legacy Promo Card */}
          {hasLegacyPromo && activeSpots.length === 0 && (
            <div
              className={`flex items-center transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl [&>div]:w-full ${
                currentSlide === "promo"
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <PromoCard
                {...promoCardProps}
                dismissible={true}
                onDismiss={handlePromoDismiss}
              />
            </div>
          )}
        </div>

        {/* Navigation buttons - toujours centrés verticalement */}
        {totalSlides > 1 && (
          <>
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-sm z-20"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all backdrop-blur-sm z-20"
              aria-label="Slide suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicators - seulement si plus d'un slide */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
            {availableSlides.map((slide, index) => (
              <button
                key={`dot-${slide}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-white shadow-lg"
                    : "w-2 bg-white/70 hover:bg-white/90"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
