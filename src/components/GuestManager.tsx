import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Trash2,
  X,
  Copy,
  Check,
  Send,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { FullEventData, Guest, InvitationStatus, RSVPStatus } from '../types/index.ts';
import { api } from '../services/api.ts';

interface GuestManagerProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const GuestManager: React.FC<GuestManagerProps> = ({ eventData, onRefresh }) => {
  const { event, guests } = eventData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRsvpFilter, setSelectedRsvpFilter] = useState<string>('all');
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isAiWordingOpen, setIsAiWordingOpen] = useState(false);
  const [isGeneratingWording, setIsGeneratingWording] = useState(false);
  const [wordingResult, setWordingResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Guest Form
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    household: 'General',
    invitationStatus: 'draft' as InvitationStatus,
    rsvpStatus: 'pending' as RSVPStatus,
    plusOnes: 0,
    dietary: '',
    accessibility: '',
    tableNumber: '',
    notes: '',
  });

  // Guest Statistics
  const totalGuests = guests.length;
  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const totalHeadcount = attendingGuests.reduce((sum, g) => sum + 1 + (Number(g.plusOnes) || 0), 0);
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
  const dietaryRequests = guests.filter(g => g.dietary && g.dietary.trim().length > 0).length;

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const name = `${g.firstName} ${g.lastName}`.toLowerCase();
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        g.household.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.dietary && g.dietary.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRsvp = selectedRsvpFilter === 'all' || g.rsvpStatus === selectedRsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, searchTerm, selectedRsvpFilter]);

  // Handlers
  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.firstName) return;

    try {
      await api.addGuest(event.id, {
        firstName: guestForm.firstName,
        lastName: guestForm.lastName,
        email: guestForm.email,
        phone: guestForm.phone,
        household: guestForm.household || 'General',
        invitationStatus: guestForm.invitationStatus,
        rsvpStatus: guestForm.rsvpStatus,
        plusOnes: Number(guestForm.plusOnes),
        dietary: guestForm.dietary,
        accessibility: guestForm.accessibility,
        tableNumber: guestForm.tableNumber,
        notes: guestForm.notes,
      });
      setIsAddGuestOpen(false);
      setGuestForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        household: 'General',
        invitationStatus: 'draft',
        rsvpStatus: 'pending',
        plusOnes: 0,
        dietary: '',
        accessibility: '',
        tableNumber: '',
        notes: '',
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRsvp = async (guest: Guest, status: RSVPStatus) => {
    try {
      await api.updateGuest(event.id, guest.id, { rsvpStatus: status });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (gId: string) => {
    if (!window.confirm('Remove this guest from directory?')) return;
    try {
      await api.deleteGuest(event.id, gId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Household', 'RSVP Status', 'Plus Ones', 'Dietary', 'Table', 'Notes'];
    const rows = guests.map(g => [
      `"${g.firstName}"`,
      `"${g.lastName}"`,
      `"${g.email || ''}"`,
      `"${g.phone || ''}"`,
      `"${g.household || ''}"`,
      g.rsvpStatus,
      g.plusOnes,
      `"${g.dietary || ''}"`,
      `"${g.tableNumber || ''}"`,
      `"${g.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_guest_directory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample CSV Import simulation
  const handleSimulateCSVImport = async () => {
    const sampleImportGuests = [
      { firstName: 'Kabir', lastName: 'Khanna', email: 'kabir.k@enterprise.com', phone: '+91 98311 00998', household: 'Khanna Family', rsvpStatus: 'attending' as const, plusOnes: 1, dietary: 'Lactose intolerant', tableNumber: 'Table 3' },
      { firstName: 'Zoya', lastName: 'Akhtar', email: 'zoya@cinema.in', phone: '+91 98200 44556', household: 'Creative Circle', rsvpStatus: 'attending' as const, plusOnes: 0, dietary: 'Vegetarian', tableNumber: 'Table 4' },
      { firstName: 'Nikhil', lastName: 'Mehta', email: 'nikhil.m@finance.org', phone: '+91 98110 99887', household: 'University Friends', rsvpStatus: 'pending' as const, plusOnes: 1, dietary: 'None', tableNumber: 'Table 5' },
    ];

    try {
      await api.batchAddGuests(event.id, sampleImportGuests);
      onRefresh();
      alert('Successfully imported sample guest batch!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateWording = async () => {
    setIsGeneratingWording(true);
    try {
      const res = await api.generateInvitationWording({
        eventName: event.name,
        eventType: event.type,
        hostNames: 'The Hosting Family',
        date: event.date,
        time: event.time,
        venue: event.venueName || event.city,
        tone: 'Warm, refined, celebratory',
        medium: 'Formal + WhatsApp',
      });
      setWordingResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingWording(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Hospitality & RSVP</span>
            <span>·</span>
            <span>Target: {event.guestCount} Guests</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            Guest & Invitation Manager
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsAiWordingOpen(true);
              if (!wordingResult) handleGenerateWording();
            }}
            className="px-3.5 py-2 text-xs font-semibold text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A859]" />
            <span>AI Invitation Copy</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-[#4A5750] bg-white hover:bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSimulateCSVImport}
            className="px-3 py-2 text-xs font-semibold text-[#4A5750] bg-white hover:bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5"
            title="Import guest batch spreadsheet"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddGuestOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Guest Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Total In Directory
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {totalGuests}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Target: {event.guestCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Confirmed Attending
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {attendingGuests.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">{totalHeadcount} total seats</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Pending RSVP
          </p>
          <p className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {pendingGuests}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Awaiting reply</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Declined
          </p>
          <p className="text-2xl font-bold font-mono text-[#6B7D73] tabular-nums">
            {declinedGuests}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Unable to attend</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Dietary Requests
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {dietaryRequests}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Allergens noted</p>
        </div>
      </div>

      {/* Guest Directory Table */}
      <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
            Guest Directory & Seating ({filteredGuests.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C9B92] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, family, dietary..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B] w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedRsvpFilter}
              onChange={e => setSelectedRsvpFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg text-[#1B3B2B]"
            >
              <option value="all">All RSVPs</option>
              <option value="attending">Attending</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-y border-[#E8E2D8] text-[#6B7D73] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Guest Name & Household</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">RSVP Status</th>
                <th className="py-2.5 px-3 text-center">+1s</th>
                <th className="py-2.5 px-3">Dietary / Accessibility</th>
                <th className="py-2.5 px-3">Table Seating</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE3]">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C9B92]">
                    No guests in directory matching filters.
                  </td>
                </tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#1B3B2B]">
                      <p className="font-semibold text-sm">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-[10px] text-[#6B7D73]">{guest.household}</p>
                    </td>

                    <td className="py-3 px-3 text-[#52635A] space-y-0.5">
                      {guest.email && <p className="text-[11px]">{guest.email}</p>}
                      {guest.phone && <p className="text-[10px] text-[#6B7D73]">{guest.phone}</p>}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={guest.rsvpStatus}
                        onChange={e => handleUpdateRsvp(guest, e.target.value as RSVPStatus)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-md border ${
                          guest.rsvpStatus === 'attending'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : guest.rsvpStatus === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        <option value="attending">Attending</option>
                        <option value="pending">Pending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-[#1B3B2B]">
                      {guest.plusOnes > 0 ? `+${guest.plusOnes}` : '0'}
                    </td>

                    <td className="py-3 px-3 text-[#52635A]">
                      {guest.dietary ? (
                        <p className="text-[11px] text-[#1B3B2B] font-medium">{guest.dietary}</p>
                      ) : (
                        <span className="text-[#8C9B92]">Standard</span>
                      )}
                      {guest.accessibility && (
                        <p className="text-[10px] text-amber-800 font-semibold">{guest.accessibility}</p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-[#1B3B2B] font-medium">
                      {guest.tableNumber || <span className="text-[#8C9B92]">Unassigned</span>}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="p-1 text-[#8C9B92] hover:text-red-600 transition-colors"
                        title="Delete guest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Invitation Wording Generator Modal */}
      {isAiWordingOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl w-full max-w-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C5A859]" />
                <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
                  Personalized AI Invitation Wording & Messages
                </h3>
              </div>
              <button onClick={() => setIsAiWordingOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs">
              {isGeneratingWording ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#1B3B2B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-semibold text-[#1B3B2B]">Crafting luxury invitation prose with Gemini...</p>
                </div>
              ) : wordingResult ? (
                <div className="space-y-4">
                  {/* Formal Print Card */}
                  <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold font-serif text-[#1B3B2B]">1. Formal Print & Letterpress Invitation</p>
                      <button
                        onClick={() => copyToClipboard(wordingResult.formalCard, 'formal')}
                        className="text-[11px] text-[#1B3B2B] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'formal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'formal' ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <p className="text-[#4A5750] whitespace-pre-line leading-relaxed italic">
                      {wordingResult.formalCard}
                    </p>
                  </div>

                  {/* Digital WhatsApp / SMS */}
                  <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold font-serif text-[#1B3B2B]">2. Digital WhatsApp & SMS Invitation</p>
                      <button
                        onClick={() => copyToClipboard(wordingResult.digitalMessage, 'digital')}
                        className="text-[11px] text-[#1B3B2B] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'digital' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'digital' ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <p className="text-[#4A5750] whitespace-pre-line leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-[#DDD5C7]">
                      {wordingResult.digitalMessage}
                    </p>
                  </div>

                  {/* Polite Follow-up Reminder */}
                  <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold font-serif text-[#1B3B2B]">3. Gentle RSVP Deadline Reminder</p>
                      <button
                        onClick={() => copyToClipboard(wordingResult.gentleReminder, 'reminder')}
                        className="text-[11px] text-[#1B3B2B] hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'reminder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'reminder' ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <p className="text-[#4A5750] whitespace-pre-line leading-relaxed">
                      {wordingResult.gentleReminder}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] flex justify-between items-center">
              <button
                onClick={handleGenerateWording}
                disabled={isGeneratingWording}
                className="px-3 py-1.5 text-xs font-semibold text-[#1B3B2B] hover:bg-[#F2EDE4] rounded-lg transition-colors"
              >
                Regenerate Variations
              </button>
              <button
                onClick={() => setIsAiWordingOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add Guest</h3>
              <button onClick={() => setIsAddGuestOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram"
                    value={guestForm.firstName}
                    onChange={e => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Singhania"
                    value={guestForm.lastName}
                    onChange={e => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="guest@..."
                    value={guestForm.email}
                    onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 / +1..."
                    value={guestForm.phone}
                    onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Household / Group</label>
                  <input
                    type="text"
                    placeholder="e.g. Kapoor Family"
                    value={guestForm.household}
                    onChange={e => setGuestForm({ ...guestForm, household: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">RSVP Status</label>
                  <select
                    value={guestForm.rsvpStatus}
                    onChange={e => setGuestForm({ ...guestForm, rsvpStatus: e.target.value as RSVPStatus })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Plus-Ones</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={guestForm.plusOnes}
                    onChange={e => setGuestForm({ ...guestForm, plusOnes: Number(e.target.value) })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Dietary Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g. Vegetarian, Nut Allergy"
                    value={guestForm.dietary}
                    onChange={e => setGuestForm({ ...guestForm, dietary: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Table Seating</label>
                  <input
                    type="text"
                    placeholder="e.g. Table 1 - Royal Terrace"
                    value={guestForm.tableNumber}
                    onChange={e => setGuestForm({ ...guestForm, tableNumber: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Accessibility / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Needs step-free entrance, senior family elder"
                  value={guestForm.accessibility}
                  onChange={e => setGuestForm({ ...guestForm, accessibility: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
