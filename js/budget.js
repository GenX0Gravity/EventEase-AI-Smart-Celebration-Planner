/**
 * EventEase AI – Smart Budget & Expense Management Module
 * Handles AI budget allocation, actual expense tracking, overspending alerts,
 * category spending comparisons, and CSV export.
 */

let budgetChartInstance = null;
let expenseCategoryChartInstance = null;
let editingExpenseId = null;

async function generateBudgetBreakdown() {
  const event = Storage.getActiveEvent();
  if (!event) {
    showToast('Please create or select an event first', 'error');
    navigateTo('create-event');
    return;
  }

  const loadingEl = document.getElementById('budgetLoading');
  const resultsEl = document.getElementById('budgetResults');
  const btn = document.getElementById('btnGenerateBudget');

  if (loadingEl) loadingEl.style.display = 'block';
  if (resultsEl) resultsEl.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Optimizing…`;
    lucide.createIcons();
  }

  try {
    let budget = await API.generateBudgetBreakdown(event);
    budget = normalizeBudget(budget);
    Storage.saveBudget(event.id, budget);
    renderBudget(budget, event);

    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';

    if (budget._source === 'ollama') {
      showToast(`Budget generated via Local AI (${budget._model || 'Ollama'})! 💰`, 'success');
    } else {
      showToast('Budget calculated using Smart Planning Mode! 💰', 'info');
    }
  } catch (err) {
    console.warn('Budget generation error:', err);
    const budget = SmartPlanner.generateBudgetBreakdown(event);
    Storage.saveBudget(event.id, budget);
    renderBudget(budget, event);
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';
    showToast('Budget calculated using Smart Planning Mode! 💰', 'info');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles"></i> Generate Again`;
      lucide.createIcons();
    }
  }
}

function normalizeBudget(budget) {
  if (!budget || !budget.categories) return budget;
  const total = budget.totalBudget || Number(budget.categories.reduce((s, c) => s + c.amount, 0));
  let sum = budget.categories.reduce((s, c) => s + (c.amount || 0), 0);

  if (sum === 0) {
    const each = Math.floor(total / budget.categories.length);
    budget.categories = budget.categories.map((c, i) => ({
      ...c,
      amount: i === 0 ? total - each * (budget.categories.length - 1) : each,
    }));
    sum = total;
  }

  const diff = total - sum;
  if (diff !== 0 && budget.categories.length > 0) {
    budget.categories[budget.categories.length - 1].amount += diff;
  }

  budget.categories = budget.categories.map((c) => ({
    ...c,
    percentage: Math.round((c.amount / total) * 100),
  }));

  return { ...budget, totalBudget: total };
}

