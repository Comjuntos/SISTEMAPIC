import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Tabela de Usuários
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  papel: text('papel').notNull().default('avaliador'), // 'admin', 'coordenador', 'avaliador', 'orientador'
  avatarUrl: text('avatar_url'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 2. Tabela de Dados Pessoais de Participantes (LGPD Protegida)
export const dadosPessoaisParticipantes = pgTable('dados_pessoais_participantes', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
  cpfMascarado: text('cpf_mascarado').notNull(),
  telefone: text('telefone'),
  curso: text('curso').notNull(),
  matricula: text('matricula').notNull(),
  termoLgpdAceito: boolean('termo_lgpd_aceito').default(true).notNull(),
  lgpdAceitoEm: timestamp('lgpd_aceito_em').defaultNow().notNull(),
});

// 3. Tabela de Docentes Orientadores
export const orientadores = pgTable('orientadores', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
  departamento: text('departamento').notNull(),
  lattesUrl: text('lattes_url').notNull(),
  titulacao: text('titulacao').notNull(), // 'Doutor', 'Mestre', 'Especialista'
  vinculoStrictoSensu: boolean('vinculo_stricto_sensu').default(false).notNull(),
  fomentoExternoVigente: boolean('fomento_externo_vigente').default(false).notNull(),
  indiceH5: numeric('indice_h5', { precision: 6, scale: 2 }).default('0.00').notNull(),
  percentilScopus: numeric('percentil_scopus', { precision: 6, scale: 2 }).default('0.00').notNull(),
  regraMaiorBeneficioTipo: text('regra_maior_beneficio_tipo').default('H5').notNull(), // 'H5' ou 'Scopus'
  pontuacaoMaiorBeneficio: numeric('pontuacao_maior_beneficio', { precision: 6, scale: 2 }).default('0.00').notNull(),
  artigosUltimos3Anos: integer('artigos_ultimos_3_anos').default(0).notNull(),
  notaLattes: numeric('nota_lattes', { precision: 6, scale: 2 }).default('0.00').notNull(),
});

// 4. Tabela de Editais
export const editais = pgTable('editais', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(), // 'PIC-UNIG 2027'
  titulo: text('titulo').notNull(),
  ano: integer('ano').notNull().default(2027),
  totalBolsas: integer('total_bolsas').default(100).notNull(),
  bolsasAmplaConcorrencia: integer('bolsas_ampla_concorrencia').default(60).notNull(),
  bolsasAcoesAfirmativas: integer('bolsas_acoes_afirmativas').default(40).notNull(),
  status: text('status').default('ativo').notNull(), // 'ativo', 'em_avaliacao', 'homologado'
  inicioSubmissao: timestamp('inicio_submissao').defaultNow().notNull(),
  fimSubmissao: timestamp('fim_submissao').notNull(),
});

