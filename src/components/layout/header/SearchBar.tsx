import { useState, useRef, useEffect } from "react"
import { Search, X, Calendar, Users, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSearch } from "@/hooks/useSearch"

export function SearchBar() {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: searchResults, isLoading } = useSearch(searchQuery, showResults && searchQuery.length >= 2)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowResults(value.length >= 2)
  }

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`)
    setShowResults(false)
    setSearchQuery("")
  }

  const handleGuestClick = (eventId: number) => {
    navigate(`/events/${eventId}?tab=guests`)
    setShowResults(false)
    setSearchQuery("")
  }

  const events = searchResults?.events || []
  const guests = searchResults?.guests || []
  const hasResults = events.length > 0 || guests.length > 0

  return (
    <div className="flex-1 max-w-md relative" ref={searchRef}>
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
          placeholder="Rechercher événements, invités..."
          className="flex-1 bg-transparent text-sm text-[#1a1a2e] placeholder:text-[#9ca3af] outline-none"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            setSearchFocused(true)
            if (searchQuery.length >= 2) {
              setShowResults(true)
            }
          }}
          onBlur={() => {
            // Don't blur immediately to allow clicks on results
            setTimeout(() => setSearchFocused(false), 200)
          }}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("")
              setShowResults(false)
            }}
            className="text-[#9ca3af] hover:text-[#6b7280]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
         
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-[#e5e7eb] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#9ca3af]">Recherche en cours...</p>
            </div>
          ) : hasResults ? (
            <>
              {events.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                    Événements
                  </div>
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f3f4f6] transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e] truncate">{event.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                          <span>{event.type}</span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span className="truncate">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {guests.length > 0 && (
                <div className="p-2 border-t border-[#e5e7eb]">
                  <div className="px-3 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">
                    Invités
                  </div>
                  {guests.map((guest) => (
                    <button
                      key={guest.id}
                      onClick={() => handleGuestClick(guest.event.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f3f4f6] transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e] truncate">{guest.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                          <span className="truncate">{guest.event.title}</span>
                          {guest.email && (
                            <>
                              <span>•</span>
                              <span className="truncate">{guest.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9ca3af] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-[#d1d5db] mx-auto mb-3" />
              <p className="text-sm text-[#9ca3af]">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

