import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  isCloudConnected: boolean;
  latencyMs: number;
  timestamp: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
}

export const healthService = {
  async checkHealth(): Promise<HealthStatus> {
    const start = performance.now();
    const result: HealthStatus = {
      status: 'offline',
      isCloudConnected: isSupabaseConfigured,
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        auth: false,
        storage: true,
      },
    };

    if (!isSupabaseConfigured) {
      result.status = 'degraded';
      return result;
    }

    try {
      // 1. Check Database connection
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      result.checks.database = !dbError || dbError.code === 'PGRST116';

      // 2. Check Auth service
      const { data: sessionData } = await supabase.auth.getSession();
      result.checks.auth = !!sessionData;

      const end = performance.now();
      result.latencyMs = Math.round(end - start);

      if (result.checks.database && result.checks.auth) {
        result.status = 'healthy';
      } else {
        result.status = 'degraded';
      }
    } catch {
      result.status = 'offline';
      result.latencyMs = Math.round(performance.now() - start);
    }

    return result;
  },
};
