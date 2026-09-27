-- ==============================================================================
-- FocusFlow Velocity Engine — Script SQL DDL de Produção (Supabase / PostgreSQL)
-- Versão: 2.6.0 | Baseado na Metodologia The 12 Week Year
-- ==============================================================================

-- 0. Extensões essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABELA DE PERFIS DE USUÁRIOS (Sincronizada com auth.users do Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. TABELA DE CICLOS DE 12 SEMANAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cycles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number        INTEGER NOT NULL,
  name          TEXT NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  current_week  INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 13),
  is_sealed     BOOLEAN DEFAULT false,
  partner_name  TEXT,
  partner_email TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. TABELA DE DECLARAÇÃO DA VISÃO (Visão 3-5 Anos, Ciclo 12 Semanas e Porquê Emocional)
-- Nota: campos personal_vision e professional_vision foram excluídos a pedido do usuário
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vision_statements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id            UUID REFERENCES public.cycles(id) ON DELETE CASCADE,
  headline            TEXT NOT NULL,
  long_term_vision    TEXT,             -- Visão de 3 a 5 Anos
  cycle_vision        TEXT,             -- Visão do Ciclo de 12 Semanas
  emotional_why       TEXT,             -- Porquê Emocional Ancorador
  inaction_cost       TEXT,             -- Custo da Inação
  last_read_date      DATE,             -- Data do ritual matinal (BR-04)
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. TABELA DE METAS DO CICLO (Sem limite técnico <= 3 — BR-07)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id      UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_num     INTEGER NOT NULL,        -- Sequencial 1, 2, 3, 4... sem teto de 3
  title         TEXT NOT NULL,
  description   TEXT,
  target_metric TEXT NOT NULL,           -- Indicador Lag mensurável de sucesso
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. TABELA DE TÁTICAS COM BLOCO INTEGRADO (BR-08) E AUDITORIA LEAD (BR-03)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tactics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id           UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  days_of_week      TEXT[] NOT NULL,     -- ['seg', 'ter', 'qua', 'qui', 'sex']
  start_time        TIME,                -- Opcional (BR-08)
  end_time          TIME,                -- Opcional (BR-08)
  block_type        TEXT CHECK (
    block_type IS NULL OR block_type IN ('strategic', 'buffer', 'breakout')
  ),
  estimated_minutes INTEGER,
  is_lead_indicator BOOLEAN DEFAULT true,-- Auditoria BR-03 (sem bloqueio)
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. TABELA DE EXECUÇÕES DIÁRIAS (Base Atômica do Score WAM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_executions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tactic_id      UUID NOT NULL REFERENCES public.tactics(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  is_completed   BOOLEAN DEFAULT false,
  completed_at   TIMESTAMPTZ,
  UNIQUE (tactic_id, execution_date)
);

-- ==============================================================================
-- 7. TABELA DE PLACAR WAM SEMANAL (Imutável no Fechamento — BR-05 e BR-06)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wam_weekly_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id          UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number       INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  score             NUMERIC(5,2) NOT NULL,
  executed          INTEGER NOT NULL,
  planned           INTEGER NOT NULL,
  partner_confirmed BOOLEAN DEFAULT false,
  deviation_notes   TEXT,
  sealed_at         TIMESTAMPTZ,
  UNIQUE (cycle_id, week_number)
);

-- ==============================================================================
-- 8. TABELA DE ARQUIVO HISTÓRICO DE CICLOS (13ª Semana e Auditoria Lag)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cycle_archives (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id           UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  final_score        NUMERIC(5,2) NOT NULL,
  gold_weeks_count   INTEGER NOT NULL,
  retrospective_json JSONB NOT NULL,     -- { whatWorked, whatFailed, mainInsight }
  lag_audit_json     JSONB NOT NULL,     -- [ { goalId, targetMetric, achievedResult, achievedPercent } ]
  sealed_at          TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. TABELA DE LEMBRETES E NOTIFICAÇÕES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id   UUID REFERENCES public.cycles(id) ON DELETE CASCADE,
  type       TEXT CHECK (type IN ('morning_ritual', 'wam_meeting', 'weekly_review')),
  send_at    TIMESTAMPTZ,
  recurrence TEXT,
  is_active  BOOLEAN DEFAULT true,
  sent_at    TIMESTAMPTZ
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) — ISOLAMENTO TOTAL MULTI-TENANT
-- ==============================================================================
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_statements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_executions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wam_weekly_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_archives      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders           ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso seguro (apenas o próprio usuário autenticado pode ler/escrever)
CREATE POLICY "profiles_isolation" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "cycles_isolation" ON public.cycles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "vision_isolation" ON public.vision_statements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_isolation" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tactics_isolation" ON public.tactics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "executions_isolation" ON public.daily_executions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "wam_isolation" ON public.wam_weekly_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "archives_isolation" ON public.cycle_archives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reminders_isolation" ON public.reminders FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 11. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE AO CADASTRAR USUÁRIO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
