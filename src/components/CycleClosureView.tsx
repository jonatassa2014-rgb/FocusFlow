import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { LagAuditEntry } from '../types';

// ─── Badge de honra ────────────────────────────────────────────────────────────
function getHonorBadge(goldWeeks: number, totalWeeks: number): { label: string; icon: string; color: string } {
  const ratio = goldWeeks / Math.max(totalWeeks, 1);
  if (ratio >= 0.9) return { label: 'Lenda de Execução', icon: 'military_tech', color: 'text-wam-gold' };
  if (ratio >= 0.75) return { label: 'Executor de Elite', icon: 'workspace_premium', color: 'text-primary' };
  if (ratio >= 0.6)  return { label: 'Desempenho Consistente', icon: 'verified', color: 'text-secondary' };
  return { label: 'Ciclo em Construção', icon: 'trending_up', color: 'text-on-surface-variant' };
}

// ─── CycleClosureView ──────────────────────────────────────────────────────────
export const CycleClosureView: React.FC = () => {
  const { goals, wamHistory, cycle, sealCycle, setActiveTab } = useFocusFlow();

  // ── Auditoria Lag ───────────────────────────────────────────────────────────
  const [lagEntries, setLagEntries] = useState<LagAuditEntry[]>(
    goals.map((g) => ({
      goalId: g.id,
      goalTitle: g.title,
      targetMetric: g.targetMetric,
      achievedResult: '',
      achievedPercent: 0,
    }))
  );

  const updateLag = (goalId: string, field: 'achievedResult' | 'achievedPercent', value: string | number) => {
    setLagEntries((prev) =>
      prev.map((e) => (e.goalId === goalId ? { ...e, [field]: value } : e))
    );
  };

  // ── Retrospectiva ───────────────────────────────────────────────────────────
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed]   = useState('');
  const [mainInsight, setMainInsight] = useState('');

  // ── UI State ────────────────────────────────────────────────────────────────
  const [error, setError] = useState('');
  const [sealed, setSealed] = useState(cycle.isSealed);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Métricas do ciclo ───────────────────────────────────────────────────────
  const sealedWeeks  = wamHistory.length;
  const goldWeeks    = wamHistory.filter((r) => r.status === 'gold').length;
  const scores       = wamHistory.map((r) => r.score);
  const avgScore     = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
  const badge        = getHonorBadge(goldWeeks, sealedWeeks);

  const handleSeal = () => {
    const result = sealCycle({
      lagAudit: lagEntries,
      retrospective: { whatWorked, whatFailed, mainInsight },
    });
    if (!result.success) {
      setError(result.message || 'Erro ao selar o ciclo.');
      setConfirmOpen(false);
      return;
    }
    setSealed(true);
    setConfirmOpen(false);
  };

  // ── Modal de confirmação ────────────────────────────────────────────────────
  const ConfirmModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container w-full max-w-sm p-space-lg">
        <div className="flex items-center gap-space-sm mb-space-md">
          <span className="material-symbols-outlined text-[30px] text-wam-risk">lock</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Selar Ciclo?</h2>
            <p className="font-body-sm text-on-surface-variant">Esta ação é irreversível. O ciclo será arquivado.</p>
          </div>
        </div>
        <div className="flex gap-space-sm">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSeal}
            className="flex-1 py-2.5 rounded-xl bg-wam-risk text-white font-label-lg font-semibold hover:opacity-90 transition-all"
          >
            ✓ Selar Ciclo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-space-md space-y-space-lg max-w-[1440px] mx-auto w-full">
      {confirmOpen && <ConfirmModal />}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[24px] text-primary">history_edu</span>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[11px]">13ª Semana · Auditoria de Ciclo</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Fechamento do {cycle.name}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Audite os resultados reais, escreva sua retrospectiva e sele o ciclo para a posteridade.
          </p>
        </div>

        {sealed && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wam-gold/10 border border-wam-gold/30 text-wam-gold font-label-lg font-semibold">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Ciclo Selado
          </div>
        )}
      </header>

      {/* ── Painel de Celebração ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        {/* Score final */}
        <div className={`rounded-xl p-space-md border shadow-card ${avgScore >= 85 ? 'bg-wam-gold/10 border-wam-gold/30' : avgScore >= 70 ? 'bg-wam-alert/10 border-wam-alert/30' : 'bg-wam-risk/10 border-wam-risk/30'}`}>
          <p className="font-label-sm text-on-surface-variant mb-1">Score Final WAM</p>
          <p className={`font-headline-lg text-[36px] font-bold leading-none ${avgScore >= 85 ? 'text-wam-gold' : avgScore >= 70 ? 'text-wam-alert' : 'text-wam-risk'}`}>
            {avgScore.toFixed(1)}%
          </p>
        </div>

        {/* Semanas Padrão Ouro */}
        <div className="rounded-xl p-space-md border border-wam-gold/30 bg-wam-gold/10 shadow-card">
          <p className="font-label-sm text-on-surface-variant mb-1">Semanas Padrão Ouro</p>
          <p className="font-headline-lg text-[36px] font-bold leading-none text-wam-gold">
            {goldWeeks}<span className="text-[18px] text-on-surface-variant">/{sealedWeeks}</span>
          </p>
        </div>

        {/* Semanas executadas */}
        <div className="rounded-xl p-space-md border border-surface-container bg-surface-container-lowest shadow-card">
          <p className="font-label-sm text-on-surface-variant mb-1">Semanas Executadas</p>
          <p className="font-headline-lg text-[36px] font-bold leading-none text-on-surface">
            {sealedWeeks}<span className="text-[18px] text-on-surface-variant">/12</span>
          </p>
        </div>

        {/* Badge de honra */}
        <div className="rounded-xl p-space-md border border-primary/20 bg-primary/5 shadow-card flex flex-col justify-center items-center text-center">
          <span className={`material-symbols-outlined text-[40px] ${badge.color}`}>{badge.icon}</span>
          <p className={`font-headline-sm text-[16px] font-bold mt-1 ${badge.color}`}>{badge.label}</p>
          <p className="font-label-sm text-on-surface-variant text-[11px] mt-0.5">Badge do Ciclo</p>
        </div>
      </div>

      {/* ── Grid principal ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">

        {/* ── Auditoria Lag ───────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 space-y-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[22px] text-primary">analytics</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Auditoria Lag</h2>
              <p className="font-body-sm text-on-surface-variant">Resultados reais dos indicadores de atraso (metas)</p>
            </div>
          </div>

          <div className="space-y-space-md">
            {lagEntries.map((entry, idx) => (
              <div
                key={entry.goalId}
                className="p-space-md rounded-xl bg-surface-container-low border border-surface-container"
              >
                <div className="flex items-center gap-2 mb-space-sm">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="font-label-md text-on-surface font-semibold line-clamp-2">{entry.goalTitle}</p>
                </div>

                <p className="font-body-sm text-on-surface-variant mb-space-sm">
                  <strong>Meta:</strong> {entry.targetMetric}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <div>
                    <label className="font-label-sm text-on-surface-variant block mb-1">Resultado atingido</label>
                    <input
                      type="text"
                      disabled={sealed}
                      value={entry.achievedResult}
                      onChange={(e) => updateLag(entry.goalId, 'achievedResult', e.target.value)}
                      placeholder="Ex: 42 clientes, 48 treinos…"
                      className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-on-surface-variant block mb-1">
                      % Atingido: <span className={`font-bold ${entry.achievedPercent >= 85 ? 'text-wam-gold' : entry.achievedPercent >= 70 ? 'text-wam-alert' : 'text-wam-risk'}`}>{entry.achievedPercent}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      disabled={sealed}
                      value={entry.achievedPercent}
                      onChange={(e) => updateLag(entry.goalId, 'achievedPercent', Number(e.target.value))}
                      className="w-full accent-primary disabled:opacity-50"
                    />
                    <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant mt-0.5">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-2 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${entry.achievedPercent >= 85 ? 'bg-wam-gold' : entry.achievedPercent >= 70 ? 'bg-wam-alert' : 'bg-wam-risk'}`}
                    style={{ width: `${entry.achievedPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Retrospectiva Estruturada ────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 space-y-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[22px] text-primary">rate_review</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Retrospectiva Estruturada</h2>
              <p className="font-body-sm text-on-surface-variant">Análise qualitativa do ciclo encerrado</p>
            </div>
          </div>

          {/* O que funcionou */}
          <div>
            <label className="font-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-wam-gold/20 text-wam-gold text-[11px] font-bold flex items-center justify-center">1</span>
              O que funcionou? <span className="text-error">*</span>
            </label>
            <textarea
              disabled={sealed}
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="Identifique os hábitos, blocos e táticas que consistentemente geraram resultados…"
              className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-sm text-on-surface resize-none h-28 outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* O que falhou */}
          <div>
            <label className="font-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-wam-risk/20 text-wam-risk text-[11px] font-bold flex items-center justify-center">2</span>
              O que falhou? <span className="text-error">*</span>
            </label>
            <textarea
              disabled={sealed}
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder="Mapeie os padrões de falha, gatilhos de desvio e blocos que nunca saíram do papel…"
              className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-sm text-on-surface resize-none h-28 outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* Insight principal */}
          <div>
            <label className="font-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">3</span>
              Insight principal <span className="text-error">*</span>
            </label>
            <textarea
              disabled={sealed}
              value={mainInsight}
              onChange={(e) => setMainInsight(e.target.value)}
              placeholder="A maior lição que você levará para o próximo ciclo — em uma frase poderosa…"
              className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-sm text-on-surface resize-none h-20 outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* Histórico WAM resumido */}
          {wamHistory.length > 0 && (
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container">
              <p className="font-label-sm text-on-surface-variant mb-2">Histórico WAM resumido:</p>
              <div className="flex flex-wrap gap-1.5">
                {wamHistory.map((r) => (
                  <span
                    key={r.week}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${r.status === 'gold' ? 'bg-wam-gold/15 text-wam-gold' : r.status === 'alert' ? 'bg-wam-alert/15 text-wam-alert' : 'bg-wam-risk/15 text-wam-risk'}`}
                  >
                    S{r.week}: {r.score.toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Erro ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-error-container/40 border border-error/30 p-space-md text-on-error-container font-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          {error}
        </div>
      )}

      {/* ── Ações finais ────────────────────────────────────────────────── */}
      {!sealed ? (
        <div className="flex flex-col sm:flex-row gap-space-sm justify-end">
          <button
            onClick={() => setActiveTab('placar-wam')}
            className="px-6 py-3 rounded-xl border border-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container transition-all"
          >
            ← Voltar ao Scorecard
          </button>
          <button
            onClick={() => {
              setError('');
              if (!whatWorked.trim() || !whatFailed.trim() || !mainInsight.trim()) {
                setError('Preencha todos os campos da retrospectiva antes de selar o ciclo.');
                return;
              }
              setConfirmOpen(true);
            }}
            className="px-8 py-3 rounded-xl bg-wam-risk text-white font-label-lg font-semibold shadow hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Selar Ciclo Definitivamente
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-space-sm justify-end">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-wam-gold/10 border border-wam-gold/30 text-wam-gold font-label-md font-semibold">
            <span className="material-symbols-outlined text-[20px]">lock</span>
            Ciclo selado em {new Date().toLocaleDateString('pt-BR')}. Parabéns pela conclusão!
          </div>
          <button
            onClick={() => setActiveTab('novo-ciclo')}
            className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Abrir Novo Ciclo →
          </button>
        </div>
      )}
    </div>
  );
};
