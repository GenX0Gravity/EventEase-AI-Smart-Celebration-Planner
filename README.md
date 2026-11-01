# EventEase AI – Smart Celebration & Event Management Platform 🎊

> **Plan Less. Celebrate More.**  
> *A 100% Free, Open-Source, Privacy-First AI Celebration Management SaaS Platform.*  
> *Zero Paid APIs · Zero Mandatory API Keys · Local Ollama AI · Intelligent Smart Planning Fallback.*

[![Live Website](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-7c3aed?style=for-the-badge&logo=vercel)](https://eventease-ai-seven.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/GenX0Gravity/EventEase-AI-Smart-Celebration-Planner)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Ollama%20%7C%20Smart%20Planning-10b981?style=for-the-badge)](https://ollama.ai)

---

## 📖 1. Project Overview & Problem Statement

### The Problem
Event planning for weddings, milestone birthdays, anniversaries, corporate galas, and community festivals is notoriously chaotic. Planners and families juggle disconnected tools:
- Spreadsheets for tracking RSVPs and scattered vendor quotes.
- Clunky note apps for day-of runs of show.
- Expensive commercial software that demands monthly subscriptions, enforces paywalls, and uploads sensitive guest lists and personal financial budgets to third-party cloud servers.

### The Solution: EventEase AI
**EventEase AI** transforms celebration planning into a joyful, unified, and private experience. It combines a commercial-grade SaaS interface with local open-source artificial intelligence (Ollama) and a deterministic client-side **Smart Planning Engine**.

Whether you are:
- A couple planning a grand wedding in Jaipur,
- An organizer hosting a 50-person surprise 30th birthday,
- A community leader coordinating a festive cultural gala, or
- A family orchestrating an intimate baby shower,

EventEase AI generates end-to-end strategic plans, calculates mathematically balanced category budgets, tracks actual expenses with overspending warnings, manages guest RSVPs and dining table seating, coordinates vendors, renders downloadable high-res invitations, and powers a dedicated **Day-Of Command Center** on event day.

---

## ✨ 2. Key Modules & Feature Highlights

### 🧙 1. Multi-Step Event Creation Wizard
- **Step 1: Basics**: Event Name, Type (7 archetypes), Date, Start & End Time, Location, Venue Type (Indoor, Outdoor Lawn, Courtyard, Beachfront, Residence).
- **Step 2: Guests**: Expected headcount, Adults vs Children split, VIP count, Special guest accommodations.
- **Step 3: Budget**: Total budget, Currency selector (`INR ₹`, `USD $`, `EUR €`, `GBP £`, `AUD A$`, `CAD C$`), Budget flexibility mode (Flexible, Strict, Ballpark).
- **Step 4: Style & Preferences**: Celebration theme, Color palette, Formality (Formal, Semi-formal, Casual), Food style, Entertainment.
- **Step 5: Requirements**: Cultural/religious nuances, Accessibility considerations, Special instructions.

### 🧠 2. EventEase Copilot (Interactive AI Assistant)
- Conversational chat assistant powered by local Ollama models (`qwen2.5:3b`, `llama3.2:3b`, `gemma3:1b`) with instant rule-based fallback.
- Quick prompt chips: *“How can I cut catering expenses by 20%?”*, *“Suggest 5 unique entertainment activities”*, *“Give me a 48-hour pre-event checklist”*, *“Eco-friendly decor tips”*.
- Structured answers rendered with rich typography, bullet points, and copyable text blocks.

### 📋 3. AI Event Planning Dossier
- Generates a 7-part master plan:
  1. Executive Summary & Hero Highlights.
  2. Recommended Theme & Moodboard Concepts.
  3. Architectural Decoration & Lighting Schemes.
  4. Multi-Course Catering & Beverage Station Menus.
  5. Entertainment, Music & Photography Shot Lists.
  6. Guest Hospitality, Welcome Favors & Accessibility.
  7. Personalized Pro Tips for Avoiding Hidden Costs.
- **Copy Plan** (Markdown) & **Download Brief** (`.txt`) actions.

### 💰 4. Smart Budget & Actual Expense Management
- Category budget allocation across Venue, Catering, Decoration, Photography, Entertainment, Invitations, Transportation, and Miscellaneous.
- Visual Planned vs Actual progress bars with **Overspending Alert Badges** (`⚠️ Over by ₹X`).
- Interactive Chart.js doughnut chart for spending distribution.
- **Actual Expense Register**: Add, edit, and delete real receipts with payment status (Paid, Pending).
- **Export to CSV**: One-click download of all logged transactions.
- **Smart Budget Saver**: Specific cost-cutting hacks tailored per category.

### 👥 5. Guest Management & Seating Planner
- Track RSVPs across 4 statuses: *Confirmed*, *Invited*, *Maybe*, *Declined*.
- Headcount counters accounting for accompanying plus-ones (`+1`, `+2`).
- Dietary preference badges (Vegetarian, Non-Veg, Vegan, Jain/Strict Veg, Gluten-Free, Kids Menu).
- Contact management (Phone, Email) with quick search and filters.
- **CSV Export & CSV Import**: Standard format for importing existing spreadsheets.
- **Seating & Table Planner**: Create named tables with seat capacities, track seat occupancy, and assign/unassign guests visually.

### 🤝 6. Vendor Coordination Directory
- Track vendors across 10 service categories (Venue, Catering, Photo, Video, Decor, DJ, Transport, Makeup, Florist, Equipment).
- Compare Initial Quoted Price vs Final Negotiated Price with savings calculation.
- Manage Booking Status (*Researching, Contacted, Shortlisted, Booked, Completed*) and Payment Status (*Pending, Deposit Paid, Fully Paid*).

### ⏰ 7. Preparation Timeline & Milestones
- Chronological task scheduling backward from the event date (4 months, 3 months, 1 month, 2 weeks, 1 week, 3 days, 1 day, Event day).
- Days remaining countdown, overdue warning badges, and completion checkboxes.
- Add custom milestones with due dates and priority tags.

### ✉️ 8. Invitation Studio
- Visual invitation designer with 5 aesthetic templates:
  - 👑 *Royal Elegance* (Crimson & Palace Gold)
  - 🎉 *Vibrant Celebration* (Modern Purple & Pink)
  - ✨ *Minimalist Chic* (Crisp & Contemporary)
  - 🌿 *Botanical Garden* (Sage Green & Natural)
  - 👔 *Corporate Gala* (Executive Navy & Silver)
- Live real-time card preview reflecting host names, dates, times, venue address, dress code, colors, and typography.
- **Download Image (PNG)** rendered via client-side HTML5 Canvas.
- **Print / PDF Preview** stylesheet.
- **Copy WhatsApp / SMS Text** ready to share.

### ⚡ 9. Event Day Mode (Day-Of Command Center)
- High-contrast, mobile-optimized dashboard designed for the actual day of the celebration.
- **Live Run-of-Show Timeline**: Hour-by-hour schedule with strike-through completion checkboxes.
- **Emergency Vendor Speed-Dial**: Direct tap-to-call (`tel:`) and tap-to-message (WhatsApp) buttons for all booked vendors.
- **Must-Not-Forget Critical Checklist**: Rings, soundcheck, cake delivery, final balance envelopes.
- **Day-Of Emergency Kit Checklist**: First-aid, safety pins, power banks, stain removers.

### 💡 10. Celebration Idea Studio
- Explore curated concepts: Budget-friendly hacks, unique surprises, eco-friendly zero-waste celebrations, DIY decor, and games.
- Save ideas to persistent browser favorites.

### 📊 11. Reports, Analytics & Shareable Dossier
- Executive variance metrics: Total Planned vs Actual Spent vs Remaining Balance.
- Spending by Category bar chart and Guest Attendance donut chart.
- **Download Event Dossier**: Full markdown event brief with vendor contact sheet and day-of schedule.

### 💾 12. Local Profile, Data Backup & Restore
- Customizable host profile (Display Name, Title, Preferred Currency).
- **Dark Mode / Light Mode** toggle with instant persistent styling.
- **Download Full JSON Backup**: Complete export of all events, guests, vendors, expenses, and settings.
- **Restore from JSON**: Full backup validation and restore.
- 100% private to the user's browser LocalStorage — no data leaves your machine.

---

## 🛠️ 3. Technology Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   EventEase AI UI                      │
│     (HTML5 · CSS3 SaaS Tokens · Lucide · Chart.js)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       Local AI Engine        │ │    Smart Planning Engine     │
│   (Ollama · http://localhost)│ │   (Rule-Based JS Fallback)   │
│   qwen2.5:3b · llama3.2:3b   │ │   Deterministic & Instant    │
└───────────────┬──────────────┘ └──────────────┬───────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
┌────────────────────────────────────────────────────────┐
│              Browser LocalStorage Database             │
│    Events · Guests · Vendors · Expenses · Schedules    │
│         100% Private · Zero Cloud Database Req.        │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: Vanilla JavaScript (ES2022+), Semantic HTML5, Modular Architecture.
- **Styling**: Modern CSS3 Custom Properties (Design Tokens), Glassmorphism, CSS Grid & Flexbox, Native Dark/Light Themes.
- **Icons**: Lucide Icons (CDN distribution).
- **Data Visualizations**: Chart.js 4.x (Responsive Canvas Charts).
- **Local AI Inference**: Ollama Local API (`/api/tags`, `/api/chat`).
- **Persistence**: HTML5 Web Storage API (`localStorage`), JSON import/export, CSV parsers.
- **Local Dev Server**: Node.js zero-dependency HTTP server (`server.js`).
- **Production Edge Hosting**: Vercel Static Hosting (`cleanUrls: true`).

---

## 🚦 4. AI Engine & Status Indicators

EventEase AI features a prominent **AI Status Indicator Pill** in the top navigation bar:

| Status Badge | Indicator | Description |
| :--- | :--- | :--- |
| **Local AI Connected** | 🟢 Green | Successfully pinged local Ollama on port `11434` with selected model loaded. |
| **Smart Planning Mode** | 🟡 Yellow | Operating via the built-in JavaScript recommendation engine. Zero setup required, 100% offline. |
| **AI Service Unavailable** | 🔴 Red | Ollama endpoint failed or timed out. Seamlessly falls back to Smart Planning Mode. |

---

## 💻 5. Quick Start & Local Setup

### Option A: Instant Use (No AI Download Required)
EventEase AI works immediately in any modern web browser via **Smart Planning Mode**:
1. Clone the repository:
   ```bash
   git clone https://github.com/GenX0Gravity/EventEase-AI-Smart-Celebration-Planner.git
   cd EventEase-AI-Smart-Celebration-Planner
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

---

### Option B: Enable Free Local AI via Ollama

To enable open-source generative planning:

#### 1. Install Ollama
Download and install Ollama from [ollama.ai](https://ollama.ai).

#### 2. Download a Model
Open your terminal and run:
```bash
# Recommended (Fast, high-fidelity JSON):
ollama run qwen2.5:3b

# Alternative models:
ollama run llama3.2:3b
ollama run gemma3:1b
```

#### 3. Start Ollama with Browser Access (CORS)
Allow your browser to communicate with Ollama:

**Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS = "*"
ollama serve
```

**macOS / Linux:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

*Tip: If Ollama is running in your Windows system tray, right-click and choose **Quit** before running `ollama serve` with the environment variable.*

---

## 📁 6. Project Structure

```
EventEase-AI-Smart-Celebration-Planner/
├── 404.html               # Custom branded 404 error page
├── index.html             # Master single-page SaaS dashboard & navigation
├── package.json           # Scripts (start, dev, test:syntax), version 2.5.0
├── server.js              # Node.js development static HTTP server
├── vercel.json            # Vercel production edge routing configuration
├── README.md              # Comprehensive project documentation
├── css/
│   └── styles.css         # SaaS design tokens, dark mode, responsive styling
└── js/
    ├── analytics.js       # Reports, charts, and downloadable dossier
    ├── api.js             # Unified AI orchestrator (Ollama -> SmartPlanner)
    ├── app.js             # Master controller, routing, theme, timers, modals
    ├── budget.js          # Budget allocation, actual expenses & CSV export
    ├── checklist.js       # Grouped vendor procurement checklist
    ├── copilot.js         # EventEase Copilot interactive chat assistant
    ├── demo-data.js       # Rich seed data for instant one-click demonstration
    ├── event-day.js       # Day-of command center, schedule & speed-dial
    ├── fallback.js        # Rule-based Smart Planning Engine (7 archetypes)
    ├── guests.js          # Guest manager, RSVP tracker, seating table planner
    ├── invitations.js     # Invitation studio, PNG canvas download, text copy
    ├── notifications.js   # Dynamic deadline and budget alerts center
    ├── ollama.js          # Local Ollama client with CORS & model discovery
    ├── planner.js         # AI plan rendering and export
    ├── storage.js         # LocalStorage multi-event database & JSON backup
    ├── theme-generator.js # Creative theme generator & palette swatches
    ├── timeline.js        # Chronological preparation milestone schedule
    └── wizard.js          # 5-step multi-step event creation wizard
```

---

## 🧪 7. Syntax & Quality Verification

Run the automated syntax test across all 17 JavaScript modules:
```bash
npm run test:syntax
```
Output:
```
All 17 JS modules syntax validated successfully!
```

---

## 🌐 8. Production Deployment

The project is pre-configured for instant zero-config deployment on Vercel:

1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Set Framework Preset to **Other** (Pure Static HTML/CSS/JS).
3. Leave Build Command empty.
4. Deploy!

Live Production URL: [https://eventease-ai-seven.vercel.app](https://eventease-ai-seven.vercel.app)

---

## 🔒 9. Security & Privacy Philosophy

- **Zero Private Data Leakage**: All guest names, phone numbers, expenses, and notes reside solely in the user's browser `LocalStorage`.
- **Zero Third-Party Tracking**: No analytics cookies, no tracking pixels, and no mandatory logins.
- **Zero Paid Dependencies**: Operates 100% free with no surprise bills.

---

## 📄 10. License

Released under the open-source **MIT License**. Free for personal celebrations, community festivals, and professional event planners.
