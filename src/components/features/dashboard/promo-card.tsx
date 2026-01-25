import { useState, useEffect, useRef } from "react"
import { ExternalLink, X, Check } from "lucide-react"
import { useTrackView, useTrackClick } from "@/hooks/useCommunication"

interface PollOption {
  id: string
  label: string
  votes: number
}

interface PromoCardProps {
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
  pollOptions?: PollOption[]
  onVote?: (optionId: string) => void
  onDismiss?: () => void
  dismissible?: boolean
  // Tracking props
  spotId?: string
  onButtonClick?: (buttonType: "primary" | "secondary") => void
}

export function PromoCard({
  type = "banner",
  badge,
  badgeType = "live",
  title,
  description,
  primaryButton,
  secondaryButton,
  pollQuestion = "Quel type d'événement préférez-vous organiser ?",
  pollOptions = [
    { id: "1", label: "Mariage", votes: 45 },
    { id: "2", label: "Anniversaire", votes: 30 },
    { id: "3", label: "Conférence", votes: 15 },
    { id: "4", label: "Autre", votes: 10 },
  ],
  onVote,
  onDismiss,
  dismissible = true,
  spotId,
  onButtonClick,
}: PromoCardProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const viewTracked = useRef(false)

  // Tracking hooks
  const { mutate: trackView } = useTrackView()
  const { mutate: trackClick } = useTrackClick()

  // Track view on mount (only once per spotId)
  useEffect(() => {
    if (spotId && !viewTracked.current) {
      viewTracked.current = true
      trackView(spotId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId])

  const handleDismiss = () => {
    onDismiss?.()
  }

  const handleVote = (optionId: string) => {
    if (hasVoted) return
    setSelectedOption(optionId)
    setHasVoted(true)
    onVote?.(optionId)
  }

  const handleButtonClick = (href: string, buttonType: "primary" | "secondary") => {
    // Track click if spotId is provided
    if (spotId) {
      trackClick({ spotId, buttonType })
      onButtonClick?.(buttonType)
    }
    // Open the link
    if (href && href !== "#") {
      window.open(href, "_blank", "noopener,noreferrer")
    }
  }

  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0)

  const getBadgeStyles = () => {
    switch (badgeType) {
      case "live":
        return "bg-white/20 text-white"
      case "new":
        return "bg-emerald-500 text-white"
      case "promo":
        return "bg-amber-500 text-white"
      default:
        return "bg-white/20 text-white"
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {type === "banner" ? (
        <div className="max-w-2xl">
          {badge && (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getBadgeStyles()}`}
            >
              {badgeType === "live" && <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
              {badge}
            </div>
          )}

          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 mb-6 leading-relaxed">{description}</p>

          <div className="flex items-center gap-3">
            {primaryButton?.label && (
              <button
                onClick={() => handleButtonClick(primaryButton.href, "primary")}
                className="px-5 py-2.5 bg-white text-[#4F46E5] font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                {primaryButton.label}
              </button>
            )}
            {secondaryButton?.label && (
              <button
                onClick={() => handleButtonClick(secondaryButton.href, "secondary")}
                className="px-5 py-2.5 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                {secondaryButton.label}
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 bg-white/20 text-white">
            Sondage
          </div>

          <h3 className="text-xl font-bold text-white mb-4">{pollQuestion}</h3>

          <div className="space-y-3">
            {pollOptions.map((option) => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
              const isSelected = selectedOption === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted}
                  className={`w-full text-left relative overflow-hidden rounded-lg transition-all ${
                    hasVoted ? "bg-white/10 cursor-default" : "bg-white/20 hover:bg-white/30 cursor-pointer"
                  }`}
                >
                  {hasVoted && (
                    <div
                      className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasVoted && isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#4F46E5]" />
                        </div>
                      )}
                      <span className="text-white font-medium">{option.label}</span>
                    </div>
                    {hasVoted && <span className="text-white font-semibold">{percentage}%</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {hasVoted && <p className="text-white/60 text-sm mt-3">{totalVotes} votes au total</p>}
        </div>
      )}
    </div>
  )
}

