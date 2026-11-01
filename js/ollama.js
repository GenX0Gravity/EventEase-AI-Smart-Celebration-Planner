/**
 * EventEase AI – Ollama Local AI Client
 * Connects to a locally running Ollama instance (default: http://127.0.0.1:11434 or /api/ollama)
 * No API keys. No paid subscriptions. Fully private and offline-capable.
 */

const DEFAULT_OLLAMA_HOST = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'qwen2.5:3b';

const OLLAMA_MODELS = [
  { id: 'qwen2.5:3b',   name: 'Qwen 2.5 3B',   tag: 'Recommended', desc: 'Fast, highly accurate for structured JSON output' },
  { id: 'qwen3:8b',     name: 'Qwen 3 8B',     tag: 'Advanced',    desc: 'Deep reasoning and complex celebration planning' },
  { id: 'llama3.2:3b',  name: 'Llama 3.2 3B',  tag: 'Balanced',    desc: 'Meta model with strong creative reasoning' },
  { id: 'gemma3:1b',    name: 'Gemma 3 1B',    tag: 'Fastest',     desc: 'Google lightweight model with instant responses' },
  { id: 'gemma4:26b',   name: 'Gemma 4 26B',   tag: 'Ultra Quality', desc: 'Enterprise-grade deep intelligence' },
  { id: 'qwen2.5:7b',   name: 'Qwen 2.5 7B',   tag: 'High Quality', desc: 'Maximum depth and precision' },
  { id: 'llama3.2:1b',  name: 'Llama 3.2 1B',  tag: 'Ultra Light', desc: 'Runs on virtually any hardware smoothly' },
  { id: 'mistral:7b',   name: 'Mistral 7B',    tag: 'Creative',    desc: 'Powerful open model for themed event storytelling' },
];

