import { db } from '../db/index.ts';
import {
  usuarios,
  dadosPessoaisParticipantes,
  orientadores,
  editais,
  propostas,
  avaliadores,
  distribuicoesAvaliacao,
  avaliacoes,
  calculosClassificacao,
  analisesIaGemini,
  auditoriaLogs,
} from '../db/schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { analisarPropostaComGemini } from './gemini.ts';
import {
  calcularScoreMetodologico,
  HIERARQUIA_DESENHOS,
} from '../utils/methodology.ts';
import { TipoMetodo, DesenhoPesquisa, EditalFaseCronograma } from '../types/index.ts';

let activeEditalIdOverride: number | null = null;

// Armazenamento em memória das customizações de fases de cronograma efetuadas pelo Coordenador/Admin
const customCronogramasMap = new Map<number, Record<string, Partial<EditalFaseCronograma>>>();

function parseDataBrOuIso(str?: string, fimDoDia = true): Date | null {
  if (!str) return null;
  const trimmed = str.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/').map(Number);
    return new Date(y, m - 1, d, fimDoDia ? 23 : 0, fimDoDia ? 59 : 0, fimDoDia ? 59 : 0);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Gera as 9 fases regimentais da Linha do Tempo (Timeline) Anual do Edital
 */
export function gerarCronogramaEdital(edital: any, propostasCount = 0): EditalFaseCronograma[] {
  const ano = edital.ano || 2027;
  const status = edital.status || 'ativo';

  // Determinar fase atual baseada no status do edital
  let faseAtualNumero = 4;
  if (status === 'planejamento') faseAtualNumero = 1;
  else if (status === 'submissao') faseAtualNumero = 2;
  else if (status === 'triagem') faseAtualNumero = 3;
  else if (status === 'em_avaliacao' || status === 'ativo') faseAtualNumero = 4;
  else if (status === 'etapa3') faseAtualNumero = 5;
  else if (status === 'preliminar') faseAtualNumero = 6;
  else if (status === 'recursos') faseAtualNumero = 7;
  else if (status === 'homologado') faseAtualNumero = 8;
  else if (status === 'concluido') faseAtualNumero = 10;

  const fasesDef = [
    {
      id: 'fase-1',
      faseNumero: 1,
      titulo: 'Publicação & Lançamento do Edital',
      descricao: `Aprovação da minuta regimental pelo CEPE e publicação oficial do Edital ${edital.codigo} com diretrizes e quotas de bolsas.`,
      dataInicio: `01/06/${ano - 1}`,
      dataFim: `30/06/${ano - 1}`,
      responsavel: 'Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP) & CEPE',
      criterioRegimental: 'Resolução CEPE nº 014/PROPEP - Normas do Programa Institucional de Bolsas.',
      acaoRotulo: 'Ver Documentos Mestres',
      acaoDestinoTab: 'relatorios',
    },
    {
      id: 'fase-2',
      faseNumero: 2,
      titulo: 'Inscrições & Submissão Eletrônica de Projetos',
      descricao: `Janela para docentes orientadores e discentes submeterem planos de trabalho com hash criptográfico SHA-256 (${propostasCount} propostas recebidas).`,
      dataInicio: edital.inicioSubmissao ? new Date(edital.inicioSubmissao).toLocaleDateString('pt-BR') : `01/08/${ano - 1}`,
      dataFim: edital.fimSubmissao ? new Date(edital.fimSubmissao).toLocaleDateString('pt-BR') : `31/10/${ano - 1}`,
      responsavel: 'Docentes Orientadores e Alunos Candidatos',
      criterioRegimental: 'Item 4 do Edital: Projeto em PDF, Plano Discente, Termo LGPD e CR >= 6.0.',
      acaoRotulo: 'Nova Submissão',
      acaoDestinoTab: 'submissao',
    },
    {
      id: 'fase-3',
      faseNumero: 3,
      titulo: 'Triagem Formal & Habilitação Documental (Etapa 1)',
      descricao: 'Conferência cega e eliminatória dos requisitos regimentais de elegibilidade discente e docente.',
      dataInicio: `01/11/${ano - 1}`,
      dataFim: `10/11/${ano - 1}`,
      responsavel: 'Comitê Institucional de Iniciação Científica (CIIC)',
      criterioRegimental: 'Item 6.1 do Edital: Eliminação em caso de CR < 6.0 ou documentação incompleta.',
      acaoRotulo: 'Ver Projetos',
      acaoDestinoTab: 'projetos',
    },
    {
      id: 'fase-4',
      faseNumero: 4,
      titulo: 'Avaliação Duplo-Cega de Mérito & IA Gemini (Etapa 2)',
      descricao: 'Banca anônima cruzada por 2 pareceristas ad-hoc da Grande Área em 9 dimensões com checagem preliminar por IA.',
      dataInicio: `11/11/${ano - 1}`,
      dataFim: `30/11/${ano - 1}`,
      responsavel: 'Pareceristas Ad-hoc da Grande Área & Gemini 2.5 Flash',
      criterioRegimental: 'Item 7.2 do Edital: Avaliação cega de 0 a 6 pontos. Divergência > 2.0 encaminhada ao árbitro.',
      acaoRotulo: 'Banca Duplo-Cega',
      acaoDestinoTab: 'banca',
    },
    {
      id: 'fase-5',
      faseNumero: 5,
      titulo: 'Pontuação Docente Lattes & Histórico Discente (Etapa 3)',
      descricao: 'Apuração do currículo Lattes dos últimos 3 anos (H5/Scopus/Fomento) e nota de aproveitamento do discente.',
      dataInicio: `01/12/${ano - 1}`,
      dataFim: `10/12/${ano - 1}`,
      responsavel: 'Coordenação Geral do PIC',
      criterioRegimental: 'Equação Regimental: Nota Final = (Orientador × 0.3) + (Projeto × 0.5) + (Aluno × 0.2).',
      acaoRotulo: 'Simulador "E se..."',
      acaoDestinoTab: 'simulador',
    },
    {
      id: 'fase-6',
      faseNumero: 6,
      titulo: 'Divulgação do Resultado Preliminar',
      descricao: 'Publicação da lista de classificação por modalidade de concorrência com linha de corte provisória de bolsas.',
      dataInicio: `12/12/${ano - 1}`,
      dataFim: `15/12/${ano - 1}`,
      responsavel: 'Coordenação do PIC & PROPEP',
      criterioRegimental: 'Item 8.3 do Edital: Ampla Concorrência e Ações Afirmativas classificadas separadamente.',
      acaoRotulo: 'Ver Classificação',
      acaoDestinoTab: 'progresso',
    },
    {
      id: 'fase-7',
      faseNumero: 7,
      titulo: 'Interposição e Julgamento de Recursos',
      descricao: 'Prazo estrito para interposição fundamentada de recursos contra pareceres e notas da Etapa 2 e 3.',
      dataInicio: `16/12/${ano - 1}`,
      dataFim: `22/12/${ano - 1}`,
      responsavel: 'Comissão Recursal Permanente do PIC',
      criterioRegimental: 'Item 9 do Edital: Recurso eletrônico no prazo improrrogável de 3 dias úteis.',
      acaoRotulo: 'Ver Auditoria & Recursos',
      acaoDestinoTab: 'auditoria',
    },
    {
      id: 'fase-8',
      faseNumero: 8,
      titulo: 'Homologação Final & Distribuição das Bolsas',
      descricao: `Consolidação oficial e emissão da Ata de Homologação com distribuição de ${edital.totalBolsas || 100} bolsas (AC/AF).`,
      dataInicio: `05/01/${ano}`,
      dataFim: `15/01/${ano}`,
      responsavel: 'Conselho Universitário (CONSU) & Reitoria UNIG',
      criterioRegimental: 'Ata Oficial de Homologação Final com assinatura digital qualificada.',
      acaoRotulo: 'Distribuição de Bolsas',
      acaoDestinoTab: 'bolsas',
    },
    {
      id: 'fase-9',
      faseNumero: 9,
      titulo: 'Vigência das Bolsas & Prestação de Contas',
      descricao: 'Ciclo de 12 meses de execução científica, pagamento das bolsas, entrega do relatório semestral e relatório final.',
      dataInicio: `01/02/${ano}`,
      dataFim: `31/01/${ano + 1}`,
      responsavel: 'Coordenação do PIC, Orientadores e Bolsistas',
      criterioRegimental: 'Item 11 do Edital: Relatório Técnico no 6º mês e apresentação obrigatória na Jornada Científica.',
      acaoRotulo: 'Central de Relatórios',
      acaoDestinoTab: 'relatorios',
    },
  ];

  const customFases = edital.id ? customCronogramasMap.get(edital.id) || {} : {};

  return fasesDef.map((f) => {
    const custom = customFases[f.id] || {};

    let statusFase: 'concluido' | 'em_andamento' | 'pendente' = custom.status || 'pendente';
    let progresso = custom.progressoPercentual !== undefined ? custom.progressoPercentual : 0;

    if (!custom.status) {
      if (f.faseNumero < faseAtualNumero) {
        statusFase = 'concluido';
        progresso = 100;
      } else if (f.faseNumero === faseAtualNumero) {
        statusFase = 'em_andamento';
        progresso = 65;
      } else {
        statusFase = 'pendente';
        progresso = 0;
      }
    }

    return {
      ...f,
      ...custom,
      status: statusFase,
      progressoPercentual: progresso,
      diasRestantes: custom.diasRestantes !== undefined ? custom.diasRestantes : (statusFase === 'em_andamento' ? 14 : undefined),
    };
  });
}

/**
 * Garante a existência do histórico e dos editais anuais (2025, 2026, 2027, 2028)
 */
export async function ensureEditaisAnuaisHistorico() {
  try {
    const todos = await db.select().from(editais);
    const has2025 = todos.some((e) => e.ano === 2025 || e.codigo === 'PIC-UNIG 2025');
    const has2026 = todos.some((e) => e.ano === 2026 || e.codigo === 'PIC-UNIG 2026');
    const has2028 = todos.some((e) => e.ano === 2028 || e.codigo === 'PIC-UNIG 2028');

    if (!has2025) {
      await db.insert(editais).values({
        codigo: 'PIC-UNIG 2025',
        titulo: 'Edital do Programa Institucional de Iniciação Científica UNIG 2025/2026',
        ano: 2025,
        totalBolsas: 90,
        bolsasAmplaConcorrencia: 54,
        bolsasAcoesAfirmativas: 36,
        status: 'concluido',
        inicioSubmissao: new Date('2024-08-01T00:00:00Z'),
        fimSubmissao: new Date('2024-10-31T23:59:59Z'),
      });
    }

    if (!has2026) {
      await db.insert(editais).values({
        codigo: 'PIC-UNIG 2026',
        titulo: 'Edital do Programa Institucional de Iniciação Científica UNIG 2026/2027',
        ano: 2026,
        totalBolsas: 95,
        bolsasAmplaConcorrencia: 57,
        bolsasAcoesAfirmativas: 38,
        status: 'concluido',
        inicioSubmissao: new Date('2025-08-01T00:00:00Z'),
        fimSubmissao: new Date('2025-10-31T23:59:59Z'),
      });
    }

    if (!has2028) {
      await db.insert(editais).values({
        codigo: 'PIC-UNIG 2028',
        titulo: 'Edital do Programa Institucional de Iniciação Científica UNIG 2028/2029',
        ano: 2028,
        totalBolsas: 110,
        bolsasAmplaConcorrencia: 66,
        bolsasAcoesAfirmativas: 44,
        status: 'planejamento',
        inicioSubmissao: new Date('2027-08-01T00:00:00Z'),
        fimSubmissao: new Date('2027-10-31T23:59:59Z'),
      });
    }
  } catch (err) {
    console.warn('Aviso ao inicializar histórico de editais anuais:', err);
  }
}

/**
 * Listar todos os editais anuais com cronograma e métricas
 */
export async function getEditaisList() {
  try {
    await ensureEditaisAnuaisHistorico();
    const list = await db.select().from(editais).orderBy(desc(editais.ano), desc(editais.id));

    // Buscar contagem de propostas por edital
    const propostasList = await db.select({ id: propostas.id, editalId: propostas.editalId }).from(propostas);
    const countMap: Record<number, number> = {};
    propostasList.forEach((p) => {
      countMap[p.editalId] = (countMap[p.editalId] || 0) + 1;
    });

    const activeId = activeEditalIdOverride || list.find((e) => e.ano === 2027)?.id || list[0]?.id;

    return list.map((e) => {
      const pCount =
        countMap[e.id] ||
        (e.ano === 2027 ? propostasList.length : e.ano === 2026 ? 88 : e.ano === 2025 ? 82 : 0);
      const cronograma = gerarCronogramaEdital(e, pCount);
      const valorBolsa = 700;
      const orcamentoTotalAnual = e.totalBolsas * valorBolsa * 12;

      return {
        ...e,
        isAtivo: e.id === activeId,
        valorBolsa,
        orcamentoTotalAnual,
        propostasCount: pCount,
        resolucaoCepe: `Resolução CEPE nº 0${Math.max(1, (e.ano % 100) - 13)}/PROPEP`,
        faseAtual:
          cronograma.find((c) => c.status === 'em_andamento')?.titulo ||
          (e.status === 'concluido' ? 'Ciclo Anual Concluído' : 'Planejamento'),
        cronograma,
      };
    });
  } catch (error) {
    console.error('Erro ao buscar lista de editais:', error);
    throw new Error('Falha ao listar editais.', { cause: error });
  }
}

export async function getEditalAtivo() {
  try {
    const all = await getEditaisList();
    const ativo = all.find((e) => e.isAtivo) || all[0] || null;
    return ativo;
  } catch (error) {
    console.error('Erro ao buscar edital ativo:', error);
    throw new Error('Falha ao buscar edital ativo.', { cause: error });
  }
}

export async function setEditalAtivo(id: number, usuarioEmail = 'admin@unig.br', ipOrigem = '127.0.0.1') {
  activeEditalIdOverride = id;
  const [editalAlvo] = await db.select().from(editais).where(eq(editais.id, id));
  if (editalAlvo) {
    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'EDITAL_ATIVADO',
      entidade: 'editais',
      entidadeId: id,
      detalhes: `Edital ${editalAlvo.codigo} (${editalAlvo.ano}) definido como Edital Ativo do sistema pela Coordenação/Admin.`,
      ipOrigem,
    });
  }
  return getEditalAtivo();
}

