/**
 * EventEase AI – Master SaaS Application Controller
 * Manages full lifecycle, routing, theme switching, profile management,
 * dashboard metrics, countdown timers, and module initialization.
 */

// ─── Global State & Polyfills ────────────────────────────────────────────────
if (typeof window !== 'undefined' && typeof window.lucide === 'undefined') {
  window.lucide = { createIcons: () => {} };
}

let currentPage = 'dashboard';
let dashboardBudgetChart = null;
let dashboardCategoryChart = null;
let countdownTimerInterval = null;

// ─── DOM Initialization ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme (dark / light)
  applyAppTheme(Storage.getTheme());

  // Setup UI components
  setupSidebarNavigation();
  setupTopbarControls();
  setupGlobalModals();

  // Initialize Subsystems
  Wizard.init();
  Copilot.init();
  Guests.init();
  Vendors.init();
  Invitations.init();
  EventDay.init();
  Notifications.init();
  Analytics.init();

  // Load active event & UI state
  updateTopbarEventSelector();
  updateProfileUI();

  // Auto-seed demo event if first time visitor has 0 events
  if (Storage.getEvents().length === 0) {
    seedDemoCelebration();
    updateTopbarEventSelector();
    updateProfileUI();
  }

  // Navigate to initial page
  loadInitialRoute();

  // Test Ollama connection in background
  OllamaClient.checkConnection().then(() => {
    updateAiStatusUI();
    Copilot.updateModelBadge();
  });

  lucide.createIcons();
});

// ─── Theme Management ────────────────────────────────────────────────────────
function applyAppTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeToggleIcon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }
}

function toggleTheme() {
  const current = Storage.getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  Storage.setTheme(next);
  applyAppTheme(next);
  showToast(`Switched to ${next} mode`, 'info');
}

// ─── Profile Management ──────────────────────────────────────────────────────
function updateProfileUI() {
  const profile = Storage.getProfile();
  const userNameEl = document.getElementById('userName');
  const userSubtitleEl = document.getElementById('userSubtitle');
  const userAvatarEl = document.getElementById('userAvatar');
  const userAvatarTopEl = document.getElementById('userAvatarTop');

  if (userNameEl) userNameEl.textContent = profile.name || 'Event Planner';
  if (userSubtitleEl) userSubtitleEl.textContent = profile.title || 'Event Organizer';
  if (userAvatarEl) userAvatarEl.textContent = (profile.name || 'E')[0].toUpperCase();
  if (userAvatarTopEl) userAvatarTopEl.textContent = (profile.name || 'E')[0].toUpperCase();
}

function openProfileModal() {
  const profile = Storage.getProfile();
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  document.getElementById('profileFormName').value = profile.name || '';
  document.getElementById('profileFormTitle').value = profile.title || '';
  document.getElementById('profileFormCurrency').value = profile.currency || 'INR';

  modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('active');
}

function saveProfileModal() {
  const name = document.getElementById('profileFormName')?.value.trim();
  const title = document.getElementById('profileFormTitle')?.value.trim();
  const currency = document.getElementById('profileFormCurrency')?.value || 'INR';

  if (!name) {
    showToast('Please enter your name', 'error');
    return;
  }

  Storage.saveProfile({ name, title, currency });
  updateProfileUI();
  closeProfileModal();

  // Re-render current page to update currency signs
  navigateTo(currentPage);
  showToast('Profile & preferences updated! ✓', 'success');
}

