import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, ArrowLeft, Check, Calendar, DollarSign, Users, MapPin, Palette, HeartHandshake, Loader2, Info } from 'lucide-react';
import { EventItem, EventType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { formatCurrency } from '../utils/formatters.ts';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'wedding' as EventType,
    date: '2026-12-18',
    time: '18:00',
    city: 'San Francisco, CA',
    venueName: '',
    guestCount: 120,
    totalBudget: 25000,
    currency: 'USD',
    theme: 'Warm Botanical Elegance',
    colors: ['#1B3B2B', '#C5A859', '#FAF8F5'],
    venuePreferences: 'Scenic indoor-outdoor pavilion with natural lighting',
    culturalPreferences: '',
    foodPreferences: 'Farm-to-table seasonal menu, vegan and nut-free options',
    accessibility: 'Step-free ramp access, dedicated senior seating',
    priorities: ['Memorable Gastronomy', 'Documentary Photography', 'Live Acoustic Music'],
    notes: '',
  });

  if (!isOpen) return null;

  const eventTypes: { id: EventType; label: string }[] = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'birthday', label: 'Birthday Celebration' },
    { id: 'corporate', label: 'Corporate Gala / Summit' },
    { id: 'anniversary', label: 'Anniversary' },
    { id: 'festival', label: 'Festival / Social' },
    { id: 'community', label: 'Community Gathering' },
    { id: 'other', label: 'Private Function' },
  ];

  const priorityOptions = [
    'Memorable Gastronomy',
    'Documentary Photography',
    'Atmospheric Floral & Lighting',
    'Live Music & Entertainment',
    'Venue Elegance & Views',
    'Cocktails & Mixology',
    'Guest Comfort & Logistics',
  ];

  const handleTogglePriority = (p: string) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(p)
        ? prev.priorities.filter(item => item !== p)
        : [...prev.priorities, p],
    }));
  };

  const handleGeneratePlan = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const plan = await api.generateEventPlan(formData);
      setGeneratedPlan(plan);
      setStep(5); // Review step
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate plan. Please verify inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      setIsGenerating(true);
      const res = await api.createEvent(formData);

      // If AI generated category allocations, update or add them
      if (generatedPlan?.categoryAllocations && res.event.id) {
        for (const cat of generatedPlan.categoryAllocations) {
          try {
            await api.addCategory(res.event.id, {
              name: cat.name,
              allocated: cat.estimatedAmount || Math.round((formData.totalBudget * (cat.percentage || 10)) / 100),
              notes: cat.strategicRationale,
            });
          } catch (e) {
            console.error('Failed to add category:', e);
          }
        }
      }

      // If AI generated timeline milestones, populate tasks
      if (generatedPlan?.timelineMilestones && res.event.id) {
        for (const m of generatedPlan.timelineMilestones) {
          try {
            const eventDate = new Date(formData.date);
            const taskDue = new Date(eventDate.getTime() - (m.daysBeforeEvent || 14) * 86400000)
              .toISOString()
              .split('T')[0];

            await api.addTask(res.event.id, {
              title: m.title,
              category: m.category || 'General',
              description: m.description,
              priority: m.priority || 'medium',
              status: 'todo',
              dueDate: taskDue,
              assignee: 'Host',
            });
          } catch (e) {
            console.error('Failed to add task:', e);
          }
        }
      }

      // If AI generated day-of schedule, add to run sheet
      if (generatedPlan?.dayOfSchedule && res.event.id) {
        for (const s of generatedPlan.dayOfSchedule) {
          try {
            await api.addRunSheetItem(res.event.id, {
              startTime: s.startTime || '10:00 AM',
              endTime: s.endTime || '11:00 AM',
              phase: s.phase || 'arrival_setup',
              title: s.title,
              equipmentNotes: s.notes,
              leadPerson: 'Event Coordinator',
            });
          } catch (e) {
            console.error('Failed to add run sheet item:', e);
          }
        }
      }

      // If AI generated creative concepts, save to idea studio
      if (generatedPlan?.creativeConcepts && res.event.id) {
        for (const c of generatedPlan.creativeConcepts) {
          try {
            await api.addIdea(res.event.id, {
              category: c.category || 'theme',
              title: c.title,
              description: c.description,
              materials: c.materials,
              budgetAlternative: c.budgetAlternative,
            });
          } catch (e) {
            console.error('Failed to add idea:', e);
          }
        }
      }

      onEventCreated(res.event);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save event');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E8E2D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1B3B2B] text-[#C5A859] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1B3B2B]">
                AI Event Planning Wizard
              </h2>
              <p className="text-xs text-[#6B7D73]">
                Step {step} of 5 · {step === 5 ? 'Review AI Generated Blueprint' : 'Configure Requirements'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7D73] hover:text-[#1B3B2B] hover:bg-[#F2EDE4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="w-full bg-[#EAE4D7] h-1.5">
          <div
            className="bg-[#1B3B2B] h-1.5 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic Event Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#1B3B2B]">
                1. Event Basics & Location
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Event Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eventTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t.id })}
                      className={`px-3 py-2 text-xs font-medium rounded-lg text-left border transition-all ${
                        formData.type === t.id
                          ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]'
                          : 'bg-white text-[#4A5750] border-[#DDD5C7] hover:border-[#1B3B2B]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya & Aarav's Royal Botanical Wedding"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1E2522] focus:outline-none focus:ring-1 focus:ring-[#1B3B2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                    Host City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jaipur, RJ or New York, NY"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Venue Name or Style (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., The Heritage Palace Courtyard or Garden Estate"
                  value={formData.venueName}
                  onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#1E2522]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Scale & Financials */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#1B3B2B]">
                2. Guest Attendance & Budget Target
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1B3B2B]">
                    <Users className="w-4 h-4 text-[#1B3B2B]" />
                    <span>Estimated Guest Count</span>
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    value={formData.guestCount}
                    onChange={e => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-base font-semibold text-[#1B3B2B]"
                  />
                  <p className="text-[11px] text-[#6B7D73]">
                    Used to calculate catering quotas, seating, and per-guest metrics.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1B3B2B]">
                    <DollarSign className="w-4 h-4 text-[#1B3B2B]" />
                    <span>Total Financial Budget</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={formData.currency}
                      onChange={e => setFormData({ ...formData, currency: e.target.value })}
                      className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2 py-2 text-xs font-bold text-[#1B3B2B]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="AED">AED (AED)</option>
                    </select>
                    <input
                      type="number"
                      min="500"
                      value={formData.totalBudget}
                      onChange={e => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                      className="flex-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-base font-semibold text-[#1B3B2B]"
                    />
                  </div>
                  <p className="text-[11px] text-[#6B7D73]">
                    Budget per guest: <span className="font-semibold text-[#1B3B2B]">{formatCurrency(formData.totalBudget / (formData.guestCount || 1), formData.currency)}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Venue Preference & Vibe
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Historic palace with outdoor lawn, modern loft with high ceilings, beachfront terrace..."
                  value={formData.venuePreferences}
                  onChange={e => setFormData({ ...formData, venuePreferences: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Aesthetics & Styling */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#1B3B2B]">
                3. Theme, Colors & Priorities
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Aesthetic Theme & Mood
                </label>
                <input
                  type="text"
                  placeholder="e.g., Warm Botanical Elegance, Modern Black Tie, Whimsical Garden Party..."
                  value={formData.theme}
                  onChange={e => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg px-3 py-2 text-sm text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Key Priorities (Select 2-4)
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map(p => {
                    const isSelected = formData.priorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTogglePriority(p)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#1B3B2B] text-white border-[#1B3B2B]'
                            : 'bg-white text-[#4A5750] border-[#DDD5C7] hover:border-[#1B3B2B]'
                        }`}
                      >
                        {isSelected && '✓ '} {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Cultural Preferences & Special Traditions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Sangeet & Phere at sunset, Mehndi ceremony, tea ceremony, chuppah, cake-cutting toast..."
                  value={formData.culturalPreferences}
                  onChange={e => setFormData({ ...formData, culturalPreferences: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Food, Accessibility & Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-[#1B3B2B]">
                4. Hospitality, Food & Accessibility
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Dining & Beverage Guidelines
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Multi-course plated dinner, live chaat stalls, craft cocktails, vegetarian & gluten-free options..."
                  value={formData.foodPreferences}
                  onChange={e => setFormData({ ...formData, foodPreferences: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Accessibility & Guest Comfort
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Wheelchair accessibility, ramp access to main stage, close proximity restrooms, golf carts for elders..."
                  value={formData.accessibility}
                  onChange={e => setFormData({ ...formData, accessibility: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B3B2B] mb-1">
                  Additional Instructions or Constraints (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any specific must-haves, sound curfews, or vendor exclusions..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border border-[#DDD5C7] rounded-lg p-2.5 text-xs text-[#1E2522]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Review AI Generated Plan */}
          {step === 5 && generatedPlan && (
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A859]">
                  <Sparkles className="w-4 h-4 text-[#C5A859]" />
                  AI Blueprint Overview
                </div>
                <p className="text-xs text-[#1E2522] leading-relaxed">
                  {generatedPlan.summary}
                </p>
              </div>

              {/* Budget Allocations */}
              {generatedPlan.categoryAllocations?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B]">
                    Recommended Category Allocations ({generatedPlan.categoryAllocations.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {generatedPlan.categoryAllocations.map((cat: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E8E2D8] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-[#1B3B2B]">{cat.name}</p>
                          <p className="text-[10px] text-[#6B7D73] line-clamp-1">{cat.strategicRationale}</p>
                        </div>
                        <span className="font-mono font-bold text-[#1B3B2B] ml-2">
                          {formatCurrency(cat.estimatedAmount, formData.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones Preview */}
              {generatedPlan.timelineMilestones?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B]">
                    Kickoff Timeline Milestones ({generatedPlan.timelineMilestones.length})
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.timelineMilestones.slice(0, 4).map((m: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-[#E8E2D8] text-xs flex items-center justify-between">
                        <span className="text-[#1B3B2B] font-medium">{m.title}</span>
                        <span className="text-[11px] text-[#6B7D73]">{m.daysBeforeEvent} days before</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day of Schedule Preview */}
              {generatedPlan.dayOfSchedule?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B3B2B]">
                    Day-of Schedule ({generatedPlan.dayOfSchedule.length} blocks)
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.dayOfSchedule.slice(0, 3).map((s: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-[#E8E2D8] text-xs flex items-center justify-between">
                        <span className="font-mono font-semibold text-[#1B3B2B]">{s.startTime}</span>
                        <span className="text-[#1B3B2B]">{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-[#E8E2D8] flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep(step - 1)}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-[#1B3B2B] hover:bg-[#F2EDE4] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : step === 5 ? (
            <button
              onClick={() => setStep(4)}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-[#1B3B2B] hover:bg-[#F2EDE4] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Inputs</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !formData.name.trim()) {
                  setError('Please enter an event name');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : step === 4 ? (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A859]" />
                  <span>Synthesizing AI Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C5A859]" />
                  <span>Generate Plan with AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirmAndSave}
              disabled={isGenerating}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#1B3B2B] hover:bg-[#142B20] rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A859]" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Approve & Save Event</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
