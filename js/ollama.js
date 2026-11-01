/**
 * EventEase AI – Ollama Local AI Client
 * Connects to a locally running Ollama instance at http://localhost:11434
 * No API keys. No paid subscriptions. Fully private and offline-capable.
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

const OLLAMA_MODELS = [
  { id: 'qwen2.5:3b',   name: 'Qwen 2.5 3B',   tag: 'Recommended', desc: 'Fast, highly accurate for structured JSON output' },
  { id: 'llama3.2:3b',  name: 'Llama 3.2 3B',  tag: 'Balanced',     desc: 'Meta model with strong creative reasoning' },
  { id: 'gemma3:1b',    name: 'Gemma 3 1B',    tag: 'Fastest',      desc: 'Google lightweight model with instant responses' },
  { id: 'qwen2.5:7b',   name: 'Qwen 2.5 7B',   tag: 'High Quality', desc: 'Maximum depth and precision (needs ~8GB RAM)' },
  { id: 'llama3.2:1b',  name: 'Llama 3.2 1B',  tag: 'Ultra Light',  desc: 'Runs on virtually any hardware smoothly' },
  { id: 'mistral:7b',   name: 'Mistral 7B',    tag: 'Advanced',     desc: 'Powerful open model for complex event logic' },
];

const DEFAULT_MODEL = 'qwen2.5:3b';

const OllamaClient = {
  _status: 'unknown',   // 'connected' | 'smart' | 'unavailable' | 'checking'
  _installedModels: [], // list from GET /api/tags
  _lastError: null,

  // ─── Persistence ────────────────────────────────────────────────
  getModel() {
    return localStorage.getItem('eventease_ollama_model') || DEFAULT_MODEL;
  },
  setModel(model) {
    localStorage.setItem('eventease_ollama_model', model);
  },
  getPlanningMode() {
    return localStorage.getItem('eventease_planning_mode') || 'auto'; // 'auto' | 'smart-only'
  },
  setPlanningMode(mode) {
    localStorage.setItem('eventease_planning_mode', mode);
  },

  // ─── Connection Check ────────────────────────────────────────────
  async checkConnection(interactive = false) {
    // If user explicitly chose "smart-only", stay in Smart Planning Mode
    if (this.getPlanningMode() === 'smart-only' && !interactive) {
      this._status = 'smart';
      if (typeof updateAIStatus === 'function') {
        updateAIStatus('smart', null, [], 'Smart Planning Mode selected by user');
      }
      return { connected: false, mode: 'smart', models: [] };
    }

    this._status = 'checking';
    if (typeof updateAIStatus === 'function') {
      updateAIStatus('checking');
    }

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(tid);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._installedModels = (data.models || []).map(m => m.name || m.model || '').filter(Boolean);
      this._status = 'connected';
      this._lastError = null;

      if (typeof updateAIStatus === 'function') {
        updateAIStatus('connected', this.getModel(), this._installedModels);
      }
      return { connected: true, mode: 'connected', models: this._installedModels };
    } catch (err) {
      this._lastError = err.message;
      // If Ollama is down, fallback is Smart Planning Mode (or Unavailable if explicit error)
      this._status = interactive ? 'unavailable' : 'smart';
      if (typeof updateAIStatus === 'function') {
        updateAIStatus(this._status, null, [], err.message);
      }
      return { connected: false, mode: this._status, models: [], error: err.message };
    }
  },

  // ─── Generate ───────────────────────────────────────────────────
  async generate(systemPrompt, userPrompt, timeoutMs = 90000) {
    if (this.getPlanningMode() === 'smart-only') {
      throw new Error('SMART_MODE_ONLY');
    }

    const model = this.getModel();
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
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

  isConnected() { return this._status === 'connected'; },
  getInstalledModels() { return this._installedModels; },
  getStatus() { return this._status; },
};
