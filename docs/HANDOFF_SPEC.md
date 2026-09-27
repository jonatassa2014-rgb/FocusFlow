# FocusFlow — Especificação Técnica de Hand-off & Arquitetura do Sistema
**Sistema:** FocusFlow (The 12 Week Year Execution Engine)  
**Versão:** 2.6.0 (Spec de Engenharia Frontend, Backend & Banco de Dados Atualizada)  
**Metodologia Base:** The 12 Week Year (Brian P. Moran & Michael Lennington)  
**Última Revisão:** 27/09/2026 — Roteamento desacoplado, layout unificado de Planejamento Estratégico, modelagem de banco de dados sincronizada, BR-03 (aviso educativo Lead Indicator), BR-07 (recomendação visual de 3 metas sem trava técnica) e BR-08 (bloco integrado na tática).

---

## 1. Arquitetura de Rotas e Telas (Routing Matrix)

Todas as rotas estratégicas e operacionais possuem renderização independente e URLs desacopladas:

| Rota / ID | Nome / Título da Tela | Papel Metodológico (12WY) | Componentes Principais de UI | Ação-Chave do Usuário | Estado de Saída |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | Autenticação & Workspace | Acesso multiusuário e seleção do ciclo trimestral | `LoginPage`, `OAuthButton`, `WorkspaceSelector` | Autenticar e carregar ciclo ativo | JWT Ativo + Contexto Carregado |
| `/planejamento` | Planejamento Estratégico (Modelo Unificado) | Alinhamento da Visão de Longo Prazo e Visão do Ciclo com as Metas de 12 semanas | `StrategicPlanningView`, `VisionStatementCard`, `GoalsGrid`, `NewGoalModal`, `NewTacticModal` | Alinhar visão (3-5 anos, ciclo, porquê emocional) e cadastrar/gerenciar metas e táticas | Plano Estratégico Ativo e Consolidado |
| `/visao` | Visão Inspiradora (Detalhamento) | Fundação emocional profunda e declarações de vida pessoal/profissional | `VisionView`, `EmotionalWhyEditor`, `PocketCardGenerator` | Refinar visão de longo prazo e custo da inação | Visão Selada & Ancorada |
| `/mapa-ciclo` | Mapa do Ciclo | Visão panorâmica de acompanhamento de todas as metas e táticas do ciclo | `CycleMapView`, `GoalStatusTracker`, `TacticsTimeline` | Mapear interdependência de metas e táticas | Ciclo Mapeado |
| `/progresso-diario` | Cockpit Diário (3 Pilares) | Cockpit operacional diário de foco e execução | `PocketCardDrawer`, `LeadTacticsChecklist`, `DeepWorkQuickLaunch`, `DeepWorkTimer 3h` | Ler Cartão (2 min), executar táticas diárias e rodar timer | Táticas Checkadas & Lead Registrado |
| `/placar-wam` | Placar Semanal & WAM | Medição de execução semanal (Scorecard & Reunião WAM) | `ScorecardWamView`, `WAMScoreMeter` (linha de corte 85%), `TrendChart`, `PeerReviewWidget` | Fechar pontuação binária e registrar justificativa de desvio | WAM Consolidado (Assinado) |
| `/fechamento-ciclo` | Fechamento da 13ª Semana | Auditoria de Lag Indicators, retrospectiva e celebração | `CycleClosureView`, `LagIndicatorAuditor`, `RetrospectiveForm`, `CycleCelebration` | Avaliar resultados Lag reais e registrar aprendizados | Ciclo Arquivado (Read-Only) |
| `/novo-ciclo-wizard` | Wizard de Abertura Q(N+1) | Transição fluida entre ciclos com herança de metas | `NewCycleWizard`, `GoalInheritancePicker`, `VelocityForecaster`, `CalendarInit` | Importar metas/táticas recorrentes e abrir ciclo N+1 | Novo Ciclo Ativo |
| `/companion-mobile` | FocusFlow Mobile Companion | Execução móvel de bolso e checklist diário | `HapticChecklist`, `PocketVisionWidget`, `OfflineSyncDaemon` | Check de táticas em trânsito e timer DND | Sync Bi-direcional |

---

## 2. Estrutura Visual da Aba "Planejamento Estratégico" (`StrategicPlanningView`)

A tela `/planejamento` implementa a arquitetura de layout consolidada de alta conversão executiva:

1. **Header da Página:**
   - **Título:** `Planejamento Estratégico` (tipografia proeminente bold).
   - **Subtítulo:** *"Alinhe sua Visão de Longo Prazo e Visão do Ciclo com a execução diária das metas de 12 semanas."*
   - **Badge de Ciclo:** `Semana X de 12 • Ciclo XX • Nome do Ciclo` (cápsula azul suave com ícone de calendário).
   - **Ação Rápida:** Botão `[📖 Cartão de Bolso]` para abertura instantânea do ritual matinal.

