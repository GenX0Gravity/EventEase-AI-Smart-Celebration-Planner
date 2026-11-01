/**
 * EventEase AI – Main Application Controller
 */

// ─── State ──────────────────────────────────────────────────────────────────
let currentPage = 'dashboard';
let editingEventId = null;

// ─── Initialization ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  setupSidebar();
  setupForm();
  setupAiModal();
  loadInitialPage();
  updateEventSelector();
  updateDashboardRecent();
  updateSidebarUser();

  // Test Ollama connection on startup
  OllamaClient.checkConnection();
});

// ─── Navigation ──────────────────────────────────────────────────────────────
function navigateTo(page) {
  // Deactivate current page
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((a) => a.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach((a) => a.classList.remove('active'));

  // Activate new page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`[data-page="${page}"]`).forEach((el) => el.classList.add('active'));

  currentPage = page;

  // Page titles
  const titles = {
    dashboard: 'Dashboard',
    'create-event': 'Create Event',
    'ai-planner': 'AI Planner',
    budget: 'Budget Planner',
    timeline: 'Event Timeline',
    checklist: 'Vendor Checklist',
    'theme-generator': 'Theme Generator',
    'my-events': 'My Events',
  };
  document.getElementById('topbarTitle').textContent = titles[page] || page;
  document.title = `${titles[page] || page} – EventEase AI`;

  // Close sidebar on mobile
  closeSidebar();

  // Scroll to top
  document.querySelector('.page-container')?.scrollTo(0, 0);
  window.scrollTo(0, 0);

  // Page-specific loading
  switch (page) {
    case 'dashboard':
      updateDashboardRecent();
      break;
    case 'ai-planner':
      loadPlannerPage();
      break;
    case 'budget':
      loadBudgetPage();
      break;
    case 'timeline':
      loadTimelinePage();
      break;
    case 'checklist':
      loadChecklistPage();
      break;
    case 'theme-generator':
      loadThemeGeneratorPage();
      break;
    case 'my-events':
      loadMyEventsPage();
      break;
  }

  // Show event selector in topbar for relevant pages
  const showSelector = ['ai-planner', 'budget', 'timeline', 'checklist'].includes(page);
  const selectorWrap = document.getElementById('eventSelectorWrap');
  if (selectorWrap) selectorWrap.style.display = showSelector ? 'flex' : 'none';
}

function loadInitialPage() {
  navigateTo('dashboard');
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function setupSidebar() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarClose = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');

  hamburgerBtn?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('active');
}

// ─── Form ──────────────────────────────────────────────────────────────────
function setupForm() {
  const form = document.getElementById('eventForm');
  const dateInput = document.getElementById('eventDate');
  const reqsTextarea = document.getElementById('additionalReqs');
  const eventTypeSelect = document.getElementById('eventType');

  // Set min date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Character counter for additional requirements
  reqsTextarea?.addEventListener('input', () => {
    const count = reqsTextarea.value.length;
    const counter = document.getElementById('reqsCharCount');
    if (counter) {
      counter.textContent = count;
      counter.style.color = count > 450 ? '#ef4444' : count > 350 ? '#f59e0b' : '#9ca3af';
    }
  });

  // Event type info panel
  eventTypeSelect?.addEventListener('change', () => {
    showEventTypeInfo(eventTypeSelect.value);
  });

  // Form submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await handleFormSubmit();
    }
  });
}

