import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, signInAsGuest, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = (location.state as any)?.from?.pathname || '/hoje';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Informe seu nome completo para registro.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await signIn(email, password);
      setIsSubmitting(false);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } else {
      const res = await signUp(email, password, name);
      setIsSubmitting(false);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(res.error || 'Falha ao criar conta.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(res.error || 'Não foi possível conectar com o Google.');
    }
  };

  const handleGuestLogin = () => {
    signInAsGuest();
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-body-md text-on-surface">
      {/* Background Decorativo Suave */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container Principal */}
      <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container/70 p-8 z-10">
        {/* Cabeçalho de Marca */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-headline-sm font-bold text-2xl shadow-md mb-3">
            F
          </div>
          <h1 className="font-headline-sm text-2xl font-bold text-on-surface">
            FocusFlow
          </h1>
          <p className="text-xs uppercase tracking-widest text-primary font-bold mt-0.5">
            The 12 Week Year Execution Engine
          </p>
          <p className="text-sm text-on-surface-variant mt-2">
            {mode === 'login'
              ? 'Acesse seu painel executivo e retome sua cadência de metas.'
              : 'Comece hoje seu primeiro ciclo de 12 semanas de alta performance.'}
          </p>
        </div>

        {/* Notificação se Supabase não configurado */}
        {!isConfigured && (
          <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
              info
            </span>
            <span>
              <strong>Ambiente Híbrido:</strong> O backend Supabase pode ser configurado em <code className="bg-white/80 px-1 py-0.5 rounded">.env.local</code>. Você também pode autenticar normalmente ou entrar como Convidado.
            </span>
          </div>
        )}

        {/* Abas Alternáveis */}
        <div className="flex bg-surface-container-low p-1 rounded-xl mb-6 border border-surface-container">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0 text-red-500">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário de Login / Cadastro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-surface-container-low border border-surface-container focus:border-primary focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              E-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-surface-container-low border border-surface-container focus:border-primary focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full bg-surface-container-low border border-surface-container focus:border-primary focus:outline-none rounded-xl py-2 pl-10 pr-4 text-sm text-on-surface"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-dark active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Processando...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <span>Entrar no Cockpit</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            ) : (
              <>
                <span>Criar Meu Perfil</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-surface-container" />
          <span className="px-3 text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">
            ou
          </span>
          <div className="flex-1 border-t border-surface-container" />
        </div>

        {/* Login com Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-2.5 bg-surface-container-lowest hover:bg-surface-container border border-surface-container text-on-surface font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuar com Google</span>
        </button>

        {/* Acesso Instantâneo Modo Convidado */}
        <div className="mt-4 pt-4 border-t border-surface-container/60 text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-xs text-primary hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Acessar Modo Demonstração (Sem Cadastro)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
