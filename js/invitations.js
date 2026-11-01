/**
 * EventEase AI – Invitation Studio Module
 * Visual invitation card designer with live preview, canvas PNG download,
 * clean printable view, and WhatsApp/SMS copyable text.
 */

const Invitations = {
  currentConfig: {
    template: 'royal',
    hostNames: '',
    coupleNames: '',
    eventTitle: '',
    dateText: '',
    timeText: '',
    venueName: '',
    venueAddress: '',
    rsvpDate: '',
    rsvpContact: '',
    dressCode: 'Formal Festive Attire',
    primaryColor: '#8b0000',
    accentColor: '#d4af37',
    fontFamily: 'Playfair Display',
  },

  init() {
    this.loadFromActiveEvent();
    this.setupListeners();
    this.updatePreview();
  },

  setupListeners() {
    const inputs = [
      'invTemplate', 'invHostNames', 'invCoupleNames', 'invEventTitle',
      'invDateText', 'invTimeText', 'invVenueName', 'invVenueAddress',
      'invRsvpDate', 'invRsvpContact', 'invDressCode', 'invPrimaryColor',
      'invAccentColor', 'invFontFamily'
    ];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.readFormValues();
          this.updatePreview();
        });
        el.addEventListener('change', () => {
          this.readFormValues();
          this.updatePreview();
          this.saveConfig();
        });
      }
    });

    const btnDownload = document.getElementById('btnDownloadInvitationPng');
    const btnPrint = document.getElementById('btnPrintInvitation');
    const btnCopyText = document.getElementById('btnCopyInvitationText');

    if (btnDownload) {
      btnDownload.addEventListener('click', () => this.downloadAsImage());
    }
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.printInvitation());
    }
    if (btnCopyText) {
      btnCopyText.addEventListener('click', () => this.copyText());
    }

    // Template selector cards
    document.querySelectorAll('.inv-template-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tpl = chip.dataset.template;
        const sel = document.getElementById('invTemplate');
        if (sel) sel.value = tpl;
        this.currentConfig.template = tpl;
        this.applyTemplatePreset(tpl);
        this.updatePreview();
        this.saveConfig();
      });
    });
  },

  loadFromActiveEvent() {
    const ev = Storage.getActiveEvent();
    if (!ev) return;

    const saved = Storage.getInvitation(ev.id);
    if (saved) {
      this.currentConfig = { ...this.currentConfig, ...saved };
    } else {
      // Prepopulate from event details
      this.currentConfig.hostNames = 'The Family of ' + ev.name;
      this.currentConfig.coupleNames = ev.name;
      this.currentConfig.eventTitle = `Cordially invite you to celebrate the ${ev.type || 'Celebration'}`;
      this.currentConfig.dateText = ev.date ? new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Upcoming Date';
      this.currentConfig.timeText = (ev.startTime || '11:00 AM') + ' onwards';
      this.currentConfig.venueName = ev.location || 'The Grand Hall';
      this.currentConfig.venueAddress = 'Main Banquet Hall, City';
      this.currentConfig.rsvpDate = 'Please RSVP 2 weeks prior';
      this.currentConfig.rsvpContact = '+91 98765 43210';
      this.currentConfig.dressCode = 'Festive & Elegant';
      if (ev.type === 'Birthday') {
        this.currentConfig.template = 'vibrant';
        this.currentConfig.primaryColor = '#9333ea';
        this.currentConfig.accentColor = '#ec4899';
      }
    }

    this.populateForm();
  },

  populateForm() {
    const c = this.currentConfig;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('invTemplate', c.template);
    setVal('invHostNames', c.hostNames);
    setVal('invCoupleNames', c.coupleNames);
    setVal('invEventTitle', c.eventTitle);
    setVal('invDateText', c.dateText);
    setVal('invTimeText', c.timeText);
    setVal('invVenueName', c.venueName);
    setVal('invVenueAddress', c.venueAddress);
    setVal('invRsvpDate', c.rsvpDate);
    setVal('invRsvpContact', c.rsvpContact);
    setVal('invDressCode', c.dressCode);
    setVal('invPrimaryColor', c.primaryColor);
    setVal('invAccentColor', c.accentColor);
    setVal('invFontFamily', c.fontFamily);
  },

  readFormValues() {
    const getVal = (id) => document.getElementById(id)?.value || '';
    this.currentConfig = {
      template: getVal('invTemplate') || 'royal',
      hostNames: getVal('invHostNames'),
      coupleNames: getVal('invCoupleNames'),
      eventTitle: getVal('invEventTitle'),
      dateText: getVal('invDateText'),
      timeText: getVal('invTimeText'),
      venueName: getVal('invVenueName'),
      venueAddress: getVal('invVenueAddress'),
      rsvpDate: getVal('invRsvpDate'),
      rsvpContact: getVal('invRsvpContact'),
      dressCode: getVal('invDressCode'),
      primaryColor: getVal('invPrimaryColor') || '#8b0000',
      accentColor: getVal('invAccentColor') || '#d4af37',
      fontFamily: getVal('invFontFamily') || 'Playfair Display',
    };
  },

  applyTemplatePreset(tpl) {
    if (tpl === 'royal') {
      this.currentConfig.primaryColor = '#700c14';
      this.currentConfig.accentColor = '#d4af37';
      this.currentConfig.fontFamily = 'Playfair Display';
    } else if (tpl === 'vibrant') {
      this.currentConfig.primaryColor = '#6b21a8';
      this.currentConfig.accentColor = '#f43f5e';
      this.currentConfig.fontFamily = 'Inter';
    } else if (tpl === 'minimal') {
      this.currentConfig.primaryColor = '#0f172a';
      this.currentConfig.accentColor = '#94a3b8';
      this.currentConfig.fontFamily = 'Inter';
    } else if (tpl === 'garden') {
      this.currentConfig.primaryColor = '#14532d';
      this.currentConfig.accentColor = '#ca8a04';
      this.currentConfig.fontFamily = 'Playfair Display';
    } else if (tpl === 'corporate') {
      this.currentConfig.primaryColor = '#1e3a8a';
      this.currentConfig.accentColor = '#60a5fa';
      this.currentConfig.fontFamily = 'Inter';
    }
    this.populateForm();
  },

  saveConfig() {
    const ev = Storage.getActiveEvent();
    if (ev) {
      Storage.saveInvitation(ev.id, this.currentConfig);
    }
  },

  updatePreview() {
    const preview = document.getElementById('invitationCardPreview');
    if (!preview) return;

    const c = this.currentConfig;
    preview.className = `invitation-card-preview template-${c.template}`;
    preview.style.fontFamily = c.fontFamily === 'Playfair Display' ? "'Playfair Display', serif" : "'Inter', sans-serif";
    preview.style.setProperty('--card-primary', c.primaryColor);
    preview.style.setProperty('--card-accent', c.accentColor);

    preview.innerHTML = `
      <div class="card-inner-border">
        <div class="card-corner tl"></div>
        <div class="card-corner tr"></div>
        <div class="card-corner bl"></div>
        <div class="card-corner br"></div>

        <div class="card-header-ornament">
          <span class="ornament-glyph">✦ ❖ ✦</span>
        </div>

        <div class="card-hosts">${this.escapeHTML(c.hostNames || 'The Host Family')}</div>
        <div class="card-title">${this.escapeHTML(c.eventTitle || 'Cordially invites you to celebrate')}</div>
        <div class="card-couple">${this.escapeHTML(c.coupleNames || 'Our Celebration')}</div>

        <div class="card-divider-line"></div>

        <div class="card-datetime">
          <div class="card-date">${this.escapeHTML(c.dateText || 'Saturday, December 20, 2026')}</div>
          <div class="card-time">${this.escapeHTML(c.timeText || '6:00 PM Onwards')}</div>
        </div>

        <div class="card-venue-block">
          <div class="card-venue-name">${this.escapeHTML(c.venueName || 'The Grand Palace Hall')}</div>
          <div class="card-venue-addr">${this.escapeHTML(c.venueAddress || 'City Center')}</div>
        </div>

        ${c.dressCode ? `<div class="card-dress-code">Dress Code: <strong>${this.escapeHTML(c.dressCode)}</strong></div>` : ''}

        <div class="card-footer-rsvp">
          <div class="card-rsvp-label">R. S. V. P.</div>
          <div class="card-rsvp-text">${this.escapeHTML(c.rsvpContact || 'Contact Host')}</div>
          ${c.rsvpDate ? `<div class="card-rsvp-date">Kindly respond by ${this.escapeHTML(c.rsvpDate)}</div>` : ''}
        </div>
      </div>
    `;
  },

  downloadAsImage() {
    const card = document.getElementById('invitationCardPreview');
    if (!card) return;

    // Use HTML5 Canvas to render a beautiful high-res card
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const c = this.currentConfig;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (c.template === 'royal') {
      bgGrad.addColorStop(0, '#580811');
      bgGrad.addColorStop(1, '#2c0409');
    } else if (c.template === 'vibrant') {
      bgGrad.addColorStop(0, '#4c1d95');
      bgGrad.addColorStop(1, '#831843');
    } else if (c.template === 'garden') {
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(1, '#022c22');
    } else if (c.template === 'corporate') {
      bgGrad.addColorStop(0, '#172554');
      bgGrad.addColorStop(1, '#0f172a');
    } else {
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ornate Border
    ctx.strokeStyle = c.accentColor || '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Text styling
    ctx.textAlign = 'center';
    ctx.fillStyle = c.accentColor || '#d4af37';

    // Ornament
    ctx.font = '24px Georgia, serif';
    ctx.fillText('✦ ❖ ✦', width / 2, 110);

    // Host
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#f3f4f6';
    ctx.fillText(c.hostNames || 'The Host Family', width / 2, 180);

    // Title
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(c.eventTitle || 'Cordially invites you to celebrate', width / 2, 230);

    // Main Names
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillStyle = c.accentColor || '#ffd700';
    ctx.fillText(c.coupleNames || 'Our Celebration', width / 2, 330);

    // Divider
    ctx.strokeStyle = c.accentColor || '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 390);
    ctx.lineTo(width / 2 + 120, 390);
    ctx.stroke();

    // Date & Time
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.dateText || 'Saturday, December 20, 2026', width / 2, 470);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(c.timeText || '6:00 PM Onwards', width / 2, 520);

    // Venue
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillStyle = c.accentColor || '#ffd700';
    ctx.fillText(c.venueName || 'The Grand Palace Hall', width / 2, 640);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(c.venueAddress || 'City Center', width / 2, 680);

    // Dress code
    if (c.dressCode) {
      ctx.font = 'italic 19px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Dress Code: ' + c.dressCode, width / 2, 770);
    }

    // RSVP Section
    ctx.strokeStyle = c.accentColor || '#d4af37';
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, 850);
    ctx.lineTo(width / 2 + 80, 850);
    ctx.stroke();

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = c.accentColor || '#ffd700';
    ctx.fillText('R. S. V. P.', width / 2, 890);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(c.rsvpContact || 'Contact Host', width / 2, 930);

    if (c.rsvpDate) {
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Kindly respond by ' + c.rsvpDate, width / 2, 970);
    }

    // Download PNG
    const link = document.createElement('a');
    link.download = `invitation_${(c.coupleNames || 'event').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Invitation image downloaded! 🖼️', 'success');
  },

  printInvitation() {
    window.print();
  },

  copyText() {
    const c = this.currentConfig;
    const msg = `✨ *INSPECTION & INVITATION* ✨\n\n` +
      `*${c.hostNames || 'Our Family'}*\n` +
      `${c.eventTitle || 'Cordially invites you to celebrate'}\n\n` +
      `🎉 *${c.coupleNames || 'Our Celebration'}* 🎉\n\n` +
      `📅 *Date:* ${c.dateText || 'Event Day'}\n` +
      `⏰ *Time:* ${c.timeText || '11:00 AM onwards'}\n` +
      `📍 *Venue:* ${c.venueName || 'Grand Hall'}, ${c.venueAddress || ''}\n` +
      (c.dressCode ? `👔 *Dress Code:* ${c.dressCode}\n` : '') +
      `\n💌 *RSVP:* ${c.rsvpContact || ''} ${c.rsvpDate ? `(by ${c.rsvpDate})` : ''}\n\n` +
      `We eagerly await your presence and blessings! ❤️`;

    navigator.clipboard.writeText(msg);
    showToast('Invitation text copied for WhatsApp / SMS! 📋', 'success');
  },

  escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