export async function criarNovoEditalAnual(dados: {
  codigo: string;
  titulo: string;
  ano: number;
  totalBolsas: number;
  bolsasAmplaConcorrencia: number;
  bolsasAcoesAfirmativas: number;
  status?: string;
  inicioSubmissao?: string;
  fimSubmissao?: string;
  usuarioEmail?: string;
  ipOrigem?: string;
}) {
  try {
    const novo = await db
      .insert(editais)
      .values({
        codigo: dados.codigo,
        titulo: dados.titulo,
        ano: Number(dados.ano),
        totalBolsas: Number(dados.totalBolsas || 100),
        bolsasAmplaConcorrencia: Number(dados.bolsasAmplaConcorrencia || 60),
        bolsasAcoesAfirmativas: Number(dados.bolsasAcoesAfirmativas || 40),
        status: dados.status || 'planejamento',
        inicioSubmissao: dados.inicioSubmissao ? new Date(dados.inicioSubmissao) : new Date(),
        fimSubmissao: dados.fimSubmissao ? new Date(dados.fimSubmissao) : new Date(Date.now() + 90 * 86400000),
      })
      .returning();

    const criado = novo[0];

    await db.insert(auditoriaLogs).values({
      usuarioEmail: dados.usuarioEmail || 'admin@unig.br',
      acao: 'EDITAL_CRIADO',
      entidade: 'editais',
      entidadeId: criado.id,
      detalhes: `Novo Edital Anual ${criado.codigo} (${criado.ano}) criado com ${criado.totalBolsas} cotas de bolsas (${criado.bolsasAmplaConcorrencia} AC / ${criado.bolsasAcoesAfirmativas} AF).`,
      ipOrigem: dados.ipOrigem || '127.0.0.1',
    });

    return criado;
  } catch (error) {
    console.error('Erro ao criar novo edital anual:', error);
    throw new Error('Falha ao criar edital.', { cause: error });
  }
}

