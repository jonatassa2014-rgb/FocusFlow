import React from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';

export const GovernanceModal: React.FC = () => {
  const { isGovernanceModalOpen, setIsGovernanceModalOpen, cycle, governanceSettings, setGovernanceSettings } = useFocusFlow();

  if (!isGovernanceModalOpen) return null;

  const handleToggle = (key: keyof typeof governanceSettings) => {
    setGovernanceSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-xl w-full p-space-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">shield</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Governança & Blindagem de Blocos
              </h2>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                BR-02: Blindagem Inegociável de Tempo
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsGovernanceModalOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Sync Controls */}
        <div className="space-y-space-md mb-space-lg">
          {/* 1. Google Calendar / Outlook Sync */}
          <div
            onClick={() => handleToggle('googleCalendarSync')}
            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container hover:border-primary/40 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[28px] text-blue-600">calendar_month</span>
              <div>
                <span className="font-label-md text-on-surface font-semibold block">
                  Google Calendar / Outlook Sync
                </span>
                <span className="font-body-sm text-on-surface-variant text-[13px]">
                  Reserva automática dos blocos Estratégico (3h), Buffer (1h) e Breakout (3h).
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={governanceSettings.googleCalendarSync}
              onChange={() => {}}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>

          {/* 2. Slack & Teams DND Ativo */}
          <div
            onClick={() => handleToggle('slackDndSync')}
            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container hover:border-primary/40 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[28px] text-purple-600">notifications_off</span>
              <div>
                <span className="font-label-md text-on-surface font-semibold block">
                  Slack & Teams DND Ativo
                </span>
                <span className="font-body-sm text-on-surface-variant text-[13px]">
                  Ativa status 'Não Perturbe' e silencia notificações durante o Bloco Estratégico.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={governanceSettings.slackDndSync}
              onChange={() => {}}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>

          {/* 3. Rejeição Automática de Reuniões Conflitantes */}
          <div
            onClick={() => handleToggle('rejectConflicts')}
            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container hover:border-primary/40 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[28px] text-red-600">block</span>
              <div>
                <span className="font-label-md text-on-surface font-semibold block">
                  Rejeição Automática de Reuniões Conflitantes
                </span>
                <span className="font-body-sm text-on-surface-variant text-[13px]">
                  Rejeita convites corporativos que colidam com seus blocos blindados.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={governanceSettings.rejectConflicts}
              onChange={() => {}}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>

          {/* 4. NOVA OPÇÃO: Aviso quando conflitar com horários do Google Agenda */}
          <div
            onClick={() => handleToggle('warnGoogleCalendarConflicts')}
            className="p-space-md rounded-xl bg-surface-container-low border border-surface-container hover:border-amber-400 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[28px] text-amber-500">notification_important</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-on-surface font-semibold block">
                    Aviso de Conflito com Google Agenda
                  </span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Novo
                  </span>
                </div>
                <span className="font-body-sm text-on-surface-variant text-[13px]">
                  Exibe alerta e notificação imediata quando uma tática ou bloco colidir com eventos existentes na sua agenda.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={governanceSettings.warnGoogleCalendarConflicts}
              onChange={() => {}}
              className="w-5 h-5 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* WAM Partner Info (BR-06) */}
          <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="font-label-sm uppercase tracking-wider text-primary font-bold text-[11px]">
                Parceiro de Responsabilidade (BR-06)
              </span>
              <span className="font-label-sm px-2.5 py-0.5 rounded bg-primary text-white font-bold text-[12px]">
                Score: {cycle.partnerWamScore}%
              </span>
            </div>
            <p className="font-label-md text-on-surface font-semibold">
              {cycle.partnerName} ({cycle.partnerName.toLowerCase().replace(' ', '.')}@focusflow.io)
            </p>
            <p className="font-body-sm text-on-surface-variant text-[12px] mt-0.5">
              Sessão semanal de 15 minutos agendada para toda sexta-feira às 17:00 para dupla homologação do WAM.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-space-md border-t border-surface-container/60">
          <button
            onClick={() => setIsGovernanceModalOpen(false)}
            className="px-space-lg py-2.5 bg-primary-container hover:bg-primary-dark text-on-primary font-label-lg font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
