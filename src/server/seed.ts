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
import { eq } from 'drizzle-orm';

export async function runDatabaseSeed() {
  try {
    // Check if edital already seeded
    const existingEdital = await db.select().from(editais).limit(1);
    if (existingEdital.length > 0) {
      console.log('Seed: Base já populada com o Edital PIC-UNIG 2027.');
      return;
    }

    console.log('Iniciando carga de dados iniciais (Seed) do PIC-UNIG 2027...');

    // 1. Criar Usuários
    const insertedUsers = await db
      .insert(usuarios)
      .values([
        {
          uid: 'admin-unig-001',
          nome: 'Prof. Dr. Valter Soares',
          email: 'proreitoria.pesquisa@unig.br',
          papel: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'coord-unig-003',
          nome: 'Prof. Coordenador 0142076',
          email: '0142076@professor.unig.edu.br',
          papel: 'coordenador',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'aval-unig-001',
          nome: 'Dr. Carlos Eduardo Meireles',
          email: 'carlos.meireles@unig.br',
          papel: 'avaliador',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'aval-unig-002',
          nome: 'Dra. Juliana Mendes Fontes',
          email: 'juliana.fontes@unig.br',
          papel: 'avaliador',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'orient-unig-001',
          nome: 'Prof. Dr. Roberto Guimarães',
          email: 'roberto.guimaraes@unig.br',
          papel: 'orientador',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'orient-unig-002',
          nome: 'Profa. Dra. Marina Alencar',
          email: 'marina.alencar@unig.br',
          papel: 'orientador',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'orient-unig-003',
          nome: 'Prof. Me. Felipe Barros',
          email: 'felipe.barros@unig.br',
          papel: 'orientador',
          avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        },
        {
          uid: 'orient-unig-004',
          nome: 'Profa. Dra. Cláudia Nogueira',
          email: 'claudia.nogueira@unig.br',
          papel: 'orientador',
          avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
        },
      ])
      .returning();

    const uAdmin = insertedUsers[0];
    const uCoord = insertedUsers[1];
    const uAval1 = insertedUsers[2];
    const uAval2 = insertedUsers[3];
    const uOrient1 = insertedUsers[4];
    const uOrient2 = insertedUsers[5];
    const uOrient3 = insertedUsers[6];
    const uOrient4 = insertedUsers[7];

    // 2. Criar Avaliadores
    const insertedAvaliadores = await db
      .insert(avaliadores)
      .values([
        {
          usuarioId: uAval1.id,
          grandeArea: 'Ciências Biológicas e da Saúde',
          instituicao: 'UNIG - Campus Nova Iguaçu',
          ativo: true,
        },
        {
          usuarioId: uAval2.id,
          grandeArea: 'Ciências Exatas, Engenharias e Tecnologias',
          instituicao: 'UNIG - Campus Nova Iguaçu',
          ativo: true,
        },
      ])
      .returning();

    const av1 = insertedAvaliadores[0];
    const av2 = insertedAvaliadores[1];

    // 3. Criar Orientadores com Regra do Maior Benefício
    // Orientador 1: H5=18 (18/15=1.20) vs Scopus=75 (75/100=0.75) -> H5 Vence!
    // Lattes: Doutor (1.50) + Stricto Sensu (0.50) + Fomento (0.50) + H5 (1.20) = 3.70
    const insertedOrientadores = await db
      .insert(orientadores)
      .values([
        {
          usuarioId: uOrient1.id,
          departamento: 'Departamento de Medicina e Ciências Biomédicas',
          lattesUrl: 'http://lattes.cnpq.br/4829104820194821',
          titulacao: 'Doutor',
          vinculoStrictoSensu: true,
          fomentoExternoVigente: true,
          indiceH5: '18.00',
          percentilScopus: '75.00',
          regraMaiorBeneficioTipo: 'H5',
          pontuacaoMaiorBeneficio: '1.20',
          artigosUltimos3Anos: 8,
          notaLattes: '3.70',
        },
        // Orientador 2: H5=12 (12/15=0.80) vs Scopus=92 (92/100=0.92) -> Scopus Vence!
        // Lattes: Doutor (1.50) + Stricto Sensu (0.50) + Fomento (0.00) + Scopus (0.92) = 2.92
        {
          usuarioId: uOrient2.id,
          departamento: 'Departamento de Computação e Engenharia de Software',
          lattesUrl: 'http://lattes.cnpq.br/9182301928471928',
          titulacao: 'Doutor',
          vinculoStrictoSensu: true,
          fomentoExternoVigente: false,
          indiceH5: '12.00',
          percentilScopus: '92.00',
          regraMaiorBeneficioTipo: 'Scopus',
          pontuacaoMaiorBeneficio: '0.92',
          artigosUltimos3Anos: 6,
          notaLattes: '2.92',
        },
        // Orientador 3: H5=8 (8/15=0.53) vs Scopus=60 (60/100=0.60) -> Scopus Vence!
        // Lattes: Mestre (1.00) + Stricto Sensu (0.00) + Fomento (0.50) + Scopus (0.60) = 2.10
        {
          usuarioId: uOrient3.id,
          departamento: 'Departamento de Engenharia Civil e Arquitetura',
          lattesUrl: 'http://lattes.cnpq.br/1092837465192837',
          titulacao: 'Mestre',
          vinculoStrictoSensu: false,
          fomentoExternoVigente: true,
          indiceH5: '8.00',
          percentilScopus: '60.00',
          regraMaiorBeneficioTipo: 'Scopus',
          pontuacaoMaiorBeneficio: '0.60',
          artigosUltimos3Anos: 3,
          notaLattes: '2.10',
        },
        // Orientador 4: H5=22.5 (22.5/15=1.50 max) vs Scopus=88 (88/100=0.88) -> H5 Vence!
        // Lattes: Doutor (1.50) + Stricto Sensu (0.50) + Fomento (0.50) + H5 (1.50) = 4.00 (Máximo!)
        {
          usuarioId: uOrient4.id,
          departamento: 'Departamento de Farmácia e Biotecnologia',
          lattesUrl: 'http://lattes.cnpq.br/8271649281726483',
          titulacao: 'Doutor',
          vinculoStrictoSensu: true,
          fomentoExternoVigente: true,
          indiceH5: '22.50',
          percentilScopus: '88.00',
          regraMaiorBeneficioTipo: 'H5',
          pontuacaoMaiorBeneficio: '1.50',
          artigosUltimos3Anos: 12,
          notaLattes: '4.00',
        },
      ])
      .returning();

    const o1 = insertedOrientadores[0];
    const o2 = insertedOrientadores[1];
    const o3 = insertedOrientadores[2];
    const o4 = insertedOrientadores[3];

    // 4. Criar Edital PIC-UNIG 2027
    const [editalPic] = await db
      .insert(editais)
      .values({
        codigo: 'PIC-UNIG 2027',
        titulo: 'Edital do Programa Institucional de Iniciação Científica UNIG 2027/2028',
        ano: 2027,
        totalBolsas: 100,
        bolsasAmplaConcorrencia: 60,
        bolsasAcoesAfirmativas: 40,
        status: 'em_avaliacao',
        inicioSubmissao: new Date('2026-08-01T00:00:00Z'),
        fimSubmissao: new Date('2026-10-31T23:59:59Z'),
      })
      .returning();

    // 5. Criar Dados Pessoais Protegidos LGPD
    await db.insert(dadosPessoaisParticipantes).values([
      {
        usuarioId: uOrient1.id,
        cpfMascarado: '***.482.917-**',
        telefone: '(21) 98822-4411',
        curso: 'Medicina',
        matricula: 'DOC-88210',
        termoLgpdAceito: true,
      },
      {
        usuarioId: uOrient2.id,
        cpfMascarado: '***.319.824-**',
        telefone: '(21) 97134-8899',
        curso: 'Ciência da Computação',
        matricula: 'DOC-91823',
        termoLgpdAceito: true,
      },
    ]);

    // 6. Criar Propostas
    const insertedPropostas = await db
      .insert(propostas)
      .values([
        // Proposta 1: Ampla Concorrência, Orientador H5 vencedor, 2/2 Pareceres, Homologada
        {
          editalId: editalPic.id,
          titulo: 'Avaliação Epidemiológica e Molecular de Patógenos Emergentes na Bacia Hidrográfica de Nova Iguaçu e Baixada Fluminense',
          grandeArea: 'Ciências Biológicas',
          subarea: 'Microbiologia e Saúde Coletiva',
          resumo: 'Investigação da dinâmica de dispersão bacteriana resistente a carbapenêmicos nas águas superficiais do Rio Iguaçu, com identificação molecular via PCR em tempo real e análise de fatores de risco associados às comunidades ribeirinhas.',
          orientadorId: o1.id,
          discenteNome: 'Camila Duarte Rocha',
          discenteEmail: 'camila.duarte@aluno.unig.br',
          discenteCurso: 'Medicina',
          discenteCr: '9.15',
          modalidade: 'Ampla Concorrência',
          tipoCota: null,
          status: 'avaliada',
          hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          arquivoNome: 'projeto_pic_unig_camila_rocha_bio.pdf',
          arquivoUrl: 'https://storage.googleapis.com/pic-unig-2027-vault/projetos/projeto_pic_unig_camila_rocha_bio.pdf',
          habilitacaoEtapa1: true,
          parecerHabilitacao: 'Habilitado regimentalmente. CR 9.15 >= 7.00. Certidões regulares.',
          resultadosPreliminares: true,
          viabilidadeFinanceiraLogistica: true,
          metodoTipo: 'Quantitativo',
          metodoTamanhoAmostra: 180,
          metodoDesenho: 'Ensaio de Roda / Estudo de coorte',
          metodoPontuacaoDesenho: '4.00',
          metodoPontuacaoAmostra: '3.00',
          metodoPontuacaoTipo: '2.00',
          metodoScoreTotal: '9.00',
        },
        // Proposta 2: Ações Afirmativas (PPI), Orientador Scopus vencedor, 2/2 Pareceres, Homologada
        {
          editalId: editalPic.id,
          titulo: 'Algoritmos Preditivos de Aprendizado Profundo para Otimização da Distribuição Energética em Centros de Saúde Universitários',
          grandeArea: 'Ciências Exatas e da Terra',
          subarea: 'Ciência da Computação e Redes Elétricas Inteligentes',
          resumo: 'Modelagem de redes neurais recorrentes (LSTM e Transformers leves) para previsão de demanda elétrica e gestão autônoma de microrredes fotovoltaicas no Hospital Geral de Nova Iguaçu / Campus UNIG.',
          orientadorId: o2.id,
          discenteNome: 'Lucas Vinícius dos Santos',
          discenteEmail: 'lucas.santos@aluno.unig.br',
          discenteCurso: 'Engenharia de Software',
          discenteCr: '8.80',
          modalidade: 'Ações Afirmativas',
          tipoCota: 'Autodeclaração Étnico-Racial (Pretos e Pardos - PPI)',
          status: 'avaliada',
          hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          arquivoNome: 'projeto_pic_unig_lucas_santos_comp.pdf',
          arquivoUrl: 'https://storage.googleapis.com/pic-unig-2027-vault/projetos/projeto_pic_unig_lucas_santos_comp.pdf',
          habilitacaoEtapa1: true,
          parecerHabilitacao: 'Habilitado regimentalmente. Documentação de ações afirmativas validada pela comissão.',
          resultadosPreliminares: true,
          viabilidadeFinanceiraLogistica: true,
          metodoTipo: 'Quantitativo',
          metodoTamanhoAmostra: 240,
          metodoDesenho: 'Ensaio Clínico Randomizado',
          metodoPontuacaoDesenho: '5.00',
          metodoPontuacaoAmostra: '3.00',
          metodoPontuacaoTipo: '2.00',
          metodoScoreTotal: '10.00',
        },
        // Proposta 3: Ações Afirmativas (Escola Pública), Orientador H5 Máximo, 2/2 Pareceres
        {
          editalId: editalPic.id,
          titulo: 'Desenvolvimento de Nanocarreadores Poliméricos Biocompatíveis para Liberação Controlada de Fármacos Oncológicos',
          grandeArea: 'Ciências da Saúde',
          subarea: 'Farmácia e Nanotecnologia',
          resumo: 'Síntese verde e caracterização físico-química de nanopartículas poliméricas baseadas em quitosana e alginato para encapsulamento de doxorrubicina, avaliando citotoxicidade in vitro e estabilidade coloidal.',
          orientadorId: o4.id,
          discenteNome: 'Beatriz Helena Morais',
          discenteEmail: 'beatriz.morais@aluno.unig.br',
          discenteCurso: 'Farmácia',
          discenteCr: '8.95',
          modalidade: 'Ações Afirmativas',
          tipoCota: 'Egresso de Escola Pública e Renda Familiar',
          status: 'avaliada',
          hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          arquivoNome: 'projeto_pic_unig_beatriz_morais_farm.pdf',
          arquivoUrl: 'https://storage.googleapis.com/pic-unig-2027-vault/projetos/projeto_pic_unig_beatriz_morais_farm.pdf',
          habilitacaoEtapa1: true,
          parecerHabilitacao: 'Habilitado regimentalmente com comprovante de escolaridade pública validado.',
          resultadosPreliminares: true,
          viabilidadeFinanceiraLogistica: true,
          metodoTipo: 'Quantitativo',
          metodoTamanhoAmostra: 45,
          metodoDesenho: 'Estudo in vitro',
          metodoPontuacaoDesenho: '1.00',
          metodoPontuacaoAmostra: '1.50',
          metodoPontuacaoTipo: '2.00',
          metodoScoreTotal: '4.50',
        },
        // Proposta 4: Ampla Concorrência, Parcial (1/2 concluído)
        {
          editalId: editalPic.id,
          titulo: 'Análise Comparativa de Técnicas Construtivas Sustentáveis com Concreto Reciclado para Habitações de Interesse Social',
          grandeArea: 'Engenharias',
          subarea: 'Engenharia Civil e Sustentabilidade de Materiais',
          resumo: 'Estudo experimental de resistência à compressão axial e durabilidade em argamassas e blocos com substituição parcial de agregados miúdos por resíduos de construção civil (RCD) gerados em Nova Iguaçu.',
          orientadorId: o3.id,
          discenteNome: 'Rodrigo Mendes da Silva',
          discenteEmail: 'rodrigo.mendes@aluno.unig.br',
          discenteCurso: 'Engenharia Civil',
          discenteCr: '7.85',
          modalidade: 'Ampla Concorrência',
          tipoCota: null,
          status: 'em_avaliacao',
          hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          arquivoNome: 'projeto_pic_unig_rodrigo_mendes_civil.pdf',
          arquivoUrl: 'https://storage.googleapis.com/pic-unig-2027-vault/projetos/projeto_pic_unig_rodrigo_mendes_civil.pdf',
          habilitacaoEtapa1: true,
          parecerHabilitacao: 'Habilitado com CR 7.85 regular.',
          resultadosPreliminares: false,
          viabilidadeFinanceiraLogistica: true,
          metodoTipo: 'Quantitativo',
          metodoTamanhoAmostra: 60,
          metodoDesenho: 'Caso controle',
          metodoPontuacaoDesenho: '3.00',
          metodoPontuacaoAmostra: '2.25',
          metodoPontuacaoTipo: '2.00',
          metodoScoreTotal: '7.25',
        },
        // Proposta 5: Demonstração de DIVERGÊNCIA DA BANCA (> 2.00 pontos de diferença)
        {
          editalId: editalPic.id,
          titulo: 'Impacto das Mudanças Climáticas na Incidência de Arboviroses Urbanas na Região Metropolitana do Rio de Janeiro',
          grandeArea: 'Ciências da Saúde',
          subarea: 'Epidemiologia e Saúde Ambiental',
          resumo: 'Análise de séries temporais associando precipitação extrema, ondas de calor e notificações de Dengue, Zika e Chikungunya na Baixada Fluminense entre 2018 e 2026.',
          orientadorId: o1.id,
          discenteNome: 'Fernanda Siqueira Prado',
          discenteEmail: 'fernanda.prado@aluno.unig.br',
          discenteCurso: 'Medicina',
          discenteCr: '8.40',
          modalidade: 'Ampla Concorrência',
          tipoCota: null,
          status: 'avaliada',
          hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
          arquivoNome: 'projeto_pic_unig_fernanda_prado_epidemio.pdf',
          arquivoUrl: 'https://storage.googleapis.com/pic-unig-2027-vault/projetos/projeto_pic_unig_fernanda_prado_epidemio.pdf',
          habilitacaoEtapa1: true,
          parecerHabilitacao: 'Habilitado regimentalmente.',
          resultadosPreliminares: false,
          viabilidadeFinanceiraLogistica: true,
          metodoTipo: 'Qualitativo',
          metodoTamanhoAmostra: 25,
          metodoDesenho: 'Relato de caso',
          metodoPontuacaoDesenho: '2.00',
          metodoPontuacaoAmostra: '2.25',
          metodoPontuacaoTipo: '1.75',
          metodoScoreTotal: '6.00',
        },
      ])
      .returning();

    const p1 = insertedPropostas[0];
    const p2 = insertedPropostas[1];
    const p3 = insertedPropostas[2];
    const p4 = insertedPropostas[3];
    const p5 = insertedPropostas[4];

    // 7. Distribuições Duplo-Cegas (Avaliador 1 e 2)
    await db.insert(distribuicoesAvaliacao).values([
      { propostaId: p1.id, avaliador1Id: av1.id, avaliador2Id: av2.id, status: 'concluida' },
      { propostaId: p2.id, avaliador1Id: av1.id, avaliador2Id: av2.id, status: 'concluida' },
      { propostaId: p3.id, avaliador1Id: av1.id, avaliador2Id: av2.id, status: 'concluida' },
      { propostaId: p4.id, avaliador1Id: av1.id, avaliador2Id: av2.id, status: 'parcial' },
      { propostaId: p5.id, avaliador1Id: av1.id, avaliador2Id: av2.id, status: 'concluida' },
    ]);

    // 8. Lançar Pareceres Duplo-Cego Detalhados
    // P1: Avaliador 1 (5.75) e Avaliador 2 (5.55) -> Média = 5.65
    await db.insert(avaliacoes).values([
      {
        propostaId: p1.id,
        avaliadorId: av1.id,
        ordemParecerista: 1,
        notaTitulo: '0.50',
        notaIntroducao: '0.70',
        notaObjetivos: '0.75',
        notaJustificativa: '0.50',
        notaMetodologia: '0.95',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.50',
        notaMeritoTotal: '5.75',
        parecerConsubstanciado: 'Projeto de altíssima relevância epidemiológica para a Baixada Fluminense. Metodologia de PCR em tempo real sólida e factível. O plano de trabalho do discente está minuciosamente articulado às metas laboratoriais.',
        recomendacao: 'Recomendado para Bolsa',
      },
      {
        propostaId: p1.id,
        avaliadorId: av2.id,
        ordemParecerista: 2,
        notaTitulo: '0.50',
        notaIntroducao: '0.70',
        notaObjetivos: '0.70',
        notaJustificativa: '0.45',
        notaMetodologia: '0.90',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.45',
        notaMeritoTotal: '5.55',
        parecerConsubstanciado: 'Excelente aderência aos Objetivos de Desenvolvimento Sustentável (ODS 3 e 6). Cronograma exequível no horizonte de 12 meses. Parecer favorável à concessão com destaque institucional.',
        recomendacao: 'Recomendado para Bolsa',
      },
      // P2: Avaliador 1 (5.60) e Avaliador 2 (5.40) -> Média = 5.50
      {
        propostaId: p2.id,
        avaliadorId: av1.id,
        ordemParecerista: 1,
        notaTitulo: '0.50',
        notaIntroducao: '0.70',
        notaObjetivos: '0.70',
        notaJustificativa: '0.50',
        notaMetodologia: '0.90',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.45',
        notaMeritoTotal: '5.60',
        parecerConsubstanciado: 'Proposta de vanguarda tecnológica. A aplicação de redes neurais recorrentes para microrredes hospitalares demonstra alta originalidade e forte impacto de eficiência energética na infraestrutura da UNIG.',
        recomendacao: 'Recomendado para Bolsa',
      },
      {
        propostaId: p2.id,
        avaliadorId: av2.id,
        ordemParecerista: 2,
        notaTitulo: '0.45',
        notaIntroducao: '0.65',
        notaObjetivos: '0.70',
        notaJustificativa: '0.45',
        notaMetodologia: '0.85',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.65',
        notaInsercaoSocial: '0.50',
        notaMeritoTotal: '5.40',
        parecerConsubstanciado: 'Delineamento experimental muito bem fundamentado. O plano discente propõe treinamento prático robusto em engenharia de dados e aprendizado supervisionado.',
        recomendacao: 'Recomendado para Bolsa',
      },
      // P3: Avaliador 1 (5.80) e Avaliador 2 (5.70) -> Média = 5.75
      {
        propostaId: p3.id,
        avaliadorId: av1.id,
        ordemParecerista: 1,
        notaTitulo: '0.50',
        notaIntroducao: '0.75',
        notaObjetivos: '0.75',
        notaJustificativa: '0.50',
        notaMetodologia: '0.95',
        notaViabilidade: '0.75',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.45',
        notaMeritoTotal: '5.80',
        parecerConsubstanciado: 'Projeto exemplar no campo da nanotecnologia farmacêutica. Protocolos rigorosos de síntese de nanopartículas e citotoxicidade celular.',
        recomendacao: 'Recomendado para Bolsa',
      },
      {
        propostaId: p3.id,
        avaliadorId: av2.id,
        ordemParecerista: 2,
        notaTitulo: '0.50',
        notaIntroducao: '0.70',
        notaObjetivos: '0.75',
        notaJustificativa: '0.50',
        notaMetodologia: '0.95',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.45',
        notaMeritoTotal: '5.70',
        parecerConsubstanciado: 'Grande impacto potencial no tratamento oncológico. O laboratório de nanobiotecnologia possui infraestrutura plenamente adequada.',
        recomendacao: 'Recomendado para Bolsa',
      },
      // P4: Apenas Avaliador 1 lançou nota (5.10). Avaliador 2 está pendente (1/2 parcial).
      {
        propostaId: p4.id,
        avaliadorId: av1.id,
        ordemParecerista: 1,
        notaTitulo: '0.45',
        notaIntroducao: '0.65',
        notaObjetivos: '0.65',
        notaJustificativa: '0.45',
        notaMetodologia: '0.80',
        notaViabilidade: '0.65',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.60',
        notaInsercaoSocial: '0.40',
        notaMeritoTotal: '5.10',
        parecerConsubstanciado: 'Tema social e ambiental relevante para Habitação de Interesse Social. Metodologia de ensaios de tração e compressão precisa de maior detalhamento amostral.',
        recomendacao: 'Recomendado com Ressalvas',
      },
      // P5: Avaliador 1 (5.60) vs Avaliador 2 (3.10) -> Diferença = 2.50 pts (DIVERGÊNCIA DETECTADA!)
      {
        propostaId: p5.id,
        avaliadorId: av1.id,
        ordemParecerista: 1,
        notaTitulo: '0.50',
        notaIntroducao: '0.70',
        notaObjetivos: '0.70',
        notaJustificativa: '0.50',
        notaMetodologia: '0.90',
        notaViabilidade: '0.70',
        notaCronograma: '0.45',
        notaPlanoDiscente: '0.70',
        notaInsercaoSocial: '0.45',
        notaMeritoTotal: '5.60',
        parecerConsubstanciado: 'Excelente correlação epidemiológica e climática na Baixada Fluminense. Métodos robustos.',
        recomendacao: 'Recomendado para Bolsa',
      },
      {
        propostaId: p5.id,
        avaliadorId: av2.id,
        ordemParecerista: 2,
        notaTitulo: '0.30',
        notaIntroducao: '0.40',
        notaObjetivos: '0.45',
        notaJustificativa: '0.30',
        notaMetodologia: '0.50',
        notaViabilidade: '0.40',
        notaCronograma: '0.25',
        notaPlanoDiscente: '0.30',
        notaInsercaoSocial: '0.20',
        notaMeritoTotal: '3.10',
        parecerConsubstanciado: 'Considero que a série temporal proposta é curta e faltam variáveis de controle fundamentais de saneamento básico para isolar o efeito estritamente climático.',
        recomendacao: 'Não Recomendado',
      },
    ]);

    // 9. Cálculos e Classificação Consolidada
    // Fórmula Regimental:
    // Nota Projeto (0-10) = (mediaEtapa2 / 6.0) * 10
    // Nota Orientador (0-10) = (notaLattes / 4.0) * 10
    // Nota Aluno (0-10) = discenteCr
    // Nota Final Ponderada = (Nota Orientador * 0.30) + (Nota Projeto * 0.50) + (Nota Aluno * 0.20)
    
    // P3:
    // mediaEtapa2 = (5.80 + 5.70)/2 = 5.75 -> Projeto(10) = 5.75/6*10 = 9.583
    // o4 Lattes = 4.00 -> Orientador(10) = 4.00/4*10 = 10.00
    // Discente CR = 8.95
    // Ponderada = (10.00 * 0.30) + (9.583 * 0.50) + (8.95 * 0.20) = 3.00 + 4.79 + 1.79 = 9.58
    await db.insert(calculosClassificacao).values([
      {
        propostaId: p3.id,
        notaEtapa2Avaliador1: '5.80',
        notaEtapa2Avaliador2: '5.70',
        mediaEtapa2Merito: '5.75',
        divergenciaDetectada: false,
        notaEtapa3Orientador: '4.00',
        notaAluno: '8.95',
        notaFinalPonderada: '9.58',
        classificacaoGeral: 1,
        classificacaoModalidade: 1,
        tipoVagaConcedida: 'Ações Afirmativas',
        criterioDesempateAplicado: '1º Lugar Ações Afirmativas - Maior Nota Final',
        homologado: true,
        homologadoEm: new Date(),
      },
      // P1:
      // mediaEtapa2 = (5.75 + 5.55)/2 = 5.65 -> Projeto(10) = 5.65/6*10 = 9.417
      // o1 Lattes = 3.70 -> Orientador(10) = 3.70/4*10 = 9.250
      // Discente CR = 9.15
      // Ponderada = (9.25 * 0.30) + (9.417 * 0.50) + (9.15 * 0.20) = 2.775 + 4.708 + 1.83 = 9.31
      {
        propostaId: p1.id,
        notaEtapa2Avaliador1: '5.75',
        notaEtapa2Avaliador2: '5.55',
        mediaEtapa2Merito: '5.65',
        divergenciaDetectada: false,
        notaEtapa3Orientador: '3.70',
        notaAluno: '9.15',
        notaFinalPonderada: '9.31',
        classificacaoGeral: 2,
        classificacaoModalidade: 1,
        tipoVagaConcedida: 'Ampla Concorrência',
        criterioDesempateAplicado: '1º Lugar Ampla Concorrência - Maior Nota Final',
        homologado: true,
        homologadoEm: new Date(),
      },
      // P2:
      // mediaEtapa2 = (5.60 + 5.40)/2 = 5.50 -> Projeto(10) = 5.50/6*10 = 9.167
      // o2 Lattes = 2.92 -> Orientador(10) = 2.92/4*10 = 7.300
      // Discente CR = 8.80
      // Ponderada = (7.30 * 0.30) + (9.167 * 0.50) + (8.80 * 0.20) = 2.19 + 4.583 + 1.76 = 8.53
      {
        propostaId: p2.id,
        notaEtapa2Avaliador1: '5.60',
        notaEtapa2Avaliador2: '5.40',
        mediaEtapa2Merito: '5.50',
        divergenciaDetectada: false,
        notaEtapa3Orientador: '2.92',
        notaAluno: '8.80',
        notaFinalPonderada: '8.53',
        classificacaoGeral: 3,
        classificacaoModalidade: 2,
        tipoVagaConcedida: 'Ações Afirmativas',
        criterioDesempateAplicado: '2º Lugar Ações Afirmativas - Cotas PPI Contempladas',
        homologado: true,
        homologadoEm: new Date(),
      },
      // P5:
      // Diferença = |5.60 - 3.10| = 2.50 (> 2.00!) -> DIVERGÊNCIA DETECTADA
      {
        propostaId: p5.id,
        notaEtapa2Avaliador1: '5.60',
        notaEtapa2Avaliador2: '3.10',
        mediaEtapa2Merito: '4.35',
        divergenciaDetectada: true,
        notaEtapa3Orientador: '3.70',
        notaAluno: '8.40',
        notaFinalPonderada: '7.82',
        classificacaoGeral: 4,
        classificacaoModalidade: 2,
        tipoVagaConcedida: 'Em Deliberação da Banca (Árbitro)',
        criterioDesempateAplicado: 'Alerta: Divergência entre Avaliador 1 e 2 superior a 2.00 pontos. Requer árbitro.',
        homologado: false,
      },
    ]);

    // 10. Análises IA Gemini (1º Momento)
    await db.insert(analisesIaGemini).values([
      {
        propostaId: p1.id,
        pontuacaoEstimada: '5.60',
        parecerGeral: 'Proposta de excelência com alta aderência às diretrizes sanitárias da Baixada Fluminense. Os marcadores de resistência a carbapenêmicos foram especificados de forma técnica impecável.',
        aderenciaEdital: '100% de conformidade com os eixos prioritários de Saúde e Meio Ambiente do PIC-UNIG.',
        viabilidadeTecnica: 'Infraestrutura do Laboratório de Microbiologia da UNIG é plenamente capacitada para extração e PCR.',
        recomendacoes: 'Recomenda-se articular com a Secretaria Municipal de Saúde de Nova Iguaçu para compartilhamento de dados epidemiológicos.',
        modeloUsado: 'gemini-3.8-flash',
      },
      {
        propostaId: p2.id,
        pontuacaoEstimada: '5.45',
        parecerGeral: 'Inovação notável na aplicação de IA para microrredes hospitalares. A estrutura de aprendizado profundo (LSTM/Transformers) é contemporânea e viável com hardware acadêmico.',
        aderenciaEdital: 'Excelente aderência aos Objetivos de Desenvolvimento Sustentável (ODS 7 - Energia Limpa e ODS 9 - Inovação).',
        viabilidadeTecnica: 'Exequibilidade comprovada com dados de consumo já disponibilizados pela prefeitura do campus.',
        recomendacoes: 'Sugerida validação cruzada com períodos sazonais de pico no verão fluminense.',
        modeloUsado: 'gemini-3.8-flash',
      },
      {
        propostaId: p3.id,
        pontuacaoEstimada: '5.75',
        parecerGeral: 'Projeto altamente sofisticado na área de nanobiotecnologia oncológica. O método de síntese com quitosana e alginato atende aos requisitos de química verde.',
        aderenciaEdital: 'Plena conformidade com os critérios de mérito e relevância científica.',
        viabilidadeTecnica: 'Equipamentos de espalhamento de luz dinâmico (DLS) e espectrofotometria disponíveis no campus.',
        recomendacoes: 'Detalhar os controles positivos e negativos nos ensaios de citotoxicidade celular.',
        modeloUsado: 'gemini-3.8-flash',
      },
      {
        propostaId: p4.id,
        pontuacaoEstimada: '5.10',
        parecerGeral: 'Projeto com sólido apelo social e sustentável para habitação popular. Requer ajuste no tamanho amostral dos corpos de prova.',
        aderenciaEdital: 'Conforme às prioridades de Engenharia Sustentável do Edital.',
        viabilidadeTecnica: 'Prensa de ensaios e laboratório de materiais aptos para os testes mecânicos.',
        recomendacoes: 'Especificar a granulometria do resíduo de construção antes da moldagem.',
        modeloUsado: 'gemini-3.8-flash',
      },
      {
        propostaId: p5.id,
        pontuacaoEstimada: '4.80',
        parecerGeral: 'Tema de alta urgência sanitária. Observa-se necessidade de controlar variáveis de saneamento e pluviosidade para corroborar os dados.',
        aderenciaEdital: 'Conforme com a área temática de Saúde Coletiva.',
        viabilidadeTecnica: 'Acesso às bases de dados DATASUS e INMET assegurado.',
        recomendacoes: 'Indica-se aprofundar a metodologia de regressão multivariada para evitar correlações espúrias.',
        modeloUsado: 'gemini-3.8-flash',
      },
    ]);

    // 11. Trilha de Auditoria LGPD Inicial
    await db.insert(auditoriaLogs).values([
      {
        usuarioId: uAdmin.id,
        usuarioEmail: uAdmin.email,
        acao: 'ABERTURA_EDITAL',
        entidade: 'editais',
        entidadeId: editalPic.id,
        detalhes: 'Abertura oficial do Edital PIC-UNIG 2027 com distribuição de 100 bolsas (60 AC + 40 AF).',
        ipOrigem: '189.28.14.92',
      },
      {
        usuarioId: uCoord.id,
        usuarioEmail: uCoord.email,
        acao: 'DISTRIBUICAO_BANCA_CEGA',
        entidade: 'distribuicoes_avaliacao',
        entidadeId: p1.id,
        detalhes: 'Atribuição duplo-cega de 2 pareceristas titulares independentes sem identificação de autoria.',
        ipOrigem: '189.28.14.95',
      },
      {
        usuarioId: uAval1.id,
        usuarioEmail: uAval1.email,
        acao: 'PARECER_REGISTRADO',
        entidade: 'avaliacoes',
        entidadeId: p1.id,
        detalhes: 'Lançamento de notas da Etapa 2 de Mérito Técnico-Científico (Nota: 5.75/6.00).',
        ipOrigem: '201.83.42.10',
      },
    ]);

    console.log('Seed do PIC-UNIG 2027 concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o seed do banco de dados:', error);
  }
}