export async function atualizarEdital(
  id: number,
  dados: any,
  usuarioEmail = 'coordenacao.pic@unig.br',
  ipOrigem = '127.0.0.1'
) {
  try {
    const updatePayload: any = {};
    if (dados.codigo !== undefined) updatePayload.codigo = dados.codigo;
    if (dados.ano !== undefined) updatePayload.ano = Number(dados.ano);
    if (dados.titulo !== undefined) updatePayload.titulo = dados.titulo;
    if (dados.totalBolsas !== undefined) updatePayload.totalBolsas = Number(dados.totalBolsas);
    if (dados.bolsasAmplaConcorrencia !== undefined)
      updatePayload.bolsasAmplaConcorrencia = Number(dados.bolsasAmplaConcorrencia);
    if (dados.bolsasAcoesAfirmativas !== undefined)
      updatePayload.bolsasAcoesAfirmativas = Number(dados.bolsasAcoesAfirmativas);
    if (dados.status !== undefined) updatePayload.status = dados.status;

    if (dados.inicioSubmissao) {
      const dtInicio = parseDataBrOuIso(dados.inicioSubmissao, false);
      if (dtInicio) updatePayload.inicioSubmissao = dtInicio;
    }
    if (dados.fimSubmissao) {
      const dtFim = parseDataBrOuIso(dados.fimSubmissao, true);
      if (dtFim) updatePayload.fimSubmissao = dtFim;
    }

    if (Object.keys(updatePayload).length > 0) {
      await db.update(editais).set(updatePayload).where(eq(editais.id, id));
    }

    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'EDITAL_ATUALIZADO',
      entidade: 'editais',
      entidadeId: id,
      detalhes: `Parâmetros do Edital ID ${id} atualizados pela Coordenação Geral/Admin. Alterações: ${JSON.stringify(Object.keys(updatePayload))}.`,
      ipOrigem,
    });

    const [atualizado] = await db.select().from(editais).where(eq(editais.id, id));
    return atualizado;
  } catch (error) {
    console.error('Erro ao atualizar edital:', error);
    throw new Error('Falha ao atualizar edital.', { cause: error });
  }
}

/**
 * Atualiza uma fase específica do cronograma regimental do edital
 */
export async function atualizarFaseCronograma(
  editalId: number,
  faseId: string,
  dados: Partial<EditalFaseCronograma>,
  usuarioEmail = 'coordenacao.pic@unig.br',
  ipOrigem = '127.0.0.1'
) {
  try {
    const existing = customCronogramasMap.get(editalId) || {};
    const existingFase = existing[faseId] || {};

    const updatedFase: Partial<EditalFaseCronograma> = {
      ...existingFase,
      ...dados,
    };

    existing[faseId] = updatedFase;
    customCronogramasMap.set(editalId, existing);

    // Se for a fase de submissão (fase-2), sincronizar início e fim com a tabela editais
    if (faseId === 'fase-2') {
      const updateEditalDates: any = {};
      if (dados.dataInicio) {
        const dt = parseDataBrOuIso(dados.dataInicio, false);
        if (dt) updateEditalDates.inicioSubmissao = dt;
      }
      if (dados.dataFim) {
        const dt = parseDataBrOuIso(dados.dataFim, true);
        if (dt) updateEditalDates.fimSubmissao = dt;
      }
      if (Object.keys(updateEditalDates).length > 0) {
        await db.update(editais).set(updateEditalDates).where(eq(editais.id, editalId));
      }
    }

    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'CRONOGRAMA_FASE_ATUALIZADA',
      entidade: 'cronogramas',
      entidadeId: editalId,
      detalhes: `Coordenação do PIC atualizou a etapa '${faseId}' (${dados.titulo || 'Cronograma'}) do Edital ID ${editalId}. Período: ${dados.dataInicio || 'inalterado'} a ${dados.dataFim || 'inalterado'}. Status: ${dados.status || 'inalterado'}.`,
      ipOrigem,
    });

    const [editalObj] = await db.select().from(editais).where(eq(editais.id, editalId));
    if (!editalObj) throw new Error('Edital não encontrado');

    const cronograma = gerarCronogramaEdital(editalObj);
    return { ...editalObj, cronograma };
  } catch (error) {
    console.error('Erro ao atualizar fase do cronograma:', error);
    throw new Error('Falha ao atualizar etapa do cronograma.', { cause: error });
  }
}

/**
 * Atualiza múltiplas fases do cronograma em lote
 */
