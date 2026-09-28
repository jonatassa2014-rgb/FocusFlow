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
    // Se o Supabase estiver configurado, escuta a sessão remota
    if (isSupabaseConfigured) {
      const hasAuthCodeInUrl = typeof window !== 'undefined' && (
        window.location.search.includes('code=') ||
        window.location.hash.includes('access_token=') ||
        window.location.hash.includes('error=') ||
        window.location.search.includes('error=')
      );

      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          const authUser = mapSupabaseUser(session.user);
          setUser(authUser);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser));
          setIsLoading(false);
        } else {
          // Se houver código OAuth na URL, aguarda a resolução do onAuthStateChange
          if (!hasAuthCodeInUrl) {
            const localUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
            if (localUser) {
              setUser(JSON.parse(localUser));
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
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
        setIsLoading(false);
      });

      // Timeout de segurança para desbloquear a interface caso a troca OAuth falhe
      let safetyTimer: any;
      if (hasAuthCodeInUrl) {
        safetyTimer = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
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
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/hoje',
          },
        });
        if (error) return { success: false, error: error.message };
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
