/**
 * EventEase AI – AI Event Planner Module
 */

async function generateEventPlan() {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('Please create or select an event first', 'error');
    navigateTo('create-event');
    return;
  }

  const loadingEl = document.getElementById('plannerLoading');
  const resultsEl = document.getElementById('planResults');
  const generateBtn = document.getElementById('generatePlanBtn');

  loadingEl.style.display = 'block';
  resultsEl.style.display = 'none';
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Generating…`;
    lucide.createIcons();
  }

  // Animate loading steps
  const steps = ['lstep1', 'lstep2', 'lstep3', 'lstep4'];
  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    if (stepIdx > 0) {
      document.getElementById(steps[stepIdx - 1])?.classList.remove('active');
      document.getElementById(steps[stepIdx - 1])?.classList.add('done');
    }
    if (stepIdx < steps.length) {
      document.getElementById(steps[stepIdx])?.classList.add('active');
      stepIdx++;
    }
  }, 1200);

  try {
    const plan = await API.generateEventPlan(event);

    clearInterval(stepInterval);
    steps.forEach((s) => {
      document.getElementById(s)?.classList.remove('active');
      document.getElementById(s)?.classList.add('done');
    });

    Storage.savePlan(event.id, plan);
    renderEventPlan(plan, event);

    loadingEl.style.display = 'none';
    resultsEl.style.display = 'block';

    if (plan._source === 'ollama') {
      showToast(`Plan generated via Local AI (${plan._model || 'Ollama'})! 🧠`, 'success');
    } else {
      showToast('Plan generated using Smart Planning Mode! ✨', 'info');
    }
  } catch (err) {
    clearInterval(stepInterval);
    loadingEl.style.display = 'none';
    console.warn('Planner error:', err);
    const fallback = SmartPlanner.generateEventPlan(event);
    Storage.savePlan(event.id, fallback);
    renderEventPlan(fallback, event);
    resultsEl.style.display = 'block';
    showToast('Plan generated using Smart Planning Mode! ✨', 'info');
  } finally {
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `<i data-lucide="sparkles"></i> Generate Again`;
      lucide.createIcons();
    }
  }
}

function renderEventPlan(plan, event) {
  const grid = document.getElementById('planGrid');
  const badgeEl = document.getElementById('plannerModeBadge');
  if (!grid || !plan) return;

  // Render planning mode badge
  if (badgeEl) {
    badgeEl.style.display = 'flex';
    if (plan._source === 'ollama') {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-ai">
          <span class="status-dot-sm status-connected-dot"></span>
          <strong>Local AI Generated</strong> &nbsp;·&nbsp; Model: ${plan._model || OllamaClient.getModel()}
        </span>
      `;
    } else {
      badgeEl.innerHTML = `
        <span class="badge-pill badge-smart">
          <span class="status-dot-sm status-smart-dot"></span>
          <strong>Smart Planning Mode</strong> &nbsp;·&nbsp; Rule-Based Engine (Zero AI / Offline)
        </span>
      `;
    }
  }

  const planColors = [
    'linear-gradient(135deg,#8b5cf6,#a78bfa)',
    'linear-gradient(135deg,#ec4899,#be185d)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f43f5e,#e11d48)',
    'linear-gradient(135deg,#06b6d4,#0891b2)',
  ];

  const cards = [];

  // 1. Overview card
  if (plan.overview) {
    cards.push(`
      <div class="plan-card full-width">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[0]}">
            <i data-lucide="star"></i>
          </div>
          <div class="plan-card-title">Event Overview</div>
        </div>
        <div class="plan-card-content">
          <p>${plan.overview.summary}</p>
          ${plan.overview.highlights ? `<ul>${plan.overview.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    `);
  }

  // 2. Theme card
  if (plan.theme) {
    const swatches =
      plan.theme.colorPalette
        ?.map(
          (c, i) =>
            `<div style="background:${c};height:32px;border-radius:8px;flex:1;min-width:44px;box-shadow:0 1px 3px rgba(0,0,0,0.1);" title="${plan.theme.colorNames?.[i] || c}"></div>`
        )
        .join('') || '';

    cards.push(`
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[1]}">
            <i data-lucide="palette"></i>
          </div>
          <div class="plan-card-title">Recommended Theme</div>
        </div>
        <div class="plan-card-content">
          <strong style="color:#9333ea;font-size:16px;">${plan.theme.recommended}</strong>
          <p style="margin-top:8px;">${plan.theme.description}</p>
          ${
            swatches
              ? `<div style="display:flex;gap:6px;margin-top:14px;flex-wrap:wrap;">${swatches}</div>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
            ${plan.theme.colorNames?.map((n) => `<span style="flex:1;min-width:44px;font-size:11px;color:#6b7280;text-align:center;">${n}</span>`).join('') || ''}
          </div>`
              : ''
          }
          ${
            plan.theme.moodBoard
              ? `<div style="margin-top:14px;"><strong style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Mood Board</strong><ul>${plan.theme.moodBoard.map((m) => `<li>${m}</li>`).join('')}</ul></div>`
              : ''
          }
        </div>
      </div>
    `);
  }

  // 3. Decorations card
  if (plan.decorations) {
    cards.push(`
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[2]}">
            <i data-lucide="flower-2"></i>
          </div>
          <div class="plan-card-title">Decoration Suggestions</div>
        </div>
        <div class="plan-card-content">
          <p><strong>${plan.decorations.mainConcept}</strong></p>
          <ul>${plan.decorations.items?.map((i) => `<li>${i}</li>`).join('') || ''}</ul>
          ${plan.decorations.floral ? `<div class="plan-callout-floral"><strong>🌸 Florals:</strong> ${plan.decorations.floral}</div>` : ''}
          ${plan.decorations.lighting ? `<div class="plan-callout-lighting"><strong>💡 Lighting:</strong> ${plan.decorations.lighting}</div>` : ''}
        </div>
      </div>
    `);
  }

  // 4. Catering card
  if (plan.catering) {
    cards.push(`
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[3]}">
            <i data-lucide="utensils"></i>
          </div>
          <div class="plan-card-title">Food & Catering</div>
        </div>
        <div class="plan-card-content">
          <div style="margin-bottom:8px;"><span class="badge-category">${plan.catering.style}</span></div>
          ${plan.catering.starter ? `<div style="margin-bottom:8px;"><strong style="font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Starters</strong><ul>${plan.catering.starter.map((d) => `<li>${d}</li>`).join('')}</ul></div>` : ''}
          ${plan.catering.main ? `<div style="margin-bottom:8px;"><strong style="font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Main Course</strong><ul>${plan.catering.main.map((d) => `<li>${d}</li>`).join('')}</ul></div>` : ''}
          ${plan.catering.dessert ? `<div style="margin-bottom:8px;"><strong style="font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Desserts</strong><ul>${plan.catering.dessert.map((d) => `<li>${d}</li>`).join('')}</ul></div>` : ''}
          ${plan.catering.specialNote ? `<div class="plan-callout-tip"><strong>✨ Tip:</strong> ${plan.catering.specialNote}</div>` : ''}
        </div>
      </div>
    `);
  }

  // 5. Entertainment card
  if (plan.entertainment) {
    cards.push(`
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[4]}">
            <i data-lucide="music-2"></i>
          </div>
          <div class="plan-card-title">Entertainment Ideas</div>
        </div>
        <div class="plan-card-content">
          <p><strong>🎭 Main Act:</strong> ${plan.entertainment.mainAct}</p>
          <ul>${plan.entertainment.activities?.map((a) => `<li>${a}</li>`).join('') || ''}</ul>
          ${plan.entertainment.music ? `<div class="plan-callout-music"><strong>🎵 Music:</strong> ${plan.entertainment.music}</div>` : ''}
          ${plan.entertainment.photography ? `<div class="plan-callout-photo"><strong>📸 Photography:</strong> ${plan.entertainment.photography}</div>` : ''}
          ${plan.entertainment.specialMoments ? `<div style="margin-top:10px;"><strong style="font-size:12px;color:var(--gray-500);text-transform:uppercase;letter-spacing:1px;">Special Moments</strong><ul>${plan.entertainment.specialMoments.map((m) => `<li>⭐ ${m}</li>`).join('')}</ul></div>` : ''}
        </div>
      </div>
    `);
  }

  // 6. Guest Management card
  if (plan.guestManagement) {
    cards.push(`
      <div class="plan-card">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[5]}">
            <i data-lucide="users"></i>
          </div>
          <div class="plan-card-title">Guest Management</div>
        </div>
        <div class="plan-card-content">
          <ul>
            ${plan.guestManagement.invitations ? `<li><strong>Invitations:</strong> ${plan.guestManagement.invitations}</li>` : ''}
            ${plan.guestManagement.seating ? `<li><strong>Seating:</strong> ${plan.guestManagement.seating}</li>` : ''}
            ${plan.guestManagement.rsvp ? `<li><strong>RSVP:</strong> ${plan.guestManagement.rsvp}</li>` : ''}
            ${plan.guestManagement.welcomeGifts ? `<li><strong>Welcome Gifts:</strong> ${plan.guestManagement.welcomeGifts}</li>` : ''}
            ${plan.guestManagement.accessibility ? `<li><strong>Accessibility:</strong> ${plan.guestManagement.accessibility}</li>` : ''}
          </ul>
        </div>
      </div>
    `);
  }

  // 7. Personalized Tips card
  if (plan.personalizedTips) {
    cards.push(`
      <div class="plan-card full-width plan-card-tips">
        <div class="plan-card-header">
          <div class="plan-card-icon" style="background:${planColors[6]}">
            <i data-lucide="lightbulb"></i>
          </div>
          <div class="plan-card-title">Personalized Tips for Your Event</div>
        </div>
        <div class="plan-card-content">
          <ul>${plan.personalizedTips.map((t, i) => `<li><strong>Tip ${i + 1}:</strong> ${t}</li>`).join('')}</ul>
        </div>
      </div>
    `);
  }

  grid.innerHTML = cards.join('');
  lucide.createIcons();
}

// ─── Copy Plan to Clipboard ─────────────────────────────────────────
function copyPlanToClipboard() {
  const event = Storage.getCurrentEvent();
  const plan = event ? Storage.getPlan(event.id) : null;
  if (!plan) {
    showToast('No plan to copy. Generate a plan first.', 'warning');
    return;
  }

  const content = formatPlanAsText(plan, event);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(content)
      .then(() => showToast('Plan copied to clipboard! 📋', 'success'))
      .catch(() => fallbackCopyText(content));
  } else {
    fallbackCopyText(content);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Plan copied to clipboard! 📋', 'success');
  } catch {
    showToast('Could not copy to clipboard automatically', 'error');
  }
  document.body.removeChild(ta);
}

// ─── Download Event Plan ────────────────────────────────────────────
function exportPlan() {
  const event = Storage.getCurrentEvent();
  const plan = event ? Storage.getPlan(event.id) : null;
  if (!plan) {
    showToast('No plan to download. Generate a plan first.', 'warning');
    return;
  }

  const content = formatPlanAsText(plan, event);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.name.replace(/[^a-z0-9]/gi, '_')}_EventPlan.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Event plan downloaded! 📄', 'success');
}

function formatPlanAsText(plan, event) {
  const modeLabel =
    plan._source === 'ollama'
      ? `Local AI (${plan._model || 'Ollama'})`
      : 'Smart Planning Mode (Rule-Based Engine)';

  let text = `==================================================\n`;
  text += `EventEase AI – Personalized Event Plan\n`;
  text += `Mode: ${modeLabel}\n`;
  text += `Date Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}\n`;
  text += `==================================================\n\n`;

  text += `EVENT DETAILS\n`;
  text += `--------------------------------------------------\n`;
  text += `Name:     ${event.name}\n`;
  text += `Type:     ${event.type}\n`;
  text += `Date:     ${event.date}\n`;
  text += `Location: ${event.location}\n`;
  text += `Guests:   ${event.guests}\n`;
  text += `Budget:   ₹${Number(event.budget).toLocaleString('en-IN')}\n\n`;

  if (plan.overview) {
    text += `EVENT OVERVIEW\n`;
    text += `--------------------------------------------------\n`;
    text += `${plan.overview.summary}\n\nHighlights:\n`;
    plan.overview.highlights?.forEach((h) => {
      text += `  • ${h}\n`;
    });
    text += `\n`;
  }

  if (plan.theme) {
    text += `RECOMMENDED THEME: ${plan.theme.recommended}\n`;
    text += `--------------------------------------------------\n`;
    text += `${plan.theme.description}\n`;
    if (plan.theme.colorNames?.length) {
      text += `Color Palette: ${plan.theme.colorNames.join(', ')}\n`;
    }
    if (plan.theme.moodBoard?.length) {
      text += `Mood Board Elements:\n`;
      plan.theme.moodBoard.forEach((m) => {
        text += `  • ${m}\n`;
      });
    }
    text += `\n`;
  }

  if (plan.decorations) {
    text += `DECORATIONS\n`;
    text += `--------------------------------------------------\n`;
    text += `Concept: ${plan.decorations.mainConcept}\n`;
    plan.decorations.items?.forEach((i) => {
      text += `  • ${i}\n`;
    });
    if (plan.decorations.floral) text += `Florals: ${plan.decorations.floral}\n`;
    if (plan.decorations.lighting) text += `Lighting: ${plan.decorations.lighting}\n`;
    text += `\n`;
  }

  if (plan.catering) {
    text += `FOOD & CATERING\n`;
    text += `--------------------------------------------------\n`;
    text += `Style: ${plan.catering.style}\n`;
    if (plan.catering.starter?.length) text += `Starters: ${plan.catering.starter.join(', ')}\n`;
    if (plan.catering.main?.length) text += `Main Course: ${plan.catering.main.join(', ')}\n`;
    if (plan.catering.dessert?.length) text += `Desserts: ${plan.catering.dessert.join(', ')}\n`;
    if (plan.catering.drinks?.length) text += `Beverages: ${plan.catering.drinks.join(', ')}\n`;
    if (plan.catering.specialNote) text += `Note: ${plan.catering.specialNote}\n`;
    text += `\n`;
  }

  if (plan.entertainment) {
    text += `ENTERTAINMENT\n`;
    text += `--------------------------------------------------\n`;
    text += `Main Act: ${plan.entertainment.mainAct}\n`;
    plan.entertainment.activities?.forEach((a) => {
      text += `  • ${a}\n`;
    });
    if (plan.entertainment.music) text += `Music: ${plan.entertainment.music}\n`;
    if (plan.entertainment.photography) text += `Photography: ${plan.entertainment.photography}\n`;
    text += `\n`;
  }

  if (plan.personalizedTips?.length) {
    text += `PERSONALIZED PRO TIPS\n`;
    text += `--------------------------------------------------\n`;
    plan.personalizedTips.forEach((tip, idx) => {
      text += `  ${idx + 1}. ${tip}\n`;
    });
    text += `\n`;
  }

  text += `==================================================\n`;
  text += `Generated with EventEase AI – Smart Celebration Planner\n`;
  text += `100% Free · Privacy First · Local AI & Smart Planning\n`;
  text += `==================================================\n`;

  return text;
}

// ─── Planner Page Loader ───────────────────────────────────────────
function loadPlannerPage() {
  const event = Storage.getActiveEvent();
  const plannerEmpty = document.getElementById('plannerEmpty');
  const plannerContent = document.getElementById('plannerContent');
  const plannerEventInfo = document.getElementById('plannerEventInfo');
  const planResults = document.getElementById('planResults') || document.getElementById('plannerResults');
  const modelSelect = document.getElementById('plannerModelSelect');

  if (modelSelect) {
    const mode = OllamaClient.getPlanningMode();
    modelSelect.value = mode === 'smart-only' ? 'smart-only' : OllamaClient.getModel();
  }

  if (!event) {
    if (plannerEmpty) plannerEmpty.style.display = 'block';
    if (plannerContent) plannerContent.style.display = 'none';
    return;
  }

  if (plannerEmpty) plannerEmpty.style.display = 'none';
  if (plannerContent) plannerContent.style.display = 'block';

  if (plannerEventInfo) {
    plannerEventInfo.innerHTML = `
      <div>
        <div style="font-size:12px;color:#9333ea;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${event.type}</div>
        <div style="font-size:18px;font-weight:800;color:var(--gray-900);">${event.name}</div>
        <div style="font-size:13px;color:var(--gray-500);margin-top:4px;">${event.location} • ${event.date} • ${event.guests} guests</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:var(--gray-500);">Total Budget</div>
        <div style="font-size:22px;font-weight:800;color:var(--gray-900);">${Storage.formatMoney(event.budget)}</div>
      </div>
    `;
  }

  // Load saved plan if exists
  const savedPlan = Storage.getPlan(event.id);
  if (savedPlan) {
    renderEventPlan(savedPlan, event);
    if (planResults) planResults.style.display = 'block';
  } else {
    if (event.id && event.id.startsWith('demo_')) {
      const p = SmartPlanner.generatePlan(event);
      Storage.savePlan(event.id, p);
      renderEventPlan(p, event);
      if (planResults) planResults.style.display = 'block';
    } else {
      if (planResults) planResults.style.display = 'none';
    }
  }
}

function onPlannerModelChange(val) {
  if (val === 'smart-only') {
    OllamaClient.setPlanningMode('smart-only');
    if (typeof updateAIStatus === 'function') {
      updateAIStatus('smart', null, [], 'Smart Planning Mode selected');
    }
    showToast('Switched to Smart Planning Mode (Rule-Based)', 'info');
  } else {
    OllamaClient.setPlanningMode('auto');
    OllamaClient.setModel(val);
    OllamaClient.checkConnection(true);
    showToast(`Model set to ${val}`, 'info');
  }
}
