import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'ff:auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mapeia usuário do Supabase para nosso AuthUser
  const mapSupabaseUser = (sbUser: User): AuthUser => {
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name:
        sbUser.user_metadata?.name ||
        sbUser.user_metadata?.full_name ||
        sbUser.email?.split('@')[0] ||
        'Usuário FocusFlow',
      avatarUrl: sbUser.user_metadata?.avatar_url,
    };
  };

  useEffect(() => {
    // Se o Supabase estiver configurado, escuta a sessão remota e trata fluxo OAuth
    if (isSupabaseConfigured) {
      const searchParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      const code = searchParams.get('code');
      const error = searchParams.get('error') || hashParams.get('error');
      const errorDescription =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error');

      // Se o Google/Supabase retornou erro no redirecionamento:
      if (error || errorDescription) {
        console.error('[FocusFlow Auth] Erro detectado no retorno do OAuth:', error, errorDescription);
        sessionStorage.setItem('ff:auth_error', decodeURIComponent(errorDescription || error || 'Erro de autenticação'));
        setIsLoading(false);
        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      // Se houver código PKCE para troca explícita na URL:
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error: exchangeErr }) => {
          if (exchangeErr) {
            console.warn('[FocusFlow Auth] Falha na troca explícita de código PKCE (pode ter sido processado pelo listener):', exchangeErr.message);
          } else if (data.session?.user) {
            const authUser = mapSupabaseUser(data.session.user);
            setSession(data.session);
            setUser(authUser);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
            setIsLoading(false);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        });
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
          setIsLoading(false);
          if (code && typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          // Se não houver código OAuth pendente nem erro, recupera usuário do cache se existir
          if (!code && !error) {
            const localUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
            if (localUser) {
              try {
                setUser(JSON.parse(localUser));
              } catch {
                setUser(null);
              }
            }
            setIsLoading(false);
          }
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
          if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
        setIsLoading(false);
      });

      // Timeout de segurança reduzido caso a troca de código demore
      let safetyTimer: any;
      if (code) {
        safetyTimer = setTimeout(() => {
          setIsLoading(false);
        }, 4000);
      }

      return () => {
        subscription.unsubscribe();
        if (safetyTimer) clearTimeout(safetyTimer);
      };
    } else {
      // Modo Demonstração / Local
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authUser = mapSupabaseUser(data.user);
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
        }
      } else {
        // Fallback local caso Supabase remoto ainda esteja sem credenciais
        const demoUser: AuthUser = {
          id: '00000000-0000-0000-0000-000000000003',
          email,
          name: email.split('@')[0],
        };
        setUser(demoUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Erro inesperado ao autenticar' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name,
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
        }
      } else {
        // Fallback local
        const demoUser: AuthUser = {
          id: 'demo-user-12wy',
          email,
          name,
        };
        setUser(demoUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Erro inesperado ao registrar conta' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (isSupabaseConfigured) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectTo = `${origin}/hoje`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          console.error('[FocusFlow Auth] Erro signInWithOAuth:', error);
          return { success: false, error: error.message };
        }
        if (data?.url) {
          window.location.href = data.url;
        }
        return { success: true };
      } else {
        // Fallback local demo
        const demoUser: AuthUser = {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'usuario.google@exemplo.com',
          name: 'Alexandre Costa',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        };
        setUser(demoUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro ao autenticar com Google' };
    }
  };

  const signInAsGuest = () => {
    const guestUser: AuthUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'alexandre.costa@focusflow.app',
      name: 'Alexandre Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('[FocusFlow] Erro ao deslogar do Supabase:', e);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
