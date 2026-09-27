import { supabase } from '../lib/supabase';

export const executionsService = {
  async getDailyExecutions(userId: string, dateStr: string) {
    const { data, error } = await supabase
      .from('daily_executions')
      .select('*')
      .eq('user_id', userId)
      .eq('execution_date', dateStr);

    if (error) throw error;
    return data;
  },

  async toggleExecution(userId: string, tacticId: string, dateStr: string, isCompleted: boolean) {
    // Implement UPSERT via Supabase
    const { data, error } = await supabase
      .from('daily_executions')
      .upsert(
        { 
          user_id: userId,
          tactic_id: tacticId,
          execution_date: dateStr,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        },
        { onConflict: 'tactic_id,execution_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
