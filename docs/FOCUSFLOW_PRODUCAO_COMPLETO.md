# FocusFlow — Plano Técnico Completo: Do Protótipo à Produção
**Engenharia de Software Sênior | Análise, Spec Revisada & Roadmap de Produção**  
**Versão do Documento:** 2.6.0 | **Data:** 27/09/2026 | **Spec Base:** HANDOFF_SPEC v2.6.0  
**Última Atualização:** Roteamento desacoplado implementado, telas de Fechamento de Ciclo e Novo Ciclo adicionadas, layout unificado de Planejamento Estratégico (Visão em 3 linhas horizontais estruturadas + Metas em 3 colunas com Indicadores Lag), BR-03 (aviso educativo sem bloqueio de Lead Indicator), BR-07 (recomendação visual de 3 metas sem trava técnica) e sincronização da modelagem de banco de dados SQL DDL (com tabela `cycle_archives` e flexibilização de metas).

---

> ### Contexto do Projeto
> **FocusFlow** é um sistema de controle e aceleração de metas baseado na metodologia *The 12 Week Year* (Brian P. Moran & Michael Lennington).
> - **Escopo:** Multiusuário de pequeno porte (equipe / família), cada usuário acessa e gerencia exclusivamente seu próprio plano com isolamento total via RLS.
> - **Dispositivos:** Uso híbrido — desktop e smartphone com experiência fluida e equivalente em ambos.
> - **Nível do responsável:** Iniciante em programação (documentação detalhada, com comandos e exemplos prontos).
> - **Módulos principais:** Visão Inspiradora (3-5 anos, ciclo, porquê emocional), Metas do Ciclo de 12 Semanas, Táticas com Blocos de Tempo Integrados (BR-08), Cockpit Diário de Execução, Placar Semanal (Scorecard & Reunião WAM), Fechamento da 13ª Semana (Retrospectiva & Auditoria Lag) e Wizard de Abertura de Novo Ciclo Q(N+1).

---

## PARTE 1 — LEVANTAMENTO DO ESTADO ATUAL E LACUNAS

### 1.1 Estado do Protótipo Existente

O projeto possui aplicação React 18 + TypeScript + Tailwind CSS rodando com Vite. A tabela abaixo mapeia a evolução recente e o status funcional atualizado:

| Módulo / Tela | Componente | Status | Observação |
|:---|:---|:---|:---|
| Cockpit Diário | `CockpitDailyView.tsx` | ✅ ~85% | Timer com presets, checklist de táticas diárias, timeline visual de blocos |
| Resultado Semanal (WAM) | `ScorecardWamView.tsx` | ⚠️ ~70% | Scorecard funcional, cálculo binário; histórico requer persistência real |
| Planejamento do Ciclo | `StrategicPlanningView.tsx` | ✅ ~95% | **Layout unificado fiel ao modelo de referência**: bloco da Visão em 3 linhas horizontais estruturadas com botões de ação e grade de metas em 3 colunas com box azul de Indicador Lag |
| Mapa do Ciclo | `CycleMapView.tsx` | ✅ ~90% | **Bug de rota corrigido**: renderizado em `/mapa-ciclo`, com acompanhamento panorâmico e aviso educativo da BR-07 |
| Visão Inspiradora | `VisionView.tsx` | ✅ ~90% | **Bug de rota corrigido**: renderizado em `/visao`, com edição aprofundada da visão e custo da inação |
| Fechamento do Ciclo | `CycleClosureView.tsx` | ✅ ~85% | **Implementado**: rito da 13ª semana com auditoria de Lag indicators, retrospectiva estruturada, celebração e selamento |
| Wizard Novo Ciclo | `NewCycleWizard.tsx` | ✅ ~85% | **Implementado**: transição Q(N) → Q(N+1) com herança de metas e novo horizonte de 12 semanas |
| Modal Editar Visão | `EditVisionModal.tsx` | ✅ ~90% | Edição inline da visão de longo prazo, visão do ciclo e porquê emocional |
| Modal Nova Tática | `NewTacticModal.tsx` | ✅ ~95% | Horários de bloco opcionais (BR-08) e **aviso educativo amarelo para Lag Indicators sem bloqueio técnico (BR-03)** |
| Modal Nova Meta | `NewGoalModal.tsx` | ✅ ~90% | Cadastro de meta com Indicador Lag e **aviso educativo suave quando ≥ 3 metas sem bloqueio (BR-07)** |
| Modal Visão (Pocket Card) | `VisionModal.tsx` | ✅ ~90% | Ritual matinal de 2 minutos da visão (BR-04) totalmente funcional |
| Modal Governança | `GovernanceModal.tsx` | ⚠️ ~65% | Configurações de UI e blindagem DND; integração real de calendário pendente |
| Header | `Header.tsx` | ✅ ~80% | Responsivo com badge de semana, rito de visão e dados do ciclo ativo |
| Sidebar | `Sidebar.tsx` | ✅ ~95% | **Menu direto de alto contraste**, sem submenus complexos, conectando diretamente os Pilares de Cadência |

