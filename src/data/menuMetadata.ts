import React from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  Send,
  FolderKanban,
  Sparkles,
  Award,
  SlidersHorizontal,
  FileCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';

export interface MenuMeta {
  id: string;
  label: string;
  shortLabel?: string;
  categoria: string;
  iconeNome: string;
  resumo: string;
  funcoes: string[];
  papeis: {
    coordenador: string;
    admin: string;
    avaliador: string;
    orientador: string;
  };
  acessoPrincipal: 'todos' | 'gestao' | 'banca' | 'orientador';
  badge?: string;
  badgeCor?: string;
}

export const MENUS_SISTEMA: MenuMeta[] = [
  {
    id: 'progresso',
    label: 'Painel & Métricas',
    categoria: 'Estratégico & Indicadores',
    iconeNome: 'BarChart3',
    resumo:
      'Painel gerencial executivo com indicadores em tempo real: taxa de adesão por faculdade, funil de propostas submetidas x avaliadas, índice de preenchimento das 100 bolsas e monitoramento de prazos regimentais.',
    funcoes: [
      'Visualização do funil de propostas (Submetidas, Em Avaliação, Aprovadas)',
      'Taxa de adesão e concorrência discriminada por Centro e Faculdade',
      'Monitor de preenchimento das quotas de Ampla Concorrência e Ações Afirmativas',
    ],
    papeis: {
      coordenador: 'Acesso Pleno: Gestão e acompanhamento das métricas de todos os cursos.',
      admin: 'Acesso Irrestrito: Supervisão institucional e dados globais da PROPEP.',
      avaliador: 'Acesso de Consulta: Visão das estatísticas e andamento geral do edital.',
      orientador: 'Acesso de Consulta: Panorama da concorrência e adesão institucional.',
    },
    acessoPrincipal: 'gestao',
    badge: 'KPIS',
    badgeCor: 'bg-blue-400 text-slate-950',
  },
  {
    id: 'editais',
    label: 'Editais & Cronograma',
    categoria: 'Normas & Linha do Tempo',
    iconeNome: 'Calendar',
    resumo:
      'Linha do tempo oficial dos 9 marcos do ciclo anual regimental, publicação dos editais vigentes e anteriores, edição de parâmetros de bolsas e homologação de prorrogações de prazos via Termo Aditivo.',
    funcoes: [
      'Acompanhamento das 9 etapas do ciclo com datas, prazos e dias restantes',
      'Prorrogação regimental de prazos com justificativa e registro em ata',
      'Edição de cotas de bolsas (AC x AF) e parâmetros normativos do edital',
      'Exportação e download do cronograma e edital completo em PDF',
    ],
    papeis: {
      coordenador: 'Acesso Pleno: Edição de parâmetros, prorrogações e transição de fases.',
      admin: 'Acesso Irrestrito: Homologação de editais e termos aditivos da Reitoria.',
      avaliador: 'Acesso de Consulta: Prazos das etapas de avaliação da banca e reuniões.',
      orientador: 'Acesso de Consulta: Período de inscrições, recursos e resultados oficiais.',
    },
    acessoPrincipal: 'todos',
    badge: 'TIMELINE',
    badgeCor: 'bg-amber-400 text-slate-950',
  },
  {
    id: 'anexos',
    label: 'Diretrizes & Anexos',
    categoria: 'Regulamentos Oficiais',
    iconeNome: 'FileText',
    resumo:
      'Repositório normativo unificado com todas as resoluções e anexos oficiais: lista de cursos habilitados (Anexo II), tabela de pesos dos critérios de avaliação (Anexo VI) e modelos de formulários.',
    funcoes: [
      'Consulta detalhada da tabela de cursos credenciados e áreas prioritárias',
      'Critérios de pontuação da banca (Justificativa, Metodologia, Mérito, etc.)',
      'Download de minutas oficiais, declarações e termos de compromisso',
    ],
    papeis: {
      coordenador: 'Gestão de Conteúdo: Atualização das resoluções normativas e anexos.',
      admin: 'Acesso Irrestrito: Homologação das diretrizes institucionais.',
      avaliador: 'Acesso Normativo: Consulta aos critérios objetivos do Anexo VI para avaliação.',
      orientador: 'Acesso Público: Consulta obrigatória para formatação da proposta de pesquisa.',
    },
    acessoPrincipal: 'todos',
  },
  {
    id: 'submissao',
    label: 'Enviar Projeto',
    categoria: 'Docência & Submissão',
    iconeNome: 'Send',
    resumo:
      'Portal de submissão digital de novas propostas de Iniciação Científica para docentes orientadores, com preenchimento guiado do plano de trabalho, link Lattes e declaração de cotas regimentais.',
    funcoes: [
      'Formulário guiado com validação automática de conformidade ao edital',
      'Indicação da modalidade (Ampla Concorrência ou Ações Afirmativas)',
      'Upload do plano de trabalho do aluno e termo de compromisso',
    ],
    papeis: {
      orientador: 'Acesso Operacional: Submissão e envio formal de projetos de pesquisa.',
      coordenador: 'Acesso de Gestão: Monitoramento de submissões e suporte a docentes.',
      admin: 'Acesso Irrestrito: Auditoria técnica e validação de envios.',
      avaliador: 'Acesso Restrito: Não submete (atua exclusivamente na banca examinadora).',
    },
    acessoPrincipal: 'orientador',
    badge: 'SUBMETER',
    badgeCor: 'bg-emerald-400 text-slate-950 font-black',
  },
  {
    id: 'projetos',
    label: 'Banco de Projetos',
    categoria: 'Gestão de Propostas',
    iconeNome: 'FolderKanban',
    resumo:
      'Repositório central de todos os projetos de pesquisa cadastrados, com busca rápida, filtros por Faculdade/Curso, status de submissão, verificação de pendências e histórico de pareceres.',
    funcoes: [
      'Filtros dinâmicos por Centro, Curso, Área de Conhecimento e Situação',
      'Acesso ao parecer consolidado e notas atribuídas pela banca',
      'Download do projeto de pesquisa e histórico detalhado de alterações',
    ],
    papeis: {
      coordenador: 'Acesso Pleno: Visualização de todas as propostas de todos os cursos.',
      admin: 'Acesso Irrestrito: Consulta global para fiscalização e auditoria.',
      orientador: 'Acesso Individual: Acompanhamento exclusivo dos seus próprios projetos.',
      avaliador: 'Acesso Designado: Visualização dos projetos distribuídos à sua banca.',
    },
    acessoPrincipal: 'todos',
  },
  {
    id: 'banca',
    label: 'Avaliação Banca & IA',
    categoria: 'Banca Examinadora',
    iconeNome: 'Sparkles',
    resumo:
      'Workspace de avaliação de mérito técnico-científico pelo comitê de pareceristas, com notas por critérios do Anexo VI, parecer duplo-cego e análise preliminar de conformidade gerada por IA (Gemini Flash).',
    funcoes: [
      'Pontuação nos 5 quesitos regimentais (0 a 10) com média ponderada automática',
      'Parecer preliminar automatizado por IA para detecção de lacunas e consistência',
      'Comparativo entre Pareceristas 1 e 2 com mecanismo de desempate pela Coordenação',
    ],
    papeis: {
      avaliador: 'Acesso Principal: Emissão e assinatura de pareceres técnicos nos projetos.',
      coordenador: 'Gestão da Banca: Distribuição de propostas, desempates e homologação.',
      admin: 'Acesso Irrestrito: Supervisão de conformidade e integridade das avaliações.',
      orientador: 'Acesso Restrito: Sigilo da banca (visualiza apenas a nota final homologada).',
    },
    acessoPrincipal: 'banca',
    badge: 'BANCA & IA',
    badgeCor: 'bg-emerald-400 text-slate-950 font-black animate-pulse',
  },
  {
    id: 'bolsas',
    label: 'Distribuição 100 Bolsas',
    categoria: 'Concessão Institucional',
    iconeNome: 'Award',
    resumo:
      'Módulo de classificação regimental e concessão das 100 bolsas institucionais segundo o edital: 60 bolsas de Ampla Concorrência e 40 de Ações Afirmativas, respeitando o limite por orientador.',
    funcoes: [
      'Ranking automatizado decrescente aplicando a nota de corte regimental (≥ 7.0)',
      'Segregação obrigatória entre Ampla Concorrência e Ações Afirmativas',
      'Critérios regimentais de desempate e botão oficial de homologação do resultado',
    ],
    papeis: {
      coordenador: 'Acesso Deliberativo: Parametrização, alocação e homologação das bolsas.',
      admin: 'Acesso Irrestrito: Homologação institucional e publicação da portaria.',
      orientador: 'Acesso de Consulta: Relação final dos contemplados após a homologação.',
      avaliador: 'Acesso de Consulta: Classificação geral e resultado do processo seletivo.',
    },
    acessoPrincipal: 'gestao',
  },
  {
    id: 'simulador',
    label: 'Simulador "E se..."',
    categoria: 'Planejamento Estratégico',
    iconeNome: 'SlidersHorizontal',
    resumo:
      'Ambiente preditivo interativo para teste de cenários de distribuição, permitindo simular alterações nas quotas afirmativas, variações na nota de corte ou redistribuição por curso.',
    funcoes: [
      'Ajuste em tempo real de quotas (ex: 50/50, 70/30) e impacto no ranking',
      'Simulação de variação da nota de corte (ex: 6.5 a 8.5) e taxa de ocupação',
      'Comparação lado a lado com a distribuição regimental homologada',
    ],
    papeis: {
      coordenador: 'Acesso Exclusivo: Simulação de impacto orçamentário e acadêmico.',
      admin: 'Acesso Exclusivo: Apoio ao planejamento estratégico da Pró-Reitoria.',
      orientador: 'Acesso Restrito: Não disponível para garantir o sigilo das deliberações.',
      avaliador: 'Acesso Restrito: Não disponível para garantir imparcialidade da banca.',
    },
    acessoPrincipal: 'gestao',
    badge: 'E SE...',
    badgeCor: 'bg-amber-400 text-slate-950 font-bold',
  },
  {
    id: 'relatorios',
    label: 'Relatórios & Auditoria',
    categoria: 'Conformidade & LGPD',
    iconeNome: 'ShieldCheck',
    resumo:
      'Emissão de documentos comprobatórios oficiais (Ata da Reunião da Banca, Resultados em PDF, Listas de Classificação) e trilha cronológica de auditoria e conformidade com a LGPD.',
    funcoes: [
      'Geração e download da Ata Oficial de Homologação da Banca em PDF',
      'Relação nominal pública de orientadores e bolsistas contemplados',
      'Trilha de auditoria LGPD com registro de IP, data/hora e autor da operação',
    ],
    papeis: {
      coordenador: 'Acesso Pleno: Emissão de atas, relatórios oficiais e auditoria.',
      admin: 'Acesso Irrestrito: Auditoria de conformidade, segurança e integridade.',
      orientador: 'Acesso Parcial: Download de comprovantes de submissão de seus projetos.',
      avaliador: 'Acesso Parcial: Emissão de declaração de participação na banca.',
    },
    acessoPrincipal: 'gestao',
    badge: 'PDF & LOGS',
    badgeCor: 'bg-rose-500 text-white font-bold',
  },
];
