/**
 * EventEase AI – Demo Data & Seed Loader
 * Provides rich, realistic data for weddings, birthdays, and celebrations.
 */

const DEMO_EVENT = {
  id: 'demo_wedding_jaipur',
  name: "Priya & Arjun's Royal Wedding",
  type: 'Wedding',
  date: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    d.setDate(15);
    return d.toISOString().split('T')[0];
  })(),
  startTime: '10:00',
  endTime: '23:30',
  location: 'The Grand Heritage Palace, Jaipur, Rajasthan',
  venueType: 'Indoor & Outdoor Courtyard',
  guests: '250',
  adultsCount: '210',
  childrenCount: '40',
  vipCount: '25',
  budget: '1500000',
  currency: 'INR',
  flexibility: 'Flexible',
  theme: 'Royal Rajputana Grandeur & Modern Elegance',
  colorPalette: 'Crimson, Palace Gold, Saffron Sunset, Emerald',
  style: 'Formal',
  foodPreference: 'Royal Rajasthani Buffet with Live Stations',
  entertainment: 'Folk Dancers, Shehnai Orchestra, Evening DJ',
  specialRequirements: 'Grand Baraat procession with decorated horses, floral mandap, professional fireworks display, wheelchair access for grandparents, and dedicated kids activity tent.',
};

const DEMO_GUESTS = [
  { id: 'g1', name: 'Rajesh Sharma', category: 'Family', rsvp: 'Confirmed', diet: 'Vegetarian', phone: '+91 98765 43210', email: 'rajesh.sharma@example.com', plusOnes: 1, table: 'Table 1 - Grand Family', notes: 'Groom Uncle, needs ground floor seating' },
  { id: 'g2', name: 'Sunita Sharma', category: 'Family', rsvp: 'Confirmed', diet: 'Vegetarian', phone: '+91 98765 43211', email: 'sunita.s@example.com', plusOnes: 0, table: 'Table 1 - Grand Family', notes: 'Groom Aunt' },
  { id: 'g3', name: 'Vikramaditya Rathore', category: 'VIP', rsvp: 'Confirmed', diet: 'Non-Vegetarian', phone: '+91 98111 22334', email: 'v.rathore@heritage.org', plusOnes: 1, table: 'Table 2 - Dignitaries', notes: 'Chief Guest, arrival at 11 AM' },
  { id: 'g4', name: 'Ananya Mehra', category: 'Friends', rsvp: 'Confirmed', diet: 'Vegan', phone: '+91 99200 11223', email: 'ananya.m@designstudio.in', plusOnes: 1, table: 'Table 3 - College Buddies', notes: 'Maid of honor' },
  { id: 'g5', name: 'Kabir Singhania', category: 'Friends', rsvp: 'Confirmed', diet: 'Non-Vegetarian', phone: '+91 98300 44556', email: 'kabir.singhania@corp.com', plusOnes: 0, table: 'Table 3 - College Buddies', notes: 'Best man, giving speech at 8 PM' },
  { id: 'g6', name: 'Dr. Alok Verma', category: 'Colleagues', rsvp: 'Maybe', diet: 'Vegetarian', phone: '+91 97100 88990', email: 'dr.verma@cityhospital.com', plusOnes: 1, table: '', notes: 'Awaiting leave confirmation' },
  { id: 'g7', name: 'Pooja Kapoor', category: 'Friends', rsvp: 'Invited', diet: 'Gluten-Free', phone: '+91 98400 99887', email: 'pooja.k@techstart.io', plusOnes: 0, table: '', notes: 'Invited via WhatsApp' },
  { id: 'g8', name: 'Rohan Deshmukh', category: 'Colleagues', rsvp: 'Declined', diet: 'Non-Vegetarian', phone: '+91 98900 12345', email: 'rohan.d@fintech.co', plusOnes: 0, table: '', notes: 'Traveling abroad during wedding' },
  { id: 'g9', name: 'Meera & Sanjay Joshi', category: 'Family', rsvp: 'Confirmed', diet: 'Jain/Strict Veg', phone: '+91 98200 67890', email: 'sanjay.joshi@textiles.in', plusOnes: 2, table: 'Table 1 - Grand Family', notes: 'Special Jain food live counter requested' },
  { id: 'g10', name: 'Aarav (Kid)', category: 'Kids', rsvp: 'Confirmed', diet: 'Kids Menu', phone: '', email: '', plusOnes: 0, table: 'Table 4 - Kids Fun Zone', notes: 'Likes chicken nuggets and juice' },
];

