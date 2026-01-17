import { Globe, Bell } from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar_url?: string | null
  }
  unreadNotifications?: number
  onMenuClick?: () => void
  onNotificationsClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout: () => void
}

export function Header({
  user,
  unreadNotifications = 0,
  onMenuClick,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) {
  // Get user initials (first letter of first name and first letter of last name)
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-end px-6 gap-4">
      <button className="p-2 text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
        <Globe className="w-5 h-5" />
      </button>
      <button
        onClick={onNotificationsClick}
        className="p-2 text-[#6b7280] hover:text-[#1a1a2e] transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#EF4444] text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        )}
      </button>
      <div className="w-9 h-9 rounded-full bg-[#E5E7EB] flex items-center justify-center text-sm font-medium text-[#6b7280]">
        {initials || "U"}
      </div>
    </header>
  )
}
