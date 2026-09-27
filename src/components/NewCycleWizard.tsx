import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { Goal } from '../types';

// ─── Utilitários ──────────────────────────────────────────────────────────────
function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total, labels }) => (
  <div className="flex items-center gap-0 justify-center mb-space-lg w-full overflow-x-auto">
    {Array.from({ length: total }, (_, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-label-lg font-bold border-2 transition-all ${
                done
                  ? 'bg-primary border-primary text-on-primary'
                  : active
                  ? 'bg-primary-container border-primary text-primary'
                  : 'bg-surface-container-low border-surface-container text-on-surface-variant'
              }`}
            >
              {done ? (
                <span className="material-symbols-outlined text-[18px]">check</span>
              ) : (
                step
              )}
            </div>
            <span className={`font-label-sm text-[10px] mt-1 max-w-[72px] text-center leading-tight ${active ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 flex-1 mx-1 rounded transition-all ${done ? 'bg-primary' : 'bg-surface-container'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── NewCycleWizard ───────────────────────────────────────────────────────────
export const NewCycleWizard: React.FC = () => {
  const { goals, vision, cycle, openNewCycle, setActiveTab } = useFocusFlow();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;
  const STEP_LABELS = ['Herança de Metas', 'Visão do Ciclo', 'Datas', 'Confirmação'];

  // ── Step 1: Herança de Metas ─────────────────────────────────────────────
  const [inheritedGoals, setInheritedGoals] = useState<{ checked: boolean; goal: Goal }[]>(
    goals.map((g) => ({ checked: true, goal: { ...g, progressPercent: 0 } }))
  );
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc]   = useState('');
  const [newGoalMetric, setNewGoalMetric] = useState('');
  const [showNewGoal, setShowNewGoal]   = useState(false);

  const toggleGoal = (id: string) => {
    setInheritedGoals((prev) =>
      prev.map((ig) => (ig.goal.id === id ? { ...ig, checked: !ig.checked } : ig))
    );
  };

  const updateGoalField = (id: string, field: keyof Goal, value: string) => {
    setInheritedGoals((prev) =>
      prev.map((ig) =>
        ig.goal.id === id ? { ...ig, goal: { ...ig.goal, [field]: value } } : ig
      )
    );
  };

  const addNewGoal = () => {
    if (!newGoalTitle.trim()) return;
    const dummy: Goal = {
      id: `new_${Date.now()}`,
      number: (inheritedGoals.length + 1) as 1 | 2 | 3,
      title: newGoalTitle,
      description: newGoalDesc,
      targetMetric: newGoalMetric,
      progressPercent: 0,
    };
    setInheritedGoals((prev) => [...prev, { checked: true, goal: dummy }]);
    setNewGoalTitle('');
    setNewGoalDesc('');
    setNewGoalMetric('');
    setShowNewGoal(false);
  };

  // ── Step 2: Visão do Ciclo ───────────────────────────────────────────────
  const [cycleVision, setCycleVision] = useState(vision.cycleVision || '');

  // ── Step 3: Datas ────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const [cycleName, setCycleName]   = useState(`Ciclo 0${cycle.number + 1} • Q${cycle.number + 1} Execution`);
  const [startDate, setStartDate]   = useState(todayStr);
  const [partnerName, setPartnerName] = useState(cycle.partnerName);
  const endDate = startDate ? addWeeks(startDate, 12) : '';

  // ── Step 4: Confirmar ────────────────────────────────────────────────────
  const [error, setError] = useState('');

  const selectedGoals = inheritedGoals.filter((ig) => ig.checked).map((ig) => ig.goal);

  const validateStep = (): boolean => {
    setError('');
    if (step === 1 && selectedGoals.length === 0) {
      setError('Selecione ou crie pelo menos uma meta para o novo ciclo.');
      return false;
    }
    if (step === 1 && selectedGoals.length > 3) {
      setError('Máximo de 3 metas por ciclo (Regra de Ouro de Moran).');
      return false;
    }
    if (step === 2 && !cycleVision.trim()) {
      setError('Defina a Visão do Ciclo antes de avançar.');
      return false;
    }
    if (step === 3 && !startDate) {
      setError('Selecione a data de início do ciclo.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleConfirm = () => {
    if (selectedGoals.length === 0) {
      setError('Selecione pelo menos uma meta.');
      return;
    }
    openNewCycle({
      name: cycleName,
      startDate,
      endDate,
      importedGoals: selectedGoals,
      cycleVision,
      partnerName,
    });
  };

  // ── Render por step ──────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // ── Step 1 ──────────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-space-md">
            <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">info</span>
              <p className="font-body-sm text-on-surface">
                Selecione as metas que deseja herdar do ciclo anterior. Você pode editar título, descrição e métrica alvo inline, ou criar uma meta totalmente nova.
              </p>
            </div>

            {inheritedGoals.map((ig, idx) => (
              <div
                key={ig.goal.id}
                className={`rounded-xl border p-space-md transition-all ${ig.checked ? 'border-primary/30 bg-primary/5' : 'border-dashed border-surface-container opacity-60'}`}
              >
                <div className="flex items-center gap-3 mb-space-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ig.checked}
                      onChange={() => toggleGoal(ig.goal.id)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  </label>
                  <input
                    type="text"
                    disabled={!ig.checked}
                    value={ig.goal.title}
                    onChange={(e) => updateGoalField(ig.goal.id, 'title', e.target.value)}
                    className="flex-1 font-label-lg text-on-surface bg-transparent border-b border-surface-container-high focus:border-primary outline-none transition-all disabled:opacity-50 pb-0.5"
                    placeholder="Título da meta"
                  />
                </div>
                {ig.checked && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pl-10">
                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">Descrição</label>
                      <input
                        type="text"
                        value={ig.goal.description}
                        onChange={(e) => updateGoalField(ig.goal.id, 'description', e.target.value)}
                        className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">Métrica Alvo</label>
                      <input
                        type="text"
                        value={ig.goal.targetMetric}
                        onChange={(e) => updateGoalField(ig.goal.id, 'targetMetric', e.target.value)}
                        className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Adicionar nova meta */}
            {inheritedGoals.filter((ig) => ig.checked).length < 3 && !showNewGoal && (
              <button
                onClick={() => setShowNewGoal(true)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary font-label-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Criar Nova Meta
              </button>
            )}

            {showNewGoal && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-space-md space-y-space-sm">
                <h4 className="font-label-lg text-primary font-semibold">Nova meta</h4>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Título da meta *"
                  className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <input
                  type="text"
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="Descrição"
                  className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <input
                  type="text"
                  value={newGoalMetric}
                  onChange={(e) => setNewGoalMetric(e.target.value)}
                  placeholder="Métrica alvo"
                  className="w-full rounded-lg bg-surface-container border border-surface-container-high p-2 font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <div className="flex gap-space-sm">
                  <button onClick={() => setShowNewGoal(false)} className="flex-1 py-2 rounded-lg border border-surface-container text-on-surface-variant font-label-md hover:bg-surface-container transition-all">Cancelar</button>
                  <button onClick={addNewGoal} disabled={!newGoalTitle.trim()} className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold disabled:opacity-40 hover:opacity-90 transition-all">Adicionar</button>
                </div>
              </div>
            )}
          </div>
        );

      // ── Step 2 ──────────────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-space-md">
            <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">lightbulb</span>
              <p className="font-body-sm text-on-surface">
                Defina com precisão o que você estará vivendo ao final destas 12 semanas. Seja específico e emocionalmente conectado.
              </p>
            </div>

            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-2">
                Visão do Ciclo {cycle.number + 1} <span className="text-error">*</span>
              </label>
              <textarea
                value={cycleVision}
                onChange={(e) => setCycleVision(e.target.value)}
                placeholder="Ex: Ao final destas 12 semanas, terei 80 clientes ativos no SaaS, entregado 36 conteúdos técnicos e mantido 5 treinos semanais com consistência de 90% no WAM…"
                className="w-full rounded-xl bg-surface-container border border-surface-container-high p-4 font-body-md text-on-surface resize-none h-40 outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <p className="font-label-sm text-on-surface-variant mt-1">{cycleVision.length} caracteres</p>
            </div>

            {/* Visão anterior como referência */}
            {vision.cycleVision && (
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
                <p className="font-label-sm text-on-surface-variant mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  Visão do ciclo anterior (referência):
                </p>
                <p className="font-body-sm text-on-surface-variant italic">"{vision.cycleVision}"</p>
                <button
                  onClick={() => setCycleVision(vision.cycleVision)}
                  className="mt-2 text-primary font-label-sm underline underline-offset-2 hover:opacity-80 transition-all text-[12px]"
                >
                  Usar como base →
                </button>
              </div>
            )}
          </div>
        );

      // ── Step 3 ──────────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-space-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-2">Nome do Ciclo</label>
                <input
                  type="text"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  placeholder="Ex: Ciclo 02 · Q2 Execution"
                  className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-2">Parceiro WAM</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-2">
                  Data de Início <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl bg-surface-container border border-surface-container-high p-3 font-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-2">
                  Data de Fim <span className="font-normal text-on-surface-variant">(calculado automaticamente)</span>
                </label>
                <div className="w-full rounded-xl bg-surface-container-low border border-surface-container p-3 font-body-md text-on-surface-variant">
                  {endDate ? formatDate(endDate) : '— selecione a data de início'}
                </div>
              </div>
            </div>

            {/* Duração visual */}
            {startDate && endDate && (
              <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-primary">calendar_month</span>
                <div>
                  <p className="font-label-md text-on-surface font-semibold">
                    {formatDate(startDate)} → {formatDate(endDate)}
                  </p>
                  <p className="font-body-sm text-primary">12 semanas · 84 dias de execução intencional</p>
                </div>
              </div>
            )}
          </div>
        );

      // ── Step 4 ──────────────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-space-md">
            <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">rocket_launch</span>
              <p className="font-body-sm text-on-surface">
                Confirme os detalhes do <strong>{cycleName}</strong>. Ao clicar em "Abrir Ciclo", todas as táticas serão reiniciadas e o WAM voltará a zero.
              </p>
            </div>

            {/* Preview metas */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-space-md space-y-space-sm">
              <h3 className="font-label-md text-on-surface font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary">flag</span>
                Metas ({selectedGoals.length}/3)
              </h3>
              {selectedGoals.map((g, i) => (
                <div key={g.id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low">
                  <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                  <div>
                    <p className="font-label-md text-on-surface font-semibold">{g.title}</p>
                    <p className="font-body-sm text-on-surface-variant">{g.targetMetric}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Visão */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-space-md">
              <h3 className="font-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                Visão do Ciclo
              </h3>
              <p className="font-body-sm text-on-surface italic">"{cycleVision}"</p>
            </div>

            {/* Preview Datas */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-space-md">
              <h3 className="font-label-md text-on-surface font-semibold flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                Período
              </h3>
              <p className="font-body-sm text-on-surface">
                <strong>{cycleName}</strong> · {formatDate(startDate)} → {formatDate(endDate)}
              </p>
              <p className="font-body-sm text-on-surface-variant mt-0.5">
                Parceiro WAM: <strong>{partnerName}</strong>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-space-md max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 mb-space-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[24px] text-primary">add_circle</span>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[11px]">Wizard de Abertura</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
          Novo Ciclo Q{cycle.number + 1}
        </h1>
        <p className="font-body-md text-on-surface-variant mt-1">
          Defina as metas, visão e datas do seu próximo ano de 12 semanas.
        </p>
      </header>

      {/* Step indicator */}
      <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />

      {/* Card do step */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 mb-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md">
          Passo {step} — {STEP_LABELS[step - 1]}
        </h2>

        {renderStep()}

        {error && (
          <div className="mt-space-md rounded-xl bg-error-container/40 border border-error/30 p-3 text-on-error-container font-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-error">error</span>
            {error}
          </div>
        )}
      </div>

      {/* Navegação */}
      <div className="flex justify-between gap-space-sm">
        <button
          onClick={() => {
            if (step === 1) setActiveTab('fechamento-ciclo');
            else setStep((s) => s - 1);
          }}
          className="px-6 py-3 rounded-xl border border-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container transition-all flex items-center gap-2"
        >
          ← {step === 1 ? 'Voltar' : 'Anterior'}
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-lg font-semibold shadow hover:opacity-90 transition-all flex items-center gap-2"
          >
            Próximo →
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl bg-wam-gold text-white font-label-lg font-semibold shadow hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Abrir Ciclo {cycle.number + 1}
          </button>
        )}
      </div>
    </div>
  );
};
