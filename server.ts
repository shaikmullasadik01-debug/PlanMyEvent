import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FullEventData, EventItem, BudgetCategory, Expense, EventTask, Vendor, Guest, RunSheetItem, IdeaStudioItem } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database file storage
const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  events: Record<string, FullEventData>;
}

function getInitialDatabase(): DatabaseSchema {
  const showcaseEventId = 'evt_showcase_royal_wedding';
  const showcaseEvent: EventItem = {
    id: showcaseEventId,
    userId: 'usr_default',
    name: "Maya & Aarav's Royal Botanical Wedding",
    type: 'wedding',
    date: '2026-11-28',
    time: '17:00',
    city: 'Jaipur, Rajasthan',
    venueName: 'The Heritage Palace & Gardens',
    guestCount: 220,
    totalBudget: 3500000,
    currency: 'INR',
    theme: 'Imperial Botanical Elegance',
    colors: ['#1B3B2B', '#C5A859', '#FAF8F5', '#8C3D2B'],
    venuePreferences: 'Open-air heritage courtyard with grand stone arches and lush lawns',
    culturalPreferences: 'Traditional Royal Indian rituals, Sangeet choreography, vibrant Phere at dusk',
    foodPreferences: 'Gourmet North & South Indian regional delicacies, live artisan dessert counters, allergen-free section',
    accessibility: 'Step-free ramp access to mandap and dining pavilion, golf carts for senior elders',
    priorities: ['Memorable guest dining', 'Atmospheric lighting & floral architecture', 'Candid documentary photography'],
    notes: 'Aim for organic marigold & white tuberose fragrances with warm golden acoustic lighting.',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const categories: BudgetCategory[] = [
    { id: 'cat_venue', eventId: showcaseEventId, name: 'Venue & Lawns', allocated: 1100000, spent: 1050000, notes: 'Includes heritage palace rental, bridal suite & generator backup' },
    { id: 'cat_catering', eventId: showcaseEventId, name: 'Catering & Beverages', allocated: 950000, spent: 880000, notes: 'Full 3-course multi-cuisine for 220 guests + high tea' },
    { id: 'cat_decor', eventId: showcaseEventId, name: 'Decorations & Floral Design', allocated: 550000, spent: 520000, notes: 'Botanical mandap, hanging floral chandeliers & entryway' },
    { id: 'cat_photo', eventId: showcaseEventId, name: 'Photography & Cinematography', allocated: 320000, spent: 300000, notes: '2 candid photographers, 2 cinematographers + 4K drone' },
    { id: 'cat_clothing', eventId: showcaseEventId, name: 'Attire & Styling', allocated: 220000, spent: 195000, notes: 'Custom heritage silk sherwani & embroidered lehenga' },
    { id: 'cat_entertainment', eventId: showcaseEventId, name: 'Music & Entertainment', allocated: 180000, spent: 150000, notes: 'Sufi folk fusion ensemble + sound engineer' },
    { id: 'cat_invites', eventId: showcaseEventId, name: 'Invitations & Gifting', allocated: 75000, spent: 65000, notes: 'Linen paper boxed invites & custom sweet hampers' },
    { id: 'cat_transport', eventId: showcaseEventId, name: 'Transport & Logistics', allocated: 65000, spent: 40000, notes: 'Vintage bridal car & guest shuttles from airport' },
    { id: 'cat_misc', eventId: showcaseEventId, name: 'Contingency & Miscellaneous', allocated: 40000, spent: 12000, notes: 'Safety reserve for last-minute extensions' },
  ];

  const expenses: Expense[] = [
    { id: 'exp_1', eventId: showcaseEventId, categoryId: 'cat_venue', categoryName: 'Venue & Lawns', title: 'Palace Advance Deposit', amount: 500000, paidAmount: 500000, status: 'paid_in_full', dueDate: '2026-08-15', vendorName: 'Heritage Palace Trust', createdAt: '2026-08-01' },
    { id: 'exp_2', eventId: showcaseEventId, categoryId: 'cat_venue', categoryName: 'Venue & Lawns', title: 'Palace Second Milestone Installment', amount: 550000, paidAmount: 550000, status: 'paid_in_full', dueDate: '2026-10-10', vendorName: 'Heritage Palace Trust', createdAt: '2026-09-01' },
    { id: 'exp_3', eventId: showcaseEventId, categoryId: 'cat_catering', categoryName: 'Catering & Beverages', title: 'Grand Feast Food Tasting & Token', amount: 350000, paidAmount: 350000, status: 'paid_in_full', dueDate: '2026-09-20', vendorName: 'Royal Cuisines Catering', createdAt: '2026-09-10' },
    { id: 'exp_4', eventId: showcaseEventId, categoryId: 'cat_catering', categoryName: 'Catering & Beverages', title: 'Main Banquet Catering Balance', amount: 530000, paidAmount: 200000, status: 'deposit_paid', dueDate: '2026-11-20', vendorName: 'Royal Cuisines Catering', createdAt: '2026-10-01' },
    { id: 'exp_5', eventId: showcaseEventId, categoryId: 'cat_decor', categoryName: 'Decorations & Floral Design', title: 'Floral Mandap & Light Rigging Advance', amount: 300000, paidAmount: 300000, status: 'paid_in_full', dueDate: '2026-09-28', vendorName: 'Bloom & Petal Jaipur', createdAt: '2026-09-15' },
    { id: 'exp_6', eventId: showcaseEventId, categoryId: 'cat_decor', categoryName: 'Decorations & Floral Design', title: 'Ambient Lighting & Fairy Canopy Balance', amount: 220000, paidAmount: 0, status: 'pending', dueDate: '2026-11-25', vendorName: 'Bloom & Petal Jaipur', createdAt: '2026-10-05' },
    { id: 'exp_7', eventId: showcaseEventId, categoryId: 'cat_photo', categoryName: 'Photography & Cinematography', title: 'Cinematography Team Retainer', amount: 150000, paidAmount: 150000, status: 'paid_in_full', dueDate: '2026-08-30', vendorName: 'Shutter & Soul Studios', createdAt: '2026-08-20' },
    { id: 'exp_8', eventId: showcaseEventId, categoryId: 'cat_photo', categoryName: 'Photography & Cinematography', title: 'Pre-wedding Shoot & Album Balance', amount: 150000, paidAmount: 50000, status: 'deposit_paid', dueDate: '2026-11-26', vendorName: 'Shutter & Soul Studios', createdAt: '2026-09-22' },
  ];

  const tasks: EventTask[] = [
    { id: 'tsk_1', eventId: showcaseEventId, title: 'Finalize Palace Contract & Security Clearance', description: 'Confirm booking hours, vendor entry gate guidelines, and acoustic limit permits.', category: 'Venue', startDate: '2026-08-01', dueDate: '2026-08-15', priority: 'urgent', status: 'completed', assignee: 'Aarav', dependencies: [], completedAt: '2026-08-14' },
    { id: 'tsk_2', eventId: showcaseEventId, title: 'Menu Tasting & Allergen Customization', description: 'Taste test live chaat counters, saffron biryani, and vegan dessert selections.', category: 'Catering', startDate: '2026-09-01', dueDate: '2026-09-25', priority: 'high', status: 'completed', assignee: 'Maya', dependencies: ['tsk_1'], completedAt: '2026-09-21' },
    { id: 'tsk_3', eventId: showcaseEventId, title: 'Send Boxed Linen Wedding Invitations', description: 'Dispatch physical invitation hampers to overseas & out-of-station family.', category: 'Guests', startDate: '2026-09-15', dueDate: '2026-10-05', priority: 'high', status: 'completed', assignee: 'Maya & Aarav', dependencies: [], completedAt: '2026-10-03' },
    { id: 'tsk_4', eventId: showcaseEventId, title: 'Confirm Mandap 3D Floral Mockup & Lighting Plan', description: 'Review botanical arches with Bloom & Petal team, verify candle hurricane glass.', category: 'Decor', startDate: '2026-10-10', dueDate: '2026-10-25', priority: 'high', status: 'in_progress', assignee: 'Maya', dependencies: [] },
    { id: 'tsk_5', eventId: showcaseEventId, title: 'Collect RSVP Dietary Requirements & Plus-Ones', description: 'Track digital RSVPs and group guest households into table seatings.', category: 'Guests', startDate: '2026-10-15', dueDate: '2026-11-10', priority: 'medium', status: 'in_progress', assignee: 'Aarav', dependencies: ['tsk_3'] },
    { id: 'tsk_6', eventId: showcaseEventId, title: 'Sound Engineer & Acoustic Rehearsal for Sufi Band', description: 'Sound check for 8-piece live fusion ensemble at the courtyard amphitheater.', category: 'Entertainment', startDate: '2026-11-15', dueDate: '2026-11-26', priority: 'medium', status: 'todo', assignee: 'Aarav', dependencies: [] },
    { id: 'tsk_7', eventId: showcaseEventId, title: 'Finalize Event-Day Master Run Sheet & Emergency Contacts', description: 'Share minute-by-minute schedule with palace coordinator, photographer, and family.', category: 'Coordination', startDate: '2026-11-18', dueDate: '2026-11-26', priority: 'urgent', status: 'todo', assignee: 'Maya & Aarav', dependencies: ['tsk_4'] },
  ];

  const vendors: Vendor[] = [
    { id: 'ven_1', eventId: showcaseEventId, name: 'The Heritage Palace Trust', category: 'venue', location: 'Amer Road, Jaipur', contactName: 'Col. Ranjit Singh', email: 'heritage.events@palacejaipur.in', phone: '+91 98290 11223', website: 'https://palacejaipur.in', quotedPrice: 1050000, contractStatus: 'signed', paymentStatus: 'paid', bookingStatus: 'confirmed', notes: 'Heritage ballroom + east lawns reserved from 10 AM to 2 AM.', lastVerified: '2026-10-15' },
    { id: 'ven_2', eventId: showcaseEventId, name: 'Royal Cuisines Catering', category: 'catering', location: 'C-Scheme, Jaipur', contactName: 'Chef Harishwar', email: 'harish@royalcuisines.in', phone: '+91 94140 44556', website: 'https://royalcuisines.in', quotedPrice: 880000, contractStatus: 'signed', paymentStatus: 'deposit_paid', bookingStatus: 'confirmed', notes: 'Includes 4 live stalls, 8 main courses, 5 desserts & uniformed silver service.', lastVerified: '2026-10-16' },
    { id: 'ven_3', eventId: showcaseEventId, name: 'Bloom & Petal Botanical Decor', category: 'decor', location: 'Vaishali Nagar, Jaipur', contactName: 'Suman Lata', email: 'suman@bloomandpetal.com', phone: '+91 97830 55667', quotedPrice: 520000, contractStatus: 'signed', paymentStatus: 'deposit_paid', bookingStatus: 'confirmed', notes: 'Fresh Bangalore mogra, marigold garlands, and 300 brass hurricane candles.', lastVerified: '2026-10-18' },
    { id: 'ven_4', eventId: showcaseEventId, name: 'Shutter & Soul Studios', category: 'photography', location: 'Civil Lines, Jaipur', contactName: 'Rohan Mehra', email: 'rohan@shuttersoul.in', phone: '+91 98281 77889', website: 'https://shuttersoul.in', quotedPrice: 300000, contractStatus: 'signed', paymentStatus: 'deposit_paid', bookingStatus: 'confirmed', notes: '2 candid leads + 2 traditional + drone pilot + teaser video within 48 hours.', lastVerified: '2026-10-19' },
    { id: 'ven_5', eventId: showcaseEventId, name: 'Sufi Strings Ensemble', category: 'entertainment', location: 'Jodhpur / Jaipur', contactName: 'Ustad Kamal Khan', email: 'kamal@sufistrings.org', phone: '+91 98299 33221', quotedPrice: 150000, contractStatus: 'under_review', paymentStatus: 'unpaid', bookingStatus: 'shortlisted', notes: '90-minute live twilight performance during guest dinner.', lastVerified: '2026-10-17' },
  ];

  const guests: Guest[] = [
    { id: 'gst_1', eventId: showcaseEventId, firstName: 'Vikram', lastName: 'Singhania', email: 'vikram.s@singhania.com', phone: '+91 98200 12345', household: 'Singhania Family', invitationStatus: 'viewed', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Vegetarian, strictly no onion/garlic', accessibility: 'None', tableNumber: 'Table 1 - Royal Terrace', notes: 'Paternal uncle & aunt' },
    { id: 'gst_2', eventId: showcaseEventId, firstName: 'Ananya', lastName: 'Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 99300 87654', household: 'Maya Friends', invitationStatus: 'viewed', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Gluten-free preference', accessibility: 'None', tableNumber: 'Table 4 - Garden Pavilions', notes: 'Maid of honor' },
    { id: 'gst_3', eventId: showcaseEventId, firstName: 'Devendra', lastName: 'Verma', email: 'dverma@techventures.io', phone: '+91 98111 54321', household: 'Aarav University', invitationStatus: 'sent', rsvpStatus: 'attending', plusOnes: 1, dietary: 'No restrictions', accessibility: 'None', tableNumber: 'Table 5 - Courtyard View', notes: 'College roommate' },
    { id: 'gst_4', eventId: showcaseEventId, firstName: 'Sunita', lastName: 'Kapoor', email: 'sunitakapoor@yahoo.com', phone: '+91 98212 99887', household: 'Kapoor Family', invitationStatus: 'viewed', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Vegetarian', accessibility: 'Wheelchair ramp access required', tableNumber: 'Table 2 - Grand Arch', notes: 'Senior family elder, needs golf cart transfer' },
    { id: 'gst_5', eventId: showcaseEventId, firstName: 'Karan', lastName: 'Oberoi', email: 'karan.oberoi@creativestudios.in', phone: '+91 98450 67890', household: 'Industry Friends', invitationStatus: 'sent', rsvpStatus: 'pending', plusOnes: 0, dietary: 'Vegan', accessibility: 'None', tableNumber: 'Table 6 - Fountain Lawn', notes: 'Follow up before Nov 5th' },
    { id: 'gst_6', eventId: showcaseEventId, firstName: 'Tara', lastName: 'Bose', email: 'tarabose@rediffmail.com', phone: '+91 98300 44332', household: 'Bose Family', invitationStatus: 'viewed', rsvpStatus: 'declined', plusOnes: 0, dietary: 'None', accessibility: 'None', notes: 'Expressed sincere warm wishes, unable to travel from London' },
  ];

  const runSheet: RunSheetItem[] = [
    { id: 'run_1', eventId: showcaseEventId, startTime: '11:00 AM', endTime: '02:00 PM', title: 'Decor & Florals Setup Inspection', phase: 'arrival_setup', location: 'Palace Central Courtyard', leadPerson: 'Suman (Bloom & Petal)', contactPhone: '+91 97830 55667', equipmentNotes: 'Scaffolding, floral mandap, brass urns with marigolds', backupPlan: 'Indoor heritage hall prepped in case of unseasonal drizzle', isCompleted: true },
    { id: 'run_2', eventId: showcaseEventId, startTime: '02:30 PM', endTime: '03:30 PM', title: 'Catering Bar & Buffet Station Sanitization', phase: 'arrival_setup', location: 'Dining Arcade & Terraces', leadPerson: 'Chef Harishwar', contactPhone: '+91 94140 44556', equipmentNotes: 'Warmers, bespoke bronze dinnerware, linen napery', backupPlan: 'Kitchen generator checked and live', isCompleted: true },
    { id: 'run_3', eventId: showcaseEventId, startTime: '04:00 PM', endTime: '04:45 PM', title: 'Soundcheck & Lighting Mood Calibration', phase: 'arrival_setup', location: 'Amphitheater & Stage', leadPerson: 'Ustad Kamal Khan', contactPhone: '+91 98299 33221', equipmentNotes: 'Mics, tabla acoustics, ambient amber floodlights', backupPlan: 'Secondary backup mixer on stand-by', isCompleted: false },
    { id: 'run_4', eventId: showcaseEventId, startTime: '05:00 PM', endTime: '05:45 PM', title: 'Guest Arrival, Scented Welcoming & High Tea', phase: 'guest_arrival', location: 'Grand Torana Entrance Gate', leadPerson: 'Aarav Sister (Pooja)', contactPhone: '+91 98288 77665', equipmentNotes: 'Rose water sprinklers, brass trays, fresh petal cones', backupPlan: 'Extra golf cart driver ready for elders', isCompleted: false },
    { id: 'run_5', eventId: showcaseEventId, startTime: '06:00 PM', endTime: '07:15 PM', title: 'Varmala & Twilight Phere Ceremony', phase: 'ceremony_opening', location: 'Botanical Heritage Mandap', leadPerson: 'Panditji & Family Elders', contactPhone: '+91 98290 11223', equipmentNotes: 'Havan samagri, floral garlands, brass bell, photographer drone', backupPlan: 'Acoustic mic pinned on Panditji', isCompleted: false },
    { id: 'run_6', eventId: showcaseEventId, startTime: '07:30 PM', endTime: '08:45 PM', title: 'Sufi Folk Fusion Live Concert & Cocktails', phase: 'performances_speeches', location: 'Courtyard Amphitheater', leadPerson: 'Ustad Kamal Khan', contactPhone: '+91 98299 33221', equipmentNotes: 'Center stage lighting, guest lounge seating', backupPlan: 'Indoor palace lounge available', isCompleted: false },
    { id: 'run_7', eventId: showcaseEventId, startTime: '08:45 PM', endTime: '10:30 PM', title: 'Royal Feast Banquet & Artisan Dessert Stalls', phase: 'dining_reception', location: 'Pillar Dining Arcade', leadPerson: 'Chef Harishwar', contactPhone: '+91 94140 44556', equipmentNotes: 'Live jalebi-rabri stove, carved fruits, dinner service', backupPlan: 'Additional buffet line staffed', isCompleted: false },
    { id: 'run_8', eventId: showcaseEventId, startTime: '10:45 PM', endTime: '11:30 PM', title: 'Vidaai & Gentle Departure Farewell', phase: 'closing_teardown', location: 'Front Palace Archway', leadPerson: 'Aarav & Maya Parents', contactPhone: '+91 98200 12345', equipmentNotes: 'Vintage floral getaway cabriolet car', backupPlan: 'Shuttle buses ready for hotel drops', isCompleted: false },
  ];

  const ideas: IdeaStudioItem[] = [
    {
      id: 'idea_1',
      eventId: showcaseEventId,
      category: 'theme',
      title: 'Royal Indian Oasis & Botanical Luxury',
      description: 'Blend historic Rajput architectural arches with cascading live eucalyptus, tuberose garlands, and deep emerald silk drapes.',
      estimatedCost: '₹3,50,000 - ₹5,00,000',
      materials: ['Hand-carved brass urns', 'Tuberoses & white marigolds', 'Warm 2400K fairy curtain lights', 'Vintage velvet bolster seating'],
      steps: ['Source locally grown fragrant blossoms on morning of event', 'Install hurricane lanterns along stone walkways', 'Mist courtyard with organic rosewater aroma'],
      budgetAlternative: 'Use potted palms and local seasonal bougainvillea with brass diyas to cut floral costs by 40%.',
      isFavorite: true,
      isAttached: true,
    },
    {
      id: 'idea_2',
      eventId: showcaseEventId,
      category: 'menu',
      title: 'Artisan Heritage Flavors & Live Chaat Gazebo',
      description: 'Curated royal Rajasthani and contemporary Indian menu with live khasta kachori counter and saffron kulfi skewers.',
      estimatedCost: '₹2,200 per guest',
      materials: ['Earthen terracotta cups (Kulhads)', 'Hand-ground spices', 'Live charcoal sigris', 'Copper serving handis'],
      steps: ['Schedule pre-event chef tasting 30 days prior', 'Label vegan, nut-free, and jain items clearly with calligraphed cards', 'Pair hot tandoori bites with chilled raw mango coolers'],
      budgetAlternative: 'Standardize to 6 high-impact signature dishes rather than 14 buffet items to minimize food waste.',
      isFavorite: true,
      isAttached: true,
    },
    {
      id: 'idea_3',
      eventId: showcaseEventId,
      category: 'invitation',
      title: 'Botanical Gold-Foil Calligraphy on Textured Khadi Paper',
      description: 'Handmade cotton rag paper with subtle deckled edges, foil stamped with botanical motifs and custom couple monogram.',
      estimatedCost: '₹180 - ₹250 per box',
      materials: ['Recycled cotton khadi paper', 'Gold hot-foil stamping', 'Wax seal with bespoke botanical stamp', 'Linen thread ribbon'],
      steps: ['Design minimalist typography hierarchy', 'Proof test with sample guest names', 'Pair with personalized QR code for instantaneous digital RSVP'],
      budgetAlternative: 'Send luxury interactive digital animated invitation on WhatsApp and print 30 physical copies exclusively for elders.',
      isFavorite: false,
      isAttached: true,
    },
  ];

  return {
    users: [{ id: 'usr_default', name: 'Maya Sharma', email: 'shaikmullasadik01@gmail.com', role: 'Event Host' }],
    events: {
      [showcaseEventId]: {
        event: showcaseEvent,
        categories,
        expenses,
        tasks,
        vendors,
        guests,
        runSheet,
        ideas,
      },
    },
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database, resetting to default:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// --- Auth Routes ---
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  let user = db.users.find(u => u.email === email);
  if (!user) {
    user = {
      id: 'usr_' + Date.now(),
      name: email ? email.split('@')[0] : 'Event Organizer',
      email: email || 'user@example.com',
      role: 'Event Host',
    };
    db.users.push(user);
    saveDatabase(db);
  }
  res.json({ success: true, user });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email } = req.body;
  const user = {
    id: 'usr_' + Date.now(),
    name: name || 'Event Host',
    email: email || 'user@example.com',
    role: 'Event Host',
  };
  db.users.push(user);
  saveDatabase(db);
  res.json({ success: true, user });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.users[0] || {
    id: 'usr_default',
    name: 'Maya Sharma',
    email: 'shaikmullasadik01@gmail.com',
    role: 'Event Host',
  };
  res.json({ user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

// --- Events CRUD ---
app.get('/api/events', (req: Request, res: Response) => {
  const eventList = Object.values(db.events).map(e => e.event);
  res.json({ events: eventList });
});

app.get('/api/events/:id', (req: Request, res: Response) => {
  const fullData = db.events[req.params.id];
  if (!fullData) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(fullData);
});

app.post('/api/events', (req: Request, res: Response) => {
  const eventData: Partial<EventItem> = req.body;
  const newId = 'evt_' + Date.now();
  const now = new Date().toISOString();

  const newEvent: EventItem = {
    id: newId,
    userId: 'usr_default',
    name: eventData.name || 'Untitled Event',
    type: eventData.type || 'celebration',
    date: eventData.date || '2026-12-15',
    time: eventData.time || '18:00',
    city: eventData.city || 'San Francisco, CA',
    venueName: eventData.venueName || '',
    guestCount: Number(eventData.guestCount) || 50,
    totalBudget: Number(eventData.totalBudget) || 10000,
    currency: eventData.currency || 'USD',
    theme: eventData.theme || 'Modern Elegant',
    colors: eventData.colors || ['#1B3B2B', '#C5A859', '#FAF8F5'],
    venuePreferences: eventData.venuePreferences || '',
    culturalPreferences: eventData.culturalPreferences || '',
    foodPreferences: eventData.foodPreferences || '',
    accessibility: eventData.accessibility || '',
    priorities: eventData.priorities || ['Quality Catering', 'Memorable Ambiance'],
    notes: eventData.notes || '',
    status: 'planning',
    createdAt: now,
    updatedAt: now,
  };

  // Generate initial standard budget categories based on total budget
  const b = newEvent.totalBudget;
  const initialCategories: BudgetCategory[] = [
    { id: 'cat_' + Date.now() + '_1', eventId: newId, name: 'Venue & Facilities', allocated: Math.round(b * 0.35), spent: 0, notes: 'Rental, permits, cleaning' },
    { id: 'cat_' + Date.now() + '_2', eventId: newId, name: 'Catering & Beverages', allocated: Math.round(b * 0.30), spent: 0, notes: 'Food, staff, service, drinks' },
    { id: 'cat_' + Date.now() + '_3', eventId: newId, name: 'Decorations & Flowers', allocated: Math.round(b * 0.12), spent: 0, notes: 'Centerpieces, lighting, linens' },
    { id: 'cat_' + Date.now() + '_4', eventId: newId, name: 'Photography & Video', allocated: Math.round(b * 0.10), spent: 0, notes: 'Full event documentary coverage' },
    { id: 'cat_' + Date.now() + '_5', eventId: newId, name: 'Entertainment & Audio', allocated: Math.round(b * 0.05), spent: 0, notes: 'Music, PA system, host' },
    { id: 'cat_' + Date.now() + '_6', eventId: newId, name: 'Invitations & Favors', allocated: Math.round(b * 0.03), spent: 0, notes: 'Paper/digital invites, gifts' },
    { id: 'cat_' + Date.now() + '_7', eventId: newId, name: 'Contingency Fund', allocated: Math.round(b * 0.05), spent: 0, notes: 'Safety reserve for unplanned needs' },
  ];

  // Default kickoff tasks
  const initialTasks: EventTask[] = [
    { id: 'tsk_' + Date.now() + '_1', eventId: newId, title: 'Finalize venue selection and date deposit', description: 'Tour top 3 shortlisted venues and confirm reservation agreement.', category: 'Venue', startDate: now.split('T')[0], dueDate: newEvent.date, priority: 'urgent', status: 'todo', assignee: 'Host', dependencies: [] },
    { id: 'tsk_' + Date.now() + '_2', eventId: newId, title: 'Draft guest list and send save-the-dates', description: 'Gather accurate email and mailing addresses for primary attendees.', category: 'Guests', startDate: now.split('T')[0], dueDate: newEvent.date, priority: 'high', status: 'todo', assignee: 'Host', dependencies: [] },
    { id: 'tsk_' + Date.now() + '_3', eventId: newId, title: 'Taste menu and finalize catering package', description: 'Review dietary requirements, appetizers, and beverage options.', category: 'Catering', startDate: now.split('T')[0], dueDate: newEvent.date, priority: 'medium', status: 'todo', assignee: 'Host', dependencies: [] },
  ];

  db.events[newId] = {
    event: newEvent,
    categories: initialCategories,
    expenses: [],
    tasks: initialTasks,
    vendors: [],
    guests: [],
    runSheet: [],
    ideas: [],
  };

  saveDatabase(db);
  res.status(201).json(db.events[newId]);
});

app.put('/api/events/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.events[id];
  if (!existing) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const updatedEvent: EventItem = {
    ...existing.event,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  // Check if date changed; if so, recalculate task deadlines
  if (req.body.date && req.body.date !== existing.event.date) {
    const oldDate = new Date(existing.event.date).getTime();
    const newDate = new Date(req.body.date).getTime();
    const deltaMs = newDate - oldDate;

    existing.tasks = existing.tasks.map(t => {
      try {
        const oldDue = new Date(t.dueDate).getTime();
        const newDue = new Date(oldDue + deltaMs).toISOString().split('T')[0];
        return { ...t, dueDate: newDue };
      } catch {
        return t;
      }
    });
  }

  existing.event = updatedEvent;
  saveDatabase(db);
  res.json(existing);
});

app.delete('/api/events/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  if (!db.events[id]) {
    return res.status(404).json({ error: 'Event not found' });
  }
  delete db.events[id];
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/events/reset-demo', (req: Request, res: Response) => {
  db = getInitialDatabase();
  saveDatabase(db);
  res.json({ success: true, events: Object.values(db.events).map(e => e.event) });
});

// --- Budget Categories & Expenses CRUD ---
app.post('/api/events/:id/categories', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { name, allocated, notes } = req.body;
  if (!name || allocated === undefined || allocated < 0) {
    return res.status(400).json({ error: 'Valid category name and positive allocation are required' });
  }

  const newCategory: BudgetCategory = {
    id: 'cat_' + Date.now(),
    eventId: req.params.id,
    name: name.trim(),
    allocated: Number(allocated),
    spent: 0,
    notes: notes || '',
  };

  eventData.categories.push(newCategory);
  saveDatabase(db);
  res.status(201).json(newCategory);
});

app.put('/api/events/:id/categories/:catId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const cat = eventData.categories.find(c => c.id === req.params.catId);
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  if (req.body.name) cat.name = req.body.name.trim();
  if (req.body.allocated !== undefined) {
    if (req.body.allocated < 0) return res.status(400).json({ error: 'Allocation cannot be negative' });
    cat.allocated = Number(req.body.allocated);
  }
  if (req.body.notes !== undefined) cat.notes = req.body.notes;

  saveDatabase(db);
  res.json(cat);
});

app.delete('/api/events/:id/categories/:catId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.categories = eventData.categories.filter(c => c.id !== req.params.catId);
  // remove or unassign expenses in that category
  eventData.expenses = eventData.expenses.filter(e => e.categoryId !== req.params.catId);
  saveDatabase(db);
  res.json({ success: true });
});

// Expenses
app.post('/api/events/:id/expenses', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { categoryId, title, amount, paidAmount, status, dueDate, vendorName, notes } = req.body;
  if (!title || amount === undefined || Number(amount) < 0) {
    return res.status(400).json({ error: 'Title and non-negative amount are required' });
  }

  const category = eventData.categories.find(c => c.id === categoryId);
  const categoryName = category ? category.name : 'Miscellaneous';

  const newExpense: Expense = {
    id: 'exp_' + Date.now(),
    eventId: req.params.id,
    categoryId: categoryId || 'cat_misc',
    categoryName,
    title: title.trim(),
    amount: Number(amount),
    paidAmount: Number(paidAmount || 0),
    status: status || 'planned',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    vendorName: vendorName || '',
    notes: notes || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  eventData.expenses.push(newExpense);

  // Recalculate spent for category
  if (category) {
    category.spent = eventData.expenses
      .filter(e => e.categoryId === category.id)
      .reduce((sum, e) => sum + e.amount, 0);
  }

  saveDatabase(db);
  res.status(201).json(newExpense);
});

app.put('/api/events/:id/expenses/:expId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const expIndex = eventData.expenses.findIndex(e => e.id === req.params.expId);
  if (expIndex === -1) return res.status(404).json({ error: 'Expense not found' });

  const oldExp = eventData.expenses[expIndex];
  const updatedExp: Expense = {
    ...oldExp,
    ...req.body,
    amount: req.body.amount !== undefined ? Math.max(0, Number(req.body.amount)) : oldExp.amount,
    paidAmount: req.body.paidAmount !== undefined ? Math.max(0, Number(req.body.paidAmount)) : oldExp.paidAmount,
  };

  eventData.expenses[expIndex] = updatedExp;

  // Recalculate category totals
  eventData.categories.forEach(cat => {
    cat.spent = eventData.expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  saveDatabase(db);
  res.json(updatedExp);
});

app.delete('/api/events/:id/expenses/:expId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const exp = eventData.expenses.find(e => e.id === req.params.expId);
  if (!exp) return res.status(404).json({ error: 'Expense not found' });

  eventData.expenses = eventData.expenses.filter(e => e.id !== req.params.expId);

  // Recalculate category totals
  eventData.categories.forEach(cat => {
    cat.spent = eventData.expenses
      .filter(e => e.categoryId === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  saveDatabase(db);
  res.json({ success: true });
});

// --- Tasks CRUD ---
app.post('/api/events/:id/tasks', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { title, description, category, startDate, dueDate, priority, status, assignee, dependencies, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const newTask: EventTask = {
    id: 'tsk_' + Date.now(),
    eventId: req.params.id,
    title: title.trim(),
    description: description || '',
    category: category || 'General',
    startDate: startDate || new Date().toISOString().split('T')[0],
    dueDate: dueDate || eventData.event.date,
    priority: priority || 'medium',
    status: status || 'todo',
    assignee: assignee || 'Host',
    dependencies: dependencies || [],
    notes: notes || '',
    completedAt: status === 'completed' ? new Date().toISOString() : undefined,
  };

  eventData.tasks.push(newTask);
  saveDatabase(db);
  res.status(201).json(newTask);
});

app.put('/api/events/:id/tasks/:taskId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const taskIndex = eventData.tasks.findIndex(t => t.id === req.params.taskId);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  const oldTask = eventData.tasks[taskIndex];
  const updatedTask: EventTask = {
    ...oldTask,
    ...req.body,
    completedAt: req.body.status === 'completed' && oldTask.status !== 'completed'
      ? new Date().toISOString()
      : req.body.status !== 'completed' ? undefined : oldTask.completedAt,
  };

  eventData.tasks[taskIndex] = updatedTask;
  saveDatabase(db);
  res.json(updatedTask);
});

app.delete('/api/events/:id/tasks/:taskId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.tasks = eventData.tasks.filter(t => t.id !== req.params.taskId);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Vendors CRUD ---
app.post('/api/events/:id/vendors', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { name, category, location, contactName, email, phone, website, quotedPrice, contractStatus, paymentStatus, bookingStatus, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Vendor name is required' });

  const newVendor: Vendor = {
    id: 'ven_' + Date.now(),
    eventId: req.params.id,
    name: name.trim(),
    category: category || 'other',
    location: location || '',
    contactName: contactName || '',
    email: email || '',
    phone: phone || '',
    website: website || '',
    quotedPrice: Number(quotedPrice || 0),
    contractStatus: contractStatus || 'draft',
    paymentStatus: paymentStatus || 'unpaid',
    bookingStatus: bookingStatus || 'researching',
    notes: notes || '',
    lastVerified: new Date().toISOString().split('T')[0],
  };

  eventData.vendors.push(newVendor);
  saveDatabase(db);
  res.status(201).json(newVendor);
});

app.put('/api/events/:id/vendors/:vId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const vIndex = eventData.vendors.findIndex(v => v.id === req.params.vId);
  if (vIndex === -1) return res.status(404).json({ error: 'Vendor not found' });

  eventData.vendors[vIndex] = {
    ...eventData.vendors[vIndex],
    ...req.body,
    lastVerified: new Date().toISOString().split('T')[0],
  };

  saveDatabase(db);
  res.json(eventData.vendors[vIndex]);
});

app.delete('/api/events/:id/vendors/:vId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.vendors = eventData.vendors.filter(v => v.id !== req.params.vId);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Guests CRUD ---
app.post('/api/events/:id/guests', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { firstName, lastName, email, phone, household, invitationStatus, rsvpStatus, plusOnes, dietary, accessibility, tableNumber, notes } = req.body;
  if (!firstName) return res.status(400).json({ error: 'First name is required' });

  const newGuest: Guest = {
    id: 'gst_' + Date.now(),
    eventId: req.params.id,
    firstName: firstName.trim(),
    lastName: (lastName || '').trim(),
    email: email || '',
    phone: phone || '',
    household: household || 'General',
    invitationStatus: invitationStatus || 'draft',
    rsvpStatus: rsvpStatus || 'pending',
    plusOnes: Number(plusOnes || 0),
    dietary: dietary || '',
    accessibility: accessibility || '',
    tableNumber: tableNumber || '',
    notes: notes || '',
  };

  eventData.guests.push(newGuest);
  saveDatabase(db);
  res.status(201).json(newGuest);
});

app.post('/api/events/:id/guests/batch', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { guests } = req.body;
  if (!Array.isArray(guests)) return res.status(400).json({ error: 'Invalid guests array' });

  const created: Guest[] = guests.map((g, idx) => ({
    id: 'gst_' + Date.now() + '_' + idx,
    eventId: req.params.id,
    firstName: g.firstName || 'Guest',
    lastName: g.lastName || '',
    email: g.email || '',
    phone: g.phone || '',
    household: g.household || 'General',
    invitationStatus: g.invitationStatus || 'draft',
    rsvpStatus: g.rsvpStatus || 'pending',
    plusOnes: Number(g.plusOnes || 0),
    dietary: g.dietary || '',
    accessibility: g.accessibility || '',
    tableNumber: g.tableNumber || '',
    notes: g.notes || '',
  }));

  eventData.guests.push(...created);
  saveDatabase(db);
  res.status(201).json({ addedCount: created.length, guests: created });
});

app.put('/api/events/:id/guests/:gId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const gIndex = eventData.guests.findIndex(g => g.id === req.params.gId);
  if (gIndex === -1) return res.status(404).json({ error: 'Guest not found' });

  eventData.guests[gIndex] = {
    ...eventData.guests[gIndex],
    ...req.body,
  };

  saveDatabase(db);
  res.json(eventData.guests[gIndex]);
});

app.delete('/api/events/:id/guests/:gId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.guests = eventData.guests.filter(g => g.id !== req.params.gId);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Run Sheet CRUD ---
app.post('/api/events/:id/runsheet', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { startTime, endTime, title, phase, location, leadPerson, contactPhone, equipmentNotes, backupPlan } = req.body;
  if (!title || !startTime) return res.status(400).json({ error: 'Title and start time are required' });

  const newItem: RunSheetItem = {
    id: 'run_' + Date.now(),
    eventId: req.params.id,
    startTime: startTime.trim(),
    endTime: endTime ? endTime.trim() : '',
    title: title.trim(),
    phase: phase || 'arrival_setup',
    location: location || '',
    leadPerson: leadPerson || '',
    contactPhone: contactPhone || '',
    equipmentNotes: equipmentNotes || '',
    backupPlan: backupPlan || '',
    isCompleted: false,
  };

  eventData.runSheet.push(newItem);
  saveDatabase(db);
  res.status(201).json(newItem);
});

app.put('/api/events/:id/runsheet/:rId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const rIndex = eventData.runSheet.findIndex(r => r.id === req.params.rId);
  if (rIndex === -1) return res.status(404).json({ error: 'Run sheet item not found' });

  eventData.runSheet[rIndex] = {
    ...eventData.runSheet[rIndex],
    ...req.body,
  };

  saveDatabase(db);
  res.json(eventData.runSheet[rIndex]);
});

app.delete('/api/events/:id/runsheet/:rId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.runSheet = eventData.runSheet.filter(r => r.id !== req.params.rId);
  saveDatabase(db);
  res.json({ success: true });
});