const DEMO_VENDORS = [
  { id: 'v1', name: 'The Grand Heritage Palace Events', category: 'Venue', contact: 'Mahesh Sen (Manager)', phone: '+91 141 2678900', email: 'events@grandheritagepalace.in', quotedPrice: 480000, finalPrice: 450000, bookingStatus: 'Booked', paymentStatus: 'Deposit Paid', notes: 'Courtyard + banquet hall. Advance ₹1.5L paid. Balance due on event eve.' },
  { id: 'v2', name: 'Rajwada Royal Feast Caterers', category: 'Catering', contact: 'Chef Harish Rawat', phone: '+91 98290 11447', email: 'info@rajwadacaterers.com', quotedPrice: 400000, finalPrice: 380000, bookingStatus: 'Booked', paymentStatus: 'Deposit Paid', notes: '40 items buffet + 4 live stations (Dal Baati, Chaat, Desserts, Paan). Advance ₹1L paid.' },
  { id: 'v3', name: 'Drishti Cinematic Weddings', category: 'Photography', contact: 'Karan Malhotra', phone: '+91 99100 55443', email: 'karan@drishtistudios.in', quotedPrice: 170000, finalPrice: 150000, bookingStatus: 'Booked', paymentStatus: 'Deposit Paid', notes: '3 Photographers + 2 Videographers + 4K Drone footage + Pre-wedding shoot album.' },
  { id: 'v4', name: 'Gulab Floral Art & Mandap Decor', category: 'Decoration', contact: 'Sunil Saini', phone: '+91 94140 22331', email: 'gulabdecor@jaipurdecor.com', quotedPrice: 240000, finalPrice: 220000, bookingStatus: 'Booked', paymentStatus: 'Pending', notes: 'Marigold & tuberose cascading floral wall, royal red velvet draping, 200 brass lanterns.' },
  { id: 'v5', name: 'DJ Nikhil & The Heritage Troupe', category: 'Music and DJ', contact: 'Nikhil Roy', phone: '+91 98280 66778', email: 'djnikhil@soundsofrajasthan.com', quotedPrice: 90000, finalPrice: 80000, bookingStatus: 'Booked', paymentStatus: 'Fully Paid', notes: 'Includes afternoon Shehnai/Folk trio + evening Sangeet/Reception DJ with JBL line arrays.' },
  { id: 'v6', name: 'Rajputana Royal Shuttles', category: 'Transportation', contact: 'Dharmendra Singh', phone: '+91 97840 99882', email: 'info@rajputanashuttles.com', quotedPrice: 45000, finalPrice: 40000, bookingStatus: 'Shortlisted', paymentStatus: 'Pending', notes: '2 luxury AC mini-buses for guest airport pickups and palace shuttle.' },
  { id: 'v7', name: 'Bridal Glow by Sneha', category: 'Makeup', contact: 'Sneha Chawla', phone: '+91 99820 33441', email: 'sneha@bridalglamour.in', quotedPrice: 50000, finalPrice: 45000, bookingStatus: 'Booked', paymentStatus: 'Deposit Paid', notes: 'Bridal makeover (2 sessions) + 3 family member touch-ups.' },
];