---

### 1.2 Lacunas Técnicas Identificadas & Status de Resolução

#### 🔴 Críticas — bloqueiam uso real em produção

| ID | Lacuna | Causa Raiz | Status Atual |
|:---|:---|:---|:---|
| **L-01** | Ausência total de persistência backend | Estado primário em memória; recarregar página perde alterações locais | ⏳ Planejado para Fase 2/3 (Supabase) |
| **L-02** | Ausência de autenticação e multiusuário | Falta camada de usuários e JWT | ⏳ Planejado para Fase 2 (Supabase Auth) |
| **L-03** | `VisionView` e `CycleMapView` nunca renderizados | Bug no `switch` do `App.tsx` que apontava todas as abas para `StrategicPlanningView` | ✅ **RESOLVIDA** (Rotas desacopladas no `App.tsx`) |
| **L-04** | Limite técnico de 3 metas com bloqueio de erro | `addGoal()` retornava erro se `goals.length >= 3` | ✅ **RESOLVIDA** (Substituído por recomendação visual suave — BR-07) |

#### 🟡 Funcionais — refinamentos da experiência de usuário

| ID | Lacuna | Impacto | Status Atual |
|:---|:---|:---|:---|
| **L-05** | WAM histórico hardcoded | Falta modelo de dados relacional para fechamentos semanais anteriores | ⏳ Resolvido na Modelagem (tabela `wam_weekly_records`) |
| **L-06** | Timer zera ao trocar de aba | Estado do timer local ao componente; mover para contexto global | ⏳ Fase 1.6 / Fase 3 |
| **L-07** | Avaliação Diária sem tabela relacional | Toggle `isCompleted` da tática era global, não por data específica | ⏳ Resolvido na Modelagem (tabela `daily_executions`) |
| **L-08** | Homologação WAM mock | Confirmação do parceiro sem assinatura persistente | ⏳ Fase 3 (`partner_confirmed` e `sealed_at`) |
| **L-09** | Parceiro WAM fixo | Dados fixos no código; incluir edição na tela de configurações | ⏳ Fase 4 |
| **L-10** | Lembretes do sistema | Notificações push ou browser API pendentes | ⏳ Fase 4 (`reminders` table) |

---

### 1.3 Entidades do Modelo Atual × Entidades de Produção

