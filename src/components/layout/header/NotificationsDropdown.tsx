import { useState, useRef, useEffect } from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function NotificationsDropdown() {
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: notificationsData, isLoading } = useNotifications()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()

  const notifications = notificationsData?.data || []
  const unreadCount = notificationsData?.unread_count || 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id)
  }

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id)
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    // Navigate based on notification type
    if (notification.data?.event_id) {
      navigate(`/events/${notification.data.event_id}`)
    } else {
      navigate("/notifications")
    }
    setShowNotifications(false)
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

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr })
    } catch {
      return "Récemment"
    }
  }

  return (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
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
            {unreadCount > 9 ? "9+" : unreadCount}
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
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#9ca3af]">Chargement...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors group cursor-pointer",
                    !notif.read && "bg-[#4F46E5]/5",
                  )}
                  onClick={() => handleNotificationClick(notif)}
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
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notif.id)
                              }}
                              className="p-1 text-[#9ca3af] hover:text-[#4F46E5] rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notif.id)
                            }}
                            className="p-1 text-[#9ca3af] hover:text-[#EF4444] rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#9ca3af] mt-0.5 truncate">{notif.message}</p>
                      <p className="text-xs text-[#9ca3af] mt-1">{formatTime(notif.created_at)}</p>
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
            <button
              onClick={() => {
                navigate("/notifications")
                setShowNotifications(false)
              }}
              className="w-full text-center text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium py-1.5"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

