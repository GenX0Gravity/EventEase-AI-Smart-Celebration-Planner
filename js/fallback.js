/**
 * EventEase AI – Smart Planning Mode (Intelligent Rule-Based Fallback)
 * Runs entirely in-browser without any AI model.
 * Produces dynamic, personalised plans based on event properties.
 * Clearly labelled as "Smart Planning Mode" — never masquerades as real AI output.
 */

const SmartPlanner = {

  // ═══════════════════════════════════════════════════════════════════
  // CONFIG TABLES
  // ═══════════════════════════════════════════════════════════════════

  _typeConfig: {
    Wedding: {
      overview: (e) => `A beautiful ${e.theme || "elegant"} wedding celebration for ${e.name}, bringing together ${e.guests} guests to witness a joyful union at ${e.location}. The event is thoughtfully planned to balance tradition, personal style, and memorable moments within a ₹${Number(e.budget).toLocaleString("en-IN")} budget.`,
      highlights: [
        "Grand entrance with floral archway",
        "Multi-course wedding feast with live counters",
        "Live music, sangeet performances and dance floor",
        "Personalised wedding favours for every guest"
      ],
      theme: {
        name: "Classic Romance & Heritage",
        palette: ["#8B0000", "#FFD700", "#FF6B35", "#2C5F2E"],
        names: ["Royal Crimson", "Palace Gold", "Saffron Sunset", "Garden Emerald"]
      },
      decorItems: [
        "Floral mandap / wedding arch with fresh seasonal blooms",
        "Fairy-light canopy over the reception and dining area",
        "Centrepiece floral arrangements on every guest table",
        "Draped fabric backdrop for the couple's stage",
        "Aisle petal decoration with rose and marigold petals",
        "Hanging brass lanterns and warm tea-light votives"
      ],
      cateringStyle: "Plated + Live Stations Buffet",
      starters: ["Crispy vegetable samosas with mint and tamarind chutney", "Paneer tikka skewers with pickled onions", "Warm soup shots with garlic crostini"],
      mains: ["Paneer butter masala / Chicken tikka masala", "Dal makhani slow-cooked with ghee tempering", "Fragrant jeera rice and assorted butter naan", "Seasonal mixed vegetable sabzi"],
      desserts: ["Warm gulab jamun with vanilla ice cream", "Assorted traditional mithai platter", "Custom 3-tier wedding cake"],
      drinks: ["Welcome mocktail station with fresh fruit blends", "Traditional thandai and rose sharbat", "Fresh lime water and soft beverages"],
      music: "Live shehnai / instrumental for rituals, acoustic band for sangeet, and high-energy DJ for reception.",
      mainAct: "Choreographed couple's first dance followed by family sangeet performances and baraat procession",
      activities: [
        "Photo booth with traditional and modern wedding props",
        "Live mehendi artist stations for guests",
        "Memory jar where guests write blessings and advice",
        "Synchronized sparkler or flower petal shower send-off"
      ],
      specMoments: [
        "Vow exchange with personalised couple vows",
        "Surprise flash-mob by close friends and cousins",
        "Champagne / sparkling juice toast with family speeches"
      ],
      invitations: "Boxed physical invitations with foil embossing sent 6–8 weeks before, complemented by digital RSVP QR cards.",
      seating: "Round banquet tables of 8–10 with designated family zones. Elevated stage seating for the couple.",
      welcomeGifts: "Handcrafted wedding favour boxes with artisanal sweets, fragrant candles, and a personalised thank-you note.",
      tips: [
        "Book venue and catering at least 5–6 months in advance — popular venues fill quickly during wedding season.",
        "Schedule a final food tasting 4–6 weeks before the wedding and confirm dietary restrictions.",
        "Hire a day-of coordinator to manage vendor arrivals, timelines, and logistics.",
        "Create a minute-by-minute runsheet and share it with all vendors 1 week before the event.",
        "Keep a 5–10% contingency buffer reserved for last-minute vendor tips and extras."
      ],
    },
    Birthday: {
      overview: (e) => `A vibrant ${e.theme || "fun-filled"} birthday celebration for ${e.name}, gathering ${e.guests} guests for an unforgettable party at ${e.location}. With a ₹${Number(e.budget).toLocaleString("en-IN")} budget, every detail is crafted to celebrate another fantastic year in style.`,
      highlights: [
        "Grand birthday cake reveal and sparkler countdown",
        "Themed photo wall and personalised milestone backdrop",
        "Curated party games and live DJ playlist",
        "Surprise tribute video and guest toasts"
      ],
      theme: {
        name: "Vibrant Fiesta & Glow",
        palette: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF"],
        names: ["Party Red", "Sunshine Yellow", "Celebration Green", "Sky Blue"]
      },
      decorItems: [
        "Organic balloon garland arch at the main entrance",
        "Custom neon sign with the birthday person's name",
        "Photo memory line highlighting milestones through the years",
        "Confetti table runners and balloon clusters on tables",
        "Backdrop photo booth with fun party accessories",
        "Hanging fairy lights and celebratory paper lanterns"
      ],
      cateringStyle: "Relaxed Party Buffet + Live Food Counters",
      starters: ["Mini sliders and gourmet finger sandwiches", "Live chaat / pani puri counter", "Loaded nachos with salsa and cheese dips"],
      mains: ["Pasta station with choice of Alfredo and Arrabiata sauces", "Wood-fired style pizzas or authentic biryani bowls", "Stir-fry noodles with crispy spring rolls"],
      desserts: ["Showstopper customised designer birthday cake", "Dessert bar with cake pops, brownies, and macarons", "Ice cream sundae station with assorted toppings"],
      drinks: ["Signature mocktail bar with citrus and berry punches", "Fresh lemonade and iced tea bar", "Smoothies and shakes for younger guests"],
      music: "High-energy DJ with a playlist mixing personal favourites, throwback hits, and trending dance tracks.",
      mainAct: "Cake-cutting countdown with confetti cannons and a surprise tribute video",
      activities: [
        "Trivia quiz all about the birthday person's life and quirks",
        "Instant Polaroid photo guestbook station",
        "Musical chairs, dance-offs, or interactive party challenges",
        "Karaoke corner with popular singalongs"
      ],
      specMoments: [
        "Midnight / prime-time balloon drop or confetti blast",
        "Emotional video montage compiled from friends and family worldwide",
        "Toast and speech by best friends or close family members"
      ],
      invitations: "Dynamic digital video invitations sent via WhatsApp 3–4 weeks in advance with an instant RSVP link.",
      seating: "Casual lounge pods mixed with high-top cocktail tables to encourage mingling and dancing.",
      welcomeGifts: "Curated favour bags with customised keychains, gourmet cookies, and personalised thank-you tags.",
      tips: [
        "Book your DJ or entertainment at least 4–6 weeks ahead to lock in preferred set times.",
        "Coordinate cake design and delivery 3 weeks early — custom bakeries need sufficient notice.",
        "Organise a surprise element early (group video, flash song) so guests have time to prepare.",
        "Assign a dedicated friend or photographer to capture candid reactions throughout the night.",
        "Prepare an indoor contingency layout if planning an outdoor or terrace gathering."
      ],
    },
    Anniversary: {
      overview: (e) => `An intimate and romantic ${e.theme || "elegant"} anniversary celebration for ${e.name}, shared with ${e.guests} cherished guests at ${e.location}. A thoughtfully curated evening with a ₹${Number(e.budget).toLocaleString("en-IN")} budget, honoring love and creating lasting memories.`,
      highlights: [
        "Romantic candlelit ambience with soft live acoustic music",
        "Heartfelt vow renewal ceremony or anniversary toast",
        "Curated visual journey of the couple's years together",
        "Gourmet multi-course dining experience"
      ],
      theme: {
        name: "Timeless Golden Romance",
        palette: ["#8B0000", "#FFD700", "#FFF5E4", "#2C3E50"],
        names: ["Deep Crimson", "Anniversary Gold", "Ivory Silk", "Midnight Navy"]
      },
      decorItems: [
        "Candlelit tables with tall glass votives and red roses",
        "\"Our Journey\" gallery wall featuring photos across the years",
        "Rose petal pathway leading to the couple's feature table",
        "Fairy-light curtains cascading behind the stage",
        "Floral archway framed in warm golden uplighting",
        "Personalised anniversary banner and custom menus"
      ],
      cateringStyle: "Plated Fine Dining & Wine / Mocktail Pairing",
      starters: ["Velvety wild mushroom soup with herb croutons", "Caprese salad with buffalo mozzarella and balsamic drizzle", "Bruschetta with roasted cherry tomatoes and basil"],
      mains: ["Herb-crusted paneer steak / Pan-seared sea bass", "Wild mushroom and truffle risotto", "Roasted seasonal root vegetables with herb butter"],
      desserts: ["Warm Belgian chocolate fondant with vanilla bean gelato", "Custom anniversary celebration cake", "Artisan petit fours and dark chocolate truffles"],
      drinks: ["Sparkling grape juice or champagne toast flutes", "Signature his-and-hers mocktails or cocktails", "Infused water and artisanal coffees"],
      music: "Live acoustic guitar, violinist, or pianist playing romantic classics and the couple's special songs.",
      mainAct: "Couple's anniversary dance to their original wedding song followed by toasts",
      activities: [
        "Love letter table where guests write private notes for future anniversaries",
        "Couple's trivia game hosted by close friends or family",
        "Vintage photo booth with classic black-and-white printouts"
      ],
      specMoments: [
        "Heartfelt speech by the couple reminiscing on their shared journey",
        "Surprise video message reel from out-of-town loved ones",
        "Sparkler circle or candle-lighting ceremony"
      ],
      invitations: "Elegant printed invitations on textured cotton paper with gold foil accents, dispatched 4 weeks prior.",
      seating: "Intimate round tables of 6–8 with comfortable upholstered chairs and soft table linens.",
      welcomeGifts: "Custom silver or gold engraved bookmarks, scented candles, or miniature photo frames.",
      tips: [
        "Select songs that were popular or meaningful during the couple's courtship years.",
        "Gather archival photos from siblings and friends early to build a rich milestone gallery.",
        "Prioritise a serene venue with good acoustic quality so speeches can be heard effortlessly.",
        "Keep the guest list focused on loved ones who have shared in the couple's story.",
        "Confirm with the venue that candle flames or sparklers are permitted well ahead of time."
      ],
    },
    "Community Event": {
      overview: (e) => `A vibrant, inclusive community gathering for ${e.guests} attendees at ${e.location}. Planned within a ₹${Number(e.budget).toLocaleString("en-IN")} budget, this celebration brings people together through culture, shared meals, interactive games, and community spirit.`,
      highlights: [
        "Welcoming open-air festival atmosphere for all ages",
        "Cultural performances and local talent showcases",
        "Community food stalls and live refreshment counters",
        "Interactive games, sports, and raffle drawings"
      ],
      theme: {
        name: "Community Harmony & Unity",
        palette: ["#FF6B35", "#004E89", "#1A936F", "#F8F4E3"],
        names: ["Energetic Orange", "Community Blue", "Nature Green", "Warm Cream"]
      },
      decorItems: [
        "Vibrant welcome arch and overhead fabric bunting",
        "Themed activity zone signs and directional placards",
        "Community notice and achievements display board",
        "Fairy lights strung across trees and canopy areas",
        "Eco-friendly paper lanterns and recycled material accents",
        "Photo booth wall celebrating local history and neighborhood pride"
      ],
      cateringStyle: "Food Stalls & Refreshment Stations",
      starters: ["Live chaat, samosa, and spring roll counters", "Steaming momos with spicy chutney", "Popcorn and cotton candy carts for kids"],
      mains: ["Fragrant vegetable and chicken biryani with raita", "Fresh tawa rotis with rich dal tadka and sabzi", "Noodles and fried rice live wok counter"],
      desserts: ["Live jalebi with rabri counter", "Traditional kulfi and ice cream sticks", "Warm gulab jamun cups"],
      drinks: ["Chilled shikanji, nimbu pani, and jaljeera stalls", "Kulhad masala chai and filter coffee counters", "Fresh sugarcane and fruit juice station"],
      music: "PA sound system with curated festive folk, instrumental tunes, and live performances by neighborhood talent.",
      mainAct: "Cultural talent showcase featuring dance, music, community recognition awards, and raffle draw",
      activities: [
        "Tug-of-war, sack races, and family fun games",
        "Kids art, pottery, and face painting corner",
        "Eco-friendly plant exchange or workshop",
        "Community talent open-mic segment"
      ],
      specMoments: [
        "Neighborhood champion or volunteer felicitation ceremony",
        "Grand raffle prize giveaway with local business sponsors",
        "Mass community group photograph from an elevated vantage"
      ],
      invitations: "Bilingual printed flyers, community WhatsApp announcements, and posters at local bulletin points.",
      seating: "Tiered seating for performances, folding chairs, and open picnic benches in dining zones.",
      welcomeGifts: "Reusable cotton tote bags with community badge pins and event programme booklets.",
      tips: [
        "Secure necessary local permissions, police NOC, and sound permits at least 4 weeks in advance.",
        "Form volunteer committees dedicated to traffic, waste management, first aid, and registrations.",
        "Ensure clear waste segregation bins (wet/dry/recycle) are stationed every 15 metres.",
        "Set up an information desk and first-aid kiosk staffed throughout the entire event.",
        "Plan backup power generators for lighting and PA systems in case of electrical outages."
      ],
    },
    "Corporate Event": {
      overview: (e) => `A sophisticated corporate event for ${e.guests} attendees at ${e.location}, engineered to achieve business objectives, foster team cohesion, and deliver an engaging experience within a ₹${Number(e.budget).toLocaleString("en-IN")} budget.`,
      highlights: [
        "Seamless audiovisual presentations and keynote delivery",
        "Structured networking sessions and collaborative activities",
        "Gourmet business buffet catering with wide dietary options",
        "Leadership recognition and milestone celebrations"
      ],
      theme: {
        name: "Corporate Excellence & Innovation",
        palette: ["#1E3A5F", "#C9A84C", "#F0F0F0", "#2ECC71"],
        names: ["Corporate Navy", "Gold Accent", "Clean White", "Success Green"]
      },
      decorItems: [
        "Branded stage backdrop with LED video wall integration",
        "Step-and-repeat media wall at the entry foyer",
        "Sleek minimalist table centrepieces aligned with brand colours",
        "Clear directional digital signage and agenda display boards",
        "Comfortable executive lounge furniture in networking zones",
        "Professional stage lighting and podium setup"
      ],
      cateringStyle: "Executive Continental Buffet + Continuous High Tea",
      starters: ["Gourmet canapés and artisanal bruschetta", "Smoked paneer skewers and chicken satay with peanut dip", "Seasonal salad bar with assorted vinaigrettes"],
      mains: ["Grilled fish / Paneer steak with garlic herb glaze", "Penne arrabiata and creamy risotto", "Dal makhani, fragrant basmati pilaf, and assorted breads"],
      desserts: ["Assorted French pastries, tartlets, and mousse cups", "Fresh cut exotic fruit platters", "Branded corporate celebration cake"],
      drinks: ["Continuous bean-to-cup espresso and herbal tea stations", "Fruit-infused detox water jars throughout the venue", "Evening mocktail and networking beverage station"],
      music: "Ambient lounge and lo-fi background beats during mingling; walk-up stings and fanfare for award presentations.",
      mainAct: "Keynote address by leadership followed by annual achievement awards and strategic vision reveal",
      activities: [
        "Interactive live polling and Q&A via mobile app",
        "Speed networking rounds with gamified prompts",
        "Collaborative innovation challenge or hackathon pitch"
      ],
      specMoments: [
        "Excellence awards ceremony with custom glass trophies",
        "Dramatic product or corporate rebrand reveal with lighting cues",
        "Official company wide group photograph"
      ],
      invitations: "Calendar invitations with embedded registration links, dietary preference collection, and detailed agendas.",
      seating: "Cabaret-style round tables of 6–8 ensuring clear sightlines to the stage, plus an open networking lounge.",
      welcomeGifts: "Premium branded welcome kits: matte notebook, metal pen, wireless charging pad or insulated tumbler.",
      tips: [
        "Schedule a complete AV, microphone, and slide presentation dry run 2 hours prior to guest arrival.",
        "Ensure high-speed dedicated Wi-Fi credentials are prominently displayed on tables.",
        "Keep keynote speeches under 20 minutes each to maintain peak audience engagement.",
        "Include 15-minute buffer breaks between intense presentation blocks for networking.",
        "Deploy a digital feedback survey accessible via QR code immediately following the closing remarks."
      ],
    },
    "Baby Shower": {
      overview: (e) => `A warm and joyful ${e.theme || "pastel-themed"} baby shower for ${e.name}, celebrating with ${e.guests} loving guests at ${e.location}. A sweet event within a ₹${Number(e.budget).toLocaleString("en-IN")} budget, filled with games, love, and memorable blessings for the new arrival.`,
      highlights: [
        "Adorable pastel balloon arches and floral photo installations",
        "Engaging baby shower games with custom prizes",
        "High-tea dessert buffet with custom baby-themed treats",
        "Heartfelt blessings and advice station for the parents-to-be"
      ],
      theme: {
        name: "Sweet Dreams & Soft Pastels",
        palette: ["#FFD6E7", "#C8F0E8", "#FFF3CD", "#E3D5F0"],
        names: ["Blush Pink", "Mint Green", "Butter Yellow", "Soft Lavender"]
      },
      decorItems: [
        "Multi-pastel balloon cloud arch with teddy bear accents",
        "Custom floral chair / throne for the mother-to-be",
        "Wish tree where guests hang handwritten blessing cards",
        "Nappy cake and gift table with fairy lights",
        "Dessert table decorated with baby bunting and plush toys",
        "Welcome easel sign with personalised baby shower message"
      ],
      cateringStyle: "High-Tea & Gourmet Finger Food Buffet",
      starters: ["Delicate cucumber, mint, and cream cheese sandwiches", "Mini spinach and corn tartlets", "Fruit skewers with honey-yogurt dip"],
      mains: ["Mini paneer and vegetable sliders", "Creamy penne with sun-dried tomatoes", "Crispy vegetable spring rolls with sweet chilli sauce"],
      desserts: ["Designer baby shower cake with custom topper", "Pastel macarons, cake pops, and decorated sugar cookies", "Mini fruit tarts and chocolate mousse shooters"],
      drinks: ["Sparkling non-alcoholic fruit sangria punch bowl", "Fresh pink lemonade and iced berry tea", "Selection of hot teas and decaf coffees"],
      music: "Soft acoustic pop covers, gentle indie folk, and heartwarming melodies played at ambient conversation volume.",
      mainAct: "Gift unboxing and gender reveal (if applicable) with cheerful celebration confetti",
      activities: [
        "Guess the baby's birth date, weight, and name game",
        "Decorate a plain baby onesie with fabric markers",
        "Baby trivia and \"Don't Say Baby\" clothespin game",
        "Advice and wishes jar for the baby's 18th birthday"
      ],
      specMoments: [
        "Mother-to-be's speech and thank-you toast to family",
        "Mother's blessing / traditional ceremony with close relatives",
        "Group photo featuring all guests wearing theme colours"
      ],
      invitations: "Cute pastel digital invitations with animated elements, gift registry link, and RSVP form.",
      seating: "Comfortable plush seating for the mother-to-be with cozy lounge armchairs and garden tea tables for guests.",
      welcomeGifts: "Sweet favor bags containing bath salts, mini scented candles, gourmet honey jars, or iced cookies.",
      tips: [
        "Schedule the shower between week 28 and 34 of pregnancy when mom is energized and comfortable.",
        "Keep the total duration between 2 to 3 hours so the mother-to-be does not become overly fatigued.",
        "Designate a reliable friend to write down each gift and giver during unboxing for easy thank-you cards.",
        "Ensure all food and mocktails are 100% pregnancy-safe (pasteurised cheeses, zero alcohol).",
        "Reserve the most comfortable, well-cushioned seat in the venue for the mom-to-be."
      ],
    },
    Graduation: {
      overview: (e) => `A proud and festive ${e.theme || "celebratory"} graduation party for ${e.name}, sharing this milestone with ${e.guests} family and friends at ${e.location}. A joyful event within a ₹${Number(e.budget).toLocaleString("en-IN")} budget, honoring years of dedication and cheering on future adventures.`,
      highlights: [
        "Celebratory graduation cap and banner decor",
        "Milestone photo wall spanning academic journey from day one",
        "DJ, music, and upbeat celebratory atmosphere",
        "Inspirational toasts and advice from mentors and family"
      ],
      theme: {
        name: "Golden Milestone & Future Horizons",
        palette: ["#1A1A2E", "#E94560", "#FFD700", "#F5F5F5"],
        names: ["Academic Navy", "Achievement Red", "Gold Medal", "Clean White"]
      },
      decorItems: [
        "Graduation cap and diploma balloon garland in black, gold, and white",
        "\"Then & Now\" photo collage showing kindergarten to university days",
        "Giant marquee numbers spelling the graduation year",
        "Table centrepieces featuring mortarboards and golden stars",
        "Photo booth with oversized diploma, cap props, and graduation stoles",
        "Signature memory poster where all guests sign congratulations"
      ],
      cateringStyle: "Festive Buffet & Finger Food Stations",
      starters: ["Assorted mini sliders, tacos, and spring rolls", "Crispy paneer fingers and spicy chicken wings", "Loaded cheesy nachos with guacamole and salsa"],
      mains: ["Rich dum biryani bowls with burani raita", "Pasta live station with assorted pastas and toppings", "Grilled skewers with garlic naan and dips"],
      desserts: ["Graduation-themed custom cake topped with a edible mortarboard", "Cupcake tower with graduation year flags", "Ice cream sundae bar with colourful sprinkles"],
      drinks: ["Sparkling apple cider and fruit punch bowls", "Mocktails named after academic subjects / career milestones", "Chilled sodas and cold brew coffee station"],
      music: "Upbeat party playlist blending current chart hits, feel-good anthems, and celebratory classics for dancing.",
      mainAct: "Graduate's toast followed by parent speeches and the ceremonial cap-toss photo moment",
      activities: [
        "\"Words of Wisdom\" jar where guests leave career and life tips",
        "Fun trivia quiz testing how well guests know the graduate",
        "Polaroid guestbook where photos are stuck beside handwritten notes",
        "Cap decorating contest or photo challenge"
      ],
      specMoments: [
        "Synchronized indoor cap toss with confetti cannons",
        "Surprise compilation video of congratulations from distant friends",
        "Heartfelt toast by parents or mentors celebrating achievements"
      ],
      invitations: "Sleek cardstock invitations with gold foil accents and digital RSVP via WhatsApp/email.",
      seating: "Dynamic mix of bar-height tables, lounge seating, and dining areas to keep energy high and flowing.",
      welcomeGifts: "Customised commemorative bookmarks, mini metal compass keepsakes, or personalised chocolates.",
      tips: [
        "Host the party within 1 to 2 weeks of the official graduation ceremony while excitement is peak.",
        "Set up an area to display diplomas, medals, thesis books, or academic projects.",
        "If multiple friends are graduating, consider co-hosting to combine budgets for a larger venue.",
        "Prepare a playlist of motivational and celebratory songs for when the graduate arrives.",
        "Keep a guestbook near the entrance so nobody leaves without writing a message."
      ],
    },
  },

  // Budget allocation percentages by event type
  _budgetWeights: {
    Wedding:          { Venue: 30, Catering: 28, Decoration: 15, Photography: 12, Entertainment: 7,  Invitations: 3, Miscellaneous: 5  },
    Birthday:         { Venue: 20, Catering: 30, Decoration: 15, Photography: 10, Entertainment: 15, Invitations: 3, Miscellaneous: 7  },
    Anniversary:      { Venue: 25, Catering: 30, Decoration: 12, Photography: 12, Entertainment: 10, Invitations: 4, Miscellaneous: 7  },
    "Community Event":{ Venue: 20, Catering: 35, Decoration: 10, Photography: 5,  Entertainment: 18, Invitations: 5, Miscellaneous: 7  },
    "Corporate Event":{ Venue: 30, Catering: 25, Decoration: 8,  Photography: 7,  Entertainment: 12, Invitations: 8, Miscellaneous: 10 },
    "Baby Shower":    { Venue: 15, Catering: 28, Decoration: 20, Photography: 12, Entertainment: 8,  Invitations: 7, Miscellaneous: 10 },
    Graduation:       { Venue: 20, Catering: 32, Decoration: 13, Photography: 12, Entertainment: 10, Invitations: 5, Miscellaneous: 8  },
    _default:         { Venue: 25, Catering: 28, Decoration: 14, Photography: 12, Entertainment: 10, Invitations: 4, Miscellaneous: 7  },
  },

  _budgetColors: {
    Venue: "#8b5cf6",
    Catering: "#ec4899",
    Decoration: "#f59e0b",
    Photography: "#3b82f6",
    Entertainment: "#10b981",
    Invitations: "#f43f5e",
    Miscellaneous: "#6b7280",
  },

  _budgetNotes: {
    Venue: "Rental fee, basic lighting, furniture, security, and cleaning",
    Catering: "Appetizers, main courses, desserts, beverages, servers, and crockery",
    Decoration: "Florals, stage design, table centrepieces, atmospheric lighting, and signage",
    Photography: "Photographer, videographer, candid coverage, and edited digital gallery",
    Entertainment: "DJ, live performers, sound system, party games, and event host",
    Invitations: "Physical printing, foil detailing, digital RSVP setup, and postage",
    Miscellaneous: "Emergency contingency buffer, transport, gratuities, and unforeseen extras",
  },

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════

  generateEventPlan(event) {
    const cfg = this._typeConfig[event.type] || this._typeConfig.Wedding;
    const budget = Number(event.budget);
    const guests = Number(event.guests);
    const budgetLabel = budget < 100000 ? "smart budget" : budget < 500000 ? "mid-tier balanced" : "premium grand";
    const guestLabel = guests < 40 ? "intimate" : guests < 120 ? "mid-sized" : "large-scale";

    const themeChoice = event.theme ? {
      recommended: event.theme,
      description: `The customized "${event.theme}" concept is tailored specifically for ${event.name}. All visual and experiential elements — from ambient lighting to florals and table settings — are aligned to bring this aesthetic to life while staying within the allocated budget.`,
      colorPalette: cfg.theme.palette,
      colorNames: cfg.theme.names,
      moodBoard: [
        "Curated details reflecting your custom theme",
        "Harmonious color palette carried from invites to table decor",
        "Photo-worthy focal points and welcoming entranceway",
        "Personalized storytelling touches celebrating the honorees",
        "Cozy ambient lighting enhancing every photograph"
      ],
    } : {
      recommended: cfg.theme.name,
      description: `The "${cfg.theme.name}" concept provides a timeless, visually stunning backdrop for a ${guestLabel} ${event.type.toLowerCase()}. The color palette balances warmth and sophistication to photograph brilliantly under all lighting conditions.`,
      colorPalette: cfg.theme.palette,
      colorNames: cfg.theme.names,
      moodBoard: [
        "Rich floral arrangements in complementary tones",
        "Warm ambient fairy lights and accent uplighting",
        "Cohesive graphic identity across stationery and signs",
        "Interactive display areas for guest engagement",
        "Thoughtful centrepieces designed for comfortable cross-table conversation"
      ],
    };

    return {
      _source: "smart",
      overview: {
        summary: typeof cfg.overview === "function" ? cfg.overview(event) : cfg.overview,
        highlights: cfg.highlights,
      },
      theme: themeChoice,
      decorations: {
        mainConcept: `${event.theme || cfg.theme.name} layout designed for a ${guestLabel} venue setting with ${budgetLabel} optimization.`,
        items: cfg.decorItems,
        floral: `Locally sourced fresh seasonal blooms that mirror the color palette. For a ${guestLabel} event, investing in 2–3 bold statement installations creates much greater impact than spreading thin across minor accents.`,
        lighting: budget < 150000
          ? "Warm LED string lights, uplights against key walls, and battery-operated candle votives on tables to create rich ambiance at minimal cost."
          : "Professional warm uplighting package, fairy-light canopy or chandeliers over the main area, and soft spotlights focused on the stage and cake table.",
        tableSettings: `High-quality tablecloths with runners in theme hues, elegant glassware, printed menu cards, and bespoke centrepieces suited for ${guestLabel} dining tables.`,
      },
      catering: {
        style: cfg.cateringStyle + (event.cuisine && event.cuisine !== "Any cuisine" ? ` · ${event.cuisine} specialties` : ""),
        starter: cfg.starters,
        main: cfg.mains,
        dessert: cfg.desserts,
        drinks: cfg.drinks,
        specialNote: event.additionalReqs
          ? `Special notes incorporated: "${event.additionalReqs.slice(0, 140)}". Reconfirm specifics with caterers during final tasting.`
          : `We recommend preparing food for approximately ${Math.round(guests * 1.1)} portions to comfortably absorb last-minute attendee additions.`,
      },
      entertainment: {
        mainAct: cfg.mainAct,
        activities: cfg.activities,
        music: cfg.music,
        photography: budget < 120000
          ? "Single experienced photographer for 5–6 hours covering key rituals, portraits, and candid celebrations, supplemented by digital guest uploads."
          : "Dedicated team with 1 primary photographer for portraits and key events, 1 second shooter for candid guest reactions, plus edited video highlights.",
        specialMoments: cfg.specMoments,
      },
      guestManagement: {
        invitations: cfg.invitations,
        seating: cfg.seating,
        rsvp: "Set the RSVP deadline 3 weeks prior to the date. Use a shared WhatsApp announcement or digital form to easily update the final head count for the caterer.",
        welcomeGifts: cfg.welcomeGifts,
        accessibility: "Ensure ramp or level access to all prime areas, reserve front-row cushioned seating for elderly family members, and keep music volume moderate in dining sections.",
      },
      personalizedTips: cfg.tips,
    };
  },

  generateBudgetBreakdown(event) {
    const total = Number(event.budget);
    const weights = this._budgetWeights[event.type] || this._budgetWeights._default;
    const cats = Object.entries(weights);
    let remaining = total;
    const categories = [];

    cats.forEach(([name, pct], i) => {
      const isLast = i === cats.length - 1;
      const amount = isLast ? remaining : Math.round((pct / 100) * total);
      remaining -= isLast ? 0 : amount;
      categories.push({
        name,
        amount: isLast ? remaining + amount : amount,
        percentage: pct,
        color: this._budgetColors[name] || "#6b7280",
        notes: this._budgetNotes[name] || "",
      });
    });

    // Ensure sum equals exact total
    const sum = categories.reduce((s, c) => s + c.amount, 0);
    const diff = total - sum;
    if (diff !== 0 && categories.length > 0) {
      categories[categories.length - 1].amount += diff;
    }

    return {
      _source: "smart",
      totalBudget: total,
      categories,
      savingTips: this._budgetTips(event.type, total),
      priorityAdvice: this._priorityAdvice(event.type, total, Number(event.guests)),
    };
  },

  generateEventTimeline(event) {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

    const milestones = [
      [Math.min(120, daysUntil - 1), "Book the Venue", "Compare top options, sign contract, and secure deposit", "Venue", "high"],
      [Math.min(105, daysUntil - 2), "Finalize Guest List", "Confirm head count and compile contact details", "Planning", "high"],
      [Math.min(90, daysUntil - 3), "Book Photographer & Videographer", "Review portfolios, lock package, and confirm shot list", "Photography", "high"],
      [Math.min(75, daysUntil - 4), "Book Catering & Schedule Tasting", "Sample menus, discuss dietary options, and finalize service style", "Catering", "high"],
      [Math.min(60, daysUntil - 5), "Send Invitations & Launch RSVP", "Dispatch printed or digital invites with clear response deadline", "Invitations", "high"],
      [Math.min(50, daysUntil - 6), "Confirm Decoration & Florals", "Finalize theme colors, stage backdrop, and floral arrangements", "Decoration", "high"],
      [Math.min(40, daysUntil - 7), "Book Music & Entertainment", "Confirm DJ, live band, MC, or performers and curate playlists", "Entertainment", "medium"],
      [Math.min(30, daysUntil - 8), "Review RSVPs & Chase Non-Responders", "Follow up with guests who have not responded to lock numbers", "Planning", "medium"],
      [Math.min(21, daysUntil - 9), "Venue Walkthrough with Vendors", "Coordinate layout, power points, delivery doors, and timings", "Venue", "medium"],
      [Math.min(14, daysUntil - 10), "Arrange Transportation & Parking", "Confirm guest shuttle, couple vehicle, and parking attendants", "General", "medium"],
      [Math.min(7, daysUntil - 11), "Finalize Catering Headcount", "Submit exact dietary breakdown and table assignments", "Catering", "high"],
      [Math.min(3, daysUntil - 12), "Confirm Setup Schedule with Vendors", "Ensure all vendors have the runsheet and delivery access", "Planning", "high"],
      [Math.min(1, daysUntil - 13), "Prepare Emergency Kit & Personal Prep", "Gather safety pins, tape, phone chargers, speaker notes, and cash tips", "General", "high"],
      [0, "Event Day Execution & Celebration", "Coordinate morning deliveries, relax, and celebrate!", "General", "high"],
    ];

    const tasks = milestones
      .filter(([days]) => days >= 0 || daysUntil <= 0)
      .map(([days, task, desc, cat, priority], i) => {
        const due = new Date(eventDate);
        due.setDate(due.getDate() - Math.max(0, days));
        return {
          id: `sp_task_${i + 1}`,
          task,
          description: desc,
          category: cat,
          priority,
          dueDate: due.toISOString().split("T")[0],
          daysBeforeEvent: days,
        };
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return { _source: "smart", tasks };
  },

  generateChecklist(event) {
    const isWedding = event.type === "Wedding";
    const isBirthday = event.type === "Birthday";
    const isCorporate = event.type === "Corporate Event";

    const categories = [
      {
        name: "Venue",
        icon: "building-2",
        color: "#8b5cf6",
        items: [
          { id: "v_1", task: "Schedule in-person venue visits and compare contracts", priority: "high" },
          { id: "v_2", task: "Confirm setup and teardown access hours with manager", priority: "high" },
          { id: "v_3", task: "Verify audio-visual power outlets and generator backup", priority: "medium" },
          { id: "v_4", task: "Check parking capacity and handicap accessibility", priority: "medium" },
          { id: "v_5", task: "Review cancellation policies and pay holding deposit", priority: "high" },
        ],
      },
      {
        name: "Catering",
        icon: "utensils",
        color: "#ec4899",
        items: [
          { id: "c_1", task: "Schedule menu tasting session with preferred caterer", priority: "high" },
          { id: "c_2", task: "Confirm menu items across appetizers, mains, and desserts", priority: "high" },
          { id: "c_3", task: "Collect dietary preferences (vegan, gluten-free, allergies)", priority: "medium" },
          { id: "c_4", task: "Confirm staffing ratio (servers, bartenders, busboys)", priority: "medium" },
          { id: "c_5", task: "Order celebration cake and confirm safe delivery slot", priority: "high" },
        ],
      },
      {
        name: "Photography",
        icon: "camera",
        color: "#3b82f6",
        items: [
          { id: "p_1", task: "Review full event portfolios of top 2 photographers", priority: "high" },
          { id: "p_2", task: "Sign contract specifying hours of coverage and deliverables", priority: "high" },
          { id: "p_3", task: "Prepare a prioritized \"must-have\" shot list and key family portraits", priority: "medium" },
          { id: "p_4", task: "Confirm videographer / drone permissions if applicable", priority: "low" },
        ],
      },
      {
        name: "Decoration",
        icon: "sparkles",
        color: "#f59e0b",
        items: [
          { id: "d_1", task: `Design moodboard for ${event.theme || event.type + " theme"}`, priority: "high" },
          { id: "d_2", task: "Book floral vendor for entrance arch and stage backdrop", priority: "high" },
          { id: "d_3", task: "Order table centrepieces, runners, and name cards", priority: "medium" },
          { id: "d_4", task: "Confirm ambient uplighting and fairy-light installation", priority: "medium" },
          { id: "d_5", task: "Set up photobooth wall and interactive props area", priority: "low" },
        ],
      },
      {
        name: "Entertainment",
        icon: "music",
        color: "#10b981",
        items: [
          { id: "e_1", task: isCorporate ? "Book keynote speaker and event host / MC" : "Book DJ or live band and discuss sound setup", priority: "high" },
          { id: "e_2", task: "Curate \"must-play\" and \"do-not-play\" song lists", priority: "medium" },
          { id: "e_3", task: isBirthday ? "Plan party games and surprise birthday activities" : "Schedule timeline of toasts, performances, and dances", priority: "medium" },
          { id: "e_4", task: "Test microphones and PA sound system 2 hours prior", priority: "high" },
        ],
      },
      {
        name: "Transportation",
        icon: "car",
        color: "#06b6d4",
        items: [
          { id: "t_1", task: isWedding ? "Book decorated bridal vehicle and driver" : "Arrange guest transport / shuttle if venue is remote", priority: "medium" },
          { id: "t_2", task: "Designate parking zones and hire valet attendants if needed", priority: "medium" },
          { id: "t_3", task: "Share Google Maps location pin and parking directions with all guests", priority: "high" },
        ],
      },
      {
        name: "Invitations",
        icon: "mail",
        color: "#f43f5e",
        items: [
          { id: "i_1", task: "Finalize invitation wording, date, venue, and dress code", priority: "high" },
          { id: "i_2", task: "Send out digital cards or mail physical invitation boxes", priority: "high" },
          { id: "i_3", task: "Track RSVPs in a centralized spreadsheet / app", priority: "medium" },
          { id: "i_4", task: "Send reminder messages to unconfirmed guests 10 days before", priority: "medium" },
        ],
      },
    ];

    return {
      _source: "smart",
      categories: categories.map((cat) => ({
        ...cat,
        items: cat.items.map((it) => ({ ...it, completed: false })),
      })),
    };
  },

  generateThemeIdeas(options) {
    const style = options.style || "Any";

    const allThemes = {
      "Royal & Luxurious": [
        {
          name: "Regal Palace Splendor",
          emoji: "👑",
          tagline: "Where timeless opulence meets modern celebration",
          desc: "Rich jewel tones, gold-leaf accents, velvet drapery, and grand candelabras transform your venue into a royal court that enchants every guest.",
          palette: ["#8B0000", "#FFD700", "#2C1654", "#FFFFFF"],
          pNames: ["Royal Crimson", "Palace Gold", "Imperial Purple", "Pearl White"],
          decor: ["Gold candelabra centrepieces with cascading roses", "Velvet table runners and embroidered chair accents", "Life-size floral arches framing the main walkway", "Crystal chandeliers with warm amber lighting"],
          food: ["Saffron-infused royal biryani with silver vark", "Slow-cooked shahi curries in ornate brass vessels", "Artisanal gold-dusted pistachio desserts"],
          acts: ["Live classical string quartet or shehnai maestro", "Royal throne photo pavilion for guests", "Wax-sealed custom gift favour boxes"],
          exp: "A live portrait painter creates an oil-style portrait of the honorees during dinner, unveiled at the conclusion.",
        },
        {
          name: "Maharaja's Heritage Court",
          emoji: "🏯",
          tagline: "A majestic journey through royal heritage",
          desc: "Intricate mirror work, traditional brass urli bowls with floating flowers, and rich marigold garlands evoke the beauty of classic royal palaces.",
          palette: ["#E8A600", "#8B1A1A", "#2E8B57", "#FFF8DC"],
          pNames: ["Marigold Gold", "Heritage Red", "Emerald Canopy", "Ivory Silk"],
          decor: ["Marigold and tuberose floral canopies", "Antique brass lanterns lining entry pathways", "Carved wooden jharokha photo backdrops", "Traditional block-print drapery"],
          food: ["Live Rajasthani dal baati churma station", "Authentic kachori with mint and tamarind dips", "Warm ghevar with saffron rabri dessert counter"],
          acts: ["Folk dance and cultural performance", "Live mehendi and turban-tying for guests", "Traditional dhol players for grand entry moments"],
          exp: "A master artisan demonstrates miniature painting live, offering personalized initialed cards to each guest.",
        },
      ],
      "Boho & Rustic": [
        {
          name: "Wildflower Meadow & Macramé",
          emoji: "🌻",
          tagline: "Effortlessly organic, naturally heartfelt",
          desc: "Loose wildflower arrangements, macramé ceremony backdrops, reclaimed timber details, and warm Edison bulbs create a laid-back, romantic haven.",
          palette: ["#D4A853", "#8B7355", "#6B8C6B", "#F5ECD7"],
          pNames: ["Golden Wheat", "Bark Brown", "Sage Green", "Linen Cream"],
          decor: ["Handwoven macramé backdrop with eucalyptus runners", "Wildflower arrangements in varied amber glass bottles", "Exposed wood table numbers and chalkboard signs", "Warm exposed-filament Edison bulb canopy"],
          food: ["Artisanal grazing boards with cheeses, breads, and seasonal fruits", "Build-your-own gourmet bruschetta station", "Rustic semi-naked sponge cake decorated with fresh berries"],
          acts: ["Acoustic indie folk guitar duo", "DIY flower crown and boutonnière craft station", "Polaroid photo clothesline for instant guest memories"],
          exp: "Guests write heartfelt notes rolled into miniature glass bottles to be opened by the host on future milestone anniversaries.",
        },
      ],
      "Modern & Minimalist": [
        {
          name: "Monochrome & Geometric Elegance",
          emoji: "◻️",
          tagline: "Less is more. Sophistication in every detail.",
          desc: "Monochromatic palette, crisp geometric floral installations, neon typography, and sleek modern lines create a gallery-like atmosphere.",
          palette: ["#1A1A1A", "#FFFFFF", "#C5B358", "#E8E8E8"],
          pNames: ["Onyx Black", "Pure White", "Champagne Gold", "Soft Slate"],
          decor: ["Single-stem calla lily centrepieces in tall clear glass", "Geometric brass terrarium installations with tea lights", "Custom white neon script sign with the event motto", "Monochrome modern photobooth with instant digital air-drop"],
          food: ["Deconstructed small-plate tasting menu", "Molecular gastronomy dessert elements with dry-ice presentation", "Color-blocked minimalist macarons tower"],
          acts: ["Contemporary ambient electronic/DJ set", "Digital tablet guestbook station with audio voice notes", "Interactive LED dancefloor display"],
          exp: "A minimalist live sketch artist creates rapid fashion-style digital illustrations of guests sent directly to their phones.",
        },
      ],
      "Garden & Floral": [
        {
          name: "Enchanted Secret Garden",
          emoji: "🌺",
          tagline: "Bloom where you celebrate",
          desc: "Abundant cascading greenery, fragrant garden roses, fairy lights woven through foliage, and pastel furnishings conjure an ethereal paradise.",
          palette: ["#2D5016", "#89B35C", "#F4E1D2", "#C9A96E"],
          pNames: ["Forest Green", "Sage Mist", "Blush Petal", "Golden Wheat"],
          decor: ["Greenery tunnel arch with hanging wisteria at the entrance", "Hanging floral cloud installation above the central area", "Birdcage centrepieces filled with moss and tea roses", "Living flower photo wall with personalized monogram"],
          food: ["Botanical-infused mocktail bar with lavender and rosemary", "Afternoon tea tiers with delicate cucumber and berry sandwiches", "Floral-glazed mini cupcakes and edible blossom tarts"],
          acts: ["Harpist or acoustic violinist playing contemporary hits", "Pressed flower bookmark making station", "Gentle acoustic singalong around illuminated trees"],
          exp: "A \"Living Bouquet Bar\" where guests choose their favorite stems from an artisan flower cart to take home as fresh favors.",
        },
      ],
      "Vintage & Classic": [
        {
          name: "Great Gatsby Glamour",
          emoji: "🕰️",
          tagline: "The roaring twenties, reimagined in sparkle",
          desc: "Dramatic black and gold geometric patterns, ostrich feather centrepieces, sparkling crystal glassware, and jazz create a lavish golden era soirée.",
          palette: ["#0A0A0A", "#CFB53B", "#FFFFFF", "#8B0000"],
          pNames: ["Midnight Black", "Art Deco Gold", "Crystal White", "Venetian Wine"],
          decor: ["Tall ostrich feather centrepieces in trumpet vases", "Geometric gold foil Art Deco table runners", "Champagne coupe glass tower centerpiece", "Black velvet lounge sofas with sequined cushions"],
          food: ["Silver tray-passed gourmet canapés and blinis", "Vintage cocktail and mocktail bar with copper shakers", "Multi-tiered chocolate fondue fountain with dipping bites"],
          acts: ["Live 5-piece swing and jazz band with a brass section", "Vintage photo studio with fedoras, feather boas, and monocles", "Charleston dance performance to open the dancefloor"],
          exp: "A classic 1920s vintage automobile parked at the arrival portico serves as the ultimate guest photo station.",
        },
      ],
      "Tropical & Vibrant": [
        {
          name: "Tropical Sunset Oasis",
          emoji: "🌴",
          tagline: "Feel the warm island breeze wherever you are",
          desc: "Vibrant monsteras, bird-of-paradise blooms, rattan furniture, and sunset hues bring exuberant tropical energy and beach vibes to your celebration.",
          palette: ["#FF6B35", "#00B4D8", "#2DC653", "#FFD166"],
          pNames: ["Hibiscus Orange", "Ocean Cyan", "Palm Leaf", "Mango Sun"],
          decor: ["Oversized monstera and palm fan installations", "Fresh pineapple floral arrangements on rustic wooden tables", "Rattan hanging pendant lights with warm bulbs", "Tiki-inspired welcome lounge with bamboo accents"],
          food: ["Fresh coconut water served straight from carved coconuts", "Live BBQ skewer and grilled pineapple station", "Tropical fruit carpaccio with passion fruit coulis"],
          acts: ["Steel drum percussionist or upbeat ukulele duo", "Limbo contest and tropical party games", "Glow-in-the-dark floral lei giveaway"],
          exp: "A custom frozen mocktail bar with shaved ice, fresh mango pulp, passion fruit, and edible hibiscus flowers.",
        },
      ],
      "Fairy Tale": [
        {
          name: "Celestial Starlight Fantasy",
          emoji: "✨",
          tagline: "A celebration written in the stars",
          desc: "Deep midnight blues, cosmic purples, golden celestial charts, and hundreds of twinkle lights build a dreamy, starry-night wonderland.",
          palette: ["#0F0C2D", "#4A3F8F", "#C0C0C0", "#FFD700"],
          pNames: ["Midnight Navy", "Cosmic Violet", "Starlight Silver", "Celestial Gold"],
          decor: ["Fairy-light ceiling canopy resembling the night sky", "Crescent moon photo arch adorned with white lilies", "Constellation-themed table place cards", "Suspended golden stars with LED micro lights"],
          food: ["Galaxy-glazed mirror cakes and sparkling cupcakes", "Midnight-blue mocktail with edible shimmering glitter", "Star-shaped canapés and gourmet cheese platters"],
          acts: ["Telescope viewing station with amateur astronomer guide", "Astrology and fun tarot reading lounge for guests", "Ambient handpan or crystal bowl music during dinner"],
          exp: "Custom star chart posters depicting the exact alignment of stars on the honoree's special date, printed as keepsakes.",
        },
      ],
    };

    let poolKeys = Object.keys(allThemes);
    if (style !== "Any" && allThemes[style]) {
      poolKeys = [style, ...poolKeys.filter((k) => k !== style)];
    }

    const selected = [];
    for (const key of poolKeys) {
      for (const t of allThemes[key]) {
        if (selected.length < 3) selected.push(t);
        else break;
      }
      if (selected.length >= 3) break;
    }

    const themes = selected.map((t) => ({
      name: t.name,
      emoji: t.emoji,
      tagline: t.tagline,
      description: t.desc,
      colorPalette: t.palette,
      colorNames: t.pNames,
      decorationIdeas: t.decor,
      foodIdeas: t.food,
      activities: t.acts,
      uniqueExperience: t.exp,
    }));

    return { _source: "smart", themes };
  },

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════

  _budgetTips(type, budget) {
    const tips = {
      Wedding: [
        "Bundle venue and in-house catering to negotiate 10–15% package discounts compared to standalone bookings.",
        "Emphasize seasonal and local flowers (marigolds, tuberose, local roses) to slash floral costs by up to 35%.",
        "Consider a cocktail-style appetizer hour before seated dinner to reduce heavy seated course quantities.",
        `Digital wedding cards and WhatsApp broadcast save ₹${Math.round(budget * 0.03).toLocaleString("en-IN")} on printing and postage.`,
      ],
      Birthday: [
        "Opt for Friday evening or Sunday afternoon slots which are often 20–30% cheaper than Saturday peak rates.",
        "A customized display cake for cutting paired with a sheet cake served from the kitchen saves up to 40% on bakery bills.",
        "Use custom playlists paired with a quality sound system instead of hiring a full-day DJ for smaller parties.",
        "Focus decoration spending on a single high-impact photo backdrop rather than scattering small balloons everywhere.",
      ],
      Anniversary: [
        "A private dining alcove in an upscale restaurant often avoids high hall rental fees for intimate guest counts.",
        "Abundant candles, warm fairy lights, and projected photo loops create unmatched romance on a modest budget.",
        "Ask guests to bring framed memories instead of gifts to create a sentimental centerpiece wall for free.",
        "Curate a tightly edited 3-course menu featuring stellar signature dishes rather than an overflowing buffet.",
      ],
      "Community Event": [
        "Reach out to local neighborhood businesses for sponsorship or product donations in exchange for banner placement.",
        "Form volunteer committees for registration, crowd control, and setup to keep labor expenses minimal.",
        "Utilize public park pavilions or community hall facilities which feature subsidized civic rental rates.",
        "Encourage potluck or local home-chef food stalls to diversify food offerings without central catering risk.",
      ],
      _default: [
        "Lock in your core vendors (venue, catering, photography) at least 3 months ahead for early-bird rates.",
        "Collect three competing quotations for each key service category before signing commitments.",
        "Keep 8–10% of total budget untouched as a contingency reserve for unexpected last-minute expenses.",
        "Establish milestone-based deposits (e.g. 25% booking, 50% week-of, 25% post-completion) to maintain leverage.",
      ],
    };
    return tips[type] || tips._default;
  },

  _priorityAdvice(type, budget, guests) {
    const perHead = Math.round(budget / Math.max(1, guests));
    if (type === "Wedding") {
      return `For weddings, Venue and Catering represent the cornerstone of the guest experience (58% of budget). Photography is permanent: never skimp on capturing memories that outlive the day. Invest heavily in 2–3 visual decor anchors (mandap/stage/entrance) and maintain at least 5% emergency contingency.`;
    }
    if (type === "Birthday") {
      return `For birthdays, Catering (30%) and Entertainment (15%) drive 80% of guest happiness. At ₹${perHead.toLocaleString("en-IN")} per guest, ensure ample delicious finger foods and an energetic host or DJ. The cake and photo moment are your visual heroes.`;
    }
    if (type === "Anniversary") {
      return `For anniversaries, the Venue ambiance and fine Catering set the sentimental tone. Prioritize a romantic, comfortable space with great acoustic intimacy for speeches. Keep decorations focused on nostalgic photos and romantic candle accents.`;
    }
    return `Allocate over 50% to Venue and Food, as these directly shape every attendee's comfort. Ensure strong photography/videography for documentation, and preserve an 8% buffer for unexpected requirements.`;
  },
};
