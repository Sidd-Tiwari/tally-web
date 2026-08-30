# Personal Tracker — Frontend

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

A React (Vite) frontend for the **Tally** personal finance and habit-tracking platform, built on a microservices backend. Communicates exclusively with the API Gateway — never directly with individual backend services.

**Backend repository:** [tally-backend](https://github.com/Sidd-Tiwari/tally-backend)

---

## Design Concept

The app is built around a single idea: a **tally mark** is the oldest way to count anything, and this app counts two things — money and days. The entire visual identity grows from that one idea rather than a generic dashboard template:

- **Paper/ledger palette** — warm aged-paper background, ink-toned text, brass as the primary accent, forest-green for credits, rust for debits
- **Typography** — Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (all numbers, tabular)
- **Signature element** — hand-tally-style SVG strokes (four verticals + one diagonal slash) used to visualize habit streaks — a real, at-a-glance count, not decoration

## Where This Fits

```mermaid
flowchart LR
    subgraph Frontend["tally-web (this repo)"]
        UI["React SPA<br/>:5173 (dev)"]
    end

    subgraph Backend["tally-backend"]
        GW["API Gateway :8080<br/>JWT · CORS · Rate limiting"]
        A["Auth Service"]
        E["Expense Service"]
        H["Habit Service"]
    end

    UI -->|"fetch('/api/...')<br/>Authorization: Bearer token"| GW
    GW --> A
    GW --> E
    GW --> H

    style UI fill:#B9862E,color:#fff
    style GW fill:#3F6E52,color:#fff
```

This app never talks to `auth-service`, `expense-service`, or `habit-service` directly — every request goes through the gateway, which is the only backend URL this codebase ever references (see `vite.config.js` for local dev, or `VITE_API_BASE` for production).

## App Navigation

```mermaid
flowchart TD
    Start(["Visit app"]) --> Check{"Logged in?"}
    Check -->|No| Login["Login page"]
    Check -->|Yes| Dashboard

    Login <-->|"Switch"| Register["Register page"]
    Login -->|"Success"| Dashboard

    Dashboard["Dashboard<br/>Monthly summary + activity"] --> Ledger["Ledger<br/>Expenses, income, categories"]
    Dashboard --> Habits["Habits<br/>Streak tracking"]
    Dashboard --> Tasks["Tasks<br/>Checklist + priorities"]

    Ledger -.->|"Sidebar nav"| Habits
    Habits -.->|"Sidebar nav"| Tasks
    Tasks -.->|"Sidebar nav"| Dashboard

    Dashboard --> Logout(["Log out → back to Login"])

    style Dashboard fill:#B9862E,color:#fff
    style Login fill:#9C4A32,color:#fff
```

Every page except Login/Register is wrapped in `ProtectedLayout`, which redirects to `/login` if there's no valid session — see `src/components/ProtectedLayout.jsx`.

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Login as Login.jsx
    participant Ctx as AuthContext
    participant API as api/client.js
    participant GW as API Gateway

    U->>Login: Submit email + password
    Login->>Ctx: login(email, password)
    Ctx->>API: api.login({email, password})
    API->>GW: POST /api/auth/login
    GW-->>API: 200 {token, userId, name, email}
    API-->>Ctx: response
    Ctx->>Ctx: setSession() → localStorage + state
    Ctx-->>Login: resolved
    Login->>Login: navigate("/")

    Note over API,GW: Every later request attaches<br/>Authorization: Bearer token<br/>automatically via api/client.js
```

Session state lives in `AuthContext` (React Context), backed by `localStorage` so a refresh doesn't log the user out. Every subsequent API call goes through the single `api/client.js` wrapper, which attaches the token and normalizes error responses so pages just `try/catch` and show `err.message`.

## Features

- Secure authentication (JWT-based session handling)
- Monthly financial dashboard — income, expenses, net balance at a glance
- Full ledger — expense/income CRUD with custom categories
- Habit tracking with streak visualization
- Task management with priority levels and due dates
- Responsive layout, built mobile-first

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router |
| Styling | Custom CSS with design tokens (no framework dependency) |
| State | React Context (auth/session) |
| API layer | Fetch-based client with JWT attachment and error normalization |

## Prerequisites

- Node.js 18+
- The backend running locally or deployed — see [tally-backend](https://github.com/Sidd-Tiwari/tally-backend) — specifically the **API Gateway on port 8080**

## Getting Started

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. The dev server proxies `/api/*` requests to `http://localhost:8080` (see `vite.config.js`), so no CORS configuration is needed locally.

## Building for Production

```bash
npm run build
```

Outputs static files to `dist/`. Serve these with any static host (nginx, Vercel, Netlify, etc.). Since there's no dev proxy in production, choose one:

1. Put a reverse proxy in front that forwards `/api/*` to your deployed gateway, or
2. Set an environment variable (e.g. `VITE_API_BASE`) and update `src/api/client.js` to use an absolute URL instead of the relative `/api` path.

## Project Structure

```
src/
├── api/client.js            # Fetch wrapper — attaches JWT, normalizes errors
├── context/AuthContext.jsx  # Session state (login/register/logout)
├── components/
│   ├── TallyMarks.jsx       # The signature streak visual
│   ├── Sidebar.jsx          # Passbook-style navigation
│   ├── StatCard.jsx
│   └── ProtectedLayout.jsx  # Redirects to /login if not authenticated
├── pages/
│   ├── Login.jsx / Register.jsx
│   ├── Dashboard.jsx        # Monthly summary + recent activity
│   ├── Ledger.jsx           # Expenses/income CRUD + category management
│   ├── Habits.jsx           # Habit CRUD + streak tracking
│   └── Tasks.jsx            # Task CRUD + checklist
└── styles/
    ├── tokens.css           # Design tokens (colors, type, spacing)
    └── global.css           # Base styles, shared card/button/form classes
```

## Roadmap

- [ ] Test suite (unit + integration)
- [ ] Spending-by-category visualization on the dashboard
- [ ] Dark mode
- [ ] PWA support for offline access

## Security Notes

- Auth tokens are stored in `localStorage`, which is standard for local development. For production deployments handling sensitive financial data, httpOnly cookies are recommended to reduce XSS exposure.
- Currency is formatted for the `en-IN` locale (INR) — update `src/utils/format.js` for other locales/currencies.

## License

This project is licensed under the MIT License.

---

## Author

**Siddharth Tiwari**

- Portfolio: [siddharth-tiwari.vercel.app](https://siddharth-tiwari.vercel.app/)
- LinkedIn: [in/siddharth-tiwari-394451271](https://www.linkedin.com/in/siddharth-tiwari-394451271/)
- GitHub: [@Sidd-Tiwari](https://github.com/Sidd-Tiwari)
- LeetCode: [Sidd-Tiwari](https://leetcode.com/u/Sidd-Tiwari/)

If you found this project useful or interesting, consider giving it a ⭐ on GitHub.
