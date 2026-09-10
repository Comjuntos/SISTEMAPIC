import { db } from '../db/index.ts';
import { notificacoes, propostas, orientadores, usuarios } from '../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

interface EnviarNotificacaoParams {
  propostaId: number;
  tipo: 'STATUS_ALTERADO' | 'PARECER_RECEBIDO' | 'GERAL';
  assunto: string;
  corpo: string;
}

export async function enviarNotificacaoParaOrientadorProposta({
  propostaId,
  tipo,
  assunto,
  corpo,
}: EnviarNotificacaoParams) {
  try {
    const [prop] = await db
      .select({
        id: propostas.id,
        titulo: propostas.titulo,
        status: propostas.status,
        orientadorId: propostas.orientadorId,
      })
      .from(propostas)
      .where(eq(propostas.id, propostaId));

    if (!prop) {
      console.warn(`[NOTIFICAÇÃO] Proposta ID ${propostaId} não encontrada.`);
      return;
    }

    const [orientador] = await db
      .select({
        id: orientadores.id,
        usuarioId: orientadores.usuarioId,
      })
      .from(orientadores)
      .where(eq(orientadores.id, prop.orientadorId));

    if (!orientador) {
      console.warn(`[NOTIFICAÇÃO] Orientador não encontrado para proposta ID ${propostaId}.`);
      return;
    }

    const [user] = await db
      .select({
        nome: usuarios.nome,
        email: usuarios.email,
      })
      .from(usuarios)
      .where(eq(usuarios.id, orientador.usuarioId));

    if (!user) {
      console.warn(`[NOTIFICAÇÃO] Usuário orientador não encontrado para ID ${orientador.usuarioId}.`);
      return;
    }

    // Log de E-mail Simulado no Console do Servidor
    console.log('\n================================================================');
    console.log('📧 [E-MAIL SIMULADO INSTITUCIONAL - PIC-UNIG 2027]');
    console.log('----------------------------------------------------------------');
    console.log(`Para        : ${user.nome} <${user.email}>`);
    console.log(`Tipo Alerta : ${tipo}`);
    console.log(`Projeto     : [ID ${prop.id}] ${prop.titulo}`);
    console.log(`Status Atual: ${prop.status}`);
    console.log(`Assunto     : ${assunto}`);
    console.log(`Mensagem    :\n${corpo}`);
    console.log('================================================================\n');

    // Salvar no Banco de Dados para exibição no Modal / Caixa de E-mails
    await db.insert(notificacoes).values({
      orientadorId: orientador.id,
      orientadorEmail: user.email,
      propostaId: prop.id,
      assunto,
      corpo,
      tipo,
      lida: false,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação simulada por e-mail:', error);
  }
}

export async function getNotificacoesPorEmail(email: string) {
  try {
    return await db
      .select()
      .from(notificacoes)
      .where(eq(notificacoes.orientadorEmail, email.toLowerCase()))
      .orderBy(desc(notificacoes.criadoEm));
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

export async function marcarNotificacaoComoLida(id: number) {
  try {
    const [atualizada] = await db
      .update(notificacoes)
      .set({ lida: true })
      .where(eq(notificacoes.id, id))
      .returning();
    return atualizada;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw new Error('Falha ao atualizar notificação.');
  }
}