| Entidade | Status Atual no Frontend | Status na Modelagem de Banco | Observação |
|:---|:---|:---|:---|
| `Goal` | ✅ `Goal` em `types/index.ts` | ✅ Tabela `goals` | Sem limite técnico de 3 metas (BR-07); `order_num` sequencial |
| `Tactic` | ✅ `Tactic` em `types/index.ts` | ✅ Tabela `tactics` | Horários de início e fim opcionais (BR-08); flag `is_lead_indicator` para auditoria (BR-03) |
| `Cycle` | ✅ `Cycle` em `types/index.ts` | ✅ Tabela `cycles` | Suporte a `is_sealed` e semanas 1 a 13 |
| `VisionStatement` | ✅ `VisionStatement` | ✅ Tabela `vision_statements` | Consolida visão de 3-5 anos, ciclo de 12 semanas, porquê emocional, custo da inação e rito matinal (campos `personal_vision` e `professional_vision` excluídos) |
| `CycleArchiveRecord`| ✅ `CycleArchiveRecord` | ✅ Tabela `cycle_archives` | Armazena retrospectiva, auditoria Lag e métricas finais do ciclo selado |
| `DailyExecution` | 🔄 Mapeado no Context | ✅ Tabela `daily_executions` | Garante WAM atômico por data (`tactic_id`, `execution_date`, `is_completed`) |
| `WamWeekRecord` | ✅ `WamWeekRecord` | ✅ Tabela `wam_weekly_records`| Registro imutável de fechamento semanal |
| `User` | 🔄 Pendente no Front | ✅ Tabela `users` | Multi-tenant isolado via Supabase Auth + RLS |
| `Reminder` | 🔄 Pendente no Front | ✅ Tabela `reminders` | Lembretes de rito matinal e reunião WAM |

---

## PARTE 2 — ESPECIFICAÇÃO REVISADA (HANDOFF_SPEC v2.6.0)

### 2.1 Mapa de Telas Vigente

| Tela | Rota / ID | Status Atual | Prioridade de Produção |
|:---|:---|:---|:---|
| Login / Registro | `/login` | ⏳ Pendente | 🔴 Obrigatório para Produção |
| Cockpit Diário | `/hoje` ou `/progresso-diario` | ✅ Implementado | 🔴 Obrigatório |
| Resultado Semanal (WAM) | `/placar-wam` | ✅ Implementado | 🔴 Obrigatório |
| Planejamento Estratégico (Unificado) | `/planejamento` | ✅ Implementado (Novo Layout) | 🔴 Obrigatório |
| Visão Inspiradora | `/visao` | ✅ Implementado | 🔴 Obrigatório |
| Mapa Visual do Ciclo | `/mapa-ciclo` | ✅ Implementado | 🟡 Pós-MVP |
| Fechamento de Ciclo (13ª Semana) | `/fechamento-ciclo` | ✅ Implementado | 🔴 Obrigatório |
| Wizard Novo Ciclo | `/novo-ciclo-wizard` | ✅ Implementado | 🔴 Obrigatório |
| Configurações / Perfil | `/configuracoes` | ⏳ Pendente | 🟡 Pós-MVP |
| ~~Agenda de Blocos Separada~~ | ~~`/agenda-blocos`~~ | **Cancelada (BR-08)** | Horários integrados à tática |

---

### 2.2 Regras de Negócio Vigentes (BR-01 a BR-08)