function renderBudget(budget, event) {
  const barsEl = document.getElementById('budgetBars');
  const tipsEl = document.getElementById('budgetTips');
  const badgeEl = document.getElementById('budgetModeBadge');
  if (!barsEl || !budget) return;

  // Render planning mode badge
  if (badgeEl) {
    badgeEl.style.display = 'flex';
    if (budget._source === 'ollama') {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-ai">
          <span class="status-dot-sm status-connected-dot"></span>
          <strong>Local AI Optimized</strong> &nbsp;·&nbsp; Model: ${budget._model || OllamaClient.getModel()}
        </span>
      `;
    } else {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-smart">
          <span class="status-dot-sm status-smart-dot"></span>
          <strong>Smart Planning Mode</strong> &nbsp;·&nbsp; Rule-Based Allocation
        </span>
      `;
    }
  }

  const total = budget.totalBudget;
  const cats = budget.categories || [];
  const expenses = Storage.getExpenses(event.id);

  // Compute actual spent per category
  const actualByCategory = {};
  cats.forEach(c => { actualByCategory[c.name] = 0; });
  let totalSpent = 0;

  expenses.forEach(e => {
    const amt = Number(e.amount) || 0;
    totalSpent += amt;
    if (actualByCategory[e.category] !== undefined) {
      actualByCategory[e.category] += amt;
    } else {
      actualByCategory[e.category] = (actualByCategory[e.category] || 0) + amt;
    }
  });

  // Budget vs Actual Progress Bars
  barsEl.innerHTML = cats
    .map((cat) => {
      const allocated = Number(cat.amount) || 0;
      const actual = actualByCategory[cat.name] || 0;
      const pctAllocated = Math.round((allocated / total) * 100);
      const isOver = actual > allocated;
      const pctSpentOfAllocated = allocated > 0 ? Math.round((actual / allocated) * 100) : 0;

      return `
      <div class="budget-bar-item ${isOver ? 'budget-item-over' : ''}">
        <div class="budget-bar-header">
          <div class="budget-bar-name">
            <div class="category-dot" style="background:${cat.color}"></div>
            <strong>${cat.name}</strong>
            ${isOver ? `<span class="badge-overspent">⚠️ Over by ${Storage.formatMoney(actual - allocated)}</span>` : ''}
          </div>
          <div class="budget-bar-figures">
            <span class="budget-bar-spent">${Storage.formatMoney(actual)} spent</span>
            <span class="budget-bar-allocated">/ ${Storage.formatMoney(allocated)} (${pctAllocated}%)</span>
          </div>
        </div>
        <div class="budget-progress-track">
          <div class="budget-progress-fill ${isOver ? 'fill-over' : ''}" style="width:0%;background:${isOver ? '#ef4444' : cat.color}" data-width="${Math.min(100, pctSpentOfAllocated)}%"></div>
        </div>
        ${cat.notes ? `<div style="margin-top:6px;font-size:12px;color:var(--gray-500);">${cat.notes}</div>` : ''}
      </div>
    `;
    })
    .join('');

  setTimeout(() => {
    document.querySelectorAll('.budget-progress-fill').forEach((el) => {
      el.style.width = el.dataset.width;
    });
  }, 100);

  // Doughnut Chart
  renderBudgetChart(cats);

  // Legend
  const legendEl = document.getElementById('budgetLegend');
  if (legendEl) {
    legendEl.innerHTML = cats
      .map((cat) => {
        const pct = Math.round((cat.amount / total) * 100);
        return `
        <div class="legend-item">
          <div class="legend-dot" style="background:${cat.color}"></div>
          <span>${cat.name}</span>
          <span class="legend-pct">${pct}%</span>
        </div>
      `;
      })
      .join('');
  }

  // Tips
  if (tipsEl && budget.savingTips) {
    tipsEl.innerHTML = `
      <h3>💡 Smart Saving Tips</h3>
      <ul>${budget.savingTips.map((t) => `<li>${t}</li>`).join('')}</ul>
      ${
        budget.priorityAdvice
          ? `<div style="margin-top:12px;padding:12px;background:var(--white);border-radius:10px;font-size:13px;color:var(--gray-700);border:1px solid var(--purple-200);"><strong>📊 Priority Advice:</strong> ${budget.priorityAdvice}</div>`
          : ''
      }
    `;
  }

  // Render Actual Expenses Table
  renderExpensesTable();
}

function renderBudgetChart(categories) {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;

  if (budgetChartInstance) {
    budgetChartInstance.destroy();
    budgetChartInstance = null;
  }

  const ctx = canvas.getContext('2d');
  budgetChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map((c) => c.name),
      datasets: [
        {
          data: categories.map((c) => c.amount),
          backgroundColor: categories.map((c) => c.color),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = Math.round((val / total) * 100);
              return ` ${Storage.formatMoney(val)} (${pct}%)`;
            },
          },
        },
      },
      animation: { animateScale: true, animateRotate: true, duration: 800 },
    },
  });
}

