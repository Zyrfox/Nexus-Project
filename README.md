# 🌙 NEXUS Ramadan Engine

> Sistem Transformasi Ramadan — Spiritual, Disiplin, Fisik, Finansial  
> Powered by Gemini AI · Built with Next.js · Hosted on Vercel

## ✨ Features

- 📖 **Quran Burn-down Chart** — Track target vs realita khatam Al-Quran
- 💰 **Equity Curve** — Visualisasi PnL Trading + Target Zakat
- 💀 **Nyelekit Terminal** — AI feedback pedas yang bikin lo tobat (or cry)
- 🛡️ **Leak Firewall** — Deteksi otomatis bocornya disiplin (Games/Movies/Comics)
- 🤖 **AI Audit (Gemini 2.0)** — Personalized feedback yang tau lo males
- 📱 **PWA** — Installable di HP, akses dari mana aja

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, Recharts, Tailwind CSS |
| Backend | Next.js API Routes, Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.0 Flash |
| Deploy | Vercel |

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USER/nexus-ramadan.git
cd nexus-ramadan
npm install
cp .env.example .env  # Fill in your keys
npm run dev
```

## 🔐 Environment Variables

| Key | Description |
|---|---|
| `DATABASE_URL` | Supabase Session Pooler Connection String |
| `GEMINI_API_KEY` | Google AI Studio API Key |

## 📋 Scripts

```bash
# Deploy schema to Supabase
npx tsx scripts/deploy-schema.ts

# Hell Week simulation (3-day dry run)
npx tsx scripts/hell-week-sim.ts

# Reset all data (pre-Ramadan cleanup)
npx tsx scripts/reset-data.ts --force
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/config` | Get active user config |
| PUT | `/api/config` | Update targets |
| POST | `/api/daily-log` | Submit daily metrics + AI audit |
| GET | `/api/dashboard` | Progress summary |
| GET | `/api/dashboard-full` | Full dashboard data (charts + feedbacks) |
| POST | `/api/reset` | Clean slate (requires confirmation header) |

---

*Built for Ramadan 2026. No excuses.*
