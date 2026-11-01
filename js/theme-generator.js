/**
 * EventEase AI – Theme Generator Module
 */

async function generateThemeIdeas() {
  const options = {
    eventType: document.getElementById('themeEventType')?.value || 'Wedding',
    season: document.getElementById('themeSeason')?.value || 'Any',
    style: document.getElementById('themeStyle')?.value || 'Any',
    notes: document.getElementById('themeNotes')?.value?.trim() || '',
  };

  const loadingEl = document.getElementById('themeLoading');
  const resultsEl = document.getElementById('themeResults');
  const btn = document.getElementById('btnGenerateTheme');

  loadingEl.style.display = 'block';
  resultsEl.innerHTML = '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin-icon"></i> Generating…`;
    lucide.createIcons();
  }

  try {
    const data = await API.generateThemeIdeas(options);
    loadingEl.style.display = 'none';
    renderThemeIdeas(data.themes || data, options, data._source, data._model);

    if (data._source === 'ollama') {
      showToast(`Themes generated via Local AI (${data._model || 'Ollama'})! 🎨`, 'success');
    } else {
      showToast('Themes generated using Smart Planning Mode! 🎨', 'info');
    }
  } catch (err) {
    loadingEl.style.display = 'none';
    console.warn('Theme generator error:', err);
    const fallback = SmartPlanner.generateThemeIdeas(options);
    renderThemeIdeas(fallback.themes, options, 'smart', null);
    showToast('Themes generated using Smart Planning Mode! 🎨', 'info');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="wand-2"></i> Generate Theme Ideas`;
      lucide.createIcons();
    }
  }
}

function renderThemeIdeas(themes, options, source = 'smart', model = null) {
  const resultsEl = document.getElementById('themeResults');
  if (!resultsEl || !themes?.length) return;

  const themeColors = [
    { bg: '#faf5ff', border: '#e9d5ff' },
    { bg: '#fdf2f8', border: '#fbcfe8' },
    { bg: '#eff6ff', border: '#bfdbfe' },
  ];

  const badgeHtml =
    source === 'ollama'
      ? `<span class="badge-pill badge-ai"><span class="status-dot-sm status-connected-dot"></span><strong>Local AI Generated</strong> &nbsp;·&nbsp; Model: ${model || OllamaClient.getModel()}</span>`
      : `<span class="badge-pill badge-smart"><span class="status-dot-sm status-smart-dot"></span><strong>Smart Planning Mode</strong> &nbsp;·&nbsp; Creative Concept Engine</span>`;

  resultsEl.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div>
        <h3 style="font-size:16px;font-weight:700;color:#111827;">Creative Themes for ${options.eventType}</h3>
        <p style="font-size:13px;color:#6b7280;margin-top:4px;">${options.season !== 'Any' ? options.season + ' · ' : ''}${options.style !== 'Any' ? options.style : 'All styles'}</p>
      </div>
      <div>${badgeHtml}</div>
    </div>
    <div class="theme-cards-grid">
      ${themes.map((theme, i) => renderThemeCard(theme, themeColors[i % themeColors.length], i)).join('')}
    </div>
    <div style="margin-top:20px;text-align:center;">
      <button class="btn-outline" onclick="generateThemeIdeas()">
        <i data-lucide="refresh-cw"></i> Generate Again
      </button>
    </div>
  `;

  lucide.createIcons();
}

function renderThemeCard(theme, colors, index) {
  const swatches =
    theme.colorPalette
      ?.map((c, i) => `<div class="color-swatch" style="background:${c}" title="${theme.colorNames?.[i] || c}"></div>`)
      .join('') || '';

  const medal = ['🥇', '🥈', '🥉'][index] || '';

  return `
    <div class="theme-card" style="background:${colors.bg};border-color:${colors.border};">
      <div class="theme-card-header">
        <div class="theme-card-emoji">${theme.emoji || '🎨'}</div>
        <div>
          <div class="theme-card-title">${medal} ${theme.name}</div>
          <div class="theme-card-subtitle">${theme.tagline}</div>
        </div>
      </div>
      
      <div class="theme-card-content">
        <p>${theme.description}</p>
        
        ${
          swatches
            ? `
          <div style="margin-top:14px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">Color Palette</div>
            <div class="color-swatches">${swatches}</div>
            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
              ${theme.colorNames?.map((n) => `<span style="flex:1;min-width:40px;font-size:11px;color:#6b7280;text-align:center;">${n}</span>`).join('') || ''}
            </div>
          </div>
        `
            : ''
        }
        
        ${
          theme.decorationIdeas
            ? `
          <div class="theme-card-ideas" style="margin-top:14px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">🎀 Decoration Ideas</div>
            <ul>${theme.decorationIdeas.map((d) => `<li>${d}</li>`).join('')}</ul>
          </div>
        `
            : ''
        }
        
        ${
          theme.foodIdeas
            ? `
          <div class="theme-card-ideas" style="margin-top:12px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">🍽️ Food Ideas</div>
            <ul>${theme.foodIdeas.map((f) => `<li>${f}</li>`).join('')}</ul>
          </div>
        `
            : ''
        }
        
        ${
          theme.activities
            ? `
          <div class="theme-card-ideas" style="margin-top:12px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">🎮 Activities & Games</div>
            <ul>${theme.activities.map((a) => `<li>${a}</li>`).join('')}</ul>
          </div>
        `
            : ''
        }
        
        ${
          theme.uniqueExperience
            ? `
          <div style="margin-top:14px;padding:12px 14px;background:white;border-radius:10px;border:1px solid rgba(139,92,246,0.2);">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9333ea;margin-bottom:6px;">⭐ Signature Experience</div>
            <div style="font-size:13px;color:#374151;line-height:1.6;">${theme.uniqueExperience}</div>
          </div>
        `
            : ''
        }
        
        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-primary-sm" onclick="applyThemeToEvent('${escapeJs(theme.name)}')">
            <i data-lucide="check"></i> Apply to Current Event
          </button>
          <button class="btn-outline" style="padding:6px 14px;font-size:13px;" onclick="copyThemeName('${escapeJs(theme.name)}')">
            <i data-lucide="copy"></i> Copy Name
          </button>
        </div>
      </div>
    </div>
  `;
}

function applyThemeToEvent(themeName) {
  const event = Storage.getCurrentEvent();
  if (!event) {
    showToast('No active event. Please create an event first.', 'warning');
    navigateTo('create-event');
    return;
  }

  event.theme = themeName;
  Storage.setCurrentEvent(event);
  Storage.saveEvent(event);
  showToast(`Theme "${themeName}" applied to ${event.name}! ✓`, 'success');
}

function copyThemeName(name) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(name)
      .then(() => showToast(`"${name}" copied to clipboard!`, 'success'))
      .catch(() => showToast(`Theme: "${name}"`, 'info'));
  } else {
    showToast(`Theme: "${name}"`, 'info');
  }
}

function escapeJs(str) {
  return str?.replace(/'/g, "\\'").replace(/"/g, '&quot;') || '';
}

function loadThemeGeneratorPage() {
  const event = Storage.getCurrentEvent();
  if (event) {
    const eventTypeEl = document.getElementById('themeEventType');
    if (eventTypeEl) {
      const opts = Array.from(eventTypeEl.options);
      const match = opts.find((o) => o.value === event.type);
      if (match) eventTypeEl.value = event.type;
    }
  }
}
