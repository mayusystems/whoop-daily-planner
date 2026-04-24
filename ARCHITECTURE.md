# Jenn's Daily Operating System — Architecture Map
*Written April 24, 2026. Based on full audit of existing skills, artifacts, and the Vercel planner.*

---

## What You've Actually Built (Full Inventory)

### Tool 1 — Morning Planner Skill (`daily-planner`)
**Lives in:** Claude.ai (installed skill)
**Trigger phrases:** "open my planner", "what's my day look like", "plan my day", "show me today"
**What it does:** Pulls live Gmail + Google Calendar + web news → generates a fresh React artifact with today's briefing, time blocks, tasks, and mission items
**Stores data in:** `window.storage` (Claude.ai only)
**Problem:** Ephemeral. Every new chat session starts fresh. Nothing persists.

---

### Tool 2 — Log-Off Recap (no skill yet — manual artifact)
**Lives in:** Claude.ai chat (generated artifact, April 22)
**Trigger:** No trigger phrase yet — you run it manually in chat
**What it does:** Shows daily wins by pillar, tomorrow's plan, AI productivity curve, training tracker, run logging CTA
**Desktop + mobile versions exist** at `~/Downloads/log-off-files/`
**Problem:** Hardcoded to April 22. Not a reusable skill. Has to be rebuilt manually each day.

---

### Tool 3 — Strategic Capacity Guardian (`strategic-capacity-guardian`)
**Lives in:** Claude.ai (installed skill)
**Trigger phrases:** "weekly recap", "Friday recap", "capacity check", "audit my week"
**What it does:** Pulls calendar + email → audits hours across 4 pillars (TASI, Mayu, HWIT, Personal) → flags burnout risk → builds Monday look-ahead
**This is weekly, not daily.**

---

### Tool 4 — Vercel Planner (what we just built)
**Lives at:** https://whoop-planner-v3.vercel.app
**GitHub:** mayusystems/whoop-daily-planner
**What it does:** Persistent daily tracker — time blocks, task pillars, brain dump, to-dos, projects, gamification
**Stores data in:** `localStorage` (your browser, this device only)
**Problem:** News, calendar, WHOOP stats are all hardcoded. No live data. Doesn't talk to any external tools.

---

## The Disconnect (Why Nothing Feels Connected)

```
Claude.ai Skill              Vercel Planner
─────────────────            ──────────────
window.storage    ≠          localStorage
ephemeral                    persistent
live data (Gmail/Cal)        hardcoded data
runs in chat                 runs in browser tab
```

They were built with different assumptions and don't share any data.
The skill does the thinking. The planner does the tracking. Neither does both.

---

## Your Actual Daily Flow (as it exists today)

```
MORNING
  └─ Open Claude.ai
  └─ Run /daily-planner skill
  └─ Get fresh artifact with live Gmail + Calendar + news
  └─ Use it as your briefing
  └─ ❌ Nothing saves to Vercel planner
  └─ ❌ Artifact disappears when chat closes

DURING DAY (busy days)
  └─ Open whoop-planner-v3.vercel.app
  └─ Check off tasks, update time blocks, brain dump
  └─ ✅ This saves reliably
  └─ ❌ News/calendar section is stale hardcoded data
  └─ ❌ No connection to what the morning skill surfaced

EVENING
  └─ Manually run a chat prompt to generate log-off recap artifact
  └─ Get desktop + mobile React artifact
  └─ ❌ No skill trigger — you have to rebuild it manually each time
  └─ ❌ Doesn't pull from Vercel planner (no connection)
  └─ ❌ Artifact disappears when chat closes

WEEKLY (Fridays)
  └─ Run /strategic-capacity-guardian
  └─ Pulls calendar + email automatically
  └─ ✅ Works well — this is your most complete skill
```

---

## What the Ideal Flow Looks Like

```
MORNING
  └─ Open whoop-planner-v3.vercel.app (or run /daily-planner)
  └─ See: what's urgent right now (live from Gmail + Calendar)
  └─ Set today's 3 priorities
  └─ Check off morning anchors

DURING DAY
  └─ Stay on whoop-planner-v3.vercel.app
  └─ Track tasks, check off items, brain dump
  └─ On busy days: "what's next?" is always visible

EVENING
  └─ Run /log-off (skill — doesn't exist yet as a proper skill)
  └─ See: what got done, what carries to tomorrow, tomorrow's plan
  └─ Log run / movement for the day
  └─ Close the day intentionally

WEEKLY (Fridays)
  └─ Run /strategic-capacity-guardian (already works ✅)
  └─ Audit the week, set Monday's direction
```

---

## Gap Analysis — What's Missing

| Gap | Impact | Fix |
|-----|--------|-----|
| Log-off has no skill trigger | You have to rebuild it manually every evening | **Build `/log-off` skill** (1 session) |
| Vercel planner has no live data | News/calendar are stale | **Add API routes** (2-3 sessions) OR **accept it as tracking-only** |
| Morning skill data doesn't feed Vercel | Two separate systems | **Bridge via API** (2 sessions) OR **use one tool** |
| Vercel data is browser-only | Can't use on phone | **Cloud sync** (3+ sessions) |

---

## My Recommendation — 3 Phases

### Phase 1 — Do now (1 session)
**Build the `/log-off` skill properly.**
The log-off artifact you have from April 22 is the design spec. Turn it into a real skill that:
- Pulls today's calendar + email automatically
- Generates the recap fresh each evening
- Has a trigger phrase ("log off", "end of day", "recap my day")
This closes the biggest daily gap. Your morning and weekly are already working.

### Phase 2 — Do next (1-2 sessions)
**Accept the split and optimize it.**
Stop trying to make Vercel do what Claude.ai skills do. Instead:
- Vercel planner = **tracker** (tasks, brain dump, projects, points)
- Claude.ai skills = **intelligence layer** (live data, briefings, recaps)
- Use them as a pair, not as one system
This is the lowest-effort path to a functioning daily OS.

### Phase 3 — Future (3+ sessions)
**Wire them together.**
Build a simple API bridge: skills POST data to Vercel, planner reads it.
Only worth doing after Phase 1 + 2 are stable.

---

## File Locations

| Asset | Location |
|-------|----------|
| Vercel planner source | `~/Desktop/Daily Dahboard Vercel build v3/planner-deploy/src/Planner.jsx` |
| Vercel planner live URL | https://whoop-planner-v3.vercel.app |
| GitHub repo | github.com/mayusystems/whoop-daily-planner |
| Morning skill | `~/Library/Application Support/Claude/.../skills/daily-planner/SKILL.md` |
| Weekly skill | `~/Library/Application Support/Claude/.../skills/strategic-capacity-guardian/SKILL.md` |
| Log-off artifacts | `~/Downloads/log-off-files/logoff-desktop.jsx` + `logoff-mobile.jsx` |
| Planner skill (handoff version) | `~/Desktop/Daily Dahboard Vercel build v3/daily-planner-SKILL.md` |
