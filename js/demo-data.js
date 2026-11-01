/**
 * EventEase AI – Demo Data & Fallback Data
 */

const DEMO_EVENT = {
  id: 'demo_' + Date.now(),
  name: "Priya & Arjun's Royal Wedding",
  type: 'Wedding',
  date: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4);
    return d.toISOString().split('T')[0];
  })(),
  location: 'The Grand Palace, Jaipur, Rajasthan',
  guests: '250',
  budget: '1500000',
  theme: 'Royal Rajasthani with Modern Elegance',
  cuisine: 'Mixed/Buffet',
  additionalReqs: 'Traditional baraat procession, mehendi and sangeet ceremonies, floral mandap, professional fireworks display, and live classical music during dinner.',
};

const FALLBACK_PLAN = {
  overview: {
    summary: "A magnificent Royal Rajasthani wedding blending timeless traditions with modern elegance, set in the grandeur of Jaipur's palace heritage. This 250-guest celebration promises to be a spectacular journey through Rajputana culture, vibrant colors, and unforgettable moments.",
    highlights: [
      "Stunning floral mandap with marigold and rose arrangements",
      "Live classical Rajasthani folk musicians throughout the evening",
      "Multi-course royal Rajasthani feast with 40+ dishes",
      "Professional fireworks finale over the palace courtyard"
    ]
  },
  theme: {
    recommended: "Royal Rajasthani Grandeur",
    description: "Draw inspiration from Rajasthan's rich royal heritage with gold-embossed invitations, vibrant jewel tones, intricate mirror work, and traditional block print patterns. Balance opulence with contemporary touches for a wedding that feels both timeless and fresh.",
    colorPalette: ["#8B0000", "#FFD700", "#FF6B35", "#2C5F2E"],
    colorNames: ["Royal Crimson", "Palace Gold", "Saffron Sunset", "Garden Emerald"],
    moodBoard: ["Majestic palace arches", "Intricate rangoli patterns", "Shimmering ghungroo bells", "Antique brass lanterns", "Hand-painted pottery centerpieces"]
  },
  decorations: {
    mainConcept: "Transform the venue into a royal Rajasthani palace with cascading flower walls, elephant motifs, and lantern-lit pathways",
    items: [
      "Grand floral mandap with marigolds, roses, and jasmine strings",
      "Elephant-shaped topiaries at the entrance",
      "200+ hanging brass lanterns with LED candles",
      "Intricate mirror work backdrop for the stage",
      "Traditional block print fabric draping on pillars",
      "Terracotta pot centerpieces with fresh flowers"
    ],
    floral: "Marigold garlands as primary decorative element, white tuberose for fragrance, red roses for romance. Create a 12-foot floral wall as the main photo backdrop.",
    lighting: "Warm golden fairy lights throughout, colored uplighting in royal crimson and gold, antique brass chandeliers, and candle votives on every table for magical ambiance.",
    tableSettings: "Copper thali with banana leaf motifs, engraved brass name cards, hand-embroidered table runners, and miniature clay diyas as favors."
  },
  catering: {
    style: "Royal Rajasthani Buffet with Live Stations",
    starter: ["Dal Baati Churma (signature dish)", "Mirchi Vada with mint chutney", "Pyaaz Kachori with tamarind sauce"],
    main: ["Laal Maas (slow-cooked mutton)", "Gatte ki Sabzi", "Ker Sangri", "Bajre ki Roti with ghee", "Rajasthani Kadhi", "Safed Maas (royal white curry)"],
    dessert: ["Ghevar with rabri and pistachios", "Malpua with saffron cream", "Mohan Thaal (royal fudge)"],
    drinks: ["Rose Shikanji with sabja", "Aam Panna", "Thandai (with and without bhang)", "Nimbu Paani station"],
    specialNote: "Set up a dedicated Paan station post-dinner with 15+ varieties. Live chefs at Dal Baati, Pyaaz Kachori, and dessert stations add entertainment value."
  },
  entertainment: {
    mainAct: "Grand Baraat procession with decorated horse, dhol players, and fireworks",
    activities: [
      "Professional Rajasthani folk dancers (Kalbelia and Ghoomar)",
      "Live Shehnai music during the vidaai ceremony",
      "Interactive henna artist stations for guests",
      "Phoolon ki Holi flower shower moment after vows"
    ],
    music: "Hire a 12-piece folk orchestra for dinner. DJ for reception with curated Bollywood classics and current hits. Traditional dhol players for baraat and key ceremonies.",
    photography: "Book a team of 3 photographers + 2 videographers for full-day coverage. Include drone footage, pre-wedding shoot in palace gardens, and a dedicated candid photographer for natural moments.",
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
    "Hire a professional 'wedding coordinator' specifically experienced with Rajasthani palace weddings to handle vendor coordination and day-of logistics.",
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
    "Book venue during off-peak months (May–June) for 20–30% discount on palace venues",
    "Opt for seasonal flowers (marigold, tuberose) over imported roses to save ₹40,000+ on florals",
    "Negotiate a package deal combining catering and basic decor with the venue",
    "Use digital invitations for outstation guests — save ₹15,000 on international courier"
  ],
  priorityAdvice: "For a royal wedding, allocate maximum to Venue and Catering as these create the strongest first impressions. Decoration is the visual signature — don't compromise here. Photography is permanent — these memories last a lifetime."
};

