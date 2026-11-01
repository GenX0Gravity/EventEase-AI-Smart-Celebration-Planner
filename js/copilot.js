/**
 * EventEase AI – EventEase Copilot Module
 * Interactive AI Assistant for custom event planning queries, cost reduction,
 * creative ideas, and direct plan adjustments.
 * Supports Ollama local models with seamless rule-based fallback.
 */

const Copilot = {
  activeSession: null,

  init() {
    this.renderChatHistory();
    this.setupListeners();
    this.updateModelBadge();
  },

  setupListeners() {
    const input = document.getElementById('copilotInput');
    const sendBtn = document.getElementById('copilotSendBtn');
    const clearBtn = document.getElementById('copilotClearBtn');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear chat history?')) {
          Storage.clearCopilotChats();
          this.renderChatHistory();
        }
      });
    }

    // Prompt pills
    document.querySelectorAll('.copilot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
        if (input) {
          input.value = prompt;
          this.sendMessage();
        }
      });
    });
  },

  updateModelBadge() {
    const badge = document.getElementById('copilotModelBadge');
    if (!badge) return;
    if (OllamaClient.isConnected) {
      badge.textContent = OllamaClient.currentModel;
      badge.className = 'badge badge-ai';
    } else {
      badge.textContent = 'Smart Planning Mode';
      badge.className = 'badge badge-smart';
    }
  },

  renderChatHistory() {
    const container = document.getElementById('copilotMessages');
    if (!container) return;

    const chats = Storage.getCopilotChats();
    if (chats.length === 0) {
      const activeEvent = Storage.getActiveEvent();
      const eventName = activeEvent ? `"${activeEvent.name}"` : 'your celebration';
      container.innerHTML = `
        <div class="copilot-welcome">
          <div class="copilot-welcome-avatar">
            <i data-lucide="sparkles"></i>
          </div>
          <h3>Hi! I'm EventEase Copilot</h3>
          <p>Your intelligent, privacy-first event planning assistant. Ask me anything about ${eventName}, budgeting, decor, entertainment, catering, or vendor negotiation!</p>
          <div class="copilot-welcome-chips">
            <span class="copilot-chip" data-prompt="How can I cut catering expenses by 20% without losing quality?">💡 Cut catering costs</span>
            <span class="copilot-chip" data-prompt="Suggest 5 memorable entertainment activities for our guests">🎉 Unique entertainment</span>
            <span class="copilot-chip" data-prompt="Give me a checklist for the last 48 hours before the event">⏱️ 48-hour checklist</span>
            <span class="copilot-chip" data-prompt="What are some eco-friendly decor and zero-waste catering ideas?">🌿 Eco-friendly tips</span>
          </div>
        </div>
      `;
      lucide.createIcons();
      this.rebindChips();
      return;
    }

    let html = '';
    chats.forEach(msg => {
      if (msg.sender === 'user') {
        html += `
          <div class="copilot-msg user">
            <div class="copilot-msg-bubble">${this.escapeHTML(msg.text)}</div>
            <div class="copilot-msg-meta">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        `;
      } else {
        html += `
          <div class="copilot-msg assistant">
            <div class="copilot-avatar-sm">
              <i data-lucide="sparkles"></i>
            </div>
            <div class="copilot-msg-body">
              <div class="copilot-msg-bubble">${this.formatAssistantReply(msg.text)}</div>
              ${msg.structuredData ? this.renderStructuredCard(msg.structuredData) : ''}
              <div class="copilot-msg-meta">
                <span>${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button class="btn-text-sm" onclick="Copilot.copyText(this)">Copy</button>
              </div>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    lucide.createIcons();
    container.scrollTop = container.scrollHeight;
  },

  rebindChips() {
    document.querySelectorAll('.copilot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('copilotInput');
        const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
        if (input) {
          input.value = prompt;
          this.sendMessage();
        }
      });
    });
  },

  async sendMessage() {
    const input = document.getElementById('copilotInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    Storage.addCopilotMessage('user', query);
    this.renderChatHistory();

    const container = document.getElementById('copilotMessages');
    const loadingId = 'loading_' + Date.now();
    const loadingHtml = `
      <div class="copilot-msg assistant" id="${loadingId}">
        <div class="copilot-avatar-sm">
          <i data-lucide="sparkles"></i>
        </div>
        <div class="copilot-msg-body">
          <div class="copilot-msg-bubble copilot-typing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            <span style="margin-left: 8px; font-size: 0.85rem; color: var(--gray-500);">
              ${OllamaClient.isConnected ? `Thinking with ${OllamaClient.currentModel}...` : 'Consulting Smart Planning Engine...'}
            </span>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', loadingHtml);
    lucide.createIcons();
    container.scrollTop = container.scrollHeight;

    const activeEvent = Storage.getActiveEvent() || DEMO_EVENT;
    const systemPrompt = `You are EventEase Copilot, an expert celebration and event planning assistant. 
Event Context:
- Name: ${activeEvent.name || 'Celebration'}
- Type: ${activeEvent.type || 'Event'}
- Guests: ${activeEvent.guests || 100}
- Total Budget: ${Storage.formatMoney(activeEvent.budget || 200000)}
- Location: ${activeEvent.location || 'Local'}
- Theme: ${activeEvent.theme || 'Elegant'}

Provide insightful, actionable, practical, cost-conscious, and creative event planning advice. Be warm, structured, and use bullet points or numbered lists. When suggesting numbers, keep them realistic and mathematically sound.`;

    try {
      let replyText = '';
      if (OllamaClient.isConnected) {
        try {
          const res = await OllamaClient.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ]);
          replyText = res;
        } catch {
          replyText = this.generateSmartFallbackReply(query, activeEvent);
        }
      } else {
        // Smart Planning Engine fallback
        await new Promise(r => setTimeout(r, 600)); // slight natural feel
        replyText = this.generateSmartFallbackReply(query, activeEvent);
      }

      const loadEl = document.getElementById(loadingId);
      if (loadEl) loadEl.remove();

      Storage.addCopilotMessage('assistant', replyText);
      this.renderChatHistory();
    } catch (err) {
      const loadEl = document.getElementById(loadingId);
      if (loadEl) loadEl.remove();

      const errMsg = "I encountered an issue processing that query. Here is a helpful tip: Check your event budget categories or ask for specific tips on catering, decor, or timelines!";
      Storage.addCopilotMessage('assistant', errMsg);
      this.renderChatHistory();
    }
  },

  generateSmartFallbackReply(query, event) {
    const q = query.toLowerCase();
    const eventType = event.type || 'Celebration';
    const budget = Number(event.budget) || 200000;
    const guests = Number(event.guests) || 100;

    if (q.includes('catering') || q.includes('food') || q.includes('cut cost') || q.includes('expense')) {
      return `### 💡 Smart Catering & Budget Optimization for ${event.name || eventType}
Here are 5 proven ways to optimize food and catering expenses for ${guests} guests:

1. **Strategic Food Stations vs. Plated Dining**: Live interactive stations (e.g. Pasta/Noodle bar, Chaat counter, Taco/Kathi roll stand) feel luxurious and custom-tailored while reducing overall food waste and staff costs by up to **20%**.
2. **Limit Heavy Passed Hors d'oeuvres**: Serve 3 high-impact starters (2 vegetarian + 1 specialty) instead of 7-8 variations. Guests fill up before the main meal, and unused appetizers represent pure waste.
3. **Seasonal & Regional Specialties**: Opt for seasonal vegetables and locally sourced ingredients. For a ${budget > 500000 ? 'grand celebration' : 'smart celebration'}, regional delights (like live Dal Baati, Biryani degs, or seasonal fruit tarts) cost less and taste fresher.
4. **Signature Mocktail / Cocktail Bar**: Instead of stocking a full 50-bottle bar, introduce 2 personalized signature drinks (e.g., *"${event.name ? event.name.split(' ')[0] : 'Celebration'} Sunset Sparkler"*). This reduces liquor/syrup inventory costs by **30%**.
5. **Dessert Display with Miniature Portions**: Miniature desserts, assorted bite-sized pastries, and live jalebi or waffle counters create higher visual excitement than massive sliced cakes and keep cost per head under control.`;
    }

    if (q.includes('decor') || q.includes('decoration') || q.includes('theme') || q.includes('ideas')) {
      return `### ✨ Creative Decor Concepts for ${event.name || eventType}
Tailored to your preference: **${event.theme || 'Vibrant & Modern'}**

1. **Illumination Hierarchy**: Warm lighting does 70% of the decor work at 20% of the cost. String warm fairy lights overhead, use LED uplights on architectural pillars, and place candle votives on dining tables.
2. **Focal Point Strategy**: Rather than spreading budget thin across the entire hall, concentrate 60% of your decor budget on 2 hero areas:
   - The Grand Welcome Entryway / Photo arch
   - The Stage / Main Couple Backdrop
3. **Textiles & Fabric Drapery**: Flowing ceiling drapes in soft lavender, rose gold, and royal cream add instant grandeur, hide unsightly venue fixtures, and cost significantly less than all-floral installations.
4. **Statement Greenery & Dried Florals**: Combine fresh fragrant local blooms (marigold, jasmine, or baby's breath) with lush monstera and eucalyptus leaves for high volume and longevity.
5. **Custom Photo Moments**: Create an interactive photo corner with a personalized neon sign or chalkboard board celebrating the milestone date (${event.date || 'Event Day'}).`;
    }

    if (q.includes('timeline') || q.includes('schedule') || q.includes('hour') || q.includes('day')) {
      return `### ⏱️ Recommended Schedule & Milestone Checklist for ${event.name || eventType}
Based on an event date of **${event.date || 'Upcoming'}** and ${guests} guests:

- **Morning (T - 4 Hours)**: Decorator, sound technician, and florist arrive for primary setup. Sound check completed before host arrival.
- **T - 1 Hour**: Host and key family arrival; private photo session and bridal/groom portraits before crowd enters.
- **T - 0 Hour (Welcome)**: Welcome drinks, ambient acoustic/lounge music, guest registration, and welcome photo corner active.
- **T + 1.5 Hours (Main Moment)**: Key ceremony, ring exchange, vows, or milestone cake-cutting ceremony.
- **T + 2.5 Hours (Dining Opens)**: Main buffet and live counters open; background entertainment or speeches.
- **T + 4 Hours (Party & Finale)**: Open dance floor, DJ set, and signature farewell send-off.`;
    }

    if (q.includes('eco') || q.includes('green') || q.includes('sustainable') || q.includes('waste')) {
      return `### 🌿 Eco-Friendly & Sustainable Celebration Guide
Celebrate meaningfully with minimal environmental footprint:

1. **Digital-First Invitations**: Use EventEase AI's Invitation Studio to send stylish WhatsApp & Email invitations with RSVP links, saving paper and courier emissions.
2. **Potted Plant Centerpieces**: Use small potted ferns, succulents, or flowering herbs as table centerpieces that double as take-home favors for guests.
3. **Zero Single-Use Plastics**: Insist on reusable ceramic/copper tableware or compostable areca nut leaf plates. Provide glass water dispensers infused with mint and citrus instead of plastic bottles.
4. **Food Rescue Partnership**: Partner with a local food bank or charitable trust (e.g. Robin Hood Army / Feeding India) to collect excess untouched food post-event.
5. **Biodegradable Confetti & Flower Petals**: Use dried marigold and rose petals for celebrations rather than plastic glitter or metallic poppers.`;
    }

    // Default intelligent response
    return `### 📋 Comprehensive Planning Recommendations for ${event.name || eventType}

Here is a strategic plan for your upcoming **${eventType}** (${guests} guests, ${Storage.formatMoney(budget)} budget):

1. **Budget Breakdown Priority**:
   - **Venue & Space**: 30% (${Storage.formatMoney(budget * 0.3)})
   - **Food & Catering**: 25% (${Storage.formatMoney(budget * 0.25)})
   - **Decor & Ambiance**: 15% (${Storage.formatMoney(budget * 0.15)})
   - **Photography & Memories**: 10% (${Storage.formatMoney(budget * 0.1)})
   - **Entertainment & DJ**: 8% (${Storage.formatMoney(budget * 0.08)})
   - **Contingency / Misc**: 12% (${Storage.formatMoney(budget * 0.12)})

2. **Immediate Action Steps**:
   - Lock in your primary venue contract and date.
   - Send out "Save the Date" notices to your ${guests} guests.
   - Schedule food tasting sessions with 2 shortlisted caterers.

Feel free to ask me to drill down into catering menus, budget adjustments, or day-of emergency checklists!`;
  },

  formatAssistantReply(text) {
    if (!text) return '';
    // Format markdown bold, headers, and lists
    let html = text
      .replace(/### (.*?)\n/g, '<h4 class="copilot-h4">$1</h4>')
      .replace(/## (.*?)\n/g, '<h3 class="copilot-h3">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*?)(?=\n|$)/g, '<li class="copilot-li">$1</li>')
      .replace(/\n\d+\. (.*?)(?=\n|$)/g, '<li class="copilot-li-num">$1</li>');

    // Wrap consecutive list items in ul
    html = html.replace(/(<li class="copilot-li">.*?<\/li>)+/g, '<ul class="copilot-ul">$&</ul>');
    html = html.replace(/(<li class="copilot-li-num">.*?<\/li>)+/g, '<ol class="copilot-ol">$&</ol>');
    html = html.replace(/\n\n/g, '<br/><br/>');
    return html;
  },

  renderStructuredCard(data) {
    return '';
  },

  copyText(btn) {
    const bubble = btn.closest('.copilot-msg-body')?.querySelector('.copilot-msg-bubble');
    if (bubble) {
      navigator.clipboard.writeText(bubble.innerText);
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 2000);
    }
  },

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
