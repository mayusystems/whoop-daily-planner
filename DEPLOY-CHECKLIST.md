# 🚀 Planner V3 → Vercel Deploy — Build Session Checklist
## Apr 30, 2026 · 10:00 AM – 12:00 PM HST

### Pre-Session Prep
- [ ] Ensure GitHub access (mayu-context repo or create new repo)
- [ ] Ensure Vercel dashboard access (vercel.com)
- [ ] Have the latest planner-v3.jsx from Claude artifacts

### Session Steps

#### 1. Init & Push to GitHub (15 min)
```bash
# Clone or create repo
git clone https://github.com/YOUR_USERNAME/whoop-planner.git
cd whoop-planner

# Copy deploy package files
# (package.json, vite.config.js, index.html, public/, src/)

# Copy your latest Planner.jsx into src/
cp planner-v3.jsx src/Planner.jsx

# Install deps
npm install

# Test locally
npm run dev
# Visit http://localhost:5173 — verify everything works
```

#### 2. Storage Migration (10 min)
The planner currently uses `window.storage` (claude.ai's built-in storage).
For Vercel, you'll need to swap to one of:
- **localStorage** (simplest, works immediately, single device)
- **Supabase** (free tier, multi-device sync, real database)

For MVP, just find-and-replace `window.storage.get/set` with `localStorage.getItem/setItem` + JSON parse/stringify. We can migrate to Supabase later.

#### 3. Deploy to Vercel (10 min)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No → create new
# - Project name: whoop-planner
# - Framework: Vite
# - Build command: npm run build
# - Output dir: dist

# Deploy to production
vercel --prod
```

#### 4. Custom Domain (optional, 5 min)
```bash
# If you want planner.mayusystems.com
vercel domains add planner.mayusystems.com
# Then add the DNS records Vercel gives you
```

#### 5. PWA Install (5 min)
1. Open your Vercel URL in Chrome
2. Three-dot menu → "Save and Share" → "Install page as app"
3. It gets its own dock icon + window
4. On iPad: Share → Add to Home Screen

#### 6. Nightly Cron (15 min)
The `vercel.json` already has a cron configured for midnight HST (`0 10 * * *` UTC).
Create the API route:

```bash
mkdir -p api
```

Create `api/nightly-refresh.js`:
```javascript
// This runs at midnight HST via Vercel Cron
// It can ping the Anthropic API to pre-cache email summaries,
// calendar events, and news for the next morning
export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // TODO: Call Gmail API, Calendar API, news sources
  // Cache results to Supabase/KV store
  // So when planner loads in the morning, data is instant
  
  res.status(200).json({ status: 'refreshed', timestamp: new Date().toISOString() });
}
```

#### 7. Generate App Icons (5 min)
You need icon-192.png and icon-512.png for the PWA manifest.
Ask Claude to generate SVG icons or use a tool like realfavicongenerator.net.

### Post-Session
- [ ] Verify PWA installs on desktop
- [ ] Verify PWA installs on iPad
- [ ] Test data persistence across refreshes
- [ ] Bookmark Vercel dashboard for monitoring
- [ ] Share URL with partner for Paca Paca collab (optional)

### Future Enhancements (Post-Deploy)
- [ ] Supabase for multi-device sync
- [ ] Google Calendar API (server-side, real-time)
- [ ] Gmail API (server-side, nightly scan)
- [ ] Push notifications for daily morning reminder
- [ ] WHOOP API integration for real biometric data
