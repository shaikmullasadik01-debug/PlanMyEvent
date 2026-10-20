import { FullEventData, EventItem, BudgetCategory, Expense, EventTask, Vendor, Guest, RunSheetItem, IdeaStudioItem, UserProfile } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },
  async login(email: string): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
  async signup(name: string, email: string): Promise<{ success: boolean; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    return res.json();
  },

  // Events
  async getEvents(): Promise<EventItem[]> {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    return data.events || [];
  },
  async getEventById(id: string): Promise<FullEventData> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    return res.json();
  },
  async createEvent(eventData: Partial<EventItem>): Promise<FullEventData> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to create event');
    return res.json();
  },
  async updateEvent(id: string, updates: Partial<EventItem>): Promise<FullEventData> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
  },
  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete event');
  },
  async resetDemo(): Promise<EventItem[]> {
    const res = await fetch(`${API_BASE}/events/reset-demo`, { method: 'POST' });
    const data = await res.json();
    return data.events;
  },

  // Categories & Expenses
  async addCategory(eventId: string, category: { name: string; allocated: number; notes?: string }): Promise<BudgetCategory> {
    const res = await fetch(`${API_BASE}/events/${eventId}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('Failed to add category');
    return res.json();
  },
  async updateCategory(eventId: string, catId: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
    const res = await fetch(`${API_BASE}/events/${eventId}/categories/${catId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },
  async deleteCategory(eventId: string, catId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/categories/${catId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
  },

  async addExpense(eventId: string, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    return res.json();
  },
  async updateExpense(eventId: string, expId: string, updates: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses/${expId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update expense');
    return res.json();
  },
  async deleteExpense(eventId: string, expId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/expenses/${expId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete expense');
  },

  // Tasks
  async addTask(eventId: string, task: Partial<EventTask>): Promise<EventTask> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to add task');
    return res.json();
  },
  async updateTask(eventId: string, taskId: string, updates: Partial<EventTask>): Promise<EventTask> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },
  async deleteTask(eventId: string, taskId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks/${taskId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Vendors
  async addVendor(eventId: string, vendor: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to add vendor');
    return res.json();
  },
  async updateVendor(eventId: string, vId: string, updates: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors/${vId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },
  async deleteVendor(eventId: string, vId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors/${vId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vendor');
  },

  // Guests
  async addGuest(eventId: string, guest: Partial<Guest>): Promise<Guest> {
    const res = await fetch(`${API_BASE}/events/${eventId}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest),
    });
    if (!res.ok) throw new Error('Failed to add guest');
    return res.json();
  },
  async batchAddGuests(eventId: string, guests: Partial<Guest>[]): Promise<{ addedCount: number; guests: Guest[] }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/guests/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests }),
    });
    if (!res.ok) throw new Error('Failed to import guests');
    return res.json();
  },
  async updateGuest(eventId: string, gId: string, updates: Partial<Guest>): Promise<Guest> {
    const res = await fetch(`${API_BASE}/events/${eventId}/guests/${gId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update guest');
    return res.json();
  },
  async deleteGuest(eventId: string, gId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/guests/${gId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete guest');
  },

  // Run Sheet
  async addRunSheetItem(eventId: string, item: Partial<RunSheetItem>): Promise<RunSheetItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/runsheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add run sheet item');
    return res.json();
  },
  async updateRunSheetItem(eventId: string, rId: string, updates: Partial<RunSheetItem>): Promise<RunSheetItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/runsheet/${rId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update run sheet item');
    return res.json();
  },
  async deleteRunSheetItem(eventId: string, rId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/runsheet/${rId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete run sheet item');
  },

  // Ideas
  async addIdea(eventId: string, idea: Partial<IdeaStudioItem>): Promise<IdeaStudioItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(idea),
    });
    if (!res.ok) throw new Error('Failed to save idea');
    return res.json();
  },
  async updateIdea(eventId: string, iId: string, updates: Partial<IdeaStudioItem>): Promise<IdeaStudioItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/${iId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update idea');
    return res.json();
  },
  async deleteIdea(eventId: string, iId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/${iId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete idea');
  },

  // AI Endpoints
  async generateEventPlan(planRequest: any): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/generate-event-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planRequest),
    });
    if (!res.ok) throw new Error('Failed to generate AI plan');
    return res.json();
  },
  async sendChatMessage(message: string, eventId?: string): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, eventId }),
    });
    if (!res.ok) throw new Error('Failed to get AI assistant reply');
    return res.json();
  },
  async generateCreativeIdeas(params: { category: string; eventType: string; theme: string; budgetLevel: string }): Promise<{ ideas: any[] }> {
    const res = await fetch(`${API_BASE}/ai/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate ideas');
    return res.json();
  },
  async generateInvitationWording(params: any): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/invitation-wording`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate invitation copy');
    return res.json();
  },
  async optimizeBudget(eventId: string, targetSavingsPercentage: number = 15): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/optimize-budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, targetSavingsPercentage }),
    });
    if (!res.ok) throw new Error('Failed to optimize budget');
    return res.json();
  },
};
