import { Proposta, Edital, DesenhoPesquisa } from '../types/index.ts';
import { HIERARQUIA_DESENHOS } from './methodology.ts';

export interface ParametrosSimulacao {
  totalBolsas: number;
  percCotasAf: number; // ex: 40 para 40%
  pesoProjeto: number; // ex: 50 para 50%
  pesoOrientador: number; // ex: 30 para 30%
  pesoAluno: number; // ex: 20 para 20%
  valorBolsaMensal: number; // ex: 700
  duracaoMeses: number; // ex: 12
  bonusMetodologico: boolean; // se true, adiciona bônus de 0.50 na nota final para ECR e Coorte
}

export interface ResultadoComparativoProposta {
  propostaId: number;
  codigoFormatado: string;
  titulo: string;
  orientadorNome: string;
  discenteNome: string;
  discenteCurso: string;
  grandeArea: string;
  subarea: string;
  modalidade: string;
  metodoDesenho?: string;
  
  // Notas e Ranking Oficial
  notaOficial: number;
  rankOficial: number;
  statusOficial: 'Ampla Concorrência' | 'Ações Afirmativas' | 'Lista de Espera' | 'Sob Deliberação';
  
  // Notas e Ranking Simulado
  notaSimulada: number;
  rankSimulado: number;
  statusSimulado: 'Ampla Concorrência' | 'Ações Afirmativas' | 'Lista de Espera' | 'Sob Deliberação';
  
  // Diferenças
  deltaRank: number; // rankOficial - rankSimulado (positivo = subiu posições)
  deltaNota: number;
  movimentacaoStatus: 'NOVO_CONTEMPLADO' | 'PERDEU_BOLSA' | 'MANTEVE_BOLSA' | 'MANTEVE_ESPERA';
}

export interface MetricasCenario {
  totalBolsas: number;
  vagasAC: number;
  vagasAF: number;
  bolsasConcedidasAC: number;
  bolsasConcedidasAF: number;
  custoMensal: number;
  custoAnual: number;
  corteAC: number;
  corteAF: number;
}

export interface RelatorioImpactoSimulacao {
  parametros: ParametrosSimulacao;
  oficial: MetricasCenario;
  simulado: MetricasCenario;
  deltaCustoMensal: number;
  deltaCustoAnual: number;
  novosContempladosCount: number;
  perderamBolsaCount: number;
  mantiveramBolsaCount: number;
  propostasComparadas: ResultadoComparativoProposta[];
  distribuicaoPorArea: Array<{
    area: string;
    bolsasOficial: number;
    bolsasSimulado: number;
    totalProjetos: number;
    percSimulado: number;
  }>;
}

export const PARAMETROS_PADRAO_EDITAL: ParametrosSimulacao = {
  totalBolsas: 100,
  percCotasAf: 40,
  pesoProjeto: 50,
  pesoOrientador: 30,
  pesoAluno: 20,
  valorBolsaMensal: 700,
  duracaoMeses: 12,
  bonusMetodologico: false,
};

/**
 * Calcula a simulação completa de sensibilidade e "dança das cadeiras"
 */
