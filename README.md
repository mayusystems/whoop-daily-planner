# WHOOP Daily Planner — Totally Spies Gadget Lab
**Jenn's personal daily operating system. Built with React + Vite. Deployed on Vercel.**

---

## What this is

A personal daily dashboard styled as a Totally Spies WHOOP mission briefing. It replaces scattered to-do apps, sticky notes, and mental overhead with one page that shows everything that matters for the day.

**Live URL:** https://whoop-planner-v3.vercel.app
**GitHub:** https://github.com/mayusystems/whoop-daily-planner

---

## What's inside (5 tabs)

| Tab | What it does |
|-----|-------------|
| 📅 Schedule | Time blocks (6am–midnight), morning anchors, today's priority tasks, brain dump, to-do list, mood + points |
| 🎯 Tasks | Pillar task cards by area (HWIT, Mayu Systems, Personal Admin). Hover any task → pin it to today's schedule |
| 📰 News | Mission briefing (today's needle movers), AI/tech news, Hawaii local news, upcoming calendar |
| 🚀 Projects | Side project pipeline cards with health status and progress tracking |
| 🔬 Lab | WHOOP gadget R&D cards (Compowder Compact, Tamagachi Aura) |

---

## How data is saved

Everything you check off, type, or update is auto-saved to your browser's **localStorage** — the storage built into Chrome/Safari on your device. No account, no database, no server.

- Save key: `planner_v3`
- Auto-saves 400ms after any change
- Emergency save on tab close or phone lock
- Manual "💾 Save now" button in the nav bar

**Important:** localStorage is per-browser, per-device. If you open the URL on your phone, it starts fresh. This is a known limitation — cloud sync is a future feature.

---

## How to redeploy after changes

When you or Claude Code makes changes to the code:

```bash
# 1. Navigate to the project folder
cd ~/Desktop/Daily\ Dahboard\ Vercel\ build\ v3/planner-deploy

# 2. Push changes to GitHub
git add .
git commit -m "describe what changed"
git push

# 3. Redeploy to Vercel
vercel --prod --yes
```

If Vercel throws an "Unexpected error" on redeploy (known Vercel bug with the planner-deploy project), use:
```bash
rm -rf .vercel
vercel --prod --yes --name whoop-planner-v3
```

---

## Project history

### Session 1 — April 22–23, 2026 (with Claude Code)
**Starting point:** React component built in Claude.ai artifact sandbox (~717 lines). Worked but had bugs from 10+ rounds of in-place editing.

**Bugs fixed:**
1. `window.storage` (Claude.ai-only API) replaced with `localStorage` — makes persistence work in any browser
2. `useState` for `lastSaved` was declared after an early `return` statement — React requires all hooks to be called before any conditional returns. Moved it up.
3. `async/await` removed from storage functions — once localStorage replaced the async `window.storage` API, the async wrappers became incorrect and were cleaned up

**Infrastructure built:**
- Vite + React 18 project scaffold
- `vercel.json` configured for Vite builds
- PWA manifest (`manifest.json`) — installable to home screen from Chrome
- `.gitignore` for node_modules and dist
- GitHub repo: `mayusystems/whoop-daily-planner` (private)
- Deployed to Vercel: `whoop-planner-v3.vercel.app`

**Content added:**
- HWIT board action items from Apr 23 thread: accounts doc, admin access (Jenn + Tiffany), Zoom vs Google Meet review, Instagram access (remove Maddy, add Tiffany)

**Date fix (Apr 24):** Date was hardcoded to April 22. Changed to `new Date()` so it always shows today.

---

## Folder structure

```
planner-deploy/
├── src/
│   ├── Planner.jsx     ← the entire app (single component file)
│   └── main.jsx        ← React entry point
├── public/
│   └── manifest.json   ← PWA config (installable as app)
├── index.html          ← HTML shell
├── package.json        ← dependencies (React 18, Vite)
├── vite.config.js      ← build config
├── vercel.json         ← Vercel deploy settings
└── README.md           ← this file
```

---

## V4 change requests (logged, not built yet)

These came in Friday Apr 25 and will be reviewed before building:

1. Bake 37 Apple Reminders into proper pillar task cards
2. Add `mouravillon@gmail.com` and `jenniarlet13@gmail.com` calendars
3. Build sunset project schedule for `jenniarlet13@gmail.com`
4. Dependency-aware task sequencing — only show next actionable task per project
5. Limit visible to-dos to one week max, queue the rest
6. Brain dump intelligence — absorb related notes into existing tasks
7. Add encouraging messages + productivity pattern recognition to news ticker
8. Make Vercel deploy ops-solid with localStorage
9. Add `info@mayusystems.tech` calendar
10. Connect Google Calendars (7 total, all listed in CLAUDE-CODE-HANDOFF.md)

---

## Future architecture (Phase 2–3, not building yet)

```
Morning:    Daily Planner Skill → sets the day
               ↓
During day: Meetings captured (Otter AI + Calendar)
               ↓
Each meeting → feeds into Client Intelligence Dashboard
               ↓
End of day: Daily Log-Off Skill → Daily Report
               ↓
End of week: Strategic Capacity Guardian → weekly audit
```
