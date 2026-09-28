import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured } from './supabase';

describe('Supabase Client & Auth Configuration', () => {
  it('should have isSupabaseConfigured set to true with valid URL and key', () => {
    expect(isSupabaseConfigured).toBe(true);
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('should initialize signInWithOAuth for Google provider properly', async () => {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://focusflow.vercel.app/hoje',
      },
    });

    expect(res.error).toBeNull();
    expect(res.data).toBeDefined();
    expect(res.data.provider).toBe('google');
    expect(res.data.url).toContain('https://horaaqlrerhgcmnffajr.supabase.co/auth/v1/authorize?provider=google');
    expect(res.data.url).toContain('redirect_to=https%3A%2F%2Ffocusflow.vercel.app%2Fhoje');
  });
});
