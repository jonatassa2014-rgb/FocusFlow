import { supabase } from '../lib/supabase';
import { VisionStatement } from '../types';

export const visionService = {
  async getVision(cycleId: string, userId: string): Promise<VisionStatement | null> {
    const { data, error } = await supabase
      .from('vision_statements')
      .select('*')
      .eq('user_id', userId)
      .eq('cycle_id', cycleId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    if (data) {
      return {
        headline: data.headline,
        longTermVision: data.long_term_vision || '',
        threeToFiveYearDeclaration: data.long_term_vision || '',
        cycleVision: data.cycle_vision || '',
        emotionalWhy: data.emotional_why || '',
        inactionCost: data.inaction_cost || '',
        lastReadDate: data.last_read_date,
        readToday: data.last_read_date === new Date().toISOString().split('T')[0]
      };
    }
    return null;
  },

  async upsertVision(cycleId: string, userId: string, vision: Partial<VisionStatement>) {
    // Check if exists
    const existing = await this.getVision(cycleId, userId);
    const payload = {
        user_id: userId,
        cycle_id: cycleId,
        headline: vision.headline || existing?.headline || '',
        long_term_vision: vision.longTermVision !== undefined ? vision.longTermVision : existing?.longTermVision,
        cycle_vision: vision.cycleVision !== undefined ? vision.cycleVision : existing?.cycleVision,
        emotional_why: vision.emotionalWhy !== undefined ? vision.emotionalWhy : existing?.emotionalWhy,
        inaction_cost: vision.inactionCost !== undefined ? vision.inactionCost : existing?.inactionCost,
        last_read_date: vision.lastReadDate !== undefined ? vision.lastReadDate : existing?.lastReadDate
    };

    const { data, error } = await supabase
      .from('vision_statements')
      .upsert(payload, { onConflict: 'user_id,cycle_id', ignoreDuplicates: false }) // ensure constraint exists, or just use update if exists
      // But wait, the schema doesn't have a unique constraint on (user_id, cycle_id) though it should.
      // Let's just delete old and insert new, or use a query.
      
      // Let's just do an update if existing, or insert if not.
      // Assuming upsert works if we query by id
      .select()
      .single();
      
      // Wait, since we don't have unique constraint, let's just do it manually:
  },
  
  async saveVision(cycleId: string, userId: string, vision: Partial<VisionStatement>) {
    const { data: existing } = await supabase.from('vision_statements').select('id').eq('cycle_id', cycleId).eq('user_id', userId).maybeSingle();
    
    const payload = {
        user_id: userId,
        cycle_id: cycleId,
        headline: vision.headline !== undefined ? vision.headline : 'Minha Visão',
        long_term_vision: vision.longTermVision,
        cycle_vision: vision.cycleVision,
        emotional_why: vision.emotionalWhy,
        inaction_cost: vision.inactionCost,
        last_read_date: vision.lastReadDate
    };

    if (existing) {
        const { data, error } = await supabase.from('vision_statements').update(payload).eq('id', existing.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('vision_statements').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
  }
};
