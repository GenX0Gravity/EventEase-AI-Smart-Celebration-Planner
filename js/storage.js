/**
 * EventEase AI – Comprehensive Local Storage & State Manager
 * Handles multi-event data persistence, profile, guests, vendors, expenses,
 * timelines, checklists, invitations, seating tables, notifications, and backup/restore.
 * 100% Private, Zero Cloud Required, Zero API Keys.
 */

const STORAGE_KEYS = {
  EVENTS: 'eventease_events',
  ACTIVE_EVENT_ID: 'eventease_active_event_id',
  CURRENT_EVENT: 'eventease_current_event', // legacy fallback
  PROFILE: 'eventease_profile',
  PLANS: 'eventease_plans',
  BUDGETS: 'eventease_budgets',
  EXPENSES: 'eventease_expenses',
  GUESTS: 'eventease_guests',
  VENDORS: 'eventease_vendors',
  TIMELINES: 'eventease_timelines',
  CHECKLISTS: 'eventease_checklists',
  DAY_SCHEDULES: 'eventease_day_schedules',
  SEATING_TABLES: 'eventease_seating_tables',
  INVITATIONS: 'eventease_invitations',
  THEMES: 'eventease_theme_ideas',
  SAVED_THEMES: 'eventease_saved_themes',
  SAVED_IDEAS: 'eventease_saved_ideas',
  NOTIFICATIONS: 'eventease_notifications',
  COPILOT_CHATS: 'eventease_copilot_chats',
  APP_THEME: 'eventease_theme',
  SETTINGS: 'eventease_settings',
};

