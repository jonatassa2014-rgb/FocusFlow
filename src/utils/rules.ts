import { Tactic, WAMStatus } from '../types';

/**
 * BR-01: Cálculo Binário e Estrito de WAM (Weekly Accountability Meeting)
 * Fórmula: WAM = (Táticas Executadas / Táticas Planejadas) * 100
 * Não há crédito parcial: 0% ou 100%.
 */
export function calculateWAM(tactics: Tactic[]): {
  score: number;
  executed: number;
  total: number;
  status: WAMStatus;
  statusLabel: string;
} {
  const total = tactics.length;
  if (total === 0) {
    return {
      score: 100,
      executed: 0,
      total: 0,
      status: 'gold',
      statusLabel: 'Padrão Ouro'
    };
  }

  const executed = tactics.filter((t) => t.isCompleted).length;
  const score = Math.round((executed / total) * 1000) / 10; // 1 decimal place

  let status: WAMStatus = 'gold';
  let statusLabel = 'Padrão Ouro (≥ 85%)';

  if (score >= 85) {
    status = 'gold';
    statusLabel = 'Padrão Ouro (≥ 85%)';
  } else if (score >= 70) {
    status = 'alert';
    statusLabel = 'Alerta de Tração (70% - 84%)';
  } else {
    status = 'risk';
    statusLabel = 'Risco Metodológico (< 70%)';
  }

  return {
    score,
    executed,
    total,
    status,
    statusLabel
  };
}

/**
 * BR-03: Princípio Causal — Exclusividade de Lead Indicators
 * Valida se uma tática está 100% sob controle do usuário ou se é um Lag Indicator (dependente de terceiros).
 */
export function validateLeadIndicator(title: string): {
  isValid: boolean;
  reason?: string;
} {
  const lower = title.toLowerCase().trim();
  
  const lagPatterns = [
    /fechar.*contrato/i,
    /fechar.*venda/i,
    /bater.*meta/i,
    /receber.*aprova/i,
    /ganhar.*dinheiro/i,
    /atingir.*faturamento/i,
    /conseguir.*cliente/i,
    /ser.*promovido/i,
    /virar.*sócio/i,
    /virar.*socio/i
  ];

  for (const pattern of lagPatterns) {
    if (pattern.test(lower)) {
      return {
        isValid: false,
        reason: `A tática "${title}" soa como um Lag Indicator (resultado). Reformule para uma ação de esforço 100% sob seu controle (ex: em vez de "Fechar contratos", use "Realizar 20 reuniões de demonstração").`
      };
    }
  }

  return { isValid: true };
}

/**
 * Configuração dos dias da semana (Domingo a Sábado)
 */
export const DAYS_OF_WEEK_CONFIG = [
  { key: 'dom', label: 'D', shortName: 'Dom', fullName: 'Domingo' },
  { key: 'seg', label: 'S', shortName: 'Seg', fullName: 'Segunda-feira' },
  { key: 'ter', label: 'T', shortName: 'Ter', fullName: 'Terça-feira' },
  { key: 'qua', label: 'Q', shortName: 'Qua', fullName: 'Quarta-feira' },
  { key: 'qui', label: 'Q', shortName: 'Qui', fullName: 'Quinta-feira' },
  { key: 'sex', label: 'S', shortName: 'Sex', fullName: 'Sexta-feira' },
  { key: 'sab', label: 'S', shortName: 'Sáb', fullName: 'Sábado' },
] as const;

/**
 * Calcula a duração em minutos entre dois horários HH:MM
 */
export function calculateDurationMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) {
    diff += 24 * 60; // handle overnight
  }
  return diff;
}

/**
 * Formata minutos em formato legível (ex: "1h 30min" ou "45min")
 */
export function formatDurationLabel(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}

/**
 * Infere o tipo de bloco com base na duração em minutos
 */
export function inferBlockTypeFromDuration(minutes: number): 'strategic' | 'buffer' | 'breakout' {
  if (minutes >= 120) return 'strategic'; // 2h ou mais = Estratégico (Deep Work)
  if (minutes <= 60) return 'buffer';     // 1h ou menos = Buffer
  return 'strategic';
}

/**
 * Formata segundos em HH:MM:SS
 */
export function formatTimerSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].join(':');
}