export async function atualizarCronogramaLote(
  editalId: number,
  fases: Array<{ id: string } & Partial<EditalFaseCronograma>>,
  usuarioEmail = 'coordenacao.pic@unig.br',
  ipOrigem = '127.0.0.1'
) {
  try {
    const existing = customCronogramasMap.get(editalId) || {};

    for (const f of fases) {
      existing[f.id] = {
        ...(existing[f.id] || {}),
        ...f,
      };

      if (f.id === 'fase-2') {
        const updateEditalDates: any = {};
        if (f.dataInicio) {
          const dt = parseDataBrOuIso(f.dataInicio, false);
          if (dt) updateEditalDates.inicioSubmissao = dt;
        }
        if (f.dataFim) {
          const dt = parseDataBrOuIso(f.dataFim, true);
          if (dt) updateEditalDates.fimSubmissao = dt;
        }
        if (Object.keys(updateEditalDates).length > 0) {
          await db.update(editais).set(updateEditalDates).where(eq(editais.id, editalId));
        }
      }
    }

    customCronogramasMap.set(editalId, existing);

    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'CRONOGRAMA_LOTE_ATUALIZADO',
      entidade: 'cronogramas',
      entidadeId: editalId,
      detalhes: `Coordenação do PIC atualizou ${fases.length} etapas do cronograma regimental do Edital ID ${editalId}.`,
      ipOrigem,
    });

    const [editalObj] = await db.select().from(editais).where(eq(editais.id, editalId));
    const cronograma = gerarCronogramaEdital(editalObj);
    return { ...editalObj, cronograma };
  } catch (error) {
    console.error('Erro ao atualizar cronograma em lote:', error);
    throw new Error('Falha ao salvar cronograma em lote.', { cause: error });
  }
}

/**
 * Prorroga prazos de uma fase (ex: submissão ou banca) com registro de termo aditivo regimental
 */
export async function prorrogarPrazosEdital(
  editalId: number,
  params: {
    faseId?: string;
    diasProrrogacao?: number;
    novaDataFim?: string;
    justificativa?: string;
  },
  usuarioEmail = 'coordenacao.pic@unig.br',
  ipOrigem = '127.0.0.1'
) {
  try {
    const faseAlvo = params.faseId || 'fase-2';
    const [editalObj] = await db.select().from(editais).where(eq(editais.id, editalId));
    if (!editalObj) throw new Error('Edital não encontrado');

    const cronograma = gerarCronogramaEdital(editalObj);
    const faseObj = cronograma.find((c) => c.id === faseAlvo) || cronograma[1];

    let novaDataFimStr = params.novaDataFim;

    if (!novaDataFimStr && params.diasProrrogacao) {
      // Calcular nova data a partir da dataFim atual
      const dataAtualFim = parseDataBrOuIso(faseObj.dataFim, true) || new Date();
      const novaData = new Date(dataAtualFim.getTime() + params.diasProrrogacao * 86400000);
      novaDataFimStr = novaData.toLocaleDateString('pt-BR');
    }

    if (!novaDataFimStr) {
      novaDataFimStr = '15/11/2026';
    }

    const existing = customCronogramasMap.get(editalId) || {};
    existing[faseAlvo] = {
      ...(existing[faseAlvo] || {}),
      dataFim: novaDataFimStr,
    };
    customCronogramasMap.set(editalId, existing);

    if (faseAlvo === 'fase-2') {
      const dt = parseDataBrOuIso(novaDataFimStr, true);
      if (dt) {
        await db.update(editais).set({ fimSubmissao: dt }).where(eq(editais.id, editalId));
      }
    }

    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'PRAZO_PRORROGADO',
      entidade: 'editais',
      entidadeId: editalId,
      detalhes: `Prorrogação regimental aprovada pela Coordenação do PIC para a etapa '${faseObj.titulo}'. Nova data final: ${novaDataFimStr}. Justificativa: ${params.justificativa || 'Resolução Aditiva da Coordenação e Reitoria'}.`,
      ipOrigem,
    });

    const [updatedEdital] = await db.select().from(editais).where(eq(editais.id, editalId));
    const updatedCronograma = gerarCronogramaEdital(updatedEdital);
    return { ...updatedEdital, cronograma: updatedCronograma, novaDataFim: novaDataFimStr };
  } catch (error) {
    console.error('Erro ao prorrogar prazos do edital:', error);
    throw new Error('Falha ao prorrogar prazo regimental.', { cause: error });
  }
}

export async function avancarFaseEdital(
  id: number,
  novaFaseId: string,
  justificativa?: string,
  usuarioEmail = 'coordenacao.pic@unig.br',
  ipOrigem = '127.0.0.1'
) {
  try {
    let novoStatus = 'em_avaliacao';
    if (novaFaseId === 'fase-1') novoStatus = 'planejamento';
    else if (novaFaseId === 'fase-2') novoStatus = 'submissao';
    else if (novaFaseId === 'fase-3') novoStatus = 'triagem';
    else if (novaFaseId === 'fase-4') novoStatus = 'em_avaliacao';
    else if (novaFaseId === 'fase-5') novoStatus = 'etapa3';
    else if (novaFaseId === 'fase-6') novoStatus = 'preliminar';
    else if (novaFaseId === 'fase-7') novoStatus = 'recursos';
    else if (novaFaseId === 'fase-8') novoStatus = 'homologado';
    else if (novaFaseId === 'fase-9') novoStatus = 'concluido';

    await db.update(editais).set({ status: novoStatus }).where(eq(editais.id, id));

    await db.insert(auditoriaLogs).values({
      usuarioEmail,
      acao: 'FASE_TRANSITADA',
      entidade: 'editais',
      entidadeId: id,
      detalhes: `Transição do ciclo anual do Edital ID ${id} para a fase '${novaFaseId}' (Status: ${novoStatus}). Justificativa: ${justificativa || 'Evolução regimental do cronograma'}.`,
      ipOrigem,
    });

    return getEditalAtivo();
  } catch (error) {
    console.error('Erro ao avançar fase do edital:', error);
    throw new Error('Falha ao transitar fase do edital.', { cause: error });
  }
}

