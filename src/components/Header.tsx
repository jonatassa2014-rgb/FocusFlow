import React, { useState } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';
import { useAuth } from '../context/AuthContext';
import { AccountSettingsModal } from './AccountSettingsModal';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    cycle,
    wamMetrics,
    setActiveTab,
    setIsVisionModalOpen,
    setIsNewTacticModalOpen,
    setIsNewGoalModalOpen,
    setIsGovernanceModalOpen
  } = useFocusFlow();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-gutter border-b border-surface-container/60">
      {/* Cycle Progress & WAM Badge */}
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            {cycle.name} • Semana {cycle.currentWeek} de 12 (Dia {cycle.currentDay})
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-space-xs w-36 bg-surface-container-highest rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-container h-full transition-all duration-500"
            style={{ width: `${Math.round((cycle.currentWeek / 12) * 100)}%` }}
          />
        </div>
        <span className="hidden xl:inline-block font-label-sm text-label-sm text-on-surface-variant font-medium">
          {Math.round((cycle.currentWeek / 12) * 100)}% do Ciclo
        </span>

        {/* WAM Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest shadow-card border border-surface-container/40">
          <span
            className={`w-2 h-2 rounded-full ${
              wamMetrics.status === 'gold'
                ? 'bg-wam-gold'
                : wamMetrics.status === 'alert'
                ? 'bg-wam-alert'
                : 'bg-wam-risk'
            }`}
          />
          <span
            className={`font-label-sm text-label-sm font-bold ${
              wamMetrics.status === 'gold'
                ? 'text-wam-gold'
                : wamMetrics.status === 'alert'
                ? 'text-wam-alert'
                : 'text-wam-risk'
            }`}
          >
            {wamMetrics.score}% WAM • {wamMetrics.statusLabel.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-space-md">
        {/* BR-04: Pocket Card Vision Ritual Button */}
        <button
          onClick={() => setIsVisionModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-lg text-label-lg transition-colors border border-surface-container-highest"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
          <span>Cartão de Bolso da Visão</span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-label-sm text-label-sm text-primary font-bold ml-1">
            2 min
          </span>
        </button>

        {/* + Nova Meta */}
        <button
          onClick={() => {
            setActiveTab('planejamento');
            setIsNewGoalModalOpen(true);
          }}
          className="hidden md:flex items-center gap-1.5 px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-label-lg text-label-lg transition-all border border-primary/20 hover:border-primary/40 font-semibold"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">flag</span>
          <span>+ Nova Meta</span>
        </button>

        {/* + Nova Tática */}
        <button
          onClick={() => setIsNewTacticModalOpen(true)}
          className="flex items-center gap-1 px-space-md py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-lg text-label-lg transition-all shadow-sm font-semibold"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>+ Nova Tática</span>
        </button>

        {/* User Profile & Focus Mode */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-space-sm p-1.5 rounded-lg hover:bg-surface-container transition-colors text-left"
            type="button"
          >
            <div className="relative">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-surface-container"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'FF'}
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest animate-pulse"
                title="Modo Foco Sincronizado"
              />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-none">
                  {user?.name || 'Alexandre Costa'}
                </span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold leading-tight">
                  Performer
                </span>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface-variant leading-none mt-1 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Modo Foco Sincronizado
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-modal p-space-xs flex flex-col z-50 border border-surface-container animate-in fade-in zoom-in-95 duration-150">
              <div className="px-space-md py-space-xs bg-surface-container-low rounded-lg mb-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Parceiro WAM
                  </span>
                  <span className="font-label-sm text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">
                    WAM {cycle.partnerWamScore}%
                  </span>
                </div>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {cycle.partnerName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setIsGovernanceModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-space-md py-space-sm rounded-lg font-label-md text-label-md text-primary bg-primary/5 hover:bg-primary/10 transition-colors font-semibold text-left mb-1"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
                  <span>Governança & Integrações</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </button>

              {/* Botão Configurações da Conta */}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setIsAccountSettingsOpen(true);
                }}
                className="w-full flex items-center gap-2 px-space-md py-space-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors font-semibold text-left cursor-pointer mb-1"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                <span>Configurações da Conta</span>
              </button>

              {/* Botão Sair da Conta */}
              <button
                type="button"
                onClick={async () => {
                  setProfileOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-2 px-space-md py-space-sm rounded-lg font-label-md text-label-md text-red-600 hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Sair da Conta</span>
              </button>

              <div className="h-px bg-surface-container my-1" />

              <div className="px-space-md py-1.5 text-on-surface-variant text-[12px]">
                {user?.email || 'FocusFlow v2.6.0 • The 12 Week Year'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings Modal */}
      <AccountSettingsModal 
        isOpen={isAccountSettingsOpen} 
        onClose={() => setIsAccountSettingsOpen(false)} 
      />
    </header>
  );
};
