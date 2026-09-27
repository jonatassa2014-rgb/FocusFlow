import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { Goal, CycleArchiveRecord } from '../types';

export const StrategicPlanningView: React.FC = () => {
  const {
    vision,
    goals,
    updateGoal,
    deleteGoal,
    addGoal,
    cycle,
    isNewGoalModalOpen,
    setIsNewGoalModalOpen,
    setIsNewTacticModalOpen,
    setIsVisionModalOpen,
    openEditVision,
    cycleHistory,
    setActiveTab,
  } = useFocusFlow();

  // Estados de Tooltip
  const [showVisionTooltip, setShowVisionTooltip] = useState(false);
  const [showGoalsTooltip, setShowGoalsTooltip] = useState(false);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);

  // Estados locais para Metas
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetMetric, setTargetMetric] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetMetric(goal.targetMetric);
    setErrorMessage('');
    setIsNewGoalModalOpen(true);
  };

  const openNewGoalModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setTargetMetric('');
    setErrorMessage('');
    setIsNewGoalModalOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir a "Meta 0${goal.number}: ${goal.title}"?\n\nIsso liberará um slot para cadastrar uma nova meta para o ciclo.`
    );
    if (confirmed) {
      deleteGoal(goal.id);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('O título da meta é obrigatório.');
      return;
    }
    if (!targetMetric.trim()) {
      setErrorMessage('Informe o Indicador Lag (métrica mensurável de resultado final).');
      return;
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        description: description.trim(),
        targetMetric: targetMetric.trim(),
      });
    } else {
      const res = addGoal({
        title: title.trim(),
        description: description.trim(),
        targetMetric: targetMetric.trim(),
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao cadastrar meta.');
        return;
      }
    }

    setIsNewGoalModalOpen(false);
  };

  return (
    <div className="py-space-md space-y-space-lg max-w-[1440px] mx-auto w-full pb-16">
      {/* Cabeçalho Unificado */}
      <header className="bg-white rounded-2xl p-space-md shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-slate-900 tracking-tight leading-tight">
            Planejamento Estratégico
          </h1>
          <p className="text-[13px] md:text-[14px] text-slate-500 mt-0.5">
            Alinhe sua Visão de Longo Prazo e Visão do Ciclo com a execução diária das metas de 12 semanas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-blue-100/70 text-blue-700 text-[12px] font-semibold">
            Semana {cycle.currentWeek} de 12 • {cycle.name}
          </span>
          <button
            onClick={() => setIsVisionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            type="button"
            title="Abrir Cartão de Bolso da Visão"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">menu_book</span>
            <span>Cartão de Bolso</span>
          </button>
        </div>
      </header>

      {/* 1 & 2. Bloco de Visão: Visão de Longo Prazo, Visão do Ciclo e Porquê Emocional */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] md:text-[17px] font-bold text-slate-900">
            Visão de Longo Prazo e Visão do Ciclo
          </h2>
          <button
            type="button"
            onClick={() => setShowVisionTooltip(!showVisionTooltip)}
            onMouseEnter={() => setShowVisionTooltip(true)}
            onMouseLeave={() => setShowVisionTooltip(false)}
            className="text-slate-400 hover:text-blue-600 transition-colors flex items-center cursor-pointer p-0.5"
            title="Princípio da Visão de Brian Moran"
            aria-label="Ver princípio metodológico da visão"
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
          </button>

          {/* Tooltip Popover */}
          {showVisionTooltip && (
            <div className="absolute left-6 top-10 z-30 w-72 sm:w-80 p-3 rounded-xl bg-slate-900 text-white text-[12px] leading-relaxed shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
              <span className="font-bold block text-blue-300 mb-1">
                Princípio de Brian P. Moran:
              </span>
              A Visão de Longo Prazo (3 a 5 anos) e a Visão do Ciclo (12 semanas) criam a âncora emocional necessária para superar o desconforto da disciplina diária e direcionar as prioridades do ciclo.
            </div>
          )}
        </div>

        {/* Card Container Branco com os 3 cartões horizontais */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 space-y-4">
          {/* 1. Visão de Longo Prazo */}
          <div className="p-4 md:p-5 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">explore</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                  VISÃO DE LONGO PRAZO
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  (3 a 5 Anos)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditVision('longo-prazo', 'cadastrar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-600 text-[11px] font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Cadastrar Visão de Longo Prazo"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Cadastrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditVision('longo-prazo', 'editar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Editar Visão de Longo Prazo"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Editar</span>
                </button>
              </div>
            </div>
            <p className="text-[13.5px] md:text-[14px] text-slate-700 leading-relaxed font-normal">
              {vision.longTermVision || vision.threeToFiveYearDeclaration || 'Em 3 a 5 anos, liderar uma organização de software altamente lucrativa, operando com excelência baseada no Ano de 12 Semanas, mantendo saúde física impecável e presença constante com a família.'}
            </p>
          </div>

          {/* 2. Visão do Ciclo */}
          <div className="p-4 md:p-5 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">calendar_today</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                  VISÃO DO CICLO
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  (12 Semanas)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditVision('ciclo', 'cadastrar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-600 text-[11px] font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Cadastrar Visão do Ciclo"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Cadastrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditVision('ciclo', 'editar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Editar Visão do Ciclo"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Editar</span>
                </button>
              </div>
            </div>
            <p className="text-[13.5px] md:text-[14px] text-slate-700 leading-relaxed font-normal">
              {vision.cycleVision || 'Ao final destas 12 semanas, alcançar 50 clientes ativos no SaaS, manter rotina de 5 treinos semanais e consistência de 85% de execução no WAM.'}
            </p>
          </div>

          {/* 3. Porquê Emocional */}
          <div className="p-4 md:p-5 rounded-xl bg-amber-50/40 border border-amber-200/60">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-800">favorite</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-amber-950">
                  PORQUÊ EMOCIONAL
                </span>
                <span className="text-[11px] text-amber-800/80 font-medium">
                  (Emotional Why)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditVision('longo-prazo', 'cadastrar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-600 text-[11px] font-semibold border border-amber-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Cadastrar Porquê Emocional"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Cadastrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditVision('longo-prazo', 'editar')}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold border border-amber-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Editar Porquê Emocional"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Editar</span>
                </button>
              </div>
            </div>
            <p className="text-[13.5px] md:text-[14px] text-amber-950 italic leading-relaxed font-normal">
              "{vision.emotionalWhy || 'A clareza de saber que cada dia de execução intencional afasta a mediocridade de um ano convencional de 12 meses e constrói o futuro dos meus filhos.'}"
            </p>
          </div>
        </div>
      </section>

      {/* 4. Metas do Ciclo */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[16px] md:text-[18px] font-bold text-slate-900">
              Metas do Ciclo de 12 Semanas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
              {goals.length} {goals.length === 1 ? 'Meta' : 'Metas'}
            </span>

            <button
              type="button"
              onClick={() => setShowGoalsTooltip(!showGoalsTooltip)}
              onMouseEnter={() => setShowGoalsTooltip(true)}
              onMouseLeave={() => setShowGoalsTooltip(false)}
              className="text-slate-400 hover:text-blue-600 transition-colors flex items-center cursor-pointer p-0.5"
              title="Princípio Causal de Brian Moran"
              aria-label="Ver princípio causal das metas"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>

            {/* Tooltip Popover */}
            {showGoalsTooltip && (
              <div className="absolute left-6 top-10 z-30 w-72 sm:w-80 p-3 rounded-xl bg-slate-900 text-white text-[12px] leading-relaxed shadow-xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                <span className="font-bold block text-blue-300 mb-1">
                  Princípio Causal (Lead vs. Lag):
                </span>
                As Metas definem o resultado final pretendido (Lag Indicators). As Táticas semanais são as ações sob seu controle direto (Lead Indicators) para garantir o alcance dessas metas.
              </div>
            )}
          </div>

          <button
            onClick={openNewGoalModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">add_circle</span>
            <span>+ Cadastrar Nova Meta</span>
          </button>
        </div>

        {/* Grade de Metas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-sm transition-shadow relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider border border-blue-100">
                    META 0{goal.number}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      title="Editar esta meta"
                      className="p-1 rounded-md text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      title="Excluir esta meta"
                      className="p-1 rounded-md text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-[16px] md:text-[17px] font-bold text-slate-900 mb-2 leading-snug">
                  {goal.title}
                </h3>
                <p className="text-[13px] font-normal text-slate-600 mb-4 leading-relaxed min-h-[40px]">
                  {goal.description}
                </p>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 mb-4">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                    INDICADOR LAG (MÉTRICA DE SUCESSO FINAL)
                  </span>
                  <span className="text-[13.5px] text-slate-800 font-bold block">{goal.targetMetric}</span>
                </div>
              </div>

              {/* Botões de Ação do Card */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-[12px] font-semibold text-blue-600 border border-slate-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    <span>Editar Meta</span>
                  </button>
                  <button
                    onClick={() => setIsNewTacticModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-[12px] font-semibold text-blue-600 border border-blue-200/70 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>+ Tática</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Cadastro / Edição de Meta */}
      {/* ── Histórico de Ciclos ────────────────────────────────────────── */}
      {cycleHistory.length > 0 && (
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[22px] text-primary">history</span>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Histórico de Ciclos</h2>
                <p className="font-body-sm text-on-surface-variant">{cycleHistory.length} ciclo(s) concluído(s) e arquivado(s)</p>
              </div>
            </div>
          </div>

          <div className="space-y-space-sm">
            {[...cycleHistory].reverse().map((archive: CycleArchiveRecord) => {
              const key = archive.cycle.id;
              const expanded = expandedArchive === key;
              const scoreColor = archive.finalScore >= 85 ? 'text-wam-gold' : archive.finalScore >= 70 ? 'text-wam-alert' : 'text-wam-risk';
              const scoreBg   = archive.finalScore >= 85 ? 'bg-wam-gold/10 border-wam-gold/30' : archive.finalScore >= 70 ? 'bg-wam-alert/10 border-wam-alert/30' : 'bg-wam-risk/10 border-wam-risk/30';

              return (
                <div key={key} className="rounded-xl border border-surface-container overflow-hidden">
                  {/* Linha resumo */}
                  <button
                    onClick={() => setExpandedArchive(expanded ? null : key)}
                    className="w-full flex items-center justify-between p-space-md bg-surface-container-low hover:bg-surface-container transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-on-surface-variant">{expanded ? 'expand_less' : 'expand_more'}</span>
                      <div>
                        <p className="font-label-lg text-on-surface font-semibold">{archive.cycle.name}</p>
                        <p className="font-body-sm text-on-surface-variant text-[12px]">
                          {new Date(archive.cycle.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} → {new Date(archive.cycle.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-label-sm text-[11px] px-2 py-0.5 rounded-full border ${scoreBg} ${scoreColor} font-bold`}>
                        WAM Médio: {archive.finalScore.toFixed(1)}%
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant">
                        🟢 {archive.goldWeeks}/{archive.wamHistory.length} semanas
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px]">
                        Selado
                      </span>
                    </div>
                  </button>

                  {/* Painel expandido */}
                  {expanded && (
                    <div className="p-space-md border-t border-surface-container space-y-space-md">
                      {/* Auditoria Lag */}
                      <div>
                        <h4 className="font-label-md text-on-surface font-semibold mb-space-sm">Auditoria Lag</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                          {archive.lagAudit.map((e) => (
                            <div key={e.goalId} className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                              <p className="font-label-sm text-on-surface-variant mb-0.5 text-[11px]">{e.goalTitle}</p>
                              <p className="font-label-md text-on-surface font-semibold">{e.achievedResult || '—'}</p>
                              <div className="mt-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${e.achievedPercent >= 85 ? 'bg-wam-gold' : e.achievedPercent >= 70 ? 'bg-wam-alert' : 'bg-wam-risk'}`}
                                  style={{ width: `${e.achievedPercent}%` }}
                                />
                              </div>
                              <p className={`font-label-sm text-[11px] mt-0.5 font-bold ${e.achievedPercent >= 85 ? 'text-wam-gold' : e.achievedPercent >= 70 ? 'text-wam-alert' : 'text-wam-risk'}`}>
                                {e.achievedPercent}% atingido
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Retrospectiva */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                        <div className="p-3 rounded-xl bg-wam-gold/5 border border-wam-gold/20">
                          <p className="font-label-sm text-wam-gold font-bold mb-1 text-[11px]">✅ O que funcionou</p>
                          <p className="font-body-sm text-on-surface text-[13px]">{archive.retrospective.whatWorked}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-wam-risk/5 border border-wam-risk/20">
                          <p className="font-label-sm text-wam-risk font-bold mb-1 text-[11px]">❌ O que falhou</p>
                          <p className="font-body-sm text-on-surface text-[13px]">{archive.retrospective.whatFailed}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="font-label-sm text-primary font-bold mb-1 text-[11px]">💡 Insight principal</p>
                          <p className="font-body-sm text-on-surface text-[13px]">{archive.retrospective.mainInsight}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Goal Modal */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-xl w-full p-space-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">flag</span>
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-on-surface">
                    {editingGoal
                      ? `Editar Meta 0${editingGoal.number}`
                      : `Cadastrar Meta 0${goals.length + 1}`}
                  </h2>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Regra de Brian Moran: Resultado Final Desejado (Lag Indicator)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Aviso visual no formulário de meta (BR-07 revisada) */}
            {goals.length >= 3 && (
              <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded-lg mb-4">
                ⚡ A metodologia recomenda até 3 metas para manter o foco máximo.
                Você pode continuar mesmo assim.
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aumentar receita recorrente (MRR) em 25%"
                  className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Indicador Lag (Métrica de Sucesso Concreta) *
                </label>
                <input
                  type="text"
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  placeholder="Ex: +R$ 45.000 / mês ou 500 clientes ativos"
                  className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary"
                  required
                />
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Metas medem o resultado final (Lag). As ações diárias controláveis para atingi-las são as Táticas (Lead).
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Descrição Estratégica
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve contextualização do porquê esta meta é indispensável no ciclo..."
                  className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container/60">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-space-md py-2.5 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-[13px] font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>{editingGoal ? 'Salvar Alterações' : 'Cadastrar Meta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
