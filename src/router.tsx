import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CockpitDailyView } from './components/CockpitDailyView';
import { ScorecardWamView } from './components/ScorecardWamView';
import { StrategicPlanningView } from './components/StrategicPlanningView';
import { VisionView } from './components/VisionView';
import { CycleMapView } from './components/CycleMapView';
import { CycleClosureView } from './components/CycleClosureView';
import { NewCycleWizard } from './components/NewCycleWizard';
import { LoginPage } from './pages/LoginPage';
import { PrivateRoute } from './components/PrivateRoute';
import { VisionModal } from './components/VisionModal';
import { EditVisionModal } from './components/EditVisionModal';
import { NewTacticModal } from './components/NewTacticModal';
import { GovernanceModal } from './components/GovernanceModal';

/**
 * Layout principal autenticado contendo Sidebar desktop, Header com dados do ciclo,
 * conteúdo da rota ativa (<Outlet />) e barra inferior mobile.
 */
export const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isTodayActive =
    location.pathname === '/hoje' ||
    location.pathname === '/progresso-diario' ||
    location.pathname === '/';

  const isWamActive = location.pathname === '/placar-wam';

  const isStrategyActive =
    location.pathname === '/planejamento' ||
    location.pathname === '/mapa' ||
    location.pathname === '/mapa-ciclo' ||
    location.pathname === '/visao';

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Container */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        <Header />
        <main className="flex-1 w-full pt-20 px-gutter min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Companion Mobile ~390px) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-surface-container flex items-center justify-around z-40 lg:hidden px-space-sm shadow-card">
        <button
          onClick={() => navigate('/hoje')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            isTodayActive ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">view_agenda</span>
          <span className="text-[11px]">Hoje</span>
        </button>

        <button
          onClick={() => navigate('/placar-wam')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            isWamActive ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">monitoring</span>
          <span className="text-[11px]">Resultado Semanal</span>
        </button>

        <button
          onClick={() => navigate('/planejamento')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg ${
            isStrategyActive ? 'text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">flag</span>
          <span className="text-[11px]">Estratégia</span>
        </button>
      </nav>

      {/* Global Modals */}
      <VisionModal />
      <EditVisionModal />
      <NewTacticModal />
      <GovernanceModal />
    </div>
  );
};

/**
 * Definição centralizada de todas as rotas com autenticação e rotas públicas/privadas
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rota Pública de Autenticação */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas Protegidas por Autenticação */}
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Rota Raiz */}
        <Route path="/" element={<Navigate to="/hoje" replace />} />

        {/* Rotas Principais */}
        <Route path="/hoje" element={<CockpitDailyView />} />
        <Route path="/progresso-diario" element={<Navigate to="/hoje" replace />} />
        <Route path="/placar-wam" element={<ScorecardWamView />} />
        <Route path="/planejamento" element={<StrategicPlanningView />} />
        <Route path="/visao" element={<VisionView />} />
        <Route path="/mapa" element={<CycleMapView />} />
        <Route path="/mapa-ciclo" element={<Navigate to="/mapa" replace />} />

        {/* Rotas de Ciclo de Vida */}
        <Route path="/fechamento-ciclo" element={<CycleClosureView />} />
        <Route path="/novo-ciclo" element={<NewCycleWizard />} />
        <Route path="/novo-ciclo-wizard" element={<Navigate to="/novo-ciclo" replace />} />

        {/* Fallback de 404 */}
        <Route path="*" element={<Navigate to="/hoje" replace />} />
      </Route>
    </Routes>
  );
};
