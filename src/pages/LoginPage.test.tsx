import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '../context/AuthContext';

describe('LoginPage Google Auth Flow', () => {
  it('should render the Continue with Google button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const googleBtn = screen.getByRole('button', { name: /Continuar com Google/i });
    expect(googleBtn).toBeDefined();
    expect(googleBtn.textContent).toContain('Continuar com Google');
  });

  it('should display error message if url has error params', async () => {
    // Simula URL com erro de OAuth
    delete (window as any).location;
    window.location = new URL('https://focusflow.app/login?error=access_denied&error_description=Permissao+negada+pelo+Google') as any;

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const errorEl = screen.getByText(/Permissao negada pelo Google/i);
      expect(errorEl).toBeDefined();
    });
  });
});
