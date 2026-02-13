-- =============================================
-- FinTrack — Schema SQL para Supabase
-- Pega esto en: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================

-- Enums
DO $$ BEGIN
  CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BudgetPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "InvestmentType" AS ENUM ('ETF', 'FUND', 'STOCK', 'CRYPTO', 'BOND', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "avatar_url" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- =============================================
-- CATEGORÍAS
-- =============================================
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT,
  "name" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");

ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- TRANSACCIONES
-- =============================================
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "description" TEXT NOT NULL,
  "notes" TEXT,
  "date" DATE NOT NULL,
  "category_id" TEXT NOT NULL,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "transactions_user_id_date_idx" ON "transactions"("user_id", "date");
CREATE INDEX IF NOT EXISTS "transactions_user_id_category_id_idx" ON "transactions"("user_id", "category_id");

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- PRESUPUESTOS
-- =============================================
CREATE TABLE IF NOT EXISTS "budgets" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "period" "BudgetPeriod" NOT NULL,
  "start_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_user_id_category_id_period_key" ON "budgets"("user_id", "category_id", "period");

ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- ALERTAS
-- =============================================
CREATE TABLE IF NOT EXISTS "alerts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "budget_id" TEXT NOT NULL,
  "threshold" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "triggered_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_budget_id_fkey"
  FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- INVERSIONES
-- =============================================
CREATE TABLE IF NOT EXISTS "investments" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ticker" TEXT NOT NULL,
  "type" "InvestmentType" NOT NULL,
  "units" DECIMAL(12,6) NOT NULL,
  "avg_buy_price" DECIMAL(12,4) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "current_price" DECIMAL(12,4),
  "last_updated" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "investments_user_id_idx" ON "investments"("user_id");

ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- HISTORIAL DE PRECIOS
-- =============================================
CREATE TABLE IF NOT EXISTS "price_history" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "investment_id" TEXT NOT NULL,
  "price" DECIMAL(12,4) NOT NULL,
  "date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "price_history_investment_id_date_key" ON "price_history"("investment_id", "date");
CREATE INDEX IF NOT EXISTS "price_history_investment_id_date_idx" ON "price_history"("investment_id", "date");

ALTER TABLE "price_history" ADD CONSTRAINT "price_history_investment_id_fkey"
  FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- PREFERENCIAS DE GRÁFICOS
-- =============================================
CREATE TABLE IF NOT EXISTS "chart_preferences" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "user_id" TEXT NOT NULL,
  "chart_key" TEXT NOT NULL,
  "chart_type" TEXT NOT NULL,
  "config" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chart_preferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "chart_preferences_user_id_chart_key_key" ON "chart_preferences"("user_id", "chart_key");

ALTER TABLE "chart_preferences" ADD CONSTRAINT "chart_preferences_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- SEED: Categorías por defecto
-- =============================================
INSERT INTO "categories" ("name", "icon", "color", "type", "is_default") VALUES
  -- Gastos
  ('Vivienda', '🏠', '#6366F1', 'EXPENSE', true),
  ('Alimentación', '🛒', '#22C55E', 'EXPENSE', true),
  ('Transporte', '🚗', '#3B82F6', 'EXPENSE', true),
  ('Salud', '💊', '#EF4444', 'EXPENSE', true),
  ('Entretenimiento', '🎬', '#A855F7', 'EXPENSE', true),
  ('Ropa', '👕', '#EC4899', 'EXPENSE', true),
  ('Educación', '📚', '#14B8A6', 'EXPENSE', true),
  ('Restaurantes', '🍽️', '#F97316', 'EXPENSE', true),
  ('Suscripciones', '📱', '#8B5CF6', 'EXPENSE', true),
  ('Seguros', '🛡️', '#64748B', 'EXPENSE', true),
  ('Impuestos', '📋', '#DC2626', 'EXPENSE', true),
  ('Regalos', '🎁', '#F43F5E', 'EXPENSE', true),
  ('Mascotas', '🐾', '#84CC16', 'EXPENSE', true),
  ('Otros gastos', '📦', '#94A3B8', 'EXPENSE', true),
  -- Ingresos
  ('Nómina', '💰', '#22C55E', 'INCOME', true),
  ('Freelance', '💻', '#3B82F6', 'INCOME', true),
  ('Inversiones', '📈', '#6366F1', 'INCOME', true),
  ('Alquiler', '🏘️', '#F97316', 'INCOME', true),
  ('Otros ingresos', '💵', '#14B8A6', 'INCOME', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- ✅ ¡Listo! Todas las tablas y categorías creadas.
-- =============================================
