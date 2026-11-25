# PrintEase Admin Dashboard (UI Only)

A modern SaaS-style admin dashboard UI for **PrintEase – Self-Service Print System**, built with React + Material UI (MUI v5).

This is a **UI-only** project: there is no backend, no API calls, no authentication, and no database. All data shown (revenue, jobs, printers, students, transactions) is static mock data in `src/data/mockData.js`, ready to be swapped for real data when a backend is added.

## Tech stack

- React 18 (functional components + hooks only)
- Material UI v5 (`@mui/material`, `@mui/icons-material`)
- MUI X Charts (`@mui/x-charts`) for the revenue bar chart
- Vite (dev server / build tool)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

## Folder structure

```
src/
  components/
    layout/
      Layout.jsx      # Shared shell: sidebar + top bar + content area
      Sidebar.jsx      # Fixed left navigation
      TopBar.jsx       # Search, notifications, admin profile
    common/
      StatCard.jsx     # KPI stat card (Dashboard)
      StatusChip.jsx   # Color-coded status chip (Pending/Printing/etc.)
      SectionCard.jsx  # Reusable card shell with title + action slot
      DataTable.jsx    # Reusable table renderer
  data/
    mockData.js        # All static mock data used across pages
  pages/
    Dashboard.jsx
    Pricing.jsx
    Transactions.jsx
    Printers.jsx
    Users.jsx
    Reports.jsx
  theme/
    theme.js            # Indigo (#283593) MUI theme + design tokens
  App.jsx                # Simple state-based page switcher (no router)
  main.jsx                # React entry point
```

## Design notes

- **Primary color:** Indigo `#283593` (matches the PrintEase Flutter student app)
- **Background:** Light grey `#F5F7FB`
- **Cards:** White, 16px rounded corners, soft shadows
- **Status colors:** Pending → orange, Printing → blue, Completed → green, Failed → red

## Navigation

Page switching is handled with plain React state in `App.jsx` (no `react-router`), matching the "UI only, no routing logic" requirement. Swap this for a router of your choice once wiring up real navigation/auth.

## Next steps (not included by design)

- Connect to a real backend / API for live data
- Add authentication and role-based access
- Wire up the Edit / Save / Pause / Resume / Export actions to real handlers
