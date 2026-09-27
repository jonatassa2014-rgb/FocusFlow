import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { WAMStatus, WamWeekRecord } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WAM_COLORS: Record<WAMStatus, { text: string; bg: string; border: string; label: string; dot: string }> = {
  gold:  { text: 'text-wam-gold',  bg: 'bg-wam-gold/10',  border: 'border-wam-gold/40',  label: '🟢 Padrão Ouro',  dot: '#4ade80' },
  alert: { text: 'text-wam-alert', bg: 'bg-wam-alert/10', border: 'border-wam-alert/40', label: '🟡 Zona de Alerta', dot: '#facc15' },
  risk:  { text: 'text-wam-risk',  bg: 'bg-wam-risk/10',  border: 'border-wam-risk/40',  label: '🔴 Risco Metodológico', dot: '#f87171' },
};

function wamColor(status: WAMStatus) {
  return WAM_COLORS[status];
}

// ─── Trend Chart (SVG puro, sem dependências externas) ────────────────────────
interface TrendChartProps {
  history: WamWeekRecord[];
  currentWeek: number;
  currentScore: number;
  currentStatus: WAMStatus;
}

const TrendChart: React.FC<TrendChartProps> = ({ history, currentWeek, currentScore, currentStatus }) => {
  const W = 600;
  const H = 180;
  const PAD = { top: 20, right: 24, bottom: 36, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Combinar histórico + semana atual
  const allPoints = [
    ...history,
    { week: currentWeek, score: currentScore, status: currentStatus, partnerHomologated: false } as WamWeekRecord,
  ].sort((a, b) => a.week - b.week);

  if (allPoints.length < 1) return null;

  const maxWeek = 12;
  const minScore = 0;
  const maxScore = 100;

  const xScale = (week: number) => PAD.left + ((week - 1) / (maxWeek - 1)) * innerW;
  const yScale = (score: number) => PAD.top + (1 - (score - minScore) / (maxScore - minScore)) * innerH;

  const cutoff = yScale(85);
  const pathD = allPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.week).toFixed(1)} ${yScale(p.score).toFixed(1)}`)
    .join(' ');

  const areaD =
    pathD +
    ` L ${xScale(allPoints[allPoints.length - 1].week).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}` +
    ` L ${xScale(allPoints[0].week).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  // Semanas do eixo X
  const xTicks = [1, 3, 6, 9, 12];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      style={{ overflow: 'visible' }}
      aria-label="Gráfico de tendência WAM"
    >
      <defs>
        <linearGradient id="wam-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Linha de corte 85% */}
      <line
        x1={PAD.left} y1={cutoff} x2={PAD.left + innerW} y2={cutoff}
        stroke="#4ade80" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
      />
      <text x={PAD.left + innerW + 4} y={cutoff + 4} fill="#4ade80" fontSize="10" opacity="0.9" fontWeight="bold">85%</text>

      {/* Grades horizontais */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={PAD.left} y1={yScale(v)} x2={PAD.left + innerW} y2={yScale(v)}
            stroke="rgba(148,163,184,0.12)" strokeWidth="1"
          />
          <text x={PAD.left - 6} y={yScale(v) + 4} fill="rgba(148,163,184,0.55)" fontSize="9" textAnchor="end">{v}</text>
        </g>
      ))}

      {/* Eixo X — semanas */}
      {xTicks.map((w) => (
        <text key={w} x={xScale(w)} y={PAD.top + innerH + 18} fill="rgba(148,163,184,0.6)" fontSize="10" textAnchor="middle">
          S{w}
        </text>
      ))}

      {/* Área preenchida */}
      <path d={areaD} fill="url(#wam-area-grad)" />

      {/* Linha principal */}
      <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />

      {/* Pontos de dados */}
      {allPoints.map((p) => {
        const cx = xScale(p.week);
        const cy = yScale(p.score);
        const color = WAM_COLORS[p.status]?.dot ?? '#818cf8';
        const isLast = p.week === allPoints[allPoints.length - 1].week;
        return (
          <g key={p.week}>
            <circle cx={cx} cy={cy} r={isLast ? 6 : 4.5} fill={color} stroke="#1e293b" strokeWidth="2" />
            {isLast && (
              <circle cx={cx} cy={cy} r={9} fill={color} opacity="0.2">
                <animate attributeName="r" values="6;11;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <text x={cx} y={cy - 10} fill={color} fontSize="9.5" fontWeight="700" textAnchor="middle">
              {p.score.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Modal Fechar Semana ───────────────────────────────────────────────────────
interface SealWeekModalProps {
  onClose: () => void;
  onConfirm: (notes: string) => void;
  currentScore: number;
  currentStatus: WAMStatus;
  week: number;
}

const SealWeekModal: React.FC<SealWeekModalProps> = ({ onClose, onConfirm, currentScore, currentStatus, week }) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const needsNotes = currentStatus !== 'gold';

  const handleConfirm = () => {
    if (needsNotes && !notes.trim()) {
      setError('Justificativa obrigatória quando WAM está abaixo de 85%.');
      return;
    }
    onConfirm(notes);
  };

  const colors = wamColor(currentStatus);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-md p-space-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-space-sm mb-space-md">
          <span className="material-symbols-outlined text-[28px] text-primary">lock_clock</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Fechar Semana {week}</h2>
            <p className="font-body-sm text-on-surface-variant">Esta ação avança o ciclo para a semana {week + 1}.</p>
          </div>
        </div>

        {/* Score atual */}
        <div className={`rounded-xl p-space-md mb-space-md border ${colors.bg} ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant">WAM desta semana</span>
            <span className={`font-headline-sm text-[26px] font-bold ${colors.text}`}>
              {currentScore.toFixed(1)}%
            </span>
          </div>
          <p className={`font-label-sm mt-1 ${colors.text}`}>{colors.label}</p>
        </div>

        {/* Campo de justificativa */}
        <div className="mb-space-md">
          <label className="font-label-md text-on-surface font-semibold block mb-1">
            Notas de Desvio {needsNotes && <span className="text-error">*</span>}
          </label>
          <p className="font-body-sm text-on-surface-variant mb-2">
            {needsNotes
              ? 'WAM abaixo de 85%. Descreva os principais fatores de desvio e plano de correção:'
              : 'Opcional: registre aprendizados ou destaques desta semana.'}
          </p>
          <textarea
            className={`w-full rounded-xl bg-surface-container border p-3 font-body-sm text-on-surface resize-none h-24 outline-none focus:ring-2 focus:ring-primary/40 transition-all ${
              error ? 'border-error' : 'border-surface-container-high'
            }`}
            placeholder={needsNotes ? 'Ex: Reuniões não planejadas consumiram 3 blocos estratégicos...' : 'Opcional...'}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setError(''); }}
          />
          {error && <p className="font-body-sm text-error mt-1">{error}</p>}
        </div>

        {/* Ações */}
        <div className="flex gap-space-sm">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow hover:opacity-90 transition-all"
          >
            Fechar Semana →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Homologação do Parceiro (BR-06) ────────────────────────────────────
interface HomologateModalProps {
  record: WamWeekRecord;
  partnerName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const HomologateModal: React.FC<HomologateModalProps> = ({ record, partnerName, onClose, onConfirm }) => {
  const [confirmed, setConfirmed] = useState(false);
  const colors = wamColor(record.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-md p-space-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-space-sm mb-space-md">
          <span className="material-symbols-outlined text-[28px] text-primary">handshake</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Homologação BR-06</h2>
            <p className="font-body-sm text-on-surface-variant">Semana {record.week} — {partnerName}</p>
          </div>
        </div>

        {/* Resumo da semana */}
        <div className={`rounded-xl p-space-md mb-space-md border ${colors.bg} ${colors.border} space-y-2`}>
          <div className="flex justify-between">
            <span className="font-label-md text-on-surface-variant">WAM</span>
            <span className={`font-label-lg font-bold ${colors.text}`}>{record.score.toFixed(1)}% · {colors.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-label-md text-on-surface-variant">Táticas</span>
            <span className="font-label-md text-on-surface">{record.executed}/{record.planned} executadas</span>
          </div>
          {record.deviationNotes && (
            <div className="pt-2 border-t border-surface-container">
              <p className="font-label-sm text-on-surface-variant mb-1">Notas de desvio:</p>
              <p className="font-body-sm text-on-surface italic">"{record.deviationNotes}"</p>
            </div>
          )}
        </div>

        {/* Toggle de confirmação */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-surface-container-low border border-surface-container mb-space-md hover:bg-surface-container transition-all">
          <div
            className={`w-10 h-5 rounded-full transition-all duration-300 flex items-center px-0.5 ${confirmed ? 'bg-primary' : 'bg-surface-container-high'}`}
            onClick={() => setConfirmed(!confirmed)}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${confirmed ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="font-body-md text-on-surface">
            Confirmo que li e concordo com os resultados da Semana {record.week}
          </span>
        </label>

        <div className="flex gap-space-sm">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✓ Homologar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Scorecard Main ───────────────────────────────────────────────────────────
export const ScorecardWamView: React.FC = () => {
  const {
    wamMetrics,
    cycle,
    wamHistory,
    sealWeek,
    homologateWeek,
  } = useFocusFlow();

  const [showSealModal, setShowSealModal] = useState(false);
  const [homologateTarget, setHomologateTarget] = useState<WamWeekRecord | null>(null);
  const [sealSuccess, setSealSuccess] = useState('');

  // Mapa rápido para lookup
  const historyMap = new Map(wamHistory.map((r) => [r.week, r]));

  const handleSealConfirm = (notes: string) => {
    const result = sealWeek(notes);
    if (result.success) {
      setShowSealModal(false);
      setSealSuccess(`Semana ${cycle.currentWeek} fechada com sucesso!`);
      setTimeout(() => setSealSuccess(''), 4000);
    }
  };

  const handleHomologateConfirm = () => {
    if (homologateTarget) {
      homologateWeek(homologateTarget.week);
      setHomologateTarget(null);
    }
  };

  // Semanas 1-12 enriquecidas
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    const sealed = historyMap.get(w);
    const isCurrent = w === cycle.currentWeek;
    const isUpcoming = w > cycle.currentWeek;
    return { week: w, sealed, isCurrent, isUpcoming };
  });

  // Média acumulada de semanas seladas
  const sealedScores = wamHistory.map((r) => r.score);
  const avgScore = sealedScores.length > 0 ? sealedScores.reduce((s, v) => s + v, 0) / sealedScores.length : null;

  return (
    <div className="py-space-md space-y-space-lg max-w-[1440px] mx-auto w-full">
      {/* Modais */}
      {showSealModal && (
        <SealWeekModal
          week={cycle.currentWeek}
          currentScore={wamMetrics.score}
          currentStatus={wamMetrics.status}
          onClose={() => setShowSealModal(false)}
          onConfirm={handleSealConfirm}
        />
      )}
      {homologateTarget && (
        <HomologateModal
          record={homologateTarget}
          partnerName={cycle.partnerName}
          onClose={() => setHomologateTarget(null)}
          onConfirm={handleHomologateConfirm}
        />
      )}

      {/* Toast de sucesso */}
      {sealSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-wam-gold/10 border border-wam-gold/40 text-wam-gold rounded-xl px-4 py-3 font-label-md font-semibold shadow-lg animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {sealSuccess}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Resultado Semanal
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Meta de execução: ≥ 85% para assegurar as metas do ano em 12 semanas.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          {/* Parceiro */}
          <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">handshake</span>
            <div>
              <span className="font-label-sm text-on-surface-variant block text-[11px]">Parceiro WAM</span>
              <span className="font-label-md text-on-surface font-semibold">{cycle.partnerName}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-primary text-white font-label-sm font-bold ml-2">
              {cycle.partnerWamScore}%
            </span>
          </div>

          {/* Fechar Semana */}
          <button
            onClick={() => setShowSealModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            Fechar Semana {cycle.currentWeek}
          </button>
        </div>
      </header>

      {/* ── Métricas rápidas ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* WAM Atual */}
        <div className={`rounded-xl p-space-md border shadow-card ${wamColor(wamMetrics.status).bg} ${wamColor(wamMetrics.status).border}`}>
          <p className="font-label-sm text-on-surface-variant mb-1">WAM Semana {cycle.currentWeek}</p>
          <p className={`font-headline-lg text-[32px] font-bold leading-none ${wamColor(wamMetrics.status).text}`}>
            {wamMetrics.score.toFixed(1)}%
          </p>
          <p className={`font-label-sm mt-1 ${wamColor(wamMetrics.status).text}`}>{wamColor(wamMetrics.status).label}</p>
        </div>

        {/* Táticas */}
        <div className="rounded-xl p-space-md border border-surface-container bg-surface-container-lowest shadow-card">
          <p className="font-label-sm text-on-surface-variant mb-1">Táticas da Semana</p>
          <p className="font-headline-lg text-[32px] font-bold leading-none text-on-surface">
            {wamMetrics.executed}<span className="text-[18px] text-on-surface-variant">/{wamMetrics.total}</span>
          </p>
          <p className="font-label-sm text-on-surface-variant mt-1">executadas hoje</p>
        </div>

        {/* Semanas fechadas */}
        <div className="rounded-xl p-space-md border border-surface-container bg-surface-container-lowest shadow-card">
          <p className="font-label-sm text-on-surface-variant mb-1">Semanas Fechadas</p>
          <p className="font-headline-lg text-[32px] font-bold leading-none text-on-surface">
            {wamHistory.length}<span className="text-[18px] text-on-surface-variant">/12</span>
          </p>
          <p className="font-label-sm text-on-surface-variant mt-1">do ciclo</p>
        </div>

        {/* Média acumulada */}
        <div className="rounded-xl p-space-md border border-surface-container bg-surface-container-lowest shadow-card">
          <p className="font-label-sm text-on-surface-variant mb-1">Média Acumulada</p>
          <p className={`font-headline-lg text-[32px] font-bold leading-none ${avgScore !== null ? (avgScore >= 85 ? 'text-wam-gold' : avgScore >= 70 ? 'text-wam-alert' : 'text-wam-risk') : 'text-on-surface-variant'}`}>
            {avgScore !== null ? `${avgScore.toFixed(1)}%` : '—'}
          </p>
          <p className="font-label-sm text-on-surface-variant mt-1">nas semanas fechadas</p>
        </div>
      </div>

      {/* ── Grid principal: histórico + protocolo ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">

        {/* Histórico das 12 semanas */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Histórico das 12 Semanas do Ciclo
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space-sm">
            {weeks.map(({ week, sealed, isCurrent, isUpcoming }) => {
              const colors = sealed ? wamColor(sealed.status) : null;
              return (
                <div
                  key={week}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-between min-h-[128px] transition-all ${
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : sealed
                      ? `${colors!.bg} ${colors!.border}`
                      : 'border-dashed border-surface-container bg-surface-container-low/30 opacity-50'
                  }`}
                >
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between font-label-sm text-[10px] font-bold text-on-surface-variant">
                    <span>Sem. {week}</span>
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    {sealed?.partnerHomologated && (
                      <span className="material-symbols-outlined text-[12px] text-wam-gold" title="Homologado pelo parceiro">verified</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="my-1">
                    {sealed ? (
                      <span className={`font-headline-sm text-[20px] font-bold ${colors!.text}`}>
                        {sealed.score.toFixed(1)}%
                      </span>
                    ) : isCurrent ? (
                      <span className="font-headline-sm text-[20px] font-bold text-primary">
                        {wamMetrics.score.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="font-body-sm text-on-surface-variant text-[13px]">—</span>
                    )}
                  </div>

                  {/* Status / Ação */}
                  <div className="text-[10px] font-semibold">
                    {sealed ? (
                      <>
                        <p className={`${colors!.text} mb-1`}>{colors!.label.split(' ').slice(1).join(' ')}</p>
                        {!sealed.partnerHomologated && (
                          <button
                            onClick={() => setHomologateTarget(sealed)}
                            className="text-primary underline underline-offset-1 font-label-sm text-[10px] hover:opacity-80 transition-all"
                          >
                            Homologar
                          </button>
                        )}
                      </>
                    ) : isCurrent ? (
                      <span className="text-primary">Em andamento</span>
                    ) : (
                      <span className="text-on-surface-variant">Aguardando</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-on-surface-variant">
            <span>🟢 Padrão Ouro: ≥ 85%</span>
            <span>🟡 Zona de Alerta: 70%–84%</span>
            <span>🔴 Risco Metodológico: &lt; 70%</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-wam-gold">verified</span>
              Homologado pelo parceiro
            </span>
          </div>
        </div>

        {/* Protocolo WAM 15 min */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-space-sm mb-space-sm">
              <span className="material-symbols-outlined text-[24px] text-primary">groups</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Protocolo WAM (15 min)
              </h3>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-space-md">
              Roteiro estrito de prestação de contas com o parceiro crítico:
            </p>

            <ol className="space-y-space-sm font-body-sm text-on-surface list-decimal list-inside">
              <li className="p-2 rounded-lg bg-surface-container-low">
                <strong>Pontuação Real (3 min):</strong> Revelar o percentual WAM binário sem desculpas.
              </li>
              <li className="p-2 rounded-lg bg-surface-container-low">
                <strong>O que funcionou (3 min):</strong> Identificar blocos respeitados e vitórias Lead.
              </li>
              <li className="p-2 rounded-lg bg-surface-container-low">
                <strong>Onde falhou (3 min):</strong> Analisar distrações e falhas na blindagem de blocos.
              </li>
              <li className="p-2 rounded-lg bg-surface-container-low">
                <strong>Ajustes W+1 (6 min):</strong> Reprogramar blocos e táticas para a próxima semana.
              </li>
            </ol>
          </div>

          {/* Semanas pendentes de homologação */}
          {wamHistory.filter((r) => !r.partnerHomologated).length > 0 && (
            <div className="mt-space-md p-3 rounded-xl bg-wam-alert/10 border border-wam-alert/30">
              <p className="font-label-sm text-wam-alert font-semibold mb-2">
                ⚠️ {wamHistory.filter((r) => !r.partnerHomologated).length} semana(s) pendente(s) de homologação
              </p>
              {wamHistory.filter((r) => !r.partnerHomologated).map((r) => (
                <button
                  key={r.week}
                  onClick={() => setHomologateTarget(r)}
                  className="w-full text-left text-[12px] text-wam-alert underline underline-offset-2 hover:opacity-80 transition-all"
                >
                  → Semana {r.week} ({r.score.toFixed(1)}%)
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowSealModal(true)}
            className="w-full mt-space-md py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg font-semibold shadow-sm transition-all text-center flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            Fechar Semana {cycle.currentWeek}
          </button>
        </div>
      </div>

      {/* ── Gráfico de Tendência ────────────────────────────────────────── */}
      {wamHistory.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tendência WAM do Ciclo</h2>
              <p className="font-body-sm text-on-surface-variant mt-0.5">
                Linha tracejada verde = meta de 85% (Padrão Ouro). Ponto pulsante = semana atual.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-wam-gold inline-block" />≥ 85%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-wam-alert inline-block" />70–84%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-wam-risk inline-block" />&lt; 70%</span>
            </div>
          </div>
          <TrendChart
            history={wamHistory}
            currentWeek={cycle.currentWeek}
            currentScore={wamMetrics.score}
            currentStatus={wamMetrics.status}
          />
        </div>
      )}
    </div>
  );
};