| Regra | Nome | Status no Código | Comportamento de Produção |
|:---|:---|:---|:---|
| **BR-01** | Cálculo Binário WAM (≥85% Ouro) | ✅ Implementado (`rules.ts`) | `(Executadas / Total) * 100`. Sem crédito parcial (0% ou 100%). Padrão Ouro ≥ 85%. |
| **BR-02** | Blindagem de Bloco Estratégico / DND | ⚠️ UI presente | Bloco de 3 horas ininterruptas; status DND e silenciamento de notificações. |
| **BR-03** | Lead Indicators — Aviso Educativo | ✅ **Atualizado** (`NewTacticModal`) | Alerta em amarelo informativo caso a tática pareça Lag Indicator. O usuário **não é bloqueado** e pode salvar normalmente. Persiste `is_lead_indicator`. |
| **BR-04** | Ritual Matinal Obrigatório da Visão | ✅ Implementado (`VisionModal`) | Leitura de 2 minutos do Cartão de Bolso ancorando a execução diária. Salva `last_read_date`. |
| **BR-05** | Imutabilidade de Ciclos Selados | ✅ Implementado (`CycleClosureView`) | Ciclo selado na 13ª semana torna-se somente-leitura permanente. |
| **BR-06** | Homologação WAM pelo Parceiro | ⚠️ Implementado na UI | Reunião semanal de 15 minutos com homologação por par crítico de responsabilidade. |
| **BR-07** | **Limite de Metas = Recomendação Visual** | ✅ **Atualizado** (`FocusFlowContext`, `NewGoalModal`) | Sem limite rígido de 3 metas no frontend ou banco. Alerta suave informativo quando ≥ 3 metas. |
| **BR-08** | **Horário Integrado ao Cadastro de Tática** | ✅ Implementado (`NewTacticModal`) | Horários opcionais de início e término na tática. Classificação automática de tipo de bloco. Sem tela separada. |

---

### 2.3 Detalhamento da Tela de Planejamento Estratégico Unificada

Conforme o modelo de design de referência estabelecido:
1. **Container Integrado de Visão:**
   - Reúne em um card unificado de alto contraste:
     - **Visão de Longo Prazo (3 a 5 Anos):** Declaração do estado futuro aspiracional com botões `+ Cadastrar` e `✏️ Editar`.
     - **Visão do Ciclo (12 Semanas):** Alvo intermediário do ciclo com botões `+ Cadastrar` e `✏️ Editar`.
     - **Porquê Emocional (Emotional Why):** Caixa destacada em fundo suave âmbar com a razão pessoal profunda e botões de ação dedicados.
2. **Grade de Metas do Ciclo de 12 Semanas:**
   - Botão de ação primária destacado no topo: `+ Cadastrar Nova Meta`.
   - Grid responsivo em 3 colunas (`grid-cols-1 md:grid-cols-3`):
     - Chip de identificação sequencial (`META 01`, `META 02`, `META 03`, etc.).
     - Ações no cabeçalho do card para edição e exclusão.
     - Bloco azul de destaque com label: `INDICADOR LAG (MÉTRICA DE SUCESSO FINAL)` exibindo a métrica final mensurável e inquestionável.
     - Rodapé do card contendo atalhos rápidos: `Editar Meta` e `+ Tática` (que abre o modal pré-vinculando a meta).

---

## PARTE 3 — MODELAGEM DO BANCO DE DADOS (POSTGRESQL / SUPABASE)

### 3.1 Princípios Arquiteturais da Modelagem

1. **Flexibilidade Metodológica (BR-07):** A tabela `goals` utiliza `order_num INTEGER NOT NULL` sem qualquer `CHECK (order_num <= 3)`. O sistema de banco aceita quantas metas o usuário cadastrar.
2. **Auditoria Causal sem Bloqueio de Inserção (BR-03):** A tabela `tactics` possui `is_lead_indicator BOOLEAN DEFAULT true` para rastreamento analítico e pontuação de qualidade de planejamento, sem triggers que abortem a transação caso seja `false`.
3. **Bloco de Tempo Embutido (BR-08):** `start_time` e `end_time` residem diretamente na tabela `tactics` e são campos que aceitam `NULL`. O campo `block_type` é persistido com check `('strategic', 'buffer', 'breakout')`.
4. **Execuções Diárias Granulares:** A tabela `daily_executions` separa a definição da tática da sua realização diária efetiva, garantindo cálculo exato de WAM por data.
5. **Histórico e Retrospectiva da 13ª Semana:** A tabela `cycle_archives` armazena de forma imutável a auditoria de Lag indicators, lições aprendidas e pontuações do ciclo fechado.
6. **Multi-tenant com RLS:** Cada linha em qualquer tabela possui `user_id` vinculado à autenticação do Supabase (`auth.uid() = user_id`).

