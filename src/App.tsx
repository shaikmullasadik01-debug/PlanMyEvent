import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  CheckSquare,
  Store,
  Users,
  Clock,
  Sparkles,
  Home,
  MessageSquare,
  Plus,
  Loader2,
} from 'lucide-react';
import { EventItem, FullEventData, UserProfile } from './types/index.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { BudgetManager } from './components/BudgetManager.tsx';
import { TimelineTaskManager } from './components/TimelineTaskManager.tsx';
import { VendorManager } from './components/VendorManager.tsx';
import { GuestManager } from './components/GuestManager.tsx';
import { RunSheetManager } from './components/RunSheetManager.tsx';
import { IdeaStudio } from './components/IdeaStudio.tsx';
import { AIAssistantChat } from './components/AIAssistantChat.tsx';
import { EventWizardModal } from './components/EventWizardModal.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeEventData, setActiveEventData] = useState<FullEventData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Load initial events & user
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const userRes = await api.getCurrentUser();
        if (userRes?.user) setCurrentUser(userRes.user);

        const eventList = await api.getEvents();
        setEvents(eventList);
        if (eventList.length > 0) {
          const firstId = eventList[0].id;
          setActiveEventId(firstId);
          const fullData = await api.getEventById(firstId);
          setActiveEventData(fullData);
        }
      } catch (err) {
        console.error('Error initializing app:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // When activeEventId changes, load full event data
  const loadActiveEvent = async (id: string) => {
    try {
      setIsLoading(true);
      setActiveEventId(id);
      const data = await api.getEventById(id);
      setActiveEventData(data);
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEvent = (id: string) => {
    loadActiveEvent(id);
    if (currentView === 'landing') {
      setCurrentView('overview');
    }
  };

  const handleRefresh = async () => {
    if (activeEventId) {
      try {
        const data = await api.getEventById(activeEventId);
        setActiveEventData(data);
        const eventList = await api.getEvents();
        setEvents(eventList);
      } catch (err) {
        console.error('Error refreshing event:', err);
      }
    }
  };

  const handleEventCreated = async (newEvent: EventItem) => {
    const eventList = await api.getEvents();
    setEvents(eventList);
    setActiveEventId(newEvent.id);
    const data = await api.getEventById(newEvent.id);
    setActiveEventData(data);
    setCurrentView('overview');
  };

  const handleResetDemo = async () => {
    try {
      setIsLoading(true);
      const eventList = await api.resetDemo();
      setEvents(eventList);
      if (eventList.length > 0) {
        await loadActiveEvent(eventList[0].id);
      }
      setCurrentView('overview');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeEvent = activeEventData?.event || null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2522] flex flex-col font-sans selection:bg-[#C5A859]/30">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenWizard={() => setIsWizardOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => {}}
        onResetDemo={handleResetDemo}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isLoading && !activeEventData ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B3B2B]" />
            <p className="text-xs text-[#6B7D73] font-medium">Loading PlanMyEvent AI workspace...</p>
          </div>
        ) : currentView === 'landing' ? (
          <LandingPage
            onStartPlanning={() => setIsWizardOpen(true)}
            onExploreFeatures={() => {
              if (events.length > 0) {
                setCurrentView('overview');
              } else {
                setIsWizardOpen(true);
              }
            }}
            onSelectEvent={id => {
              handleSelectEvent(id);
              setCurrentView('overview');
            }}
            sampleEvent={activeEvent}
          />
        ) : activeEventData ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentView === 'overview' && (
              <DashboardOverview
                eventData={activeEventData}
                events={events}
                onNavigate={setCurrentView}
                onOpenWizard={() => setIsWizardOpen(true)}
                onSelectEvent={handleSelectEvent}
              />
            )}

            {currentView === 'budget' && (
              <BudgetManager eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'timeline' && (
              <TimelineTaskManager eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'vendors' && (
              <VendorManager eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'guests' && (
              <GuestManager eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'runsheet' && (
              <RunSheetManager eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'studio' && (
              <IdeaStudio eventData={activeEventData} onRefresh={handleRefresh} />
            )}

            {currentView === 'assistant' && (
              <AIAssistantChat
                eventData={activeEventData}
                onRefresh={handleRefresh}
                onNavigate={setCurrentView}
              />
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#1B3B2B]">
              No Active Event Selected
            </h2>
            <p className="text-xs text-[#52635A]">
              Create your first AI-guided event plan or load our royal wedding showcase to explore all features.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-xl shadow"
              >
                + Plan New Event
              </button>
              <button
                onClick={handleResetDemo}
                className="px-4 py-2 text-xs font-semibold text-[#1B3B2B] bg-[#F2EDE4] hover:bg-[#EAE4D7] rounded-xl border border-[#DDD5C7]"
              >
                Load Showcase Event
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Compact Mobile Bottom Navigation */}
      {currentView !== 'landing' && (
        <nav className="lg:hidden sticky bottom-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E2D8] px-2 py-1.5 flex items-center justify-around text-[10px]">
          <button
            onClick={() => setCurrentView('overview')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentView === 'overview' ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setCurrentView('budget')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentView === 'budget' ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'
            }`}
          >
            <DollarSign className="w-4 h-4 mb-0.5" />
            <span>Budget</span>
          </button>
          <button
            onClick={() => setCurrentView('timeline')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentView === 'timeline' ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setCurrentView('runsheet')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentView === 'runsheet' ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'
            }`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            <span>Run Sheet</span>
          </button>
          <button
            onClick={() => setCurrentView('assistant')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentView === 'assistant' ? 'text-[#1B3B2B] font-bold' : 'text-[#6B7D73]'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-[#C5A859]" />
            <span>AI Planner</span>
          </button>
        </nav>
      )}

      {/* AI Event Creation Wizard Modal */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
