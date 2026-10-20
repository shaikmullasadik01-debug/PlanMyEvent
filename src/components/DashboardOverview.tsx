import React from 'react';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Users,
  Store,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { FullEventData, EventItem } from '../types/index.ts';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/formatters.ts';

interface DashboardOverviewProps {
  eventData: FullEventData;
  events: EventItem[];
  onNavigate: (view: string) => void;
  onOpenWizard: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  eventData,
  events,
  onNavigate,
  onOpenWizard,
  onSelectEvent,
}) => {
  const { event, categories, expenses, tasks, vendors, guests, runSheet } = eventData;

  // Real data calculations
  const totalBudget = Number(event.totalBudget) || 0;
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((s, g) => s + 1 + (g.plusOnes || 0), 0);
  const pendingRsvps = guests.filter(g => g.rsvpStatus === 'pending').length;

  const confirmedVendors = vendors.filter(v => v.bookingStatus === 'confirmed').length;
  const daysLeft = getDaysUntil(event.date);

  // Upcoming tasks due soon
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Event Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1B3B2B] to-[#254A37] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#162E22] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Event Headquarters</span>
            <span>·</span>
            <span>{daysLeft === 0 ? 'Today!' : daysLeft > 0 ? `${daysLeft} Days to Go` : 'Event Concluded'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif">
            {event.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#C5A859]" />
              {formatDate(event.date)} at {event.time}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C5A859]" />
              {event.venueName ? `${event.venueName}, ${event.city}` : event.city}
            </span>
            <span>·</span>
            <span className="capitalize">{event.theme}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2.5 text-xs font-bold text-[#1B3B2B] bg-[#FAF8F5] hover:bg-white rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A859]" />
            <span>Consult AI Specialist</span>
          </button>
          <button
            onClick={onOpenWizard}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#C5A859] hover:bg-[#B3933E] rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Another Event</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget KPI */}
        <div
          onClick={() => onNavigate('budget')}
          className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm hover:border-[#1B3B2B] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
              Budget & Spend
            </span>
            <DollarSign className="w-4 h-4 text-[#1B3B2B] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
              {formatCurrency(totalSpent, event.currency)}
            </p>
            <p className="text-[11px] text-[#6B7D73]">
              of {formatCurrency(totalBudget, event.currency)} ({budgetPercent}%)
            </p>
          </div>
          <div className="w-full bg-[#EAE4D7] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${totalSpent > totalBudget ? 'bg-red-500' : 'bg-[#1B3B2B]'}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks KPI */}
        <div
          onClick={() => onNavigate('timeline')}
          className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm hover:border-[#1B3B2B] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
              Milestone Checklist
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {completedTasks} / {totalTasks}
            </p>
            <p className="text-[11px] text-[#6B7D73]">{taskPercent}% milestones accomplished</p>
          </div>
          <div className="w-full bg-[#EAE4D7] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full" style={{ width: `${taskPercent}%` }} />
          </div>
        </div>

        {/* Guests KPI */}
        <div
          onClick={() => onNavigate('guests')}
          className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm hover:border-[#1B3B2B] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
              RSVP Headcount
            </span>
            <Users className="w-4 h-4 text-[#1B3B2B] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
              {attendingHeadcount}
            </p>
            <p className="text-[11px] text-[#6B7D73]">
              Target: {event.guestCount} · {pendingRsvps} awaiting
            </p>
          </div>
          <div className="w-full bg-[#EAE4D7] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1B3B2B] h-full"
              style={{ width: `${Math.min(100, (attendingHeadcount / (event.guestCount || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Vendors KPI */}
        <div
          onClick={() => onNavigate('vendors')}
          className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-sm hover:border-[#1B3B2B] cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7D73] uppercase tracking-wider">
              Vendor Partners
            </span>
            <Store className="w-4 h-4 text-[#1B3B2B] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1B3B2B] tabular-nums">
              {confirmedVendors} / {vendors.length}
            </p>
            <p className="text-[11px] text-[#6B7D73]">Confirmed contracts secured</p>
          </div>
          <div className="w-full bg-[#EAE4D7] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C5A859] h-full"
              style={{ width: `${vendors.length > 0 ? (confirmedVendors / vendors.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Deadlines + Day-Of Schedule Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
                Upcoming Critical Deadlines
              </h3>
              <p className="text-xs text-[#6B7D73]">Action items due next in your event timeline</p>
            </div>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs font-semibold text-[#1B3B2B] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#F0EBE3]">
            {upcomingTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8C9B92]">
                All milestones are up to date!
              </p>
            ) : (
              upcomingTasks.map(task => {
                const days = getDaysUntil(task.dueDate);
                const isOverdue = days < 0;
                return (
                  <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-[#1B3B2B]">{task.title}</p>
                      <p className="text-[11px] text-[#6B7D73]">
                        {task.category} · Assigned to {task.assignee}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums px-2 py-0.5 rounded ${
                        isOverdue
                          ? 'bg-red-50 text-red-700'
                          : days <= 7
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-[#FAF8F5] text-[#52635A]'
                      }`}
                    >
                      {days === 0 ? 'Due Today' : days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Day-of Run Sheet Preview */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-[#1B3B2B]">
                Day-of Schedule
              </h3>
              <p className="text-xs text-[#6B7D73]">Key operational phases</p>
            </div>
            <button
              onClick={() => onNavigate('runsheet')}
              className="text-xs font-semibold text-[#1B3B2B] hover:underline flex items-center gap-1"
            >
              <span>Open Run Sheet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {runSheet.slice(0, 4).map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold text-[#1B3B2B] block">
                    {item.startTime}
                  </span>
                  <p className="text-xs font-medium text-[#1E2522] line-clamp-1">{item.title}</p>
                </div>
                <span className="text-[10px] text-[#8C9B92] uppercase font-semibold shrink-0">
                  {item.leadPerson}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Proactive Planning Recommendations */}
      <div className="bg-[#FAF4EB] border border-[#E5DAC8] p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A859]" />
          <h3 className="text-sm font-bold font-serif text-[#1B3B2B]">
            AI Proactive Planning Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/80 p-3.5 rounded-xl border border-[#DDD5C7] space-y-1">
            <p className="font-bold text-[#1B3B2B]">Budget Optimization</p>
            <p className="text-[#52635A] leading-relaxed">
              Your catering allocation represents 27% of total budget. Run our AI optimizer to examine seasonal ingredients and menu alternatives.
            </p>
            <button
              onClick={() => onNavigate('budget')}
              className="text-[11px] font-semibold text-[#1B3B2B] hover:underline pt-1 block"
            >
              Optimize Budget →
            </button>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-[#DDD5C7] space-y-1">
            <p className="font-bold text-[#1B3B2B]">RSVP Follow-Up</p>
            <p className="text-[#52635A] leading-relaxed">
              {pendingRsvps} guests are still pending reply. Generate a personalized, gentle reminder message in the guest studio.
            </p>
            <button
              onClick={() => onNavigate('guests')}
              className="text-[11px] font-semibold text-[#1B3B2B] hover:underline pt-1 block"
            >
              Draft Reminders →
            </button>
          </div>

          <div className="bg-white/80 p-3.5 rounded-xl border border-[#DDD5C7] space-y-1">
            <p className="font-bold text-[#1B3B2B]">Theme & Decor Inspiration</p>
            <p className="text-[#52635A] leading-relaxed">
              Explore creative concepts for botanical floral mandaps, curated gift hampers, and custom photo shot lists.
            </p>
            <button
              onClick={() => onNavigate('studio')}
              className="text-[11px] font-semibold text-[#1B3B2B] hover:underline pt-1 block"
            >
              Explore Idea Studio →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
