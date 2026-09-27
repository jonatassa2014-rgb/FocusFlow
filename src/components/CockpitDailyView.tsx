import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { formatTimerSeconds, formatDurationLabel, DAYS_OF_WEEK_CONFIG } from '../utils/rules';
import { DayOfWeekKey, TimeBlockType } from '../types';

export const CockpitDailyView: React.FC = () => {
  const {
    tactics,
    toggleTactic,
    goals,
    cycle,
    wamMetrics,
    timer,
    startTimer,
    pauseTimer,
    completeTimer,
    resetTimer,
    setIsVisionModalOpen,
    setIsNewTacticModalOpen,
    setIsGovernanceModalOpen,
    vision
  } = useFocusFlow();

  // Dia ativo para visualização da timeline e táticas (Padrão: Terça-feira - dia 18 do ciclo)
  const [activeDay, setActiveDay] = useState<DayOfWeekKey>('ter');
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');

  const activeDayConfig = DAYS_OF_WEEK_CONFIG.find((d) => d.key === activeDay) || DAYS_OF_WEEK_CONFIG[2];

  // Táticas com horário definido no dia ativo (Timeline de Blocos de Tempo)
  const timelineTactics = tactics
    .filter((t) => t.daysOfWeek.includes(activeDay) && t.startTime && t.endTime)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Táticas para exibição na lista (filtradas por dia ativo ou todas da semana)
  const displayedTactics = tactics.filter((t) => {
    if (filterMode === 'today') {
      return t.daysOfWeek.includes(activeDay);
    }
    return true;
  });

  const completedCount = displayedTactics.filter((t) => t.isCompleted).length;
  const totalCount = displayedTactics.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Cumprimento dos blocos de tempo baseado na execução real das táticas/atividades
  const dayTactics = tactics.filter((t) => t.daysOfWeek.includes(activeDay));
  const totalPlannedMinutes = dayTactics.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const completedMinutes = dayTactics
    .filter((t) => t.isCompleted)
    .reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const blockCompliancePercent = totalPlannedMinutes > 0
    ? Math.round((completedMinutes / totalPlannedMinutes) * 100)
    : 0;

  const formatHoursMinutes = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`;
  };

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    return goal ? `Meta ${goal.number}: ${goal.title}` : 'Meta Geral';
  };

  const getBlockBadge = (type?: TimeBlockType) => {
    switch (type) {
      case 'strategic':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          dot: 'bg-blue-600',
          label: 'Estratégico'
        };
      case 'buffer':
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          dot: 'bg-slate-500',
          label: 'Buffer'
        };
      case 'breakout':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          dot: 'bg-emerald-600',
          label: 'Breakout'
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          dot: 'bg-blue-600',
          label: 'Estratégico'
        };
    }
  };

  return (
    <div className="py-space-md space-y-space-lg max-w-[1440px] mx-auto w-full">
      {/* 1. Contextual Header */}
      <header className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Progresso diário
            </h1>
            <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-bold border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              Modo Foco Ativo
            </span>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
              {completedCount} de {totalCount} Táticas Concluídas ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)
            </span>
            <button
              type="button"
              onClick={() => setIsGovernanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary font-label-sm text-label-sm font-semibold transition-colors cursor-pointer border border-surface-container-highest"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Google Cal & Slack Sincronizados</span>
              <span className="material-symbols-outlined text-[16px] text-primary">sync</span>
            </button>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            {activeDayConfig.fullName}, 22 de Abril • Foco cirúrgico nas táticas prioritárias do Dia {cycle.currentDay} (Semana 0{cycle.currentWeek} de 12)
          </p>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          {/* BR-04: Ritual Matinal da Visão */}
          <button
            onClick={() => setIsVisionModalOpen(true)}
            className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-all shadow-card border ${
              vision.readToday
                ? 'bg-surface-container-low text-primary border-primary/20 hover:bg-surface-container'
                : 'bg-amber-50 text-amber-800 border-amber-300 animate-bounce'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span>Cartão de Bolso da Visão</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-label-sm text-label-sm text-primary font-bold">
              {vision.readToday ? 'Lido Hoje ✓' : 'Pendente 2 min'}
            </span>
          </button>

          {/* Quick Launch Focus Block */}
          <button
            onClick={() => {
              if (!timer.isRunning) startTimer();
            }}
            className="flex items-center gap-1.5 px-space-md py-2.5 bg-primary-container hover:bg-primary-dark text-on-primary rounded-lg font-label-lg text-label-lg transition-all shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[20px]">
              {timer.isRunning && !timer.isPaused ? 'timer' : 'play_arrow'}
            </span>
            <span>{timer.isRunning && !timer.isPaused ? 'Bloco em Andamento' : 'Iniciar Bloco Foco'}</span>
          </button>
        </div>
      </header>

      {/* 2. Top Banner de Celebração (quando 100% WAM) */}
      {allCompleted && (
        <div className="p-space-md rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-card flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-white">emoji_events</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-sm font-bold">
                100% de Execução Alcançada Hoje!
              </h2>
              <p className="text-white/90 text-body-md">
                Todas as táticas Lead do dia foram estritamente cumpridas. Seu WAM semanal está na zona Padrão Ouro.
              </p>
            </div>
          </div>
          <span className="px-space-md py-1.5 rounded-full bg-white/20 backdrop-blur-md font-label-md font-bold text-white border border-white/30">
            Padrão Ouro Moran
          </span>
        </div>
      )}

      {/* 3. Seletor de Dia da Semana da Rotina Tática */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-card border border-surface-container/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[22px]">calendar_view_week</span>
          <div>
            <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold text-[11px] block">
              Cadência do Ciclo (Semana 03)
            </span>
            <span className="font-headline-sm text-[16px] text-on-surface font-bold">
              Selecione o Dia para Análise & Alocação
            </span>
          </div>
        </div>

        {/* 7 Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {DAYS_OF_WEEK_CONFIG.map((day) => {
            const isCurrent = day.key === activeDay;
            const tacticsCount = tactics.filter((t) => t.daysOfWeek.includes(day.key)).length;
            const hasTimeline = tactics.some((t) => t.daysOfWeek.includes(day.key) && t.startTime && t.endTime);

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setActiveDay(day.key)}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm ring-2 ring-primary/20 scale-[1.03]'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-surface-container/80'
                }`}
              >
                <span className="text-[14px] leading-tight font-bold">{day.label}</span>
                <span className="text-[10px] uppercase font-semibold opacity-90">{day.shortName}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {tacticsCount}
                  </span>
                  {hasTimeline && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCurrent ? 'bg-white' : 'bg-primary'
                      }`}
                      title="Possui blocos agendados na timeline"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Metrics Row (3 High-Impact Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Card 1: Lead Score W03 (BR-01 WAM Dinâmico) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
              Lead Score Semanal (W0{cycle.currentWeek})
            </span>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              Meta Moran ≥ 85%
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-space-sm my-space-xs">
            <span className="font-metric-stat text-metric-stat text-on-surface font-bold">
              {wamMetrics.score}%
            </span>
            <div
              className={`flex items-center gap-1 font-label-md text-label-md font-bold ${
                wamMetrics.status === 'gold'
                  ? 'text-wam-gold'
                  : wamMetrics.status === 'alert'
                  ? 'text-wam-alert'
                  : 'text-wam-risk'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {wamMetrics.status === 'gold' ? 'verified' : wamMetrics.status === 'alert' ? 'warning' : 'dangerous'}
              </span>
              {wamMetrics.statusLabel.split(' ')[0]}
            </div>
          </div>

          <div className="space-y-1 mt-space-xs">
            <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  wamMetrics.status === 'gold'
                    ? 'bg-wam-gold'
                    : wamMetrics.status === 'alert'
                    ? 'bg-wam-alert'
                    : 'bg-wam-risk'
                }`}
                style={{ width: `${Math.min(wamMetrics.score, 100)}%` }}
              />
            </div>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant font-medium pt-1">
              <span>Linha de Corte: 85%</span>
              <span className={wamMetrics.score >= 85 ? 'text-wam-gold font-bold' : 'text-wam-alert font-bold'}>
                {wamMetrics.score >= 85
                  ? `+${(wamMetrics.score - 85).toFixed(1)}% acima da meta`
                  : `-${(85 - wamMetrics.score).toFixed(1)}% para a meta`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Cumprimento dos Blocos de Tempo (Acompanhado pela Execução das Táticas) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
              Blocos de Tempo Cumpridos
            </span>
            <span className="px-space-sm py-0.5 rounded bg-blue-100 text-blue-800 font-label-sm text-label-sm font-bold">
              Execução Tática
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-space-sm my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-metric-stat text-metric-stat text-on-surface font-bold">
                {formatHoursMinutes(completedMinutes)}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                / {formatHoursMinutes(totalPlannedMinutes)}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold border ${
                blockCompliancePercent >= 85
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : blockCompliancePercent >= 50
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {blockCompliancePercent}% Cumprido
            </span>
          </div>

          <div className="space-y-1 mt-space-xs">
            <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  blockCompliancePercent >= 85
                    ? 'bg-emerald-500'
                    : 'bg-primary-container'
                }`}
                style={{
                  width: `${Math.min(blockCompliancePercent, 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant font-medium pt-1">
              <span>{completedCount} de {totalCount} táticas finalizadas</span>
              <span className="text-primary font-semibold">
                {blockCompliancePercent >= 85 ? 'Meta de Blocos Atingida ✓' : 'Acompanhamento em Tempo Real'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Next Ritual WAM (BR-06) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform" />
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
              Próximo Ritual WAM (15 min)
            </span>
            <span className="px-space-sm py-0.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm font-bold">
              Sexta-feira • 17:00
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-space-sm my-space-xs">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {cycle.partnerName}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Parceiro de Responsabilidade Crítica
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-label-sm text-label-sm font-bold border border-purple-200">
              Score: {cycle.partnerWamScore}%
            </span>
          </div>

          <div className="space-y-1 mt-space-xs">
            <div className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-[12px] flex items-center justify-between">
              <span>Homologação Mútua (BR-06)</span>
              <span className="font-semibold text-primary">Sessão Agendada</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Timeline de Blocos de Tempo do Dia (Requisito 3: Aparece automaticamente se houver horário) */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container/60 pb-space-md mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">view_timeline</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Timeline de Blocos de Tempo — {activeDayConfig.fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">
                  {timelineTactics.length} {timelineTactics.length === 1 ? 'Bloco Alocado' : 'Blocos Alocados'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Blocos de foco blindados com horário de início e término estimados.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTacticModalOpen(true)}
            className="flex items-center gap-1.5 px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-label-md font-semibold transition-colors self-start sm:self-center border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[18px]">add_alarm</span>
            <span>+ Novo Bloco com Horário</span>
          </button>
        </div>

        {timelineTactics.length > 0 ? (
          <div className="relative pl-6 space-y-space-md before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container">
            {timelineTactics.map((tactic) => {
              const badge = getBlockBadge(tactic.blockType);
              const durationLabel = tactic.estimatedMinutes
                ? formatDurationLabel(tactic.estimatedMinutes)
                : '';

              return (
                <div key={tactic.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-3 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      tactic.isCompleted
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : 'bg-primary text-white ring-4 ring-primary/10'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Timeline Card */}
                  <div
                    className={`p-space-md rounded-xl border transition-all ${
                      tactic.isCompleted
                        ? 'bg-surface-container-low/40 border-surface-container-high'
                        : 'bg-surface-container-lowest border-surface-container hover:border-primary/50 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-2">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-mono text-headline-sm text-[16px] font-bold text-on-surface bg-surface-container px-2.5 py-1 rounded-lg">
                          ⏰ {tactic.startTime} — {tactic.endTime}
                        </span>
                        {durationLabel && (
                          <span className="text-[12px] font-semibold text-on-surface-variant">
                            ({durationLabel})
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTactic(tactic.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-bold transition-all ${
                          tactic.isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-surface-container hover:bg-primary-container hover:text-white text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {tactic.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>{tactic.isCompleted ? 'Concluído' : 'Marcar como Concluído'}</span>
                      </button>
                    </div>

                    <h3
                      className={`font-headline-sm text-[16px] font-semibold ${
                        tactic.isCompleted ? 'line-through text-on-surface-variant/70' : 'text-on-surface'
                      }`}
                    >
                      {tactic.title}
                    </h3>

                    <div className="flex items-center gap-space-sm mt-2 text-[12px]">
                      <span className="px-2 py-0.5 rounded bg-surface-container font-semibold text-primary">
                        {getGoalTitle(tactic.goalId)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        Lead Indicator
                      </span>
                      <span className="text-on-surface-variant">
                        Repete em: {tactic.dayOfWeek}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-space-lg rounded-xl bg-surface-container-low/50 border border-dashed border-surface-container text-center flex flex-col items-center justify-center py-8">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant/50 mb-2">
              schedule
            </span>
            <p className="font-headline-sm text-[16px] text-on-surface font-semibold mb-1">
              Nenhum bloco com horário fixo para {activeDayConfig.fullName}
            </p>
            <p className="font-body-sm text-[13px] text-on-surface-variant max-w-md mb-space-md">
              As táticas deste dia operam em modo flexível na lista abaixo. Para fixar um horário na timeline, edite ou crie uma nova tática preenchendo o horário estimado.
            </p>
            <button
              onClick={() => setIsNewTacticModalOpen(true)}
              className="px-space-md py-2 bg-primary-container hover:bg-primary text-on-primary font-label-md font-semibold rounded-lg shadow-sm transition-all"
            >
              + Criar Tática com Horário
            </button>
          </div>
        )}
      </section>

      {/* 6. Active Time Block Timer (BR-02 Deep Work Shield) */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border-b border-surface-container/60 pb-space-md mb-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[28px]">timer</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {timer.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-label-sm text-label-sm font-bold">
                  DND Blindado Ativo
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Blindagem metodológica: Reuniões são automaticamente rejeitadas no calendário e status silencioso ativado no Slack.
              </p>
            </div>
          </div>

          {/* Quick Block Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg self-start lg:self-center">
            <button
              onClick={() => resetTimer('strategic')}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                timer.blockType === 'strategic'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Estratégico (3h)
            </button>
            <button
              onClick={() => resetTimer('buffer')}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                timer.blockType === 'buffer'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Buffer (1h)
            </button>
            <button
              onClick={() => resetTimer('breakout')}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all ${
                timer.blockType === 'breakout'
                  ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Breakout (3h)
            </button>
          </div>
        </div>

        {/* Timer Display & Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-lg bg-surface-container-low/50 p-space-lg rounded-xl border border-surface-container/40">
          <div className="flex items-center gap-space-lg">
            <div className="font-mono text-[48px] md:text-[56px] font-bold text-on-surface tracking-tight leading-none bg-surface-container-lowest px-space-lg py-3 rounded-2xl shadow-sm border border-surface-container/60">
              {formatTimerSeconds(timer.remainingSeconds)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                Status da Sessão
              </span>
              <span className="font-headline-sm text-primary font-bold">
                {timer.isCompleted
                  ? 'Sessão Concluída'
                  : timer.isPaused
                  ? 'Pausado'
                  : timer.isRunning
                  ? 'Foco Ininterrupto'
                  : 'Pronto para Iniciar'}
              </span>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                Duração planejada: {timer.totalSeconds / 3600}h00
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap">
            {timer.isRunning && !timer.isPaused ? (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-space-lg py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-label-lg font-semibold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">pause</span>
                <span>Pausar</span>
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="flex items-center gap-1.5 px-space-lg py-3 bg-primary-container hover:bg-primary-dark text-on-primary rounded-xl font-label-lg font-semibold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>{timer.isPaused ? 'Retomar Foco' : 'Iniciar Bloco'}</span>
              </button>
            )}

            <button
              onClick={completeTimer}
              className="flex items-center gap-1.5 px-space-lg py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-label-lg font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Concluir Bloco (+25% WAM)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. Checklist Tático (Lista Interativa com Recálculo WAM em Tempo Real) */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Checklist de Táticas Lead
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-bold">
                {completedCount}/{totalCount} Concluídas
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Apenas ações 100% sob seu controle direto pontuam no WAM semanal (BR-03 Princípio Causal).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Toggle Filtro: Apenas Hoje ou Toda a Semana */}
            <div className="flex items-center bg-surface-container p-1 rounded-lg text-[12px] font-semibold">
              <button
                onClick={() => setFilterMode('today')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterMode === 'today'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {activeDayConfig.shortName} ({tactics.filter((t) => t.daysOfWeek.includes(activeDay)).length})
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterMode === 'all'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semana ({tactics.length})
              </button>
            </div>

            <button
              onClick={() => setIsNewTacticModalOpen(true)}
              className="flex items-center gap-1.5 px-space-md py-2 bg-primary-container hover:bg-primary-dark text-on-primary rounded-lg font-label-md text-label-md transition-all shadow-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              <span>+ Adicionar Tática</span>
            </button>
          </div>
        </div>

        {/* List of Tactics */}
        <div className="space-y-space-sm">
          {displayedTactics.map((tactic) => {
            const badge = getBlockBadge(tactic.blockType);
            const hasTime = !!(tactic.startTime && tactic.endTime);
            const durationLabel = tactic.estimatedMinutes ? formatDurationLabel(tactic.estimatedMinutes) : null;

            return (
              <div
                key={tactic.id}
                onClick={() => toggleTactic(tactic.id)}
                className={`p-space-md rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-space-md group ${
                  tactic.isCompleted
                    ? 'bg-surface-container-low/40 border-surface-container-high'
                    : 'bg-surface-container-lowest border-surface-container hover:border-primary/50 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-space-md">
                  {/* Custom Reactive Checkbox */}
                  <div className="pt-0.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        tactic.isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border-2 border-surface-container-highest group-hover:border-primary text-transparent bg-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span
                      className={`font-body-lg text-body-md md:text-body-lg font-medium transition-all ${
                        tactic.isCompleted
                          ? 'line-through text-on-surface-variant/70'
                          : 'text-on-surface group-hover:text-primary'
                      }`}
                    >
                      {tactic.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-space-sm text-[12px]">
                      {/* Goal Chip */}
                      <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-primary font-semibold">
                        {getGoalTitle(tactic.goalId)}
                      </span>

                      {/* Horário estimado ou Flexível (Requisito 3) */}
                      {hasTime ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold border border-blue-200">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {tactic.startTime} - {tactic.endTime} ({durationLabel})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          Horário flexível
                        </span>
                      )}

                      {/* Dias Programados */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                        {tactic.dayOfWeek}
                      </span>

                      {/* Lead Indicator Pill */}
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-label-sm font-semibold">
                        <span className="material-symbols-outlined text-[14px]">bolt</span>
                        Lead Indicator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm shrink-0 self-end md:self-center">
                  <span
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                      tactic.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {tactic.isCompleted ? '100% Concluída' : 'Pendente (0%)'}
                  </span>
                </div>
              </div>
            );
          })}

          {displayedTactics.length === 0 && (
            <div className="p-8 text-center bg-surface-container-low/40 rounded-xl border border-dashed border-surface-container text-on-surface-variant">
              Nenhuma tática programada para {activeDayConfig.fullName}. Clique em "+ Adicionar Tática" para cadastrar.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