const FALLBACK_TIMELINE_TASKS = [
  { id: 't1', task: 'Book the Palace Venue', description: 'Confirm availability, sign contract, and pay deposit', category: 'Venue', priority: 'high', daysBeforeEvent: 120 },
  { id: 't2', task: 'Hire Wedding Coordinator', description: 'Hire an experienced Rajasthani wedding planner', category: 'Planning', priority: 'high', daysBeforeEvent: 110 },
  { id: 't3', task: 'Finalize Guest List', description: 'Confirm all 250 guests and collect contact details', category: 'Planning', priority: 'high', daysBeforeEvent: 100 },
  { id: 't4', task: 'Book Photography Team', description: 'Shortlist and finalize 3 photographers + 2 videographers', category: 'Photography', priority: 'high', daysBeforeEvent: 90 },
  { id: 't5', task: 'Send Wedding Invitations', description: 'Dispatch boxed invitations and digital RSVP links', category: 'Invitations', priority: 'high', daysBeforeEvent: 75 },
  { id: 't6', task: 'Book Catering Service', description: 'Finalize menu tasting, catering company, and live stations', category: 'Catering', priority: 'high', daysBeforeEvent: 70 },
  { id: 't7', task: 'Confirm Entertainment Performers', description: 'Book folk dancers, orchestra, and DJ', category: 'Entertainment', priority: 'medium', daysBeforeEvent: 60 },
  { id: 't8', task: 'Arrange Decoration Vendor', description: 'Finalize florals, lighting, mandap design, and draping', category: 'Decoration', priority: 'high', daysBeforeEvent: 55 },
  { id: 't9', task: 'Apply for Fireworks Permission', description: 'Submit application to local municipality for fireworks NOC', category: 'Planning', priority: 'high', daysBeforeEvent: 45 },
  { id: 't10', task: 'Collect Guest RSVPs', description: 'Follow up with all guests, finalize head count', category: 'Planning', priority: 'medium', daysBeforeEvent: 30 },
  { id: 't11', task: 'Final Venue Walkthrough', description: 'Visit venue with coordinator, decorator, and caterer', category: 'Venue', priority: 'medium', daysBeforeEvent: 21 },
  { id: 't12', task: 'Arrange Guest Transport', description: 'Confirm shuttle service and parking logistics', category: 'General', priority: 'medium', daysBeforeEvent: 14 },
  { id: 't13', task: 'Final Catering Confirmation', description: 'Confirm exact menu, quantities, and dietary requirements', category: 'Catering', priority: 'high', daysBeforeEvent: 7 },
  { id: 't14', task: 'Decoration Setup Begins', description: 'Vendors start 2-day setup at the venue', category: 'Decoration', priority: 'high', daysBeforeEvent: 2 },
  { id: 't15', task: 'Final Day Preparations', description: 'Final briefing with all vendors, timeline review, emergency kit', category: 'General', priority: 'high', daysBeforeEvent: 0 },
];

