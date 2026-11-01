/**
 * EventEase AI – AI Orchestrator
 * Connects to local Ollama AI or switches dynamically to Smart Planning Mode.
 * 100% Free & Open Source. Zero API keys. Zero paid subscriptions.
 */

const API = {

  _systemPrompt: `You are an expert event planner for EventEase AI. Always respond with strictly valid JSON only.
Do not wrap your output in conversational markdown or introductory text.
Return only a single JSON object conforming strictly to the requested schema.`,

  // ─── Dispatcher ───────────────────────────────────────────────────
  async call(userPrompt) {
    if (OllamaClient.getPlanningMode() === 'smart-only') {
      throw new Error('SMART_MODE_ONLY');
    }

    if (!OllamaClient.isConnected()) {
      const check = await OllamaClient.checkConnection();
      if (!check.connected) throw new Error('OLLAMA_OFFLINE');
    }
    return await OllamaClient.generate(this._systemPrompt, userPrompt);
  },

  // ─── 1. Generate Event Plan ───────────────────────────────────────
  async generateEventPlan(event) {
    const currentModel = OllamaClient.getModel();
    try {
      const prompt = `Generate a comprehensive personalized event plan for this ${event.type}. Return ONLY valid JSON.

EVENT DETAILS:
- Name: ${event.name}
- Type: ${event.type}
- Date: ${event.date}
- Location: ${event.location}
- Guests: ${event.guests}
- Budget: ₹${Number(event.budget).toLocaleString('en-IN')}
- Preferred Theme/Style: ${event.theme || 'Open / Not specified'}
- Preferred Cuisine: ${event.cuisine || 'Any cuisine'}
- Special Requirements: ${event.additionalReqs || 'None'}

Return this exact JSON structure:
{
  "overview": {
    "summary": "2-3 sentence overview tailored specifically to this event",
    "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"]
  },
  "theme": {
    "recommended": "Theme name",
    "description": "2-3 sentences describing the aesthetic and vibe",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "colorNames": ["Color 1", "Color 2", "Color 3", "Color 4"],
    "moodBoard": ["Element 1", "Element 2", "Element 3", "Element 4", "Element 5"]
  },
  "decorations": {
    "mainConcept": "Core decoration concept",
    "items": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"],
    "floral": "Floral recommendations",
    "lighting": "Atmospheric lighting suggestions",
    "tableSettings": "Table settings and centrepieces"
  },
  "catering": {
    "style": "Service style (Buffet, Plated, Food Stations)",
    "starter": ["Dish 1", "Dish 2", "Dish 3"],
    "main": ["Dish 1", "Dish 2", "Dish 3", "Dish 4"],
    "dessert": ["Dish 1", "Dish 2", "Dish 3"],
    "drinks": ["Beverage 1", "Beverage 2", "Beverage 3"],
    "specialNote": "Special catering tip or note"
  },
  "entertainment": {
    "mainAct": "Primary entertainment attraction",
    "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4"],
    "music": "Music and sound recommendations",
    "photography": "Photography and videography plan",
    "specialMoments": ["Special moment 1", "Special moment 2", "Special moment 3"]
  },
  "guestManagement": {
    "invitations": "Invitation design and dispatch advice",
    "seating": "Seating layout plan",
    "rsvp": "RSVP tracking suggestions",
    "welcomeGifts": "Favours or welcome gifts",
    "accessibility": "Accessibility and comfort considerations"
  },
  "personalizedTips": [
    "Personalized tip 1 for this specific event",
    "Personalized tip 2",
    "Personalized tip 3",
    "Personalized tip 4",
    "Personalized tip 5"
  ]
}`;

      const result = await this.call(prompt);
      result._source = 'ollama';
      result._model = currentModel;
      return result;
    } catch (err) {
      console.info('Switching to Smart Planning Mode for event plan:', err.message);
      const plan = SmartPlanner.generateEventPlan(event);
      plan._source = 'smart';
      plan._model = null;
      return plan;
    }
  },

  // ─── 2. Generate Budget Breakdown ─────────────────────────────────
  async generateBudgetBreakdown(event) {
    const total = Number(event.budget);
    const currentModel = OllamaClient.getModel();
    try {
      const prompt = `Create an optimized budget breakdown for this ${event.type}. Return ONLY valid JSON.

EVENT:
- Type: ${event.type}
- Guests: ${event.guests}
- Location: ${event.location}
- Total Budget: ₹${total.toLocaleString('en-IN')}
- Theme: ${event.theme || 'Standard'}

CRITICAL REQUIREMENT:
All amounts in "categories" MUST sum to exactly ₹${total}. Allocate realistic amounts for each.

Return this exact JSON:
{
  "totalBudget": ${total},
  "categories": [
    {"name": "Venue", "amount": 0, "percentage": 0, "color": "#8b5cf6", "notes": "Details"},
    {"name": "Catering", "amount": 0, "percentage": 0, "color": "#ec4899", "notes": "Details"},
    {"name": "Decoration", "amount": 0, "percentage": 0, "color": "#f59e0b", "notes": "Details"},
    {"name": "Photography", "amount": 0, "percentage": 0, "color": "#3b82f6", "notes": "Details"},
    {"name": "Entertainment", "amount": 0, "percentage": 0, "color": "#10b981", "notes": "Details"},
    {"name": "Invitations", "amount": 0, "percentage": 0, "color": "#f43f5e", "notes": "Details"},
    {"name": "Miscellaneous", "amount": 0, "percentage": 0, "color": "#6b7280", "notes": "Contingency"}
  ],
  "savingTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
  "priorityAdvice": "Which categories to prioritize based on this specific event type and budget"
}`;

      const result = await this.call(prompt);
      result._source = 'ollama';
      result._model = currentModel;
      return this._normalizeBudget(result, total);
    } catch (err) {
      console.info('Switching to Smart Planning Mode for budget:', err.message);
      const budget = SmartPlanner.generateBudgetBreakdown(event);
      budget._source = 'smart';
      budget._model = null;
      return budget;
    }
  },

  // ─── 3. Generate Event Timeline ───────────────────────────────────
  async generateEventTimeline(event) {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    const currentModel = OllamaClient.getModel();

    try {
      const prompt = `Create a detailed preparation timeline for this ${event.type}. Return ONLY valid JSON.

EVENT: ${event.name} (${event.type}), Date: ${event.date}, ${event.guests} guests, ${daysUntil} days from today.

Generate 12 to 15 milestone tasks.
Each "dueDate" MUST be a realistic date between today (${today.toISOString().split('T')[0]}) and ${event.date} in YYYY-MM-DD format.
Order tasks chronologically from earliest to latest dueDate.

Return this exact JSON:
{
  "tasks": [
    {
      "id": "t1",
      "task": "Task title",
      "description": "Short explanation",
      "dueDate": "YYYY-MM-DD",
      "category": "Venue|Catering|Decoration|Photography|Entertainment|Invitations|Planning|General",
      "priority": "high|medium|low",
      "daysBeforeEvent": 60
    }
  ]
}`;

      const result = await this.call(prompt);
      result._source = 'ollama';
      result._model = currentModel;
      return result;
    } catch (err) {
      console.info('Switching to Smart Planning Mode for timeline:', err.message);
      const timeline = SmartPlanner.generateEventTimeline(event);
      timeline._source = 'smart';
      timeline._model = null;
      return timeline;
    }
  },

  // ─── 4. Generate Theme Ideas ──────────────────────────────────────
  async generateThemeIdeas(options) {
    const currentModel = OllamaClient.getModel();
    try {
      const prompt = `Generate exactly 3 unique, inspiring celebration themes. Return ONLY valid JSON.

PARAMETERS:
- Event Type: ${options.eventType}
- Season: ${options.season}
- Style: ${options.style}
- Specific Notes: ${options.notes || 'None'}

Return this exact JSON structure:
{
  "themes": [
    {
      "name": "Theme Name",
      "emoji": "🎨",
      "tagline": "Inspiring one-line tagline",
      "description": "2-3 evocative sentences describing the theme atmosphere",
      "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
      "colorNames": ["Color 1", "Color 2", "Color 3", "Color 4"],
      "decorationIdeas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4"],
      "foodIdeas": ["Food 1", "Food 2", "Food 3"],
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "uniqueExperience": "One distinct, highly memorable signature experience"
    }
  ]
}`;

      const result = await this.call(prompt);
      result._source = 'ollama';
      result._model = currentModel;
      return result;
    } catch (err) {
      console.info('Switching to Smart Planning Mode for themes:', err.message);
      const themes = SmartPlanner.generateThemeIdeas(options);
      themes._source = 'smart';
      themes._model = null;
      return themes;
    }
  },

  // ─── 5. Generate Vendor Checklist ─────────────────────────────────
  async generateChecklist(event) {
    const currentModel = OllamaClient.getModel();
    try {
      const prompt = `Create a comprehensive vendor checklist for this ${event.type}. Return ONLY valid JSON.

EVENT: ${event.type}, ${event.guests} guests, Budget: ₹${Number(event.budget).toLocaleString('en-IN')}, Location: ${event.location}.

Include these categories: Venue, Catering, Photography, Decoration, Entertainment, Transportation, Invitations.
Provide 4-5 actionable tasks in each category.

Return this exact JSON:
{
  "categories": [
    {
      "name": "Venue",
      "icon": "building-2",
      "color": "#8b5cf6",
      "items": [
        {"id": "v1", "task": "Task description", "priority": "high|medium|low"}
      ]
    }
  ]
}`;

      const result = await this.call(prompt);
      result._source = 'ollama';
      result._model = currentModel;
      return result;
    } catch (err) {
      console.info('Switching to Smart Planning Mode for checklist:', err.message);
      const checklist = SmartPlanner.generateChecklist(event);
      checklist._source = 'smart';
      checklist._model = null;
      return checklist;
    }
  },

  // ─── Budget Normalizer ────────────────────────────────────────────
  _normalizeBudget(budget, total) {
    if (!budget?.categories?.length) return budget;
    const sum = budget.categories.reduce((s, c) => s + (Number(c.amount) || 0), 0);
    const diff = total - sum;
    if (diff !== 0) {
      const last = budget.categories[budget.categories.length - 1];
      last.amount = (Number(last.amount) || 0) + diff;
    }
    budget.categories = budget.categories.map((c) => ({
      ...c,
      amount: Number(c.amount) || 0,
      percentage: Math.round(((Number(c.amount) || 0) / total) * 100),
    }));
    return budget;
  },
};
