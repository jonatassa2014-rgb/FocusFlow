import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Goal, Tactic, Cycle, VisionStatement, TimeBlockTimerState, DayOfWeekKey, WamWeekRecord, CycleArchiveRecord, LagAuditEntry } from '../types';
import { calculateWAM, validateLeadIndicator, calculateDurationMinutes, inferBlockTypeFromDuration, DAYS_OF_WEEK_CONFIG } from '../utils/rules';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

import { cyclesService } from '../services/cycles.service';
import { goalsService } from '../services/goals.service';
import { tacticsService } from '../services/tactics.service';
import { executionsService } from '../services/executions.service';
import { visionService } from '../services/vision.service';
import { wamService } from '../services/wam.service';

import { useNotifications } from '../hooks/useNotifications';

interface FocusFlowContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  goals: Goal[];
  tactics: Tactic[];
  toggleTactic: (id: string) => void;
  addTactic: (tactic: {
    goalId: string;
    title: string;
    daysOfWeek: DayOfWeekKey[];
    startTime?: string;
    endTime?: string;
  }) => { success: boolean; message?: string };
  cycle: Cycle;
  vision: VisionStatement;
  updateVision: (updated: Partial<VisionStatement>) => void;
  updateGoal: (id: string, updated: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addGoal: (goal: {
    title: string;
    description: string;
    category?: string;
    targetMetric: string;
  }) => { success: boolean; message?: string };
  markVisionAsReadToday: () => void;
  timer: TimeBlockTimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  completeTimer: () => void;
  resetTimer: (type?: 'strategic' | 'buffer' | 'breakout') => void;
  isVisionModalOpen: boolean;
  setIsVisionModalOpen: (open: boolean) => void;
  isEditVisionOpen: boolean;
  setIsEditVisionOpen: (open: boolean) => void;
  editVisionTab: 'longo-prazo' | 'ciclo';
  setEditVisionTab: (tab: 'longo-prazo' | 'ciclo') => void;
  editVisionMode: 'cadastrar' | 'editar';
  setEditVisionMode: (mode: 'cadastrar' | 'editar') => void;
  openEditVision: (tab?: 'longo-prazo' | 'ciclo', mode?: 'cadastrar' | 'editar') => void;
  isNewTacticModalOpen: boolean;
  setIsNewTacticModalOpen: (open: boolean) => void;
  isNewGoalModalOpen: boolean;
  setIsNewGoalModalOpen: (open: boolean) => void;
  isGovernanceModalOpen: boolean;
  setIsGovernanceModalOpen: (open: boolean) => void;
  governanceSettings: GovernanceSettings;
  setGovernanceSettings: React.Dispatch<React.SetStateAction<GovernanceSettings>>;
  wamMetrics: ReturnType<typeof calculateWAM>;
  wamHistory: WamWeekRecord[];
  sealWeek: (deviationNotes?: string) => { success: boolean; message?: string };
  homologateWeek: (week: number) => void;
  updateCycle: (updated: Partial<Cycle>) => void;
  cycleHistory: CycleArchiveRecord[];
  sealCycle: (data: {
    lagAudit: LagAuditEntry[];
    retrospective: { whatWorked: string; whatFailed: string; mainInsight: string };
  }) => { success: boolean; message?: string };
  openNewCycle: (data: {
    name: string;
    startDate: string;
    endDate: string;
    importedGoals: Goal[];
    cycleVision: string;
    partnerName: string;
  }) => void;
  notifications: {
    permission: NotificationPermission;
    requestPermission: () => Promise<boolean>;
  };
}

export interface GovernanceSettings {
  googleCalendarSync: boolean;
  slackDndSync: boolean;
  rejectConflicts: boolean;
  warnGoogleCalendarConflicts: boolean;
}

const DEFAULT_CYCLE: Cycle = {
  id: 'c1',
  number: 1,
  name: 'Ciclo 01 • Q1 Execution',
  currentWeek: 1,
  currentDay: 1,
  startDate: '2026-09-08',
  endDate: '2026-12-01',
  isSealed: false,
  partnerName: '',
  partnerWamScore: 0,
};

