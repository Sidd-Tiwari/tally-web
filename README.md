# Personal Tracker — Frontend

A React (Vite) frontend for the Personal Tracker microservices backend. Talks to the API Gateway at `http://localhost:8080` — no direct calls to individual services.

## Design concept

The app is built around a single idea: a **tally mark** is the oldest way to count anything, and this app counts two things — money and days. The whole visual identity (aged-paper palette, ledger rules, tabular mono numbers, and the tally-mark streak indicator on the Habits page) grows from that one idea rather than a generic dashboard template.

- **Paper/ledger palette** — warm aged-paper background, ink-toned text, brass as the primary accent, forest-green for credits, rust for debits.
- **Fraunces** (display) + **IBM Plex Sans** (body) + **IBM Plex Mono** (all numbers, tabular).
- **Signature element**: hand-tally-style SVG strokes (groups of 4 verticals + 1 diagonal slash) used to show habit streaks — a real, at-a-glance visual count, not decoration.

## Prerequisites

- Node.js 18+
- The backend running (see the backend's own README) — specifically the **API Gateway on port 8080**.

## Running it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. The dev server proxies `/api/*` requests to `http://localhost:8080` (see `vite.config.js`), so there's no CORS setup needed locally.

## Building for production

```bash
npm run build
```

Outputs static files to `dist/`. Serve these with any static file server (nginx, Vercel, Netlify, etc). Since there's no dev proxy in production, you'll need to either:

1. Put a reverse proxy in front that forwards `/api/*` to your gateway, or
2. Set `VITE_API_BASE` and update `src/api/client.js` to use an absolute URL instead of the relative `/api` path.

## Structure

```
src/
├── api/client.js          # fetch wrapper - attaches JWT, normalizes errors
├── context/AuthContext.jsx # session state (login/register/logout)
├── components/
│   ├── TallyMarks.jsx      # the signature streak visual
│   ├── Sidebar.jsx         # passbook-style nav
│   ├── StatCard.jsx
│   └── ProtectedLayout.jsx # redirects to /login if not authenticated
├── pages/
│   ├── Login.jsx / Register.jsx
│   ├── Dashboard.jsx       # monthly summary + recent activity
│   ├── Ledger.jsx          # expenses/income CRUD + category management
│   ├── Habits.jsx          # habit CRUD + streak tracking
│   └── Tasks.jsx           # task CRUD + checklist
└── styles/
    ├── tokens.css           # design tokens (colors, type, spacing)
    └── global.css           # base styles, shared card/button/form classes
```

## Notes

- Auth token is stored in `localStorage`. Fine for local development; for production consider httpOnly cookies instead to reduce XSS exposure.
- Currency is formatted as INR (`en-IN` locale) — change the locale/currency in `src/utils/format.js` if you need something else.
- No test suite included yet — a good next addition once the UI settles.