// --- Ideas CRUD ---
app.post('/api/events/:id/ideas', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const { category, title, description, estimatedCost, materials, steps, budgetAlternative } = req.body;
  if (!title) return res.status(400).json({ error: 'Idea title is required' });

  const newIdea: IdeaStudioItem = {
    id: 'idea_' + Date.now(),
    eventId: req.params.id,
    category: category || 'theme',
    title: title.trim(),
    description: description || '',
    estimatedCost: estimatedCost || '',
    materials: Array.isArray(materials) ? materials : [],
    steps: Array.isArray(steps) ? steps : [],
    budgetAlternative: budgetAlternative || '',
    isFavorite: false,
    isAttached: true,
  };

  eventData.ideas.push(newIdea);
  saveDatabase(db);
  res.status(201).json(newIdea);
});

app.put('/api/events/:id/ideas/:iId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  const iIndex = eventData.ideas.findIndex(i => i.id === req.params.iId);
  if (iIndex === -1) return res.status(404).json({ error: 'Idea not found' });

  eventData.ideas[iIndex] = {
    ...eventData.ideas[iIndex],
    ...req.body,
  };

  saveDatabase(db);
  res.json(eventData.ideas[iIndex]);
});

app.delete('/api/events/:id/ideas/:iId', (req: Request, res: Response) => {
  const eventData = db.events[req.params.id];
  if (!eventData) return res.status(404).json({ error: 'Event not found' });

  eventData.ideas = eventData.ideas.filter(i => i.id !== req.params.iId);
  saveDatabase(db);
  res.json({ success: true });
});

