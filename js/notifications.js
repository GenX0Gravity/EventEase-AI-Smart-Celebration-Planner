/**
 * EventEase AI – Smart Notifications Center Module
 * Evaluates real-time deadlines, overdue tasks, overspending categories,
 * and pending RSVPs dynamically.
 */

const Notifications = {
  isOpen: false,

  init() {
    this.refreshDynamicNotifications();
    this.renderBellBadge();
    this.setupListeners();
  },

  setupListeners() {
    const bellBtn = document.getElementById('btnNotificationsBell');
    const panel = document.getElementById('notificationsFlyout');
    const markReadBtn = document.getElementById('btnMarkAllNotificationsRead');
    const clearBtn = document.getElementById('btnClearAllNotifications');

    if (bellBtn) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFlyout();
      });
    }

    if (panel) {
      panel.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('click', () => {
      if (this.isOpen) this.closeFlyout();
    });

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        Storage.markAllNotificationsRead();
        this.render();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Storage.clearNotifications();
        this.render();
      });
    }
  },

  toggleFlyout() {
    if (this.isOpen) {
      this.closeFlyout();
    } else {
      this.openFlyout();
    }
  },

  openFlyout() {
    const panel = document.getElementById('notificationsFlyout');
    if (panel) {
      this.refreshDynamicNotifications();
      this.render();
      panel.classList.add('active');
      this.isOpen = true;
    }
  },

  closeFlyout() {
    const panel = document.getElementById('notificationsFlyout');
    if (panel) {
      panel.classList.remove('active');
      this.isOpen = false;
    }
  },

  refreshDynamicNotifications() {
    const ev = Storage.getActiveEvent();
    if (!ev) return;

    // Check budget overspending
    const budget = Storage.getBudget(ev.id);
    const expenses = Storage.getExpenses(ev.id);
    if (budget && budget.categories) {
      const actualByCategory = {};
      expenses.forEach(e => {
        actualByCategory[e.category] = (actualByCategory[e.category] || 0) + (Number(e.amount) || 0);
      });

      budget.categories.forEach(cat => {
        const actual = actualByCategory[cat.name] || 0;
        if (actual > cat.amount) {
          const over = actual - cat.amount;
          this.ensureNotification({
            id: `overspend_${cat.name}_${ev.id}`,
            title: `Budget Alert: ${cat.name}`,
            message: `Actual expenses for ${cat.name} exceeded allocation by ${Storage.formatMoney(over)}.`,
            type: 'danger',
            linkPage: 'budget',
          });
        }
      });
    }

    // Check overdue tasks
    const timeline = Storage.getTimeline(ev.id);
    if (timeline && timeline.tasks && ev.date) {
      const eventDate = new Date(ev.date);
      timeline.tasks.forEach(t => {
        if (!t.completed) {
          const due = new Date(eventDate);
          due.setDate(due.getDate() - (t.daysBeforeEvent || 0));
          const now = new Date();
          if (due < now) {
            this.ensureNotification({
              id: `overdue_${t.id}_${ev.id}`,
              title: 'Overdue Task',
              message: `"${t.task}" is overdue. Scheduled for ${due.toLocaleDateString()}.`,
              type: 'warning',
              linkPage: 'timeline',
            });
          }
        }
      });
    }

    // Check pending RSVPs if event is within 30 days
    if (ev.date) {
      const daysUntil = (new Date(ev.date) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntil > 0 && daysUntil < 30) {
        const guests = Storage.getGuests(ev.id);
        const pending = guests.filter(g => g.rsvp === 'Invited' || g.rsvp === 'Maybe').length;
        if (pending > 0) {
          this.ensureNotification({
            id: `rsvp_alert_${ev.id}`,
            title: 'Pending RSVPs Reminder',
            message: `${pending} guests have not confirmed attendance with ${Math.round(daysUntil)} days left.`,
            type: 'info',
            linkPage: 'guests',
          });
        }
      }
    }

    this.renderBellBadge();
  },

  ensureNotification(notif) {
    const list = Storage.getNotifications();
    const exists = list.some(n => n.id === notif.id);
    if (!exists) {
      Storage.addNotification(notif);
    }
  },

  renderBellBadge() {
    const badge = document.getElementById('notificationsBadgeCount');
    if (!badge) return;
    const list = Storage.getNotifications();
    const unread = list.filter(n => !n.read).length;
    if (unread > 0) {
      badge.textContent = unread > 9 ? '9+' : unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  },

  render() {
    this.renderBellBadge();
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const list = Storage.getNotifications();
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-notifications">
          <i data-lucide="bell-off"></i>
          <p>No notifications right now.<br>Everything looks on track!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    let html = '';
    list.forEach(n => {
      const typeIcons = {
        danger: 'alert-triangle',
        warning: 'alert-circle',
        info: 'info',
        success: 'check-circle-2',
      };
      const icon = typeIcons[n.type] || 'bell';

      html += `
        <div class="notification-item ${n.read ? 'read' : 'unread'} type-${n.type}" onclick="Notifications.handleItemClick('${n.id}', '${n.linkPage}')">
          <div class="notif-icon-col">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="notif-body-col">
            <div class="notif-title-row">
              <strong>${this.escapeHTML(n.title)}</strong>
              ${!n.read ? '<span class="unread-dot"></span>' : ''}
            </div>
            <p class="notif-message">${this.escapeHTML(n.message)}</p>
            <span class="notif-time">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${new Date(n.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    lucide.createIcons();
  },

  handleItemClick(id, linkPage) {
    Storage.markNotificationRead(id);
    this.render();
    if (linkPage) {
      this.closeFlyout();
      navigateTo(linkPage);
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