const DEMO_EXPENSES = [
  { id: 'e1', title: 'Palace Venue Booking Advance', category: 'Venue', vendor: 'The Grand Heritage Palace', amount: 150000, status: 'Paid', date: '2026-10-15', notes: 'Cheque #402919' },
  { id: 'e2', title: 'Catering Tasting & Initial Deposit', category: 'Catering', vendor: 'Rajwada Royal Feast Caterers', amount: 100000, status: 'Paid', date: '2026-10-20', notes: 'UPI Transfer' },
  { id: 'e3', title: 'Photography & Drone Team Retainer', category: 'Photography', vendor: 'Drishti Cinematic Weddings', amount: 50000, status: 'Paid', date: '2026-10-25', notes: 'Online NetBanking' },
  { id: 'e4', title: 'DJ & Sound Gear Advance', category: 'Entertainment', vendor: 'DJ Nikhil', amount: 80000, status: 'Paid', date: '2026-10-28', notes: 'Full payment discounted by ₹10,000' },
  { id: 'e5', title: 'Bridal Makeup Advance', category: 'Miscellaneous', vendor: 'Bridal Glow by Sneha', amount: 20000, status: 'Paid', date: '2026-10-29', notes: 'Cash receipt #104' },
  { id: 'e6', title: 'Stage & Mandap Floral Advance', category: 'Decoration', vendor: 'Gulab Floral Art', amount: 75000, status: 'Pending', date: '2026-11-10', notes: 'Due upon 3D stage mock approval' },
  { id: 'e7', title: 'Designer Boxed Invitations Printing', category: 'Invitations', vendor: 'Heritage Prints Jaipur', amount: 42000, status: 'Paid', date: '2026-10-18', notes: '250 boxed physical cards' },
];

const DEMO_DAY_SCHEDULE = [
  { id: 's1', time: '08:00 AM', title: 'Vendor Access & Setup Begins', description: 'Florists, lighting technicians, sound engineers arrive at palace courtyard', completed: false, responsible: 'Sunil (Decorator)' },
  { id: 's2', time: '10:00 AM', title: 'Baraat Assembly at Royal Gate', description: 'Groom procession with decorated horse, traditional dhol troupe, and floral welcome', completed: false, responsible: 'Mahesh (Coordinator)' },
  { id: 's3', time: '11:30 AM', title: 'Varmala & Ring Exchange', description: 'Rose petal shower at the center marble fountain stage', completed: false, responsible: 'Karan (Photographer)' },
  { id: 's4', time: '01:00 PM', title: 'Royal Rajasthani Luncheon', description: 'Live Dal Baati Churma, chaat stalls, and seated royal dining hall opens', completed: false, responsible: 'Chef Harish' },
  { id: 's5', time: '04:30 PM', title: 'Traditional Pheras at Floral Mandap', description: 'Vedic rituals with live classical Shehnai accompaniment', completed: false, responsible: 'Panditji & Family' },
  { id: 's6', time: '07:30 PM', title: 'Evening Reception & Cocktail Soirée', description: 'Folk Kalbelia dance performance followed by cake cutting and speeches', completed: false, responsible: 'DJ Nikhil' },
  { id: 's7', time: '09:30 PM', title: 'Dinner Buffet & Dessert Stations', description: 'Live Ghevar and Malpua rabri counters, Paan station', completed: false, responsible: 'Chef Harish' },
  { id: 's8', time: '11:00 PM', title: 'Grand Fireworks Finale & Vidaai', description: 'Palace terrace fireworks display and sparkler sendoff tunnel', completed: false, responsible: 'Mahesh (Palace)' },
];

const DEMO_SEATING_TABLES = [
  { id: 'tbl_1', name: 'Table 1 - Grand Family', capacity: 10, assigned: ['Rajesh Sharma', 'Sunita Sharma', 'Meera Joshi', 'Sanjay Joshi'] },
  { id: 'tbl_2', name: 'Table 2 - Dignitaries & VIPs', capacity: 8, assigned: ['Vikramaditya Rathore', 'Mrs. Rathore'] },
  { id: 'tbl_3', name: 'Table 3 - College Buddies', capacity: 10, assigned: ['Ananya Mehra', 'Kabir Singhania'] },
  { id: 'tbl_4', name: 'Table 4 - Kids Fun Zone', capacity: 8, assigned: ['Aarav (Kid)'] },
  { id: 'tbl_5', name: 'Table 5 - Tech & Work Friends', capacity: 8, assigned: [] },
  { id: 'tbl_6', name: 'Table 6 - Extended Relatives', capacity: 10, assigned: [] },
];

