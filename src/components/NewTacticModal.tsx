import React, { useState, useMemo } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { validateLeadIndicator, calculateDurationMinutes, formatDurationLabel, DAYS_OF_WEEK_CONFIG } from '../utils/rules';
import { DayOfWeekKey } from '../types';

export const NewTacticModal: React.FC = () => {
  const { isNewTacticModalOpen, setIsNewTacticModalOpen, goals, addTactic, tactics, governanceSettings } = useFocusFlow();

  const [goalId, setGoalId] = useState(goals[0]?.id || 'g1');
  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeekKey[]>(['ter']); // Terça-feira selecionada por padrão
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [warnOnCalendarConflict, setWarnOnCalendarConflict] = useState(governanceSettings.warnGoogleCalendarConflicts);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle dia da semana
  const toggleDay = (dayKey: DayOfWeekKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
    if (errorMessage) setErrorMessage(null);
  };

  // Cálculo reativo da duração com base no horário de início e fim
  const calculatedDuration = useMemo(() => {
    if (startTime && endTime) {
      return calculateDurationMinutes(startTime, endTime);
    }
    return 0;
  }, [startTime, endTime]);

  // Lista de eventos simulados sincronizados do Google Agenda
  const googleCalendarEvents = useMemo(() => [
    { title: 'Alinhamento Semanal com Diretoria', days: ['seg', 'qua'], start: '10:00', end: '11:00' },
    { title: 'Reunião de Operações & Clientes Corporativos', days: ['ter', 'qui'], start: '11:30', end: '12:30' },
    { title: 'Sincronização de Roadmap & Produto', days: ['sex'], start: '15:00', end: '16:00' }
  ], []);

  // Detecção de conflito com o Google Agenda ou outros blocos alocados
  const calendarConflict = useMemo(() => {
    if (!startTime || !endTime || !warnOnCalendarConflict) return null;

    // 1. Conflito com Google Agenda
    for (const evt of googleCalendarEvents) {
      const dayOverlap = selectedDays.some((d) => evt.days.includes(d));
      if (dayOverlap) {
        if (startTime < evt.end && endTime > evt.start) {
          return {
            type: 'google-calendar',
            title: evt.title,
            interval: `${evt.start} — ${evt.end}`
          };
        }
      }
    }

    // 2. Conflito com outra tática na timeline
    for (const t of tactics) {
      if (t.startTime && t.endTime) {
        const dayOverlap = selectedDays.some((d) => t.daysOfWeek.includes(d));
        if (dayOverlap) {
          if (startTime < t.endTime && endTime > t.startTime) {
            return {
              type: 'tactic',
              title: t.title,
              interval: `${t.startTime} — ${t.endTime}`
            };
          }
        }
      }
    }

    return null;
  }, [startTime, endTime, selectedDays, warnOnCalendarConflict, googleCalendarEvents, tactics]);

  // BR-03 revisada: Detecção de Lag Indicator como aviso informativo
  const lagWarning = useMemo(() => {
    if (!title.trim()) return false;
    const validation = validateLeadIndicator(title);
    return !validation.isValid;
  }, [title]);

  if (!isNewTacticModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor, informe a descrição da tática semanal.');
      return;
    }

    // Validação 2: Pelo menos um dia da semana deve ser selecionado (Obrigatório)
    if (selectedDays.length === 0) {
      setErrorMessage('Selecione pelo menos um dia da semana para realizar a tática.');
      return;
    }

    // Validação 3: Se houver horário preenchido, validar término > início
    if ((startTime && !endTime) || (!startTime && endTime)) {
      setErrorMessage('Para definir o horário estimado, preencha tanto o início quanto o término.');
      return;
    }

    if (startTime && endTime) {
      if (calculatedDuration <= 0) {
        setErrorMessage('O horário de término deve ser posterior ao horário de início.');
        return;
      }
    }

    const result = addTactic({
      goalId,
      title: title.trim(),
      daysOfWeek: selectedDays,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    });

    if (!result.success) {
      setErrorMessage(result.message || 'Erro ao cadastrar tática.');
      return;
    }

    // Limpeza de estado e fechamento
    setTitle('');
    setSelectedDays(['ter']);
    setStartTime('');
    setEndTime('');
    setErrorMessage(null);
    setIsNewTacticModalOpen(false);
  };

  // Nomes legíveis dos dias selecionados
  const selectedDaysSummary = DAYS_OF_WEEK_CONFIG
    .filter((d) => selectedDays.includes(d.key))
    .map((d) => d.fullName)
    .join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-xl w-full p-space-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">add_task</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Nova Tática Lead Semanal
              </h2>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                BR-03: Princípio Causal (100% sob seu controle)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsNewTacticModalOpen(false);
              setErrorMessage(null);
            }}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Validation Warning Alert */}
        {errorMessage && (
          <div className="mb-space-md p-space-md rounded-xl bg-error-container/40 border border-error/30 text-error flex items-start gap-2 animate-in fade-in duration-150">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <div className="text-body-sm font-medium leading-relaxed">
              <strong className="block font-semibold">Atenção ao preenchimento:</strong>
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-space-md">
          {/* 1. Goal Select */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
              Meta Trimestral Vinculada
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-body-md focus:outline-none focus:border-primary"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  Meta {g.number}: {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Title / Action (Lead Indicator) */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
              Ação Tática (Ação Causal — Ex: "Fazer 15 cold calls", nunca "Fechar 2 vendas")
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Ex: Entrevistar 5 usuários do perfil B2B para validação do protótipo"
              className="w-full px-space-md py-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-body-md focus:outline-none focus:border-primary resize-none"
            />
            {lagWarning && (
              <p className="text-amber-600 text-sm mt-1.5">
                ⚠️ Esta tática parece um Lag Indicator. Reformule para uma ação sob
                seu controle — mas você pode salvar assim mesmo se preferir.
              </p>
            )}
          </div>

          {/* 3. Seleção de dias da semana (Múltipla Seleção — Chips/Toggle D, S, T, Q, Q, S, S) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-label-md text-label-md text-on-surface font-semibold">
                Dias da semana <span className="text-primary">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Selecione um ou mais dias
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK_CONFIG.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    title={day.fullName}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center font-label-md transition-all ${
                      isSelected
                        ? 'bg-primary-container text-on-primary font-bold shadow-sm ring-2 ring-primary/20 scale-[1.02]'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-surface-container font-semibold'
                    }`}
                  >
                    <span className="text-[14px] leading-none">{day.label}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                      {day.shortName}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedDays.length > 0 ? (
              <p className="font-body-sm text-[12px] text-primary font-medium mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                <span>Programado para: {selectedDaysSummary}</span>
              </p>
            ) : (
              <p className="font-body-sm text-[12px] text-error mt-1.5">
                * Pelo menos um dia da semana deve ser selecionado.
              </p>
            )}
          </div>

          {/* 4. Horário estimado (bloco de tempo) — Seção Opcional com cálculo de duração e aviso de conflito */}
          <div className="pt-space-xs border-t border-surface-container/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                  <span>Horário estimado</span>
                </label>
                <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>

              {(startTime || endTime) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartTime('');
                    setEndTime('');
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="text-[12px] text-primary hover:underline font-medium"
                >
                  Limpar horário
                </button>
              )}
            </div>

            <p className="font-body-sm text-[12px] text-on-surface-variant mb-2">
              Se informado, a tática será inserida automaticamente na timeline de blocos de tempo nos dias selecionados. Caso contrário, constará apenas na lista do dia.
            </p>

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <label className="block text-[12px] text-on-surface-variant mb-1 font-medium">
                  Horário de início
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-mono text-body-md focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] text-on-surface-variant mb-1 font-medium">
                  Horário de término
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-surface-container text-on-surface font-mono text-body-md focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Opção de aviso quando conflitar com Google Agenda */}
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container/60">
              <input
                type="checkbox"
                id="warnCalendarToggle"
                checked={warnOnCalendarConflict}
                onChange={(e) => setWarnOnCalendarConflict(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="warnCalendarToggle" className="text-[12px] text-on-surface font-medium cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-500">notification_important</span>
                <span>Avisar quando conflitar com horários do Google Agenda</span>
              </label>
            </div>

            {/* Exibição automática do cálculo da duração estimada */}
            {startTime && endTime && calculatedDuration > 0 && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between text-body-sm">
                <div className="flex items-center gap-1.5 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                  <span>Duração calculada: {formatDurationLabel(calculatedDuration)} ({calculatedDuration} min)</span>
                </div>
                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                  Timeline Ativada
                </span>
              </div>
            )}

            {/* Card de Aviso quando conflitar com horários do Google Agenda */}
            {calendarConflict && (
              <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-body-sm flex items-start gap-2.5 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">warning</span>
                <div className="flex-1">
                  <div className="font-semibold text-[13px] flex items-center gap-1.5 text-amber-950">
                    <span>Aviso de Conflito com Google Agenda</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                      Detectado
                    </span>
                  </div>
                  <p className="text-[12px] text-amber-900/90 mt-0.5 leading-snug">
                    Existe um compromisso existente: <strong>"{calendarConflict.title}" ({calendarConflict.interval})</strong> no Google Agenda nos dias selecionados. A política de blindagem poderá sobrepor ou rejeitar esse evento.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container/60 mt-space-lg">
            <button
              type="button"
              onClick={() => {
                setIsNewTacticModalOpen(false);
                setErrorMessage(null);
              }}
              className="px-space-md py-2.5 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-space-lg py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-lg font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Cadastrar Tática</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