// 5. Tabela de Propostas Submetidas
export const propostas = pgTable('propostas', {
  id: serial('id').primaryKey(),
  editalId: integer('edital_id').references(() => editais.id).notNull(),
  titulo: text('titulo').notNull(),
  grandeArea: text('grande_area').notNull(),
  subarea: text('subarea').notNull(),
  resumo: text('resumo').notNull(),
  orientadorId: integer('orientador_id').references(() => orientadores.id).notNull(),
  discenteNome: text('discente_nome').notNull(),
  discenteEmail: text('discente_email').notNull(),
  discenteCurso: text('discente_curso').notNull(),
  discenteCr: numeric('discente_cr', { precision: 4, scale: 2 }).notNull(),
  modalidade: text('modalidade').notNull().default('Ampla Concorrência'), // 'Ampla Concorrência' ou 'Ações Afirmativas'
  tipoCota: text('tipo_cota'), // 'PPI', 'Escola Pública', 'PCD', etc.
  status: text('status').default('submetida').notNull(), // 'submetida', 'habilitada', 'em_avaliacao', 'avaliada', 'homologada', 'desclassificada'
  hashSha256: text('hash_sha256').notNull(),
  arquivoNome: text('arquivo_nome').notNull(),
  arquivoUrl: text('arquivo_url').notNull(),
  habilitacaoEtapa1: boolean('habilitacao_etapa1').default(true).notNull(),
  parecerHabilitacao: text('parecer_habilitacao').default('Documentação e CR válidos regimentalmente.'),
  resultadosPreliminares: boolean('resultados_preliminares').default(false).notNull(),
  viabilidadeFinanceiraLogistica: boolean('viabilidade_financeira_logistica').default(true).notNull(),
  metodoTipo: text('metodo_tipo').default('Quantitativo').notNull(), // 'Quantitativo' ou 'Qualitativo'
  metodoTamanhoAmostra: integer('metodo_tamanho_amostra').default(50).notNull(),
  metodoDesenho: text('metodo_desenho').default('Ensaio Clínico Randomizado').notNull(),
  metodoPontuacaoDesenho: numeric('metodo_pontuacao_desenho', { precision: 4, scale: 2 }).default('5.00').notNull(),
  metodoPontuacaoAmostra: numeric('metodo_pontuacao_amostra', { precision: 4, scale: 2 }).default('2.25').notNull(),
  metodoPontuacaoTipo: numeric('metodo_pontuacao_tipo', { precision: 4, scale: 2 }).default('2.00').notNull(),
  metodoScoreTotal: numeric('metodo_score_total', { precision: 4, scale: 2 }).default('9.25').notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 6. Tabela de Avaliadores / Pareceristas
export const avaliadores = pgTable('avaliadores', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').references(() => usuarios.id).notNull(),
  grandeArea: text('grande_area').notNull(),
  instituicao: text('instituicao').default('UNIG').notNull(),
  ativo: boolean('ativo').default(true).notNull(),
});

// 7. Tabela de Distribuição Duplo-Cega de Avaliação
export const distribuicoesAvaliacao = pgTable('distribuicoes_avaliacao', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id').references(() => propostas.id).notNull().unique(),
  avaliador1Id: integer('avaliador1_id').references(() => avaliadores.id).notNull(),
  avaliador2Id: integer('avaliador2_id').references(() => avaliadores.id).notNull(),
  status: text('status').default('pendente').notNull(), // 'pendente', 'parcial', 'concluida'
  distribuidoEm: timestamp('distribuido_em').defaultNow().notNull(),
});

