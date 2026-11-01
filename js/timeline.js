/**
 * EventEase AI – Event Timeline Module
 */

async function generateEventTimeline() {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('Please create an event first', 'error');
    navigateTo('create-event');
    return;
  }

  const loadingEl = document.getElementById('timelineLoading');
  const resultsEl = document.getElementById('timelineResults');
  const btn = document.getElementById('btnGenerateTimeline');

  loadingEl.style.display = 'block';
  resultsEl.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Building…`;
    lucide.createIcons();
  }

  try {
    let timelineData = await API.generateEventTimeline(event);

    const savedTimeline = Storage.getTimeline(event.id);
    const savedCompleted = savedTimeline?.completedIds || [];

    const tasks = (timelineData.tasks || []).map((task) => ({
      ...task,
      completed: savedCompleted.includes(task.id),
    }));

    Storage.saveTimeline(event.id, {
      _source: timelineData._source || 'smart',
      _model: timelineData._model || null,
      tasks,
      completedIds: savedCompleted,
    });

    renderTimeline(tasks, event, timelineData._source, timelineData._model);

    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';

    if (timelineData._source === 'ollama') {
      showToast(`Timeline generated via Local AI (${timelineData._model || 'Ollama'})! ⏰`, 'success');
    } else {
      showToast('Timeline scheduled using Smart Planning Mode! ⏰', 'info');
    }
  } catch (err) {
    console.warn('Timeline generation error:', err);
    const fallback = SmartPlanner.generateEventTimeline(event);
    Storage.saveTimeline(event.id, {
      _source: 'smart',
      tasks: fallback.tasks,
      completedIds: [],
    });
    renderTimeline(fallback.tasks, event, 'smart', null);
    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';
    showToast('Timeline scheduled using Smart Planning Mode! ⏰', 'info');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Generate Again`;
      lucide.createIcons();
    }
  }
}

function renderTimeline(tasks, event, source = 'smart', model = null) {
  const listEl = document.getElementById('timelineList');
  const progressEl = document.getElementById('progressOverview');
  const badgeEl = document.getElementById('timelineModeBadge');
  if (!listEl) return;

  // Render planning mode badge
  if (badgeEl) {
    badgeEl.style.display = 'flex';
    if (source === 'ollama') {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-ai">
          <span class="status-dot-sm status-connected-dot"></span>
          <strong>Local AI Scheduled</strong> &nbsp;·&nbsp; Model: ${model || OllamaClient.getModel()}
        </span>
      `;
    } else {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-smart">
          <span class="status-dot-sm status-smart-dot"></span>
          <strong>Smart Planning Mode</strong> &nbsp;·&nbsp; Chronological Milestone Engine
        </span>
      `;
    }
  }

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Progress overview
  if (progressEl) {
    const upcoming = tasks.filter((t) => !t.completed && new Date(t.dueDate) >= today).length;
    const overdue = tasks.filter((t) => !t.completed && new Date(t.dueDate) < today).length;

    progressEl.innerHTML = `
      <div class="progress-stat">
        <div class="progress-stat-num">${completed}</div>
        <div class="progress-stat-label">Completed</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-num">${upcoming}</div>
        <div class="progress-stat-label">Upcoming</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-num" style="color:#ef4444">${overdue}</div>
        <div class="progress-stat-label">Overdue</div>
      </div>
      <div class="progress-bar-overall">
        <div class="progress-bar-overall-label">
          <span>Overall Preparation Progress</span>
          <span>${pct}%</span>
        </div>
        <div class="progress-bar-overall-track">
          <div class="progress-bar-overall-fill" style="width:0%" data-width="${pct}%"></div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const fill = progressEl.querySelector('.progress-bar-overall-fill');
      if (fill) fill.style.width = fill.dataset.width;
    }, 100);
  }

  // Task list
  listEl.innerHTML = tasks
    .map((task) => {
      const dueDate = new Date(task.dueDate + 'T00:00:00');
      const isOverdue = !task.completed && dueDate < today;
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      let daysBadge = '';
      if (task.completed) {
        daysBadge = `<span class="days-badge" style="background:#f0fdf4;color:#16a34a;">✓ Completed</span>`;
      } else if (isOverdue) {
        daysBadge = `<span class="days-badge" style="background:#fef2f2;color:#dc2626;">${Math.abs(daysLeft)}d overdue</span>`;
      } else if (daysLeft === 0) {
        daysBadge = `<span class="days-badge" style="background:#fef2f2;color:#dc2626;">Due Today!</span>`;
      } else if (daysLeft <= 7) {
        daysBadge = `<span class="days-badge" style="background:#fffbeb;color:#b45309;">In ${daysLeft}d</span>`;
      } else {
        daysBadge = `<span class="days-badge">In ${daysLeft}d</span>`;
      }

      const priorityClass = `priority-${task.priority || 'medium'}`;
      const priorityLabel = (task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1);

      return `
      <div class="timeline-item ${task.completed ? 'completed' : ''} ${isOverdue && !task.completed ? 'overdue' : ''}" id="ti-${task.id}">
        <div class="timeline-checkbox ${task.completed ? 'checked' : ''}" 
             onclick="toggleTimelineTask('${task.id}')" 
             title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
        </div>
        <div class="timeline-info">
          <div class="timeline-task">${task.task}</div>
          <div class="timeline-date">
            <i data-lucide="calendar"></i>
            ${formatDate(task.dueDate)}
            ${task.description ? ` · <span style="color:#6b7280;">${task.description}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <span class="timeline-priority ${priorityClass}">${priorityLabel}</span>
          ${daysBadge}
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

function toggleTimelineTask(taskId) {
  const event = Storage.getCurrentEvent();
  if (!event) return;

  const timelineData = Storage.getTimeline(event.id);
  if (!timelineData) return;

  const tasks = timelineData.tasks || [];
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
  Storage.saveTimeline(event.id, { ...timelineData, tasks, completedIds });

  renderTimeline(tasks, event, timelineData._source, timelineData._model);
  lucide.createIcons();

  showToast(task.completed ? '✓ Task marked complete!' : 'Task marked incomplete', task.completed ? 'success' : 'info');
}

function loadTimelinePage() {
  const event = Storage.getCurrentEvent();
  const emptyEl = document.getElementById('timelineEmpty');
  const contentEl = document.getElementById('timelineContent');
  const headerBar = document.getElementById('timelineHeaderBar');
  const resultsEl = document.getElementById('timelineResults');

  if (!event) {
    emptyEl.style.display = 'block';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = 'block';

  const eventDate = new Date(event.date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  let badgeClass = daysUntil < 0 ? 'past' : daysUntil < 30 ? 'soon' : daysUntil < 90 ? 'near' : 'far';
  let badgeText = daysUntil < 0 ? 'Event passed' : daysUntil === 0 ? "Today's the day! 🎉" : `${daysUntil} days to go`;

  if (headerBar) {
    headerBar.innerHTML = `
      <div>
        <div style="font-size:12px;color:#9333ea;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${event.type}</div>
        <div style="font-size:18px;font-weight:800;color:#111827;">${event.name}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:4px;">${formatDate(event.date)}</div>
      </div>
      <div class="days-until-badge ${badgeClass}">
        <i data-lucide="clock"></i>
        ${badgeText}
      </div>
    `;
    lucide.createIcons();
  }

  // Load saved timeline
  const savedTimeline = Storage.getTimeline(event.id);
  if (savedTimeline?.tasks?.length) {
    renderTimeline(savedTimeline.tasks, event, savedTimeline._source, savedTimeline._model);
    resultsEl.style.display = 'block';
  } else {
    resultsEl.style.display = 'none';
  }
}
