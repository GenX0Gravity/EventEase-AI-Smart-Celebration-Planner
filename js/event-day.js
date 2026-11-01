/**
 * EventEase AI – Event Day Mode (Day-Of Command Center)
 * High-contrast, mobile-optimized dashboard for coordination during the event day.
 * Features live run-of-show schedule, speed-dial vendor contacts, critical checklists,
 * and emergency kits.
 */

const EventDay = {
  init() {
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    const btnAddSchedule = document.getElementById('btnAddScheduleItem');
    if (btnAddSchedule) {
      btnAddSchedule.addEventListener('click', () => this.addScheduleItemPrompt());
    }
  },

  getActiveEvent() {
    return Storage.getActiveEvent() || DEMO_EVENT;
  },

  render() {
    const ev = this.getActiveEvent();
    if (!ev) return;

    this.renderHeader(ev);
    this.renderRunOfShow(ev);
    this.renderSpeedDial(ev);
    this.renderCriticalChecklist(ev);
    this.renderEmergencyKit();
  },

  renderHeader(ev) {
    const elTitle = document.getElementById('eventDayTitle');
    const elMeta = document.getElementById('eventDayMeta');
    const elCountdown = document.getElementById('eventDayCountdown');

    if (elTitle) elTitle.textContent = ev.name;
    if (elMeta) {
      elMeta.innerHTML = `
        <span>📍 ${ev.location || 'Venue'}</span>
        <span style="margin: 0 8px;">·</span>
        <span>📅 ${ev.date || 'Today'}</span>
        <span style="margin: 0 8px;">·</span>
        <span>👥 ${ev.guests || 100} Guests</span>
      `;
    }

    if (elCountdown && ev.date) {
      const eventDate = new Date(ev.date).getTime();
      const now = new Date().getTime();
      const diff = eventDate - now;

      if (diff <= 0 && diff > -86400000) {
        elCountdown.innerHTML = `<span class="badge-live-pulse">🔴 EVENT IN PROGRESS TODAY!</span>`;
      } else if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        elCountdown.innerHTML = `<span class="badge-countdown-pill">⏳ T - ${days} Days until Celebration</span>`;
      } else {
        elCountdown.innerHTML = `<span class="badge-pill badge-neutral">✓ Event Concluded</span>`;
      }
    }
  },

  renderRunOfShow(ev) {
    const container = document.getElementById('dayScheduleList');
    if (!container) return;

    const schedule = Storage.getDaySchedule(ev.id);
    if (schedule.length === 0) {
      container.innerHTML = `
        <div class="empty-state-mini">
          <i data-lucide="clock"></i>
          <p>No day-of schedule events created yet.</p>
          <button class="btn-primary-sm" onclick="EventDay.seedDefaultSchedule()">+ Load Suggested Schedule</button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    let html = '';
    schedule.forEach(item => {
      html += `
        <div class="schedule-timeline-card ${item.completed ? 'schedule-completed' : ''}">
          <label class="schedule-check-label">
            <input type="checkbox" class="schedule-checkbox" ${item.completed ? 'checked' : ''} onchange="EventDay.toggleScheduleCompleted('${item.id}', this.checked)">
            <span class="custom-check-mark"></span>
          </label>
          <div class="schedule-time-pill">${this.escapeHTML(item.time)}</div>
          <div class="schedule-card-content">
            <h4 class="schedule-card-title">${this.escapeHTML(item.title)}</h4>
            ${item.description ? `<p class="schedule-card-desc">${this.escapeHTML(item.description)}</p>` : ''}
            ${item.responsible ? `<span class="schedule-responsible-tag">👤 Lead: ${this.escapeHTML(item.responsible)}</span>` : ''}
          </div>
          <button class="btn-icon-sm btn-icon-danger" onclick="EventDay.deleteScheduleItem('${item.id}')" title="Remove item">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    lucide.createIcons();
  },

  toggleScheduleCompleted(id, isCompleted) {
    const ev = this.getActiveEvent();
    const schedule = Storage.getDaySchedule(ev.id);
    const item = schedule.find(s => s.id === id);
    if (item) {
      item.completed = isCompleted;
      Storage.saveDaySchedule(ev.id, schedule);
      this.renderRunOfShow(ev);
    }
  },

  addScheduleItemPrompt() {
    const time = prompt('Enter Time (e.g. 11:30 AM or 14:00):');
    if (!time) return;
    const title = prompt('Enter Schedule Event (e.g. Ring Exchange Ceremony, Cake Cutting):');
    if (!title) return;
    const resp = prompt('Responsible Person / Lead Contact (optional):', '');

    const ev = this.getActiveEvent();
    const schedule = Storage.getDaySchedule(ev.id);
    schedule.push({
      id: 's_' + Date.now(),
      time: time.trim(),
      title: title.trim(),
      description: '',
      responsible: resp ? resp.trim() : '',
      completed: false,
    });

    Storage.saveDaySchedule(ev.id, schedule);
    this.renderRunOfShow(ev);
    showToast('Schedule event added! ⏱️', 'success');
  },

  deleteScheduleItem(id) {
    const ev = this.getActiveEvent();
    let schedule = Storage.getDaySchedule(ev.id);
    schedule = schedule.filter(s => s.id !== id);
    Storage.saveDaySchedule(ev.id, schedule);
    this.renderRunOfShow(ev);
  },

  seedDefaultSchedule() {
    const ev = this.getActiveEvent();
    Storage.saveDaySchedule(ev.id, DEMO_DAY_SCHEDULE);
    this.renderRunOfShow(ev);
    showToast('Suggested run-of-show schedule loaded! 📋', 'success');
  },

  renderSpeedDial(ev) {
    const container = document.getElementById('dayVendorSpeedDial');
    if (!container) return;

    const vendors = Storage.getVendors(ev.id);
    if (vendors.length === 0) {
      container.innerHTML = `
        <div class="empty-state-mini">
          <p>No vendor contact numbers logged yet.</p>
          <button class="btn-outline-sm" onclick="navigateTo('vendors')">+ Add Vendors</button>
        </div>
      `;
      return;
    }

    let html = '';
    vendors.forEach(v => {
      const cleanPhone = (v.phone || '').replace(/[^0-9+]/g, '');
      html += `
        <div class="speed-dial-card">
          <div class="speed-dial-info">
            <h4 class="speed-dial-name">${this.escapeHTML(v.name)}</h4>
            <span class="speed-dial-category">${this.escapeHTML(v.category)}</span>
            <div class="speed-dial-contact">${this.escapeHTML(v.contact || 'Main Contact')}</div>
          </div>
          <div class="speed-dial-actions">
            ${cleanPhone ? `
              <a href="tel:${cleanPhone}" class="btn-speed-dial call" title="Call Vendor">
                <i data-lucide="phone-call"></i> Call
              </a>
              <a href="https://wa.me/${cleanPhone.replace('+', '')}" target="_blank" class="btn-speed-dial msg" title="Message on WhatsApp">
                <i data-lucide="message-square"></i> WhatsApp
              </a>
            ` : '<span class="text-muted" style="font-size:12px;">No phone saved</span>'}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    lucide.createIcons();
  },

  renderCriticalChecklist(ev) {
    const container = document.getElementById('dayCriticalChecklist');
    if (!container) return;

    const defaults = [
      { id: 'crit_1', text: 'Ceremony rings / gifts safely in hands of best person', done: false },
      { id: 'crit_2', text: 'Sound system, microphones & audio cables tested on stage', done: false },
      { id: 'crit_3', text: 'Catering staff arrival & clean water supply confirmed', done: false },
      { id: 'crit_4', text: 'Celebration cake delivery & refrigerator space verified', done: false },
      { id: 'crit_5', text: 'Cash balance envelopes for vendors organized in safe pouch', done: false },
      { id: 'crit_6', text: 'Photography & videography team given must-have shot list', done: false },
    ];

    let html = '';
    defaults.forEach(item => {
      html += `
        <label class="critical-check-row">
          <input type="checkbox" onchange="this.parentElement.classList.toggle('done', this.checked)">
          <span class="critical-check-text">${item.text}</span>
        </label>
      `;
    });
    container.innerHTML = html;
  },

  renderEmergencyKit() {
    const container = document.getElementById('dayEmergencyKit');
    if (!container) return;

    const items = [
      '🩹 Compact First Aid Kit (Band-aids, Pain relief, Antacid, Eye drops)',
      '🧷 Wardrobe Kit (Safety pins, Lint roller, Clear tape, Stain remover wipes)',
      '🔋 Tech Kit (Two 20,000mAh Power banks, Multi-chargers, Extension box)',
      '🌂 Climate Kit (Umbrellas, Mini portable fan, Hand wipes, Mints)',
      '💵 Cash Contingency Pouch (₹5,000 to ₹15,000 in assorted change)',
      '🗂️ Printed Vendor Agreement & Venue Booking Receipts Binder'
    ];

    container.innerHTML = items.map(i => `
      <div class="emergency-kit-item">
        <span>${i}</span>
      </div>
    `).join('');
  },

  escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

