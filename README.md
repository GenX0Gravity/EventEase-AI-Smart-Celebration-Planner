# EventEase AI – Smart Celebration Planner 🎊

> **100% Free & Open-Source AI Event Planning · Zero API Keys · Privacy First**

EventEase AI is a modern celebration planner web application that helps you organize **weddings, birthdays, anniversaries, community events, corporate gatherings, and baby showers**.

Powered by **local open-source AI via Ollama** (`qwen2.5:3b`, `llama3.2:3b`, `gemma3:1b`) with an **intelligent rule-based Smart Planning Mode fallback**. It requires **no paid subscriptions, no API keys, and no external dependencies**.

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| 🧠 **Local AI Event Planner** | Generates tailored plans (themes, decor, catering, entertainment, guest management, and tips) via Ollama |
| ⚡ **Smart Planning Mode** | Intelligent rule-based engine that works instantly when Ollama is offline — clearly labeled, zero AI required |
| 🚦 **Live AI Status Indicator** | Real-time status pill (**Green**: Local AI Connected, **Yellow**: Smart Planning Mode, **Red**: AI Service Unavailable) with one-click connection testing |
| 🎛️ **Model Selection** | Easily switch between `qwen2.5:3b`, `llama3.2:3b`, `gemma3:1b`, or custom models right from the toolbar |
| 💰 **Smart Budget Distribution** | Dynamic budget allocation across 7 categories with visual progress bars and an interactive doughnut chart |
| ⏰ **Milestone Timeline** | Preparation schedule with chronological due dates, overdue badges, and completion checkboxes |
| ✅ **Vendor Checklist** | Interactive task management across 7 categories; generate with AI or add custom tasks |
| 🎨 **Theme & Idea Generator** | Creative concepts, color swatches, decoration ideas, and unique celebration experiences |
| 📋 **Copy & Download Plan** | One-click **Copy Plan** to clipboard and **Download Event Plan** as a `.txt` file |
| 💾 **100% Private & Persistent** | All event data is stored locally in browser `LocalStorage` — works completely offline |

---

## 🚦 AI Status Indicator

The top bar features an active AI Status Indicator that shows:

- 🟢 **Green — Local AI Connected**: Ollama is running locally at `http://localhost:11434` with your selected model loaded.
- 🟡 **Yellow — Smart Planning Mode**: The rule-based engine is active. Runs 100% offline with zero setup.
- 🔴 **Red — AI Service Unavailable**: An active request to Ollama failed or timed out; automatic fallback to Smart Planning Mode is immediately available.
- 🔄 **Test Connection Button**: Click the refresh button in the topbar or modal to test the Ollama connection anytime.

---

## 🚀 Quick Start

### Option 1: Instant Use (No Installation Needed)

EventEase AI works immediately out of the box using **Smart Planning Mode**:

1. Double-click `index.html` to open it in your browser (Chrome, Edge, Firefox, Safari).
2. Click **"Load Demo Data"** on the Create Event page.
3. Click **"Generate AI Plan"** — the complete celebration plan is generated instantly using the rule-based engine.

---

### Option 2: Power Up with Free Local AI (Ollama)

For generative, personalized AI plans powered by open-source models:

#### 1. Install Ollama
Download and install Ollama from [ollama.ai](https://ollama.ai):
- **Windows**: Download the Windows installer (`OllamaSetup.exe`).
- **macOS**: Download from [ollama.ai/download/mac](https://ollama.ai/download/mac) or run `brew install ollama`.
- **Linux**: Run `curl -fsSL https://ollama.ai/install.sh | sh`.

#### 2. Pull a Recommended Model
Open your terminal (PowerShell, Command Prompt, or Bash) and run one of the recommended models:

```bash
# Recommended: Fast, accurate, excellent structured JSON
ollama run qwen2.5:3b

# Balanced: Meta's lightweight model with strong creative reasoning
ollama run llama3.2:3b

# Fastest: Ultra-lightweight model with near-instant responses
ollama run gemma3:1b
```

#### 3. Enable Browser Access (CORS)
Because the browser makes requests to `http://localhost:11434`, allow browser cross-origin requests:

**On Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

**On Windows (Command Prompt):**
```cmd
set OLLAMA_ORIGINS=*
ollama serve
```

**On macOS / Linux:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

*(If Ollama is already running as a background service on Windows, right-click the Ollama icon in the system tray, click **Quit**, then start it with the environment variable as shown above).*

#### 4. Open EventEase AI
1. Open `index.html` in your browser.
2. The AI Status Indicator in the top right will turn **Green: Local AI Connected (qwen2.5:3b)**.
3. Start planning!

---

## 🤖 Supported Local AI Models

| Model | Tag | Footprint | Best For |
|---|---|---|---|
| `qwen2.5:3b` | **Recommended** | ~2.0 GB | Strict structured JSON, balanced speed and reasoning |
| `llama3.2:3b` | **Balanced** | ~2.0 GB | Creative party ideas and engaging entertainment concepts |
| `gemma3:1b` | **Fastest** | ~800 MB | Ultra-fast responses on low-spec hardware |
| `qwen2.5:7b` | **High Quality** | ~4.5 GB | Deep, nuanced planning (requires ~8GB RAM) |
| `llama3.2:1b` | **Ultra Light** | ~700 MB | Runs smoothly on any machine |

---

## 📂 Project Structure

```
EventEase-AI-Smart-Celebration-Planner/
├── index.html              # Main Single Page Application (8 complete views)
├── css/
│   └── styles.css          # Modern CSS design (gradients, cards, status indicators, badges)
├── js/
│   ├── app.js              # Application controller (nav, modals, status indicator, toast)
│   ├── ollama.js           # Ollama client: connection testing, model discovery, /api/chat
│   ├── fallback.js         # Smart Planning Mode: rule-based engine (plans, budgets, timelines, checklists, themes)
│   ├── api.js              # Orchestrator: dispatches to Ollama with smooth Smart Mode fallback
│   ├── storage.js          # LocalStorage manager for persistence across refreshes
│   ├── demo-data.js        # Built-in demo celebration (Priya & Arjun's Royal Wedding)
│   ├── planner.js          # Event Planner: card rendering, Copy Plan, Download Plan
│   ├── budget.js           # Smart Budget: allocation bars, Chart.js doughnut, saving tips
│   ├── timeline.js         # Milestone Timeline: dates, overdue alerts, task completion
│   ├── checklist.js        # Vendor Checklist: task categories, custom task addition
│   └── theme-generator.js  # Theme Generator: color swatches, decoration concepts, unique experiences
├── package.json            # Node project configuration
├── vercel.json             # Static site deployment configuration
└── README.md               # Setup & user documentation
```

---

## 🔒 Privacy & Security

- **100% Private**: Your event names, guest counts, and budget details never leave your computer.
- **Zero API Keys**: No keys to manage, lose, or pay for.
- **Offline First**: All models and algorithms run locally on `localhost`.

---

## 🌐 Free Static Deployment

You can deploy the static frontend to any free hosting provider:
- **GitHub Pages**: Push to repository and enable GitHub Pages under Settings → Pages.
- **Vercel**: Deploy as a static project (`npx vercel`).
- **Netlify**: Drag-and-drop the project folder to Netlify Drop.

*(When deployed online, the browser can connect to your local Ollama instance if CORS is configured, or seamlessly use Smart Planning Mode).*

---

## 📄 License

MIT License — Free to use, adapt, and build upon.
