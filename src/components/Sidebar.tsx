import React from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, cycle, wamMetrics } = useFocusFlow();

  const navItems = [
    { id: 'progresso-diario', label: 'Progresso diário', icon: 'view_agenda' },
    { id: 'placar-wam', label: 'Resultado Semanal', icon: 'monitoring' },
    { id: 'planejamento', label: 'Planejamento Estratégico', icon: 'flag' },
  ];

  const lifecycleItems = [
    { id: 'fechamento-ciclo', label: '13ª Semana · Auditoria', icon: 'history_edu' },
    { id: 'novo-ciclo', label: 'Abrir Novo Ciclo', icon: 'add_circle' },
  ];

  const isPlanningActive =
    activeTab === 'planejamento' || activeTab === 'mapa-ciclo' || activeTab === 'visao';

  const isLifecycleActive = activeTab === 'fechamento-ciclo' || activeTab === 'novo-ciclo';

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container">
      <div className="flex flex-col">
        {/* Logo and Week Badge */}
        <div className="h-16 px-gutter flex items-center justify-between bg-surface-container-low border-b border-surface-container/60">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => setActiveTab('progresso-diario')}>
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm font-bold shadow-sm">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold leading-tight">
                FocusFlow
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                12 Week System
              </span>
            </div>
          </div>
          <span className="px-space-xs py-0.5 rounded bg-surface-container-highest font-label-sm text-label-sm text-primary font-bold">
            W0{cycle.currentWeek}
          </span>
        </div>

        {/* Execution Cadence Mini Card */}
        <div className="px-gutter py-space-sm">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-card border border-surface-container/40 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Ritmo de Execução
              </span>
              <span className="font-label-lg text-label-lg text-primary font-bold">
                Meta Lead: 85% WAM
              </span>
            </div>
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                wamMetrics.status === 'gold'
                  ? 'bg-wam-gold'
                  : wamMetrics.status === 'alert'
                  ? 'bg-wam-alert'
                  : 'bg-wam-risk'
              }`}
              title={`Status WAM: ${wamMetrics.score}%`}
            />
          </div>
        </div>

        {/* 3 Pillars of Cadence Navigation */}
        <div className="px-gutter pt-2 pb-1">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant/70 font-bold">
            Pilares de Cadência
          </span>
        </div>
        <nav className="flex flex-col gap-1.5 px-space-md py-1">
          {navItems.map((item) => {
            const isItemActive =
              activeTab === item.id ||
              (item.id === 'planejamento' && isPlanningActive);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-all text-left cursor-pointer ${
                  isItemActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isItemActive ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lifecycle Navigation */}
        <div className="px-gutter pt-3 pb-1">
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant/70 font-bold">
            Ciclo de Vida
          </span>
        </div>
        <nav className="flex flex-col gap-1.5 px-space-md py-1">
          {lifecycleItems.map((item) => {
            const isItemActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg transition-all text-left cursor-pointer ${
                  isItemActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isItemActive ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 12WY Philosophy Footer */}
      <div className="p-space-md bg-surface-container-low border-t border-surface-container/60">
        <div className="bg-surface-container-highest p-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
            <span className="font-label-sm text-label-sm text-tertiary font-bold">12W</span>
          </div>
          <div className="flex flex-col">
            <p className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              Filosofia Operacional
            </p>
            <p className="font-label-md text-label-md text-on-surface font-semibold">
              12 Semanas = 1 Ano
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
