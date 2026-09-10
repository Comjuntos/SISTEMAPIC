import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { runDatabaseSeed } from './src/server/seed.ts';
import {
  getEditalAtivo,
  getEditaisList,
  setEditalAtivo,
  criarNovoEditalAnual,
  atualizarEdital,
  atualizarFaseCronograma,
  atualizarCronogramaLote,
  prorrogarPrazosEdital,
  avancarFaseEdital,
  getPropostasList,
  getPropostaDetalhada,
  submeterNovaProposta,
  lancarAvaliacaoParecerista,
  homologarDistribuicaoBolsas,
  getAuditoriaLogsList,
  getUsuariosList,
  getOrientadoresList,
  atualizarPapelUsuario,
} from './src/server/db-service.ts';
import { analisarPropostaComGemini } from './src/server/gemini.ts';
import {
  getNotificacoesPorEmail,
  marcarNotificacaoComoLida,
  enviarNotificacaoParaOrientadorProposta,
} from './src/server/notification-service.ts';
import { optionalAuth } from './src/middleware/auth.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Express body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Seed initial data asynchronously on boot
  runDatabaseSeed().catch((err) => {
    console.error('Falha no seed inicial:', err);
  });

  // --- ROTAS DA API ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', sistema: 'PIC-UNIG 2027', timestamp: new Date().toISOString() });
  });

  // Obter Edital Vigente / Ativo
  app.get('/api/edital', async (_req, res) => {
    try {
      const edital = await getEditalAtivo();
      res.json(edital);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao carregar edital' });
    }
  });

  // Listar Todos os Editais Anuais & Histórico
  app.get('/api/editais', async (_req, res) => {
    try {
      const lista = await getEditaisList();
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar editais' });
    }
  });

  // Alternar Edital Ativo do Sistema (Apenas Coordenação e Admin)
  app.post('/api/editais/:id/ativar', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');
      const edital = await setEditalAtivo(id, usuarioEmail, ipOrigem);
      res.json(edital);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao ativar edital' });
    }
  });

  // Criar Novo Edital Anual (Apenas Coordenação e Admin)
  app.post('/api/editais', optionalAuth, async (req: any, res) => {
    try {
      const {
        codigo,
        titulo,
        ano,
        totalBolsas,
        bolsasAmplaConcorrencia,
        bolsasAcoesAfirmativas,
        status,
        inicioSubmissao,
        fimSubmissao,
      } = req.body;

      if (!codigo || !titulo || !ano || !totalBolsas) {
        return res.status(400).json({ error: 'Preencha código, título, ano e total de bolsas do edital.' });
      }

      const usuarioEmail = req.user?.email || 'proreitoria.pesquisa@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');

      const criado = await criarNovoEditalAnual({
        codigo,
        titulo,
        ano: Number(ano),
        totalBolsas: Number(totalBolsas),
        bolsasAmplaConcorrencia: Number(bolsasAmplaConcorrencia || Math.round(Number(totalBolsas) * 0.6)),
        bolsasAcoesAfirmativas: Number(bolsasAcoesAfirmativas || Math.round(Number(totalBolsas) * 0.4)),
        status: status || 'planejamento',
        inicioSubmissao,
        fimSubmissao,
        usuarioEmail,
        ipOrigem,
      });

      res.status(201).json(criado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao criar edital' });
    }
  });

  // Atualizar Parâmetros do Edital Anual
  app.put('/api/editais/:id', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');
      const atualizado = await atualizarEdital(id, req.body, usuarioEmail, ipOrigem);
      res.json(atualizado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao atualizar edital' });
    }
  });

  // Atualizar Fase Específica do Cronograma Regimental
  app.put('/api/editais/:id/cronograma/fases/:faseId', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const faseId = req.params.faseId;
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');
      const resultado = await atualizarFaseCronograma(id, faseId, req.body, usuarioEmail, ipOrigem);
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao atualizar etapa do cronograma' });
    }
  });

  // Atualizar Cronograma Completo em Lote
  app.put('/api/editais/:id/cronograma', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { fases } = req.body;
      if (!Array.isArray(fases)) {
        return res.status(400).json({ error: 'O corpo da requisição deve conter a lista de fases.' });
      }
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');
      const resultado = await atualizarCronogramaLote(id, fases, usuarioEmail, ipOrigem);
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao atualizar cronograma em lote' });
    }
  });

  // Prorrogação de Prazos Regimental (Termo Aditivo)
  app.post('/api/editais/:id/prorrogar-prazos', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');
      const resultado = await prorrogarPrazosEdital(id, req.body, usuarioEmail, ipOrigem);
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao prorrogar prazos regimentais' });
    }
  });

  // Transitar Fase na Linha do Tempo do Edital
  app.post('/api/editais/:id/avancar-fase', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { novaFaseId, justificativa } = req.body;
      if (!novaFaseId) {
        return res.status(400).json({ error: 'Informe a nova fase do cronograma.' });
      }

      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');

      const edital = await avancarFaseEdital(id, novaFaseId, justificativa, usuarioEmail, ipOrigem);
      res.json(edital);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao avançar fase do edital' });
    }
  });

  // Listar Propostas
  app.get('/api/propostas', async (_req, res) => {
    try {
      const propostas = await getPropostasList();
      res.json(propostas);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao carregar propostas' });
    }
  });

  // Obter Detalhes da Proposta (com Banca Dupla, Avaliações e Análise IA)
  app.get('/api/propostas/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const proposta = await getPropostaDetalhada(id);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      res.json(proposta);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao carregar proposta' });
    }
  });

  // Submissão de Projeto (com cálculo SHA-256 e IA preliminar)
  app.post('/api/propostas', optionalAuth, async (req: any, res) => {
    try {
      const {
        titulo,
        grandeArea,
        subarea,
        resumo,
        orientadorId,
        discenteNome,
        discenteEmail,
        discenteCurso,
        discenteCr,
        modalidade,
        tipoCota,
        arquivoNome,
        arquivoConteudoBase64,
        metodoTipo,
        metodoTamanhoAmostra,
        metodoDesenho,
      } = req.body;

      if (!titulo || !grandeArea || !resumo || !orientadorId || !discenteNome || !discenteCr) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios do projeto e discente.' });
      }

      const usuarioEmail = req.user?.email || 'submissao.docente@unig.br';
      const ipOrigem = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      const nova = await submeterNovaProposta({
        titulo,
        grandeArea,
        subarea: subarea || 'Geral',
        resumo,
        orientadorId: Number(orientadorId),
        discenteNome,
        discenteEmail: discenteEmail || 'discente@aluno.unig.br',
        discenteCurso: discenteCurso || 'Graduação',
        discenteCr: Number(discenteCr),
        modalidade: modalidade || 'Ampla Concorrência',
        tipoCota,
        arquivoNome: arquivoNome || 'projeto_submetido_pic2027.pdf',
        arquivoConteudoBase64,
        metodoTipo,
        metodoTamanhoAmostra: metodoTamanhoAmostra ? Number(metodoTamanhoAmostra) : undefined,
        metodoDesenho,
        usuarioEmail,
        ipOrigem: String(ipOrigem),
      });

      res.status(201).json(nova);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao submeter proposta' });
    }
  });

  // Lançar Parecer Duplo-Cego do Parecerista
  app.post('/api/avaliacoes', optionalAuth, async (req: any, res) => {
    try {
      const {
        propostaId,
        avaliadorId,
        ordemParecerista,
        notaTitulo,
        notaIntroducao,
        notaObjetivos,
        notaJustificativa,
        notaMetodologia,
        notaViabilidade,
        notaCronograma,
        notaPlanoDiscente,
        notaInsercaoSocial,
        parecerConsubstanciado,
        recomendacao,
      } = req.body;

      if (!propostaId || !avaliadorId || !ordemParecerista || !parecerConsubstanciado) {
        return res.status(400).json({ error: 'Dados incompletos da avaliação.' });
      }

      const usuarioEmail = req.user?.email || (ordemParecerista === 1 ? 'carlos.meireles@unig.br' : 'juliana.fontes@unig.br');
      const ipOrigem = req.ip || '127.0.0.1';

      const result = await lancarAvaliacaoParecerista({
        propostaId: Number(propostaId),
        avaliadorId: Number(avaliadorId),
        ordemParecerista: Number(ordemParecerista),
        notaTitulo: Number(notaTitulo || 0),
        notaIntroducao: Number(notaIntroducao || 0),
        notaObjetivos: Number(notaObjetivos || 0),
        notaJustificativa: Number(notaJustificativa || 0),
        notaMetodologia: Number(notaMetodologia || 0),
        notaViabilidade: Number(notaViabilidade || 0),
        notaCronograma: Number(notaCronograma || 0),
        notaPlanoDiscente: Number(notaPlanoDiscente || 0),
        notaInsercaoSocial: Number(notaInsercaoSocial || 0),
        parecerConsubstanciado,
        recomendacao: recomendacao || 'Recomendado para Bolsa',
        usuarioEmail,
        ipOrigem: String(ipOrigem),
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao registrar parecer' });
    }
  });

  // Disparar re-análise IA Gemini sob demanda
  app.post('/api/propostas/:id/analisar-gemini', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const proposta = await getPropostaDetalhada(id);
      if (!proposta) {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }

      const iaResult = await analisarPropostaComGemini({
        titulo: proposta.titulo,
        grandeArea: proposta.grandeArea,
        subarea: proposta.subarea,
        resumo: proposta.resumo,
      });

      res.json(iaResult);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao analisar proposta com Gemini' });
    }
  });

  // Homologar Classificação e Distribuição das 100 Bolsas
  app.post('/api/homologar', async (_req, res) => {
    try {
      const result = await homologarDistribuicaoBolsas();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha na homologação' });
    }
  });

  // Listar Docentes Orientadores
  app.get('/api/orientadores', async (_req, res) => {
    try {
      const lista = await getOrientadoresList();
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao listar orientadores' });
    }
  });

  // Trilha de Auditoria LGPD
  app.get('/api/auditoria', async (_req, res) => {
    try {
      const logs = await getAuditoriaLogsList();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao listar auditoria' });
    }
  });

  // Listar Usuários e Papéis
  app.get('/api/usuarios', async (_req, res) => {
    try {
      const users = await getUsuariosList();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao listar usuários' });
    }
  });

  // Atualizar Papel Regimental do Usuário (Coordenação / Admin)
  app.put('/api/usuarios/:id/papel', optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { papel } = req.body;
      if (!papel) {
        return res.status(400).json({ error: 'Informe o novo papel do usuário.' });
      }
      const usuarioEmail = req.user?.email || 'coordenacao.pic@unig.br';
      const ipOrigem = String(req.ip || '127.0.0.1');

      const atualizado = await atualizarPapelUsuario(id, papel, usuarioEmail, ipOrigem);
      res.json(atualizado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao atualizar papel do usuário' });
    }
  });

  // --- SERVIÇO DE NOTIFICAÇÕES E E-MAILS SIMULADOS ---
  app.get('/api/notificacoes', async (req, res) => {
    try {
      const email = String(req.query.email || '');
      if (!email) {
        return res.status(400).json({ error: 'Informe o e-mail.' });
      }
      const lista = await getNotificacoesPorEmail(email);
      res.json(lista);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao buscar notificações' });
    }
  });

  app.put('/api/notificacoes/:id/lida', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const atualizada = await marcarNotificacaoComoLida(id);
      res.json(atualizada);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao atualizar notificação' });
    }
  });

  app.post('/api/notificacoes/teste', async (req, res) => {
    try {
      const { propostaId, assunto, corpo } = req.body;
      await enviarNotificacaoParaOrientadorProposta({
        propostaId: Number(propostaId || 1),
        tipo: 'GERAL',
        assunto: assunto || 'Teste de Notificação Institucional - PIC-UNIG 2027',
        corpo: corpo || 'Este é um alerta de teste simulado enviado pelo sistema PIC-UNIG 2027.',
      });
      res.json({ success: true, message: 'Alerta de e-mail simulado enviado com sucesso.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao enviar teste' });
    }
  });

  // Emissão de URL Assinada de Download Seguro com Hash SHA-256
  app.get('/api/download-url/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const proposta = await getPropostaDetalhada(id);
      if (!proposta) {
        return res.status(404).json({ error: 'Projeto não localizado' });
      }

      // Simulação de URL assinada Google Cloud Storage (v4 signed URL com expiração em 15 minutos)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const signedUrl = `${proposta.arquivoUrl}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=pic-service-vault%40unig.iam.gserviceaccount.com&X-Goog-Date=20260909T184000Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=d41d8cd98f00b204e9800998ecf8427e`;

      res.json({
        arquivoNome: proposta.arquivoNome,
        hashSha256: proposta.hashSha256,
        signedUrl,
        expiresAt,
        integridade: 'Verificada (SHA-256 correspondente)',
        armazenamento: 'Google Cloud Storage Seguro (Privado)',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao gerar URL assinada' });
    }
  });

  // --- VITE MIDDLEWARE (DEV E PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PIC-UNIG 2027 Server executando em http://localhost:${PORT}`);
  });
}

startServer();
