# Hot Wheels Collection

A production-ready Hot Wheels mainline catalog and personal collection tracker.

- **Catalog**: 2,351 castings across 2019–2025 (all 250 collector numbers for every year, including color variants for 2022–2025).
- **Languages**: English and Turkish — switchable from the header, remembered per device.
- **Accounts**: email + password login with "remember me" (90-day session).
- **Your garage**: tick the cars you own, set a condition (Mint → Damaged), add notes, and upload up to 12 photos per car.
- **Image search**: tap the camera button next to the search bar, photograph the card text (camera on mobile, file picker on desktop) and on-device OCR finds the model — no cloud service involved.
- **One host**: the Express backend serves the built React app, so a single port on your VPS runs everything.
- **Mobile**: an installable Android APK (Capacitor WebView) that asks for your server address on first launch and then uses your backend for everything.

## Project layout

```
backend/    Express + SQLite API, serves the frontend build and uploaded photos
frontend/   React + Vite + Tailwind CSS single-page app (+ Capacitor config)
legacy/     Your original static site, kept as a backup
```

This is a single npm project (workspaces) — one `npm install` at the root installs
everything, and one command starts both servers.

## Run locally

```bash
npm install                          # once, from the project root
cp backend/.env.example backend/.env # then set JWT_SECRET (see the comment inside)

npm run dev
```

`npm run dev` starts both:

- **http://localhost:5173** — frontend dev server with hot reload (use this while developing)
- **http://localhost:3000** — the API (the frontend proxies `/api` to it)

For "production mode" locally (exactly what the VPS runs):

```bash
npm run prod       # builds the frontend, then serves everything at http://localhost:3000
```

> Open the app via `localhost`, not `0.0.0.0` — browsers treat `0.0.0.0` as an
> untrustworthy origin and complain in the console.

## Data

The catalog is seeded from `backend/src/seed/cars.json` on first start.
User accounts, ownership and photo records live in `backend/data/hotwheels.db` (SQLite, WAL mode).
Uploaded photos live in `backend/uploads/<userId>/`.
Back up those two folders and you've backed up everything.

## Deployment & Android APK

See [DEPLOYMENT.md](DEPLOYMENT.md) for the step-by-step VPS guide (IP-only access, PM2, port 80)
and for building the Android APK.