2. **Seção 1: Visão de Longo Prazo e Visão do Ciclo (Container Unificado Integrado):**
   - Bloco estruturado em card branco com bordas suaves, sem divisão fragmentada:
     - **Linha 1 — Visão de Longo Prazo (3 a 5 Anos):**
       - Ícone `explore` em azul real.
       - Título em caixa alta sutil: `VISÃO DE LONGO PRAZO (3 A 5 ANOS)`.
       - Declaração resumida da visão aspiracional de futuro.
       - Ações à direita: botões `+ Cadastrar` (quando vazia) e `✏️ Editar`.
     - **Linha 2 — Visão do Ciclo (12 Semanas):**
       - Ícone `calendar_today` em azul real.
       - Título: `VISÃO DO CICLO (12 SEMANAS)`.
       - Declaração do marco intermediário a ser atingido ao fim das 12 semanas.
       - Ações à direita: botões `+ Cadastrar` e `✏️ Editar`.
     - **Linha 3 — Porquê Emocional (Emotional Why):**
       - Ícone `favorite` em tom âmbar/dourado.
       - Título: `PORQUÊ EMOCIONAL (EMOTIONAL WHY)`.
       - Bloco de destaque com fundo suave âmbar (`bg-amber-50/70`), borda sutil e texto em itálico entre aspas com a motivação intrínseca que sustenta a disciplina diária.
       - Ações à direita: botões `+ Cadastrar` e `✏️ Editar`.

3. **Seção 2: Metas do Ciclo de 12 Semanas (Grade Executiva):**
   - **Cabeçalho da Seção:**
     - Título da seção com badge numérico dinâmico (`X Metas`).
     - Tooltip de apoio: *"Metas SMART orientadas por indicadores Lag mensuráveis."*
     - Botão de Ação Primária: `+ Cadastrar Nova Meta` (azul proeminente com ícone de adição).
   - **Grade Responsiva (3 Colunas):**
     - Disposição em `grid-cols-1 md:grid-cols-3` de cards elevados.
     - **Identificação da Meta:** Chip estilizado no canto superior esquerdo (`META 01`, `META 02`, `META 03`).
     - **Ações Rápidas de Topo:** Botões de ícone para edição (`edit`) e exclusão (`delete`) com confirmação de segurança.
     - **Conteúdo da Meta:** Título em destaque e descrição explicativa.
     - **Box de Indicador Lag:**
       - Container azul claro (`bg-blue-50/70 border border-blue-100 rounded-xl p-3.5`).
       - Label em caixa alta: `INDICADOR LAG (MÉTRICA DE SUCESSO FINAL)`.
       - Valor mensurável e auditável (ex.: *"10 novos clientes enterprise ativos"*).
     - **Rodapé do Card de Meta:**
       - Botão secundário: `Editar Meta` (abre modal de edição com indicador Lag).
       - Botão primário com ícone: `+ Tática` (abre diretamente o modal de criação de tática com a meta pré-selecionada).

---

## 3. Regras de Negócio Vigentes (BR-01 a BR-08)

### BR-01: Cálculo Binário e Estrito de WAM (Score Semanal)
- **Fórmula:** `WAM = (Táticas Executadas / Táticas Planejadas) * 100`
- **Validador:** `RuleEngine.assertBinaryScore()` / `calculateWAM(tactics)`
- **Comportamento:** Não existe crédito parcial (ex.: 50% de conclusão pontua 0%). A tática foi 100% executada no prazo ou conta como zero.
- **Linhas de Corte:**
  - `Padrão Ouro`: WAM ≥ 85% (Garante matematicamente a conquista da meta em 12 semanas).
  - `Alerta de Tração`: 70% a 84.9% (Exige redução imediata de escopo operacional secundário).
  - `Risco Metodológico`: < 70% (Alerta crítico; convocação mandatória do WAM Partner).

### BR-02: Blindagem Inegociável de Bloco Estratégico (Deep Work)
- **Política:** `CalendarSync.enforceFocusShield()`
- **Comportamento:** Blocos Estratégicos (3 horas ininterruptas) rejeitam automaticamente convites conflitantes e ativam status DND nos comunicadores da equipe (Slack/Teams).

### BR-03: Princípio Causal — Validação Educativa de Lead Indicators (Revisada)
- **Validador:** `validateLeadIndicator(title)`
- **Comportamento:** O sistema analisa léxica e semanticamente o título da tática em busca de terminologias típicas de resultados finais fora de controle causal direto (ex: *"Fechar contrato"*, *"Bater meta"*, *"Conseguir cliente"*).
- **Tratamento Educativo sem Bloqueio Técnico:**
  - O sistema exibe um alerta visual âmbar didático:
    > *"⚠️ Esta tática parece um Lag Indicator. Reformule para uma ação sob seu controle (ex: 'Realizar 20 reuniões de demonstração') — mas você pode salvar assim mesmo se preferir."*
  - O usuário possui total autonomia para salvar mesmo com o aviso ativo.
  - O campo `is_lead_indicator` é persistido no banco de dados (`true` se estiver em conformidade causal estrita; `false` se for mantida formulação Lag).