// ─── Navigation & Router ──────────────────────────────────────────────────────
function navigateTo(page) {
  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(a => a.classList.remove('active'));

  // Activate target page
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));

  currentPage = page;

  // Sync browser URL hash for bookmarking & history
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hash !== `#${page}`) {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `#${page}`);
      } else {
        window.location.hash = `#${page}`;
      }
    }
  }

  // Update topbar title
  const titles = {
    dashboard: 'Dashboard',
    'create-event': 'Event Wizard',
    copilot: 'EventEase Copilot',
    'ai-planner': 'AI Planner',
    budget: 'Budget & Expenses',
    guests: 'Guest Management',
    vendors: 'Vendor Directory',
    timeline: 'Event Timeline',
    checklist: 'Vendor Checklist',
    'theme-generator': 'Theme Studio',
    invitations: 'Invitation Studio',
    'event-day': 'Event Day Command Center',
    'idea-generator': 'Idea Studio',
    analytics: 'Reports & Analytics',
    'my-events': 'My Events',
    settings: 'Settings & Backup',
  };
  const titleText = titles[page] || 'EventEase AI';
  const topbarTitleEl = document.getElementById('topbarTitle');
  if (topbarTitleEl) topbarTitleEl.textContent = titleText;
  document.title = `${titleText} – EventEase AI`;

  // Close mobile sidebar
  closeSidebar();

  // Scroll to top
  document.querySelector('.page-container')?.scrollTo(0, 0);
  window.scrollTo(0, 0);

  // Topbar event selector visibility
  const showSelector = !['settings', 'my-events'].includes(page);
  const selectorWrap = document.getElementById('eventSelectorWrap');
  if (selectorWrap) selectorWrap.style.display = showSelector ? 'flex' : 'none';

  // Page lifecycle triggers
  try {
    switch (page) {
      case 'dashboard':
        renderDashboardPage();
        break;
      case 'create-event':
        // wizard initialized
        break;
      case 'copilot':
        Copilot.renderChatHistory();
        Copilot.updateModelBadge();
        break;
      case 'ai-planner':
        if (typeof loadPlannerPage === 'function') loadPlannerPage();
        break;
      case 'budget':
        if (typeof loadBudgetPage === 'function') loadBudgetPage();
        break;
      case 'guests':
        Guests.render();
        break;
      case 'vendors':
        Vendors.render();
        break;
      case 'timeline':
        if (typeof loadTimelinePage === 'function') loadTimelinePage();
        break;
      case 'checklist':
        if (typeof loadChecklistPage === 'function') loadChecklistPage();
        break;
      case 'theme-generator':
        if (typeof loadThemeGeneratorPage === 'function') loadThemeGeneratorPage();
        break;
      case 'invitations':
        Invitations.loadFromActiveEvent();
        Invitations.updatePreview();
        break;
      case 'event-day':
        EventDay.render();
        break;
      case 'idea-generator':
        renderIdeaGeneratorPage();
        break;
      case 'analytics':
        Analytics.render();
        break;
      case 'my-events':
        renderMyEventsPage();
        break;
      case 'settings':
        loadSettingsPage();
        break;
    }
  } catch (err) {
    console.warn(`Lifecycle error for page "${page}":`, err);
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function loadInitialRoute() {
  const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
  const validPages = [
    'dashboard', 'create-event', 'copilot', 'ai-planner', 'budget',
    'guests', 'vendors', 'timeline', 'checklist', 'theme-generator',
    'invitations', 'event-day', 'idea-generator', 'analytics', 'my-events', 'settings'
  ];
  if (hash && validPages.includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('dashboard');
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('hashchange', () => {
    const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (hash && hash !== currentPage) {
      navigateTo(hash);
    }
  });
}

function loadDemoCelebration() {
  if (typeof loadCelebrationPreset === 'function') {
    loadCelebrationPreset('wedding');
  } else {
    seedDemoCelebration();
    updateTopbarEventSelector();
    updateProfileUI();
    navigateTo('dashboard');
    showToast('Loaded sample celebration demo! 🎉', 'success');
  }
}
window.loadDemoCelebration = loadDemoCelebration;
window.updateEventSelector = updateTopbarEventSelector;

// ─── Topbar & Sidebar Setup ──────────────────────────────────────────────────
function setupSidebarNavigation() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarClose = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');

  hamburgerBtn?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.querySelectorAll('.nav-link').forEach(link => {
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

window.navigateTo = navigateTo;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleTheme = toggleTheme;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.saveProfileModal = saveProfileModal;

function setupTopbarControls() {
  const eventSelector = document.getElementById('eventSelectorTop');
  if (eventSelector) {
    eventSelector.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        Storage.setActiveEventId(selectedId);
        showToast(`Switched active event to "${Storage.getEvent(selectedId)?.name}"`, 'info');
        navigateTo(currentPage);
      }
    });
  }

  // Theme toggle button
  const themeToggle = document.getElementById('btnThemeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Profile avatar button in topbar
  const profileBtn = document.getElementById('btnProfileTop');
  if (profileBtn) {
    profileBtn.addEventListener('click', openProfileModal);
  }
}

function updateTopbarEventSelector() {
  const selector = document.getElementById('eventSelectorTop');
  if (!selector) return;

  const events = Storage.getEvents();
  const activeId = Storage.getActiveEventId();

  if (events.length === 0) {
    selector.innerHTML = '<option value="">No Events Created</option>';
    return;
  }

  let options = '';
  events.forEach(ev => {
    const isSelected = ev.id === activeId ? 'selected' : '';
    options += `<option value="${ev.id}" ${isSelected}>${escapeHTML(ev.name)} (${ev.type})</option>`;
  });
  selector.innerHTML = options;
}

// ─── AI Status UI ────────────────────────────────────────────────────────────
function updateAiStatusUI() {
  const pill = document.getElementById('aiStatusPill');
  const label = document.getElementById('aiStatusLabel');
  if (!pill || !label) return;

  if (OllamaClient.isConnected) {
    pill.className = 'ai-status-pill status-connected';
    label.textContent = `Local AI (${OllamaClient.currentModel})`;
    pill.title = `Connected to Ollama on ${OllamaClient.host}`;
  } else {
    pill.className = 'ai-status-pill status-smart';
    label.textContent = 'Smart Planning Mode';
    pill.title = 'Rule-Based Local Intelligence Active (Zero Setup)';
  }
}
window.updateAIStatus = updateAiStatusUI;

async function testOllamaConnection(event) {
  if (event) event.stopPropagation();
  const btn = document.getElementById('btnTestConnection');
  if (btn) {
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i>`;
    lucide.createIcons();
  }

  showToast('Pinging local Ollama endpoint…', 'info');
  const result = await OllamaClient.checkConnection(true);
  updateAiStatusUI();
  Copilot.updateModelBadge();

  if (btn) {
    btn.innerHTML = `<i data-lucide="refresh-cw"></i>`;
    lucide.createIcons();
  }

  if (OllamaClient.isConnected) {
    showToast(`🟢 Connected to Ollama! Model: ${OllamaClient.currentModel}`, 'success');
  } else {
    showToast('🟡 Ollama offline. Operating smoothly in Smart Planning Mode!', 'info');
  }
}

function showAiModal() {
  const modal = document.getElementById('aiSettingsModal');
  if (!modal) return;

  const hostInput = document.getElementById('ollamaHostInput');
  if (hostInput) hostInput.value = OllamaClient.host;

  OllamaClient.syncModelDropdowns();

  modal.classList.add('active');
  lucide.createIcons();
}

function closeAiModal() {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) modal.classList.remove('active');
}

async function saveAiModalSettings() {
  const hostInput = document.getElementById('ollamaHostInput');
  const modelSelect = document.getElementById('ollamaModelSelect');
  if (hostInput && hostInput.value.trim()) {
    OllamaClient.host = hostInput.value.trim();
  }
  if (modelSelect && modelSelect.value) {
    OllamaClient.setModel(modelSelect.value);
  }
  closeAiModal();
  await testOllamaConnection();
}

window.showAiModal = showAiModal;
window.closeAiModal = closeAiModal;
window.saveAiModalSettings = saveAiModalSettings;
window.testOllamaConnection = testOllamaConnection;

// ─── Dashboard Rendering ─────────────────────────────────────────────────────
function renderDashboardPage() {
  const ev = Storage.getActiveEvent();
  const spotlightContainer = document.getElementById('dashboardSpotlightContainer');
  const metricsGrid = document.getElementById('dashboardMetricsGrid');
  const heroSection = document.getElementById('dashboardHeroSection');
  const chartsGrid = document.querySelector('.dashboard-charts-grid');
  const bottomGrid = document.querySelector('.dashboard-bottom-grid');

  if (!ev) {
    if (spotlightContainer) spotlightContainer.style.display = 'none';
    if (metricsGrid) metricsGrid.style.display = 'none';
    if (chartsGrid) chartsGrid.style.display = 'none';
    if (bottomGrid) bottomGrid.style.display = 'none';
    if (heroSection) heroSection.style.display = 'block';
    return;
  }

  if (heroSection) heroSection.style.display = 'none';
  if (spotlightContainer) spotlightContainer.style.display = 'block';
  if (metricsGrid) metricsGrid.style.display = 'grid';
  if (chartsGrid) chartsGrid.style.display = 'grid';
  if (bottomGrid) bottomGrid.style.display = 'grid';

  // Render Spotlight Banner
  const totalBudget = Number(ev.budget) || 0;
  const guestsCount = ev.guests || 100;

  spotlightContainer.innerHTML = `
    <div class="active-event-spotlight">
      <div class="spotlight-left">
        <span class="spotlight-badge"><i data-lucide="sparkles"></i> Active Celebration Spotlight</span>
        <h2 class="spotlight-title">${escapeHTML(ev.name)}</h2>
        <div class="spotlight-meta">
          <span><i data-lucide="map-pin" style="width:14px;height:14px;display:inline;"></i> ${escapeHTML(ev.location)}</span>
          <span><i data-lucide="calendar" style="width:14px;height:14px;display:inline;"></i> ${ev.date}</span>
          <span><i data-lucide="users" style="width:14px;height:14px;display:inline;"></i> ${guestsCount} Guests</span>
          <span><i data-lucide="wallet" style="width:14px;height:14px;display:inline;"></i> ${Storage.formatMoney(totalBudget)}</span>
        </div>
        <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
          <button class="btn-primary" style="background:white;color:var(--purple-700);" onclick="navigateTo('copilot')">
            <i data-lucide="sparkles"></i> Ask Copilot
          </button>
          <button class="btn-outline" style="border-color:rgba(255,255,255,0.4);color:white;" onclick="navigateTo('budget')">
            <i data-lucide="receipt"></i> Add Expense
          </button>
          <button class="btn-outline" style="border-color:rgba(255,255,255,0.4);color:white;" onclick="navigateTo('guests')">
            <i data-lucide="user-plus"></i> Add Guest
          </button>
          <button class="btn-outline" style="border-color:rgba(255,255,255,0.4);color:white;" onclick="navigateTo('event-day')">
            <i data-lucide="play-circle"></i> Event Day Mode
          </button>
        </div>
      </div>
      <div class="spotlight-right">
        <div class="spotlight-countdown">
          <div class="countdown-unit">
            <div class="countdown-num" id="cdDays">00</div>
            <div class="countdown-lbl">Days</div>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit">
            <div class="countdown-num" id="cdHours">00</div>
            <div class="countdown-lbl">Hours</div>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit">
            <div class="countdown-num" id="cdMins">00</div>
            <div class="countdown-lbl">Mins</div>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-unit">
            <div class="countdown-num" id="cdSecs">00</div>
            <div class="countdown-lbl">Secs</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Start live countdown ticker
  startCountdownTimer(ev.date);

  // Compute Metrics
  const expenses = Storage.getExpenses(ev.id);
  let totalSpent = 0;
  expenses.forEach(e => { totalSpent += (Number(e.amount) || 0); });
  const remainingBudget = totalBudget - totalSpent;

  const guests = Storage.getGuests(ev.id);
  let confirmedGuests = 0;
  guests.forEach(g => {
    if (g.rsvp === 'Confirmed') confirmedGuests += (1 + (Number(g.plusOnes) || 0));
  });

  const timeline = Storage.getTimeline(ev.id);
  const tasks = timeline && timeline.tasks ? timeline.tasks : [];
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const vendors = Storage.getVendors(ev.id);
  const bookedVendors = vendors.filter(v => v.bookingStatus === 'Booked' || v.bookingStatus === 'Completed').length;

  metricsGrid.innerHTML = `
    <div class="metric-card" onclick="navigateTo('budget')">
      <div class="metric-icon" style="background:#f3e8ff;color:#9333ea;"><i data-lucide="wallet"></i></div>
      <div class="metric-val">${Storage.formatMoney(totalBudget)}</div>
      <div class="metric-lbl">Total Planned Budget</div>
      <div class="metric-sub">${Storage.formatMoney(totalSpent)} tracked spent</div>
    </div>
    <div class="metric-card" onclick="navigateTo('budget')">
      <div class="metric-icon" style="background:#dcfce7;color:#16a34a;"><i data-lucide="piggy-bank"></i></div>
      <div class="metric-val" style="color:${remainingBudget < 0 ? '#ef4444' : '#16a34a'}">${Storage.formatMoney(remainingBudget)}</div>
      <div class="metric-lbl">Remaining Balance</div>
      <div class="metric-sub">${totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0}% budget utilized</div>
    </div>
    <div class="metric-card" onclick="navigateTo('guests')">
      <div class="metric-icon" style="background:#e0e7ff;color:#4f46e5;"><i data-lucide="users"></i></div>
      <div class="metric-val">${confirmedGuests} <span style="font-size:14px;color:var(--gray-500);">/ ${guestsCount}</span></div>
      <div class="metric-lbl">Confirmed Guests</div>
      <div class="metric-sub">${guests.filter(g => g.rsvp === 'Invited' || g.rsvp === 'Maybe').length} pending RSVPs</div>
    </div>
    <div class="metric-card" onclick="navigateTo('timeline')">
      <div class="metric-icon" style="background:#fef3c7;color:#d97706;"><i data-lucide="check-square"></i></div>
      <div class="metric-val">${taskPct}%</div>
      <div class="metric-lbl">Task Completion</div>
      <div class="metric-sub">${completedTasks} of ${tasks.length} tasks completed</div>
    </div>
    <div class="metric-card" onclick="navigateTo('vendors')">
      <div class="metric-icon" style="background:#fce7f3;color:#db2777;"><i data-lucide="briefcase"></i></div>
      <div class="metric-val">${bookedVendors} <span style="font-size:14px;color:var(--gray-500);">/ ${vendors.length}</span></div>
      <div class="metric-lbl">Booked Vendors</div>
      <div class="metric-sub">${vendors.length - bookedVendors} vendors shortlisted</div>
    </div>
    <div class="metric-card" onclick="navigateTo('copilot')">
      <div class="metric-icon" style="background:#ccfbf1;color:#0d9488;"><i data-lucide="sparkles"></i></div>
      <div class="metric-val">${OllamaClient.isConnected ? OllamaClient.currentModel : 'Smart Mode'}</div>
      <div class="metric-lbl">Active AI Engine</div>
      <div class="metric-sub">100% Free · Zero API Keys</div>
    </div>
  `;

  // Render Dashboard Charts
  renderDashboardCharts(ev);

  // Render Recent Activity & Deadlines
  renderDashboardActivity(ev);
}

function startCountdownTimer(dateStr) {
  if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  if (!dateStr) return;

  const tick = () => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

    if (diff <= 0) {
      document.getElementById('cdDays') && (document.getElementById('cdDays').textContent = '00');
      document.getElementById('cdHours') && (document.getElementById('cdHours').textContent = '00');
      document.getElementById('cdMins') && (document.getElementById('cdMins').textContent = '00');
      document.getElementById('cdSecs') && (document.getElementById('cdSecs').textContent = '00');
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const elD = document.getElementById('cdDays');
    const elH = document.getElementById('cdHours');
    const elM = document.getElementById('cdMins');
    const elS = document.getElementById('cdSecs');

    if (elD) elD.textContent = pad(d);
    if (elH) elH.textContent = pad(h);
    if (elM) elM.textContent = pad(m);
    if (elS) elS.textContent = pad(s);
  };

  tick();
  countdownTimerInterval = setInterval(tick, 1000);
}

function renderDashboardCharts(ev) {
  if (typeof Chart === 'undefined') return;
  const canvasBudget = document.getElementById('dashBudgetOverviewChart');
  const canvasCat = document.getElementById('dashCategoryChart');

  if (canvasBudget) {
    if (dashboardBudgetChart) dashboardBudgetChart.destroy();
    const budget = Storage.getBudget(ev.id);
    const expenses = Storage.getExpenses(ev.id);
    const cats = budget && budget.categories ? budget.categories : [
      { name: 'Venue', amount: 450000 },
      { name: 'Catering', amount: 375000 },
      { name: 'Decoration', amount: 225000 },
      { name: 'Photography', amount: 150000 },
      { name: 'Entertainment', amount: 120000 },
    ];

    const actualMap = {};
    expenses.forEach(e => { actualMap[e.category] = (actualMap[e.category] || 0) + (Number(e.amount) || 0); });

    dashboardBudgetChart = new Chart(canvasBudget.getContext('2d'), {
      type: 'bar',
      data: {
        labels: cats.map(c => c.name),
        datasets: [
          {
            label: 'Planned Allocation',
            data: cats.map(c => c.amount),
            backgroundColor: 'rgba(139, 92, 246, 0.4)',
            borderColor: '#8b5cf6',
            borderWidth: 1.5,
            borderRadius: 6,
          },
          {
            label: 'Actual Spent',
            data: cats.map(c => actualMap[c.name] || 0),
            backgroundColor: '#ec4899',
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  if (canvasCat) {
    if (dashboardCategoryChart) dashboardCategoryChart.destroy();
    const guests = Storage.getGuests(ev.id);
    let conf = 0, pend = 0, decl = 0;
    guests.forEach(g => {
      if (g.rsvp === 'Confirmed') conf++;
      else if (g.rsvp === 'Declined') decl++;
      else pend++;
    });

    if (guests.length === 0) { conf = 45; pend = 15; decl = 5; }

    dashboardCategoryChart = new Chart(canvasCat.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Confirmed', 'Pending', 'Declined'],
        datasets: [{
          data: [conf, pend, decl],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}

function renderDashboardActivity(ev) {
  const container = document.getElementById('dashboardActivityList');
  if (!container) return;

  const timeline = Storage.getTimeline(ev.id);
  const tasks = timeline && timeline.tasks ? timeline.tasks : [];
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

  if (pendingTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state-mini">
        <i data-lucide="check-circle"></i>
        <p>No upcoming task deadlines. All tasks completed!</p>
      </div>
    `;
    return;
  }

  let html = '';
  pendingTasks.forEach(t => {
    html += `
      <div class="dash-activity-item" onclick="navigateTo('timeline')">
        <div class="activity-check-col">
          <input type="checkbox" onchange="event.stopPropagation(); markTaskDoneQuick('${t.id}')">
        </div>
        <div class="activity-body-col">
          <strong>${escapeHTML(t.task)}</strong>
          <span class="activity-meta">Category: ${t.category} · Priority: ${t.priority}</span>
        </div>
        <span class="badge-pill badge-neutral">T - ${t.daysBeforeEvent || 0}d</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

function markTaskDoneQuick(taskId) {
  const ev = Storage.getActiveEvent();
  if (!ev) return;
  const timeline = Storage.getTimeline(ev.id);
  if (timeline && timeline.tasks) {
    const t = timeline.tasks.find(item => item.id === taskId);
    if (t) {
      t.completed = true;
      Storage.saveTimeline(ev.id, timeline);
      renderDashboardPage();
      showToast(`Marked "${t.task}" as completed! ✓`, 'success');
    }
  }
}

// ─── My Events Management ────────────────────────────────────────────────────
function renderMyEventsPage() {
  const container = document.getElementById('myEventsGrid');
  if (!container) return;

  const events = Storage.getEvents();
  const activeId = Storage.getActiveEventId();

  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="calendar"></i>
        <h3>No Events Created Yet</h3>
        <p>Create your first wedding, birthday, anniversary, or community event!</p>
        <button class="btn-primary" onclick="Wizard.startNewEvent(); navigateTo('create-event');">
          <i data-lucide="plus"></i> Create New Event
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = '';
  events.forEach(ev => {
    const isActive = ev.id === activeId;
    html += `
      <div class="event-card ${isActive ? 'event-card-active' : ''}">
        <div class="event-card-header">
          <div class="event-card-badge">${ev.type}</div>
          ${isActive ? '<span class="badge-pill badge-ai">Active</span>' : ''}
        </div>
        <h3 class="event-card-title">${escapeHTML(ev.name)}</h3>
        <div class="event-card-meta">
          <div>📅 ${ev.date || 'TBD'}</div>
          <div>📍 ${escapeHTML(ev.location || 'Location TBD')}</div>
          <div>👥 ${ev.guests || 100} Guests</div>
          <div>💰 ${Storage.formatMoney(ev.budget)}</div>
        </div>
        <div class="event-card-actions">
          ${!isActive ? `
            <button class="btn-primary-sm" onclick="setActiveEventAndRefresh('${ev.id}')">
              Select
            </button>
          ` : `
            <button class="btn-outline-sm" onclick="navigateTo('dashboard')">
              Open Dashboard
            </button>
          `}
          <button class="btn-icon-sm" onclick="Wizard.startEditEvent('${ev.id}'); navigateTo('create-event');" title="Edit Event">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn-icon-sm btn-icon-danger" onclick="deleteEventConfirm('${ev.id}')" title="Delete Event">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function setActiveEventAndRefresh(eventId) {
  Storage.setActiveEventId(eventId);
  updateTopbarEventSelector();
  showToast(`Switched active event to "${Storage.getEvent(eventId)?.name}"`, 'info');
  navigateTo('dashboard');
}

function deleteEventConfirm(eventId) {
  const ev = Storage.getEvent(eventId);
  const name = ev ? ev.name : 'this event';
  if (confirm(`Are you sure you want to permanently delete "${name}" and all its plans, guests, and budget data?`)) {
    Storage.deleteEvent(eventId);
    updateTopbarEventSelector();
    renderMyEventsPage();
    showToast(`Deleted ${name}`, 'info');
  }
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function loadSettingsPage() {
  const profile = Storage.getProfile();
  const nameInput = document.getElementById('settingsUserName');
  const titleInput = document.getElementById('settingsUserTitle');
  const currSelect = document.getElementById('settingsCurrency');

  if (nameInput) nameInput.value = profile.name || '';
  if (titleInput) titleInput.value = profile.title || '';
  if (currSelect) currSelect.value = profile.currency || 'INR';

  // Ollama settings
  const hostInput = document.getElementById('settingsOllamaHost');
  if (hostInput) hostInput.value = OllamaClient.host;

  // Render stats
  const totalEvents = Storage.getEvents().length;
  const countEl = document.getElementById('settingsEventCount');
  if (countEl) countEl.textContent = `${totalEvents} events saved in browser LocalStorage`;
}

function saveGeneralSettings() {
  const name = document.getElementById('settingsUserName')?.value.trim();
  const title = document.getElementById('settingsUserTitle')?.value.trim();
  const currency = document.getElementById('settingsCurrency')?.value || 'INR';

  if (!name) {
    showToast('Please enter your name', 'error');
    return;
  }

  Storage.saveProfile({ name, title, currency });
  updateProfileUI();
  showToast('Settings saved successfully! ✓', 'success');
}

function downloadFullBackup() {
  const json = Storage.exportAllDataJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eventease_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Full backup downloaded! 💾', 'success');
}

function handleRestoreFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const res = Storage.importAllDataJSON(event.target.result);
    if (res.success) {
      updateTopbarEventSelector();
      updateProfileUI();
      navigateTo('dashboard');
      showToast(`Restored backup with ${res.count} events! 🎉`, 'success');
    } else {
      showToast('Restore failed: ' + res.error, 'danger');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function wipeAllDataConfirm() {
  if (confirm('CAUTION: Are you sure you want to permanently clear ALL events, guests, vendors, and expenses from your browser?')) {
    if (confirm('This action cannot be undone. Please confirm to proceed.')) {
      Storage.clearAllEvents();
      updateTopbarEventSelector();
      navigateTo('dashboard');
      showToast('All local data cleared.', 'info');
    }
  }
}

// ─── AI Idea Studio ───────────────────────────────────────────────────────────
function renderIdeaGeneratorPage() {
  const container = document.getElementById('ideaStudioCards');
  if (!container) return;

  const ideas = [
    { title: 'Interactive Live Chaat & Dessert Bazaar', category: 'Catering', desc: 'Instead of conventional buffet trays, set up 4 authentic street food counters where chefs customize dishes live.', tags: ['Food', 'Interactive', 'High Vibe'] },
    { title: 'Photo Scavenger Hunt with QR Codes', category: 'Activities', desc: 'Place 10 fun photo mission cards on tables (e.g. "Selfie with the couple", "Funniest group dance face"). Guests upload to a private live slideshow.', tags: ['Entertainment', 'Memories', 'All Ages'] },
    { title: 'Seed Paper & Miniature Herb Favors', category: 'Eco-Friendly', desc: 'Send guests home with seed-embedded paper cards or miniature terracotta rosemary pots that bloom into flowers.', tags: ['Sustainable', 'Green', 'Memorable'] },
    { title: 'Warm Edison Bulb & Fabric Drapery Ceiling', category: 'Decor', desc: 'Transform any banquet hall or lawn into an enchanted starlit atmosphere at a fraction of floral chandelier costs.', tags: ['Lighting', 'Budget Saver', 'Romantic'] },
    { title: 'Signature Couple Mocktail Tasting Bar', category: 'Drinks', desc: 'Create two signature concoctions reflecting the couple or celebrant\'s personal history with customized drink stirrers.', tags: ['Beverages', 'Unique', 'Personalized'] },
    { title: 'Polaroid Guest Book & Audio Message Booth', category: 'Memories', desc: 'Retro telephone guestbook where friends pick up the handset and record voicemail blessings.', tags: ['Keepsake', 'Fun', 'Trending'] }
  ];

  let html = '';
  ideas.forEach(item => {
    html += `
      <div class="idea-card">
        <div class="idea-card-header">
          <span class="badge-category">${item.category}</span>
          <button class="btn-icon-sm" onclick="saveIdeaToFavorites('${escapeHTML(item.title)}', '${escapeHTML(item.desc)}')" title="Bookmark Idea">
            <i data-lucide="bookmark"></i>
          </button>
        </div>
        <h4 class="idea-card-title">${item.title}</h4>
        <p class="idea-card-desc">${item.desc}</p>
        <div class="idea-card-tags">
          ${item.tags.map(t => `<span class="idea-tag">#${t}</span>`).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function saveIdeaToFavorites(title, desc) {
  Storage.saveIdeaFavorite({ title, description: desc });
  showToast(`Saved "${title}" to your favorites! ⭐`, 'success');
}

// ─── Global Helpers ───────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span>${escapeHTML(message)}</span>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setupGlobalModals() {
  // Close modals on clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}