const DEMO_INVITATION = {
  template: 'royal',
  hostNames: 'Mrs. Rekha & Mr. Ramesh Sharma',
  coupleNames: 'Priya & Arjun',
  eventTitle: 'Together with their families invite you to celebrate their Royal Wedding',
  dateText: 'Sunday, November 15, 2026',
  timeText: '10:00 AM onwards',
  venueName: 'The Grand Heritage Palace',
  venueAddress: 'Amer Road, Jaipur, Rajasthan 302002',
  rsvpDate: 'October 25, 2026',
  rsvpContact: '+91 98765 43210 (Mr. Sharma)',
  dressCode: 'Royal Traditional / Formal Festive Attire',
  primaryColor: '#8b0000',
  accentColor: '#d4af37',
  fontFamily: 'Playfair Display',
};

const FALLBACK_PLAN = {
  overview: {
    summary: "A magnificent Royal Rajasthani wedding blending timeless traditions with modern elegance, set in the grandeur of Jaipur's palace heritage. This 250-guest celebration promises to be a spectacular journey through Rajputana culture, vibrant colors, and unforgettable moments.",
    highlights: [
      "Stunning floral mandap with marigold, tuberose, and royal rose arrangements",
      "Live classical Rajasthani folk musicians and Shehnai troupe throughout the day",
      "Multi-course royal Rajasthani feast with 40+ dishes and 4 live cooking stations",
      "Spectacular midnight fireworks finale over the illuminated palace courtyard"
    ]
  },
  theme: {
    recommended: "Royal Rajasthani Grandeur",
    description: "Draw inspiration from Rajasthan's rich royal heritage with gold-embossed motifs, vibrant jewel tones, intricate mirror work, and traditional block print patterns. Balance opulence with contemporary touches for a wedding that feels both timeless and fresh.",
    colorPalette: ["#8B0000", "#FFD700", "#FF6B35", "#2C5F2E"],
    colorNames: ["Royal Crimson", "Palace Gold", "Saffron Sunset", "Garden Emerald"],
    moodBoard: ["Majestic palace arches", "Intricate rangoli patterns", "Shimmering ghungroo bells", "Antique brass lanterns", "Hand-painted pottery centerpieces"]
  },
  decorations: {
    mainConcept: "Transform the venue into a royal Rajasthani palace with cascading flower walls, elephant motifs, and lantern-lit pathways",
    items: [
      "Grand floral mandap with marigolds, roses, and jasmine strings",
      "Elephant-shaped topiaries at the grand entrance archway",
      "200+ hanging antique brass lanterns with warm flicker LED candles",
      "Intricate mirror work backdrop for the couple's reception stage",
      "Traditional block print fabric draping on heritage pillars",
      "Terracotta pot centerpieces with fresh fragrant blooms"
    ],
    floral: "Marigold garlands as primary decorative element, white tuberose for fragrance, red roses for romance. Create a 12-foot floral wall as the main photo backdrop.",
    lighting: "Warm golden fairy lights throughout, colored uplighting in royal crimson and gold, antique brass chandeliers, and candle votives on every table for magical ambiance.",
    tableSettings: "Copper thali with banana leaf motifs, engraved brass name cards, hand-embroidered table runners, and miniature clay diyas as favors."
  },
  catering: {
    style: "Royal Rajasthani Buffet with Live Stations",
    starter: ["Dal Baati Churma (signature live station)", "Mirchi Vada with mint chutney", "Pyaaz Kachori with tamarind sauce"],
    main: ["Laal Maas (slow-cooked mutton)", "Gatte ki Sabzi", "Ker Sangri", "Bajre ki Roti with pure desi ghee", "Rajasthani Kadhi", "Safed Maas (royal white curry)"],
    dessert: ["Ghevar with rabri and roasted pistachios", "Malpua with saffron cream", "Mohan Thaal (royal fudge)"],
    drinks: ["Rose Shikanji with sabja seeds", "Aam Panna", "Thandai with dry fruits", "Fresh coconut water station"],
    specialNote: "Set up a dedicated Paan station post-dinner with 15+ varieties. Live chefs at Dal Baati, Pyaaz Kachori, and dessert stations add high entertainment value."
  },
  entertainment: {
    mainAct: "Grand Baraat procession with decorated horse, dhol players, and fireworks",
    activities: [
      "Professional Rajasthani folk dancers (Kalbelia and Ghoomar)",
      "Live Shehnai music during the morning arrival and vidaai ceremony",
      "Interactive henna artist stations for guests",
      "Phoolon ki Holi flower shower moment after vows"
    ],
    music: "Hire a 12-piece folk orchestra for dinner. DJ for reception with curated Bollywood classics and current hits. Traditional dhol players for baraat and key ceremonies.",
    photography: "Book a team of 3 photographers + 2 videographers for full-day coverage. Include drone footage, pre-wedding shoot in palace gardens, and candid photographer.",
    specialMoments: ["Grand fireworks display at midnight", "Synchronized sparkler farewell tunnel for the couple", "Surprise flash mob by the groom's family during reception"]
  },
  guestManagement: {
    invitations: "Send boxed invitations in antique brass boxes with block-printed cards, saffron string, and a miniature marble elephant. Include digital RSVP QR code.",
    seating: "Arrange 25 round tables of 10. Create a head table on an elevated stage. Designate family zones and ensure elderly guests have shaded, accessible seating.",
    rsvp: "Use a combination of WhatsApp RSVP broadcasts and an online RSVP form. Set deadline 30 days before the event. Follow up with non-responders 2 weeks before.",
    welcomeGifts: "Handcrafted wooden photo frames with the couple's motif, a small clay lamp, and a packet of homemade Rajasthani sweets wrapped in block print cloth.",
    accessibility: "Ensure ramp access to all areas, reserved parking near entrances for elderly guests, and a quiet room for guests who need a break from the festivities."
  },
  personalizedTips: [
    "Book the palace venue at least 6 months in advance as Jaipur heritage venues fill up quickly, especially for winter season weddings.",
    "Hire a professional wedding coordinator specifically experienced with Rajasthani palace weddings to handle vendor coordination and day-of logistics.",
    "Create a separate budget allocation for the sangeet and mehendi ceremonies — these often exceed estimates when traditional performers and decor are involved.",
    "With 250 guests, pre-assign clear parking zones and arrange a shuttle service from the nearest hotel cluster to avoid congestion.",
    "For the fireworks, obtain all necessary permissions from the local municipality at least 45 days in advance to avoid last-minute complications."
  ]
};

