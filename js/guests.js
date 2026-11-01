/**
 * EventEase AI – Guest Management & RSVP Module
 * Handles guest invitations, RSVP status tracking, dietary needs,
 * CSV import/export, and visual seating table organization.
 */

const Guests = {
  currentFilter: 'all',
  currentCategory: 'all',
  searchQuery: '',
  editingGuestId: null,

  init() {
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    const searchInput = document.getElementById('guestSearchInput');
    const filterRsvp = document.getElementById('guestFilterRsvp');
    const filterCat = document.getElementById('guestFilterCategory');
    const btnAddGuest = document.getElementById('btnAddGuest');
    const btnExportCsv = document.getElementById('btnExportGuestCsv');
    const fileImportCsv = document.getElementById('fileImportGuestCsv');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderTable();
      });
    }

    if (filterRsvp) {
      filterRsvp.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.renderTable();
      });
    }

    if (filterCat) {
      filterCat.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.renderTable();
      });
    }

    if (btnAddGuest) {
      btnAddGuest.addEventListener('click', () => this.openGuestModal());
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.exportCSV());
    }

    if (fileImportCsv) {
      fileImportCsv.addEventListener('change', (e) => this.importCSV(e));
    }
  },

  render() {
    this.renderStats();
    this.renderTable();
    this.renderSeatingTables();
  },

  getActiveEventId() {
    const ev = Storage.getActiveEvent();
    return ev ? ev.id : 'default';
  },

  renderStats() {
    const eventId = this.getActiveEventId();
    const guests = Storage.getGuests(eventId);

    const totalInvited = guests.length;
    let confirmedCount = 0;
    let confirmedHeads = 0;
    let pendingCount = 0;
    let declinedCount = 0;

    guests.forEach(g => {
      const plus = Number(g.plusOnes) || 0;
      if (g.rsvp === 'Confirmed') {
        confirmedCount++;
        confirmedHeads += (1 + plus);
      } else if (g.rsvp === 'Declined') {
        declinedCount++;
      } else {
        pendingCount++;
      }
    });

    const elTotal = document.getElementById('statGuestTotal');
    const elConfirmed = document.getElementById('statGuestConfirmed');
    const elPending = document.getElementById('statGuestPending');
    const elDeclined = document.getElementById('statGuestDeclined');

    if (elTotal) elTotal.textContent = totalInvited;
    if (elConfirmed) elConfirmed.innerHTML = `${confirmedCount} <span class="stat-subtext">(${confirmedHeads} heads)</span>`;
    if (elPending) elPending.textContent = pendingCount;
    if (elDeclined) elDeclined.textContent = declinedCount;
  },

  renderTable() {
    const eventId = this.getActiveEventId();
    const guests = Storage.getGuests(eventId);
    const tbody = document.getElementById('guestTableBody');
    if (!tbody) return;

    let filtered = guests.filter(g => {
      const matchSearch = !this.searchQuery || 
        g.name.toLowerCase().includes(this.searchQuery) ||
        (g.email && g.email.toLowerCase().includes(this.searchQuery)) ||
        (g.phone && g.phone.toLowerCase().includes(this.searchQuery));
      
      const matchRsvp = this.currentFilter === 'all' || g.rsvp === this.currentFilter;
      const matchCat = this.currentCategory === 'all' || g.category === this.currentCategory;

      return matchSearch && matchRsvp && matchCat;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-cell">
            <div class="empty-state-mini">
              <i data-lucide="users"></i>
              <p>No guests match the current filters.</p>
              <button class="btn-primary-sm" onclick="Guests.openGuestModal()">Add Your First Guest</button>
            </div>
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    let html = '';
    filtered.forEach(g => {
      const plusOnes = Number(g.plusOnes) || 0;
      const rsvpBadgeClass = {
        Confirmed: 'badge-success',
        Invited: 'badge-info',
        Maybe: 'badge-warning',
        Declined: 'badge-danger',
      }[g.rsvp] || 'badge-neutral';

      html += `
        <tr>
          <td>
            <div class="guest-name-cell">
              <strong>${this.escapeHTML(g.name)}</strong>
              ${g.notes ? `<span class="guest-notes-tooltip" title="${this.escapeHTML(g.notes)}">📝</span>` : ''}
              ${plusOnes > 0 ? `<span class="badge-plus-ones">+${plusOnes}</span>` : ''}
            </div>
          </td>
          <td><span class="badge-category">${this.escapeHTML(g.category || 'General')}</span></td>
          <td>
            <select class="rsvp-inline-select ${rsvpBadgeClass}" onchange="Guests.updateRsvpStatus('${g.id}', this.value)">
              <option value="Confirmed" ${g.rsvp === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Invited" ${g.rsvp === 'Invited' ? 'selected' : ''}>Invited</option>
              <option value="Maybe" ${g.rsvp === 'Maybe' ? 'selected' : ''}>Maybe</option>
              <option value="Declined" ${g.rsvp === 'Declined' ? 'selected' : ''}>Declined</option>
            </select>
          </td>
          <td>
            <span class="diet-badge diet-${(g.diet || 'Standard').toLowerCase().replace(/[^a-z]/g, '')}">
              ${this.escapeHTML(g.diet || 'Standard')}
            </span>
          </td>
          <td>
            <div class="guest-contact-text">
              ${g.phone ? `<div><i data-lucide="phone" style="width:12px;height:12px;display:inline;"></i> ${this.escapeHTML(g.phone)}</div>` : ''}
              ${g.email ? `<div><i data-lucide="mail" style="width:12px;height:12px;display:inline;"></i> ${this.escapeHTML(g.email)}</div>` : ''}
            </div>
          </td>
          <td>
            <span class="table-assignment-pill">${g.table ? this.escapeHTML(g.table) : '<em>Unassigned</em>'}</span>
          </td>
          <td class="table-actions-cell">
            <button class="btn-icon-sm" onclick="Guests.openGuestModal('${g.id}')" title="Edit Guest">
              <i data-lucide="pencil"></i>
            </button>
            <button class="btn-icon-sm btn-icon-danger" onclick="Guests.deleteGuest('${g.id}')" title="Delete Guest">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    lucide.createIcons();
  },

  updateRsvpStatus(guestId, newRsvp) {
    const eventId = this.getActiveEventId();
    const guest = Storage.getGuests(eventId).find(g => g.id === guestId);
    if (guest) {
      guest.rsvp = newRsvp;
      Storage.updateGuest(eventId, guest);
      this.renderStats();
      this.renderTable();
      showToast(`Updated RSVP for ${guest.name} to ${newRsvp}`, 'info');
    }
  },

  openGuestModal(guestId = null) {
    this.editingGuestId = guestId;
    const modal = document.getElementById('guestModal');
    const title = document.getElementById('guestModalTitle');
    const form = document.getElementById('guestForm');
    if (!modal || !form) return;

    form.reset();

    // Populate seating tables dropdown in form
    const tableSelect = document.getElementById('guestFormTable');
    if (tableSelect) {
      const eventId = this.getActiveEventId();
      const tables = Storage.getSeatingTables(eventId);
      let options = '<option value="">-- No Table Assigned --</option>';
      tables.forEach(t => {
        options += `<option value="${this.escapeHTML(t.name)}">${this.escapeHTML(t.name)} (Cap: ${t.capacity})</option>`;
      });
      tableSelect.innerHTML = options;
    }

    if (guestId) {
      title.textContent = 'Edit Guest Details';
      const eventId = this.getActiveEventId();
      const guest = Storage.getGuests(eventId).find(g => g.id === guestId);
      if (guest) {
        document.getElementById('guestFormName').value = guest.name || '';
        document.getElementById('guestFormCategory').value = guest.category || 'Friends';
        document.getElementById('guestFormRsvp').value = guest.rsvp || 'Invited';
        document.getElementById('guestFormDiet').value = guest.diet || 'Standard';
        document.getElementById('guestFormPlusOnes').value = guest.plusOnes || 0;
        document.getElementById('guestFormPhone').value = guest.phone || '';
        document.getElementById('guestFormEmail').value = guest.email || '';
        document.getElementById('guestFormTable').value = guest.table || '';
        document.getElementById('guestFormNotes').value = guest.notes || '';
      }
    } else {
      title.textContent = 'Add New Guest';
      document.getElementById('guestFormPlusOnes').value = 0;
    }

    modal.classList.add('active');
  },

  closeGuestModal() {
    const modal = document.getElementById('guestModal');
    if (modal) modal.classList.remove('active');
    this.editingGuestId = null;
  },

  saveGuestFromModal() {
    const name = document.getElementById('guestFormName')?.value.trim();
    if (!name) {
      alert('Please enter guest name');
      return;
    }

    const eventId = this.getActiveEventId();
    const guestData = {
      name,
      category: document.getElementById('guestFormCategory')?.value || 'Friends',
      rsvp: document.getElementById('guestFormRsvp')?.value || 'Invited',
      diet: document.getElementById('guestFormDiet')?.value || 'Standard',
      plusOnes: parseInt(document.getElementById('guestFormPlusOnes')?.value, 10) || 0,
      phone: document.getElementById('guestFormPhone')?.value.trim() || '',
      email: document.getElementById('guestFormEmail')?.value.trim() || '',
      table: document.getElementById('guestFormTable')?.value || '',
      notes: document.getElementById('guestFormNotes')?.value.trim() || '',
    };

    if (this.editingGuestId) {
      guestData.id = this.editingGuestId;
      Storage.updateGuest(eventId, guestData);
      showToast(`Updated guest ${name}`, 'success');
    } else {
      Storage.addGuest(eventId, guestData);
      showToast(`Added ${name} to guest list`, 'success');
    }

    this.closeGuestModal();
    this.render();
  },

  deleteGuest(guestId) {
    const eventId = this.getActiveEventId();
    const guest = Storage.getGuests(eventId).find(g => g.id === guestId);
    const guestName = guest ? guest.name : 'this guest';

    if (confirm(`Are you sure you want to remove ${guestName}?`)) {
      Storage.deleteGuest(eventId, guestId);
      this.render();
      showToast(`Removed ${guestName}`, 'info');
    }
  },

  // ─── Seating / Table Organization ──────────────────────────────────────────
  renderSeatingTables() {
    const eventId = this.getActiveEventId();
    const tables = Storage.getSeatingTables(eventId);
    const guests = Storage.getGuests(eventId);
    const container = document.getElementById('seatingTablesContainer');
    if (!container) return;

    if (tables.length === 0) {
      container.innerHTML = `
        <div class="empty-state-mini">
          <i data-lucide="layout-grid"></i>
          <p>No seating tables created yet. Organize guests into dining tables or VIP groups!</p>
          <button class="btn-outline-sm" onclick="Guests.openAddTableModal()">+ Create Table</button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    let html = '';
    tables.forEach(tbl => {
      const assignedGuests = guests.filter(g => g.table === tbl.name);
      let totalAssignedSeats = 0;
      assignedGuests.forEach(g => { totalAssignedSeats += (1 + (Number(g.plusOnes) || 0)); });

      const isFull = totalAssignedSeats >= tbl.capacity;

      html += `
        <div class="seating-table-card ${isFull ? 'table-card-full' : ''}">
          <div class="table-card-header">
            <div>
              <h4 class="table-card-title">${this.escapeHTML(tbl.name)}</h4>
              <span class="table-card-meta">${totalAssignedSeats} / ${tbl.capacity} seats occupied</span>
            </div>
            <button class="btn-icon-sm" onclick="Guests.deleteTable('${tbl.id}')" title="Delete Table">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
          <div class="table-card-progress">
            <div class="table-progress-fill" style="width: ${Math.min(100, (totalAssignedSeats / tbl.capacity) * 100)}%"></div>
          </div>
          <div class="table-guest-chips">
            ${assignedGuests.length > 0 
              ? assignedGuests.map(g => `
                  <span class="guest-chip">
                    ${this.escapeHTML(g.name)} ${g.plusOnes > 0 ? `(+${g.plusOnes})` : ''}
                    <button onclick="Guests.unassignGuest('${g.id}')" title="Remove from table">×</button>
                  </span>
                `).join('')
              : '<span class="empty-table-text">No guests assigned yet</span>'
            }
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    lucide.createIcons();
  },

  openAddTableModal() {
    const name = prompt('Enter Table Name (e.g. Table 1 - Bride Family, Table 2 - High School Friends):');
    if (!name || !name.trim()) return;
    const capacityStr = prompt('Enter Seating Capacity (default: 8):', '8');
    const capacity = parseInt(capacityStr, 10) || 8;

    const eventId = this.getActiveEventId();
    const tables = Storage.getSeatingTables(eventId);
    tables.push({
      id: 'tbl_' + Date.now(),
      name: name.trim(),
      capacity,
    });
    Storage.saveSeatingTables(eventId, tables);
    this.renderSeatingTables();
    showToast(`Created ${name.trim()} (Capacity: ${capacity})`, 'success');
  },

  deleteTable(tableId) {
    const eventId = this.getActiveEventId();
    let tables = Storage.getSeatingTables(eventId);
    const target = tables.find(t => t.id === tableId);
    if (!target) return;

    if (confirm(`Delete table "${target.name}"? Assigned guests will become unassigned.`)) {
      // Unassign guests
      const guests = Storage.getGuests(eventId);
      guests.forEach(g => {
        if (g.table === target.name) g.table = '';
      });
      Storage.saveGuests(eventId, guests);

      tables = tables.filter(t => t.id !== tableId);
      Storage.saveSeatingTables(eventId, tables);
      this.render();
      showToast(`Deleted ${target.name}`, 'info');
    }
  },

  unassignGuest(guestId) {
    const eventId = this.getActiveEventId();
    const guest = Storage.getGuests(eventId).find(g => g.id === guestId);
    if (guest) {
      guest.table = '';
      Storage.updateGuest(eventId, guest);
      this.render();
      showToast(`Unassigned ${guest.name} from table`, 'info');
    }
  },

  // ─── CSV Export & Import ──────────────────────────────────────────────────
  exportCSV() {
    const eventId = this.getActiveEventId();
    const ev = Storage.getActiveEvent();
    const guests = Storage.getGuests(eventId);

    if (guests.length === 0) {
      showToast('No guests to export', 'warning');
      return;
    }

    const headers = ['Name', 'Category', 'RSVP', 'DietaryPreference', 'PlusOnes', 'Phone', 'Email', 'Table', 'Notes'];
    const rows = guests.map(g => [
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${(g.category || '').replace(/"/g, '""')}"`,
      `"${(g.rsvp || '').replace(/"/g, '""')}"`,
      `"${(g.diet || '').replace(/"/g, '""')}"`,
      g.plusOnes || 0,
      `"${(g.phone || '').replace(/"/g, '""')}"`,
      `"${(g.email || '').replace(/"/g, '""')}"`,
      `"${(g.table || '').replace(/"/g, '""')}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = (ev ? ev.name : 'EventEase').replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `guests_${safeTitle}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Guest list exported to CSV', 'success');
  },

  importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          showToast('CSV is empty or lacks headers', 'danger');
          return;
        }

        const eventId = this.getActiveEventId();
        let addedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
          if (cols[0]) {
            Storage.addGuest(eventId, {
              name: cols[0],
              category: cols[1] || 'Friends',
              rsvp: cols[2] || 'Invited',
              diet: cols[3] || 'Standard',
              plusOnes: parseInt(cols[4], 10) || 0,
              phone: cols[5] || '',
              email: cols[6] || '',
              table: cols[7] || '',
              notes: cols[8] || '',
            });
            addedCount++;
          }
        }

        this.render();
        showToast(`Successfully imported ${addedCount} guests!`, 'success');
      } catch (err) {
        showToast('Failed to parse CSV file: ' + err.message, 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },

  escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

