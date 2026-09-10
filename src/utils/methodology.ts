import { TipoMetodo, DesenhoPesquisa } from '../types/index.ts';

export interface ScoreMetodologicoCalculado {
  pontuacaoDesenho: number; // máx 5.00
  pontuacaoAmostra: number; // máx 3.00
  pontuacaoTipo: number; // máx 2.00
  scoreTotal: number; // máx 10.00
  nivelHierarquia: number; // 1 (Randomizado) a 5 (In vitro)
  classificacaoAmostraLabel: string;
  resumoRigor: string;
}

/**
 * Ordem e Pontuação Regimental do Desenho da Pesquisa:
 * 1. Ensaio Clínico Randomizado: 5.00 pts (Nível 1 - Padrão-ouro experimental)
 * 2. Ensaio de Roda / Estudo de coorte: 4.00 pts (Nível 2 - Analítico prospectivo / coorte)
 * 3. Caso controle: 3.00 pts (Nível 3 - Analítico retrospectivo)
 * 4. Relato de caso: 2.00 pts (Nível 4 - Descritivo observacional)
 * 5. Estudo in vitro: 1.00 pt (Nível 5 - Experimental de bancada / pré-clínico)
 */
export const HIERARQUIA_DESENHOS: Record<
  DesenhoPesquisa,
  {
    ordem: number;
    pontos: number;
    sigla: string;
    classificacao: string;
    descricao: string;
    corBadge: string;
  }
> = {
  'Ensaio Clínico Randomizado': {
    ordem: 1,
    pontos: 5.0,
    sigla: 'ECR',
    classificacao: 'Nível 1 - Máxima Evidência Intervencionista',
    descricao: 'Ensaio Clínico Randomizado com grupo controle, mascaramento e alocação aleatória.',
    corBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  'Ensaio de Roda / Estudo de coorte': {
    ordem: 2,
    pontos: 4.0,
    sigla: 'COORTE',
    classificacao: 'Nível 2 - Analítico Longitudinal / Coorte',
    descricao: 'Estudo de coorte prospectivo ou delineamento em roda com acompanhamento temporal de desfechos.',
    corBadge: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  'Caso controle': {
    ordem: 3,
    pontos: 3.0,
    sigla: 'CASO-CTRL',
    classificacao: 'Nível 3 - Analítico Retrospectivo',
    descricao: 'Investigação observacional retrospectiva pareando casos e controles para cálculo de odds ratio.',
    corBadge: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  },
  'Relato de caso': {
    ordem: 4,
    pontos: 2.0,
    sigla: 'RELATO',
    classificacao: 'Nível 4 - Descritivo Observacional',
    descricao: 'Série de casos clínicos ou relato observacional aprofundado com achados diagnósticos raros.',
    corBadge: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  'Estudo in vitro': {
    ordem: 5,
    pontos: 1.0,
    sigla: 'IN-VITRO',
    classificacao: 'Nível 5 - Experimental Pré-Clínico',
    descricao: 'Ensaio experimental laboratorial em cultura celular, bancada físico-química ou modelo acelular.',
    corBadge: 'bg-purple-50 text-purple-800 border-purple-300',
  },
};

/**
 * Calcula a pontuação da amostra com base no tamanho (N) e na abordagem metodológica.
 */
export function calcularPontuacaoAmostra(
  tipo: TipoMetodo,
  tamanhoAmostra: number
): { pontos: number; label: string } {
  const n = Math.max(1, Number(tamanhoAmostra) || 1);

  if (tipo === 'Quantitativo') {
    if (n >= 100) {
      return { pontos: 3.0, label: 'Amostra Robusta (N ≥ 100) - Alta representatividade' };
    } else if (n >= 50) {
      return { pontos: 2.25, label: 'Amostra Significativa (N: 50–99) - Poder estatístico validado' };
    } else if (n >= 20) {
      return { pontos: 1.5, label: 'Amostra Moderada (N: 20–49)' };
    } else {
      return { pontos: 0.75, label: 'Amostra Piloto / Preliminar (N < 20)' };
    }
  } else {
    // Abordagem Qualitativa
    if (n >= 30) {
      return { pontos: 3.0, label: 'Saturação Teórica Plena (N ≥ 30 sujeitos/grupos)' };
    } else if (n >= 15) {
      return { pontos: 2.25, label: 'Amostra Qualificada (N: 15–29 sujeitos)' };
    } else if (n >= 8) {
      return { pontos: 1.5, label: 'Amostra Moderada (N: 8–14 entrevistas)' };
    } else {
      return { pontos: 0.75, label: 'Estudo de Caso / Grupo Focal Único (N < 8)' };
    }
  }
}

/**
 * Calcula a pontuação da abordagem metodológica (Quantitativo vs Qualitativo).
 */
export function calcularPontuacaoTipo(tipo: TipoMetodo): number {
  return tipo === 'Quantitativo' ? 2.0 : 1.75;
}

/**
 * Realiza o cálculo integrado e ponderado do Score Metodológico (0.00 a 10.00)
 */
export function calcularScoreMetodologico(
  tipo: TipoMetodo = 'Quantitativo',
  tamanhoAmostra: number = 50,
  desenho: DesenhoPesquisa = 'Ensaio Clínico Randomizado'
): ScoreMetodologicoCalculado {
  const metaDesenho = HIERARQUIA_DESENHOS[desenho] || HIERARQUIA_DESENHOS['Ensaio Clínico Randomizado'];
  const pontuacaoDesenho = metaDesenho.pontos;

  const { pontos: pontuacaoAmostra, label: classificacaoAmostraLabel } = calcularPontuacaoAmostra(
    tipo,
    tamanhoAmostra
  );
  const pontuacaoTipo = calcularPontuacaoTipo(tipo);

  const scoreTotal = Number((pontuacaoDesenho + pontuacaoAmostra + pontuacaoTipo).toFixed(2));

  let resumoRigor = 'Elevado Rigor Metodológico';
  if (scoreTotal < 5.0) {
    resumoRigor = 'Rigor Metodológico Básico';
  } else if (scoreTotal < 7.5) {
    resumoRigor = 'Rigor Metodológico Intermediário';
  } else if (scoreTotal >= 9.0) {
    resumoRigor = 'Excelência em Desenho e Amostragem Científica';
  }

  return {
    pontuacaoDesenho,
    pontuacaoAmostra,
    pontuacaoTipo,
    scoreTotal,
    nivelHierarquia: metaDesenho.ordem,
    classificacaoAmostraLabel,
    resumoRigor,
  };
}