// ==========================================
// AI ENDPOINTS (using GoogleGenAI server-side)
// ==========================================

// 1. AI Wizard Plan Generator
app.post('/api/ai/generate-event-plan', async (req: Request, res: Response) => {
  try {
    const {
      type,
      name,
      date,
      time,
      city,
      guestCount,
      budget,
      currency,
      theme,
      colors,
      venuePreferences,
      culturalPreferences,
      foodPreferences,
      accessibility,
      priorities,
      notes,
    } = req.body;

    const prompt = `You are PlanMyEvent AI, a world-class master event architect and planner.
Generate a comprehensive, actionable event execution plan for the following event:
- Event Type: ${type}
- Event Name: ${name}
- Date: ${date} at ${time}
- City: ${city}
- Expected Guests: ${guestCount}
- Total Budget: ${currency} ${budget}
- Desired Theme & Style: ${theme}
- Color Palette: ${Array.isArray(colors) ? colors.join(', ') : colors}
- Venue Preferences: ${venuePreferences || 'Not specified'}
- Cultural Traditions: ${culturalPreferences || 'Standard celebration'}
- Food & Dietary Preferences: ${foodPreferences || 'Standard catering'}
- Accessibility Considerations: ${accessibility || 'None noted'}
- Key Priorities: ${Array.isArray(priorities) ? priorities.join(', ') : priorities}
- Additional Notes: ${notes || 'None'}

Return ONLY a valid JSON object matching this exact structure:
{
  "summary": "Concise executive overview of the event concept and strategy (2-3 sentences)",
  "categoryAllocations": [
    {
      "name": "Category name (e.g., Venue & Facilities, Catering & Drinks, Decor & Flowers, Photography, Entertainment, Attire & Styling, Invitations, Logistics, Contingency Reserve)",
      "percentage": 30,
      "estimatedAmount": 3000,
      "strategicRationale": "Why this allocation matches their priorities"
    }
  ],
  "timelineMilestones": [
    {
      "title": "Clear task title",
      "category": "Venue | Catering | Decor | Guests | Entertainment | Logistics",
      "daysBeforeEvent": 60,
      "priority": "urgent" | "high" | "medium" | "low",
      "description": "Practical steps and what to verify"
    }
  ],
  "vendorChecklist": [
    {
      "category": "venue | catering | photography | decor | entertainment | transport | coordinator",
      "role": "e.g., Lead Candid Photographer, Sound & Light Tech",
      "typicalCostRange": "e.g., $1,500 - $2,500",
      "keyQuestionsToAsk": ["Question 1", "Question 2"],
      "contractTips": "Important clause to look for"
    }
  ],
  "dayOfSchedule": [
    {
      "startTime": "e.g., 10:00 AM",
      "endTime": "e.g., 11:30 AM",
      "phase": "arrival_setup | guest_arrival | ceremony_opening | dining_reception | performances_speeches | photography | closing_teardown",
      "title": "Milestone activity",
      "notes": "Key deliverable and personnel"
    }
  ],
  "creativeConcepts": [
    {
      "category": "theme | decor | menu | games",
      "title": "Creative concept title",
      "description": "Rich aesthetic description",
      "materials": ["Material 1", "Material 2"],
      "budgetAlternative": "Clever way to do this for 30-50% less cost"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Plan Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate event plan', details: err.message });
  }
});

// 2. AI Planning Assistant Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, eventId, history } = req.body;
    let eventContext = '';

    if (eventId && db.events[eventId]) {
      const e = db.events[eventId];
      const totalSpent = e.expenses.reduce((s, x) => s + x.amount, 0);
      const completedTasks = e.tasks.filter(t => t.status === 'completed').length;
      const attendingGuests = e.guests.filter(g => g.rsvpStatus === 'attending').length;

      eventContext = `
ACTIVE EVENT CONTEXT:
Name: ${e.event.name}
Type: ${e.event.type}
Date: ${e.event.date} (${e.event.time})
City: ${e.event.city}
Total Budget: ${e.event.currency} ${e.event.totalBudget}
Current Total Spent: ${e.event.currency} ${totalSpent}
Guests: ${attendingGuests} attending / ${e.event.guestCount} target
Tasks: ${completedTasks}/${e.tasks.length} completed
Theme: ${e.event.theme}
Categories: ${e.categories.map(c => `${c.name} (Alloc: ${c.allocated}, Spent: ${c.spent})`).join(', ')}
`;
    }

    const systemPrompt = `You are PlanMyEvent AI's Senior Event Architect & Personal Planning Specialist.
Your tone is warm, refined, highly competent, proactive, and practical.
You specialize in budgeting, vendor negotiation, scheduling, cultural traditions, crisis aversion, and experiential design.

${eventContext}

Rules:
1. When answering, provide structured, clear recommendations.
2. If the user asks to reduce budget, propose concrete category reductions with minimal aesthetic compromise.
3. If the user asks for a timeline or run sheet, offer realistic time intervals.
4. If an action could be saved (like budget reallocations or adding tasks), offer a structured "actionProposal" in JSON if applicable, while keeping your main response readable in markdown.
5. Never hallucinate fake confirmation that an external vendor was booked unless recorded.`;

    const chatMessages = [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser request: ${message}` }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatMessages[0].parts[0].text,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'AI Assistant error', details: err.message });
  }
});

