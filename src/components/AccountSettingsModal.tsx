import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { useAuth } from '../context/AuthContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { cycle, updateCycle, notifications } = useFocusFlow();
  const [partnerName, setPartnerName] = useState(cycle.partnerName);

  if (!isOpen) return null;

  const handleSavePartner = () => {
    updateCycle({ partnerName });
  };

  const enableNotifications = async () => {
    const granted = await notifications.requestPermission();
    if (granted) {
      alert('Notificações ativadas com sucesso!');
    } else {
      alert('Permissão de notificações negada pelo navegador.');
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cycle));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `focusflow_export_${cycle.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between shrink-0 bg-surface-container-low">
          <div className="flex flex-col">
            <h2 className="font-title-lg text-title-lg text-on-surface font-bold">Configurações da Conta</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Preferências de ciclo, notificações e parceiro WAM</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <section className="space-y-4">
            <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              Parceiro de Responsabilidade (WAM)
            </h3>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1">Nome do Parceiro</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-container rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Nome do seu parceiro WAM"
                />
              </div>
              <button 
                onClick={handleSavePartner}
                className="px-4 py-2.5 bg-primary text-on-primary rounded-lg font-label-md font-semibold hover:bg-primary/90 transition-colors"
              >
                Salvar Parceiro
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Seu parceiro é a pessoa com quem você faz a reunião de 15 min toda sexta-feira para homologar o WAM.
            </p>
          </section>

          <hr className="border-surface-container" />

          <section className="space-y-4">
            <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
              Notificações e Ritos
            </h3>
            
            <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-on-surface font-semibold">Status das Notificações</span>
                <span className={`font-label-sm px-2 py-1 rounded-full font-bold ${notifications.permission === 'granted' ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'}`}>
                  {notifications.permission === 'granted' ? 'Ativadas' : notifications.permission === 'denied' ? 'Bloqueadas' : 'Desativadas'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[70%]">
                  Receba alertas para o Ritual Matinal diário (07:00) e para o Fechamento Semanal (Sexta, 16:00).
                </p>
                <button
                  onClick={enableNotifications}
                  disabled={notifications.permission === 'granted'}
                  className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-md font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ativar
                </button>
              </div>
            </div>
          </section>

          <hr className="border-surface-container" />

          <section className="space-y-4">
            <h3 className="font-title-md text-title-md font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">database</span>
              Exportação de Dados
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Baixe um backup local (.json) contendo as informações do ciclo atual, metas e configurações.
            </p>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 border border-surface-container rounded-lg font-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportar JSON
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};
