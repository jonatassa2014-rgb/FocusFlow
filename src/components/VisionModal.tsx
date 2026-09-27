import React, { useState, useEffect } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';

export const VisionModal: React.FC = () => {
  const { vision, markVisionAsReadToday, isVisionModalOpen, setIsVisionModalOpen } = useFocusFlow();
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2 minutos

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isVisionModalOpen && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisionModalOpen, secondsRemaining]);

  if (!isVisionModalOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-modal border border-surface-container max-w-2xl w-full p-space-xl relative overflow-hidden">
        {/* Top Ribbon */}
        <div className="flex items-center justify-between pb-space-md border-b border-surface-container/60 mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Cartão de Bolso da Visão
              </h2>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                BR-04: Ritual Matinal Obrigatório (The 12 Week Year)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsVisionModalOpen(false)}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Vision Content */}
        <div className="space-y-space-md mb-space-lg">
          <div className="p-space-lg rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20">
            <span className="font-label-sm uppercase tracking-wider text-primary font-bold block mb-1">
              Visão de Longo Prazo
            </span>
            <p className="font-headline-sm text-primary-dark font-bold leading-snug mb-2">
              "{vision.headline}"
            </p>
            <p className="font-body-lg text-on-surface font-medium leading-relaxed">
              {vision.longTermVision || vision.threeToFiveYearDeclaration}
            </p>
          </div>

          {vision.cycleVision && (
            <div className="p-space-md rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-1.5 mb-1 text-primary font-label-md font-bold">
                <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                <span>Visão do Ciclo (12 Semanas)</span>
              </div>
              <p className="font-body-md text-on-surface font-medium leading-relaxed">
                "{vision.cycleVision}"
              </p>
            </div>
          )}

          <div className="p-space-md rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-label-md font-bold">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>Porquê Emocional Profundo (Emotional Why)</span>
            </div>
            <p className="font-body-md text-amber-950 italic">
              "{vision.emotionalWhy}"
            </p>
          </div>
        </div>

        {/* Timer & Confirm Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-surface-container/60">
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <span className="font-mono text-body-md font-semibold">
              Tempo de reflexão: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <button
              onClick={() => setIsVisionModalOpen(false)}
              className="px-space-md py-2.5 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container transition-colors flex-1 sm:flex-none text-center"
            >
              Fechar
            </button>
            <button
              onClick={markVisionAsReadToday}
              className="flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg font-semibold shadow-sm transition-all flex-1 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Lido e Ancorado Hoje ✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
