export interface Usuario {
  id: number;
  uid: string;
  nome: string;
  email: string;
  papel: 'admin' | 'coordenador' | 'avaliador' | 'orientador' | 'discente';
  avatarUrl?: string;
}

export interface Orientador {
  id: number;
  departamento: string;
  lattesUrl: string;
  titulacao: 'Doutor' | 'Mestre' | 'Especialista';
  vinculoStrictoSensu: boolean;
  fomentoExternoVigente: boolean;
  indiceH5: string;
  percentilScopus: string;
  regraMaiorBeneficioTipo: 'H5' | 'Scopus';
  pontuacaoMaiorBeneficio: string;
  artigosUltimos3Anos: number;
  notaLattes: string;
  nome?: string;
  email?: string;
  usuarioNome?: string;
}

export interface EditalFaseCronograma {
  id: string;
  faseNumero: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  status: 'concluido' | 'em_andamento' | 'pendente';
  progressoPercentual: number;
  responsavel: string;
  criterioRegimental: string;
  diasRestantes?: number;
  acaoRotulo?: string;
  acaoDestinoTab?: string;
}

export interface Edital {
  id: number;
  codigo: string;
  titulo: string;
  ano: number;
  totalBolsas: number;
  bolsasAmplaConcorrencia: number;
  bolsasAcoesAfirmativas: number;
  status: string;
  inicioSubmissao: string;
  fimSubmissao: string;
  isAtivo?: boolean;
  valorBolsa?: number;
  orcamentoTotalAnual?: number;
  propostasCount?: number;
  faseAtual?: string;
  resolucaoCepe?: string;
  cronograma?: EditalFaseCronograma[];
}

export interface AvaliacaoItem {
  id: number;
  propostaId: number;
  avaliadorId: number;
  ordemParecerista: number;
  notaTitulo: string;
  notaIntroducao: string;
  notaObjetivos: string;
  notaJustificativa: string;
  notaMetodologia: string;
  notaViabilidade: string;
  notaCronograma: string;
  notaPlanoDiscente: string;
  notaInsercaoSocial: string;
  notaMeritoTotal: string;
  parecerConsubstanciado: string;
  recomendacao: string;
  submetidoEm?: string;
}

export type TipoMetodo = 'Quantitativo' | 'Qualitativo';

export type DesenhoPesquisa =
  | 'Ensaio Clínico Randomizado'
  | 'Ensaio de Roda / Estudo de coorte'
  | 'Caso controle'
  | 'Relato de caso'
  | 'Estudo in vitro';

export interface CalculoClassificacao {
  id: number;
  propostaId: number;
  notaEtapa2Avaliador1: string;
  notaEtapa2Avaliador2: string;
  mediaEtapa2Merito: string;
  divergenciaDetectada: boolean;
  notaEtapa3Orientador: string;
  notaAluno: string;
  notaFinalPonderada: string;
  classificacaoGeral?: number;
  classificacaoModalidade?: number;
  scoreMetodologico?: string;
  classificacaoMetodologica?: number;
  tipoVagaConcedida: string;
  criterioDesempateAplicado?: string;
  homologado: boolean;
  homologadoEm?: string;
}

export interface AnaliseIaGemini {
  id: number;
  propostaId: number;
  parecerGeral: string;
  pontuacaoEstimada: string;
  aderenciaEdital: string;
  viabilidadeTecnica: string;
  recomendacoes: string;
  modeloUsado: string;
  analisadoEm: string;
}

export interface Proposta {
  id: number;
  editalId: number;
  titulo: string;
  grandeArea: string;
  subarea: string;
  resumo: string;
  orientadorId: number;
  discenteNome: string;
  discenteEmail: string;
  discenteCurso: string;
  discenteCr: string;
  modalidade: 'Ampla Concorrência' | 'Ações Afirmativas';
  tipoCota?: string | null;
  status: 'submetida' | 'habilitada' | 'em_avaliacao' | 'avaliada' | 'homologada' | 'desclassificada';
  hashSha256: string;
  arquivoNome: string;
  arquivoUrl: string;
  habilitacaoEtapa1: boolean;
  parecerHabilitacao?: string;
  resultadosPreliminares?: boolean;
  viabilidadeFinanceiraLogistica?: boolean;
  metodoTipo?: TipoMetodo;
  metodoTamanhoAmostra?: number;
  metodoDesenho?: DesenhoPesquisa;
  metodoPontuacaoDesenho?: string;
  metodoPontuacaoAmostra?: string;
  metodoPontuacaoTipo?: string;
  metodoScoreTotal?: string;
  criadoEm: string;
  orientador?: Orientador;
  distribuicao?: {
    id: number;
    avaliador1Id: number;
    avaliador2Id: number;
    status: 'pendente' | 'parcial' | 'concluida';
  };
  avaliacoesCount?: number;
  avaliacoes?: AvaliacaoItem[];
  calculo?: CalculoClassificacao;
  analiseIa?: AnaliseIaGemini;
  avaliador1?: { id: number; nome: string; email: string; grandeArea: string };
  avaliador2?: { id: number; nome: string; email: string; grandeArea: string };
}

export interface AuditoriaLog {
  id: number;
  usuarioId?: number;
  usuarioEmail: string;
  acao: string;
  entidade: string;
  entidadeId?: number;
  detalhes: string;
  ipOrigem: string;
  criadoEm: string;
}