### BR-04: Ritual Matinal Obrigatório da Visão
- **Política:** `SessionGuard.requireMorningRitual()`
- **Comportamento:** O Cockpit Diário incentiva a leitura diária de 2 minutos do *Cartão de Bolso da Visão* antes da execução das táticas para conexão do esforço micro à causa macro. A data de leitura diária é registrada em `vision_statements.last_read_date`.

### BR-05: Imutabilidade Histórica & Ciclos Blindados
- **Política:** `cycle.isSealed === true && readOnly`
- **Comportamento:** Ao concluir a 12ª semana (sexta-feira 23:59), o ciclo é selado permanentemente. Pontuações, táticas e execuções históricas tornam-se somente-leitura. A 13ª semana é dedicada exclusivamente à auditoria Lag e transição.

### BR-06: Dupla Homologação WAM (Peer Accountability)
- **Validador:** `GovernanceContract.verifyPeerAudit()`
- **Comportamento:** O placar semanal é assinado e homologado pelo WAM Partner durante o rito semanal de 15 minutos, garantindo prestação de contas real.

### BR-07: Limite de Metas como Recomendação Metodológica (Revisada)
- **Política:** Sem bloqueio técnico no frontend nem no banco de dados.
- **Comportamento:** A metodologia 12WY preconiza até 3 metas simultâneas para foco radical. Caso o usuário adicione a 4ª meta ou mais, a interface exibe um aviso suave:
  > *"⚡ A metodologia recomenda até 3 metas para manter o foco máximo. Você pode continuar mesmo assim."*
- O botão de submissão permanece 100% habilitado e o banco persiste a meta sequencialmente (`order_num`).

### BR-08: Bloco de Tempo Integrado ao Cadastro de Tática (Sem Tela Separada)
- **Política:** Inclusão nativa de horários na entidade de táticas.
- **Comportamento:** Os campos `start_time` e `end_time` são opcionais no formulário de táticas. Quando preenchidos, o sistema infere o tipo de bloco pela duração:
  - `Estratégico`: ≥ 120 min.
  - `Buffer`: ≤ 60 min.
  - `Breakout`: entre 61 e 119 min.
- A visualização dos blocos diários é exibida nativamente na timeline do Cockpit Diário. Não existe tela ou tabela separada para blocos de agenda.

---

## 4. Navegação da Sidebar (Pilares de Cadência)

A barra lateral de navegação mantém arquitetura limpa, direta e de alto contraste, sem submenus redundantes:

- **Pilares de Cadência:**
  - `Progresso diário` (`/progresso-diario`)
  - `Resultado Semanal` (`/placar-wam`)
  - `Planejamento Estratégico` (`/planejamento`)
- **Ciclo de Vida:**
  - `13ª Semana · Auditoria` (`/fechamento-ciclo`)
  - `Abrir Novo Ciclo` (`/novo-ciclo-wizard`)

---

## 5. Modelagem do Banco de Dados (PostgreSQL / Supabase DDL)

A modelagem de dados foi projetada para suporte multiusuário com Row Level Security (RLS), persistência transacional e integridade relacional.

### 5.1 Diagrama Relacional

```
┌──────────┐         ┌──────────────────┐         ┌──────────────┐
│  users   │──1:N───▶│     cycles       │──1:N───▶│    goals     │
├──────────┤         ├──────────────────┤         ├──────────────┤
│ id (PK)  │         │ id (PK)          │         │ id (PK)      │
│ email    │         │ user_id (FK)     │         │ cycle_id(FK) │
│ name     │         │ number           │         │ user_id (FK) │
│ pwd_hash │         │ name             │         │ order_num    │◄── Sem trava <= 3 (BR-07)
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
                                                         ▼
                                                ┌──────────────────┐
                                                │ daily_executions │
                                                ├──────────────────┤
                                                │ id (PK)          │
                                                │ tactic_id (FK)   │
                                                │ user_id (FK)     │
                                                │ execution_date   │◄── DATE único por dia
                                                │ is_completed     │
                                                │ completed_at     │
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
│                        cycle_archives                              │
├────────────────────────────────────────────────────────────────────┤
│ id (PK) | user_id (FK) | cycle_id (FK)                             │
│ final_score | gold_weeks_count                                     │
│ retrospective_json (what_worked, what_failed, main_insight)        │
│ lag_audit_json (array de avaliações reais por meta)                │
│ sealed_at                                                          │
└────────────────────────────────────────────────────────────────────┘
```

