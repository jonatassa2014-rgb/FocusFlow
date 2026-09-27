import { supabase } from '../lib/supabase';
import { WamWeekRecord, WAMStatus } from '../types';

export const wamService = {
  async getWamHistory(cycleId: string, userId: string): Promise<WamWeekRecord[]> {
    const { data, error } = await supabase
      .from('wam_weekly_records')
      .select('*')
      .eq('cycle_id', cycleId)
      .eq('user_id', userId)
      .order('week_number', { ascending: true });

    if (error) throw error;
    
    return data.map(w => ({
      week: w.week_number,
      score: Number(w.score),
      status: Number(w.score) >= 85 ? 'gold' : (Number(w.score) >= 70 ? 'alert' : 'risk') as WAMStatus,
      executed: w.executed,
      planned: w.planned,
      sealedAt: w.sealed_at,
      partnerHomologated: w.partner_confirmed,
      deviationNotes: w.deviation_notes
    }));
  },

  async sealWeek(cycleId: string, userId: string, record: WamWeekRecord) {
    const { data, error } = await supabase
      .from('wam_weekly_records')
      .insert({
        cycle_id: cycleId,
        user_id: userId,
        week_number: record.week,
        score: record.score,
        executed: record.executed,
        planned: record.planned,
        partner_confirmed: record.partnerHomologated,
        deviation_notes: record.deviationNotes,
        sealed_at: record.sealedAt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async homologateWeek(cycleId: string, userId: string, weekNumber: number) {
    const { data, error } = await supabase
      .from('wam_weekly_records')
      .update({ partner_confirmed: true })
      .eq('cycle_id', cycleId)
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
