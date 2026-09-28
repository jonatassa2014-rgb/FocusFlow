import React, { useState, useEffect } from 'react';
import { useFocusFlow } from '../context/FocusFlowContext';

export const VisionView: React.FC = () => {
  const { vision, updateVision, setIsVisionModalOpen, cycle, goals } = useFocusFlow();

  const [headline, setHeadline] = useState(vision.headline || '');
  const [longTermVision, setLongTermVision] = useState(
    vision.longTermVision || vision.threeToFiveYearDeclaration || ''
  );
  const [cycleVision, setCycleVision] = useState(vision.cycleVision || '');
  const [inactionCost, setInactionCost] = useState(vision.inactionCost || '');
  const [emotionalWhy, setEmotionalWhy] = useState(vision.emotionalWhy || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (vision) {
      setHeadline(vision.headline || '');
      setLongTermVision(vision.longTermVision || vision.threeToFiveYearDeclaration || '');
      setCycleVision(vision.cycleVision || '');
      setInactionCost(vision.inactionCost || '');
      setEmotionalWhy(vision.emotionalWhy || '');
    }
  }, [vision]);

  const handleSave = () => {
    updateVision({
      headline,
      threeToFiveYearDeclaration: longTermVision,
      longTermVision,
      cycleVision,
      inactionCost,
      emotionalWhy,
    });
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 3500);
  };

  return (
    <div className="py-space-md space-y-space-lg max-w-[1440px] mx-auto w-full pb-16">
      {/* Top Breadcrumb & Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Fundação Metodológica do The 12 Week Year
            </span>
            <span className="text-outline-variant font-label-sm text-label-sm">•</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              A Âncora Emocional da Execução
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Minha Visão Inspiradora
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Metas sem conexão emocional com sua visão de longo prazo são abandonadas na Semana 3. Defina sua visão com clareza visceral para alimentar a disciplina e a urgência no dia a dia.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => setIsVisionModalOpen(true)}
            className="flex items-center gap-space-xs px-space-md py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-lg text-label-lg transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-body-lg">print</span>
            <span>Cartão de Bolso (Ritual Matinal)</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-space-xs px-space-lg py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-lg text-label-lg transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-body-lg">bookmark</span>
            <span>Salvar Alterações da Visão</span>
          </button>
        </div>
      </section>

      {/* Feedback Toast */}
      {showSavedFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span className="font-semibold text-sm">
              Visão inspiradora salva com sucesso! Os parâmetros foram atualizados no seu Cartão de Bolso e Cockpit Diário.
            </span>
          </div>
          <button onClick={() => setShowSavedFeedback(false)} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Methodological Banner: "O Princípio da Visão" */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-high p-space-lg shadow-sm border border-surface-container">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-tertiary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pb-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm mb-2 flex-wrap">
              <span className="px-space-xs py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wide font-bold">
                Princípio de Brian P. Moran
              </span>
              <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-lowest text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span className="font-label-sm text-label-sm font-semibold">
                  Visão Ativa & Conectada ao {cycle.name}
                </span>
              </div>
              <span className="hidden md:inline-block font-label-sm text-label-sm text-on-surface-variant font-medium">
                • Atualizada e ancorada
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              A Conexão Implacável: Visão de Longo Prazo (3-5 anos) <span className="text-primary font-bold">→</span> Ciclo de 12 Semanas (Agora)
            </h2>
          </div>
        </div>

        {/* 3 Core Pillars in Horizon Connection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-body-lg">favorite</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface font-bold">1. Visão Emocional Forte</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                  Supera o desconforto passageiro da disciplina diária. Transforma o sacrifício em escolha lúcida.
                </p>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold mt-space-sm inline-block">
              Âncora Não-Negociável
            </span>
          </div>

          <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-body-lg">tune</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface font-bold">2. Clareza de Escolhas</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                  Permite dizer "NÃO" com segurança para 90% das distrações que tentam se infiltrar no sprint semanal.
                </p>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-secondary font-bold mt-space-sm inline-block">
              Filtro de Prioridades
            </span>
          </div>

          <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-surface-container/60">
            <div className="flex items-start gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary text-body-lg">flag_circle</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface font-bold">3. Alinhamento com o Ciclo</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                  Suas metas de {cycle.name} servem diretamente aos pilares definidos abaixo no horizonte de 3 anos.
                </p>
              </div>
            </div>
            <span className="font-label-sm text-label-sm text-tertiary font-bold mt-space-sm inline-block">
              Execução Conectada
            </span>
          </div>
        </div>
      </section>

      {/* Declaração Sintética e Porquê Emocional Geral */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 space-y-space-md">
        <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
          <span className="material-symbols-outlined text-primary text-[24px]">flag</span>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Declaração Central da Visão & Porquê Emocional (Cartão de Bolso)
            </h2>
            <p className="font-body-sm text-on-surface-variant">
              Estes são os textos que alimentam seu ritual matinal obrigatório de 2 minutos antes de liberar o painel diário.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="space-y-1">
            <label className="font-label-sm text-xs font-bold uppercase text-primary tracking-wider">
              Título / Lema da Visão
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-on-surface border border-surface-container focus:outline-none focus:border-primary font-bold"
              placeholder="Ex: Liberdade Geográfica e Impacto de Alta Escala"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-sm text-xs font-bold uppercase text-amber-700 tracking-wider">
              Porquê Emocional Profundo (Emotional Why)
            </label>
            <input
              type="text"
              value={emotionalWhy}
              onChange={(e) => setEmotionalWhy(e.target.value)}
              className="w-full bg-amber-50/60 rounded-lg p-2.5 font-body-md text-amber-950 border border-amber-200 focus:outline-none focus:border-amber-500 italic"
              placeholder="A razão inegociável que faz você acordar cedo todos os dias..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-label-sm text-xs font-bold uppercase text-on-surface-variant tracking-wider">
            Declaração de 3 a 5 Anos (Visão Completa)
          </label>
          <textarea
            rows={3}
            value={longTermVision}
            onChange={(e) => setLongTermVision(e.target.value)}
            className="w-full bg-surface-container-low rounded-lg p-3 font-body-md text-on-surface border border-surface-container focus:outline-none focus:border-primary leading-relaxed resize-none"
            placeholder="Descreva onde você estará em 3 a 5 anos..."
          />
        </div>
      </section>

      {/* 2 Pilares Fundamentais: Longo Prazo e Ciclo */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* CARD 1: Visão de Longo Prazo (3 a 5 Anos) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-headline-sm">explore</span>
                </div>
                <div>
                  <span className="px-space-xs py-0.5 rounded bg-primary-fixed font-label-sm text-label-sm text-on-primary-fixed font-bold uppercase tracking-wider">
                    Pilar I • 3 a 5 Anos
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Visão de Longo Prazo
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Como será sua vida e realização pessoal/profissional em 3 a 5 anos? O destino final que guia suas escolhas.
            </p>

            {/* Textarea Preenchido e Editável */}
            <div className="relative mb-space-md">
              <textarea
                value={longTermVision}
                onChange={(e) => setLongTermVision(e.target.value)}
                className="w-full bg-surface-container-low rounded-lg p-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container border border-surface-container transition-colors resize-none leading-relaxed"
                placeholder="Descreva vividamente sua visão de 3 a 5 anos..."
                rows={5}
              />
              <span className="absolute right-3 bottom-3 text-label-sm font-label-sm text-outline">
                {longTermVision.length} caracteres
              </span>
            </div>
          </div>

          {/* Conexão com Ciclo Atual */}
          <div className="bg-surface-container p-space-sm rounded-lg flex items-center gap-space-sm mt-auto">
            <span className="material-symbols-outlined text-primary text-body-lg">link</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                Horizonte Estratégico:
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Ancoragem permanente para os ciclos de 12 semanas
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Visão do Ciclo (12 Semanas) */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-headline-sm">calendar_today</span>
                </div>
                <div>
                  <span className="px-space-xs py-0.5 rounded bg-secondary-fixed font-label-sm text-label-sm text-on-secondary-fixed font-bold uppercase tracking-wider">
                    Pilar II • 12 Semanas
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Visão do Ciclo ({cycle.name})
                  </h2>
                </div>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Qual é o marco inegociável a ser conquistado até a 12ª semana? A ponte concreta para a visão de 3 anos.
            </p>

            {/* Textarea Preenchido */}
            <div className="relative mb-space-md">
              <textarea
                value={cycleVision}
                onChange={(e) => setCycleVision(e.target.value)}
                className="w-full bg-surface-container-low rounded-lg p-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container border border-surface-container transition-colors resize-none leading-relaxed"
                placeholder="Descreva o alvo inegociável deste ciclo de 12 semanas..."
                rows={5}
              />
              <span className="absolute right-3 bottom-3 text-label-sm font-label-sm text-outline">
                {cycleVision.length} caracteres
              </span>
            </div>
          </div>

          {/* Conexão com Ciclo Atual */}
          <div className="bg-surface-container p-space-sm rounded-lg flex items-center gap-space-sm mt-auto">
            <span className="material-symbols-outlined text-secondary text-body-lg">flag</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                Metas em Execução no Ciclo:
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                {goals.length} metas ativas ({goals.map(g => g.title).slice(0, 2).join(', ') + (goals.length > 2 ? '...' : '')})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CARD 3: O Manifesto / Custo da Inação */}
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-card border border-surface-container/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-headline-sm">local_fire_department</span>
            </div>
            <div>
              <span className="px-space-xs py-0.5 rounded bg-tertiary-fixed font-label-sm text-label-sm text-on-tertiary-fixed font-bold uppercase tracking-wider">
                O Manifesto de Urgência
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Por Que Isso é Inegociável? (O Custo da Inação)
              </h2>
            </div>
          </div>
          <div className="px-space-sm py-1 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-label-md">warning</span>
            <span>Atenção Semanal: Ler toda segunda-feira no WAM</span>
          </div>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          Qual é o preço real e palpável de procrastinar e não executar com excelência nas próximas 12 semanas?
        </p>

        <div className="relative">
          <textarea
            value={inactionCost}
            onChange={(e) => setInactionCost(e.target.value)}
            className="w-full bg-surface-container-low rounded-lg p-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container border border-surface-container transition-colors resize-none leading-relaxed"
            placeholder="Qual é o custo da inação?"
            rows={4}
          />
          <span className="absolute right-3 bottom-3 text-label-sm font-label-sm text-outline">
            {inactionCost.length} caracteres
          </span>
        </div>

        <div className="mt-space-md flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-space-lg py-2.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-lg font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Salvar Toda a Visão</span>
          </button>
        </div>
      </section>
    </div>
  );
};
