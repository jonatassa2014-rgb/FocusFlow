import React, { useState, useEffect } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';

interface EditVisionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialField?: 'longo-prazo' | 'ciclo' | 'emocional';
}

export const EditVisionModal: React.FC<EditVisionModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose
}) => {
  const {
    vision,
    updateVision,
    isEditVisionOpen,
    setIsEditVisionOpen
  } = useFocusFlow();

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isEditVisionOpen;
  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    } else {
      setIsEditVisionOpen(false);
    }
  };

  const [longTermVision, setLongTermVision] = useState('');
  const [cycleVision, setCycleVision] = useState('');
  const [emotionalWhy, setEmotionalWhy] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLongTermVision(vision.longTermVision || vision.threeToFiveYearDeclaration || '');
      setCycleVision(vision.cycleVision || '');
      setEmotionalWhy(vision.emotionalWhy || '');
      setErrorMessage('');
    }
  }, [isOpen, vision]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!longTermVision.trim() && !cycleVision.trim() && !emotionalWhy.trim()) {
      setErrorMessage('Preencha ao menos um dos campos da visão para salvar.');
      return;
    }

    updateVision({
      longTermVision: longTermVision.trim(),
      threeToFiveYearDeclaration: longTermVision.trim(),
      cycleVision: cycleVision.trim(),
      emotionalWhy: emotionalWhy.trim(),
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-2xl w-full p-space-xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal: 1. Nome 'Visão do Ciclo' */}
        <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">event_repeat</span>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-on-surface">
                Visão do Ciclo
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Fundação Emocional • The 12 Week Year
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1">
          {/* 3. Caixa 1: VISÃO DE LONGO PRAZO */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              VISÃO DE LONGO PRAZO
            </label>
            <textarea
              rows={3}
              value={longTermVision}
              onChange={(e) => setLongTermVision(e.target.value)}
              placeholder="Descreva onde você e seus projetos estarão em 3 a 5 anos..."
              className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary leading-relaxed resize-none"
            />
            <span className="text-[11px] text-on-surface-variant/80 mt-1 block">
              Visão macro conectada aos seus valores e aspirações de longo prazo (3 a 5 anos).
            </span>
          </div>

          {/* 3. Caixa 2: VISÃO DO CICLO */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              VISÃO DO CICLO
            </label>
            <textarea
              rows={3}
              value={cycleVision}
              onChange={(e) => setCycleVision(e.target.value)}
              placeholder="Descreva a visão para o fechamento deste ciclo de 12 semanas..."
              className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary leading-relaxed resize-none"
            />
            <span className="text-[11px] text-on-surface-variant/80 mt-1 block">
              Visão tática e inspiradora conectada à linha de chegada das próximas 12 semanas.
            </span>
          </div>

          {/* 3. Caixa 3: PORQUÊ EMOCIONAL */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              PORQUÊ EMOCIONAL
            </label>
            <textarea
              rows={3}
              value={emotionalWhy}
              onChange={(e) => setEmotionalWhy(e.target.value)}
              placeholder="A razão inegociável que faz você manter o foco e acordar disciplinado todos os dias..."
              className="w-full bg-surface-container-low rounded-lg p-2.5 text-[14px] text-on-surface border border-surface-container focus:outline-none focus:border-primary italic resize-none leading-relaxed"
            />
            <span className="text-[11px] text-on-surface-variant/80 mt-1 block">
              Âncora emocional profunda que supera a procrastinação diária.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container/60 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-space-md py-2.5 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-[13px] font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Salvar Visão</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
