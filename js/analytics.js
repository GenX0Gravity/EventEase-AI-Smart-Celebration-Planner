/**
 * EventEase AI – Reports, Analytics & Dossier Module
 * Generates comprehensive analytics charts, budget variance reports,
 * guest metrics, and printable event dossiers.
 */

const Analytics = {
  chartInstances: {},

  init() {
    this.render();
  },

  getActiveEvent() {
    return Storage.getActiveEvent() || DEMO_EVENT;
  },

  render() {
    const ev = this.getActiveEvent();
    if (!ev) return;

    this.renderMetrics(ev);
    this.renderCharts(ev);
  },

  renderMetrics(ev) {
    const budget = Number(ev.budget) || 0;
    const expenses = Storage.getExpenses(ev.id);
    let totalSpent = 0;
    expenses.forEach(e => { totalSpent += (Number(e.amount) || 0); });
    const remaining = budget - totalSpent;
    const budgetUtil = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

    const guests = Storage.getGuests(ev.id);
    let confirmedHeads = 0;
    guests.forEach(g => {
      if (g.rsvp === 'Confirmed') {
        confirmedHeads += (1 + (Number(g.plusOnes) || 0));
      }
    });

    const timeline = Storage.getTimeline(ev.id);
    const tasks = timeline && timeline.tasks ? timeline.tasks : [];
    const completedTasks = tasks.filter(t => t.completed).length;
    const taskPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const vendors = Storage.getVendors(ev.id);
    const bookedVendors = vendors.filter(v => v.bookingStatus === 'Booked' || v.bookingStatus === 'Completed').length;

    const elBudget = document.getElementById('reportTotalBudget');
    const elSpent = document.getElementById('reportTotalSpent');
    const elRemaining = document.getElementById('reportRemainingBudget');
    const elGuests = document.getElementById('reportConfirmedGuests');
    const elTasks = document.getElementById('reportTaskCompletion');
    const elVendors = document.getElementById('reportBookedVendors');

    if (elBudget) elBudget.textContent = Storage.formatMoney(budget);
    if (elSpent) elSpent.textContent = Storage.formatMoney(totalSpent);
    if (elRemaining) {
      elRemaining.textContent = Storage.formatMoney(remaining);
      elRemaining.style.color = remaining < 0 ? '#ef4444' : '#10b981';
    }
    if (elGuests) elGuests.textContent = `${confirmedHeads} guests`;
    if (elTasks) elTasks.textContent = `${taskPct}% (${completedTasks}/${tasks.length})`;
    if (elVendors) elVendors.textContent = `${bookedVendors} / ${vendors.length}`;
  },

  renderCharts(ev) {
    this.renderSpendingChart(ev);
    this.renderGuestRsvpChart(ev);
  },

  renderSpendingChart(ev) {
    const canvas = document.getElementById('reportSpendingChart');
    if (!canvas) return;

    if (this.chartInstances.spending) {
      this.chartInstances.spending.destroy();
    }

    const expenses = Storage.getExpenses(ev.id);
    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) {
      labels.push('Venue', 'Catering', 'Decor', 'Photo', 'Misc');
      data.push(150000, 100000, 50000, 40000, 20000);
    }

    const ctx = canvas.getContext('2d');
    this.chartInstances.spending = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Actual Spent (' + Storage.getProfile().currency + ')',
          data,
          backgroundColor: '#8b5cf6',
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  },

  renderGuestRsvpChart(ev) {
    const canvas = document.getElementById('reportGuestChart');
    if (!canvas) return;

    if (this.chartInstances.guest) {
      this.chartInstances.guest.destroy();
    }

    const guests = Storage.getGuests(ev.id);
    let confirmed = 0;
    let pending = 0;
    let declined = 0;

    guests.forEach(g => {
      if (g.rsvp === 'Confirmed') confirmed++;
      else if (g.rsvp === 'Declined') declined++;
      else pending++;
    });

    if (guests.length === 0) {
      confirmed = 50; pending = 20; declined = 5;
    }

    const ctx = canvas.getContext('2d');
    this.chartInstances.guest = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Confirmed', 'Pending', 'Declined'],
        datasets: [{
          data: [confirmed, pending, declined],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  generatePrintableDossier() {
    const ev = this.getActiveEvent();
    const budget = Storage.getBudget(ev.id);
    const expenses = Storage.getExpenses(ev.id);
    const guests = Storage.getGuests(ev.id);
    const vendors = Storage.getVendors(ev.id);
    const timeline = Storage.getTimeline(ev.id);
    const schedule = Storage.getDaySchedule(ev.id);

    let doc = `# EVENT DOSSIER: ${ev.name.toUpperCase()}\n`;
    doc += `Generated via EventEase AI on ${new Date().toLocaleDateString()}\n`;
    doc += `------------------------------------------------------------\n\n`;

    doc += `## 1. GENERAL INFORMATION\n`;
    doc += `- Event Type: ${ev.type}\n`;
    doc += `- Date: ${ev.date} (${ev.startTime || 'Start'} to ${ev.endTime || 'End'})\n`;
    doc += `- Location: ${ev.location}\n`;
    doc += `- Expected Guests: ${ev.guests}\n`;
    doc += `- Total Budget: ${Storage.formatMoney(ev.budget)}\n`;
    doc += `- Theme: ${ev.theme || 'Elegant'}\n\n`;

    doc += `## 2. GUEST & RSVP STATUS\n`;
    doc += `- Total Listed: ${guests.length}\n`;
    doc += `- Confirmed: ${guests.filter(g => g.rsvp === 'Confirmed').length}\n`;
    doc += `- Pending: ${guests.filter(g => g.rsvp === 'Invited' || g.rsvp === 'Maybe').length}\n`;
    doc += `- Declined: ${guests.filter(g => g.rsvp === 'Declined').length}\n\n`;

    doc += `## 3. VENDOR CONTACT DIRECTORY\n`;
    vendors.forEach(v => {
      doc += `* [${v.category}] ${v.name} - ${v.contact} (${v.phone || 'No phone'}) | Status: ${v.bookingStatus} | Final: ${Storage.formatMoney(v.finalPrice || v.quotedPrice)}\n`;
    });
    doc += `\n`;

    doc += `## 4. RUN OF SHOW / DAY SCHEDULE\n`;
    schedule.forEach(s => {
      doc += `* ${s.time}: ${s.title} ${s.responsible ? `(Lead: ${s.responsible})` : ''}\n`;
    });
    doc += `\n`;

    doc += `------------------------------------------------------------\n`;
    doc += `EventEase AI – Plan Less. Celebrate More. 100% Free & Private.\n`;

    // Download text file
    const blob = new Blob([doc], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_dossier_${ev.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Event dossier downloaded! 📄', 'success');
  }
};

