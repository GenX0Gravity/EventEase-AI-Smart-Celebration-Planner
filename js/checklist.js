/**
 * EventEase AI – Vendor Checklist Module
 */

const CATEGORY_ICONS = {
  Venue: 'building-2',
  Catering: 'utensils',
  Photography: 'camera',
  Decoration: 'sparkles',
  Entertainment: 'music',
  Transportation: 'car',
  Invitations: 'mail',
  Custom: 'check-square',
};

const CATEGORY_COLORS = {
  Venue: '#8b5cf6',
  Catering: '#ec4899',
  Photography: '#3b82f6',
  Decoration: '#f59e0b',
  Entertainment: '#10b981',
  Transportation: '#06b6d4',
  Invitations: '#f43f5e',
  Custom: '#6b7280',
};

function loadChecklistPage() {
  const event = Storage.getCurrentEvent();
  const emptyEl = document.getElementById('checklistEmpty');
  const contentEl = document.getElementById('checklistContent');

  if (!event) {
    emptyEl.style.display = 'block';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = 'block';

  let checklist = Storage.getChecklist(event.id);
  if (!checklist) {
    checklist = SmartPlanner.generateChecklist(event);
    Storage.saveChecklist(event.id, checklist);
  }

  renderChecklist(checklist);
}

function renderChecklist(checklist) {
  const statsEl = document.getElementById('checklistStats');
  const categoriesEl = document.getElementById('checklistCategories');
  const badgeEl = document.getElementById('checklistModeBadge');
  if (!categoriesEl) return;

  // Render planning mode badge
  if (badgeEl) {
    badgeEl.style.display = 'flex';
    if (checklist._source === 'ollama') {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-ai">
          <span class="status-dot-sm status-connected-dot"></span>
          <strong>Local AI Generated</strong> &nbsp;·&nbsp; Model: ${checklist._model || OllamaClient.getModel()}
        </span>
      `;
    } else {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-smart">
          <span class="status-dot-sm status-smart-dot"></span>
          <strong>Smart Planning Mode</strong> &nbsp;·&nbsp; Vendor Checklist Engine
        </span>
      `;
    }
  }

  const cats = checklist.categories || [];
  const total = cats.reduce((s, c) => s + c.items.length, 0);
  const done = cats.reduce((s, c) => s + c.items.filter((i) => i.completed).length, 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="checklist-stat">
        <div class="checklist-stat-num">${total}</div>
        <div class="checklist-stat-label">Total Tasks</div>
      </div>
      <div class="checklist-stat">
        <div class="checklist-stat-num" style="color:#16a34a;">${done}</div>
        <div class="checklist-stat-label">Completed</div>
      </div>
      <div class="checklist-stat">
        <div class="checklist-stat-num" style="color:#ef4444;">${total - done}</div>
        <div class="checklist-stat-label">Remaining</div>
      </div>
      <div class="checklist-stat">
        <div class="checklist-stat-num" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${pct}%</div>
        <div class="checklist-stat-label">Complete</div>
      </div>
    `;
  }

  categoriesEl.innerHTML = cats
    .map((cat) => {
      const catDone = cat.items.filter((i) => i.completed).length;
      const catTotal = cat.items.length;
      const icon = CATEGORY_ICONS[cat.name] || 'check-square';
      const color = CATEGORY_COLORS[cat.name] || cat.color || '#8b5cf6';

      return `
      <div class="checklist-category">
        <div class="checklist-category-header" onclick="toggleCategory(this)">
          <div class="checklist-category-icon" style="background:${color}">
            <i data-lucide="${icon}"></i>
          </div>
          <span class="checklist-category-title">${cat.name}</span>
          <span class="checklist-category-count">${catDone}/${catTotal}</span>
          <i data-lucide="chevron-down" style="color:#9ca3af;width:16px;height:16px;flex-shrink:0;"></i>
        </div>
        <div class="checklist-items">
          ${cat.items.map((item) => renderChecklistItem(item, cat.name)).join('')}
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

function renderChecklistItem(item, category) {
  return `
    <div class="checklist-item ${item.completed ? 'done' : ''}" id="cli-${item.id}">
      <input type="checkbox" 
             id="chk-${item.id}" 
             ${item.completed ? 'checked' : ''}
             onchange="toggleChecklistItem('${item.id}', '${category}')" />
      <label class="checklist-item-label" for="chk-${item.id}">${item.task}</label>
      <button class="checklist-item-delete" onclick="deleteChecklistItem('${item.id}', '${category}')" title="Delete task">
        <i data-lucide="x"></i>
      </button>
    </div>
  `;
}

function toggleCategory(headerEl) {
  const itemsEl = headerEl.nextElementSibling;
  const chevron = headerEl.querySelector('[data-lucide="chevron-down"]');
  itemsEl.style.display = itemsEl.style.display === 'none' ? '' : 'none';
  if (chevron) chevron.style.transform = itemsEl.style.display === 'none' ? 'rotate(-90deg)' : '';
}

function toggleChecklistItem(itemId, category) {
  const event = Storage.getCurrentEvent();
  if (!event) return;

  const checklist = Storage.getChecklist(event.id);
  if (!checklist) return;

  const cat = checklist.categories.find((c) => c.name === category);
  if (!cat) return;

  const item = cat.items.find((i) => i.id === itemId);
  if (!item) return;

  item.completed = !item.completed;
  Storage.saveChecklist(event.id, checklist);
  renderChecklist(checklist);
  lucide.createIcons();
}

function deleteChecklistItem(itemId, category) {
  const event = Storage.getCurrentEvent();
  if (!event) return;

  const checklist = Storage.getChecklist(event.id);
  if (!checklist) return;

  const cat = checklist.categories.find((c) => c.name === category);
  if (!cat) return;

  cat.items = cat.items.filter((i) => i.id !== itemId);
  Storage.saveChecklist(event.id, checklist);
  renderChecklist(checklist);
  lucide.createIcons();
  showToast('Task removed', 'info');
}

function addCustomTask() {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('Please create an event first', 'error');
    return;
  }

  const categoryEl = document.getElementById('newTaskCategory');
  const textEl = document.getElementById('newTaskText');

  const category = categoryEl?.value || 'Custom';
  const task = textEl?.value?.trim();

  if (!task) {
    showToast('Please enter a task description', 'warning');
    textEl?.focus();
    return;
  }

  const checklist = Storage.getChecklist(event.id) || SmartPlanner.generateChecklist(event);

  let cat = checklist.categories.find((c) => c.name === category);
  if (!cat) {
    cat = {
      name: category,
      icon: CATEGORY_ICONS[category] || 'check-square',
      color: CATEGORY_COLORS[category] || '#6b7280',
      items: [],
    };
    checklist.categories.push(cat);
  }

  const newItem = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    task,
    priority: 'medium',
    completed: false,
  };

  cat.items.push(newItem);
  Storage.saveChecklist(event.id, checklist);
  renderChecklist(checklist);
  lucide.createIcons();

  if (textEl) textEl.value = '';
  showToast('Task added! ✓', 'success');
}

async function generateChecklistFromAI() {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('Please select or create an event first', 'error');
    return;
  }

  const btn = document.getElementById('btnRegenChecklist');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Generating…`;
    lucide.createIcons();
  }

  try {
    const data = await API.generateChecklist(event);
    if (data?.categories) {
      Storage.saveChecklist(event.id, data);
      renderChecklist(data);
      lucide.createIcons();
      if (data._source === 'ollama') {
        showToast(`Checklist generated via Local AI (${data._model || 'Ollama'})! ✅`, 'success');
      } else {
        showToast('Checklist generated via Smart Planning Mode! ✅', 'info');
      }
    }
  } catch (err) {
    console.warn('Checklist generation error:', err);
    const fallback = SmartPlanner.generateChecklist(event);
    Storage.saveChecklist(event.id, fallback);
    renderChecklist(fallback);
    showToast('Checklist generated via Smart Planning Mode! ✅', 'info');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Regenerate with AI`;
      lucide.createIcons();
    }
  }
}