export function simularCenario(
  propostas: Proposta[],
  params: ParametrosSimulacao,
  edital?: Edital | null
): RelatorioImpactoSimulacao {
  const vagasAFSimuladas = Math.round((params.totalBolsas * params.percCotasAf) / 100);
  const vagasACSimuladas = params.totalBolsas - vagasAFSimuladas;

  // Parâmetros oficiais padrão
  const vagasAFOficiais = 40;
  const vagasACOficiais = 60;

  // Filtrar propostas válidas com avaliações ou cálculos
  const validas = propostas.filter((p) => p.calculo || (p.avaliacoes && p.avaliacoes.length > 0));

  // 1. Coleta e ordenação do cenário OFICIAL
  const listaOficial = [...validas].sort((a, b) => {
    const notaA = parseFloat(a.calculo?.notaFinalPonderada || '0');
    const notaB = parseFloat(b.calculo?.notaFinalPonderada || '0');
    if (notaB !== notaA) return notaB - notaA;
    return a.id - b.id;
  });

  const mapaOficial = new Map<number, { rank: number; status: 'Ampla Concorrência' | 'Ações Afirmativas' | 'Lista de Espera' | 'Sob Deliberação'; nota: number }>();
  let rankACOficial = 1;
  let rankAFOficial = 1;

  listaOficial.forEach((p, index) => {
    const rankGeral = index + 1;
    const nota = parseFloat(p.calculo?.notaFinalPonderada || '0');
    let status: 'Ampla Concorrência' | 'Ações Afirmativas' | 'Lista de Espera' | 'Sob Deliberação' = 'Lista de Espera';

    if (p.calculo?.divergenciaDetectada) {
      status = 'Sob Deliberação';
    } else if (p.modalidade === 'Ações Afirmativas') {
      if (rankAFOficial <= vagasAFOficiais) {
        status = 'Ações Afirmativas';
        rankAFOficial++;
      } else if (rankACOficial <= vagasACOficiais) {
        status = 'Ampla Concorrência';
        rankACOficial++;
      }
    } else {
      if (rankACOficial <= vagasACOficiais) {
        status = 'Ampla Concorrência';
        rankACOficial++;
      }
    }

    mapaOficial.set(p.id, { rank: rankGeral, status, nota });
  });

  // 2. Cálculo do cenário SIMULADO
  // Normalizar pesos para somarem 1.0 (100%)
  const somaPesos = (params.pesoProjeto + params.pesoOrientador + params.pesoAluno) || 100;
  const pProj = params.pesoProjeto / somaPesos;
  const pOrient = params.pesoOrientador / somaPesos;
  const pAluno = params.pesoAluno / somaPesos;

  const listaSimulada = validas.map((p) => {
    // Nota Projeto (Etapa 2 Mérito 0-6 normalizado para 0-10)
    let mediaProjeto6 = 0;
    if (p.calculo?.mediaEtapa2Merito) {
      mediaProjeto6 = parseFloat(p.calculo.mediaEtapa2Merito);
    } else if (p.avaliacoes && p.avaliacoes.length > 0) {
      const soma = p.avaliacoes.reduce((acc, a) => acc + parseFloat(a.notaMeritoTotal || '0'), 0);
      mediaProjeto6 = soma / p.avaliacoes.length;
    }
    const notaProjeto10 = (mediaProjeto6 / 6.0) * 10;

    // Nota Orientador (Lattes 0-4 normalizado para 0-10)
    const lattes4 = p.orientador?.notaLattes ? parseFloat(p.orientador.notaLattes) : 3.0;
    const notaOrientador10 = (lattes4 / 4.0) * 10;

    // Nota Aluno (CR 0-10)
    const notaAluno10 = p.discenteCr ? parseFloat(String(p.discenteCr)) : 7.5;

    // Bônus metodológico simulado (opcional)
    let bonus = 0;
    if (params.bonusMetodologico) {
      if (p.metodoDesenho === 'Ensaio Clínico Randomizado') bonus = 0.50;
      else if (p.metodoDesenho === 'Ensaio de Roda / Estudo de coorte') bonus = 0.30;
      else if (p.metodoDesenho === 'Caso controle') bonus = 0.15;
    }

    let notaSimulada = notaProjeto10 * pProj + notaOrientador10 * pOrient + notaAluno10 * pAluno + bonus;
    if (notaSimulada > 10) notaSimulada = 10;

    return {
      proposta: p,
      notaSimulada: parseFloat(notaSimulada.toFixed(2)),
    };
  });

  // Ordenar lista simulada
  listaSimulada.sort((a, b) => {
    if (b.notaSimulada !== a.notaSimulada) return b.notaSimulada - a.notaSimulada;
    // Critérios de desempate
    if (a.proposta.orientador?.vinculoStrictoSensu !== b.proposta.orientador?.vinculoStrictoSensu) {
      return a.proposta.orientador?.vinculoStrictoSensu ? -1 : 1;
    }
    const artA = a.proposta.orientador?.artigosUltimos3Anos || 0;
    const artB = b.proposta.orientador?.artigosUltimos3Anos || 0;
    if (artB !== artA) return artB - artA;
    return a.proposta.id - b.proposta.id;
  });

  // Atribuir vagas simuladas
  let rankACSimulado = 1;
  let rankAFSimulado = 1;

  let corteACSimulado = 10;
  let corteAFSimulado = 10;
  let corteACOficial = 10;
  let corteAFOficial = 10;

  let novosContempladosCount = 0;
  let perderamBolsaCount = 0;
  let mantiveramBolsaCount = 0;

  const propostasComparadas: ResultadoComparativoProposta[] = [];

  listaSimulada.forEach((item, index) => {
    const p = item.proposta;
    const rankSimulado = index + 1;
    const notaSimulada = item.notaSimulada;

    let statusSimulado: 'Ampla Concorrência' | 'Ações Afirmativas' | 'Lista de Espera' | 'Sob Deliberação' = 'Lista de Espera';

    if (p.calculo?.divergenciaDetectada) {
      statusSimulado = 'Sob Deliberação';
    } else if (p.modalidade === 'Ações Afirmativas') {
      if (rankAFSimulado <= vagasAFSimuladas) {
        statusSimulado = 'Ações Afirmativas';
        corteAFSimulado = Math.min(corteAFSimulado, notaSimulada);
        rankAFSimulado++;
      } else if (rankACSimulado <= vagasACSimuladas) {
        statusSimulado = 'Ampla Concorrência';
        corteACSimulado = Math.min(corteACSimulado, notaSimulada);
        rankACSimulado++;
      }
    } else {
      if (rankACSimulado <= vagasACSimuladas) {
        statusSimulado = 'Ampla Concorrência';
        corteACSimulado = Math.min(corteACSimulado, notaSimulada);
        rankACSimulado++;
      }
    }

    const infoOficial = mapaOficial.get(p.id) || {
      rank: 99,
      status: 'Lista de Espera' as const,
      nota: 0,
    };

    if (infoOficial.status === 'Ampla Concorrência') {
      corteACOficial = Math.min(corteACOficial, infoOficial.nota);
    } else if (infoOficial.status === 'Ações Afirmativas') {
      corteAFOficial = Math.min(corteAFOficial, infoOficial.nota);
    }

    const tinhaBolsa = infoOficial.status === 'Ampla Concorrência' || infoOficial.status === 'Ações Afirmativas';
    const temBolsaSimulada = statusSimulado === 'Ampla Concorrência' || statusSimulado === 'Ações Afirmativas';

    let movimentacaoStatus: 'NOVO_CONTEMPLADO' | 'PERDEU_BOLSA' | 'MANTEVE_BOLSA' | 'MANTEVE_ESPERA' = 'MANTEVE_ESPERA';

    if (!tinhaBolsa && temBolsaSimulada) {
      movimentacaoStatus = 'NOVO_CONTEMPLADO';
      novosContempladosCount++;
    } else if (tinhaBolsa && !temBolsaSimulada) {
      movimentacaoStatus = 'PERDEU_BOLSA';
      perderamBolsaCount++;
    } else if (tinhaBolsa && temBolsaSimulada) {
      movimentacaoStatus = 'MANTEVE_BOLSA';
      mantiveramBolsaCount++;
    } else {
      movimentacaoStatus = 'MANTEVE_ESPERA';
    }

    propostasComparadas.push({
      propostaId: p.id,
      codigoFormatado: `#PIC-${String(p.id).padStart(3, '0')}`,
      titulo: p.titulo,
      orientadorNome: p.orientador?.nome || p.orientador?.usuarioNome || 'Orientador',
      discenteNome: p.discenteNome,
      discenteCurso: p.discenteCurso,
      grandeArea: p.grandeArea,
      subarea: p.subarea,
      modalidade: p.modalidade,
      metodoDesenho: p.metodoDesenho,
      notaOficial: infoOficial.nota,
      rankOficial: infoOficial.rank,
      statusOficial: infoOficial.status,
      notaSimulada,
      rankSimulado,
      statusSimulado,
      deltaRank: infoOficial.rank - rankSimulado, // ex: era 5º virou 2º -> 5 - 2 = +3 subiu
      deltaNota: parseFloat((notaSimulada - infoOficial.nota).toFixed(2)),
      movimentacaoStatus,
    });
  });

  // Métricas financeiras
  const custoMensalOficial = 100 * 700;
  const custoAnualOficial = custoMensalOficial * 12;

  const custoMensalSimulado = params.totalBolsas * params.valorBolsaMensal;
  const custoAnualSimulado = custoMensalSimulado * params.duracaoMeses;

  // Distribuição por Curso de Graduação (Edital PIC-UNIG)
  const cursosSet = new Set(validas.map((p) => p.discenteCurso));
  const distribuicaoPorCurso = Array.from(cursosSet).map((curso) => {
    const totalCurso = validas.filter((p) => p.discenteCurso === curso).length;
    const bolsasOficial = propostasComparadas.filter(
      (p) => p.discenteCurso === curso && (p.statusOficial === 'Ampla Concorrência' || p.statusOficial === 'Ações Afirmativas')
    ).length;
    const bolsasSimulado = propostasComparadas.filter(
      (p) => p.discenteCurso === curso && (p.statusSimulado === 'Ampla Concorrência' || p.statusSimulado === 'Ações Afirmativas')
    ).length;

    return {
      curso,
      area: curso, // Compatibilidade com componentes que leem dataKey area
      totalProjetos: totalCurso,
      bolsasOficial,
      bolsasSimulado,
      percSimulado: params.totalBolsas > 0 ? Math.round((bolsasSimulado / params.totalBolsas) * 100) : 0,
    };
  });

  const distribuicaoPorArea = distribuicaoPorCurso;

  return {
    parametros: params,
    oficial: {
      totalBolsas: 100,
      vagasAC: vagasACOficiais,
      vagasAF: vagasAFOficiais,
      bolsasConcedidasAC: rankACOficial - 1,
      bolsasConcedidasAF: rankAFOficial - 1,
      custoMensal: custoMensalOficial,
      custoAnual: custoAnualOficial,
      corteAC: corteACOficial === 10 ? 0 : corteACOficial,
      corteAF: corteAFOficial === 10 ? 0 : corteAFOficial,
    },
    simulado: {
      totalBolsas: params.totalBolsas,
      vagasAC: vagasACSimuladas,
      vagasAF: vagasAFSimuladas,
      bolsasConcedidasAC: rankACSimulado - 1,
      bolsasConcedidasAF: rankAFSimulado - 1,
      custoMensal: custoMensalSimulado,
      custoAnual: custoAnualSimulado,
      corteAC: corteACSimulado === 10 ? 0 : corteACSimulado,
      corteAF: corteAFSimulado === 10 ? 0 : corteAFSimulado,
    },
    deltaCustoMensal: custoMensalSimulado - custoMensalOficial,
    deltaCustoAnual: custoAnualSimulado - custoAnualOficial,
    novosContempladosCount,
    perderamBolsaCount,
    mantiveramBolsaCount,
    propostasComparadas,
    distribuicaoPorArea,
  };
}