const OllamaClient = {
  _status: 'unknown',       // 'connected' | 'smart' | 'unavailable' | 'checking'
  _installedModels: [],     // list from GET /api/tags
  _lastError: null,
  _activeBaseUrl: null,

  // ─── Host Resolution ─────────────────────────────────────────────
  get host() {
    return localStorage.getItem('eventease_ollama_host') || this._activeBaseUrl || DEFAULT_OLLAMA_HOST;
  },

  set host(value) {
    if (!value) {
      localStorage.removeItem('eventease_ollama_host');
      this._activeBaseUrl = null;
      return;
    }
    const clean = value.trim().replace(/\/+$/, '');
    localStorage.setItem('eventease_ollama_host', clean);
    this._activeBaseUrl = clean;
  },

  getBaseUrl() {
    return this.host;
  },

  // ─── Model & Mode Persistence ────────────────────────────────────
  getModel() {
    const stored = localStorage.getItem('eventease_ollama_model');
    if (stored) return stored;
    if (this._installedModels && this._installedModels.length > 0) {
      return this._installedModels.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : this._installedModels[0];
    }
    return DEFAULT_MODEL;
  },

  setModel(model) {
    if (!model) return;
    localStorage.setItem('eventease_ollama_model', model);
  },

  get currentModel() {
    return this.getModel();
  },

  set currentModel(model) {
    this.setModel(model);
  },

  get isConnected() {
    return this._status === 'connected';
  },

  checkIsConnected() {
    return this._status === 'connected';
  },

  getStatus() {
    return this._status;
  },

  getInstalledModels() {
    return this._installedModels;
  },

  getPlanningMode() {
    return localStorage.getItem('eventease_planning_mode') || 'auto'; // 'auto' | 'smart-only'
  },

  setPlanningMode(mode) {
    localStorage.setItem('eventease_planning_mode', mode);
  },

  isHttpsMixedContent() {
    return typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'https:' &&
      !this.host.startsWith('https://');
  },

  // ─── Connection Check with Fallback Probing ───────────────────────
  async checkConnection(interactive = false) {
    // If user explicitly chose "smart-only", stay in Smart Planning Mode
    if (this.getPlanningMode() === 'smart-only' && !interactive) {
      this._status = 'smart';
      this._notifyStatusChange('smart', null, [], 'Smart Planning Mode selected by user');
      return { connected: false, mode: 'smart', models: [] };
    }

    this._status = 'checking';
    this._notifyStatusChange('checking');

    // Build candidate hosts to probe in order of preference
    const candidates = [];

    // 1. If running from local web server (e.g. port 3000), use built-in same-origin proxy first
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        candidates.push(`${origin}/api/ollama`);
      }
    }

    // 2. Custom host from user settings if provided
    const customHost = localStorage.getItem('eventease_ollama_host');
    if (customHost && !candidates.includes(customHost.trim().replace(/\/+$/, ''))) {
      candidates.push(customHost.trim().replace(/\/+$/, ''));
    }

    // 3. Direct loopback IPv4 (Ollama on Windows binds to 127.0.0.1)
    if (!candidates.includes('http://127.0.0.1:11434')) {
      candidates.push('http://127.0.0.1:11434');
    }
    // 4. Standard localhost
    if (!candidates.includes('http://localhost:11434')) {
      candidates.push('http://localhost:11434');
    }

    let connectedHost = null;
    let foundModels = [];
    let lastError = null;

    for (const host of candidates) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 5000);
        const tagsUrl = host.endsWith('/api/ollama') ? `${host}/tags` : `${host}/api/tags`;

        const res = await fetch(tagsUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(tid);

        if (res.ok) {
          const data = await res.json();
          foundModels = (data.models || []).map(m => m.name || m.model || '').filter(Boolean);
          connectedHost = host;
          break;
        }
      } catch (err) {
        lastError = err.message || 'Connection failed';
      }
    }

    if (connectedHost) {
      this._activeBaseUrl = connectedHost;
      this._installedModels = foundModels;
      this._status = 'connected';
      this._lastError = null;

      // Auto-validate current model selection
      const current = this.getModel();
      if (foundModels.length > 0 && !foundModels.includes(current)) {
        if (foundModels.includes(DEFAULT_MODEL)) {
          this.setModel(DEFAULT_MODEL);
        } else {
          this.setModel(foundModels[0]);
        }
      }

      this._notifyStatusChange('connected', this.getModel(), this._installedModels);
      this.syncModelDropdowns();

      return {
        connected: true,
        mode: 'connected',
        models: this._installedModels,
        host: connectedHost,
      };
    }

    this._lastError = lastError || 'Unable to connect to Ollama';
    this._status = interactive ? 'unavailable' : 'smart';
    this._notifyStatusChange(this._status, null, [], this._lastError);

    return {
      connected: false,
      mode: this._status,
      models: [],
      error: this._lastError,
    };
  },

  // ─── Multi-turn Chat for Copilot ──────────────────────────────────
  async chat(messages, options = {}) {
    if (this.getPlanningMode() === 'smart-only') {
      throw new Error('SMART_MODE_ONLY');
    }

    const model = options.model || this.getModel();
    const timeoutMs = options.timeoutMs || 90000;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    const baseUrl = this.getBaseUrl();
    const chatUrl = baseUrl.endsWith('/api/ollama') ? `${baseUrl}/chat` : `${baseUrl}/api/chat`;

    try {
      const res = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.numPredict || 2500,
          },
        }),
      });
      clearTimeout(tid);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Ollama HTTP ${res.status}: ${errText.slice(0, 120)}`);
      }

      const data = await res.json();
      const raw = data.message?.content || data.response || '';
      if (!raw.trim()) throw new Error('Empty response from model');

      return raw.trim();
    } catch (err) {
      clearTimeout(tid);
      this._lastError = err.message;
      if (err.name === 'AbortError') throw new Error('OLLAMA_TIMEOUT');
      throw err;
    }
  },

  // ─── Structured JSON Generation for Planners ─────────────────────
  async generate(systemPrompt, userPrompt, timeoutMs = 90000) {
    if (this.getPlanningMode() === 'smart-only') {
      throw new Error('SMART_MODE_ONLY');
    }

    const model = this.getModel();
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    const baseUrl = this.getBaseUrl();
    const chatUrl = baseUrl.endsWith('/api/ollama') ? `${baseUrl}/chat` : `${baseUrl}/api/chat`;

    try {
      const res = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt   },
          ],
          stream: false,
          format: 'json',
          options: { temperature: 0.7, num_predict: 3500 },
        }),
      });
      clearTimeout(tid);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Ollama HTTP ${res.status}: ${errText.slice(0, 120)}`);
      }

      const data = await res.json();
      const raw = data.message?.content || data.response || '';
      if (!raw.trim()) throw new Error('Empty response from model');

      return this._parseJSON(raw);
    } catch (err) {
      clearTimeout(tid);
      this._lastError = err.message;
      if (err.name === 'AbortError') throw new Error('OLLAMA_TIMEOUT');
      throw err;
    }
  },

  // ─── JSON Parser ─────────────────────────────────────────────────
  _parseJSON(text) {
    try { return JSON.parse(text); } catch {}

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try { return JSON.parse(fenced[1].trim()); } catch {}
    }

    const objStart = text.indexOf('{');
    const objEnd   = text.lastIndexOf('}');
    if (objStart !== -1 && objEnd > objStart) {
      try { return JSON.parse(text.slice(objStart, objEnd + 1)); } catch {}
    }

    throw new Error('Could not parse valid JSON from AI response');
  },

  // ─── UI Sync Helper ──────────────────────────────────────────────
  syncModelDropdowns() {
    const selects = ['ollamaModelSelect', 'plannerModelSelect'];
    const current = this.getModel();

    selects.forEach(selectId => {
      const el = document.getElementById(selectId);
      if (!el) return;

      if (this._installedModels.length > 0) {
        el.innerHTML = '';
        this._installedModels.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          const meta = OLLAMA_MODELS.find(om => om.id === m);
          opt.textContent = meta ? `${m} (${meta.tag})` : m;
          if (m === current) opt.selected = true;
          el.appendChild(opt);
        });
      }
    });
  },

  _notifyStatusChange(status, model, models, msg) {
    if (typeof updateAIStatus === 'function') {
      try { updateAIStatus(status, model, models, msg); } catch {}
    }
    if (typeof updateAiStatusUI === 'function') {
      try { updateAiStatusUI(); } catch {}
    }
  },
};