const FALLBACK_CHECKLIST = {
  categories: [
    {
      name: "Venue",
      icon: "building-2",
      color: "#8b5cf6",
      items: [
        { id: "v1", task: "Research and shortlist venues", priority: "high" },
        { id: "v2", task: "Visit top 3 venues in person", priority: "high" },
        { id: "v3", task: "Compare venue packages and pricing", priority: "medium" },
        { id: "v4", task: "Sign venue contract and pay deposit", priority: "high" },
        { id: "v5", task: "Confirm setup and breakdown timings", priority: "medium" },
      ]
    },
    {
      name: "Catering",
      icon: "utensils",
      color: "#ec4899",
      items: [
        { id: "c1", task: "Schedule catering tasting sessions", priority: "high" },
        { id: "c2", task: "Finalize menu (starters, mains, desserts)", priority: "high" },
        { id: "c3", task: "Confirm dietary restrictions with guests", priority: "medium" },
        { id: "c4", task: "Book bar and beverage service", priority: "medium" },
        { id: "c5", task: "Arrange cake or dessert table", priority: "low" },
      ]
    },
    {
      name: "Photography",
      icon: "camera",
      color: "#3b82f6",
      items: [
        { id: "ph1", task: "Review photographer portfolios", priority: "high" },
        { id: "ph2", task: "Book photographer and videographer", priority: "high" },
        { id: "ph3", task: "Plan shot list and key moments", priority: "medium" },
        { id: "ph4", task: "Arrange drone footage (check permissions)", priority: "medium" },
        { id: "ph5", task: "Confirm equipment and backup plans", priority: "low" },
      ]
    },
    {
      name: "Decoration",
      icon: "sparkles",
      color: "#f59e0b",
      items: [
        { id: "d1", task: "Finalize decoration theme and mood board", priority: "high" },
        { id: "d2", task: "Book floral decoration vendor", priority: "high" },
        { id: "d3", task: "Arrange lighting setup", priority: "medium" },
        { id: "d4", task: "Design stage/mandap layout", priority: "high" },
        { id: "d5", task: "Order table centerpieces", priority: "medium" },
        { id: "d6", task: "Arrange entrance decoration", priority: "low" },
      ]
    },
    {
      name: "Entertainment",
      icon: "music",
      color: "#10b981",
      items: [
        { id: "e1", task: "Book DJ / Live Band", priority: "high" },
        { id: "e2", task: "Arrange cultural performers", priority: "medium" },
        { id: "e3", task: "Plan games and activities schedule", priority: "medium" },
        { id: "e4", task: "Organize surprise performance or flash mob", priority: "low" },
        { id: "e5", task: "Confirm sound and AV equipment", priority: "high" },
      ]
    },
    {
      name: "Transportation",
      icon: "car",
      color: "#06b6d4",
      items: [
        { id: "tr1", task: "Arrange guest shuttle service", priority: "medium" },
        { id: "tr2", task: "Book decorated horse/car for couple", priority: "high" },
        { id: "tr3", task: "Confirm parking arrangements", priority: "medium" },
        { id: "tr4", task: "Arrange late-night transport options", priority: "low" },
      ]
    },
    {
      name: "Invitations",
      icon: "mail",
      color: "#f43f5e",
      items: [
        { id: "i1", task: "Finalize guest list and addresses", priority: "high" },
        { id: "i2", task: "Design and order wedding invitations", priority: "high" },
        { id: "i3", task: "Send invitations (6–8 weeks before)", priority: "high" },
        { id: "i4", task: "Set up online RSVP / WhatsApp group", priority: "medium" },
        { id: "i5", task: "Follow up with non-responders", priority: "medium" },
      ]
    }
  ]
};

