"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, ChevronDown, LogOut, User, Settings, HelpCircle, X, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    type: "event",
    title: "Nouvel événement créé",
    message: "Mariage de Sophie & Thomas a été créé avec succès",
    time: "Il y a 5 min",
    read: false,
  },
  {
    id: 2,
    type: "rsvp",
    title: "Nouvelle confirmation",
    message: "Jean Dupont a confirmé sa présence à Anniversaire 30 ans",
    time: "Il y a 15 min",
    read: false,
  },
  {
    id: 3,
    type: "task",
    title: "Tâche en retard",
    message: "Réserver le traiteur pour Gala annuel est en retard",
    time: "Il y a 1h",
    read: true,
  },
  {
    id: 4,
    type: "payment",
    title: "Paiement reçu",
    message: "Paiement de 500€ reçu pour Conférence Tech",
    time: "Il y a 2h",
    read: true,
  },
]

export function Header() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notificationsList, setNotificationsList] = useState(notifications)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = notificationsList.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = (id: number) => {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return "bg-[#4F46E5]/10 text-[#4F46E5]"
      case "rsvp":
        return "bg-[#10B981]/10 text-[#10B981]"
      case "task":
        return "bg-[#F59E0B]/10 text-[#F59E0B]"
      case "payment":
        return "bg-[#E91E8C]/10 text-[#E91E8C]"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200",
            searchFocused
              ? "border-[#4F46E5] bg-white shadow-sm ring-2 ring-[#4F46E5]/10"
              : "border-[#e5e7eb] bg-[#f9fafb] hover:border-[#d1d5db]",
          )}
        >
          <Search className={cn("w-4 h-4 transition-colors", searchFocused ? "text-[#4F46E5]" : "text-[#9ca3af]")} />
          <input
            type="text"
            placeholder="Rechercher événements, invités, tâches..."
            className="flex-1 bg-transparent text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-[#9ca3af] hover:text-[#6b7280]">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-[#9ca3af] bg-white border border-[#e5e7eb] rounded-md">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 relative",
              showNotifications
                ? "bg-[#4F46E5]/10 text-[#4F46E5]"
                : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e]",
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1a1a2e]">Notifications</h3>
                  <p className="text-xs text-[#9ca3af]">
                    {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notificationsList.length > 0 ? (
                  notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors group",
                        !notif.read && "bg-[#4F46E5]/5",
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            getNotificationIcon(notif.type),
                          )}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm",
                                !notif.read ? "font-semibold text-[#1a1a2e]" : "font-medium text-[#6b7280]",
                              )}
                            >
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notif.read && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="p-1 text-[#9ca3af] hover:text-[#4F46E5] rounded"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                className="p-1 text-[#9ca3af] hover:text-[#EF4444] rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-[#9ca3af] mt-0.5 truncate">{notif.message}</p>
                          <p className="text-xs text-[#9ca3af] mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 text-[#d1d5db] mx-auto mb-3" />
                    <p className="text-sm text-[#9ca3af]">Aucune notification</p>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-[#e5e7eb] bg-[#f9fafb]">
                <button className="w-full text-center text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium py-1.5">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-[#e5e7eb] mx-2" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className={cn(
              "flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all duration-200",
              showProfile ? "bg-[#f3f4f6]" : "hover:bg-[#f3f4f6]",
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-sm font-semibold text-white">
              RP
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#1a1a2e]">Romain P.</p>
              <p className="text-xs text-[#9ca3af]">Plan Agence</p>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[#9ca3af] transition-transform", showProfile && "rotate-180")} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-[#e5e7eb] bg-gradient-to-br from-[#4F46E5]/5 to-[#7C3AED]/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-lg font-semibold text-white">
                    RP
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a2e]">Romain Petit</p>
                    <p className="text-xs text-[#9ca3af]">romain@example.com</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-full">
                    Plan Agence
                  </span>
                  <span className="text-xs text-[#9ca3af]">498 événements restants</span>
                </div>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] transition-colors">
                  <User className="w-4 h-4" />
                  Mon profil
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] transition-colors">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e] transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  Aide & Support
                </button>
              </div>
              <div className="p-2 border-t border-[#e5e7eb]">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
