# CrowdShield Admin Panel

React 19 + Vite admin dashboard for the CrowdShield crowd-management system.

## Environment

Copy the values from `.env` (already present in this repo). Required vars:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (used for auth) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (used for auth) |
| `VITE_API_URL` | Base URL of the FastAPI Server, e.g. `http://localhost:8000` |

The live dashboard (StatsCards, Alerts, CrowdMap, Alert Center) polls the FastAPI
Server at `VITE_API_URL`. Endpoints used:

- `GET /api/crowd/metrics` — latest crowd metrics (people count, density, avg speed)
- `GET /api/crowd/history?limit=&zone_id=` — crowd history
- `GET /api/risk/events?limit=` — latest risk events

If the API is unreachable the dashboard falls back to its loading/empty states;
no mock data is injected.

## Scripts

- `npm run dev` — start dev server (defaults to port 5173)
- `npm run build` — production build
- `npm run lint` — ESLint

## Layout

- `src/lib/api.js` — API client (fetch-based, no axios)
- `src/lib/useLiveData.js` — polling hook used by the dashboard widgets
- `src/features/admin/` — dashboard components, layout, and pages
- `src/features/auth/` — Supabase login/logout and session guard
- `src/Map/` — three.js 3D venue map
- `src/router/` — route definitions
- `src/store/` — zustand stores (auth, theme, sidebar)