// 8. Tabela de Avaliações / Pareceres Individuais
export const avaliacoes = pgTable('avaliacoes', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id').references(() => propostas.id).notNull(),
  avaliadorId: integer('avaliador_id').references(() => avaliadores.id).notNull(),
  ordemParecerista: integer('ordem_parecerista').notNull(), // 1 ou 2
  // Critérios Etapa 2 (Máx 6.00 pts)
  notaTitulo: numeric('nota_titulo', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.50
  notaIntroducao: numeric('nota_introducao', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.75
  notaObjetivos: numeric('nota_objetivos', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.75
  notaJustificativa: numeric('nota_justificativa', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.50
  notaMetodologia: numeric('nota_metodologia', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 1.00
  notaViabilidade: numeric('nota_viabilidade', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.75
  notaCronograma: numeric('nota_cronograma', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.50
  notaPlanoDiscente: numeric('nota_plano_discente', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.75
  notaInsercaoSocial: numeric('nota_insercao_social', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 0.50
  notaMeritoTotal: numeric('nota_merito_total', { precision: 4, scale: 2 }).default('0.00').notNull(), // máx 6.00
  parecerConsubstanciado: text('parecer_consubstanciado').notNull(),
  recomendacao: text('recomendacao').notNull(), // 'Recomendado para Bolsa', 'Recomendado com Ressalvas', 'Não Recomendado'
  submetidoEm: timestamp('submetido_em').defaultNow().notNull(),
});

// 9. Tabela de Cálculos e Classificação Consolidada
export const calculosClassificacao = pgTable('calculos_classificacao', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id').references(() => propostas.id).notNull().unique(),
  notaEtapa2Avaliador1: numeric('nota_etapa2_avaliador1', { precision: 4, scale: 2 }).default('0.00'),
  notaEtapa2Avaliador2: numeric('nota_etapa2_avaliador2', { precision: 4, scale: 2 }).default('0.00'),
  mediaEtapa2Merito: numeric('media_etapa2_merito', { precision: 4, scale: 2 }).default('0.00'),
  divergenciaDetectada: boolean('divergencia_detectada').default(false).notNull(),
  notaEtapa3Orientador: numeric('nota_etapa3_orientador', { precision: 4, scale: 2 }).default('0.00'),
  notaAluno: numeric('nota_aluno', { precision: 4, scale: 2 }).default('0.00'),
  notaFinalPonderada: numeric('nota_final_ponderada', { precision: 5, scale: 2 }).default('0.00'),
  classificacaoGeral: integer('classificacao_geral'),
  classificacaoModalidade: integer('classificacao_modalidade'),
  scoreMetodologico: numeric('score_metodologico', { precision: 4, scale: 2 }).default('0.00'),
  classificacaoMetodologica: integer('classificacao_metodologica'),
  tipoVagaConcedida: text('tipo_vaga_concedida').default('Em Análise'), // 'Ampla Concorrência', 'Ações Afirmativas', 'Lista de Espera', 'Desclassificado'
  criterioDesempateAplicado: text('criterio_desempate_aplicado'),
  homologado: boolean('homologado').default(false).notNull(),
  homologadoEm: timestamp('homologado_em'),
});

// 10. Tabela de Análise IA Gemini (1º Momento)
export const analisesIaGemini = pgTable('analises_ia_gemini', {
  id: serial('id').primaryKey(),
  propostaId: integer('proposta_id').references(() => propostas.id).notNull().unique(),
  parecerGeral: text('parecer_geral').notNull(),
  pontuacaoEstimada: numeric('pontuacao_estimada', { precision: 4, scale: 2 }).default('0.00').notNull(),
  aderenciaEdital: text('aderencia_edital').notNull(),
  viabilidadeTecnica: text('viabilidade_tecnica').notNull(),
  recomendacoes: text('recomendacoes').notNull(),
  modeloUsado: text('modelo_usado').default('gemini-3.8-flash').notNull(),
  analisadoEm: timestamp('analisado_em').defaultNow().notNull(),
});

// 11. Tabela de Trilha de Auditoria LGPD
export const auditoriaLogs = pgTable('auditoria_logs', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id'),
  usuarioEmail: text('usuario_email').notNull(),
  acao: text('acao').notNull(), // 'LOGIN', 'SUBMISSAO_PROPOSTA', 'AVALIACAO_LANCADA', 'ACESSO_DADOS_LGPD', 'HOMOLOGACAO_BOLSAS'
  entidade: text('entidade').notNull(),
  entidadeId: integer('entidade_id'),
  detalhes: text('detalhes').notNull(),
  ipOrigem: text('ip_origem').default('127.0.0.1').notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 12. Tabela de Notificações / E-mails Simulados para Orientadores
export const notificacoes = pgTable('notificacoes', {
  id: serial('id').primaryKey(),
  orientadorId: integer('orientador_id').references(() => orientadores.id),
  orientadorEmail: text('orientador_email').notNull(),
  propostaId: integer('proposta_id').references(() => propostas.id),
  assunto: text('assunto').notNull(),
  corpo: text('corpo').notNull(),
  tipo: text('tipo').notNull().default('STATUS_ALTERADO'), // 'STATUS_ALTERADO' ou 'PARECER_RECEBIDO'
  lida: boolean('lida').default(false).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// Relations
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  dadosPessoais: one(dadosPessoaisParticipantes, {
    fields: [usuarios.id],
    references: [dadosPessoaisParticipantes.usuarioId],
  }),
  orientador: one(orientadores, {
    fields: [usuarios.id],
    references: [orientadores.usuarioId],
  }),
  avaliador: one(avaliadores, {
    fields: [usuarios.id],
    references: [avaliadores.usuarioId],
  }),
  auditoria: many(auditoriaLogs),
}));

export const propostasRelations = relations(propostas, ({ one, many }) => ({
  edital: one(editais, {
    fields: [propostas.editalId],
    references: [editais.id],
  }),
  orientador: one(orientadores, {
    fields: [propostas.orientadorId],
    references: [orientadores.id],
  }),
  distribuicao: one(distribuicoesAvaliacao, {
    fields: [propostas.id],
    references: [distribuicoesAvaliacao.propostaId],
  }),
  avaliacoes: many(avaliacoes),
  calculo: one(calculosClassificacao, {
    fields: [propostas.id],
    references: [calculosClassificacao.propostaId],
  }),
  analiseIa: one(analisesIaGemini, {
    fields: [propostas.id],
    references: [analisesIaGemini.propostaId],
  }),
}));
