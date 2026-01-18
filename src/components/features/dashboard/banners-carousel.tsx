import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TrialBanner } from "./trial-banner"
import { PromoCard } from "./promo-card"
import { useAvailableTrial } from "@/hooks/useAdminPlans"

interface BannersCarouselProps {
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

export function BannersCarousel({
  showPromo = true,
  onPromoDismiss,
  promoCardProps,
}: BannersCarouselProps) {
  const { data: trialData, isLoading: isLoadingTrial } = useAvailableTrial()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [trialVisible, setTrialVisible] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Vérifier si le trial est disponible
  const hasTrial = useMemo(() => {
    if (isLoadingTrial) return false
    return trialData?.available && trialData?.data && trialVisible
  }, [trialData, isLoadingTrial, trialVisible])

  // Vérifier si la promo est disponible
  const hasPromo = showPromo

  // Créer un tableau des slides disponibles
  const availableSlides = useMemo(() => {
    const slides: Array<"trial" | "promo"> = []
    if (hasTrial) slides.push("trial")
    if (hasPromo) slides.push("promo")
    return slides
  }, [hasTrial, hasPromo])

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

  // Si aucun slide disponible, ne rien afficher
  if (totalSlides === 0) {
    return null
  }

  const currentSlide = availableSlides[currentIndex]

  return (
    <div
      className="relative mb-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carrousel container - utilise grid pour superposer les slides */}
      <div className="relative overflow-visible rounded-2xl">
        {/* Slides container - grid avec tous les slides dans la même cellule */}
        <div className="grid *:col-start-1 *:row-start-1">
          {/* Trial Banner */}
          {hasTrial && (
            <div
              className={`transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl ${
                currentSlide === "trial"
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <TrialBanner dismissible={true} onDismiss={handleTrialDismiss} />
            </div>
          )}

          {/* Promo Card */}
          {hasPromo && (
            <div
              className={`transition-opacity duration-500 ease-in-out [&>div]:rounded-2xl ${
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

        {/* Navigation buttons - seulement si plus d'un slide */}
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
            {availableSlides.map((_, index) => (
              <button
                key={index}
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
    </div>
  )
}