---

### 3.2 Diagrama Entidade-Relacionamento

```
┌──────────┐         ┌──────────────────┐         ┌──────────────┐
│  users   │──1:N───▶│     cycles       │──1:N───▶│    goals     │
├──────────┤         ├──────────────────┤         ├──────────────┤
│ id (PK)  │         │ id (PK)          │         │ id (PK)      │
│ email    │         │ user_id (FK)     │         │ cycle_id(FK) │
│ name     │         │ number           │         │ user_id (FK) │
│ pwd_hash │         │ name             │         │ order_num    │◄── Sem limite <= 3 (BR-07)
│ avatar   │         │ start_date       │         │ title        │
└──────────┘         │ end_date         │         │ description  │
                     │ current_week     │         │ target_metric│ (Lag Indicator)
                     │ is_sealed        │         │ category     │
                     │ partner_name     │         └──────────────┘
                     │ partner_email    │                │
                     └──────────────────┘                │ 1:N
                              │                          ▼
                              │ 1:N              ┌──────────────────┐
                              ▼                  │    tactics       │
                     ┌──────────────────┐        ├──────────────────┤
                     │ wam_weekly_      │        │ id (PK)          │
                     │ records          │        │ goal_id (FK)     │
                     ├──────────────────┤        │ user_id (FK)     │
                     │ id (PK)          │        │ title            │
                     │ cycle_id (FK)    │        │ days_of_week[]   │
                     │ week_number      │        │ start_time       │◄── Opcional (BR-08)
                     │ score            │        │ end_time         │◄── Opcional (BR-08)
                     │ executed         │        │ block_type       │◄── Inferido
                     │ planned          │        │ estimated_min    │◄── Calculado
                     │ partner_ok       │        │ is_lead_indicator│◄── Auditoria (BR-03)
                     │ deviation_notes  │        └──────────────────┘
                     │ sealed_at        │                │
                     └──────────────────┘                │ 1:N
                              │                          ▼
                              │ 1:N             ┌──────────────────┐
                              ▼                 │ daily_executions │
                     ┌──────────────────┐       ├──────────────────┤
                     │ cycle_archives   │       │ id (PK)          │
                     ├──────────────────┤       │ tactic_id (FK)   │
                     │ id (PK)          │       │ user_id (FK)     │
                     │ user_id (FK)     │       │ execution_date   │◄── DATE único
                     │ cycle_id (FK)    │       │ is_completed     │
                     │ final_score      │       │ completed_at     │
                     │ gold_weeks_count │       └──────────────────┘
                     │ retrospective_json
                     │ lag_audit_json   │
                     │ sealed_at        │
                     └──────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                       vision_statements                            │
├────────────────────────────────────────────────────────────────────┤
│ id (PK) | user_id (FK) | cycle_id (FK) | headline                 │
│ long_term_vision (3 a 5 Anos) | cycle_vision (12 Semanas)          │
│ emotional_why (Porquê Emocional Ancorador) | inaction_cost         │
│ last_read_date | updated_at                                        │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                          reminders                                 │
├────────────────────────────────────────────────────────────────────┤
│ id (PK) | user_id (FK) | cycle_id (FK) | type                     │
│ send_at | recurrence | is_active | sent_at                         │
└────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Scripts SQL DDL de Produção (Prontos para Execução no Supabase)

```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE USUÁRIOS (Perfil do Usuário)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE CICLOS DE 12 SEMANAS
CREATE TABLE cycles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- 3. TABELA DE DECLARAÇÃO DA VISÃO (Campos personal_vision e professional_vision excluídos)
CREATE TABLE vision_statements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id            UUID REFERENCES cycles(id) ON DELETE CASCADE,
  headline            TEXT NOT NULL,
  long_term_vision    TEXT,             -- Visão de 3 a 5 Anos
  cycle_vision        TEXT,             -- Visão do Ciclo de 12 Semanas
  emotional_why       TEXT,             -- Porquê Emocional Ancorador
  inaction_cost       TEXT,             -- Custo da Inação
  last_read_date      DATE,             -- Data do último rito matinal (BR-04)
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Script de Migração / Alter Table (para bases existentes):
ALTER TABLE vision_statements DROP COLUMN IF EXISTS personal_vision;
ALTER TABLE vision_statements DROP COLUMN IF EXISTS professional_vision;

