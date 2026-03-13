# 📈 ICT Trading Monitor
### Mobile app to monitor and control your ICT CRT EA on MT5

Built with React Native + Expo · Supabase · South Africa (SAST UTC+2)

---

## Architecture

```
📱 Mobile App (React Native)
         ↕ Supabase Realtime (live push)
☁️  Supabase PostgreSQL
         ↕ HTTP REST (WebRequest)
🖥️  MT5 on VPS — ICT_Supabase_Bridge.mq5 (runs every 5s)
         ↕ MQL5 Global Variables
🤖  ICT_CRT_EA.mq5 (the trading robot)
```

---

## What the App Does

| Screen | Features |
|--------|----------|
| 📊 Dashboard | Balance, equity, floating P&L, Asian range, sweep status, session times |
| 📋 Trades | Live open positions with entry price, current price, pips, SL/TP, profit |
| 🎮 Control | Start/Stop EA, Close All Trades, refresh status, account summary |

---

## Session Times (SAST · UTC+2)

| Session | SAST | UTC |
|---------|------|-----|
| Asian Range | 02:00 – 07:00 | 00:00 – 05:00 |
| London Killzone | 09:00 – 12:00 | 07:00 – 10:00 |
| New York Killzone | 14:00 – 17:00 | 12:00 – 15:00 |

🇿🇦 South Africa does **not** use daylight saving — always UTC+2.

---

## Setup

### Step 1 — Supabase
1. Go to [app.supabase.com](https://app.supabase.com) → New Project
2. SQL Editor → paste `supabase/schema.sql` → Run
3. Settings → API → copy **URL** and **anon key** (for mobile app)
4. Settings → API → copy **service_role key** (for MT5 bridge — keep secret!)

### Step 2 — Mobile App
```bash
cd TradingMonitor
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY
npm install
npx expo start --clear
```

### Step 3 — MT5 on VPS
1. Copy `ICT_CRT_EA.mq5` and `ICT_Supabase_Bridge.mq5` to MT5 `MQL5/Experts/`
2. In MT5: **Tools → Options → Expert Advisors**
   - ✅ Allow WebRequest for listed URL
   - Add your Supabase URL: `https://YOUR_PROJECT.supabase.co`
3. Attach `ICT_CRT_EA.mq5` to your M5 chart
4. Attach `ICT_Supabase_Bridge.mq5` to **any chart** (e.g. EURUSD M1)
   - Set `SUPABASE_URL` = your project URL
   - Set `SUPABASE_SERVICE_KEY` = your service role key
5. Enable AutoTrading ✅

---

## How Commands Work

```
Mobile App
  → taps "Stop EA"
  → writes { command: "DISABLE", executed: false } to Supabase

MT5 Bridge (every 5 seconds)
  → polls ea_commands for executed=false
  → finds "DISABLE" command
  → sets GlobalVariable ICT_EA_ENABLED = 0
  → marks command as executed

ICT_CRT_EA
  → checks GlobalVariable ICT_EA_ENABLED on each bar
  → stops opening new trades
  → writes updated status to Supabase

Mobile App
  → receives realtime update
  → shows EA as STOPPED
```

---

## Project Structure

```
TradingMonitor/
├── .env.example              ← Template — fill in and rename to .env
├── app.json                  ← Expo config
├── package.json
├── supabase/
│   └── schema.sql            ← Run once in Supabase SQL Editor
├── lib/
│   └── supabase.ts           ← Supabase client
├── services/
│   ├── eaService.ts          ← Read status, send commands, subscribe
│   └── authService.ts        ← Login/logout
├── types/
│   └── index.ts              ← TypeScript interfaces
├── constants/
│   └── theme.ts              ← Dark theme colors + fonts
└── app/
    ├── _layout.tsx           ← Root layout + auth guard
    ├── (auth)/
    │   └── login.tsx         ← Sign in screen
    └── (tabs)/
        ├── _layout.tsx       ← Tab bar
        ├── dashboard.tsx     ← Main dashboard
        ├── trades.tsx        ← Live trade monitor
        └── control.tsx       ← EA control panel

ICT_CRT_EA/
├── ICT_CRT_EA.mq5            ← Main trading EA (SAST times)
└── ICT_Supabase_Bridge.mq5   ← Supabase sync bridge (attach separately)
```