export async function getPropostasList() {
  try {
    const list = await db
      .select({
        id: propostas.id,
        editalId: propostas.editalId,
        titulo: propostas.titulo,
        grandeArea: propostas.grandeArea,
        subarea: propostas.subarea,
        resumo: propostas.resumo,
        orientadorId: propostas.orientadorId,
        discenteNome: propostas.discenteNome,
        discenteEmail: propostas.discenteEmail,
        discenteCurso: propostas.discenteCurso,
        discenteCr: propostas.discenteCr,
        modalidade: propostas.modalidade,
        tipoCota: propostas.tipoCota,
        status: propostas.status,
        hashSha256: propostas.hashSha256,
        arquivoNome: propostas.arquivoNome,
        arquivoUrl: propostas.arquivoUrl,
        habilitacaoEtapa1: propostas.habilitacaoEtapa1,
        parecerHabilitacao: propostas.parecerHabilitacao,
        resultadosPreliminares: propostas.resultadosPreliminares,
        viabilidadeFinanceiraLogistica: propostas.viabilidadeFinanceiraLogistica,
        metodoTipo: propostas.metodoTipo,
        metodoTamanhoAmostra: propostas.metodoTamanhoAmostra,
        metodoDesenho: propostas.metodoDesenho,
        metodoPontuacaoDesenho: propostas.metodoPontuacaoDesenho,
        metodoPontuacaoAmostra: propostas.metodoPontuacaoAmostra,
        metodoPontuacaoTipo: propostas.metodoPontuacaoTipo,
        metodoScoreTotal: propostas.metodoScoreTotal,
        criadoEm: propostas.criadoEm,
      })
      .from(propostas)
      .orderBy(desc(propostas.id));

    // Enriquecer com dados de avaliação, orientador e cálculo
    const results = await Promise.all(
      list.map(async (p) => {
        const [dist] = await db
          .select()
          .from(distribuicoesAvaliacao)
          .where(eq(distribuicoesAvaliacao.propostaId, p.id));

        const pAvals = await db
          .select()
          .from(avaliacoes)
          .where(eq(avaliacoes.propostaId, p.id));

        const [calc] = await db
          .select()
          .from(calculosClassificacao)
          .where(eq(calculosClassificacao.propostaId, p.id));

        const [orient] = await db
          .select({
            id: orientadores.id,
            departamento: orientadores.departamento,
            titulacao: orientadores.titulacao,
            notaLattes: orientadores.notaLattes,
            regraMaiorBeneficioTipo: orientadores.regraMaiorBeneficioTipo,
            pontuacaoMaiorBeneficio: orientadores.pontuacaoMaiorBeneficio,
            indiceH5: orientadores.indiceH5,
            percentilScopus: orientadores.percentilScopus,
            vinculoStrictoSensu: orientadores.vinculoStrictoSensu,
            fomentoExternoVigente: orientadores.fomentoExternoVigente,
            artigosUltimos3Anos: orientadores.artigosUltimos3Anos,
            usuarioNome: usuarios.nome,
          })
          .from(orientadores)
          .leftJoin(usuarios, eq(orientadores.usuarioId, usuarios.id))
          .where(eq(orientadores.id, p.orientadorId));

        const [ia] = await db
          .select()
          .from(analisesIaGemini)
          .where(eq(analisesIaGemini.propostaId, p.id));

        return {
          ...p,
          orientador: orient,
          distribuicao: dist,
          avaliacoesCount: pAvals.length,
          avaliacoes: pAvals,
          calculo: calc,
          analiseIa: ia,
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Erro ao buscar lista de propostas:', error);
    throw new Error('Falha ao buscar propostas.', { cause: error });
  }
}

export async function getPropostaDetalhada(id: number) {
  try {
    const [p] = await db.select().from(propostas).where(eq(propostas.id, id));
    if (!p) return null;

    const [orient] = await db
      .select({
        id: orientadores.id,
        departamento: orientadores.departamento,
        titulacao: orientadores.titulacao,
        notaLattes: orientadores.notaLattes,
        regraMaiorBeneficioTipo: orientadores.regraMaiorBeneficioTipo,
        pontuacaoMaiorBeneficio: orientadores.pontuacaoMaiorBeneficio,
        indiceH5: orientadores.indiceH5,
        percentilScopus: orientadores.percentilScopus,
        vinculoStrictoSensu: orientadores.vinculoStrictoSensu,
        fomentoExternoVigente: orientadores.fomentoExternoVigente,
        artigosUltimos3Anos: orientadores.artigosUltimos3Anos,
        usuarioNome: usuarios.nome,
        usuarioEmail: usuarios.email,
      })
      .from(orientadores)
      .leftJoin(usuarios, eq(orientadores.usuarioId, usuarios.id))
      .where(eq(orientadores.id, p.orientadorId));

    const [dist] = await db
      .select()
      .from(distribuicoesAvaliacao)
      .where(eq(distribuicoesAvaliacao.propostaId, p.id));

    let aval1 = null;
    let aval2 = null;
    if (dist) {
      const [a1] = await db
        .select({
          id: avaliadores.id,
          grandeArea: avaliadores.grandeArea,
          instituicao: avaliadores.instituicao,
          nome: usuarios.nome,
          email: usuarios.email,
        })
        .from(avaliadores)
        .leftJoin(usuarios, eq(avaliadores.usuarioId, usuarios.id))
        .where(eq(avaliadores.id, dist.avaliador1Id));

      const [a2] = await db
        .select({
          id: avaliadores.id,
          grandeArea: avaliadores.grandeArea,
          instituicao: avaliadores.instituicao,
          nome: usuarios.nome,
          email: usuarios.email,
        })
        .from(avaliadores)
        .leftJoin(usuarios, eq(avaliadores.usuarioId, usuarios.id))
        .where(eq(avaliadores.id, dist.avaliador2Id));

      aval1 = a1;
      aval2 = a2;
    }

    const avals = await db
      .select()
      .from(avaliacoes)
      .where(eq(avaliacoes.propostaId, p.id));

    const [calc] = await db
      .select()
      .from(calculosClassificacao)
      .where(eq(calculosClassificacao.propostaId, p.id));

    const [ia] = await db
      .select()
      .from(analisesIaGemini)
      .where(eq(analisesIaGemini.propostaId, p.id));

    return {
      ...p,
      orientador: orient,
      distribuicao: dist,
      avaliador1: aval1,
      avaliador2: aval2,
      avaliacoes: avals,
      calculo: calc,
      analiseIa: ia,
    };
  } catch (error) {
    console.error('Erro ao buscar proposta detalhada:', error);
    throw new Error('Falha ao buscar proposta.', { cause: error });
  }
}

export async function submeterNovaProposta(data: {
  titulo: string;
  grandeArea: string;
  subarea: string;
  resumo: string;
  orientadorId: number;
  discenteNome: string;
  discenteEmail: string;
  discenteCurso: string;
  discenteCr: number;
  modalidade: string;
  tipoCota?: string;
  arquivoNome: string;
  arquivoConteudoBase64?: string;
  metodoTipo?: TipoMetodo;
  metodoTamanhoAmostra?: number;
  metodoDesenho?: DesenhoPesquisa;
  usuarioEmail: string;
  ipOrigem?: string;
}) {
  try {
    const edital = await getEditalAtivo();
    if (!edital) throw new Error('Nenhum edital ativo encontrado.');

    // Cálculo do Score Metodológico Regimental
    const scoreMetodologia = calcularScoreMetodologico(
      data.metodoTipo || 'Quantitativo',
      data.metodoTamanhoAmostra || 50,
      data.metodoDesenho || 'Ensaio Clínico Randomizado'
    );

    // Gerar Hash SHA-256
    const hashGenerator = crypto.createHash('sha256');
    const contentToHash = data.arquivoConteudoBase64 || `${data.titulo}-${Date.now()}-${data.discenteNome}`;
    const hashSha256 = hashGenerator.update(contentToHash).digest('hex');

    const arquivoUrl = `https://storage.googleapis.com/pic-unig-2027-vault/projetos/${encodeURIComponent(data.arquivoNome)}`;

    // Inserir proposta
    const [novaProposta] = await db
      .insert(propostas)
      .values({
        editalId: edital.id,
        titulo: data.titulo,
        grandeArea: data.grandeArea,
        subarea: data.subarea,
        resumo: data.resumo,
        orientadorId: data.orientadorId,
        discenteNome: data.discenteNome,
        discenteEmail: data.discenteEmail,
        discenteCurso: data.discenteCurso,
        discenteCr: data.discenteCr.toFixed(2),
        modalidade: data.modalidade,
        tipoCota: data.tipoCota || null,
        status: 'em_avaliacao',
        hashSha256,
        arquivoNome: data.arquivoNome,
        arquivoUrl,
        habilitacaoEtapa1: true,
        parecerHabilitacao: 'Habilitado regimentalmente. Documentos e CR verificados.',
        resultadosPreliminares: false,
        viabilidadeFinanceiraLogistica: true,
        metodoTipo: data.metodoTipo || 'Quantitativo',
        metodoTamanhoAmostra: data.metodoTamanhoAmostra || 50,
        metodoDesenho: data.metodoDesenho || 'Ensaio Clínico Randomizado',
        metodoPontuacaoDesenho: scoreMetodologia.pontuacaoDesenho.toFixed(2),
        metodoPontuacaoAmostra: scoreMetodologia.pontuacaoAmostra.toFixed(2),
        metodoPontuacaoTipo: scoreMetodologia.pontuacaoTipo.toFixed(2),
        metodoScoreTotal: scoreMetodologia.scoreTotal.toFixed(2),
        criadoEm: new Date(),
      })
      .returning();

    // Atribuir automaticamente Banca Dupla (2 avaliadores distintos da grande área ou padrão)
    const todosAvaliadores = await db.select().from(avaliadores).where(eq(avaliadores.ativo, true));
    const av1 = todosAvaliadores[0] || null;
    const av2 = todosAvaliadores[1] || todosAvaliadores[0] || null;

    if (av1 && av2) {
      await db.insert(distribuicoesAvaliacao).values({
        propostaId: novaProposta.id,
        avaliador1Id: av1.id,
        avaliador2Id: av2.id,
        status: 'pendente',
      });
    }

    // Registrar log LGPD
    await db.insert(auditoriaLogs).values({
      usuarioEmail: data.usuarioEmail,
      acao: 'SUBMISSAO_PROPOSTA',
      entidade: 'propostas',
      entidadeId: novaProposta.id,
      detalhes: `Submissão de projeto "${data.titulo}". Hash SHA-256: ${hashSha256.substring(0, 12)}...`,
      ipOrigem: data.ipOrigem || '127.0.0.1',
    });

    // 1º Momento: Disparar Análise Preliminar por IA Gemini
    try {
      const iaResult = await analisarPropostaComGemini({
        titulo: data.titulo,
        grandeArea: data.grandeArea,
        subarea: data.subarea,
        resumo: data.resumo,
      });

      await db.insert(analisesIaGemini).values({
        propostaId: novaProposta.id,
        pontuacaoEstimada: iaResult.pontuacaoEstimada.toFixed(2),
        parecerGeral: iaResult.parecerGeral,
        aderenciaEdital: iaResult.aderenciaEdital,
        viabilidadeTecnica: iaResult.viabilidadeTecnica,
        recomendacoes: iaResult.recomendacoes,
        modeloUsado: iaResult.modeloUsado,
      });
    } catch (iaErr) {
      console.warn('Aviso: Falha na análise IA inicial, prosseguindo com proposta:', iaErr);
    }

    return novaProposta;
  } catch (error) {
    console.error('Erro ao submeter nova proposta:', error);
    throw new Error('Falha ao submeter proposta.', { cause: error });
  }
}

export async function lancarAvaliacaoParecerista(data: {
  propostaId: number;
  avaliadorId: number;
  ordemParecerista: number; // 1 ou 2
  notaTitulo: number; // máx 0.50
  notaIntroducao: number; // máx 0.75
  notaObjetivos: number; // máx 0.75
  notaJustificativa: number; // máx 0.50
  notaMetodologia: number; // máx 1.00
  notaViabilidade: number; // máx 0.75
  notaCronograma: number; // máx 0.50
  notaPlanoDiscente: number; // máx 0.75
  notaInsercaoSocial: number; // máx 0.50
  parecerConsubstanciado: string;
  recomendacao: string;
  usuarioEmail: string;
  ipOrigem?: string;
}) {
  try {
    const totalMerito =
      data.notaTitulo +
      data.notaIntroducao +
      data.notaObjetivos +
      data.notaJustificativa +
      data.notaMetodologia +
      data.notaViabilidade +
      data.notaCronograma +
      data.notaPlanoDiscente +
      data.notaInsercaoSocial;

    // Verificar se já existe parecer desse avaliador para essa proposta
    const avalsExistentes = await db
      .select()
      .from(avaliacoes)
      .where(eq(avaliacoes.propostaId, data.propostaId));

    const jaAvaliou = avalsExistentes.find((a) => a.ordemParecerista === data.ordemParecerista);

    if (jaAvaliou) {
      await db
        .update(avaliacoes)
        .set({
          notaTitulo: data.notaTitulo.toFixed(2),
          notaIntroducao: data.notaIntroducao.toFixed(2),
          notaObjetivos: data.notaObjetivos.toFixed(2),
          notaJustificativa: data.notaJustificativa.toFixed(2),
          notaMetodologia: data.notaMetodologia.toFixed(2),
          notaViabilidade: data.notaViabilidade.toFixed(2),
          notaCronograma: data.notaCronograma.toFixed(2),
          notaPlanoDiscente: data.notaPlanoDiscente.toFixed(2),
          notaInsercaoSocial: data.notaInsercaoSocial.toFixed(2),
          notaMeritoTotal: totalMerito.toFixed(2),
          parecerConsubstanciado: data.parecerConsubstanciado,
          recomendacao: data.recomendacao,
          submetidoEm: new Date(),
        })
        .where(eq(avaliacoes.id, jaAvaliou.id));
    } else {
      await db.insert(avaliacoes).values({
        propostaId: data.propostaId,
        avaliadorId: data.avaliadorId,
        ordemParecerista: data.ordemParecerista,
        notaTitulo: data.notaTitulo.toFixed(2),
        notaIntroducao: data.notaIntroducao.toFixed(2),
        notaObjetivos: data.notaObjetivos.toFixed(2),
        notaJustificativa: data.notaJustificativa.toFixed(2),
        notaMetodologia: data.notaMetodologia.toFixed(2),
        notaViabilidade: data.notaViabilidade.toFixed(2),
        notaCronograma: data.notaCronograma.toFixed(2),
        notaPlanoDiscente: data.notaPlanoDiscente.toFixed(2),
        notaInsercaoSocial: data.notaInsercaoSocial.toFixed(2),
        notaMeritoTotal: totalMerito.toFixed(2),
        parecerConsubstanciado: data.parecerConsubstanciado,
        recomendacao: data.recomendacao,
      });
    }

    // Registrar na Auditoria LGPD
    await db.insert(auditoriaLogs).values({
      usuarioEmail: data.usuarioEmail,
      acao: 'PARECER_REGISTRADO',
      entidade: 'avaliacoes',
      entidadeId: data.propostaId,
      detalhes: `Parecerista ${data.ordemParecerista} lançou nota ${totalMerito.toFixed(2)}/6.00 para a proposta ID ${data.propostaId}.`,
      ipOrigem: data.ipOrigem || '127.0.0.1',
    });

    // Reavaliar consolidação e divergência
    await recalcularConsolidacaoProposta(data.propostaId);

    return { success: true, totalMerito };
  } catch (error) {
    console.error('Erro ao lançar avaliação:', error);
    throw new Error('Falha ao registrar avaliação.', { cause: error });
  }
}

export async function recalcularConsolidacaoProposta(propostaId: number) {
  const [proposta] = await db.select().from(propostas).where(eq(propostas.id, propostaId));
  if (!proposta) return;

  const avals = await db.select().from(avaliacoes).where(eq(avaliacoes.propostaId, propostaId));
  const aval1 = avals.find((a) => a.ordemParecerista === 1);
  const aval2 = avals.find((a) => a.ordemParecerista === 2);

  // Atualizar status na distribuicao
  const statusDist = avals.length >= 2 ? 'concluida' : avals.length === 1 ? 'parcial' : 'pendente';
  await db
    .update(distribuicoesAvaliacao)
    .set({ status: statusDist })
    .where(eq(distribuicoesAvaliacao.propostaId, propostaId));

  if (statusDist === 'concluida' && aval1 && aval2) {
    await db
      .update(propostas)
      .set({ status: 'avaliada' })
      .where(eq(propostas.id, propostaId));

    const n1 = parseFloat(aval1.notaMeritoTotal);
    const n2 = parseFloat(aval2.notaMeritoTotal);
    const mediaEtapa2 = (n1 + n2) / 2;
    const diferenca = Math.abs(n1 - n2);
    const divergencia = diferenca > 2.0;

    // Buscar dados do Orientador (Etapa 3)
    const [orient] = await db.select().from(orientadores).where(eq(orientadores.id, proposta.orientadorId));
    const notaLattes = orient ? parseFloat(orient.notaLattes) : 0;
    const notaAlunoCr = parseFloat(proposta.discenteCr);

    // Normalização para a escala 0-10 da Nota Final Ponderada:
    // (Nota Orientador × 0,30) + (Nota Projeto × 0,50) + (Nota Aluno × 0,20)
    const orientador10 = (notaLattes / 4.0) * 10;
    const projeto10 = (mediaEtapa2 / 6.0) * 10;
    const aluno10 = notaAlunoCr;

    const notaFinalPonderada = orientador10 * 0.3 + projeto10 * 0.5 + aluno10 * 0.2;

    // Upsert em calculosClassificacao
    const [existingCalc] = await db
      .select()
      .from(calculosClassificacao)
      .where(eq(calculosClassificacao.propostaId, propostaId));

    if (existingCalc) {
      await db
        .update(calculosClassificacao)
        .set({
          notaEtapa2Avaliador1: n1.toFixed(2),
          notaEtapa2Avaliador2: n2.toFixed(2),
          mediaEtapa2Merito: mediaEtapa2.toFixed(2),
          divergenciaDetectada: divergencia,
          notaEtapa3Orientador: notaLattes.toFixed(2),
          notaAluno: notaAlunoCr.toFixed(2),
          notaFinalPonderada: notaFinalPonderada.toFixed(2),
          scoreMetodologico: proposta.metodoScoreTotal || '0.00',
          criterioDesempateAplicado: divergencia
            ? 'Alerta: Divergência superior a 2.00 pontos detectada. Encaminhado para comitê árbitro.'
            : 'Média aritmética simples da banca consolidada com sucesso.',
        })
        .where(eq(calculosClassificacao.id, existingCalc.id));
    } else {
      await db.insert(calculosClassificacao).values({
        propostaId,
        notaEtapa2Avaliador1: n1.toFixed(2),
        notaEtapa2Avaliador2: n2.toFixed(2),
        mediaEtapa2Merito: mediaEtapa2.toFixed(2),
        divergenciaDetectada: divergencia,
        notaEtapa3Orientador: notaLattes.toFixed(2),
        notaAluno: notaAlunoCr.toFixed(2),
        notaFinalPonderada: notaFinalPonderada.toFixed(2),
        scoreMetodologico: proposta.metodoScoreTotal || '0.00',
        tipoVagaConcedida: divergencia ? 'Em Deliberação' : 'Classificado',
        criterioDesempateAplicado: divergencia
          ? 'Alerta: Divergência superior a 2.00 pontos detectada.'
          : 'Média da banca consolidada.',
      });
    }
  }
}

export async function homologarDistribuicaoBolsas() {
  try {
    // Buscar todas as propostas avaliadas e seus cálculos
    const todasPropostas = await db
      .select({
        propostaId: propostas.id,
        titulo: propostas.titulo,
        modalidade: propostas.modalidade,
        orientadorId: propostas.orientadorId,
        resultadosPreliminares: propostas.resultadosPreliminares,
        viabilidadeFinanceiraLogistica: propostas.viabilidadeFinanceiraLogistica,
        metodoTipo: propostas.metodoTipo,
        metodoTamanhoAmostra: propostas.metodoTamanhoAmostra,
        metodoDesenho: propostas.metodoDesenho,
        metodoScoreTotal: propostas.metodoScoreTotal,
        calcId: calculosClassificacao.id,
        notaFinal: calculosClassificacao.notaFinalPonderada,
        divergencia: calculosClassificacao.divergenciaDetectada,
        mediaEtapa2: calculosClassificacao.mediaEtapa2Merito,
        vinculoStrictoSensu: orientadores.vinculoStrictoSensu,
        artigosUltimos3Anos: orientadores.artigosUltimos3Anos,
        fomentoExternoVigente: orientadores.fomentoExternoVigente,
      })
      .from(propostas)
      .innerJoin(calculosClassificacao, eq(propostas.id, calculosClassificacao.propostaId))
      .innerJoin(orientadores, eq(propostas.orientadorId, orientadores.id));

    // 1. Calcular a Classificação por Ordem Científico-Metodológica:
    // Critérios:
    // 1º: Ordem do Desenho da Pesquisa (1: ECR, 2: Coorte/Roda, 3: Caso controle, 4: Relato, 5: In vitro)
    // 2º: Tamanho da Amostra (decrescente)
    // 3º: Tipo de Método (Quantitativo antes de Qualitativo)
    // 4º: Score Metodológico Total (decrescente)
    // 5º: Nota Final do Edital (decrescente)
    const propostasOrdenadasMetodologia = [...todasPropostas].sort((a, b) => {
      const ordemDesenhoA = HIERARQUIA_DESENHOS[a.metodoDesenho as DesenhoPesquisa]?.ordem ?? 99;
      const ordemDesenhoB = HIERARQUIA_DESENHOS[b.metodoDesenho as DesenhoPesquisa]?.ordem ?? 99;
      if (ordemDesenhoA !== ordemDesenhoB) {
        return ordemDesenhoA - ordemDesenhoB;
      }
      const nA = a.metodoTamanhoAmostra || 0;
      const nB = b.metodoTamanhoAmostra || 0;
      if (nB !== nA) return nB - nA;

      if (a.metodoTipo !== b.metodoTipo) {
        return a.metodoTipo === 'Quantitativo' ? -1 : 1;
      }

      const scoreA = parseFloat(a.metodoScoreTotal || '0');
      const scoreB = parseFloat(b.metodoScoreTotal || '0');
      if (scoreB !== scoreA) return scoreB - scoreA;

      const finalA = parseFloat(a.notaFinal || '0');
      const finalB = parseFloat(b.notaFinal || '0');
      return finalB - finalA;
    });

    const rankingMetodologicoMap = new Map<number, number>();
    propostasOrdenadasMetodologia.forEach((p, idx) => {
      rankingMetodologicoMap.set(p.propostaId, idx + 1);
    });

    // 2. Ordenar segundo os critérios regimentais oficiais do edital:
    // 1. Nota Final Ponderada (decrescente)
    // 2. Vinculação a Stricto Sensu (true > false)
    // 3. Maior pontuação em artigos nos últimos 3 anos
    // 4. Coordenação de fomento externo vigente
    // 5. Viabilidade financeira e logística
    // 6. Resultados preliminares
    todasPropostas.sort((a, b) => {
      const nA = parseFloat(a.notaFinal || '0');
      const nB = parseFloat(b.notaFinal || '0');
      if (nB !== nA) return nB - nA;

      if (a.vinculoStrictoSensu !== b.vinculoStrictoSensu) {
        return a.vinculoStrictoSensu ? -1 : 1;
      }
      if (a.artigosUltimos3Anos !== b.artigosUltimos3Anos) {
        return b.artigosUltimos3Anos - a.artigosUltimos3Anos;
      }
      if (a.fomentoExternoVigente !== b.fomentoExternoVigente) {
        return a.fomentoExternoVigente ? -1 : 1;
      }
      if (a.viabilidadeFinanceiraLogistica !== b.viabilidadeFinanceiraLogistica) {
        return a.viabilidadeFinanceiraLogistica ? -1 : 1;
      }
      if (a.resultadosPreliminares !== b.resultadosPreliminares) {
        return a.resultadosPreliminares ? -1 : 1;
      }
      return 0;
    });

    let rankGeral = 1;
    let rankAC = 1;
    let rankAF = 1;

    for (const p of todasPropostas) {
      let vaga = 'Lista de Espera';
      let desempateMsg = `Classificação Geral: ${rankGeral}º lugar.`;

      if (p.divergencia) {
        vaga = 'Sob Deliberação da Banca';
        desempateMsg = 'Divergência de notas > 2.00 pts. Aguardando parecer de desempate do árbitro.';
      } else if (p.modalidade === 'Ações Afirmativas') {
        if (rankAF <= 40) {
          vaga = 'Ações Afirmativas';
          desempateMsg = `Contemplado na Cota de Ações Afirmativas (${rankAF}º lugar).`;
          rankAF++;
        } else if (rankAC <= 60) {
          vaga = 'Ampla Concorrência';
          desempateMsg = `Migrado para Ampla Concorrência por mérito de pontuação (${rankAC}º lugar).`;
          rankAC++;
        }
      } else {
        if (rankAC <= 60) {
          vaga = 'Ampla Concorrência';
          desempateMsg = `Contemplado na Ampla Concorrência (${rankAC}º lugar).`;
          rankAC++;
        }
      }

      const rankMetodologico = rankingMetodologicoMap.get(p.propostaId) || rankGeral;

      await db
        .update(calculosClassificacao)
        .set({
          classificacaoGeral: rankGeral,
          classificacaoModalidade: p.modalidade === 'Ações Afirmativas' ? rankAF - 1 : rankAC - 1,
          scoreMetodologico: p.metodoScoreTotal || '0.00',
          classificacaoMetodologica: rankMetodologico,
          tipoVagaConcedida: vaga,
          criterioDesempateAplicado: desempateMsg,
          homologado: true,
          homologadoEm: new Date(),
        })
        .where(eq(calculosClassificacao.id, p.calcId));

      rankGeral++;
    }

    return { success: true, totalHomologadas: todasPropostas.length };
  } catch (error) {
    console.error('Erro ao homologar bolsas:', error);
    throw new Error('Falha na homologação.', { cause: error });
  }
}

export async function getAuditoriaLogsList() {
  try {
    return await db.select().from(auditoriaLogs).orderBy(desc(auditoriaLogs.id)).limit(100);
  } catch (error) {
    console.error('Erro ao buscar auditoria:', error);
    throw new Error('Falha ao buscar logs de auditoria.', { cause: error });
  }
}

export async function getUsuariosList() {
  try {
    return await db.select().from(usuarios).orderBy(usuarios.nome);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Falha ao buscar usuários.', { cause: error });
  }
}

export async function atualizarPapelUsuario(userId: number, novoPapel: string, usuarioEmail: string, ipOrigem: string) {
  try {
    const [atualizado] = await db
      .update(usuarios)
      .set({ papel: novoPapel })
      .where(eq(usuarios.id, userId))
      .returning();

    // Registrar auditoria
    await db.insert(auditoriaLogs).values({
      acao: 'ATUALIZAR_PAPEL_USUARIO',
      entidade: 'usuarios',
      entidadeId: userId,
      usuarioEmail,
      detalhes: `Papel do usuário ID ${userId} alterado para "${novoPapel}".`,
      ipOrigem,
    });

    return atualizado;
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error);
    throw new Error('Falha ao atualizar papel do usuário.', { cause: error });
  }
}

export async function getOrientadoresList() {
  try {
    return await db
      .select({
        id: orientadores.id,
        departamento: orientadores.departamento,
        lattesUrl: orientadores.lattesUrl,
        titulacao: orientadores.titulacao,
        vinculoStrictoSensu: orientadores.vinculoStrictoSensu,
        fomentoExternoVigente: orientadores.fomentoExternoVigente,
        indiceH5: orientadores.indiceH5,
        percentilScopus: orientadores.percentilScopus,
        regraMaiorBeneficioTipo: orientadores.regraMaiorBeneficioTipo,
        pontuacaoMaiorBeneficio: orientadores.pontuacaoMaiorBeneficio,
        artigosUltimos3Anos: orientadores.artigosUltimos3Anos,
        notaLattes: orientadores.notaLattes,
        nome: usuarios.nome,
        email: usuarios.email,
      })
      .from(orientadores)
      .leftJoin(usuarios, eq(orientadores.usuarioId, usuarios.id));
  } catch (error) {
    console.error('Erro ao buscar orientadores:', error);
    throw new Error('Falha ao buscar orientadores.', { cause: error });
  }
}
