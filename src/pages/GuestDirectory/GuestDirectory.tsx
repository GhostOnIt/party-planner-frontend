import { useState, useMemo } from "react";
import { 
  Search, Download, Send, Mail, Phone, Users, AtSign, Hash,
  ChevronLeft, ChevronRight, FileSpreadsheet, ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignModal } from "@/components/guest-directory/CampaignModal";
import { useGlobalGuests, useExportGlobalGuests } from "@/hooks/useGlobalGuests";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

const GuestDirectory = () => {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventPopoverOpen, setEventPopoverOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const { toast } = useToast();

  // Fetch guests
  const { data: guestsData, isLoading } = useGlobalGuests({
    search,
    event_id: eventFilter,
    date_from: dateFrom,
    date_to: dateTo,
    page: currentPage,
    per_page: ITEMS_PER_PAGE,
  });

  // Fetch events for filter (combobox supports search, so we load more)
  const { data: eventsData } = useEvents({ per_page: 500 });

  const events = useMemo(() => eventsData?.data ?? [], [eventsData?.data]);
  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery.trim()) return events;
    const q = eventSearchQuery.toLowerCase().trim();
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, eventSearchQuery]);
  const displayedEvents = filteredEvents.slice(0, 5);
  const selectedEvent = eventFilter === "all" ? null : events.find((e) => e.id.toString() === eventFilter);

  // Export mutation
  const { mutate: exportGuests, isPending: isExporting } = useExportGlobalGuests();

  const handleExport = (format: 'csv') => {
    exportGuests({
      format,
      filters: {
        search,
        event_id: eventFilter,
        date_from: dateFrom,
        date_to: dateTo,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Export réussi",
          description: "Le fichier a été téléchargé.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'exporter les invités.",
        });
      }
    });
  };

  const guests = guestsData?.data || [];
  const meta = guestsData?.meta;
  const stats = guestsData?.stats;

  const allSelected = guests.length > 0 && guests.every(g => selectedIds.has(g.id));

  const toggleAll = () => {
    if (allSelected) {
      const newSet = new Set(selectedIds);
      guests.forEach(g => newSet.delete(g.id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      guests.forEach(g => newSet.add(g.id));
      setSelectedIds(newSet);
    }
  };

  const toggleOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Répertoire des Invités</h1>
          <p className="text-muted-foreground">Gérez, filtrez et contactez les invités de tous vos événements.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invités</p>
                <p className="text-xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <AtSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emails disponibles</p>
                <p className="text-xl font-bold text-foreground">{stats?.with_email || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numéros disponibles</p>
                <p className="text-xl font-bold text-foreground">{stats?.with_phone || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom, email, téléphone…"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-9"
                    />
                  </div>
                  <Popover open={eventPopoverOpen} onOpenChange={(open) => { setEventPopoverOpen(open); if (!open) setEventSearchQuery(""); }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full sm:w-[220px] justify-between font-normal"
                        data-tour="onboarding-guest-event-filter"
                      >
                        <span className="truncate">{selectedEvent ? selectedEvent.title : "Tous les événements"}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Rechercher un événement..." value={eventSearchQuery} onValueChange={setEventSearchQuery} />
                        <CommandList className="max-h-[200px]">
                          <CommandEmpty>Aucun événement trouvé.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setEventFilter("all"); setCurrentPage(1); setEventPopoverOpen(false); }}
                            >
                              Tous les événements
                            </CommandItem>
                            {displayedEvents.map((event) => (
                              <CommandItem
                                key={event.id}
                                value={event.id.toString()}
                                onSelect={() => { setEventFilter(event.id.toString()); setCurrentPage(1); setEventPopoverOpen(false); }}
                              >
                                <span className="truncate">{event.title}</span>
                              </CommandItem>
                            ))}
                            {filteredEvents.length > 5 && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                                {filteredEvents.length - 5} autre{filteredEvents.length - 5 > 1 ? "s" : ""} — affinez la recherche
                              </div>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isExporting}>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => handleExport('csv')}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                      </DropdownMenuItem>
                      {/* Add other formats later */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    disabled={selectedIds.size === 0}
                    onClick={() => setCampaignOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-tour="onboarding-send-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>
              </div>
              
              {/* Date Range Filter */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground mr-2">Période (date événement) :</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="w-auto"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="w-auto"
                />
              </div>

              {selectedIds.size > 0 && (
                <p className="text-sm text-primary font-medium">
                  {selectedIds.size} invité{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={allSelected} 
                    onCheckedChange={toggleAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead>Invité</TableHead>
                <TableHead>Coordonnées</TableHead>
                <TableHead>Événement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun invité trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((guest) => (
                  <TableRow key={guest.id} data-state={selectedIds.has(guest.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(guest.id)}
                        onCheckedChange={() => toggleOne(guest.id)}
                        aria-label={`Sélectionner ${guest.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {getInitials(guest.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{guest.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {guest.email && (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" /> {guest.email}
                          </span>
                        )}
                        {guest.phone && (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" /> {guest.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{guest.event?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {guest.event?.date ? format(new Date(guest.event.date), 'd MMM yyyy', { locale: fr }) : '-'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Affichage {meta.current_page * meta.per_page - meta.per_page + 1}-{Math.min(meta.current_page * meta.per_page, meta.total)} sur {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <CampaignModal
        open={campaignOpen}
        onOpenChange={setCampaignOpen}
        selectedCount={selectedIds.size}
        selectedIds={Array.from(selectedIds)}
        onSuccess={() => setSelectedIds(new Set())}
      />
    </div>
  );
};

export default GuestDirectory;