function validateForm() {
  let valid = true;
  const fields = [
    { id: 'eventName', errorId: 'eventNameError', label: 'Event name', min: 2, max: 100 },
    { id: 'eventType', errorId: 'eventTypeError', label: 'Event type' },
    { id: 'eventDate', errorId: 'eventDateError', label: 'Event date' },
    { id: 'eventLocation', errorId: 'eventLocationError', label: 'Location', min: 2 },
    { id: 'guestCount', errorId: 'guestCountError', label: 'Guest count', type: 'number', min: 1 },
    { id: 'totalBudget', errorId: 'totalBudgetError', label: 'Budget', type: 'number', min: 1000 },
  ];

  fields.forEach(({ id, errorId, label, min, max, type }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(errorId);
    if (!el || !errEl) return;

    el.classList.remove('error');
    errEl.textContent = '';

    const val = el.value?.trim();

    if (!val) {
      errEl.textContent = `${label} is required.`;
      el.classList.add('error');
      valid = false;
      return;
    }

    if (type === 'number') {
      const num = Number(val);
      if (isNaN(num) || num < min) {
        errEl.textContent = `${label} must be at least ${min.toLocaleString()}.`;
        el.classList.add('error');
        valid = false;
      }
    } else {
      if (min && val.length < min) {
        errEl.textContent = `${label} must be at least ${min} characters.`;
        el.classList.add('error');
        valid = false;
      }
    }

    // Date validation
    if (id === 'eventDate') {
      const selectedDate = new Date(val + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errEl.textContent = 'Event date must be today or in the future.';
        el.classList.add('error');
        valid = false;
      }
    }
  });

  if (!valid) {
    const firstError = document.querySelector('.form-input.error');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

async function handleFormSubmit() {
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Saving…`;
  }
  lucide.createIcons();

  const isEditing = Boolean(editingEventId);
  const eventId = editingEventId || ('event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

  const event = {
    id: eventId,
    name: document.getElementById('eventName').value.trim(),
    type: document.getElementById('eventType').value,
    date: document.getElementById('eventDate').value,
    location: document.getElementById('eventLocation').value.trim(),
    guests: document.getElementById('guestCount').value,
    budget: document.getElementById('totalBudget').value,
    theme: document.getElementById('eventTheme').value.trim(),
    cuisine: document.getElementById('cuisinePreference').value,
    additionalReqs: document.getElementById('additionalReqs').value.trim(),
  };

  Storage.saveEvent(event);
  Storage.setCurrentEvent(event);
  editingEventId = null;

  // Restore form header and button text
  const titleEl = document.querySelector('#page-create-event .page-header h1');
  if (titleEl) titleEl.textContent = 'Create New Event';

  updateEventSelector();
  updateDashboardRecent();
  updateSidebarUser();

  showToast(isEditing ? `Event "${event.name}" updated! Updating plan… ✨` : `Event "${event.name}" created! Planning now… ✨`, 'success');

  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i data-lucide="brain-circuit"></i> Generate AI Plan`;
    lucide.createIcons();
  }

  navigateTo('ai-planner');
  setTimeout(() => generateEventPlan(), 350);
}

function editEvent(eventId) {
  const event = Storage.getEvents().find((e) => e.id === eventId);
  if (!event) return;

  editingEventId = event.id;

  // Update header and button for editing
  const titleEl = document.querySelector('#page-create-event .page-header h1');
  if (titleEl) titleEl.textContent = 'Edit Event Details';
  const submitBtn = document.getElementById('generateBtn');
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="check"></i> Update Event & Plan`;
  }

  setValue('eventName', event.name);
  setValue('eventType', event.type);
  setValue('eventDate', event.date);
  setValue('eventLocation', event.location);
  setValue('guestCount', event.guests);
  setValue('totalBudget', event.budget);
  setValue('eventTheme', event.theme || '');
  setValue('cuisinePreference', event.cuisine || '');
  setValue('additionalReqs', event.additionalReqs || '');

  const counter = document.getElementById('reqsCharCount');
  if (counter) counter.textContent = (event.additionalReqs || '').length;

  showEventTypeInfo(event.type);
  navigateTo('create-event');
  lucide.createIcons();
  showToast(`Editing "${event.name}"`, 'info');
}

function clearForm() {
  editingEventId = null;
  const titleEl = document.querySelector('#page-create-event .page-header h1');
  if (titleEl) titleEl.textContent = 'Create New Event';
  const submitBtn = document.getElementById('generateBtn');
  if (submitBtn) {
    submitBtn.innerHTML = `<i data-lucide="brain-circuit"></i> Generate AI Plan`;
    lucide.createIcons();
  }

  document.getElementById('eventForm')?.reset();
  const counter = document.getElementById('reqsCharCount');
  if (counter) counter.textContent = '0';
  document.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.form-input.error').forEach((el) => el.classList.remove('error'));
  const eventInfo = document.getElementById('eventTypeInfo');
  if (eventInfo) eventInfo.style.display = 'none';
  showToast('Form cleared', 'info');
}

function loadDemoEvent() {
  const e = DEMO_EVENT;
  setValue('eventName', e.name);
  setValue('eventType', e.type);
  setValue('eventDate', e.date);
  setValue('eventLocation', e.location);
  setValue('guestCount', e.guests);
  setValue('totalBudget', e.budget);
  setValue('eventTheme', e.theme);
  setValue('cuisinePreference', e.cuisine);
  setValue('additionalReqs', e.additionalReqs);

  const counter = document.getElementById('reqsCharCount');
  if (counter) counter.textContent = e.additionalReqs.length;

  showEventTypeInfo(e.type);
  navigateTo('create-event');
  showToast('Demo event data loaded! Ready to plan.', 'success');
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function showEventTypeInfo(type) {
  const infoEl = document.getElementById('eventTypeInfo');
  const contentEl = document.getElementById('eventTypeContent');
  if (!infoEl || !contentEl || !type) return;

  const infos = {
    Wedding: {
      emoji: '💍',
      title: 'Wedding Planning Tips',
      tips: [
        'Book venue 6–12 months ahead for peak dates',
        'Budget 30% for venue & catering',
        'Hire a day-of coordinator for peace of mind',
        'Order wedding attire 4+ months early',
      ],
    },
    Birthday: {
      emoji: '🎂',
      title: 'Birthday Party Tips',
      tips: [
        'Set a fun, age-appropriate signature theme',
        'Book venue 4–6 weeks ahead',
        'Plan interactive games and a photo wall',
        'Send invites 3 weeks before with instant RSVP',
      ],
    },
    Anniversary: {
      emoji: '❤️',
      title: 'Anniversary Celebration Tips',
      tips: [
        'Focus on memorable romantic touches',
        'Incorporate the original wedding song & memories',
        'Create a photo journey display',
        'Opt for a high-quality intimate dining experience',
      ],
    },
    'Community Event': {
      emoji: '🎉',
      title: 'Community Event Tips',
      tips: [
        'Organize volunteer committees early',
        'Secure local permits & sound NOC 6 weeks ahead',
        'Broaden promotion on WhatsApp and local boards',
        'Plan inclusive zones for children and seniors',
      ],
    },
    'Corporate Event': {
      emoji: '🏢',
      title: 'Corporate Event Tips',
      tips: [
        'Define key takeaways and schedule dry runs',
        'Ensure robust A/V and high-speed Wi-Fi',
        'Incorporate structured networking segments',
        'Distribute digital feedback forms post-event',
      ],
    },
    'Baby Shower': {
      emoji: '👶',
      title: 'Baby Shower Tips',
      tips: [
        'Host between weeks 28–34 of pregnancy',
        'Keep overall duration within 2 to 3 hours',
        'Plan cute, low-stress interactive games',
        'Designate a gift recorder during unboxing',
      ],
    },
    Graduation: {
      emoji: '🎓',
      title: 'Graduation Celebration Tips',
      tips: [
        'Host within 1–2 weeks of the ceremony',
        'Display diplomas, medals, and academic memories',
        'Organize celebratory speeches and cap toss photo',
        'Set up a "Words of Wisdom" advice jar',
      ],
    },
  };

  const info = infos[type];
  if (!info) {
    infoEl.style.display = 'none';
    return;
  }

  contentEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="font-size:24px;">${info.emoji}</div>
      <div style="font-size:14px;font-weight:700;color:#111827;">${info.title}</div>
    </div>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;">
      ${info.tips
        .map(
          (t) => `<li style="font-size:13px;color:#374151;padding-left:16px;position:relative;line-height:1.5;">
        <span style="position:absolute;left:0;color:#a855f7;">→</span>${t}
      </li>`
        )
        .join('')}
    </ul>
  `;
  infoEl.style.display = 'block';
}

// ─── Event Selector ──────────────────────────────────────────────────────────
function updateEventSelector() {
  const events = Storage.getEvents();
  const selectorTop = document.getElementById('eventSelectorTop');

  if (selectorTop) {
    const current = Storage.getCurrentEvent();
    selectorTop.innerHTML =
      '<option value="">Select Event</option>' +
      events
        .map(
          (e) =>
            `<option value="${e.id}" ${current?.id === e.id ? 'selected' : ''}>${e.name}</option>`
        )
        .join('');
  }

  selectorTop?.addEventListener('change', () => {
    const id = selectorTop.value;
    if (!id) return;
    const event = Storage.getEvents().find((e) => e.id === id);
    if (event) {
      Storage.setCurrentEvent(event);
      navigateTo(currentPage);
    }
  });
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
function updateDashboardRecent() {
  const container = document.getElementById('dashboardRecentEvents');
  if (!container) return;

  const events = Storage.getEvents().slice(0, 6);

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i data-lucide="calendar"></i>
        <p>No events yet. <a href="#" onclick="navigateTo('create-event');return false;">Create your first event →</a></p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = events
    .map((event) => {
      const daysUntil = Math.ceil((new Date(event.date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
      const badgeClass = daysUntil < 0 ? 'past' : daysUntil < 30 ? 'soon' : daysUntil < 90 ? 'near' : 'far';
      const badgeText = daysUntil < 0 ? 'Past event' : daysUntil === 0 ? 'Today! 🎉' : `${daysUntil} days away`;

      return `
      <div class="recent-event-card" onclick="loadEventAndNavigate('${event.id}', 'ai-planner')">
        <div class="rec-event-type">${event.type}</div>
        <div class="rec-event-name">${event.name}</div>
        <div class="rec-event-meta">
          <div class="rec-event-meta-item"><i data-lucide="calendar"></i>${formatDate(event.date)}</div>
          <div class="rec-event-meta-item"><i data-lucide="map-pin"></i>${event.location}</div>
          <div class="rec-event-meta-item"><i data-lucide="users"></i>${event.guests} guests</div>
        </div>
        <div style="margin-top:12px;">
          <span class="days-until-badge ${badgeClass}">
            <i data-lucide="clock"></i> ${badgeText}
          </span>
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

function loadEventAndNavigate(eventId, page) {
  const event = Storage.getEvents().find((e) => e.id === eventId);
  if (event) {
    Storage.setCurrentEvent(event);
    updateEventSelector();
    navigateTo(page);
  }
}

function updateSidebarUser() {
  const event = Storage.getCurrentEvent();
  const sidebarUser = document.getElementById('sidebarUser');
  const userAvatar = document.getElementById('userAvatar');
  const userNameEl = document.getElementById('userName');

  if (event && sidebarUser) {
    sidebarUser.style.display = 'flex';
    if (userAvatar) userAvatar.textContent = event.name.charAt(0).toUpperCase();
    if (userNameEl)
      userNameEl.textContent = event.name.length > 20 ? event.name.substring(0, 20) + '…' : event.name;
  } else if (sidebarUser) {
    sidebarUser.style.display = 'none';
  }
}

// ─── My Events ──────────────────────────────────────────────────────────────
function loadMyEventsPage() {
  const events = Storage.getEvents();
  const listEl = document.getElementById('myEventsList');
  const clearBtn = document.getElementById('clearAllEventsBtn');

  if (clearBtn) clearBtn.style.display = events.length > 0 ? 'flex' : 'none';

  if (!listEl) return;

  if (events.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="folder-heart"></i></div>
        <h2>No Events Yet</h2>
        <p>Start planning your celebration! All your saved celebrations will appear here.</p>
        <button class="btn-primary" onclick="navigateTo('create-event')">
          <i data-lucide="plus"></i> Create Your First Event
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  listEl.innerHTML = events
    .map((event) => {
      const daysUntil = Math.ceil((new Date(event.date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
      const badgeClass = daysUntil < 0 ? 'past' : daysUntil < 30 ? 'soon' : daysUntil < 90 ? 'near' : 'far';
      const badgeText = daysUntil < 0 ? 'Event passed' : daysUntil === 0 ? 'Today! 🎉' : `${daysUntil} days away`;
      const current = Storage.getCurrentEvent();
      const isActive = current?.id === event.id;

      return `
      <div class="event-card ${isActive ? 'active-event' : ''}">
        <div class="event-card-type">${event.type}</div>
        ${
          isActive
            ? '<div style="position:absolute;top:16px;right:16px;font-size:11px;font-weight:700;color:#16a34a;background:#f0fdf4;padding:3px 10px;border-radius:20px;">● Active</div>'
            : ''
        }
        <div class="event-card-name">${event.name}</div>
        <div class="event-card-details">
          <div class="event-card-detail">
            <i data-lucide="calendar"></i> ${formatDate(event.date)}
          </div>
          <div class="event-card-detail">
            <i data-lucide="map-pin"></i> ${event.location}
          </div>
          <div class="event-card-detail">
            <i data-lucide="users"></i> ${event.guests} guests
          </div>
          <div class="event-card-detail">
            <i data-lucide="indian-rupee"></i> ₹${Number(event.budget).toLocaleString('en-IN')}
          </div>
        </div>
        <div style="margin-bottom:14px;">
          <span class="days-until-badge ${badgeClass}">
            <i data-lucide="clock"></i> ${badgeText}
          </span>
        </div>
        <div class="event-card-actions">
          <button class="btn-event-action btn-event-view" onclick="loadEventAndNavigate('${event.id}', 'ai-planner')">
            <i data-lucide="brain-circuit"></i> View Plan
          </button>
          <button class="btn-event-action btn-event-view" onclick="editEvent('${event.id}')">
            <i data-lucide="edit-3"></i> Edit
          </button>
          <button class="btn-event-action btn-event-view" onclick="loadEventAndNavigate('${event.id}', 'budget')">
            <i data-lucide="wallet"></i> Budget
          </button>
          <button class="btn-event-action btn-event-view" onclick="loadEventAndNavigate('${event.id}', 'timeline')">
            <i data-lucide="clock"></i> Timeline
          </button>
          <button class="btn-event-action btn-event-delete" onclick="confirmDeleteEvent('${event.id}', '${event.name.replace(/'/g, "\\'")}')">
            <i data-lucide="trash-2"></i> Delete
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

function confirmDeleteEvent(id, name) {
  showConfirm(
    `Delete "${name}"?`,
    'This will permanently delete the event and all its plans, budget, and timeline data.',
    () => {
      Storage.deleteEvent(id);
      const current = Storage.getCurrentEvent();
      if (current?.id === id) {
        const events = Storage.getEvents();
        Storage.setCurrentEvent(events[0] || null);
      }
      updateEventSelector();
      updateDashboardRecent();
      updateSidebarUser();
      loadMyEventsPage();
      showToast(`"${name}" deleted`, 'info');
    }
  );
}

function confirmClearAllEvents() {
  showConfirm(
    'Clear All Events?',
    'This will permanently delete ALL events and their plans, budgets, and timelines. This cannot be undone.',
    () => {
      Storage.clearAllEvents();
      updateEventSelector();
      updateDashboardRecent();
      updateSidebarUser();
      loadMyEventsPage();
      showToast('All events cleared', 'info');
    }
  );
}

// ─── AI Status Indicator & Modal ─────────────────────────────────────────────

/**
 * Updates all visual status indicators across the app.
 * @param {'connected' | 'smart' | 'unavailable' | 'checking'} status
 * @param {string|null} model
 * @param {string[]} installedModels
 * @param {string|null} message
 */
function updateAIStatus(status, model, installedModels = [], message = null) {
  const pill = document.getElementById('aiStatusPill');
  const label = document.getElementById('aiStatusLabel');
  const heroModel = document.getElementById('heroModelName');
  const modalDot = document.getElementById('modalStatusDot');
  const modalTitle = document.getElementById('modalStatusTitle');
  const modalSub = document.getElementById('modalStatusSub');
  const modalCard = document.getElementById('modalStatusCard');

  const curModel = model || OllamaClient.getModel();

  if (pill) {
    pill.className = 'ai-status-pill';
  }
  if (modalCard) {
    modalCard.className = 'ai-status-card';
  }

  if (status === 'connected') {
    pill?.classList.add('status-connected');
    modalCard?.classList.add('status-card-connected');
    if (label) label.textContent = `Local AI (${curModel})`;
    if (pill) pill.title = `Ollama Local AI connected (${curModel}). Click to configure.`;
    if (modalTitle) modalTitle.textContent = 'Local AI Connected';
    if (modalSub)
      modalSub.textContent = `Ollama running at ${OLLAMA_BASE_URL} · Active Model: ${curModel}`;
    if (modalDot) modalDot.className = 'status-dot-lg status-connected-dot';
    if (heroModel) heroModel.textContent = curModel;
  } else if (status === 'smart') {
    pill?.classList.add('status-smart');
    modalCard?.classList.add('status-card-smart');
    if (label) label.textContent = 'Smart Planning Mode';
    if (pill)
      pill.title =
        'Smart Planning Mode active (Rule-based engine, 100% offline). Click to configure Ollama.';
    if (modalTitle) modalTitle.textContent = 'Smart Planning Mode (Active)';
    if (modalSub)
      modalSub.textContent =
        message || 'Ollama offline or Smart Mode active · Rule-based planning active';
    if (modalDot) modalDot.className = 'status-dot-lg status-smart-dot';
    if (heroModel) heroModel.textContent = 'Smart Engine';
  } else if (status === 'unavailable') {
    pill?.classList.add('status-unavailable');
    modalCard?.classList.add('status-card-unavailable');
    if (label) label.textContent = 'AI Service Unavailable';
    if (pill)
      pill.title = `Ollama not reachable at ${OLLAMA_BASE_URL}. Click to test or switch to Smart Mode.`;
    if (modalTitle) modalTitle.textContent = 'AI Service Unavailable';
    if (modalSub)
      modalSub.textContent =
        message || `Ollama is not running at ${OLLAMA_BASE_URL}. Fallback to Smart Planning Mode is ready.`;
    if (modalDot) modalDot.className = 'status-dot-lg status-unavailable-dot';
    if (heroModel) heroModel.textContent = 'Smart Mode';
  } else if (status === 'checking') {
    pill?.classList.add('status-checking');
    if (label) label.textContent = 'Checking AI…';
    if (modalTitle) modalTitle.textContent = 'Testing Connection…';
    if (modalSub) modalSub.textContent = `Pinging ${OLLAMA_BASE_URL}/api/tags`;
    if (modalDot) modalDot.className = 'status-dot-lg status-checking-dot';
  }

  // Update model select options if installed models discovered
  if (installedModels.length > 0) {
    populateModelSelects(installedModels);
  }
}

function populateModelSelects(installedModels) {
  const selects = [
    document.getElementById('ollamaModelSelect'),
    document.getElementById('plannerModelSelect'),
  ];

  selects.forEach((sel) => {
    if (!sel) return;
    const currentVal = OllamaClient.getModel();
    const existing = Array.from(sel.options).map((o) => o.value);

    installedModels.forEach((m) => {
      if (!existing.includes(m)) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = `${m} (Installed locally)`;
        sel.insertBefore(opt, sel.firstChild);
      }
    });

    if (sel.id === 'plannerModelSelect') {
      const mode = OllamaClient.getPlanningMode();
      sel.value = mode === 'smart-only' ? 'smart-only' : currentVal;
    } else {
      sel.value = currentVal;
    }
  });
}

function setupAiModal() {
  const modal = document.getElementById('aiModal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeAiModal();
  });

  const modelSelect = document.getElementById('ollamaModelSelect');
  if (modelSelect) {
    modelSelect.value = OllamaClient.getModel();
  }

  const mode = OllamaClient.getPlanningMode();
  const radios = document.querySelectorAll('input[name="planningModePref"]');
  radios.forEach((r) => {
    if (r.value === mode) r.checked = true;
  });
}

function showAiModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'flex';

  const modelSelect = document.getElementById('ollamaModelSelect');
  if (modelSelect) modelSelect.value = OllamaClient.getModel();

  const mode = OllamaClient.getPlanningMode();
  const radios = document.querySelectorAll('input[name="planningModePref"]');
  radios.forEach((r) => {
    if (r.value === mode) r.checked = true;
  });

  lucide.createIcons();
}

function closeAiModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'none';
}

async function testOllamaConnection(event) {
  if (event) event.stopPropagation();

  const testBtns = [
    document.getElementById('btnTestConnection'),
    document.getElementById('modalBtnTest'),
  ];

  testBtns.forEach((btn) => {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Testing…`;
    }
  });
  lucide.createIcons();

  const res = await OllamaClient.checkConnection(true);

  testBtns.forEach((btn) => {
    if (btn) {
      btn.disabled = false;
      if (btn.id === 'modalBtnTest') {
        btn.innerHTML = `<i data-lucide="refresh-cw"></i> Test Connection`;
      } else {
        btn.innerHTML = `<i data-lucide="refresh-cw"></i>`;
      }
    }
  });
  lucide.createIcons();

  if (res.connected) {
    showToast(
      `Ollama connected! Found ${res.models.length} installed model(s). 🚀`,
      'success'
    );
  } else {
    showToast(
      'Ollama is offline or unreachable. Smart Planning Mode active! ✨',
      'warning'
    );
  }
}

function saveAiModalSettings() {
  const modelSelect = document.getElementById('ollamaModelSelect');
  if (modelSelect) {
    OllamaClient.setModel(modelSelect.value);
  }

  const checkedRadio = document.querySelector('input[name="planningModePref"]:checked');
  if (checkedRadio) {
    OllamaClient.setPlanningMode(checkedRadio.value);
  }

  // Update planner select if present
  const plannerSel = document.getElementById('plannerModelSelect');
  if (plannerSel) {
    plannerSel.value =
      checkedRadio?.value === 'smart-only' ? 'smart-only' : modelSelect?.value;
  }

  OllamaClient.checkConnection(true);
  showToast('Settings saved successfully!', 'success');
  setTimeout(closeAiModal, 400);
}

function setPlanningPref(mode) {
  OllamaClient.setPlanningMode(mode);
  if (mode === 'smart-only') {
    updateAIStatus('smart', null, [], 'Smart Planning Mode selected by user');
  } else {
    OllamaClient.checkConnection(true);
  }
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────
function showConfirm(title, message, onConfirm) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  const btn = document.getElementById('confirmActionBtn');
  btn.onclick = () => {
    onConfirm();
    closeConfirmModal();
  };
  document.getElementById('confirmModal').style.display = 'flex';
}

function closeConfirmModal() {
  document.getElementById('confirmModal').style.display = 'none';
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    info: 'info',
    warning: 'alert-triangle',
  };
  const icon = icons[type] || 'info';

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i data-lucide="${icon}" class="toast-icon"></i><span>${message}</span>`;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Spinning animation style
const spinStyle = document.createElement('style');
spinStyle.textContent = '.spin-icon { animation: spin 1s linear infinite; }';
document.head.appendChild(spinStyle);
