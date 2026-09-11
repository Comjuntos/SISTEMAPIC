import React, { useState, useMemo } from 'react';
import { Edital, Usuario, Proposta } from '../types/index.ts';
import {
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Info,
  Send,
  FileCheck,
  GraduationCap,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface QuadroDeAvisosProps {
  edital?: Edital;
  currentUser: Usuario;
  propostas: Proposta[];
  onNavigateTab: (tabId: string) => void;
  className?: string;
}

interface AvisoItem {
  id: string;
  titulo: string;
  categoria: 'urgente' | 'cronograma' | 'normativa' | 'sucesso';
  destinatarios: ('orientador' | 'avaliador' | 'admin' | 'coordenador')[];
  dataLimite?: string;
  diasRestantes?: number;
  mensagem: string;
  acaoRotulo?: string;
  acaoDestinoTab?: string;
  destaque?: boolean;
  baseRegimental?: string;
}

export const QuadroDeAvisos: React.FC<QuadroDeAvisosProps> = ({
  edital,
  currentUser,
  propostas,
  onNavigateTab,
  className = '',
}) => {
  const [expandido, setExpandido] = useState<boolean>(true);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'meu_papel' | 'urgente' | 'cronograma'>('meu_papel');
  const [avisosLidos, setAvisosLidos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unig_pic_avisos_lidos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const marcarComoLido = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const novos = avisosLidos.includes(id)
      ? avisosLidos.filter((item) => item !== id)
      : [...avisosLidos, id];
    setAvisosLidos(novos);
    try {
      localStorage.setItem('unig_pic_avisos_lidos', JSON.stringify(novos));
    } catch {
      // Ignorar erro de armazenamento local
    }
  };

  // Cronograma do edital ativo
  const cronograma = edital?.cronograma || [];
  const faseSubmissao = cronograma.find((f) => f.faseNumero === 2 || f.id === 'fase-2');
  const faseAvaliacao = cronograma.find((f) => f.faseNumero === 4 || f.id === 'fase-4');
  const faseRecursos = cronograma.find((f) => f.faseNumero === 7 || f.id === 'fase-7');
  const faseResultadoPreliminar = cronograma.find((f) => f.faseNumero === 6 || f.id === 'fase-6');

  // Cálculos dinâmicos
  const propostasSemAvaliacaoCount = useMemo(() => {
    return propostas.filter((p) => p.status === 'em_avaliacao' || (p.avaliacoes && p.avaliacoes.length < 2)).length;
  }, [propostas]);

  const meusProjetosCount = useMemo(() => {
    if (!currentUser || currentUser.papel !== 'orientador') return 0;
    return propostas.filter(
      (p) =>
        p.orientadorId === currentUser.id ||
        (p.orientador?.usuarioNome && (p.orientador.usuarioNome || '').toLowerCase().includes((currentUser?.nome || '').toLowerCase()))
    ).length;
  }, [propostas, currentUser]);

  // Montagem da lista inteligente de avisos conforme o edital
  const avisos = useMemo<AvisoItem[]>(() => {
    const lista: AvisoItem[] = [];

    // 1. AVISO: Prazo Final de Submissão de Projetos (Para Professores e Geral)
    const dataFimSubmissao = faseSubmissao?.dataFim || (edital?.fimSubmissao ? new Date(edital.fimSubmissao).toLocaleDateString('pt-BR') : '31/10/2026');
    lista.push({
      id: 'aviso-submissao-prazo',
      titulo: 'Prazo Final para Submissão de Projetos de Pesquisa',
      categoria: 'urgente',
      destinatarios: ['orientador', 'admin', 'coordenador'],
      dataLimite: dataFimSubmissao,
      diasRestantes: 18,
      mensagem:
        'Atenção, professores orientadores: o prazo para submissão eletrônica de planos de trabalho encerra-se improrrogavelmente às 23h59. Lembre-se de anexar o plano em PDF com o hash SHA-256 e verificar o CR mínimo de 6.0 do discente indicado.',
      acaoRotulo: 'Enviar Projeto Agora',
      acaoDestinoTab: 'submissao',
      destaque: true,
      baseRegimental: 'Item 4 do Edital PIC-UNIG • Anexo I e III',
    });

    // 2. AVISO: Prazo de Conclusão da Avaliação da Banca (Para Avaliadores e Geral)
    const dataFimAvaliacao = faseAvaliacao?.dataFim || '30/11/2026';
    lista.push({
      id: 'aviso-avaliacao-prazo',
      titulo: 'Encerramento da Etapa 2 de Avaliação de Mérito pela Banca',
      categoria: 'urgente',
      destinatarios: ['avaliador', 'admin', 'coordenador'],
      dataLimite: dataFimAvaliacao,
      diasRestantes: 24,
      mensagem: `Aos avaliadores pareceristas: restam ${propostasSemAvaliacaoCount} pareceres a serem concluídos no módulo duplo-cego. Cada proposta requer avaliação em 9 dimensões regimentais (0 a 6 pts) com suporte preliminar da IA Gemini. Divergências superiores a 2,0 pontos demandarão 3º árbitro.`,
      acaoRotulo: 'Avaliar Projetos Pendentes',
      acaoDestinoTab: 'banca',
      destaque: true,
      baseRegimental: 'Item 7 do Edital PIC-UNIG • Anexo VI (Critérios da Banca)',
    });

    // 3. AVISO: Relação Oficial de 19 Cursos de Graduação e 4 Mestrados
    lista.push({
      id: 'aviso-cursos-anexo4',
      titulo: 'Catálogo de Cursos Elegíveis ao PIC (Anexo IV)',
      categoria: 'normativa',
      destinatarios: ['orientador', 'avaliador', 'admin', 'coordenador'],
      mensagem:
        'O Anexo IV contempla 19 cursos de graduação e 4 programas de pós-graduação stricto sensu (Mestrado) autorizados pelo MEC. Toda submissão deve vincular expressamente a sigla oficial do curso da proposta.',
      acaoRotulo: 'Consultar Relação de Cursos',
      acaoDestinoTab: 'anexos',
      baseRegimental: 'Anexo IV do Edital PIC-UNIG',
    });

    // 4. AVISO: Cálculo da Nota Final e Distribuição das 100 Bolsas
    lista.push({
      id: 'aviso-calculo-bolsas',
      titulo: 'Regra de Cálculo da Nota Final e Reserva de 40% para Ações Afirmativas',
      categoria: 'cronograma',
      destinatarios: ['orientador', 'avaliador', 'admin', 'coordenador'],
      mensagem:
        'A nota final é calculada com pesos regimentais: Orientador (30%), Projeto (50%) e Discente (20%). O edital garante reserva obrigatória de 40 bolsas para cotas (negros, indígenas e pessoas com deficiência) e 60 para ampla concorrência.',
      acaoRotulo: 'Ver Diretrizes do Edital',
      acaoDestinoTab: 'editais',
      baseRegimental: 'Item 8 e 9 do Edital • Resolução CEPE',
    });

    // 5. AVISO: Período de Interposição de Recursos (Anexo VII)
    const dataFimRecursos = faseRecursos?.dataFim || '18/12/2026';
    lista.push({
      id: 'aviso-recursos-prazo',
      titulo: 'Prazo Recursal Pós-Resultado Preliminar',
      categoria: 'cronograma',
      destinatarios: ['orientador', 'admin', 'coordenador'],
      dataLimite: dataFimRecursos,
      mensagem:
        'Após a divulgação preliminar das notas no portal da UNIG, os docentes orientadores terão 48 horas úteis para submissão de recurso fundamentado exclusivamente pelo formulário regimental do Anexo VII.',
      acaoRotulo: 'Ver Modelo de Recurso (Anexo VII)',
      acaoDestinoTab: 'anexos',
      baseRegimental: 'Item 11 do Edital • Anexo VII',
    });

    return lista;
  }, [faseSubmissao, faseAvaliacao, faseRecursos, edital, propostasSemAvaliacaoCount]);

  // Filtrar avisos conforme seleção do usuário
  const avisosFiltrados = useMemo(() => {
    return avisos.filter((av) => {
      // Filtro de categoria
      if (filtroCategoria === 'urgente' && av.categoria !== 'urgente') return false;
      if (filtroCategoria === 'cronograma' && av.categoria !== 'cronograma') return false;
      if (filtroCategoria === 'meu_papel') {
        const papelUsuario = currentUser.papel as any;
        return av.destinatarios.includes(papelUsuario);
      }
      return true;
    });
  }, [avisos, filtroCategoria, currentUser.papel]);

  // Contagem de avisos não lidos específicos do papel
  const avisosNaoLidosCount = useMemo(() => {
    const papelUsuario = currentUser.papel as any;
    return avisos.filter(
      (a) => a.destinatarios.includes(papelUsuario) && !avisosLidos.includes(a.id)
    ).length;
  }, [avisos, avisosLidos, currentUser.papel]);

  return (
    <div
      id="quadro-avisos-edital"
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Barra de Cabeçalho do Quadro */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003860] to-[#002B49] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            {avisosNaoLidosCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#002B49] animate-pulse">
                {avisosNaoLidosCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Quadro de Avisos &amp; Cronograma Regimental
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/15 text-amber-300 font-bold border border-white/20">
                {edital?.codigo || 'PIC-UNIG 2027'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentUser.papel === 'orientador' && (
                <span>
                  <strong>Orientador(a) {currentUser.nome}:</strong> Prazos de submissão de projetos, planos discentes e editais vigentes.
                </span>
              )}
              {currentUser.papel === 'avaliador' && (
                <span>
                  <strong>Avaliador(a) {currentUser.nome}:</strong> Prazos de conclusão da Etapa 2, análise duplo-cega e normas de avaliação.
                </span>
              )}
              {(currentUser.papel === 'admin' || currentUser.papel === 'coordenador') && (
                <span>
                  <strong>Governança PROPEP / Comitê:</strong> Monitoramento de prazos finais, submissões e homologação de bancas.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('editais')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/20 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Cronograma Completo</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
            title={expandido ? 'Recolher quadro de avisos' : 'Expandir quadro de avisos'}
          >
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {expandido && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {/* Barra de Filtros e Status Resumido */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setFiltroCategoria('meu_papel')}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroCategoria === 'meu_papel'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {currentUser.papel === 'orientador' ? 'Avisos para Professores' : currentUser.papel === 'avaliador' ? 'Avisos para Pareceristas' : 'Avisos de Governança'}
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria('urgente')}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center space-x-1 cursor-pointer ${
                  filtroCategoria === 'urgente'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Prazos Urgentes</span>
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria('cronograma')}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroCategoria === 'cronograma'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Marcos do Cronograma
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria('todos')}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroCategoria === 'todos'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Todos ({avisos.length})
              </button>
            </div>

            {/* Destaque de Fase Atual do Edital */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 self-stretch sm:self-auto justify-between sm:justify-start">
              <span className="flex items-center space-x-1.5 text-[#002B49]">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Fase Vigente:</span>
              </span>
              <span className="font-bold text-amber-700">
                {edital?.faseAtual || 'Avaliação Duplo-Cega de Mérito (Etapa 2)'}
              </span>
            </div>
          </div>

          {/* Cards de Avisos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {avisosFiltrados.map((aviso) => {
              const foiLido = avisosLidos.includes(aviso.id);

              return (
                <div
                  key={aviso.id}
                  className={`rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between ${
                    aviso.categoria === 'urgente'
                      ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  } ${foiLido ? 'opacity-70 bg-slate-50' : 'shadow-xs'}`}
                >
                  <div className="space-y-2">
                    {/* Linha Superior: Tags e Prazos */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {aviso.categoria === 'urgente' ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span>Prazo Crítico</span>
                          </span>
                        ) : aviso.categoria === 'cronograma' ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>Cronograma</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                            <Info className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>Diretriz</span>
                          </span>
                        )}

                        {aviso.dataLimite && (
                          <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Limite: {aviso.dataLimite}</span>
                          </span>
                        )}
                      </div>

                      {/* Botão marcar como lido */}
                      <button
                        type="button"
                        onClick={(e) => marcarComoLido(aviso.id, e)}
                        title={foiLido ? 'Marcar como não lido' : 'Marcar como lido'}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${foiLido ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'}`}
                        />
                      </button>
                    </div>

                    {/* Título e Texto */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {aviso.titulo}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {aviso.mensagem}
                      </p>
                    </div>
                  </div>

                  {/* Rodapé do Card com Ação e Base Regimental */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {aviso.baseRegimental || 'Edital PIC-UNIG'}
                    </span>

                    {aviso.acaoRotulo && aviso.acaoDestinoTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab(aviso.acaoDestinoTab!)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer shrink-0 ${
                          aviso.categoria === 'urgente'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-[#002B49] hover:bg-[#003860] text-white'
                        }`}
                      >
                        <span>{aviso.acaoRotulo}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Atalhos Rápidos por Papel */}
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold">Acesso Rápido Regimental:</span>
              <span className="text-slate-500">
                {currentUser.papel === 'orientador'
                  ? 'Você possui ' + meusProjetosCount + ' proposta(s) cadastrada(s) neste ciclo.'
                  : currentUser.papel === 'avaliador'
                  ? 'Banca de pareceristas da área com critérios objetivos de 0 a 6 pontos.'
                  : 'Gestão completa e homologação CEPE do ciclo 2027.'}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {currentUser.papel === 'orientador' && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('submissao')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Nova Submissão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('projetos')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all border border-slate-200 cursor-pointer"
                  >
                    Meus Projetos
                  </button>
                </>
              )}

              {currentUser.papel === 'avaliador' && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('banca')}
                    className="px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#003860] text-white font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Workspace da Banca</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('anexos')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all border border-slate-200 cursor-pointer"
                  >
                    Critérios (Anexo VI)
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => onNavigateTab('editais')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all border border-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-blue-700" />
                <span>Ver Editais</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
