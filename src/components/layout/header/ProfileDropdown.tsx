import { useState, useRef, useEffect } from "react"
import { ChevronDown, LogOut, User, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useCurrentSubscription } from "@/hooks/useSubscription"

interface ProfileDropdownProps {
  user: {
    name: string
    email: string
    avatar_url?: string | null
  }
  onLogout: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
}

export function ProfileDropdown({ user, onLogout, onProfileClick, onSettingsClick }: ProfileDropdownProps) {
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: subscriptionData } = useCurrentSubscription()
  const subscription = subscriptionData?.subscription
  const quota = subscriptionData?.quota

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get user initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Get plan name
  const planName = subscription?.plan_type
    ? subscription.plan_type === "essai-gratuit"
      ? "Essai Gratuit"
      : subscription.plan_type === "pro"
        ? "Plan PRO"
        : subscription.plan_type === "agence"
          ? "Plan Agence"
          : subscription.plan_type.toUpperCase()
    : "Aucun plan"

  const eventsRemaining = quota?.remaining ?? 0
  const isUnlimited = quota?.is_unlimited ?? false

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    } else {
      navigate("/profile")
    }
    setShowProfile(false)
  }

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      navigate("/settings")
    }
    setShowProfile(false)
  }

  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setShowProfile(!showProfile)}
        className={cn(
          "flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all duration-200",
          showProfile ? "bg-[#f3f4f6]" : "hover:bg-[#f3f4f6]",
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-sm font-semibold text-white">
          {initials || "U"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-[#1a1a2e]">{user.name}</p>
          <p className="text-xs text-[#9ca3af]">{planName}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-[#9ca3af] transition-transform", showProfile && "rotate-180")} />
      </button>

      {showProfile && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-[#e5e7eb] bg-gradient-to-br from-[#4F46E5]/5 to-[#7C3AED]/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-lg font-semibold text-white">
                {initials || "U"}
              </div>
              <div>
                <p className="font-semibold text-[#1a1a2e]">{user.name}</p>
                <p className="text-xs text-[#9ca3af]">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full">
                {planName}
              </span>
              <span className="text-xs text-[#9ca3af]">
                {isUnlimited ? "Illimité" : `${eventsRemaining} événements restants`}
              </span>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] transition-colors"
            >
              <User className="w-4 h-4" />
              Mon profil
            </button>
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
           
          </div>
          <div className="p-2 border-t border-[#e5e7eb]">
            <button
              onClick={() => {
                onLogout()
                setShowProfile(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