// 3. Creative Studio Generator
app.post('/api/ai/ideas', async (req: Request, res: Response) => {
  try {
    const { category, eventType, theme, budgetLevel, count } = req.body;

    const prompt = `Generate ${count || 3} distinctive, high-end, practical creative ideas for a ${eventType || 'celebration'} with theme "${theme || 'Modern Classic'}" and budget level "${budgetLevel || 'balanced'}".
Category to focus on: ${category || 'theme'}.

Return a JSON array of objects:
[
  {
    "category": "${category || 'theme'}",
    "title": "Evocative Title",
    "description": "Rich sensorial and experiential description (2-3 sentences)",
    "estimatedCost": "Realistic cost estimate with currency",
    "materials": ["Item 1", "Item 2", "Item 3"],
    "steps": ["Step 1", "Step 2", "Step 3"],
    "budgetAlternative": "Smart alternative that cuts cost by 40% while preserving aesthetic impact"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ ideas: parsed });
  } catch (err: any) {
    console.error('AI Ideas Error:', err);
    res.status(500).json({ error: 'Failed to generate ideas', details: err.message });
  }
});

// 4. Invitation & Message Wording Generator
app.post('/api/ai/invitation-wording', async (req: Request, res: Response) => {
  try {
    const { eventName, eventType, hostNames, date, time, venue, tone, medium } = req.body;

    const prompt = `Create personalized invitation copy and follow-up message for:
- Event: ${eventName} (${eventType})
- Hosts: ${hostNames || 'The Hosts'}
- Date & Time: ${date} at ${time}
- Venue: ${venue}
- Desired Tone: ${tone || 'Warm, elegant, celebratory'}
- Target Medium: ${medium || 'Formal Card + WhatsApp/SMS + Reminder'}

Return JSON:
{
  "formalCard": "Full formal written invitation text suitable for print/letterpress",
  "digitalMessage": "Refined WhatsApp/SMS invitation with emojis and clear RSVP link placeholder",
  "gentleReminder": "Polite, considerate RSVP deadline reminder message for pending guests",
  "dressCodeNote": "Elegant suggestion for dress code styling"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Wording Error:', err);
    res.status(500).json({ error: 'Failed to generate wording', details: err.message });
  }
});

// 5. Budget Optimizer
app.post('/api/ai/optimize-budget', async (req: Request, res: Response) => {
  try {
    const { eventId, targetSavingsPercentage } = req.body;
    const eventData = db.events[eventId];
    if (!eventData) return res.status(404).json({ error: 'Event not found' });

    const totalAllocated = eventData.categories.reduce((s, c) => s + c.allocated, 0);
    const totalSpent = eventData.expenses.reduce((s, e) => s + e.amount, 0);

    const prompt = `Analyze this event budget and provide an intelligent spending reduction strategy targeting a ${targetSavingsPercentage || 15}% savings without sacrificing the event's luxury and guest experience.

Event: ${eventData.event.name} (${eventData.event.type})
Guests: ${eventData.event.guestCount}
Total Budget: ${eventData.event.currency} ${eventData.event.totalBudget}
Current Category Allocations:
${JSON.stringify(eventData.categories.map(c => ({ name: c.name, allocated: c.allocated, spent: c.spent })), null, 2)}

Return JSON:
{
  "summary": "High-level optimization strategy",
  "projectedSavings": 1500,
  "categoryRecommendations": [
    {
      "categoryName": "Category name",
      "currentAllocated": 1000,
      "recommendedAllocated": 850,
      "savingsAmount": 150,
      "rationale": "Exact tactical negotiation or material substitute"
    }
  ],
  "topSavingsTactics": [
    "Specific tactic 1 (e.g., corkage negotiation, in-season floral substitution)",
    "Specific tactic 2",
    "Specific tactic 3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Budget Optimization Error:', err);
    res.status(500).json({ error: 'Failed to optimize budget', details: err.message });
  }
});

// Mount Vite or static server
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PlanMyEvent AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
