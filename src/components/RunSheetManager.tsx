import React, { useState } from 'react';
import {
  Clock,
  Printer,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Phone,
  User,
  MapPin,
  Trash2,
  X,
  ShieldCheck,
  CheckSquare,
  Square,
} from 'lucide-react';
import { FullEventData, RunSheetItem, RunSheetPhase } from '../types/index.ts';
import { formatDate } from '../utils/formatters.ts';
import { api } from '../services/api.ts';

interface RunSheetManagerProps {
  eventData: FullEventData;
  onRefresh: () => void;
}

export const RunSheetManager: React.FC<RunSheetManagerProps> = ({ eventData, onRefresh }) => {
  const { event, runSheet } = eventData;
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

  // Form State
  const [itemForm, setItemForm] = useState({
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    title: '',
    phase: 'arrival_setup' as RunSheetPhase,
    location: '',
    leadPerson: '',
    contactPhone: '',
    equipmentNotes: '',
    backupPlan: '',
  });

  const phases: { id: RunSheetPhase; label: string }[] = [
    { id: 'arrival_setup', label: 'Vendor Setup & Inspections' },
    { id: 'guest_arrival', label: 'Guest Arrival & Welcome' },
    { id: 'ceremony_opening', label: 'Ceremony / Opening Keynote' },
    { id: 'performances_speeches', label: 'Performances, Speeches & Entertainment' },
    { id: 'dining_reception', label: 'Dining, Feast & Cocktails' },
    { id: 'photography', label: 'Photography Sessions' },
    { id: 'closing_teardown', label: 'Farewell & Teardown' },
  ];

  const handleToggleComplete = async (item: RunSheetItem) => {
    try {
      await api.updateRunSheetItem(event.id, item.id, { isCompleted: !item.isCompleted });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title || !itemForm.startTime) return;

    try {
      await api.addRunSheetItem(event.id, {
        startTime: itemForm.startTime,
        endTime: itemForm.endTime,
        title: itemForm.title,
        phase: itemForm.phase,
        location: itemForm.location,
        leadPerson: itemForm.leadPerson,
        contactPhone: itemForm.contactPhone,
        equipmentNotes: itemForm.equipmentNotes,
        backupPlan: itemForm.backupPlan,
      });
      setIsAddItemOpen(false);
      setItemForm({
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        title: '',
        phase: 'arrival_setup',
        location: '',
        leadPerson: '',
        contactPhone: '',
        equipmentNotes: '',
        backupPlan: '',
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (rId: string) => {
    if (!window.confirm('Delete this schedule block?')) return;
    try {
      await api.deleteRunSheetItem(event.id, rId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredItems = runSheet.filter(item => {
    if (phaseFilter === 'all') return true;
    return item.phase === phaseFilter;
  });

  const completedCount = runSheet.filter(i => i.isCompleted).length;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D8] no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <span>Day-Of Operations</span>
            <span>·</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1B3B2B]">
            Event-Day Master Run Sheet
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-[#1B3B2B] bg-white hover:bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Itinerary / PDF</span>
          </button>

          <button
            onClick={() => setIsAddItemOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule Block</span>
          </button>
        </div>
      </div>

      {/* Printable Run Sheet Header (visible when printed or in preview) */}
      <div className="hidden print:block p-4 border-b border-black">
        <h1 className="text-2xl font-bold font-serif">{event.name}</h1>
        <p className="text-sm">
          Date: {formatDate(event.date)} at {event.time} · Venue: {event.venueName || event.city}
        </p>
        <p className="text-xs text-gray-600">
          Emergency Coordinator Lead: {eventData.vendors.find(v => v.category === 'coordinator')?.contactName || 'Host Team'}
        </p>
      </div>

      {/* Operational Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Total Milestones
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {runSheet.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Chronological stages</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Completed Blocks
          </p>
          <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {completedCount} / {runSheet.length}
          </p>
          <p className="text-[11px] text-[#6B7D73]">
            {runSheet.length > 0 ? Math.round((completedCount / runSheet.length) * 100) : 0}% day-of progress
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            First Setup Stage
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {runSheet[0]?.startTime || '09:00 AM'}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Vendor call time</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
            Conclusion & Teardown
          </p>
          <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
            {runSheet[runSheet.length - 1]?.endTime || '11:30 PM'}
          </p>
          <p className="text-[11px] text-[#6B7D73]">Final vendor sign-off</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-print">
        <button
          onClick={() => setPhaseFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            phaseFilter === 'all'
              ? 'bg-[#1B3B2B] text-white'
              : 'bg-white text-[#4A5750] border border-[#DDD5C7] hover:bg-[#F2EDE4]'
          }`}
        >
          All Timeline Phases ({runSheet.length})
        </button>
        {phases.map(p => {
          const count = runSheet.filter(i => i.phase === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setPhaseFilter(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                phaseFilter === p.id
                  ? 'bg-[#1B3B2B] text-white'
                  : 'bg-white text-[#4A5750] border border-[#DDD5C7] hover:bg-[#F2EDE4]'
              }`}
            >
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Chronological Schedule Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-12 text-center text-xs text-[#8C9B92] rounded-2xl border border-[#E8E2D8]">
            No schedule items in this phase. Click "Add Schedule Block" to schedule event operations.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.isCompleted
                  ? 'bg-[#FAF8F5]/60 border-[#E8E2D8] opacity-75'
                  : 'bg-white border-[#E8E2D8] shadow-sm hover:shadow'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleToggleComplete(item)}
                    className="mt-1 text-[#1B3B2B] hover:text-[#142B20] transition-colors shrink-0 no-print"
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Square className="w-5 h-5 text-[#8C9B92]" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#1B3B2B] bg-[#F2EDE4] px-2 py-0.5 rounded">
                        {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                      </span>
                      <h3
                        className={`text-base font-bold font-serif ${
                          item.isCompleted ? 'line-through text-[#6B7D73]' : 'text-[#1B3B2B]'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-[10px] uppercase font-semibold text-[#8C9B92] tracking-wider">
                        {item.phase.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-[#52635A] pt-1">
                      {item.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8C9B92] shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}

                      {item.leadPerson && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#8C9B92] shrink-0" />
                          <span>
                            {item.leadPerson} {item.contactPhone ? `(${item.contactPhone})` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.equipmentNotes && (
                      <div className="text-[11px] text-[#4A5750] bg-[#FAF8F5] p-2 rounded-lg border border-[#E8E2D8] mt-1">
                        <span className="font-semibold text-[#1B3B2B]">Notes & Equipment:</span>{' '}
                        {item.equipmentNotes}
                      </div>
                    )}

                    {item.backupPlan && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200 mt-1">
                        <span className="font-semibold text-amber-950">Contingency / Backup Plan:</span>{' '}
                        {item.backupPlan}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 no-print">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-[#8C9B92] hover:text-red-600 transition-colors"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Schedule Block Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D8]">
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">Add Schedule Block</h3>
              <button onClick={() => setIsAddItemOpen(false)} className="text-[#8C9B92] hover:text-[#1B3B2B]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scented Rosewater Welcome & High Tea"
                  value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:00 PM"
                    value={itemForm.startTime}
                    onChange={e => setItemForm({ ...itemForm, startTime: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:15 PM"
                    value={itemForm.endTime}
                    onChange={e => setItemForm({ ...itemForm, endTime: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Phase</label>
                  <select
                    value={itemForm.phase}
                    onChange={e => setItemForm({ ...itemForm, phase: e.target.value as RunSheetPhase })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-2 text-xs text-[#1E2522]"
                  >
                    {phases.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Location on Site</label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Torana Gate"
                    value={itemForm.location}
                    onChange={e => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Lead Assigned Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Coordinator / Family Elder"
                    value={itemForm.leadPerson}
                    onChange={e => setItemForm({ ...itemForm, leadPerson: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1B3B2B] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98200..."
                    value={itemForm.contactPhone}
                    onChange={e => setItemForm({ ...itemForm, contactPhone: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Equipment & Setup Notes</label>
                <textarea
                  rows={2}
                  placeholder="Brass trays, rose petal baskets, sound mic check..."
                  value={itemForm.equipmentNotes}
                  onChange={e => setItemForm({ ...itemForm, equipmentNotes: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B3B2B] mb-1">Contingency / Backup Plan</label>
                <input
                  type="text"
                  placeholder="e.g. Indoor heritage hall prepped if weather changes"
                  value={itemForm.backupPlan}
                  onChange={e => setItemForm({ ...itemForm, backupPlan: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#4A5750] hover:bg-[#F2EDE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm"
                >
                  Save Schedule Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