// ─── Actual Expense Tracker ──────────────────────────────────────────────────
function renderExpensesTable() {
  const event = Storage.getActiveEvent();
  if (!event) return;

  const expenses = Storage.getExpenses(event.id);
  const tbody = document.getElementById('expenseTableBody');
  const statSpent = document.getElementById('statExpenseTotalSpent');
  const statRemaining = document.getElementById('statExpenseRemaining');
  const statUtil = document.getElementById('statExpenseUtilization');

  const totalBudget = Number(event.budget) || 0;
  let totalSpent = 0;

  expenses.forEach(e => { totalSpent += (Number(e.amount) || 0); });
  const remaining = totalBudget - totalSpent;
  const utilPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (statSpent) statSpent.textContent = Storage.formatMoney(totalSpent);
  if (statRemaining) {
    statRemaining.textContent = Storage.formatMoney(remaining);
    statRemaining.style.color = remaining < 0 ? '#ef4444' : 'inherit';
  }
  if (statUtil) statUtil.textContent = `${utilPct}%`;

  if (!tbody) return;

  if (expenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="table-empty-cell">
          <div class="empty-state-mini">
            <i data-lucide="receipt"></i>
            <p>No actual expenses logged yet.</p>
            <button class="btn-primary-sm" onclick="openExpenseModal()">+ Log First Expense</button>
          </div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  let html = '';
  expenses.forEach(e => {
    const isPaid = e.status === 'Paid';
    html += `
      <tr>
        <td>
          <strong>${escapeHTML(e.title)}</strong>
          ${e.notes ? `<div class="table-subtext">${escapeHTML(e.notes)}</div>` : ''}
        </td>
        <td><span class="badge-category">${escapeHTML(e.category)}</span></td>
        <td>${escapeHTML(e.vendor || '—')}</td>
        <td><strong>${Storage.formatMoney(e.amount)}</strong></td>
        <td>
          <span class="badge-pill ${isPaid ? 'badge-success' : 'badge-warning'}">
            ${isPaid ? '✓ Paid' : '⏳ Pending'}
          </span>
        </td>
        <td class="table-actions-cell">
          <button class="btn-icon-sm" onclick="openExpenseModal('${e.id}')" title="Edit Expense">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn-icon-sm btn-icon-danger" onclick="deleteExpenseItem('${e.id}')" title="Delete Expense">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  lucide.createIcons();
}

function openExpenseModal(expenseId = null) {
  editingExpenseId = expenseId;
  const modal = document.getElementById('expenseModal');
  const title = document.getElementById('expenseModalTitle');
  const form = document.getElementById('expenseForm');
  if (!modal || !form) return;

  form.reset();
  const event = Storage.getActiveEvent();

  // Populate vendors dropdown in expense modal
  const vendorSelect = document.getElementById('expenseFormVendor');
  if (vendorSelect && event) {
    const vendors = Storage.getVendors(event.id);
    let options = '<option value="">-- No Vendor Attached --</option>';
    vendors.forEach(v => {
      options += `<option value="${escapeHTML(v.name)}">${escapeHTML(v.name)} (${escapeHTML(v.category)})</option>`;
    });
    vendorSelect.innerHTML = options;
  }

  if (expenseId && event) {
    title.textContent = 'Edit Expense';
    const expense = Storage.getExpenses(event.id).find(e => e.id === expenseId);
    if (expense) {
      document.getElementById('expenseFormTitle').value = expense.title || '';
      document.getElementById('expenseFormCategory').value = expense.category || 'Venue';
      document.getElementById('expenseFormVendor').value = expense.vendor || '';
      document.getElementById('expenseFormAmount').value = expense.amount || '';
      document.getElementById('expenseFormStatus').value = expense.status || 'Paid';
      document.getElementById('expenseFormDate').value = expense.date || '';
      document.getElementById('expenseFormNotes').value = expense.notes || '';
    }
  } else {
    title.textContent = 'Log New Expense';
    const dateInput = document.getElementById('expenseFormDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  }

  modal.classList.add('active');
}

function closeExpenseModal() {
  const modal = document.getElementById('expenseModal');
  if (modal) modal.classList.remove('active');
  editingExpenseId = null;
}

function saveExpenseFromModal() {
  const title = document.getElementById('expenseFormTitle')?.value.trim();
  const amount = parseFloat(document.getElementById('expenseFormAmount')?.value);
  if (!title || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid expense title and amount');
    return;
  }

  const event = Storage.getActiveEvent();
  if (!event) return;

  const data = {
    title,
    category: document.getElementById('expenseFormCategory')?.value || 'Miscellaneous',
    vendor: document.getElementById('expenseFormVendor')?.value || '',
    amount,
    status: document.getElementById('expenseFormStatus')?.value || 'Paid',
    date: document.getElementById('expenseFormDate')?.value || new Date().toISOString().split('T')[0],
    notes: document.getElementById('expenseFormNotes')?.value.trim() || '',
  };

  if (editingExpenseId) {
    data.id = editingExpenseId;
    Storage.updateExpense(event.id, data);
    showToast(`Updated expense: ${title}`, 'success');
  } else {
    Storage.addExpense(event.id, data);
    showToast(`Logged expense: ${title}`, 'success');
  }

  closeExpenseModal();

  // Re-render budget views
  const savedBudget = Storage.getBudget(event.id);
  if (savedBudget) {
    renderBudget(savedBudget, event);
  } else {
    renderExpensesTable();
  }
}

function deleteExpenseItem(expenseId) {
  const event = Storage.getActiveEvent();
  if (!event) return;
  const exp = Storage.getExpenses(event.id).find(e => e.id === expenseId);
  const expTitle = exp ? exp.title : 'this expense';

  if (confirm(`Delete ${expTitle}?`)) {
    Storage.deleteExpense(event.id, expenseId);
    const savedBudget = Storage.getBudget(event.id);
    if (savedBudget) {
      renderBudget(savedBudget, event);
    } else {
      renderExpensesTable();
    }
    showToast(`Deleted ${expTitle}`, 'info');
  }
}

function exportExpensesCSV() {
  const event = Storage.getActiveEvent();
  if (!event) return;
  const expenses = Storage.getExpenses(event.id);

  if (expenses.length === 0) {
    showToast('No expenses to export', 'warning');
    return;
  }

  const headers = ['Title', 'Category', 'Vendor', 'Amount', 'Status', 'Date', 'Notes'];
  const rows = expenses.map(e => [
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    `"${(e.vendor || '').replace(/"/g, '""')}"`,
    e.amount || 0,
    `"${(e.status || '').replace(/"/g, '""')}"`,
    `"${(e.date || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses_${event.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Expenses exported to CSV', 'success');
}

function loadBudgetPage() {
  const event = Storage.getActiveEvent();
  const emptyEl = document.getElementById('budgetEmpty');
  const contentEl = document.getElementById('budgetContent');
  const overviewEl = document.getElementById('budgetOverview');
  const resultsEl = document.getElementById('budgetResults');

  if (!event) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  const expenses = Storage.getExpenses(event.id);
  let totalSpent = 0;
  expenses.forEach(e => { totalSpent += (Number(e.amount) || 0); });
  const remaining = Number(event.budget) - totalSpent;

  if (overviewEl) {
    overviewEl.innerHTML = `
      <div class="budget-stat-card">
        <div class="budget-stat-label">Total Budget</div>
        <div class="budget-stat-value" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
          ${Storage.formatMoney(event.budget)}
        </div>
      </div>
      <div class="budget-stat-card">
        <div class="budget-stat-label">Actual Tracked Spent</div>
        <div class="budget-stat-value">${Storage.formatMoney(totalSpent)}</div>
      </div>
      <div class="budget-stat-card">
        <div class="budget-stat-label">Remaining Balance</div>
        <div class="budget-stat-value" style="color: ${remaining < 0 ? '#ef4444' : '#10b981'}">
          ${Storage.formatMoney(remaining)}
        </div>
      </div>
      <div class="budget-stat-card">
        <div class="budget-stat-label">Budget Per Guest</div>
        <div class="budget-stat-value">
          ${Storage.formatMoney(Math.round(Number(event.budget) / (Number(event.guests) || 1)))}
        </div>
      </div>
    `;
  }

  // Load saved budget
  const savedBudget = Storage.getBudget(event.id);
  if (savedBudget) {
    renderBudget(savedBudget, event);
    if (resultsEl) resultsEl.style.display = 'block';
  } else {
    // Generate initially if demo event
    if (event.id.startsWith('demo_')) {
      const b = SmartPlanner.generateBudgetBreakdown(event);
      Storage.saveBudget(event.id, b);
      renderBudget(b, event);
      if (resultsEl) resultsEl.style.display = 'block';
    } else {
      if (resultsEl) resultsEl.style.display = 'none';
    }
  }
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
