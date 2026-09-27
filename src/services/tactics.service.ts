import { supabase } from '../lib/supabase';
import { DayOfWeekKey, Tactic, TimeBlockType } from '../types';

export const tacticsService = {
  async getTactics(goalIds: string[]): Promise<Tactic[]> {
    if (goalIds.length === 0) return [];
    const { data, error } = await supabase
      .from('tactics')
      .select('*')
      .in('goal_id', goalIds);

    if (error) throw error;
    
    return data.map(t => ({
      id: t.id,
      goalId: t.goal_id,
      title: t.title,
      daysOfWeek: t.days_of_week as DayOfWeekKey[],
      dayOfWeek: (t.days_of_week as string[]).join(', '),
      startTime: t.start_time ? t.start_time.substring(0, 5) : undefined,
      endTime: t.end_time ? t.end_time.substring(0, 5) : undefined,
      blockType: t.block_type as TimeBlockType,
      estimatedMinutes: t.estimated_minutes,
      isLeadIndicator: t.is_lead_indicator,
      isCompleted: false // completion comes from executions
    }));
  },

  async addTactic(userId: string, tactic: { goalId: string; title: string; daysOfWeek: string[]; startTime?: string; endTime?: string; blockType?: string; estimatedMinutes?: number; isLeadIndicator: boolean }) {
    const { data, error } = await supabase
      .from('tactics')
      .insert({
        goal_id: tactic.goalId,
        user_id: userId,
        title: tactic.title,
        days_of_week: tactic.daysOfWeek,
        start_time: tactic.startTime ? `${tactic.startTime}:00` : null,
        end_time: tactic.endTime ? `${tactic.endTime}:00` : null,
        block_type: tactic.blockType,
        estimated_minutes: tactic.estimatedMinutes,
        is_lead_indicator: tactic.isLeadIndicator
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      goalId: data.goal_id,
      title: data.title,
      daysOfWeek: data.days_of_week as DayOfWeekKey[],
      dayOfWeek: (data.days_of_week as string[]).join(', '),
      startTime: data.start_time ? data.start_time.substring(0, 5) : undefined,
      endTime: data.end_time ? data.end_time.substring(0, 5) : undefined,
      blockType: data.block_type as TimeBlockType,
      estimatedMinutes: data.estimated_minutes,
      isLeadIndicator: data.is_lead_indicator,
      isCompleted: false
    } as Tactic;
  },

  async deleteTactic(id: string) {
    const { error } = await supabase
      .from('tactics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
