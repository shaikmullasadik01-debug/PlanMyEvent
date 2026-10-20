export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'festival'
  | 'community'
  | 'celebration'
  | 'other';

export type EventStatus = 'planning' | 'in_progress' | 'confirmed' | 'completed' | 'archived';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface EventItem {
  id: string;
  userId: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  city: string;
  venueName?: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  theme: string;
  colors: string[];
  venuePreferences?: string;
  culturalPreferences?: string;
  foodPreferences?: string;
  accessibility?: string;
  priorities: string[];
  notes?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  eventId: string;
  name: string;
  allocated: number;
  spent: number;
  notes?: string;
}

export type ExpensePaymentStatus = 'planned' | 'deposit_paid' | 'paid_in_full' | 'pending';

export interface Expense {
  id: string;
  eventId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  amount: number;
  paidAmount: number;
  status: ExpensePaymentStatus;
  dueDate: string;
  vendorName?: string;
  notes?: string;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  dependencies: string[];
  notes?: string;
  completedAt?: string;
}

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'decor'
  | 'florist'
  | 'entertainment'
  | 'makeup'
  | 'transport'
  | 'rentals'
  | 'coordinator'
  | 'other';

export type ContractStatus = 'draft' | 'under_review' | 'signed' | 'declined';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid';
export type BookingStatus = 'researching' | 'contacted' | 'shortlisted' | 'confirmed' | 'rejected';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: VendorCategory;
  location: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  quotedPrice: number;
  contractStatus: ContractStatus;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  notes?: string;
  lastVerified: string;
}

export type InvitationStatus = 'draft' | 'sent' | 'viewed';
export type RSVPStatus = 'attending' | 'declined' | 'pending';

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  household: string;
  invitationStatus: InvitationStatus;
  rsvpStatus: RSVPStatus;
  plusOnes: number;
  dietary: string;
  accessibility: string;
  tableNumber?: string;
  notes?: string;
}

export type RunSheetPhase =
  | 'arrival_setup'
  | 'guest_arrival'
  | 'ceremony_opening'
  | 'dining_reception'
  | 'performances_speeches'
  | 'photography'
  | 'closing_teardown';

export interface RunSheetItem {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  title: string;
  phase: RunSheetPhase;
  location: string;
  leadPerson: string;
  contactPhone: string;
  equipmentNotes?: string;
  backupPlan?: string;
  isCompleted: boolean;
}

export type IdeaCategory =
  | 'theme'
  | 'color_palette'
  | 'decor'
  | 'menu'
  | 'games'
  | 'invitation'
  | 'photoshoot'
  | 'music'
  | 'gifts'
  | 'captions';

export interface IdeaStudioItem {
  id: string;
  eventId?: string;
  category: IdeaCategory;
  title: string;
  description: string;
  estimatedCost: string;
  materials: string[];
  steps: string[];
  budgetAlternative: string;
  isFavorite: boolean;
  isAttached: boolean;
}

export interface ChatMessage {
  id: string;
  eventId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionData?: {
    type: 'budget_proposal' | 'timeline_proposal' | 'runsheet_proposal' | 'vendor_recommendation';
    data: any;
  };
}

export interface FullEventData {
  event: EventItem;
  categories: BudgetCategory[];
  expenses: Expense[];
  tasks: EventTask[];
  vendors: Vendor[];
  guests: Guest[];
  runSheet: RunSheetItem[];
  ideas: IdeaStudioItem[];
}
