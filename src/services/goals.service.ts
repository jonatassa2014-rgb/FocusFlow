import { supabase } from '../lib/supabase';
import { Goal } from '../types';

export const goalsService = {
  async getGoals(cycleId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('order_num', { ascending: true });

    if (error) throw error;
    
    return data.map(g => ({
      id: g.id,
      number: g.order_num,
      title: g.title,
      description: g.description || '',
      targetMetric: g.target_metric,
      category: g.category || '',
      progressPercent: 0 // Progress will be calculated dynamically later if needed
    }));
  },

  async addGoal(cycleId: string, userId: string, goal: { title: string; description: string; targetMetric: string; category?: string; orderNum: number }) {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        cycle_id: cycleId,
        user_id: userId,
        title: goal.title,
        description: goal.description,
        target_metric: goal.targetMetric,
        category: goal.category,
        order_num: goal.orderNum
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      number: data.order_num,
      title: data.title,
      description: data.description || '',
      targetMetric: data.target_metric,
      category: data.category || '',
      progressPercent: 0
    } as Goal;
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.targetMetric) payload.target_metric = updates.targetMetric;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.number !== undefined) payload.order_num = updates.number;

    const { data, error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
