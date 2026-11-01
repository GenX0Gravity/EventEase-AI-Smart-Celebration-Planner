/**
 * EventEase AI – Budget Planner Module
 */

let budgetChartInstance = null;

async function generateBudgetBreakdown() {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('Please create an event first', 'error');
    navigateTo('create-event');
    return;
  }

  const loadingEl = document.getElementById('budgetLoading');
  const resultsEl = document.getElementById('budgetResults');
  const btn = document.getElementById('btnGenerateBudget');

  loadingEl.style.display = 'block';
  resultsEl.style.display = 'none';
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

    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';

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
    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';
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

  // Budget bars
  barsEl.innerHTML = cats
    .map((cat) => {
      const pct = Math.round((cat.amount / total) * 100);
      return `
      <div class="budget-bar-item">
        <div class="budget-bar-header">
          <div class="budget-bar-name">
            <div class="category-dot" style="background:${cat.color}"></div>
            ${cat.name}
          </div>
          <div>
            <span class="budget-bar-amount">₹${Number(cat.amount).toLocaleString('en-IN')}</span>
            <span class="budget-bar-pct">(${pct}%)</span>
          </div>
        </div>
        <div class="budget-progress-track">
          <div class="budget-progress-fill" style="width:0%;background:${cat.color}" data-width="${pct}%"></div>
        </div>
        ${cat.notes ? `<div style="margin-top:6px;font-size:12px;color:#9ca3af;">${cat.notes}</div>` : ''}
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
          ? `<div style="margin-top:12px;padding:12px;background:white;border-radius:10px;font-size:13px;color:#374151;border:1px solid #e9d5ff;"><strong>📊 Priority Advice:</strong> ${budget.priorityAdvice}</div>`
          : ''
      }
    `;
  }
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
              return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
            },
          },
        },
      },
      animation: { animateScale: true, animateRotate: true, duration: 800 },
    },
  });
}

function loadBudgetPage() {
  const event = Storage.getCurrentEvent();
  const emptyEl = document.getElementById('budgetEmpty');
  const contentEl = document.getElementById('budgetContent');
  const overviewEl = document.getElementById('budgetOverview');
  const resultsEl = document.getElementById('budgetResults');

  if (!event) {
    emptyEl.style.display = 'block';
    contentEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  contentEl.style.display = 'block';

  overviewEl.innerHTML = `
    <div class="budget-stat-card">
      <div class="budget-stat-label">Total Budget</div>
      <div class="budget-stat-value" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">₹${Number(event.budget).toLocaleString('en-IN')}</div>
    </div>
    <div class="budget-stat-card">
      <div class="budget-stat-label">Per Guest</div>
      <div class="budget-stat-value">₹${Math.round(Number(event.budget) / Number(event.guests)).toLocaleString('en-IN')}</div>
    </div>
    <div class="budget-stat-card">
      <div class="budget-stat-label">Guest Count</div>
      <div class="budget-stat-value">${event.guests}</div>
    </div>
    <div class="budget-stat-card">
      <div class="budget-stat-label">Event Type</div>
      <div class="budget-stat-value" style="font-size:16px;">${event.type}</div>
    </div>
  `;

  // Load saved budget
  const savedBudget = Storage.getBudget(event.id);
  if (savedBudget) {
    renderBudget(savedBudget, event);
    resultsEl.style.display = 'block';
  } else {
    resultsEl.style.display = 'none';
  }
}