const FALLBACK_BUDGET = {
  totalBudget: 1500000,
  categories: [
    { name: "Venue", amount: 450000, percentage: 30, color: "#8b5cf6", notes: "Palace rental, furniture, basic setup" },
    { name: "Catering", amount: 375000, percentage: 25, color: "#ec4899", notes: "250 guests × ₹1,500 per head, live stations" },
    { name: "Decoration", amount: 225000, percentage: 15, color: "#f59e0b", notes: "Florals, lighting, mandap, draping" },
    { name: "Photography", amount: 150000, percentage: 10, color: "#3b82f6", notes: "2-day coverage, drone, video editing" },
    { name: "Entertainment", amount: 120000, percentage: 8, color: "#10b981", notes: "Folk dancers, orchestra, DJ, fireworks" },
    { name: "Invitations", amount: 60000, percentage: 4, color: "#f43f5e", notes: "250 boxed invitations + digital" },
    { name: "Miscellaneous", amount: 120000, percentage: 8, color: "#6b7280", notes: "Contingency, transport, gifts, tips" }
  ],
  savingTips: [
    "Book venue during off-peak dates for 20–30% discount on palace venues",
    "Opt for seasonal flowers (marigold, tuberose) over imported roses to save ₹40,000+ on florals",
    "Negotiate a package deal combining catering and basic decor with the venue",
    "Use digital invitations for outstation guests — save ₹15,000 on courier charges"
  ],
  priorityAdvice: "For a royal wedding, allocate maximum to Venue and Catering as these create the strongest first impressions. Decoration is the visual signature — don't compromise here. Photography is permanent — these memories last a lifetime."
};

