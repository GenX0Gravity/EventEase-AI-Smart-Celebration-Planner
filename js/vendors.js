/**
 * EventEase AI – Vendor Coordination & Tracking Module
 * Manages event vendors, quote comparisons, booking milestones,
 * and payment status.
 */

const Vendors = {
  currentCategory: 'all',
  currentStatus: 'all',
  searchQuery: '',
  editingVendorId: null,

  init() {
    this.render();
    this.setupListeners();
  },

  setupListeners() {
    const searchInput = document.getElementById('vendorSearchInput');
    const filterCat = document.getElementById('vendorFilterCategory');
    const filterStatus = document.getElementById('vendorFilterStatus');
    const btnAddVendor = document.getElementById('btnAddVendor');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderTable();
      });
    }

    if (filterCat) {
      filterCat.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.renderTable();
      });
    }

    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.currentStatus = e.target.value;
        this.renderTable();
      });
    }

    if (btnAddVendor) {
      btnAddVendor.addEventListener('click', () => this.openVendorModal());
    }
  },

  getActiveEventId() {
    const ev = Storage.getActiveEvent();
    return ev ? ev.id : 'default';
  },

  render() {
    this.renderStats();
    this.renderTable();
  },

  renderStats() {
    const eventId = this.getActiveEventId();
    const vendors = Storage.getVendors(eventId);

    const totalVendors = vendors.length;
    let bookedCount = 0;
    let totalCommitted = 0;
    let totalQuoted = 0;
    let pendingPaymentCount = 0;

    vendors.forEach(v => {
      totalQuoted += (Number(v.quotedPrice) || 0);
      const price = Number(v.finalPrice) || Number(v.quotedPrice) || 0;
      if (v.bookingStatus === 'Booked' || v.bookingStatus === 'Completed') {
        bookedCount++;
        totalCommitted += price;
      }
      if (v.paymentStatus === 'Pending' || v.paymentStatus === 'Deposit Paid') {
        pendingPaymentCount++;
      }
    });

    const elTotal = document.getElementById('statVendorTotal');
    const elBooked = document.getElementById('statVendorBooked');
    const elCommitted = document.getElementById('statVendorCommitted');
    const elSavings = document.getElementById('statVendorSavings');

    if (elTotal) elTotal.textContent = totalVendors;
    if (elBooked) elBooked.textContent = `${bookedCount} / ${totalVendors}`;
    if (elCommitted) elCommitted.textContent = Storage.formatMoney(totalCommitted);
    if (elSavings) {
      const negotiatedSavings = Math.max(0, totalQuoted - totalCommitted);
      elSavings.textContent = Storage.formatMoney(negotiatedSavings);
    }
  },

  renderTable() {
    const eventId = this.getActiveEventId();
    const vendors = Storage.getVendors(eventId);
    const tbody = document.getElementById('vendorTableBody');
    if (!tbody) return;

    let filtered = vendors.filter(v => {
      const matchSearch = !this.searchQuery ||
        v.name.toLowerCase().includes(this.searchQuery) ||
        (v.contact && v.contact.toLowerCase().includes(this.searchQuery)) ||
        (v.email && v.email.toLowerCase().includes(this.searchQuery));
      
      const matchCat = this.currentCategory === 'all' || v.category === this.currentCategory;
      const matchStatus = this.currentStatus === 'all' || v.bookingStatus === this.currentStatus;

      return matchSearch && matchCat && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-empty-cell">
            <div class="empty-state-mini">
              <i data-lucide="briefcase"></i>
              <p>No vendors listed under this filter.</p>
              <button class="btn-primary-sm" onclick="Vendors.openVendorModal()">+ Add Your First Vendor</button>
            </div>
          </td>
        </tr>
      `;
      lucide.createIcons();
      return;
    }

    let html = '';
    filtered.forEach(v => {
      const statusBadge = {
        Booked: 'badge-success',
        Shortlisted: 'badge-warning',
        Contacted: 'badge-info',
        Researching: 'badge-neutral',
        Completed: 'badge-purple',
      }[v.bookingStatus] || 'badge-neutral';

      const payBadge = {
        'Fully Paid': 'badge-success',
        'Deposit Paid': 'badge-warning',
        Pending: 'badge-danger',
      }[v.paymentStatus] || 'badge-neutral';

      html += `
        <tr>
          <td>
            <strong>${this.escapeHTML(v.name)}</strong>
            ${v.notes ? `<div class="table-subtext">${this.escapeHTML(v.notes)}</div>` : ''}
          </td>
          <td><span class="badge-category">${this.escapeHTML(v.category)}</span></td>
          <td>
            <div>${this.escapeHTML(v.contact || 'Primary Contact')}</div>
            <div class="table-subtext">
              ${v.phone ? `<span>📞 ${this.escapeHTML(v.phone)}</span>` : ''}
              ${v.email ? `<span style="margin-left:6px;">✉️ ${this.escapeHTML(v.email)}</span>` : ''}
            </div>
          </td>
          <td>
            <div class="vendor-price-cell">
              <span class="price-final">${Storage.formatMoney(v.finalPrice || v.quotedPrice || 0)}</span>
              ${v.finalPrice && v.quotedPrice && v.quotedPrice > v.finalPrice 
                ? `<span class="price-quoted-striked">${Storage.formatMoney(v.quotedPrice)}</span>` 
                : ''}
            </div>
          </td>
          <td>
            <select class="rsvp-inline-select ${statusBadge}" onchange="Vendors.updateBookingStatus('${v.id}', this.value)">
              <option value="Researching" ${v.bookingStatus === 'Researching' ? 'selected' : ''}>Researching</option>
              <option value="Contacted" ${v.bookingStatus === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Shortlisted" ${v.bookingStatus === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
              <option value="Booked" ${v.bookingStatus === 'Booked' ? 'selected' : ''}>Booked</option>
              <option value="Completed" ${v.bookingStatus === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </td>
          <td>
            <select class="rsvp-inline-select ${payBadge}" onchange="Vendors.updatePaymentStatus('${v.id}', this.value)">
              <option value="Pending" ${v.paymentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Deposit Paid" ${v.paymentStatus === 'Deposit Paid' ? 'selected' : ''}>Deposit Paid</option>
              <option value="Fully Paid" ${v.paymentStatus === 'Fully Paid' ? 'selected' : ''}>Fully Paid</option>
            </select>
          </td>
          <td class="table-actions-cell">
            <button class="btn-icon-sm" onclick="Vendors.openVendorModal('${v.id}')" title="Edit Vendor">
              <i data-lucide="pencil"></i>
            </button>
            <button class="btn-icon-sm btn-icon-danger" onclick="Vendors.deleteVendor('${v.id}')" title="Delete Vendor">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    lucide.createIcons();
  },

  updateBookingStatus(vendorId, newStatus) {
    const eventId = this.getActiveEventId();
    const vendor = Storage.getVendors(eventId).find(v => v.id === vendorId);
    if (vendor) {
      vendor.bookingStatus = newStatus;
      Storage.updateVendor(eventId, vendor);
      this.renderStats();
      this.renderTable();
      showToast(`Updated booking status for ${vendor.name} to ${newStatus}`, 'info');
    }
  },

  updatePaymentStatus(vendorId, newPayStatus) {
    const eventId = this.getActiveEventId();
    const vendor = Storage.getVendors(eventId).find(v => v.id === vendorId);
    if (vendor) {
      vendor.paymentStatus = newPayStatus;
      Storage.updateVendor(eventId, vendor);
      this.renderStats();
      this.renderTable();
      showToast(`Updated payment status for ${vendor.name} to ${newPayStatus}`, 'info');
    }
  },

  openVendorModal(vendorId = null) {
    this.editingVendorId = vendorId;
    const modal = document.getElementById('vendorModal');
    const title = document.getElementById('vendorModalTitle');
    const form = document.getElementById('vendorForm');
    if (!modal || !form) return;

    form.reset();

    if (vendorId) {
      title.textContent = 'Edit Vendor Details';
      const eventId = this.getActiveEventId();
      const vendor = Storage.getVendors(eventId).find(v => v.id === vendorId);
      if (vendor) {
        document.getElementById('vendorFormName').value = vendor.name || '';
        document.getElementById('vendorFormCategory').value = vendor.category || 'Venue';
        document.getElementById('vendorFormContact').value = vendor.contact || '';
        document.getElementById('vendorFormPhone').value = vendor.phone || '';
        document.getElementById('vendorFormEmail').value = vendor.email || '';
        document.getElementById('vendorFormQuoted').value = vendor.quotedPrice || '';
        document.getElementById('vendorFormFinal').value = vendor.finalPrice || '';
        document.getElementById('vendorFormBookingStatus').value = vendor.bookingStatus || 'Researching';
        document.getElementById('vendorFormPaymentStatus').value = vendor.paymentStatus || 'Pending';
        document.getElementById('vendorFormNotes').value = vendor.notes || '';
      }
    } else {
      title.textContent = 'Add New Vendor';
    }

    modal.classList.add('active');
  },

  closeVendorModal() {
    const modal = document.getElementById('vendorModal');
    if (modal) modal.classList.remove('active');
    this.editingVendorId = null;
  },

  saveVendorFromModal() {
    const name = document.getElementById('vendorFormName')?.value.trim();
    if (!name) {
      alert('Please enter vendor name');
      return;
    }

    const eventId = this.getActiveEventId();
    const vendorData = {
      name,
      category: document.getElementById('vendorFormCategory')?.value || 'Venue',
      contact: document.getElementById('vendorFormContact')?.value.trim() || '',
      phone: document.getElementById('vendorFormPhone')?.value.trim() || '',
      email: document.getElementById('vendorFormEmail')?.value.trim() || '',
      quotedPrice: parseFloat(document.getElementById('vendorFormQuoted')?.value) || 0,
      finalPrice: parseFloat(document.getElementById('vendorFormFinal')?.value) || 0,
      bookingStatus: document.getElementById('vendorFormBookingStatus')?.value || 'Researching',
      paymentStatus: document.getElementById('vendorFormPaymentStatus')?.value || 'Pending',
      notes: document.getElementById('vendorFormNotes')?.value.trim() || '',
    };

    if (this.editingVendorId) {
      vendorData.id = this.editingVendorId;
      Storage.updateVendor(eventId, vendorData);
      showToast(`Updated vendor ${name}`, 'success');
    } else {
      Storage.addVendor(eventId, vendorData);
      showToast(`Added ${name} to vendor list`, 'success');
    }

    this.closeVendorModal();
    this.render();
  },

  deleteVendor(vendorId) {
    const eventId = this.getActiveEventId();
    const vendor = Storage.getVendors(eventId).find(v => v.id === vendorId);
    const vendorName = vendor ? vendor.name : 'this vendor';

    if (confirm(`Remove ${vendorName} from vendor list?`)) {
      Storage.deleteVendor(eventId, vendorId);
      this.render();
      showToast(`Removed ${vendorName}`, 'info');
    }
  },

  escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
