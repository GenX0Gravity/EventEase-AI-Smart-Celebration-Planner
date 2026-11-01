/**
 * EventEase AI – Local Storage Manager
 * Handles all data persistence for events, plans, checklist, and settings.
 */

const STORAGE_KEYS = {
  EVENTS: 'eventease_events',
  CURRENT_EVENT: 'eventease_current_event',
  PLANS: 'eventease_plans',
  BUDGETS: 'eventease_budgets',
  TIMELINES: 'eventease_timelines',
  CHECKLISTS: 'eventease_checklists',
  API_KEY: 'eventease_api_key',
  THEME_IDEAS: 'eventease_theme_ideas',
};

const Storage = {
  // ─── API Key ────────────────────────────────────────────────────
  getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },
  setApiKey(key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  },
  clearApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // ─── Events ─────────────────────────────────────────────────────
  getEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    } catch { return []; }
  },
  saveEvent(event) {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === event.id);
    if (idx >= 0) {
      events[idx] = { ...events[idx], ...event, updatedAt: new Date().toISOString() };
    } else {
      events.unshift({ ...event, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    return event;
  },
  deleteEvent(eventId) {
    const events = this.getEvents().filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    // Clean up related data
    this.deletePlan(eventId);
    this.deleteBudget(eventId);
    this.deleteTimeline(eventId);
    this.deleteChecklist(eventId);
  },
  clearAllEvents() {
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EVENT);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.TIMELINES);
    localStorage.removeItem(STORAGE_KEYS.CHECKLISTS);
  },

  // ─── Current Event ───────────────────────────────────────────────
  getCurrentEvent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_EVENT) || 'null');
    } catch { return null; }
  },
  setCurrentEvent(event) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EVENT, JSON.stringify(event));
  },

  // ─── Plans ──────────────────────────────────────────────────────
  getPlans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '{}');
    } catch { return {}; }
  },
  getPlan(eventId) {
    return this.getPlans()[eventId] || null;
  },
  savePlan(eventId, plan) {
    const plans = this.getPlans();
    plans[eventId] = { ...plan, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },
  deletePlan(eventId) {
    const plans = this.getPlans();
    delete plans[eventId];
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  },

  // ─── Budgets ────────────────────────────────────────────────────
  getBudgets() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '{}');
    } catch { return {}; }
  },
  getBudget(eventId) {
    return this.getBudgets()[eventId] || null;
  },
  saveBudget(eventId, budget) {
    const budgets = this.getBudgets();
    budgets[eventId] = { ...budget, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },
  deleteBudget(eventId) {
    const budgets = this.getBudgets();
    delete budgets[eventId];
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  // ─── Timelines ──────────────────────────────────────────────────
  getTimelines() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMELINES) || '{}');
    } catch { return {}; }
  },
  getTimeline(eventId) {
    return this.getTimelines()[eventId] || null;
  },
  saveTimeline(eventId, timeline) {
    const timelines = this.getTimelines();
    timelines[eventId] = { ...timeline, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(timelines));
  },
  deleteTimeline(eventId) {
    const timelines = this.getTimelines();
    delete timelines[eventId];
    localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(timelines));
  },

  // ─── Checklists ─────────────────────────────────────────────────
  getChecklists() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLISTS) || '{}');
    } catch { return {}; }
  },
  getChecklist(eventId) {
    return this.getChecklists()[eventId] || null;
  },
  saveChecklist(eventId, checklist) {
    const checklists = this.getChecklists();
    checklists[eventId] = { ...checklist, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  },
  deleteChecklist(eventId) {
    const checklists = this.getChecklists();
    delete checklists[eventId];
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(checklists));
  },
};