const FALLBACK_THEMES = {
  themes: [
    {
      name: "Enchanted Garden Gala",
      emoji: "🌿",
      tagline: "Where nature meets romance",
      description: "Transform your venue into a lush secret garden with cascading greenery, fairy lights woven through foliage, and whimsical floral installations. This theme brings an organic, intimate feel that enchants every guest.",
      colorPalette: ["#2D5016", "#89B35C", "#F4E1D2", "#C9A96E"],
      colorNames: ["Forest Green", "Sage Mist", "Blush Cream", "Golden Wheat"],
      decorationIdeas: ["Arched greenery tunnels at entrance", "Hanging terrariums as centerpieces", "Moss-covered table runners", "Edison bulb canopy overhead"],
      foodIdeas: ["Herb-infused cocktail station", "Botanical dessert garden with flower-shaped cakes", "Live chaat station under a floral canopy"],
      activities: ["Flower crown DIY station", "Pressed flower bookmark favors", "Garden scavenger hunt for kids"],
      uniqueExperience: "Release 100 white doves or eco-friendly floating lanterns as the couple makes their grand exit under a moonlit garden canopy."
    },
    {
      name: "Midnight Celestial Soirée",
      emoji: "✨",
      tagline: "Dance under a thousand stars",
      description: "A dramatic, luxurious celebration under a canopy of stars and celestial elements. Deep midnight blues, silvers, and golds create a theatrical atmosphere that feels truly otherworldly and unforgettable.",
      colorPalette: ["#0F0C2D", "#4A3F8F", "#C0C0C0", "#FFD700"],
      colorNames: ["Midnight Navy", "Cosmic Purple", "Starlight Silver", "Celestial Gold"],
      decorationIdeas: ["3D star map ceiling installation", "Glowing moon arch for couple's entry", "Constellation table name cards", "Mirrored disco ball centerpieces"],
      foodIdeas: ["Galaxy-themed dessert table with geode cakes", "Star-shaped appetizer platters", "Blue and purple cocktails with edible glitter"],
      activities: ["Telescope stargazing corner", "Astrology reading booth for guests", "Glow-in-dark dance floor"],
      uniqueExperience: "Commission a custom star map of the night sky on the couple's first date, printed large and displayed as the centerpiece artwork of the reception hall."
    },
    {
      name: "Heritage Haveli Celebration",
      emoji: "🏯",
      tagline: "Timeless traditions, modern hearts",
      description: "Celebrate your love story within the richness of Indian architectural heritage. Ornate jharokhas, handloom textiles, antique brass, and artisan crafts come together to create a celebration that honors roots while embracing joy.",
      colorPalette: ["#8B1A1A", "#D4AF37", "#F0E6CC", "#1B4332"],
      colorNames: ["Heritage Red", "Heirloom Gold", "Ivory Silk", "Emerald Leaf"],
      decorationIdeas: ["Vintage wooden jharokha frames as photo backdrops", "Hand-stitched kantha fabric tablecloths", "Brass urli vessels filled with flowers and diyas", "Traditional clay pot installations at entrance"],
      foodIdeas: ["Live tawa roti station with 8 varieties of dal", "Regional specialty corners (Rajasthani, Bengali, South Indian)", "Earthen pot dessert presentation"],
      activities: ["Traditional craft workshop (pottery, block printing)", "Mehendi and turban tying corner", "Cultural storytelling by a local artist"],
      uniqueExperience: "Commission a local master artisan to create a live madhubani or pattachitra painting of the couple during the reception, presented as a keepsake at the end of the night."
    }
  ]
};

