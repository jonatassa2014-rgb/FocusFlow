import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FocusFlow ErrorBoundary]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl shadow-modal p-6 border border-error/20 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
              Algo inesperado aconteceu
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              O FocusFlow encontrou uma falha temporária. Seus dados no banco de dados estão preservados e seguros.
            </p>

            {this.state.error && (
              <div className="w-full bg-surface-container-low p-3 rounded-lg text-left mb-6 overflow-x-auto">
                <p className="font-mono text-[12px] text-error font-medium break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Recarregar Página
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex-1 py-2.5 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors border border-surface-container-highest"
              >
                Limpar Cache Local
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
