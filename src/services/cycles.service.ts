import { supabase } from '../lib/supabase';
import { Cycle } from '../types';

export const cyclesService = {
  async getCurrentCycle(userId: string): Promise<Cycle | null> {
    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_sealed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
    
    if (data) {
       return {
          id: data.id,
          number: data.number,
          name: data.name,
          currentWeek: data.current_week,
          currentDay: 1, // calculated dynamically or stored?
          startDate: data.start_date,
          endDate: data.end_date,
          isSealed: data.is_sealed,
          partnerName: data.partner_name || '',
          partnerWamScore: 0 // Fetch from partner wam if possible
       } as Cycle;
    }

    // Se o usuário não possui nenhum ciclo ativo no banco, cria o primeiro ciclo
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDateObj = new Date(today);
      endDateObj.setDate(endDateObj.getDate() + 84); // 12 semanas (84 dias)
      const endDate = endDateObj.toISOString().split('T')[0];

      const { data: newCycle, error: createError } = await supabase
        .from('cycles')
        .insert({
          user_id: userId,
          number: 1,
          name: 'Ciclo 01 • Q1 Execution',
          start_date: startDate,
          end_date: endDate,
          current_week: 1,
          is_sealed: false,
          partner_name: ''
        })
        .select()
        .single();

      if (!createError && newCycle) {
        return {
          id: newCycle.id,
          number: newCycle.number,
          name: newCycle.name,
          currentWeek: newCycle.current_week,
          currentDay: 1,
          startDate: newCycle.start_date,
          endDate: newCycle.end_date,
          isSealed: newCycle.is_sealed,
          partnerName: newCycle.partner_name || '',
          partnerWamScore: 0
        } as Cycle;
      }
    } catch (e) {
      console.warn('[FocusFlow] Não foi possível provisionar ciclo inicial:', e);
    }

    return null;
  },

  async createCycle(cycle: Omit<Cycle, 'id' | 'currentWeek' | 'currentDay'>, userId: string) {
    const { data, error } = await supabase
      .from('cycles')
      .insert({
        user_id: userId,
        number: cycle.number,
        name: cycle.name,
        start_date: cycle.startDate,
        end_date: cycle.endDate,
        partner_name: cycle.partnerName,
        current_week: 1,
        is_sealed: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateCycle(id: string, updates: Partial<Cycle>) {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.currentWeek) payload.current_week = updates.currentWeek;
    if (updates.isSealed !== undefined) payload.is_sealed = updates.isSealed;
    if (updates.partnerName) payload.partner_name = updates.partnerName;

    const { data, error } = await supabase
      .from('cycles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async archiveCycle(userId: string, archiveData: { cycleId: string; finalScore: number; goldWeeksCount: number; retrospective: any; lagAudit: any; sealedAt: string; }) {
    const { data, error } = await supabase
      .from('cycle_archives')
      .insert({
        user_id: userId,
        cycle_id: archiveData.cycleId,
        final_score: archiveData.finalScore,
        gold_weeks_count: archiveData.goldWeeksCount,
        retrospective_json: archiveData.retrospective,
        lag_audit_json: archiveData.lagAudit,
        sealed_at: archiveData.sealedAt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCycleArchives(userId: string) {
    const { data, error } = await supabase
      .from('cycle_archives')
      .select('*, cycle:cycles(*)')
      .eq('user_id', userId)
      .order('sealed_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
