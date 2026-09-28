import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://horaaqlrerhgcmnffajr.supabase.co';
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseSecret);

const TEST_DATA = {
  longTermVision: 'Ser uma referência na aplicação de GenAI nas finanças públicas',
  cycleVision: 'Melhorar minha disposição física e confiança no ensino de finanças públicas',
  emotionalWhy: 'Preciso melhorar a minha energia e confiança para impactar outras vidas'
};

const UPDATED_CYCLE_VISION = 'Melhorar minha disposição física e confiança no ensino de finanças públicas - Atualizado com Sucesso';

test.describe('Validação do Fluxo de Persistência do Sistema de Metas e Visão', () => {
  test.beforeAll(async () => {
    // Limpa registros prévios do usuário de teste para garantir teste limpo
    const { data: user } = await supabaseAdmin.auth.admin.getUserById('da251f5e-e7a0-4a8a-a56c-98bf268a9140');
    if (user?.user) {
      await supabaseAdmin.from('vision_statements').delete().eq('user_id', user.user.id);
      await supabaseAdmin.from('cycles').delete().eq('user_id', user.user.id);
    }
  });

  test('Deve salvar, recuperar, exibir nos dashboards, resistir a reload e atualizar sem duplicação', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('[BROWSER CONSOLE ERROR]:', msg.text());
    });

    // --------------------------------------------------------------------------
    // ETAPA 1: Login com usuário real Supabase
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 1: Autenticando com usuário real Supabase ---');
    await page.goto('/login');
    await expect(page.locator('text=FocusFlow')).toBeVisible();

    await page.fill('input[type="email"]', 'teste@focusflow.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]:has-text("Entrar no Cockpit")');

    await page.waitForURL(/.*\/hoje/, { timeout: 15000 });
    console.log('[OK] Login realizado com sucesso. Rota atual: /hoje');

    // --------------------------------------------------------------------------
    // ETAPA 2: Navegar para Planejamento Estratégico e Abrir Modal de Visão
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 2: Acessando Planejamento e Preenchendo a Visão ---');
    await page.click('text=Planejamento Estratégico');
    await page.waitForURL(/.*\/planejamento/, { timeout: 10000 });

    // Clicar no botão "Cadastrar" ou "Editar" do bloco de Visão
    const cadastrarBtn = page.locator('button[title="Cadastrar Visão de Longo Prazo"]').first();
    await cadastrarBtn.click();

    // Modal de Edição deve estar visível
    await expect(page.locator('text=Visão do Ciclo').first()).toBeVisible();

    // Preencher exatamente os três campos solicitados
    const longTermInput = page.locator('textarea[placeholder*="3 a 5 anos"]');
    const cycleVisionInput = page.locator('textarea[placeholder*="próximas 12 semanas"], textarea[placeholder*="deste ciclo"]');
    const emotionalWhyInput = page.locator('textarea[placeholder*="acordar disciplinado"], textarea[placeholder*="acordar cedo"]');

    await longTermInput.fill(TEST_DATA.longTermVision);
    await cycleVisionInput.fill(TEST_DATA.cycleVision);
    await emotionalWhyInput.fill(TEST_DATA.emotionalWhy);

    // Salvar
    await page.click('button:has-text("Salvar Visão")');

    // Aguarda o modal sumir e os dados serem refletidos
    await expect(page.locator('div[role="dialog"], .fixed.inset-0.z-50')).not.toBeVisible({ timeout: 5000 });
    console.log('[OK] Formulário enviado e modal fechado.');

    // --------------------------------------------------------------------------
    // ETAPA 3: Verificar exibição imediata no Dashboard de Planejamento
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 3: Validando Dashboard de Planejamento ---');
    await expect(page.getByText(TEST_DATA.longTermVision)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(TEST_DATA.cycleVision)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(TEST_DATA.emotionalWhy)).toBeVisible({ timeout: 5000 });
    console.log('[OK] Dashboard de Planejamento exibiu os 3 dados imediatamente (reatividade/cache OK).');

    // --------------------------------------------------------------------------
    // ETAPA 4: Consultar o banco de dados Supabase diretamente
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 4: Consultando banco de dados diretamente via Supabase Admin ---');
    const { data: dbVisions, error: dbErr } = await supabaseAdmin
      .from('vision_statements')
      .select('*')
      .eq('user_id', 'da251f5e-e7a0-4a8a-a56c-98bf268a9140');

    expect(dbErr).toBeNull();
    expect(dbVisions).toHaveLength(1);

    const savedRecord = dbVisions![0];
    console.log('[EVIDÊNCIA DB] Registro retornado do Supabase:', {
      id: savedRecord.id,
      long_term_vision: savedRecord.long_term_vision,
      cycle_vision: savedRecord.cycle_vision,
      emotional_why: savedRecord.emotional_why
    });

    // Validações estritas de texto e acentuação/encoding
    expect(savedRecord.long_term_vision).toBe(TEST_DATA.longTermVision);
    expect(savedRecord.cycle_vision).toBe(TEST_DATA.cycleVision);
    expect(savedRecord.emotional_why).toBe(TEST_DATA.emotionalWhy);
    console.log('[OK] Banco consultado diretamente: Textos exatos e acentuação íntegra sem truncamento.');

    // --------------------------------------------------------------------------
    // ETAPA 5: Recarregar a aplicação e verificar persistência
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 5: Recarregando a página e validando recuperação ---');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Confirma que os 3 valores continuam visíveis no Dashboard após o reload
    await expect(page.getByText(TEST_DATA.longTermVision)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_DATA.cycleVision)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_DATA.emotionalWhy)).toBeVisible({ timeout: 10000 });
    console.log('[OK] Dashboard mantém os dados após reload da página.');

    // Verificar se ao reabrir o modal os valores estão nos textareas
    const editarBtn = page.locator('button[title="Editar Visão de Longo Prazo"]').first();
    await editarBtn.click();
    await expect(longTermInput).toHaveValue(TEST_DATA.longTermVision);
    await expect(cycleVisionInput).toHaveValue(TEST_DATA.cycleVision);
    await expect(emotionalWhyInput).toHaveValue(TEST_DATA.emotionalWhy);
    console.log('[OK] Formulário de edição recarregou todos os valores do banco corretamente.');

    // --------------------------------------------------------------------------
    // ETAPA 6: Validar no Modal Cartão de Bolso e no Painel da Visão (/visao)
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 6: Validando rota /visao e Cartão de Bolso ---');
    await page.click('button:has-text("Cancelar")');

    // Abre Cartão de Bolso para validar
    await page.click('button:has-text("Cartão de Bolso")');
    await expect(page.locator('.fixed').getByText(TEST_DATA.longTermVision)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.fixed').getByText(TEST_DATA.cycleVision)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.fixed').getByText(TEST_DATA.emotionalWhy)).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Fechar")');

    // Navega para rota /visao
    await page.goto('/visao');
    await expect(page.getByText(TEST_DATA.longTermVision).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_DATA.cycleVision).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`input[value="${TEST_DATA.emotionalWhy}"]`)).toBeVisible({ timeout: 10000 });
    console.log('[OK] Rota /visao e Cartão de Bolso exibiram e preencheram todos os dados corretamente.');

    // --------------------------------------------------------------------------
    // ETAPA 7: Edição de campo e confirmação de UPDATE (sem duplicação)
    // --------------------------------------------------------------------------
    console.log('--- ETAPA 7: Editando campo para confirmar UPDATE no banco ---');
    await page.goto('/planejamento');
    await page.waitForLoadState('networkidle');

    await page.locator('button[title="Editar Visão do Ciclo"]').first().click();
    await expect(page.locator('text=Visão do Ciclo').first()).toBeVisible();

    await cycleVisionInput.fill(UPDATED_CYCLE_VISION);
    await page.click('button[type="submit"]:has-text("Salvar Visão")');

    // Aguarda o modal fechar
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible({ timeout: 5000 });

    // Aguarda atualização na UI
    await expect(page.getByText(UPDATED_CYCLE_VISION).first()).toBeVisible({ timeout: 5000 });
    console.log('[OK] UI atualizada com o novo texto.');

    // Consulta banco diretamente para confirmar UPDATE único
    const { data: dbVisionsAfterUpdate, error: dbErrAfter } = await supabaseAdmin
      .from('vision_statements')
      .select('*')
      .eq('user_id', 'da251f5e-e7a0-4a8a-a56c-98bf268a9140');

    expect(dbErrAfter).toBeNull();
    // Confirma que NÃO HOUVE DUPLICAÇÃO
    expect(dbVisionsAfterUpdate).toHaveLength(1);
    expect(dbVisionsAfterUpdate![0].id).toBe(savedRecord.id);
    expect(dbVisionsAfterUpdate![0].cycle_vision).toBe(UPDATED_CYCLE_VISION);
    expect(dbVisionsAfterUpdate![0].long_term_vision).toBe(TEST_DATA.longTermVision);
    expect(dbVisionsAfterUpdate![0].emotional_why).toBe(TEST_DATA.emotionalWhy);

    console.log('[EVIDÊNCIA DB] Registro atualizado (UPDATE confirmado, id idêntico, count=1):', {
      id: dbVisionsAfterUpdate![0].id,
      cycle_vision: dbVisionsAfterUpdate![0].cycle_vision,
      updated_at: dbVisionsAfterUpdate![0].updated_at
    });
  });
});
