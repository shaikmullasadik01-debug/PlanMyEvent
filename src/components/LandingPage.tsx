import React from 'react';
import { Sparkles, Calendar, DollarSign, Users, Clock, CheckCircle2, ArrowRight, ShieldCheck, Compass, MessageSquareQuote } from 'lucide-react';
import { EventItem } from '../types/index.ts';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreFeatures: () => void;
  onSelectEvent: (eventId: string) => void;
  sampleEvent?: EventItem | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onExploreFeatures,
  onSelectEvent,
  sampleEvent,
}) => {
  const eventCategories = [
    {
      title: 'Bespoke Weddings',
      tagline: 'Multi-day celebrations, traditions & timeless luxury',
      image: '/src/assets/images/category_wedding_luxe_1792487757103.jpg',
      features: ['Tradition & Ritual Scheduling', 'Guest Dietary Seating Charts', 'Bridal & Groom Styling Milestones'],
    },
    {
      title: 'Corporate Galas & Summits',
      tagline: 'High-impact keynote stages, awards & networking dinners',
      image: '/src/assets/images/category_corporate_gala_1792487757883.jpg',
      features: ['AV Tech & Speaker Run Sheets', 'Multi-tier Sponsorship Accounting', 'Vendor Quotation Matrices'],
    },
    {
      title: 'Milestone Celebrations',
      tagline: 'Birthdays, anniversaries & bespoke private banquets',
      image: '/src/assets/images/category_celebration_party_1792487758017.jpg',
      features: ['Curated Theme & Palette Studio', 'Artisan Menu & Cake Tastings', 'Custom WhatsApp RSVP Engine'],
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#1E2522]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#1B3B2B] bg-[#F2EDE4] px-3 py-1.5 rounded-md border border-[#DDD5C7]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A859]" />
                Next-Gen Event Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1B3B2B] font-serif leading-[1.12] text-balance">
                Your Perfect Event Starts with AI.
              </h1>

              <p className="text-lg sm:text-xl text-[#52635A] max-w-2xl leading-relaxed">
                Plan smarter, spend wisely, and create unforgettable moments. From royal weddings and milestone birthdays to corporate galas, our intelligent planner organizes budgets, coordinates vendors, and tracks every minute detail.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartPlanning}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Plan My Event</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onExploreFeatures}
                  className="px-6 py-3.5 text-sm font-semibold text-[#1B3B2B] bg-white hover:bg-[#F2EDE4] border border-[#DDD5C7] rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Explore Features & Live Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E8E2D8] flex flex-wrap items-center gap-6 text-xs text-[#6B7D73]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1B3B2B]" />
                  <span>Verified Budget Arithmetic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1B3B2B]" />
                  <span>Dynamic Deadline Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A859]" />
                  <span>Powered by Gemini 3.8 Flash</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-xl bg-white aspect-[4/3] sm:aspect-[16/11]">
                <img
                  src="/src/assets/images/hero_event_celebration_1792487756318.jpg"
                  alt="PlanMyEvent AI Reception Hall"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <p className="text-xs uppercase tracking-widest text-[#E8D7A5] font-semibold">
                    Real Event Management
                  </p>
                  <p className="text-lg font-serif font-bold">
                    The Heritage Palace & Botanical Gala
                  </p>
                  <p className="text-xs text-stone-200 mt-1">
                    220 Guests · 9 Budget Categories · 8 Run Sheet Milestones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-20 bg-[#F5F2EB] border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
              Tailored Event Blueprints
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1B3B2B]">
              Engineered for Every Milestone
            </h2>
            <p className="text-base text-[#52635A]">
              Whether an intimate ceremony or a large-scale corporate festival, PlanMyEvent AI formats timelines, budgeting formulas, and vendor checklists to your exact occasion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eventCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#1B3B2B] mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-[#52635A] leading-relaxed">
                      {cat.tagline}
                    </p>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-[#F0EBE3] text-xs text-[#4A5750]">
                    {cat.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3B2B] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onStartPlanning}
                    className="w-full mt-2 py-2 text-xs font-semibold text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] rounded-lg transition-colors text-center"
                  >
                    Start with this Blueprint
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars Feature Grid */}
      <section className="py-20 bg-white border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A859]">
              Complete Full-Stack Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#1B3B2B]">
              Your Personal AI Event Headquarters
            </h2>
            <p className="text-base text-[#52635A]">
              No more messy spreadsheets or forgotten reminders. Every workflow is connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1B3B2B]">Smart Budget Engine</h3>
              <p className="text-xs text-[#52635A] leading-relaxed">
                App-verified arithmetic prevents budget blowouts. Tracks quotes, deposits paid, outstanding balances, and per-guest costs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1B3B2B]">Dynamic Timeline & Tasks</h3>
              <p className="text-xs text-[#52635A] leading-relaxed">
                Milestones calculate automatically from your event date. Rescheduling shifts all dependent deadlines with conflict alerts.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1B3B2B]">Vendors & Guest RSVP</h3>
              <p className="text-xs text-[#52635A] leading-relaxed">
                Directory comparisons for caterers, venues, and decor. Track plus-ones, allergies, table seats, and personalized invitations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#1B3B2B]">Event-Day Run Sheet</h3>
              <p className="text-xs text-[#52635A] leading-relaxed">
                Minute-by-minute itinerary with lead personnel, direct contact phones, equipment notes, and printable export for day-of staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Sample Showcase Banner */}
      {sampleEvent && (
        <section className="py-16 bg-[#F5F2EB] border-b border-[#E8E2D8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1B3B2B]">
              Interactive Showcase Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1B3B2B]">
              Explore the Pre-Populated "{sampleEvent.name}"
            </h2>
            <p className="text-sm text-[#52635A] max-w-2xl mx-auto">
              Dive right into real analytics, vendor comparison tables, timeline calendars, and run sheet schedules.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectEvent(sampleEvent.id)}
                className="px-6 py-3 text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>Launch Interactive Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-10 bg-[#FAF8F5] text-xs text-[#6B7D73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#1B3B2B] text-sm">PlanMyEvent AI</span>
            <span>·</span>
            <span>Intelligent Event Planning Suite</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onStartPlanning} className="hover:text-[#1B3B2B] transition-colors">
              Plan New Event
            </button>
            <button onClick={onExploreFeatures} className="hover:text-[#1B3B2B] transition-colors">
              Dashboard
            </button>
            <span>© 2026 PlanMyEvent AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
