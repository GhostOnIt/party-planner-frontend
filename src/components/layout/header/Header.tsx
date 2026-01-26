import { Menu } from "lucide-react"
import { SearchBar } from "./SearchBar"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { ProfileDropdown } from "./ProfileDropdown"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user: {
    name: string
    email: string
    avatar_url?: string | null
  }
  onMenuClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout: () => void
}

export function Header({
  user,
  onMenuClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6 z-40 lg:left-[250px] lg:right-0">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button - Mobile/Tablet only */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <SearchBar />
      </div>

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

