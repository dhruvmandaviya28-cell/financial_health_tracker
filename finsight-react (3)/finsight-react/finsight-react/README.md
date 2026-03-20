# FinSight AI — React Application

A fully converted, production-grade React + Vite application built from the original single-file HTML/CSS/JS prototype.

---

## 🚀 Quick Start

```bash
npm install
npm run dev        # development server → http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx          # NavLink-based sidebar with React Router
│   │   └── Topbar.jsx           # Top header with user info
│   ├── ui/
│   │   ├── Button.jsx           # Reusable button (variant: primary/secondary/danger)
│   │   ├── Card.jsx             # Card wrapper
│   │   ├── Input.jsx            # Form input + select
│   │   ├── Modal.jsx            # Generic modal overlay
│   │   └── Toast.jsx            # Toast notification container
│   ├── dashboard/
│   │   ├── KPI.jsx              # KPI stat card (gold/green/red/blue/purple)
│   │   ├── TransactionList.jsx  # Reusable transaction rows
│   │   └── BudgetOverview.jsx   # Budget progress bars
│   └── AIChat.jsx               # Floating AI chat (Claude API + local fallback)
│
├── pages/
│   ├── Auth.jsx                 # Login + Signup (tabbed)
│   ├── Dashboard.jsx            # Main overview with KPIs, chart, budgets
│   ├── Transactions.jsx         # Full table with filters + CRUD
│   ├── Budget.jsx               # Category budget planner
│   ├── Debts.jsx                # Debt manager + avalanche/snowball strategy
│   ├── Goals.jsx                # Savings goals with progress + contributions
│   ├── Health.jsx               # Health score ring + breakdown + action plan
│   ├── Insights.jsx             # AI-generated insights (Claude API)
│   ├── Reports.jsx              # Monthly reports + 6-month trend chart
│   └── Profile.jsx              # Profile edit + password + data export
│
├── context/
│   ├── AuthContext.jsx          # user, login(), signup(), logout(), updateUser()
│   └── FinanceContext.jsx       # transactions, budgets, debts, goals + CRUD ops
│
├── hooks/
│   ├── useAuth.js               # Convenience wrapper for AuthContext
│   ├── useFinance.js            # Convenience wrapper for FinanceContext
│   └── useToast.js              # [toasts, showToast] state manager
│
├── utils/
│   └── finance.js               # Helpers: fmt, today, calcHealthScore, generateLocalInsights, constants
│
├── styles/
│   └── global.css               # All CSS design tokens + component styles
│
├── App.jsx                      # BrowserRouter + route declarations + ProtectedLayout
└── main.jsx                     # React root + global CSS import
```

---

## 🏗 Architecture Decisions

### State Management
| What | How |
|------|-----|
| Auth state | `AuthContext` — in-memory `useState`, no session persistence |
| Finance data | `FinanceContext` — persisted to `localStorage` per user ID |
| UI state (modals, filters) | Local `useState` within each page |
| Toast notifications | `useToast` hook — ephemeral, auto-dismisses after 3.5s |

### Routing
- `react-router-dom` v7 with `BrowserRouter`
- `ProtectedLayout` wraps all authenticated routes — redirects to `/login` if no user
- `FinanceProvider` is intentionally scoped *inside* `ProtectedLayout` so it only loads when a user is authenticated

### Authentication
- **No session persistence** — refreshing the page logs the user out (as per spec)
- User accounts are stored in `localStorage` (`fs_users`) so accounts survive refreshes
- Passwords are hashed with a simple non-crypto hash (suitable for demo; replace with bcrypt + backend in production)

### AI Chat
- Calls the Anthropic `/v1/messages` endpoint with the user's real financial data in the system prompt
- Falls back to a local rule-based reply engine if the API is unavailable or no API key is set
- Chat history is maintained in component state (last 10 messages sent per request)

---

## 🔑 Adding Your Claude API Key

The AI Chat and Insights pages call the Anthropic API. To enable them, set your API key in the fetch headers inside:
- `src/components/AIChat.jsx` (line with `headers`)
- `src/pages/Insights.jsx` (line with `headers`)

> ⚠️ **Never expose real API keys in client-side code for production.** Route API calls through a backend proxy.

---

## 🎨 Design System

All CSS variables live in `src/styles/global.css` under `:root`. Key tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--gold` | `#d4af37` | Primary accent |
| `--bg` | `#06080f` | Page background |
| `--bg2` | `#0d1117` | Card/sidebar background |
| `--green` | `#10b981` | Income / positive |
| `--red` | `#ef4444` | Expense / negative |
| `--font-head` | Playfair Display | Headings |
| `--font-body` | DM Sans | Body text |
| `--font-mono` | DM Mono | Numbers / amounts |