const FALLBACK_TIMELINE_TASKS = [
  { id: 't1', task: 'Book the Palace Venue', description: 'Confirm availability, sign contract, and pay deposit', category: 'Venue', priority: 'high', daysBeforeEvent: 120, completed: true },
  { id: 't2', task: 'Hire Wedding Coordinator', description: 'Hire an experienced Rajasthani wedding planner', category: 'Planning', priority: 'high', daysBeforeEvent: 110, completed: true },
  { id: 't3', task: 'Finalize Guest List', description: 'Confirm all 250 guests and collect contact details', category: 'Planning', priority: 'high', daysBeforeEvent: 100, completed: true },
  { id: 't4', task: 'Book Photography Team', description: 'Shortlist and finalize 3 photographers + 2 videographers', category: 'Photography', priority: 'high', daysBeforeEvent: 90, completed: true },
  { id: 't5', task: 'Send Wedding Invitations', description: 'Dispatch boxed invitations and digital RSVP links', category: 'Invitations', priority: 'high', daysBeforeEvent: 75, completed: false },
  { id: 't6', task: 'Book Catering Service', description: 'Finalize menu tasting, catering company, and live stations', category: 'Catering', priority: 'high', daysBeforeEvent: 70, completed: true },
  { id: 't7', task: 'Confirm Entertainment Performers', description: 'Book folk dancers, orchestra, and DJ', category: 'Entertainment', priority: 'medium', daysBeforeEvent: 60, completed: false },
  { id: 't8', task: 'Arrange Decoration Vendor', description: 'Finalize florals, lighting, mandap design, and draping', category: 'Decoration', priority: 'high', daysBeforeEvent: 55, completed: false },
  { id: 't9', task: 'Apply for Fireworks Permission', description: 'Submit application to local municipality for fireworks NOC', category: 'Planning', priority: 'high', daysBeforeEvent: 45, completed: false },
  { id: 't10', task: 'Collect Guest RSVPs', description: 'Follow up with all guests, finalize head count', category: 'Planning', priority: 'medium', daysBeforeEvent: 30, completed: false },
  { id: 't11', task: 'Final Venue Walkthrough', description: 'Visit venue with coordinator, decorator, and caterer', category: 'Venue', priority: 'medium', daysBeforeEvent: 21, completed: false },
  { id: 't12', task: 'Arrange Guest Transport', description: 'Confirm shuttle service and parking logistics', category: 'General', priority: 'medium', daysBeforeEvent: 14, completed: false },
  { id: 't13', task: 'Final Catering Confirmation', description: 'Confirm exact menu, quantities, and dietary requirements', category: 'Catering', priority: 'high', daysBeforeEvent: 7, completed: false },
  { id: 't14', task: 'Decoration Setup Begins', description: 'Vendors start 2-day setup at the venue', category: 'Decoration', priority: 'high', daysBeforeEvent: 2, completed: false },
  { id: 't15', task: 'Final Day Preparations', description: 'Final briefing with all vendors, timeline review, emergency kit', category: 'General', priority: 'high', daysBeforeEvent: 0, completed: false },
];

