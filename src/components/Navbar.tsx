import React from 'react';
import { Calendar, Sparkles, Plus, Menu, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { EventItem, UserProfile } from '../types/index.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  events: EventItem[];
  activeEvent: EventItem | null;
  onSelectEvent: (eventId: string) => void;
  onOpenWizard: () => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  events,
  activeEvent,
  onSelectEvent,
  onOpenWizard,
  currentUser,
  onOpenLogin,
  onResetDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [eventDropdownOpen, setEventDropdownOpen] = React.useState(false);

  const navLinks = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'budget', label: 'Budget' },
    { id: 'timeline', label: 'Timeline & Tasks' },
    { id: 'vendors', label: 'Vendors' },
    { id: 'guests', label: 'Guests' },
    { id: 'runsheet', label: 'Day-of Schedule' },
    { id: 'studio', label: 'Idea Studio' },
    { id: 'assistant', label: 'AI Planner' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('landing')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
              title="Go to PlanMyEvent AI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1B3B2B] flex items-center justify-center text-[#C5A859] shadow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-bold tracking-tight text-[#1B3B2B] font-serif">
                  PlanMyEvent
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-[#1B3B2B] bg-[#EAE4D7] rounded">
                  AI
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4A5750]">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                    isActive
                      ? 'text-[#1B3B2B] font-semibold border-b-2 border-[#1B3B2B]'
                      : 'hover:text-[#1B3B2B]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Event Switcher */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Active Event Selector */}
            {events.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] rounded-lg transition-colors border border-[#DDD5C7] max-w-[210px]"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#1B3B2B]/70 shrink-0" />
                  <span className="truncate">{activeEvent ? activeEvent.name : 'Select Event'}</span>
                  <ChevronDown className="w-3 h-3 text-[#1B3B2B]/60 shrink-0" />
                </button>

                {eventDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#E8E2D8] py-2 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8C9B92] uppercase tracking-wider">
                      Your Events ({events.length})
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-[#F4EFEA]">
                      {events.map(ev => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            onSelectEvent(ev.id);
                            setEventDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FAF8F5] transition-colors ${
                            activeEvent?.id === ev.id ? 'bg-[#F4EFEA] font-medium text-[#1B3B2B]' : 'text-[#4A5750]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="font-medium text-[#1B3B2B] truncate">{ev.name}</p>
                            <p className="text-[11px] text-[#8C9B92]">
                              {ev.city} · {new Date(ev.date).toLocaleDateString()}
                            </p>
                          </div>
                          {activeEvent?.id === ev.id && (
                            <CheckCircle2 className="w-4 h-4 text-[#1B3B2B] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#F4EFEA] px-2 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEventDropdownOpen(false);
                          onResetDemo();
                        }}
                        className="text-[11px] text-[#8C9B92] hover:text-[#1B3B2B] px-2 py-1"
                      >
                        Reset Demo Data
                      </button>
                      <button
                        onClick={() => {
                          setEventDropdownOpen(false);
                          onOpenWizard();
                        }}
                        className="text-[11px] text-[#1B3B2B] font-semibold hover:underline px-2 py-1"
                      >
                        + New Event
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Plan My Event</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenWizard}
              className="p-2 text-white bg-[#1B3B2B] rounded-lg text-xs font-medium sm:hidden"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1B3B2B] hover:bg-[#F2EDE4] rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 pt-2 pb-6 space-y-3">
          {events.length > 0 && (
            <div className="pb-3 border-b border-[#E8E2D8]">
              <label className="text-[11px] font-semibold text-[#8C9B92] uppercase tracking-wider block mb-1">
                Active Event
              </label>
              <select
                value={activeEvent?.id || ''}
                onChange={e => onSelectEvent(e.target.value)}
                className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1B3B2B]"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-left text-xs font-medium rounded-lg transition-colors ${
                  currentView === link.id
                    ? 'bg-[#1B3B2B] text-white'
                    : 'text-[#4A5750] hover:bg-[#F2EDE4]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWizard();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-[#1B3B2B] rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Event with AI</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onResetDemo();
              }}
              className="w-full py-1.5 text-[11px] text-[#8C9B92] hover:text-[#1B3B2B] text-center"
            >
              Reset to Showcase Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
