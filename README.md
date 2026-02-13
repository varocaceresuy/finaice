# FinTrack 💰

App web de finanzas personales con tracking de inversiones en tiempo real, control de gastos con categorización, sistema de presupuestos con alertas, y visualizaciones interactivas.

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Charts**: Recharts
- **Market Data**: Yahoo Finance API

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Generar Prisma client
npx prisma generate

# 3. Crear tablas en Supabase
npx prisma db push

# 4. Seed categorías por defecto
npm run db:seed

# 5. Iniciar dev server
npm run dev
```

## Configuración Supabase Auth

1. Ve a Supabase Dashboard → Authentication → Providers → Google
2. Activa Google OAuth
3. Añade Client ID y Secret de Google Cloud Console
4. En Google Cloud Console, añade `http://localhost:3000/auth/callback` como redirect URI

## Variables de Entorno

Copia `.env.local` y completa los valores faltantes:
- `SUPABASE_SERVICE_ROLE_KEY` — desde Supabase Settings → API
- `ENCRYPTION_KEY` — genera con: `openssl rand -hex 32`
- `CRON_SECRET` — genera con: `openssl rand -hex 16`