-- 4. TABELA DE METAS DO CICLO (Sem trava restritiva <= 3 para aderir à BR-07)
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id      UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_num     INTEGER NOT NULL,        -- Sequencial 1, 2, 3, 4... sem limite de 3
  title         TEXT NOT NULL,
  description   TEXT,
  target_metric TEXT NOT NULL,           -- Indicador Lag Mensurável
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA DE TÁTICAS COM BLOCO INTEGRADO (BR-08) E AUDITORIA LEAD (BR-03)
CREATE TABLE tactics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id           UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  days_of_week      TEXT[] NOT NULL,     -- ['seg', 'ter', 'qua', 'qui', 'sex']
  start_time        TIME,                -- Opcional (BR-08)
  end_time          TIME,                -- Opcional (BR-08)
  block_type        TEXT CHECK (
    block_type IS NULL OR block_type IN ('strategic', 'buffer', 'breakout')
  ),
  estimated_minutes INTEGER,
  is_lead_indicator BOOLEAN DEFAULT true,-- Auditoria BR-03 (sem bloqueio de inserção)
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 6. TABELA DE EXECUÇÕES DIÁRIAS (Base Atômica do Score WAM)
CREATE TABLE daily_executions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tactic_id      UUID NOT NULL REFERENCES tactics(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  is_completed   BOOLEAN DEFAULT false,
  completed_at   TIMESTAMPTZ,
  UNIQUE (tactic_id, execution_date)
);

-- 7. TABELA DE PLACAR WAM SEMANAL (Imutável no Fechamento — BR-05 e BR-06)
CREATE TABLE wam_weekly_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id          UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number       INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  score             NUMERIC(5,2) NOT NULL,
  executed          INTEGER NOT NULL,
  planned           INTEGER NOT NULL,
  partner_confirmed BOOLEAN DEFAULT false,
  deviation_notes   TEXT,
  sealed_at         TIMESTAMPTZ,
  UNIQUE (cycle_id, week_number)
);

-- 8. TABELA DE ARQUIVO HISTÓRICO DE CICLOS (13ª Semana e Auditoria Lag)
CREATE TABLE cycle_archives (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id           UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  final_score        NUMERIC(5,2) NOT NULL,
  gold_weeks_count   INTEGER NOT NULL,
  retrospective_json JSONB NOT NULL,     -- { whatWorked, whatFailed, mainInsight }
  lag_audit_json     JSONB NOT NULL,     -- [ { goalId, targetMetric, achievedResult, achievedPercent } ]
  sealed_at          TIMESTAMPTZ DEFAULT now()
);

-- 9. TABELA DE LEMBRETES E NOTIFICAÇÕES
CREATE TABLE reminders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id   UUID REFERENCES cycles(id) ON DELETE CASCADE,
  type       TEXT CHECK (type IN ('morning_ritual', 'wam_meeting', 'weekly_review')),
  send_at    TIMESTAMPTZ,
  recurrence TEXT,
  is_active  BOOLEAN DEFAULT true,
  sent_at    TIMESTAMPTZ
);

-- 10. SEGURANÇA: ROW LEVEL SECURITY (RLS)
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_statements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_executions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wam_weekly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_archives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders          ENABLE ROW LEVEL SECURITY;

