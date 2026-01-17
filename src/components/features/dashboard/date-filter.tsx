import { useState } from "react"
import { Calendar, ChevronDown, X, Tag } from "lucide-react"

type FilterOption = "7days" | "1month" | "3months" | "custom"
type EventTypeOption = "all" | "mariage" | "anniversaire" | "conférence" | "fête privée" | "autre"

interface DateFilterProps {
  onFilterChange: (filter: FilterOption, customRange?: { start: Date; end: Date }) => void
  onEventTypeChange?: (eventType: EventTypeOption) => void
}

export function DateFilter({ onFilterChange, onEventTypeChange }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("7days")
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeOption>("all")
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false)
  const [dateError, setDateError] = useState("")

  const filters = [
    { id: "7days" as FilterOption, label: "7 derniers jours" },
    { id: "1month" as FilterOption, label: "Dernier mois" },
    { id: "3months" as FilterOption, label: "3 derniers mois" },
  ]

  const eventTypes: { id: EventTypeOption; label: string; color: string }[] = [
    { id: "all", label: "Tous les types", color: "#6B7280" },
    { id: "mariage", label: "Mariage", color: "#E91E8C" },
    { id: "anniversaire", label: "Anniversaire", color: "#4F46E5" },
    { id: "conférence", label: "Conférence", color: "#F59E0B" },
    { id: "fête privée", label: "Fête privée", color: "#10B981" },
    { id: "autre", label: "Autre", color: "#6B7280" },
  ]

  const handleFilterClick = (filter: FilterOption) => {
    setActiveFilter(filter)
    if (filter !== "custom") {
      setShowCustomRange(false)
      onFilterChange(filter)
    }
  }

  const handleCustomRange = () => {
    setActiveFilter("custom")
    setShowCustomRange(true)
  }

  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const applyCustomRange = () => {
    if (!customStart || !customEnd) {
      setDateError("Veuillez sélectionner les deux dates")
      return
    }

    const startDate = new Date(customStart)
    const endDate = new Date(customEnd)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fin de la journée d'aujourd'hui

    if (startDate > today) {
      setDateError("La date de début ne peut pas être supérieure à aujourd'hui")
      return
    }

    if (endDate > today) {
      setDateError("La date de fin ne peut pas être supérieure à aujourd'hui")
      return
    }

    if (startDate > endDate) {
      setDateError("La date de début ne peut pas être supérieure à la date de fin")
      return
    }

    setDateError("")
    onFilterChange("custom", {
      start: startDate,
      end: endDate,
    })
    setShowCustomRange(false)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    const today = getTodayDateString()

    if (selectedDate > today) {
      setDateError("La date de début ne peut pas être supérieure à aujourd'hui")
      return
    }

    setCustomStart(selectedDate)
    setDateError("")
    // Si la date de fin est déjà sélectionnée et que la nouvelle date de début est supérieure, réinitialiser la date de fin
    if (customEnd && selectedDate > customEnd) {
      setCustomEnd("")
    }
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    const today = getTodayDateString()

    if (selectedDate > today) {
      setDateError("La date de fin ne peut pas être supérieure à aujourd'hui")
      return
    }

    setCustomEnd(selectedDate)
    setDateError("")
    // Si la date de début est déjà sélectionnée et que la nouvelle date de fin est inférieure, réinitialiser la date de début
    if (customStart && selectedDate < customStart) {
      setCustomStart("")
    }
  }

  const handleEventTypeSelect = (eventType: EventTypeOption) => {
    setEventTypeFilter(eventType)
    setShowEventTypeDropdown(false)
    onEventTypeChange?.(eventType)
  }

  const selectedEventType = eventTypes.find((t) => t.id === eventTypeFilter)

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-sm font-medium text-[#6b7280]">Filtrer par :</span>

      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeFilter === filter.id
              ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md"
              : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-[#4F46E5] hover:text-[#4F46E5]"
          }`}
        >
          {filter.label}
        </button>
      ))}

      <div className="relative">
        <button
          onClick={handleCustomRange}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeFilter === "custom"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md"
              : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-[#4F46E5] hover:text-[#4F46E5]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Plage personnalisée
          <ChevronDown className="w-4 h-4" />
        </button>

        {showCustomRange && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-[#e5e7eb] p-4 z-50 min-w-[300px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#1a1a2e]">Sélectionner une plage</span>
              <button onClick={() => setShowCustomRange(false)} className="text-[#6b7280] hover:text-[#1a1a2e]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Date de début</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={handleStartDateChange}
                  max={customEnd ? (customEnd > getTodayDateString() ? getTodayDateString() : customEnd) : getTodayDateString()}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent ${
                    dateError ? "border-red-300" : "border-[#e5e7eb]"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-1">Date de fin</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={handleEndDateChange}
                  min={customStart || undefined}
                  max={getTodayDateString()}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent ${
                    dateError ? "border-red-300" : "border-[#e5e7eb]"
                  }`}
                />
              </div>
              {dateError && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                  {dateError}
                </div>
              )}
              <button
                onClick={applyCustomRange}
                disabled={!customStart || !customEnd || !!dateError}
                className="w-full py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="h-6 w-px bg-[#e5e7eb] mx-2" />

      <div className="relative">
        <button
          onClick={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            eventTypeFilter !== "all"
              ? "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-md"
              : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-[#4F46E5] hover:text-[#4F46E5]"
          }`}
        >
          <Tag className="w-4 h-4" />
          {selectedEventType?.label || "Type d'événement"}
          <ChevronDown className="w-4 h-4" />
        </button>

        {showEventTypeDropdown && (
          <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-2 z-50 min-w-[200px]">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleEventTypeSelect(type.id)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-[#F5F7FA] transition-colors ${
                  eventTypeFilter === type.id ? "bg-[#F5F7FA]" : ""
                }`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                <span className={eventTypeFilter === type.id ? "font-medium text-[#4F46E5]" : "text-[#6b7280]"}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

