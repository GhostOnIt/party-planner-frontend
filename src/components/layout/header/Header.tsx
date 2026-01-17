import { SearchBar } from "./SearchBar"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { ProfileDropdown } from "./ProfileDropdown"

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar_url?: string | null
  }
  onMenuClick?: () => void
  onNotificationsClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout: () => void
}

export function Header({
  user,
  onMenuClick,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 z-40 lg:left-[250px] lg:right-0">
      <SearchBar />

      <div className="flex items-center gap-2">
        <NotificationsDropdown />

        {/* Separator */}
        <div className="w-px h-8 bg-[#e5e7eb] mx-2" />

        <ProfileDropdown
          user={user}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
        />
      </div>
    </header>
  )
}