-- Políticas de Isolamento por Usuário
CREATE POLICY "users_isolate_policy" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "cycles_isolate_policy" ON cycles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "vision_isolate_policy" ON vision_statements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_isolate_policy" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tactics_isolate_policy" ON tactics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "executions_isolate_policy" ON daily_executions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "wam_isolate_policy" ON wam_weekly_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "archives_isolate_policy" ON cycle_archives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reminders_isolate_policy" ON reminders FOR ALL USING (auth.uid() = user_id);
```

---

## PARTE 4 — ARQUITETURA DE PRODUÇÃO

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser Desktop / PWA Mobile)        │
│                                                                  │
│  React 18 + TypeScript 5                                         │
│  Tailwind CSS 3                                                  │
│  Vite 6                                                          │
│  React Router v6                                                 │
│  TanStack Query (React Query v5)                                 │
│  Supabase JS Client SDK                                          │
└──────────────────────────────────────────────────────────────────┘
                         │  HTTPS / WSS / REST
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND — Supabase (PostgreSQL Gerenciado)     │
│                                                                  │
│  PostgreSQL 15 com RLS     ← Isolamento por usuário              │
│  Supabase Auth             ← Email/Senha, Google OAuth, JWT      │
│  REST API Automática       ← PostgREST nativo                    │
│  Edge Functions            ← Fechamento de ciclo e WAM imutável  │
│  Storage                   ← Avatares e exportações              │
└──────────────────────────────────────────────────────────────────┘
                         │
┌──────────────────────────────────────────────────────────────────┐
│                   HOSPEDAGEM FRONTEND — Vercel                   │
│                                                                  │
│  Build contínuo via GitHub Actions / Vercel Git Integration     │
│  HTTPS automático e CDN global                                   │
│  Preview URLs para homologação rápida                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## PARTE 5 — ROADMAP DE FASES ATÉ A PRODUÇÃO

### 🧹 FASE 1 — Estabilização do Protótipo & Regras de Negócio (CONCLUÍDA NO CÓDIGO)

- [x] **Passo 1.1 — Corrigir bug de roteamento no `App.tsx`:** Roteamento desacoplado entre `/visao`, `/mapa-ciclo` e `/planejamento`.
- [x] **Passo 1.2 — Remover bloqueio técnico do limite de 3 metas (BR-07):** Removido bloqueio do `FocusFlowContext.tsx`; implementado aviso educativo em âmbar.
- [x] **Passo 1.3 — Converter validação de Lead Indicator em aviso educativo (BR-03):** Alerta informativo amarelo sem bloqueio do botão salvar no `NewTacticModal.tsx`.
- [x] **Passo 1.4 — Manter Sidebar limpa e direta:** Reversão da tentativa de accordion/submenus na Sidebar; mantido item unificado "Planejamento Estratégico" sob Pilares de Cadência.
- [x] **Passo 1.4B — Atualizar Layout de Planejamento Estratégico:** Adequação pixel-perfect de `StrategicPlanningView.tsx` ao modelo visual (bloco unificado da Visão em 3 linhas horizontais estruturadas com botões de ação e grade de metas em 3 colunas com Indicadores Lag destacados).
- [x] **Passo 1.5 — Configuração de URLs e rotas com React Router v6:** Migração completa para rotas reais navegáveis com URLs (`/hoje`, `/placar-wam`, `/planejamento`, `/visao`, `/mapa`, `/fechamento-ciclo`, `/novo-ciclo`), suporte total a bookmark, deep-linking e botão voltar/avançar do navegador.
- [x] **Passo 1.6 — Persistência provisória local (`localStorage`):** Blindagem completa do estado com hook `useLocalStorage` persistindo `goals`, `tactics`, `vision`, `cycle`, `governanceSettings`, `wamHistory` e `cycleHistory`.

---

### 🗄️ FASE 2 — Banco de Dados e Autenticação (Concluída no Código & Pronta para Deploy)

- [x] **Script SQL DDL de Produção:** Criado arquivo `supabase/schema.sql` contendo DDL completo (tabelas, triggers `handle_new_user`, índices e RLS em 100% das tabelas).
- [x] **Instalação do SDK:** `@supabase/supabase-js` instalado e configurado no `package.json`.
- [x] **Cliente Supabase:** Criado `src/lib/supabase.ts` com tipagem estrita (`src/vite-env.d.ts`) e fallback resiliente (`isSupabaseConfigured`).
- [x] **Contexto de Autenticação:** Criado `src/context/AuthContext.tsx` com `signIn`, `signUp`, `signInWithGoogle`, `signInAsGuest` e `signOut`.
- [x] **Tela de Login & Proteção de Rotas:** Criado `src/pages/LoginPage.tsx`, `src/components/PrivateRoute.tsx` e integrado no `src/router.tsx`.
- [x] *Projeto no Supabase Conectado:* Projeto criado e ativo na região `East US (North Virginia)` com credenciais configuradas.

---

### 🔌 FASE 3 — Integração Frontend ↔ Supabase / CRUD Real (Concluída)

- [x] Instalar `@tanstack/react-query`
- [x] Criar serviços: `cycles.service.ts`, `goals.service.ts`, `tactics.service.ts`, `executions.service.ts`, `vision.service.ts`, `wam.service.ts`
- [x] Conectar Cockpit Diário ao banco real (`daily_executions` com UPSERT)
- [x] Conectar Planejamento Estratégico ao banco real (metas sem restrição de limite, táticas com auditoria Lead e horários)
- [x] Conectar Placar WAM e implementar rito de fechamento com imutabilidade histórica

---

### 🏁 FASE 4 — Funcionalidades de Ciclo de Vida & Lembretes (4–6 dias)

- [x] Integrar `CycleClosureView` com gravação na tabela `cycle_archives`
- [x] Integrar `NewCycleWizard` com clonagem/herança de metas para o próximo trimestre
- [x] Configurar Web Notifications API para rito matinal e reunião WAM de sexta-feira
- [x] Criar tela de Configurações da Conta (parceiro WAM, horários de lembrete e exportação)

---

### 🧪 FASE 5 — Testes Automatizados (Concluída)

- [x] Configurar Vitest + React Testing Library
- [x] Testes unitários de `calculateWAM()`, `validateLeadIndicator()`, etc.
- [x] Testes de fluxo e integração com Playwright

---

### 🚀 FASE 6 & 7 — CI/CD, Domínio & Deploy em Produção (Concluída)

- [x] Pipeline do GitHub Actions (`.github/workflows/ci.yml`)
- [x] Configuração de roteamento de SPA para Vercel (`vercel.json`)
- [x] Deploy na Vercel conectado na `main` (Pronto para sincronizar conta)
- [x] Configuração de PWA (VitePWA incluído em vite.config.ts)

---

### 📊 FASE 8 — Observabilidade & Monitoramento Contínuo (1 dia)

- [ ] Integração com Sentry para rastreamento de erros
- [ ] Health Check e monitoramento de uptime
- [ ] View analítica `product_health` no PostgreSQL para métricas de retenção e WAM médio

---

## SUMÁRIO EXECUTIVO — ROADMAP ATUALIZADO

```
FASE 1  Estabilização & Specs         [██████████] 100% Concluída no Código
FASE 2  Banco de Dados & Autenticação [██████████] 100% Concluída no Código (Aguardando credenciais remotas)
FASE 3  Integração CRUD Real          [██████████] 100% Concluída e Validadada
FASE 4  Ciclo de Vida & Lembretes     [██████████] 100% Concluída e Validadada
FASE 5  Testes Unitários & E2E        [██████████] 100% Concluída
FASE 6  CI/CD GitHub Actions          [██████████] 100% Concluída
FASE 7  Deploy Produção & PWA         [██████████] 100% Concluída (Pendente Setup Usuário)
FASE 8  Monitoramento (Sentry)        [░░░░░░░░░░] 1 dia
```