### 5.2 Script SQL DDL de Produção

```sql
-- 1. USUÁRIOS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. CICLOS DE 12 SEMANAS
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

-- 3. VISÃO INSPIRADORA (Visão de 3-5 anos, Ciclo de 12 Semanas e Porquê Emocional)
CREATE TABLE vision_statements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id            UUID REFERENCES cycles(id) ON DELETE CASCADE,
  headline            TEXT NOT NULL,
  long_term_vision    TEXT,             -- Visão de 3 a 5 Anos
  cycle_vision        TEXT,             -- Visão do Ciclo de 12 Semanas
  emotional_why       TEXT,             -- Porquê Emocional Ancorador
  inaction_cost       TEXT,             -- Custo da Inação
  last_read_date      DATE,             -- Ritual matinal (BR-04)
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Script de Migração (para bases de dados existentes):
ALTER TABLE vision_statements DROP COLUMN IF EXISTS personal_vision;
ALTER TABLE vision_statements DROP COLUMN IF EXISTS professional_vision;

-- 4. METAS DO CICLO (Sem limite técnico de 3 metas — BR-07)
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id      UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_num     INTEGER NOT NULL,        -- Sequencial sem restrição <= 3
  title         TEXT NOT NULL,
  description   TEXT,
  target_metric TEXT NOT NULL,           -- Indicador Lag mensurável
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 5. TÁTICAS COM BLOCO INTEGRADO (BR-08) E AUDITORIA LEAD (BR-03)
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
  is_lead_indicator BOOLEAN DEFAULT true,-- BR-03 (sem bloqueio de inserção)
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 6. EXECUÇÕES DIÁRIAS (Base Atômica do Score WAM)
CREATE TABLE daily_executions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tactic_id      UUID NOT NULL REFERENCES tactics(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  execution_date DATE NOT NULL,
  is_completed   BOOLEAN DEFAULT false,
  completed_at   TIMESTAMPTZ,
  UNIQUE (tactic_id, execution_date)
);

-- 7. PLACAR WAM SEMANAL (Imutável no Fechamento — BR-05 e BR-06)
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

-- 8. ARQUIVO HISTÓRICO DE CICLOS (13ª Semana e Retrospectiva)
CREATE TABLE cycle_archives (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id           UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  final_score        NUMERIC(5,2) NOT NULL,
  gold_weeks_count   INTEGER NOT NULL,
  retrospective_json JSONB NOT NULL,
  lag_audit_json     JSONB NOT NULL,
  sealed_at          TIMESTAMPTZ DEFAULT now()
);

-- 9. LEMBRETES DO SISTEMA
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

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_statements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_executions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wam_weekly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_archives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders          ENABLE ROW LEVEL SECURITY;

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

## 6. Arquitetura de Componentes Frontend

```
src/
├── App.tsx                        ← Roteador raiz desacoplado e views
├── index.css                      ← Design system tokens Tailwind CSS
├── types/
│   └── index.ts                   ← Modelos TypeScript (Goal, Tactic, Cycle, etc.)
├── utils/
│   └── rules.ts                   ← Motor 12WY (calculateWAM, validateLeadIndicator, etc.)
├── context/
│   └── FocusFlowContext.tsx       ← Estado global, ações de CRUD e persistência
├── components/
│   ├── Header.tsx                 ← Barra de navegação superior com status de ciclo
│   ├── Sidebar.tsx                ← Menu lateral limpo (Pilares de Cadência)
│   ├── CockpitDailyView.tsx       ← Execução diária (3 pilares, checklist e timer)
│   ├── ScorecardWamView.tsx       ← Scorecard semanal, reuniões e histórico WAM
│   ├── StrategicPlanningView.tsx  ← Modelo visual unificado (Visão + Metas + Táticas)
│   ├── VisionView.tsx             ← Edição profunda da visão e ancoragem
│   ├── CycleMapView.tsx           ← Acompanhamento panorâmico de interdependências
│   ├── CycleClosureView.tsx       ← 13ª semana, retrospectiva e selamento
│   ├── NewCycleWizard.tsx         ← Wizard de abertura Q(N+1) com herança
│   ├── NewGoalModal.tsx           ← Modal de meta com Lag Indicator e recomendação visual
│   ├── NewTacticModal.tsx         ← Modal de tática com aviso Lead (BR-03) e horário (BR-08)
│   ├── EditVisionModal.tsx        ← Edição inline de visão de longo prazo e ciclo
│   ├── VisionModal.tsx            ← Cartão de bolso do ritual matinal de 2 min
│   └── GovernanceModal.tsx        ← Configurações de DND e rituais
```