const DEFAULT_VISION: VisionStatement = {
  headline: '',
  longTermVision: '',
  cycleVision: '',
  emotionalWhy: '',
  readToday: false,
};

const FocusFlowContext = createContext<FocusFlowContextType | undefined>(undefined);

export const FocusFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { permission, requestPermission, scheduleRoutineNotifications } = useNotifications();

  useEffect(() => {
    if (user && permission === 'granted') {
      scheduleRoutineNotifications();
    }
  }, [user, permission]);

  const tabToPathMap: Record<string, string> = {
    'progresso-diario': '/hoje',
    'hoje': '/hoje',
    'placar-wam': '/placar-wam',
    'planejamento': '/planejamento',
    'visao': '/visao',
    'mapa-ciclo': '/mapa',
    'mapa': '/mapa',
    'fechamento-ciclo': '/fechamento-ciclo',
    'novo-ciclo': '/novo-ciclo',
    'novo-ciclo-wizard': '/novo-ciclo',
  };

  const pathToTabMap: Record<string, string> = {
    '/': 'progresso-diario',
    '/hoje': 'progresso-diario',
    '/progresso-diario': 'progresso-diario',
    '/placar-wam': 'placar-wam',
    '/planejamento': 'planejamento',
    '/visao': 'visao',
    '/mapa': 'mapa-ciclo',
    '/mapa-ciclo': 'mapa-ciclo',
    '/fechamento-ciclo': 'fechamento-ciclo',
    '/novo-ciclo': 'novo-ciclo',
    '/novo-ciclo-wizard': 'novo-ciclo',
  };

  const activeTab = pathToTabMap[location.pathname] || 'progresso-diario';

  const setActiveTab = (tab: string) => {
    const targetPath = tabToPathMap[tab] || `/${tab}`;
    navigate(targetPath);
  };

  // ----------------------------------------------------
  // React Query Fetchers
  // ----------------------------------------------------

  const { data: cycle, isLoading: cycleLoading } = useQuery({
    queryKey: ['cycle', user?.id],
    queryFn: () => cyclesService.getCurrentCycle(user!.id),
    enabled: !!user,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', cycle?.id],
    queryFn: () => goalsService.getGoals(cycle!.id),
    enabled: !!cycle?.id,
  });

  const { data: baseTactics = [], isLoading: tacticsLoading } = useQuery({
    queryKey: ['tactics', goals.map(g => g.id)],
    queryFn: () => tacticsService.getTactics(goals.map(g => g.id)),
    enabled: goals.length > 0,
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const { data: executions = [] } = useQuery({
    queryKey: ['executions', user?.id, todayStr],
    queryFn: () => executionsService.getDailyExecutions(user!.id, todayStr),
    enabled: !!user,
  });

  const { data: vision } = useQuery({
    queryKey: ['vision', cycle?.id, user?.id],
    queryFn: () => visionService.getVision(cycle!.id, user!.id),
    enabled: !!cycle?.id && !!user?.id,
  });

  const { data: wamHistory = [] } = useQuery({
    queryKey: ['wamHistory', cycle?.id, user?.id],
    queryFn: () => wamService.getWamHistory(cycle!.id, user!.id),
    enabled: !!cycle?.id && !!user?.id,
  });

  // Combine tactics with executions to determine isCompleted
  const tactics = useMemo(() => {
    return baseTactics.map(t => {
      const exec = executions.find(e => e.tactic_id === t.id);
      return {
        ...t,
        isCompleted: exec ? exec.is_completed : false,
        completedAt: exec ? exec.completed_at : undefined
      };
    });
  }, [baseTactics, executions]);

  const { data: cycleHistoryData = [] } = useQuery({
    queryKey: ['cycleArchives', user?.id],
    queryFn: () => cyclesService.getCycleArchives(user!.id),
    enabled: !!user,
  });

  const cycleHistory = useMemo(() => {
    return cycleHistoryData.map((archive: any) => ({
      cycle: {
        id: archive.cycle.id,
        number: archive.cycle.number,
        name: archive.cycle.name,
        currentWeek: archive.cycle.current_week,
        currentDay: 1,
        startDate: archive.cycle.start_date,
        endDate: archive.cycle.end_date,
        isSealed: archive.cycle.is_sealed,
        partnerName: archive.cycle.partner_name || '',
        partnerWamScore: 0
      },
      finalScore: Number(archive.final_score),
      goldWeeks: archive.gold_weeks_count,
      retrospective: archive.retrospective_json,
      lagAudit: archive.lag_audit_json,
      sealedAt: archive.sealed_at,
      wamHistory: [] // Can be populated if wam is joined, or omitted if not needed in the UI
    })) as CycleArchiveRecord[];
  }, [cycleHistoryData]);

  // ----------------------------------------------------
  // Mutations
  // ----------------------------------------------------

  const updateCycleMutation = useMutation({
    mutationFn: (updates: Partial<Cycle>) => cyclesService.updateCycle(cycle!.id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cycle'] })
  });

  const updateCycle = (updated: Partial<Cycle>) => {
    if (cycle) updateCycleMutation.mutate(updated);
  };

  const updateVisionMutation = useMutation({
    mutationFn: async (updates: Partial<VisionStatement>) => {
      let targetCycleId = cycle?.id;
      if (!targetCycleId && user) {
        const current = await cyclesService.getCurrentCycle(user.id);
        targetCycleId = current?.id;
      }
      if (!targetCycleId || !user) {
        throw new Error('Nenhum ciclo ativo ou usuário autenticado encontrado para salvar a visão.');
      }
      return visionService.saveVision(targetCycleId, user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vision'] });
    }
  });

  const updateVision = async (updated: Partial<VisionStatement>) => {
    return updateVisionMutation.mutateAsync(updated);
  };

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Goal> }) => goalsService.updateGoal(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    updateGoalMutation.mutate({ id, updates: updated });
  };

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsService.deleteGoal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const deleteGoal = (id: string) => {
    deleteGoalMutation.mutate(id);
  };

  const addGoalMutation = useMutation({
    mutationFn: (newGoalData: { title: string; description: string; category?: string; targetMetric: string; orderNum: number }) => 
      goalsService.addGoal(cycle!.id, user!.id, newGoalData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  });

  const addGoal = (newGoalData: { title: string; description: string; category?: string; targetMetric: string; }) => {
    const orderNum = goals.length + 1;
    addGoalMutation.mutate({ ...newGoalData, orderNum });
    return { success: true };
  };

  const toggleTacticMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string, isCompleted: boolean }) => 
      executionsService.toggleExecution(user!.id, id, todayStr, isCompleted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['executions'] })
  });

  const toggleTactic = (id: string) => {
    const t = tactics.find(tac => tac.id === id);
    if (t) {
      toggleTacticMutation.mutate({ id, isCompleted: !t.isCompleted });
    }
  };

  const addTacticMutation = useMutation({
    mutationFn: (data: any) => tacticsService.addTactic(user!.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tactics'] })
  });

  const addTactic = (newTacticData: { goalId: string; title: string; daysOfWeek: DayOfWeekKey[]; startTime?: string; endTime?: string; }) => {
    const validation = validateLeadIndicator(newTacticData.title);
    if (!newTacticData.daysOfWeek || newTacticData.daysOfWeek.length === 0) {
      return { success: false, message: 'Selecione pelo menos um dia da semana para realizar a tática.' };
    }

    let estimatedMinutes: number | undefined = undefined;
    let blockType: 'strategic' | 'buffer' | 'breakout' = 'strategic';

    if (newTacticData.startTime && newTacticData.endTime) {
      const duration = calculateDurationMinutes(newTacticData.startTime, newTacticData.endTime);
      if (duration <= 0) {
        return { success: false, message: 'O horário de término deve ser posterior ao horário de início.' };
      }
      estimatedMinutes = duration;
      blockType = inferBlockTypeFromDuration(duration);
    }

    addTacticMutation.mutate({
      goalId: newTacticData.goalId,
      title: newTacticData.title,
      daysOfWeek: newTacticData.daysOfWeek,
      startTime: newTacticData.startTime,
      endTime: newTacticData.endTime,
      blockType,
      estimatedMinutes,
      isLeadIndicator: validation.isValid
    });
    return { success: true };
  };

  const markVisionAsReadToday = () => {
    updateVision({ readToday: true, lastReadDate: new Date().toISOString() });
    setIsVisionModalOpen(false);
  };

  // Modals state
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isEditVisionOpen, setIsEditVisionOpen] = useState(false);
  const [editVisionTab, setEditVisionTab] = useState<'longo-prazo' | 'ciclo'>('longo-prazo');
  const [editVisionMode, setEditVisionMode] = useState<'cadastrar' | 'editar'>('editar');

  const openEditVision = (tab: 'longo-prazo' | 'ciclo' = 'longo-prazo', mode: 'cadastrar' | 'editar' = 'editar') => {
    setEditVisionTab(tab);
    setEditVisionMode(mode);
    setIsEditVisionOpen(true);
  };
  const [isNewTacticModalOpen, setIsNewTacticModalOpen] = useState(false);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState(false);

  // Governance & Shielding settings (BR-02)
  const [governanceSettings, setGovernanceSettings] = useLocalStorage<GovernanceSettings>('ff:governance', {
    googleCalendarSync: true,
    slackDndSync: true,
    rejectConflicts: true,
    warnGoogleCalendarConflicts: true,
  });

  // Timer State (Strategic Block 3h = 10800s default)
  const [timer, setTimer] = useState<TimeBlockTimerState>({
    blockType: 'strategic',
    title: 'Bloco Estratégico (Deep Work)',
    totalSeconds: 10800,
    remainingSeconds: 6134,
    isRunning: true,
    isPaused: false,
    isCompleted: false,
    dndShieldActive: true
  });

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timer.isRunning && !timer.isPaused && timer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, remainingSeconds: 0, isRunning: false, isCompleted: true };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, timer.isPaused, timer.remainingSeconds]);

  const startTimer = () => setTimer(prev => ({ ...prev, isRunning: true, isPaused: false, dndShieldActive: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, isPaused: true }));
  const completeTimer = () => setTimer(prev => ({ ...prev, remainingSeconds: 0, isRunning: false, isCompleted: true }));
  const resetTimer = (type: 'strategic' | 'buffer' | 'breakout' = 'strategic') => {
    let total = 10800;
    let title = 'Bloco Estratégico (Deep Work)';
    if (type === 'buffer') { total = 3600; title = 'Bloco Buffer (Triagem & Comunicações)'; }
    else if (type === 'breakout') { total = 10800; title = 'Bloco Breakout (Descompressão Sem Telas)'; }

    setTimer({ blockType: type, title, totalSeconds: total, remainingSeconds: total, isRunning: false, isPaused: false, isCompleted: false, dndShieldActive: type === 'strategic' });
  };

  const wamMetrics = calculateWAM(tactics);

  const sealWeekMutation = useMutation({
    mutationFn: (record: WamWeekRecord) => wamService.sealWeek(cycle!.id, user!.id, record),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wamHistory'] })
  });

  const sealWeek = (deviationNotes?: string): { success: boolean; message?: string } => {
    if (!cycle) return { success: false };
    const metrics = calculateWAM(tactics);
    if (metrics.status !== 'gold' && !deviationNotes?.trim()) {
      return { success: false, message: 'WAM abaixo de 85%: preencha a justificativa de desvio antes de fechar a semana.' };
    }
    const record: WamWeekRecord = {
      week: cycle.currentWeek,
      score: metrics.score,
      status: metrics.status,
      executed: metrics.executed,
      planned: metrics.total,
      sealedAt: new Date().toISOString(),
      partnerHomologated: false,
      deviationNotes: deviationNotes?.trim() || undefined,
    };
    sealWeekMutation.mutate(record);
    updateCycle({ currentWeek: Math.min(cycle.currentWeek + 1, 12) });
    return { success: true };
  };

  const homologateWeekMutation = useMutation({
    mutationFn: (week: number) => wamService.homologateWeek(cycle!.id, user!.id, week),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wamHistory'] })
  });

  const homologateWeek = (week: number): void => {
    homologateWeekMutation.mutate(week);
  };

  const sealCycleMutation = useMutation({
    mutationFn: (data: { lagAudit: LagAuditEntry[]; retrospective: { whatWorked: string; whatFailed: string; mainInsight: string } }) => {
      const scores = wamHistory.map((r) => r.score);
      const finalScore = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
      const goldWeeksCount = wamHistory.filter((r) => r.status === 'gold').length;
      
      return cyclesService.archiveCycle(user!.id, {
        cycleId: cycle!.id,
        finalScore,
        goldWeeksCount,
        retrospective: data.retrospective,
        lagAudit: data.lagAudit,
        sealedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      updateCycle({ isSealed: true });
      queryClient.invalidateQueries({ queryKey: ['cycleArchives'] });
    }
  });

  const sealCycle = (data: { lagAudit: LagAuditEntry[]; retrospective: { whatWorked: string; whatFailed: string; mainInsight: string }; }): { success: boolean; message?: string } => {
    if (!cycle) return { success: false };
    if (!data.retrospective.whatWorked.trim() || !data.retrospective.whatFailed.trim() || !data.retrospective.mainInsight.trim()) {
      return { success: false, message: 'Preencha todos os campos da retrospectiva antes de selar o ciclo.' };
    }
    
    sealCycleMutation.mutate(data);
    return { success: true };
  };

  const createCycleMutation = useMutation({
    mutationFn: async (data: { cycleInfo: any, importedGoals: Goal[], cycleVision: string }) => {
      // 1. Create cycle
      const newCycle = await cyclesService.createCycle(data.cycleInfo, user!.id);
      
      // 2. Import goals sequentially to ensure order and avoid race conditions
      for (let i = 0; i < data.importedGoals.length; i++) {
        const g = data.importedGoals[i];
        await goalsService.addGoal(newCycle.id, user!.id, {
          title: g.title,
          description: g.description,
          category: g.category,
          targetMetric: g.targetMetric,
          orderNum: i + 1
        });
      }

      // 3. Save new vision
      await visionService.saveVision(newCycle.id, user!.id, {
        cycleVision: data.cycleVision
      });

      return newCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['vision'] });
      setActiveTab('planejamento');
    }
  });

  const openNewCycle = (data: { name: string; startDate: string; endDate: string; importedGoals: Goal[]; cycleVision: string; partnerName: string; }) => {
    const newCycleNumber = (cycle?.number || 0) + 1;
    createCycleMutation.mutate({
      cycleInfo: {
        number: newCycleNumber,
        name: data.name || `Ciclo 0${newCycleNumber} • Q${newCycleNumber} Execution`,
        startDate: data.startDate,
        endDate: data.endDate,
        partnerName: data.partnerName || cycle?.partnerName,
      },
      importedGoals: data.importedGoals,
      cycleVision: data.cycleVision
    });
  };

  // Se o usuário estiver logado e os dados base (ciclo) ainda estiverem carregando, exibe loader
  if (user && (cycleLoading || goalsLoading || tacticsLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback defaults se não houver dados no banco (para prevenir quebra de UI)
  const safeCycle = cycle || DEFAULT_CYCLE;
  const safeVision = vision || DEFAULT_VISION;

  return (
    <FocusFlowContext.Provider
      value={{
        activeTab, setActiveTab,
        goals, tactics, toggleTactic, addTactic,
        cycle: safeCycle, vision: safeVision, updateVision, updateGoal, deleteGoal, addGoal, markVisionAsReadToday,
        timer, startTimer, pauseTimer, completeTimer, resetTimer,
        isVisionModalOpen, setIsVisionModalOpen,
        isEditVisionOpen, setIsEditVisionOpen,
        editVisionTab, setEditVisionTab,
        editVisionMode, setEditVisionMode,
        openEditVision,
        isNewTacticModalOpen, setIsNewTacticModalOpen,
        isNewGoalModalOpen, setIsNewGoalModalOpen,
        isGovernanceModalOpen, setIsGovernanceModalOpen,
        governanceSettings, setGovernanceSettings,
        wamMetrics, wamHistory, sealWeek, homologateWeek,
        updateCycle, cycleHistory, sealCycle, openNewCycle,
        notifications: { permission, requestPermission }
      }}
    >
      {children}
    </FocusFlowContext.Provider>
  );
};

export const useFocusFlow = () => {
  const context = useContext(FocusFlowContext);
  if (!context) {
    throw new Error('useFocusFlow deve ser utilizado dentro de FocusFlowProvider');
  }
  return context;
};
