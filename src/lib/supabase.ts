import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''
).trim();

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();

// Verifica se as credenciais fornecidas são válidas e não apenas placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('xxxxxxxx') &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.info(
    '[FocusFlow] Supabase ainda não configurado ou em modo demonstração local. Para conectar com o banco de dados em nuvem, crie seu projeto no Supabase e defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local.'
  );
}

// Cria o cliente Supabase utilizando valores seguros de fallback caso não esteja configurado
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