const Storage = {
  // ─── User Profile ──────────────────────────────────────────────────────────
  getProfile() {
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
      if (p) return p;
    } catch { /* ignore */ }
    return {
      name: 'Celebration Host',
      title: 'Event Organizer',
      avatar: 'sparkles',
      currency: 'INR',
      currencySymbol: '₹',
      theme: 'system',
      createdDate: new Date().toISOString(),
    };
  },
  saveProfile(profile) {
    const existing = this.getProfile();
    const updated = { ...existing, ...profile, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // ─── App Theme (Dark / Light) ──────────────────────────────────────────────
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.APP_THEME) || 'light';
  },
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.APP_THEME, theme);
  },

  // ─── Currency Helpers ─────────────────────────────────────────────────────
  getCurrencySymbol(curr) {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$' };
    return symbols[curr] || '₹';
  },
  formatMoney(amount, currency) {
    const curr = currency || this.getProfile().currency || 'INR';
    const sym = this.getCurrencySymbol(curr);
    const num = Number(amount) || 0;
    try {
      if (curr === 'INR') {
        return sym + ' ' + num.toLocaleString('en-IN');
      }
      return sym + ' ' + num.toLocaleString('en-US');
    } catch {
      return sym + ' ' + num;
    }
  },

  // ─── Events ───────────────────────────────────────────────────────────────
  getEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
    } catch { return []; }
  },
  getActiveEventId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || null;
  },
  setActiveEventId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    const ev = this.getEvent(id);
    if (ev) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_EVENT, JSON.stringify(ev));
    }
  },
  getActiveEvent() {
    const id = this.getActiveEventId();
    if (id) {
      const ev = this.getEvent(id);
      if (ev) return ev;
    }
    const events = this.getEvents();
    if (events.length > 0) {
      this.setActiveEventId(events[0].id);
      return events[0];
    }
    // Check legacy current event
    try {
      const legacy = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_EVENT) || 'null');
      if (legacy && legacy.id) {
        this.saveEvent(legacy);
        this.setActiveEventId(legacy.id);
        return legacy;
      }
    } catch { /* ignore */ }
    return null;
  },
  getEvent(id) {
    return this.getEvents().find(e => e.id === id) || null;
  },
  saveEvent(event) {
    const events = this.getEvents();
    const idx = events.findIndex(e => e.id === event.id);
    const now = new Date().toISOString();
    let saved;
    if (idx >= 0) {
      saved = { ...events[idx], ...event, updatedAt: now };
      events[idx] = saved;
    } else {
      saved = {
        ...event,
        id: event.id || 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        createdAt: now,
        updatedAt: now
      };
      events.unshift(saved);
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    this.setActiveEventId(saved.id);
    return saved;
  },
  deleteEvent(eventId) {
    const events = this.getEvents().filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    if (this.getActiveEventId() === eventId) {
      if (events.length > 0) {
        this.setActiveEventId(events[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_EVENT);
      }
    }
    // Clean up associated event data
    this.deletePlan(eventId);
    this.deleteBudget(eventId);
    this.deleteTimeline(eventId);
    this.deleteChecklist(eventId);
    this.deleteExpenses(eventId);
    this.deleteGuests(eventId);
    this.deleteVendors(eventId);
    this.deleteDaySchedule(eventId);
    this.deleteSeatingTables(eventId);
    this.deleteInvitation(eventId);
  },
  clearAllEvents() {
    const keys = [
      STORAGE_KEYS.EVENTS,
      STORAGE_KEYS.ACTIVE_EVENT_ID,
      STORAGE_KEYS.CURRENT_EVENT,
      STORAGE_KEYS.PLANS,
      STORAGE_KEYS.BUDGETS,
      STORAGE_KEYS.EXPENSES,
      STORAGE_KEYS.GUESTS,
      STORAGE_KEYS.VENDORS,
      STORAGE_KEYS.TIMELINES,
      STORAGE_KEYS.CHECKLISTS,
      STORAGE_KEYS.DAY_SCHEDULES,
      STORAGE_KEYS.SEATING_TABLES,
      STORAGE_KEYS.INVITATIONS,
      STORAGE_KEYS.NOTIFICATIONS,
      STORAGE_KEYS.COPILOT_CHATS,
    ];
    keys.forEach(k => localStorage.removeItem(k));
  },

  // ─── Current Event (Legacy compatibility) ─────────────────────────────────
  getCurrentEvent() {
    return this.getActiveEvent();
  },
  setCurrentEvent(event) {
    if (event) {
      this.saveEvent(event);
    }
  },

  // ─── Plans ────────────────────────────────────────────────────────────────
  getPlans() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS) || '{}'); }
    catch { return {}; }
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

  // ─── Budgets ──────────────────────────────────────────────────────────────
  getBudgets() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '{}'); }
    catch { return {}; }
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

  // ─── Actual Expenses ──────────────────────────────────────────────────────
  getExpensesMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '{}'); }
    catch { return {}; }
  },
  getExpenses(eventId) {
    const map = this.getExpensesMap();
    return map[eventId] || [];
  },
  saveExpenses(eventId, expenses) {
    const map = this.getExpensesMap();
    map[eventId] = expenses;
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(map));
  },
  addExpense(eventId, expense) {
    const list = this.getExpenses(eventId);
    const newExp = {
      ...expense,
      id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newExp);
    this.saveExpenses(eventId, list);
    return newExp;
  },
  updateExpense(eventId, expense) {
    const list = this.getExpenses(eventId);
    const idx = list.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...expense, updatedAt: new Date().toISOString() };
      this.saveExpenses(eventId, list);
      return list[idx];
    }
    return null;
  },
  deleteExpense(eventId, expenseId) {
    const list = this.getExpenses(eventId).filter(e => e.id !== expenseId);
    this.saveExpenses(eventId, list);
  },
  deleteExpenses(eventId) {
    const map = this.getExpensesMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(map));
  },

  // ─── Guests ───────────────────────────────────────────────────────────────
  getGuestsMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.GUESTS) || '{}'); }
    catch { return {}; }
  },
  getGuests(eventId) {
    const map = this.getGuestsMap();
    return map[eventId] || [];
  },
  saveGuests(eventId, guests) {
    const map = this.getGuestsMap();
    map[eventId] = guests;
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(map));
  },
  addGuest(eventId, guest) {
    const list = this.getGuests(eventId);
    const newGuest = {
      ...guest,
      id: guest.id || 'gst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newGuest);
    this.saveGuests(eventId, list);
    return newGuest;
  },
  updateGuest(eventId, guest) {
    const list = this.getGuests(eventId);
    const idx = list.findIndex(g => g.id === guest.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...guest, updatedAt: new Date().toISOString() };
      this.saveGuests(eventId, list);
      return list[idx];
    }
    return null;
  },
  deleteGuest(eventId, guestId) {
    const list = this.getGuests(eventId).filter(g => g.id !== guestId);
    this.saveGuests(eventId, list);
  },
  deleteGuests(eventId) {
    const map = this.getGuestsMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(map));
  },

  // ─── Vendors ──────────────────────────────────────────────────────────────
  getVendorsMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENDORS) || '{}'); }
    catch { return {}; }
  },
  getVendors(eventId) {
    const map = this.getVendorsMap();
    return map[eventId] || [];
  },
  saveVendors(eventId, vendors) {
    const map = this.getVendorsMap();
    map[eventId] = vendors;
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(map));
  },
  addVendor(eventId, vendor) {
    const list = this.getVendors(eventId);
    const newVendor = {
      ...vendor,
      id: vendor.id || 'vnd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVendor);
    this.saveVendors(eventId, list);
    return newVendor;
  },
  updateVendor(eventId, vendor) {
    const list = this.getVendors(eventId);
    const idx = list.findIndex(v => v.id === vendor.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...vendor, updatedAt: new Date().toISOString() };
      this.saveVendors(eventId, list);
      return list[idx];
    }
    return null;
  },
  deleteVendor(eventId, vendorId) {
    const list = this.getVendors(eventId).filter(v => v.id !== vendorId);
    this.saveVendors(eventId, list);
  },
  deleteVendors(eventId) {
    const map = this.getVendorsMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(map));
  },

  // ─── Timelines ────────────────────────────────────────────────────────────
  getTimelines() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMELINES) || '{}'); }
    catch { return {}; }
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

  // ─── Checklists ───────────────────────────────────────────────────────────
  getChecklists() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLISTS) || '{}'); }
    catch { return {}; }
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

  // ─── Day-Of Run of Show / Schedules ───────────────────────────────────────
  getDaySchedulesMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAY_SCHEDULES) || '{}'); }
    catch { return {}; }
  },
  getDaySchedule(eventId) {
    return this.getDaySchedulesMap()[eventId] || [];
  },
  saveDaySchedule(eventId, schedule) {
    const map = this.getDaySchedulesMap();
    map[eventId] = schedule;
    localStorage.setItem(STORAGE_KEYS.DAY_SCHEDULES, JSON.stringify(map));
  },
  deleteDaySchedule(eventId) {
    const map = this.getDaySchedulesMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.DAY_SCHEDULES, JSON.stringify(map));
  },

  // ─── Seating Tables ───────────────────────────────────────────────────────
  getSeatingTablesMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEATING_TABLES) || '{}'); }
    catch { return {}; }
  },
  getSeatingTables(eventId) {
    return this.getSeatingTablesMap()[eventId] || [];
  },
  saveSeatingTables(eventId, tables) {
    const map = this.getSeatingTablesMap();
    map[eventId] = tables;
    localStorage.setItem(STORAGE_KEYS.SEATING_TABLES, JSON.stringify(map));
  },
  deleteSeatingTables(eventId) {
    const map = this.getSeatingTablesMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.SEATING_TABLES, JSON.stringify(map));
  },

  // ─── Invitations ──────────────────────────────────────────────────────────
  getInvitationsMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVITATIONS) || '{}'); }
    catch { return {}; }
  },
  getInvitation(eventId) {
    return this.getInvitationsMap()[eventId] || null;
  },
  saveInvitation(eventId, invitation) {
    const map = this.getInvitationsMap();
    map[eventId] = { ...invitation, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(map));
  },
  deleteInvitation(eventId) {
    const map = this.getInvitationsMap();
    delete map[eventId];
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(map));
  },

  // ─── Saved Themes & Ideas ─────────────────────────────────────────────────
  getSavedThemes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_THEMES) || '[]'); }
    catch { return []; }
  },
  saveThemeFavorite(theme) {
    const list = this.getSavedThemes();
    const idx = list.findIndex(t => t.name === theme.name);
    if (idx < 0) {
      list.unshift({ ...theme, savedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.SAVED_THEMES, JSON.stringify(list));
    }
  },
  removeThemeFavorite(themeName) {
    const list = this.getSavedThemes().filter(t => t.name !== themeName);
    localStorage.setItem(STORAGE_KEYS.SAVED_THEMES, JSON.stringify(list));
  },
  getSavedIdeas() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_IDEAS) || '[]'); }
    catch { return []; }
  },
  saveIdeaFavorite(idea) {
    const list = this.getSavedIdeas();
    const idx = list.findIndex(i => i.title === idea.title);
    if (idx < 0) {
      list.unshift({ ...idea, savedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(list));
    }
  },
  removeIdeaFavorite(ideaTitle) {
    const list = this.getSavedIdeas().filter(i => i.title !== ideaTitle);
    localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(list));
  },

  // ─── In-App Notifications ─────────────────────────────────────────────────
  getNotifications() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'); }
    catch { return []; }
  },
  saveNotifications(notifs) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },
  addNotification(notif) {
    const list = this.getNotifications();
    const item = {
      id: notif.id || 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info', // 'warning', 'danger', 'success', 'info'
      linkPage: notif.linkPage || null,
      read: false,
      timestamp: new Date().toISOString(),
    };
    list.unshift(item);
    if (list.length > 50) list.pop();
    this.saveNotifications(list);
    return item;
  },
  markNotificationRead(id) {
    const list = this.getNotifications();
    const target = list.find(n => n.id === id);
    if (target) {
      target.read = true;
      this.saveNotifications(list);
    }
  },
  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(list);
  },
  clearNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  },

  // ─── Copilot Chat History ─────────────────────────────────────────────────
  getCopilotChats() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COPILOT_CHATS) || '[]'); }
    catch { return []; }
  },
  saveCopilotChats(chats) {
    localStorage.setItem(STORAGE_KEYS.COPILOT_CHATS, JSON.stringify(chats));
  },
  addCopilotMessage(sender, text, structuredData = null) {
    const chats = this.getCopilotChats();
    chats.push({
      id: 'msg_' + Date.now(),
      sender, // 'user' or 'assistant'
      text,
      structuredData,
      timestamp: new Date().toISOString(),
    });
    if (chats.length > 60) chats.shift();
    this.saveCopilotChats(chats);
  },
  clearCopilotChats() {
    localStorage.setItem(STORAGE_KEYS.COPILOT_CHATS, JSON.stringify([]));
  },

  // ─── Backup & Restore ─────────────────────────────────────────────────────
  exportAllDataJSON() {
    const dump = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      theme: this.getTheme(),
      events: this.getEvents(),
      activeEventId: this.getActiveEventId(),
      plans: this.getPlans(),
      budgets: this.getBudgets(),
      expenses: this.getExpensesMap(),
      guests: this.getGuestsMap(),
      vendors: this.getVendorsMap(),
      timelines: this.getTimelines(),
      checklists: this.getChecklists(),
      daySchedules: this.getDaySchedulesMap(),
      seatingTables: this.getSeatingTablesMap(),
      invitations: this.getInvitationsMap(),
      savedThemes: this.getSavedThemes(),
      savedIdeas: this.getSavedIdeas(),
      notifications: this.getNotifications(),
    };
    return JSON.stringify(dump, null, 2);
  },
  importAllDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid backup format');
      }
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.theme) localStorage.setItem(STORAGE_KEYS.APP_THEME, data.theme);
      if (Array.isArray(data.events)) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
      if (data.activeEventId) localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, data.activeEventId);
      if (data.plans) localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
      if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
      if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
      if (data.guests) localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(data.guests));
      if (data.vendors) localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(data.vendors));
      if (data.timelines) localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(data.timelines));
      if (data.checklists) localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(data.checklists));
      if (data.daySchedules) localStorage.setItem(STORAGE_KEYS.DAY_SCHEDULES, JSON.stringify(data.daySchedules));
      if (data.seatingTables) localStorage.setItem(STORAGE_KEYS.SEATING_TABLES, JSON.stringify(data.seatingTables));
      if (data.invitations) localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(data.invitations));
      if (Array.isArray(data.savedThemes)) localStorage.setItem(STORAGE_KEYS.SAVED_THEMES, JSON.stringify(data.savedThemes));
      if (Array.isArray(data.savedIdeas)) localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(data.savedIdeas));
      if (Array.isArray(data.notifications)) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
      return { success: true, count: (data.events || []).length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
