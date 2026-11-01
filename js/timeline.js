/**
 * EventEase AI – Event Timeline Module
 */

async function generateEventTimeline() {
  const event = Storage.getActiveEvent();
  if (!event) {
    showToast('Please create an event first', 'error');
    navigateTo('create-event');
    return;
  }

  const loadingEl = document.getElementById('timelineLoading');
  const resultsEl = document.getElementById('timelineResults');
  const btn = document.getElementById('btnGenerateTimeline');

  if (loadingEl) loadingEl.style.display = 'block';
  if (resultsEl) resultsEl.style.display = 'none';
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

    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';

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
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';
    showToast('Timeline scheduled using Smart Planning Mode! ⏰', 'info');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Regenerate Timeline`;
      lucide.createIcons();
    }
  }
}

function generateTimeline() {
  return generateEventTimeline();
}

function renderTimeline(tasks, event, source = 'smart', model = null) {
  const listEl = document.getElementById('timelineTasksList') || document.getElementById('timelineList');
  const progressEl = document.getElementById('progressOverview');
  const badgeEl = document.getElementById('timelineModeBadge');
  const progressCard = document.getElementById('timelineProgressCard');
  const percentEl = document.getElementById('timelinePercent');
  const barEl = document.getElementById('timelineProgressBar');

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

  if (progressCard) {
    progressCard.style.display = 'block';
    if (percentEl) percentEl.textContent = `${pct}% (${completed}/${total} completed)`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  // Progress overview (if exists)
  if (progressEl) {
    const upcoming = tasks.filter((t) => !t.completed && new Date(t.dueDate || today) >= today).length;
    const overdue = tasks.filter((t) => !t.completed && new Date(t.dueDate || today) < today).length;

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
    `;
  }

  const eventDateObj = new Date(event.date + 'T00:00:00');

  // Task list
  listEl.innerHTML = tasks
    .map((task) => {
      let dueDate;
      if (task.dueDate) {
        dueDate = new Date(task.dueDate + 'T00:00:00');
      } else {
        dueDate = new Date(eventDateObj);
        dueDate.setDate(dueDate.getDate() - (task.daysBeforeEvent || 0));
      }

      const isOverdue = !task.completed && dueDate < today;
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      let daysBadge = '';
      if (task.completed) {
        daysBadge = `<span class="badge-pill badge-success">✓ Completed</span>`;
      } else if (isOverdue) {
        daysBadge = `<span class="badge-pill badge-danger">⚠️ Overdue (${Math.abs(daysLeft)}d ago)</span>`;
      } else if (daysLeft === 0) {
        daysBadge = `<span class="badge-pill badge-warning">Due Today!</span>`;
      } else {
        daysBadge = `<span class="badge-pill badge-neutral">${daysLeft}d left</span>`;
      }

      const priorityClass = {
        high: 'badge-danger',
        medium: 'badge-warning',
        low: 'badge-info',
      }[task.priority] || 'badge-neutral';

      return `
      <div class="timeline-task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" id="task_${task.id}" style="background:var(--white);border:1px solid var(--gray-200);border-radius:var(--radius-lg);padding:16px 20px;margin-bottom:12px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:16px;">
        <label class="schedule-check-label">
          <input type="checkbox" class="schedule-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
          <span class="custom-check-mark"></span>
        </label>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
            <strong style="font-size:15px;${task.completed ? 'text-decoration:line-through;color:var(--gray-400);' : ''}">${escapeHTML(task.task)}</strong>
            <span class="badge-category">${escapeHTML(task.category || 'General')}</span>
            <span class="badge-pill ${priorityClass}" style="text-transform:uppercase;font-size:10px;">${task.priority || 'Normal'}</span>
          </div>
          ${task.description ? `<p style="font-size:12.5px;color:var(--gray-500);margin:0;">${escapeHTML(task.description)}</p>` : ''}
          <div style="font-size:11px;color:var(--gray-400);margin-top:4px;">
            Target Date: <strong>${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            (T - ${task.daysBeforeEvent || 0} days)
          </div>
        </div>
        <div>
          ${daysBadge}
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

function toggleTask(taskId) {
  const event = Storage.getActiveEvent();
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
  showToast(task.completed ? '✓ Task marked complete!' : 'Task marked incomplete', task.completed ? 'success' : 'info');
}

function openAddTaskModal() {
  const taskName = prompt('Enter Milestone / Task Name (e.g. Schedule rehearsal dinner, Order custom cake):');
  if (!taskName || !taskName.trim()) return;

  const daysStr = prompt('How many days before the event should this be completed? (e.g. 14):', '14');
  const days = parseInt(daysStr, 10) || 14;

  const priority = prompt('Priority level (high / medium / low):', 'medium') || 'medium';
  const category = prompt('Category (e.g. Venue, Catering, Photography, Planning):', 'Planning') || 'Planning';

  const event = Storage.getActiveEvent();
  if (!event) return;

  const timeline = Storage.getTimeline(event.id) || { tasks: [] };
  const tasks = timeline.tasks || [];

  tasks.push({
    id: 't_custom_' + Date.now(),
    task: taskName.trim(),
    description: 'Custom milestone added by organizer',
    category: category.trim(),
    priority: priority.toLowerCase(),
    daysBeforeEvent: days,
    completed: false,
  });

  tasks.sort((a, b) => (b.daysBeforeEvent || 0) - (a.daysBeforeEvent || 0));
  Storage.saveTimeline(event.id, { ...timeline, tasks });
  renderTimeline(tasks, event, timeline._source, timeline._model);
  showToast(`Added task "${taskName.trim()}"! ⏰`, 'success');
}

function loadTimelinePage() {
  const event = Storage.getActiveEvent();
  const emptyEl = document.getElementById('timelineEmpty');
  const contentEl = document.getElementById('timelineContent');
  const resultsEl = document.getElementById('timelineResults');

  if (!event) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  const savedTimeline = Storage.getTimeline(event.id);
  if (savedTimeline?.tasks?.length) {
    renderTimeline(savedTimeline.tasks, event, savedTimeline._source, savedTimeline._model);
    if (resultsEl) resultsEl.style.display = 'block';
  } else {
    // Generate initial timeline if demo event
    if (event.id.startsWith('demo_')) {
      const t = SmartPlanner.generateEventTimeline(event);
      Storage.saveTimeline(event.id, t);
      renderTimeline(t.tasks, event, 'smart', null);
      if (resultsEl) resultsEl.style.display = 'block';
    } else {
      if (resultsEl) resultsEl.style.display = 'none';
    }
  }
}
