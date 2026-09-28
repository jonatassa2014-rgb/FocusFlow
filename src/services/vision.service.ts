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

  async saveVision(cycleId: string, userId: string, vision: Partial<VisionStatement>) {
    // 1. Busca registro existente para este ciclo e usuário
    const { data: existing, error: fetchErr } = await supabase
      .from('vision_statements')
      .select('*')
      .eq('cycle_id', cycleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.error('[visionService] Erro ao buscar visão existente:', fetchErr);
    }

    const effectiveLongTerm = vision.longTermVision !== undefined 
      ? vision.longTermVision 
      : vision.threeToFiveYearDeclaration;

    const payload: Record<string, any> = {
      user_id: userId,
      cycle_id: cycleId,
      updated_at: new Date().toISOString()
    };

    if (vision.headline !== undefined) {
      payload.headline = vision.headline;
    } else if (!existing) {
      payload.headline = 'Minha Visão Inspiradora';
    }

    if (effectiveLongTerm !== undefined) {
      payload.long_term_vision = effectiveLongTerm;
    }

    if (vision.cycleVision !== undefined) {
      payload.cycle_vision = vision.cycleVision;
    }

    if (vision.emotionalWhy !== undefined) {
      payload.emotional_why = vision.emotionalWhy;
    }

    if (vision.inactionCost !== undefined) {
      payload.inaction_cost = vision.inactionCost;
    }

    if (vision.lastReadDate !== undefined) {
      payload.last_read_date = vision.lastReadDate;
    }

    if (existing) {
      // Executa UPDATE estrito no registro existente para evitar duplicações
      const { data, error } = await supabase
        .from('vision_statements')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Executa INSERT apenas se ainda não existir
      if (!payload.headline) {
        payload.headline = 'Minha Visão Inspiradora';
      }

      const { data, error } = await supabase
        .from('vision_statements')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};
