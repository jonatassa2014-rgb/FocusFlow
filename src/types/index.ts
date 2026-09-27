export type TimeBlockType = 'strategic' | 'buffer' | 'breakout';

export type WAMStatus = 'gold' | 'alert' | 'risk';

export interface Goal {
  id: string;
  number: number;
  title: string;
  description: string;
  category?: string;
  targetMetric: string;
  progressPercent?: number;
}

export type DayOfWeekKey = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab';

export interface Tactic {
  id: string;
  goalId: string;
  title: string;
  daysOfWeek: DayOfWeekKey[];
  dayOfWeek?: string;
  startTime?: string; // Formato HH:MM
  endTime?: string;   // Formato HH:MM
  blockType?: TimeBlockType;
  estimatedMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
  isLeadIndicator: boolean; // BR-03: Princípio Causal
}

export interface Cycle {
  id: string;
  number: number;
  name: string;
  currentWeek: number; // 1 to 12 (or 13 for audit)
  currentDay: number;
  startDate: string;
  endDate: string;
  isSealed: boolean; // BR-05
  partnerName: string;
  partnerWamScore: number;
}

/** Registro arquivado de um ciclo completo (13ª semana selada) */
export interface CycleArchiveRecord {
  cycle: Cycle;
  wamHistory: WamWeekRecord[];
  finalScore: number;          // Média WAM do ciclo
  goldWeeks: number;           // Semanas com status 'gold'
  /** Retrospectiva estruturada */
  retrospective: {
    whatWorked: string;
    whatFailed: string;
    mainInsight: string;
  };
  /** Auditoria Lag: resultados reais de cada meta */
  lagAudit: LagAuditEntry[];
  sealedAt: string;            // ISO timestamp
}

export interface VisionStatement {
  headline: string;
  threeToFiveYearDeclaration?: string;
  longTermVision: string;
  cycleVision: string;
  emotionalWhy: string;
  inactionCost?: string;
  lastReadDate?: string;
  readToday: boolean; // BR-04
}

export interface WamWeekRecord {
  week: number;
  score: number;
  status: WAMStatus;
  executed: number;
  planned: number;
  sealedAt: string;              // ISO timestamp
  partnerHomologated: boolean;   // BR-06
  homologatedAt?: string;        // ISO timestamp da homologação
  deviationNotes?: string;       // Obrigatório se WAM < 85%
}

/** Entrada de auditoria de indicador Lag por meta */
export interface LagAuditEntry {
  goalId: string;
  goalTitle: string;
  targetMetric: string;
  achievedResult: string;        // Resultado real atingido
  achievedPercent: number;       // 0–100
}

export interface TimeBlockTimerState {
  blockType: TimeBlockType;
  title: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  dndShieldActive: boolean; // BR-02
}
