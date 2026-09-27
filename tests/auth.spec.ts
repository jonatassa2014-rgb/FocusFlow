import { test, expect } from '@playwright/test';

test.describe('Autenticação Flow', () => {
  test('deve permitir login como convidado e acessar planejamento', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    await page.goto('/login');

    // A página de login deve estar visível
    await expect(page.locator('text=The 12 Week Year Execution Engine')).toBeVisible();

    // Clicar em "Acessar Modo Demonstração (Sem Cadastro)"
    await page.click('button:has-text("Demonstração")');

    // A página de Hoje deve ser carregada com o Dashboard
    await page.waitForURL(/.*\/hoje/, { timeout: 10000 });
    
    // Tirar um print para ver o que tem na tela
    await page.screenshot({ path: 'screenshot.png' });

    await expect(page.locator('h1').first()).toBeVisible();
    
    // Navegar para Planejamento Estratégico (O texto exato é Planejamento Estratégico ou apenas Planejamento?)
    // No Sidebar.tsx é "Planejamento Estratégico"
    await page.click('text=Planejamento Estratégico');
    await expect(page).toHaveURL(/.*\/planejamento/);
    
    // Apenas testando se carregou a página
    await expect(page.locator('text=Nova Meta').first()).toBeVisible();
  });
});
