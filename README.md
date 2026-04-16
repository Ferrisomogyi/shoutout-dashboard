# Shoutout Creator Dashboard

Real-time outreach tracking dashboard voor de shoutout.vip creator campagne.

## Features
- Live stats vanuit Instantly.ai via Cloudflare Worker proxy
- Per-creator emailadres + verzendaccount tracking
- Multi-step email sequence monitoring
- Follow-up triggers vanuit de app
- PWA — installeerbaar op mobiel via Chrome

## Setup

### 1. Deploy de Cloudflare Worker (API proxy)
```bash
cd shoutout-dashboard
npx wrangler deploy
npx wrangler secret put INSTANTLY_API_KEY
# Plak je Instantly API key wanneer gevraagd
```

### 2. GitHub Pages
Push dit naar een GitHub repo en zet Pages aan op de `main` branch.
De `index.html` is de volledige app.

### 3. Configureer de app
Open het dashboard > Instellingen > vul je Worker URL in > Opslaan & Verbinden.

## Tech stack
- React 18 (via CDN, geen build stap)
- Cloudflare Workers (API proxy)
- Instantly.ai API v1
- Single HTML file PWA
