# FocusFlow Velocity Engine — Design System Tokens & Styleguide
**Versão:** 2.4.0  
**Metodologia Base:** The 12 Week Year (O Ano de 12 Semanas)  
**Conformidade:** WCAG AAA (Contrast ratio até 15.2:1)  

---

## 1. Fundamentos Cromáticos & Tokens de Cores

### 1.1 Cores Primárias e Superfície do Cockpit
- `--color-primary`: `#2563eb` (Royal Blue — Ação Principal, foco executivo)
- `--color-primary-dark`: `#1d4ed8` (Deep Blue — Hover e estados ativos)
- `--color-primary-light`: `#3b82f6` (Blue Accent — Badges informativos)
- `--color-surface`: `#f8f9ff` (Fundo base da aplicação)
- `--color-surface-container-lowest`: `#ffffff` (Cards, modais e containers elevados)
- `--color-surface-container-low`: `#eff4ff` (Painéis laterais, fundos secundários)
- `--color-surface-container-high`: `#e0ebff` (Bordas suaves, divisores)
- `--color-text-pure`: `#081c30` (Texto de altíssimo contraste / Headings)
- `--color-text-secondary`: `#475569` (Texto de apoio, legendas e descrições)
- `--color-text-muted`: `#94a3b8` (Placeholders, metadados inativos)

### 1.2 Cores Funcionais dos Blocos de Tempo (The 12 Week Year)
- **Bloco Estratégico (Deep Work Indivisível - 3 horas)**:
  - Fundo/Borda: `#2563eb` (Royal Blue)
  - Superfície leve: `#eff6ff`
  - Texto de contraste: `#1e40af`
  - Semântica: Deep work com foco exclusivo em táticas Lead. Rejeição automática de reuniões e DND.
- **Bloco Buffer (Operacional & Triagem - 1 a 2 horas)**:
  - Fundo/Borda: `#64748b` (Slate / Steel Blue)
  - Superfície leve: `#f1f5f9`
  - Texto de contraste: `#334155`
  - Semântica: Despacho rápido de e-mails, alinhamentos pontuais e triagens administrativas.
- **Bloco Breakout (Descompressão & Saúde - 3 horas)**:
  - Fundo/Borda: `#059669` (Emerald / Forest)
  - Superfície leve: `#ecfdf5`
  - Texto de contraste: `#065f46`
  - Semântica: Recarga deliberada 100% sem telas para preservação de clareza e combate ao burnout.

### 1.3 Termômetro de Cadência WAM (Weekly Accountability Meeting)
- **Padrão Ouro (≥ 85% de Aderência)**:
  - Cor: `#10b981` (Emerald Green)
  - Fundo sutil: `#d1fae5`
  - Status: Execução no topo da curva. Metas do ano asseguradas em 12 semanas.
- **Zona de Alerta (70% a 84% de Aderência)**:
  - Cor: `#f59e0b` (Amber Glow)
  - Fundo sutil: `#fef3c7`
  - Status: Aderência oscilante. Requer corte imediato de distrações operacionais e revisão de blocos.
- **Risco Metodológico (< 70% de Aderência)**:
  - Cor: `#ef4444` (Crimson Alert)
  - Fundo sutil: `#fee2e2`
  - Status: Crítico. Plano semanal superdimensionado ou falha grave na blindagem de blocos estratégicos.

---

## 2. Tipografia & Escala Hierárquica

- **Família Tipográfica Principal:** `Plus Jakarta Sans`, sans-serif (Interfaces, métricas, títulos)
- **Família Tipográfica Secundária/Leitura:** `Inter`, sans-serif (Textos longos, inputs)
- **Família Monospaçada:** `JetBrains Mono`, monospace (Timers, contagens regressivas, slots de agenda)

### Escala de Tamanhos
| Token | Tamanho / Line-Height | Peso | Aplicação Primária |
| :--- | :--- | :--- | :--- |
| `text-display-01` | 32px / 38px | Bold (700) | Métricas principais, Placar de Aderência WAM |
| `text-heading-02` | 24px / 30px | Bold (700) | Títulos de tela, modais principais |
| `text-subheading` | 18px / 26px | SemiBold (600) | Cabeçalhos de táticas, seções de blocos |
| `text-body-md` | 14px / 20px | Regular (400) / Medium (500) | Descrição de táticas, notas operacionais |
| `text-caption-mono`| 12px / 16px | SemiBold (600) | Timers (`01:42:14`), fusos, tags de slot |

---

## 3. Espaçamento, Raios de Borda e Elevações

- **Grid Base:** 8px
- **Raios de Borda (`border-radius`):**
  - Botões & Inputs: `8px` (`rounded-lg`)
  - Cards & Painéis: `12px` a `16px` (`rounded-xl` / `rounded-2xl`)
  - Badges & Pílulas: `9999px` (`rounded-full`)
- **Sombras (`box-shadow`):**
  - Card Padrão: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
  - Card Elevado/Modal: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)`