const FALLBACK_CHECKLIST = {
  categories: [
    {
      name: "Venue",
      icon: "building-2",
      color: "#8b5cf6",
      items: [
        { id: "v1", task: "Research and shortlist heritage venues", priority: "high", completed: true },
        { id: "v2", task: "Visit top 3 venues in Jaipur in person", priority: "high", completed: true },
        { id: "v3", task: "Compare venue packages and pricing", priority: "medium", completed: true },
        { id: "v4", task: "Sign venue contract and pay deposit", priority: "high", completed: true },
        { id: "v5", task: "Confirm setup and breakdown timings", priority: "medium", completed: false },
      ]
    },
    {
      name: "Catering",
      icon: "utensils",
      color: "#ec4899",
      items: [
        { id: "c1", task: "Schedule catering tasting sessions", priority: "high", completed: true },
        { id: "c2", task: "Finalize menu (starters, mains, desserts)", priority: "high", completed: true },
        { id: "c3", task: "Confirm dietary restrictions with guests", priority: "medium", completed: false },
        { id: "c4", task: "Book live dessert & paan counters", priority: "medium", completed: false },
        { id: "c5", task: "Arrange traditional copper tableware", priority: "low", completed: false },
      ]
    },
    {
      name: "Photography",
      icon: "camera",
      color: "#3b82f6",
      items: [
        { id: "ph1", task: "Review photographer portfolios", priority: "high", completed: true },
        { id: "ph2", task: "Book photographer and videographer", priority: "high", completed: true },
        { id: "ph3", task: "Plan shot list and key ceremonial moments", priority: "medium", completed: false },
        { id: "ph4", task: "Arrange drone footage permissions", priority: "medium", completed: false },
        { id: "ph5", task: "Confirm backup cameras and batteries", priority: "low", completed: false },
      ]
    },
    {
      name: "Decoration",
      icon: "sparkles",
      color: "#f59e0b",
      items: [
        { id: "d1", task: "Finalize royal theme and mood board", priority: "high", completed: true },
        { id: "d2", task: "Book floral decoration vendor", priority: "high", completed: true },
        { id: "d3", task: "Arrange warm golden lighting setup", priority: "medium", completed: false },
        { id: "d4", task: "Design circular marble mandap layout", priority: "high", completed: false },
        { id: "d5", task: "Order brass centerpiece urns", priority: "medium", completed: false },
      ]
    },
    {
      name: "Entertainment",
      icon: "music",
      color: "#10b981",
      items: [
        { id: "e1", task: "Book evening DJ and sound gear", priority: "high", completed: true },
        { id: "e2", task: "Arrange Kalbelia and Ghoomar folk dancers", priority: "medium", completed: false },
        { id: "e3", task: "Plan Shehnai music for rituals", priority: "medium", completed: false },
        { id: "e4", task: "Confirm fireworks display technician", priority: "high", completed: false },
      ]
    },
    {
      name: "Invitations",
      icon: "mail",
      color: "#f43f5e",
      items: [
        { id: "i1", task: "Finalize guest address list", priority: "high", completed: true },
        { id: "i2", task: "Print 250 boxed physical invitations", priority: "high", completed: true },
        { id: "i3", task: "Send digital WhatsApp invitations", priority: "high", completed: false },
        { id: "i4", task: "Track RSVPs in guest manager", priority: "medium", completed: false },
      ]
    }
  ]
};

// Seed function to populate demo data
function seedDemoCelebration() {
  const ev = Storage.saveEvent(DEMO_EVENT);
  Storage.savePlan(ev.id, FALLBACK_PLAN);
  Storage.saveBudget(ev.id, FALLBACK_BUDGET);
  Storage.saveTimeline(ev.id, { tasks: FALLBACK_TIMELINE_TASKS });
  Storage.saveChecklist(ev.id, FALLBACK_CHECKLIST);
  Storage.saveGuests(ev.id, DEMO_GUESTS);
  Storage.saveVendors(ev.id, DEMO_VENDORS);
  Storage.saveExpenses(ev.id, DEMO_EXPENSES);
  Storage.saveDaySchedule(ev.id, DEMO_DAY_SCHEDULE);
  Storage.saveSeatingTables(ev.id, DEMO_SEATING_TABLES);
  Storage.saveInvitation(ev.id, DEMO_INVITATION);

  // Seed sample initial notifications
  Storage.addNotification({
    title: 'RSVP Deadline Approaching',
    message: 'Wedding is in 3 months. 42 guests still have pending RSVPs.',
    type: 'warning',
    linkPage: 'guests',
  });
  Storage.addNotification({
    title: 'Vendor Balance Due',
    message: 'Gulab Floral Art has ₹1,45,000 balance payment pending.',
    type: 'info',
    linkPage: 'vendors',
  });
  Storage.addNotification({
    title: 'Welcome to EventEase AI',
    message: 'Priya & Arjun\'s Royal Wedding demo loaded successfully! Explore all tabs.',
    type: 'success',
    linkPage: 'dashboard',
  });

  return ev;
}
