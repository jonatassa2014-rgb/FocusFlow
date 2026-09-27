import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { Goal } from '../types';

export const CycleMapView: React.FC = () => {
  const {
    goals,
    updateGoal,
    deleteGoal,
    addGoal,
    cycle,
    isNewGoalModalOpen,
    setIsNewGoalModalOpen,
    setIsNewTacticModalOpen
  } = useFocusFlow();

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
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
      // Editando meta existente
      updateGoal(editingGoal.id, {
        title,
        description,
        targetMetric,
      });
    } else {
      // Cadastrando nova meta
      const res = addGoal({
        title,
        description,
        targetMetric,
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
      {/* Header & Page Action Bar */}
      <header className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-label-sm font-bold uppercase tracking-wider">
              Metodologia The 12 Week Year
            </span>
            <span className="text-on-surface-variant font-label-sm">• Brian P. Moran</span>
            <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-label-sm font-semibold">
              {goals.length} {goals.length === 1 ? 'Meta Cadastrada' : 'Metas Cadastradas'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Planejamento do Ciclo: Cadastro e Gestão de Metas ({cycle.name})
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Defina e gerencie suas até 3 metas estratégicas trimestrais (Lag Indicators), que serão desdobradas em táticas de execução diárias.
          </p>
        </div>

        {/* Botão de Ação Primário no Cabeçalho */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="px-3 py-2 rounded-lg bg-surface-container font-label-md font-semibold text-primary">
            Semana {cycle.currentWeek} de 12 (Ativa)
          </span>

          <button
            onClick={openNewGoalModal}
            className="flex items-center gap-2 px-space-lg py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-lg font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Cadastrar Nova Meta</span>
          </button>
        </div>
      </header>

      {/* Regra de Ouro Moran Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-high/60 p-space-md shadow-sm border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h3 className="font-label-lg font-bold text-on-surface">
              Princípio Causal: Metas (Lag) vs. Táticas (Lead)
            </h3>
            <p className="font-body-sm text-on-surface-variant">
              As <strong>Metas</strong> definem onde você quer chegar no final das 12 semanas (Lag Indicator). As <strong>Táticas</strong> são as ações semanais 100% controláveis por você (Lead Indicators) para garantir que essas metas sejam alcançadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-surface-container-lowest font-label-sm font-bold text-primary border border-surface-container">
            {goals.length} de 3 Metas Ativas
          </span>
        </div>
      </div>

      {/* 3 Goals Showcase Grid */}
      <section className="space-y-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-md rounded-xl border border-surface-container/60 shadow-sm">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Metas do Ciclo de 12 Semanas
            </h2>
            <p className="font-body-sm text-on-surface-variant">
              {goals.length === 3 ? 'Capacidade máxima preenchida (3 de 3 metas)' : `${3 - goals.length} slot(s) de meta livre(s)`}
            </p>
          </div>

          <button
            onClick={openNewGoalModal}
            className="flex items-center gap-1.5 px-space-md py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md font-semibold transition-all shadow-sm self-start sm:self-auto"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Cadastrar Nova Meta</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm font-bold">
                    Meta 0{goal.number}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(goal)}
                      title="Editar esta meta"
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      title="Excluir esta meta"
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="font-headline-sm text-[18px] text-on-surface font-bold mb-2 leading-snug">
                  {goal.title}
                </h3>
                <p className="font-body-sm text-on-surface-variant mb-space-md leading-relaxed">
                  {goal.description}
                </p>

                <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container text-body-sm mb-space-sm">
                  <span className="font-semibold block text-on-surface text-[11px] uppercase tracking-wide text-primary">
                    Indicador Lag (Métrica de Sucesso Final)
                  </span>
                  <span className="text-on-surface font-semibold text-sm">{goal.targetMetric}</span>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-surface-container/60">
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Meta</span>
                  </button>
                  <button
                    onClick={() => setIsNewTacticModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-primary-container/10 hover:bg-primary-container hover:text-on-primary text-xs font-semibold text-primary transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>+ Tática</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Slot de Meta Livre (se houver menos de 3) */}
          {goals.length < 3 && (
            <div className="relative bg-surface-container-low/60 hover:bg-surface-container-low rounded-xl p-space-lg shadow-sm transition-all flex flex-col justify-between border-2 border-dashed border-outline-variant/60">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-bold">
                    Slot de Meta 0{goals.length + 1} Disponível
                  </span>
                  <span className="material-symbols-outlined text-outline">add_circle_outline</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-space-md tracking-tight">
                  Cadastrar Meta 0{goals.length + 1}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
                  Defina o resultado crítico (Lag) que você quer comemorar na 13ª semana deste ciclo.
                </p>
              </div>

              <button
                onClick={openNewGoalModal}
                className="mt-space-lg w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Cadastrar Meta 0{goals.length + 1}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 13th Week Rules Banner (BR-05) */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-space-xl text-white shadow-card">
        <div className="flex items-center gap-space-md mb-space-sm">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-primary-light">lock_clock</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold">
              BR-05: Imutabilidade Histórica & 13ª Semana
            </h3>
            <span className="font-label-sm text-indigo-300">
              Auditoria de Lag Indicators, Retrospectiva e Wizard do Ciclo N+1
            </span>
          </div>
        </div>

        <p className="font-body-md text-slate-300 max-w-3xl leading-relaxed">
          Na metodologia The 12 Week Year, cada ciclo é travado em 12 semanas ativas. Ao término da 12ª semana, o ciclo é permanentemente selado. A 13ª semana é sagrada: nela não há novas táticas ativas, permitindo avaliar os resultados concretos (Lag), celebrar vitórias e parametrizar o novo ciclo sem acúmulo de débito operacional.
        </p>
      </section>

      {/* Modal de Cadastro / Edição de Meta */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-xl w-full p-space-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">flag</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {editingGoal
                      ? `Editar Meta 0${editingGoal.number}`
                      : `Cadastrar Meta 0${goals.length + 1}`}
                  </h2>
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    Regra de Brian Moran: Resultado Final Desejado (Lag Indicator)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
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
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aumentar receita recorrente (MRR) em 25%"
                  className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-on-surface border border-surface-container focus:outline-none focus:border-primary font-semibold"
                  required
                />
              </div>


              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Indicador Lag (Métrica de Sucesso Concreta) *
                </label>
                <input
                  type="text"
                  value={targetMetric}
                  onChange={(e) => setTargetMetric(e.target.value)}
                  placeholder="Ex: +R$ 45.000 / mês ou 500 clientes ativos"
                  className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-on-surface border border-surface-container focus:outline-none focus:border-primary"
                  required
                />
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Metas medem o resultado final (Lag). As ações diárias controláveis para atingi-las são as Táticas (Lead).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Descrição Estratégica
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve contextualização do porquê esta meta é indispensável no ciclo..."
                  className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-on-surface border border-surface-container focus:outline-none focus:border-primary leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container/60">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-space-md py-2.5 rounded-lg font-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md font-semibold shadow-sm transition-all cursor-pointer"
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
