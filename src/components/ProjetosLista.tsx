import React, { useState } from 'react';
import { Proposta, Usuario } from '../types/index.ts';
import { exportarParecerIndividualPDF } from '../utils/pdfExport.ts';
import {
  getCursoMeta,
  LISTA_OFICIAL_CURSOS_UNIG,
  LISTA_CURSOS_GRADUACAO_UNIG,
  LISTA_MESTRADOS_UNIG,
  normalizarNomeCurso,
} from '../data/cursosUnig.ts';
import {
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Award,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  School,
  X,
  Plus,
  User,
} from 'lucide-react';

interface ProjetosListaProps {
  propostas: Proposta[];
  currentUser?: Usuario;
  onSelectProposta: (p: Proposta) => void;
  onOpenParecerModal: (p: Proposta) => void;
  onOpenDownloadModal: (p: Proposta) => void;
  onGoToBanca: (p: Proposta) => void;
  onNavigateToAnexos?: () => void;
  onNavigateToSubmissao?: () => void;
  filtroCursoInicial?: string;
}

export const ProjetosLista: React.FC<ProjetosListaProps> = ({
  propostas,
  currentUser,
  onSelectProposta,
  onOpenParecerModal,
  onOpenDownloadModal,
  onGoToBanca,
  onNavigateToAnexos,
  onNavigateToSubmissao,
  filtroCursoInicial = 'todos',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFiltro, setModalidadeFiltro] = useState<'todas' | 'Ampla Concorrência' | 'Ações Afirmativas'>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [cursoFiltro, setCursoFiltro] = useState<string>(filtroCursoInicial);
  const [painelCursosAberto, setPainelCursosAberto] = useState<boolean>(false);
  const [tipoProgramaDrawer, setTipoProgramaDrawer] = useState<'todos' | 'Graduação' | 'Mestrado'>('todos');
  const [apenasMeusProjetos, setApenasMeusProjetos] = useState<boolean>(currentUser?.papel === 'orientador');

  // Cursos com submissões ativas
  const cursosComSubmissoes: string[] = Array.from(
    new Set(propostas.map((p) => normalizarNomeCurso(p.discenteCurso)))
  );

  const filtradas = propostas.filter((p) => {
    const cursoMeta = getCursoMeta(p.discenteCurso);
    const matchesSearch =
      (p.titulo || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.discenteNome || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.discenteCurso || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (cursoMeta.sigla || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.subarea || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.orientador?.usuarioNome || '').toLowerCase().includes((searchTerm || '').toLowerCase());

    const matchesModalidade =
      modalidadeFiltro === 'todas' || p.modalidade === modalidadeFiltro;

    const matchesStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'divergente' && p.calculo?.divergenciaDetectada) ||
      (statusFiltro === 'completa' && (p.avaliacoesCount || 0) >= 2) ||
      (statusFiltro === 'parcial' && (p.avaliacoesCount || 0) === 1) ||
      (statusFiltro === 'pendente' && (p.avaliacoesCount || 0) === 0);

    const matchesCurso =
      cursoFiltro === 'todos' ||
      normalizarNomeCurso(p.discenteCurso).toLowerCase() === cursoFiltro.toLowerCase() ||
      (p.discenteCurso || '').toLowerCase().includes(cursoFiltro.toLowerCase());

    const matchesMeusProjetos =
      !apenasMeusProjetos ||
      !currentUser ||
      p.orientadorId === currentUser.id ||
      (p.orientador?.usuarioNome &&
        p.orientador.usuarioNome.toLowerCase().includes((currentUser?.nome || '').toLowerCase()));

    return matchesSearch && matchesModalidade && matchesStatus && matchesCurso && matchesMeusProjetos;
  });

  return (
    <div className="space-y-6">
      {/* Banner Orientativo Conforme Papel do Edital */}
      {currentUser?.papel === 'orientador' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Painel do Docente Orientador — Diretriz do Edital
              </p>
              <p className="text-xs text-emerald-800">
                Aos professores cabe <strong>enviar o projeto</strong> e <strong>consultar editais e normas</strong>. Acompanhe abaixo suas propostas submetidas e pareceres consolidados.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setApenasMeusProjetos(!apenasMeusProjetos)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                apenasMeusProjetos
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {apenasMeusProjetos ? 'Exibindo: Meus Projetos' : 'Exibir: Todos os Projetos'}
            </button>
            {onNavigateToSubmissao && (
              <button
                onClick={onNavigateToSubmissao}
                className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center space-x-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Enviar Projeto</span>
              </button>
            )}
          </div>
        </div>
      )}

      {currentUser?.papel === 'avaliador' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">
                Painel do Avaliador Parecerista — Diretriz do Edital
              </p>
              <p className="text-xs text-blue-800">
                Aos avaliadores cabe <strong>avaliar os projetos da banca</strong> e <strong>consultar critérios do edital</strong>. Selecione qualquer proposta abaixo para emitir parecer técnico.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (filtradas.length > 0) onGoToBanca(filtradas[0]);
            }}
            className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-[#002B49] hover:bg-[#003860] text-white transition-all flex items-center space-x-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <span>Ir para Workspace de Avaliação</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cabeçalho da Seção e Relação Oficial de Cursos (Anexo IV) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentUser?.papel === 'orientador' && apenasMeusProjetos
                ? 'Meus Projetos Submetidos (Docente Orientador)'
                : 'Projetos por Curso de Graduação & Mestrados'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.papel === 'orientador'
                ? 'Consulte o protocolo #PIC, status de habilitação e laudos de avaliação emitidos pela banca.'
                : 'Gerenciamento de propostas, módulo AVALIAR HUMANO + IA, pontuação Lattes e relação oficial da UNIG.'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {onNavigateToSubmissao && (
              <button
                id="btn-projetos-nova-submissao"
                onClick={onNavigateToSubmissao}
                className="text-xs px-3.5 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Submissão</span>
              </button>
            )}
            <button
              onClick={() => setPainelCursosAberto(!painelCursosAberto)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <span>Relação de Cursos (Anexo IV)</span>
              {painelCursosAberto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium border border-slate-200">
              Exibindo <span className="font-bold text-slate-900">{filtradas.length}</span> de {propostas.length} propostas
            </div>
          </div>
        </div>

        {/* Painel Expansível da Relação Oficial de Cursos de Graduação (Anexo IV) */}
        {painelCursosAberto && (
          <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 rounded-2xl p-5 border border-blue-200/80 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-200/60 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                    Anexo IV do Edital
                  </span>
                  <h3 className="text-sm font-bold text-blue-950">
                    Relação Oficial de Cursos de Graduação e Mestrados da UNIG (PIC-UNIG)
                  </h3>
                </div>
                <p className="text-xs text-blue-800 mt-1">
                  19 Cursos de Graduação e 4 Programas de Mestrado Stricto Sensu. Clique em qualquer curso ou sigla para filtrar instantaneamente.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
                <div className="flex bg-white rounded-xl p-0.5 border border-blue-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setTipoProgramaDrawer('todos')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      tipoProgramaDrawer === 'todos'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    Todos (23)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoProgramaDrawer('Graduação')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      tipoProgramaDrawer === 'Graduação'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    Graduação (19)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoProgramaDrawer('Mestrado')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      tipoProgramaDrawer === 'Mestrado'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-blue-900 hover:bg-blue-50'
                    }`}
                  >
                    Mestrados (4)
                  </button>
                </div>

                {onNavigateToAnexos && (
                  <button
                    onClick={onNavigateToAnexos}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold underline flex items-center space-x-1"
                  >
                    <span>Diretrizes</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid com Cursos e Mestrados da Relação */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
              {LISTA_OFICIAL_CURSOS_UNIG.filter(
                (c) => tipoProgramaDrawer === 'todos' || c.tipo === tipoProgramaDrawer
              ).map((curso) => {
                const countProjetos = propostas.filter(
                  (p) =>
                    p.discenteCurso.toLowerCase() === curso.nome.toLowerCase() ||
                    p.discenteCurso.toLowerCase().includes(curso.nome.toLowerCase()) ||
                    getCursoMeta(p.discenteCurso).sigla.toLowerCase() === curso.sigla.toLowerCase()
                ).length;
                const isSelected =
                  cursoFiltro.toLowerCase() === curso.nome.toLowerCase() ||
                  cursoFiltro.toLowerCase() === curso.sigla.toLowerCase();

                return (
                  <button
                    key={curso.id}
                    onClick={() => {
                      if (isSelected) {
                        setCursoFiltro('todos');
                      } else {
                        setCursoFiltro(curso.nome);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-950 shadow-sm ring-2 ring-blue-500 font-bold'
                        : 'bg-white hover:bg-blue-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] uppercase tracking-wider block font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                          {curso.tipo === 'Mestrado' ? 'Stricto Sensu' : curso.campus.replace('Campus ', '')}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {curso.sigla}
                        </span>
                      </div>
                      <span className="text-xs font-bold leading-tight line-clamp-1">{curso.nome}</span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px]">
                      <span className={`${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>Submissões:</span>
                      <span
                        className={`font-bold px-1.5 py-0.2 rounded-full ${
                          countProjetos > 0
                            ? isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-emerald-100 text-emerald-800'
                            : isSelected
                            ? 'bg-blue-800 text-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {countProjetos}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Busca textual */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por título, curso, discente, orientador ou subárea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro Curso de Graduação */}
          <div>
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              <option value="todos">🎓 Todos os Cursos ({propostas.length})</option>
              <optgroup label="Cursos com Submissões Ativas">
                {cursosComSubmissoes.map((c) => {
                  const count = propostas.filter((p) => normalizarNomeCurso(p.discenteCurso) === c).length;
                  return (
                    <option key={c} value={c}>
                      {c} ({count} {count === 1 ? 'projeto' : 'projetos'})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Demais Cursos Elegíveis (Anexo IV)">
                {LISTA_OFICIAL_CURSOS_UNIG.filter(
                  (cur) => !cursosComSubmissoes.some((cs) => cs.toLowerCase() === cur.nome.toLowerCase())
                ).map((cur) => (
                  <option key={cur.id} value={cur.nome}>
                    {cur.nome} ({cur.campus.replace('Campus ', '')})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filtro Modalidade */}
          <div>
            <select
              value={modalidadeFiltro}
              onChange={(e: any) => setModalidadeFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="todas">Todas as Modalidades</option>
              <option value="Ampla Concorrência">Ampla Concorrência (60 bolsas)</option>
              <option value="Ações Afirmativas">Ações Afirmativas (40 bolsas)</option>
            </select>
          </div>

          {/* Filtro Status da Banca */}
          <div>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="todos">Status: Todos</option>
              <option value="completa">Banca Completa (2/2)</option>
              <option value="parcial">Parcial (1/2)</option>
              <option value="pendente">Pendente (0/2)</option>
              <option value="divergente">⚠️ Divergência (&gt; 2.0 pts)</option>
            </select>
          </div>
        </div>

        {/* Chip Ativo de Filtro por Curso (se houver) */}
        {cursoFiltro !== 'todos' && (
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full font-semibold border border-blue-300 flex items-center space-x-1.5 shadow-2xs">
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
              <span>Filtrando por Curso: <strong>{cursoFiltro}</strong> ({filtradas.length} projetos)</span>
              <button
                onClick={() => setCursoFiltro('todos')}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded-full text-blue-900"
                title="Limpar filtro de curso"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Filtros em chips por Curso de Graduação (Anexo IV do Edital) */}
        <div className="flex flex-col space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1">
            <span className="text-slate-500 text-[11px] font-bold flex items-center space-x-1 shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
              <span>Cursos do Edital:</span>
            </span>
            <button
              type="button"
              onClick={() => setCursoFiltro('todos')}
              className={`px-3 py-1 rounded-lg transition-all shrink-0 text-xs ${
                cursoFiltro === 'todos'
                  ? 'bg-[#002B49] text-white font-bold shadow-xs ring-1 ring-[#002B49]'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium'
              }`}
            >
              Todos ({propostas.length})
            </button>
            {cursosComSubmissoes.map((cursoNome) => {
              const count = propostas.filter((p) => normalizarNomeCurso(p.discenteCurso) === cursoNome).length;
              const meta = getCursoMeta(cursoNome);
              const isAtivo = cursoFiltro.toLowerCase() === cursoNome.toLowerCase();
              return (
                <button
                  key={cursoNome}
                  type="button"
                  onClick={() => setCursoFiltro(isAtivo ? 'todos' : cursoNome)}
                  className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs flex items-center space-x-1.5 border cursor-pointer ${
                    isAtivo
                      ? 'bg-blue-900 text-white font-bold border-blue-900 shadow-xs ring-2 ring-blue-400'
                      : `${meta.bgTag} ${meta.corTag} ${meta.borderTag} hover:shadow-xs font-medium`
                  }`}
                >
                  <span>{cursoNome}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isAtivo ? 'bg-blue-800 text-white' : 'bg-white/80 border border-slate-200'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Outros cursos oficiais do Edital sem submissão no momento */}
            {LISTA_OFICIAL_CURSOS_UNIG.filter(
              (c) => !cursosComSubmissoes.some((cs) => cs.toLowerCase() === c.nome.toLowerCase())
            ).slice(0, 6).map((curso) => {
              const isAtivo = cursoFiltro.toLowerCase() === curso.nome.toLowerCase();
              return (
                <button
                  key={curso.id}
                  type="button"
                  onClick={() => setCursoFiltro(isAtivo ? 'todos' : curso.nome)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs flex items-center space-x-1 border cursor-pointer ${
                    isAtivo
                      ? 'bg-blue-900 text-white font-bold border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                  }`}
                  title={`${curso.nome} (${curso.campus})`}
                >
                  <span>{curso.nome}</span>
                  <span className="text-[9px] text-slate-400">0</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPainelCursosAberto(!painelCursosAberto)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 shrink-0 transition-all cursor-pointer"
            >
              {painelCursosAberto ? 'Fechar Catálogo' : '+ Catálogo Oficial (19 Graduações + 4 Mestrados)'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Projetos (Cards Ricos) */}
      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum projeto encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Tente ajustar os termos de busca ou selecionar outro curso no filtro.</p>
          </div>
        ) : (
          filtradas.map((p) => {
            const numAvals = p.avaliacoesCount || p.avaliacoes?.length || 0;
            const isDivergente = p.calculo?.divergenciaDetectada;
            const notaMeritoMedia = p.calculo?.mediaEtapa2Merito ? parseFloat(p.calculo.mediaEtapa2Merito) : null;
            const notaFinalPonderada = p.calculo?.notaFinalPonderada ? parseFloat(p.calculo.notaFinalPonderada) : null;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
                  isDivergente
                    ? 'border-rose-300 bg-rose-50/20'
                    : numAvals >= 2
                    ? 'border-slate-200 hover:border-blue-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Dados Principais do Projeto */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #PIC-{String(p.id).padStart(3, '0')}
                      </span>

                      {/* Selo Principal: Curso de Graduação ou Mestrado (Anexo IV) */}
                      {(() => {
                        const cursoMeta = getCursoMeta(p.discenteCurso);
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCursoFiltro(cursoMeta.nome);
                            }}
                            title={`Filtrar por: ${cursoMeta.nome} [${cursoMeta.sigla}] • ${cursoMeta.tipo}`}
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border transition-all flex items-center space-x-1.5 hover:ring-2 hover:ring-blue-400 cursor-pointer ${cursoMeta.bgTag} ${cursoMeta.corTag} ${cursoMeta.borderTag}`}
                          >
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span>{cursoMeta.nome}</span>
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/80 font-black">
                              {cursoMeta.sigla}
                            </span>
                          </button>
                        );
                      })()}

                      {p.subarea && (
                        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {p.subarea}
                        </span>
                      )}

                      {p.modalidade === 'Ações Afirmativas' ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                          <Award className="w-3 h-3 text-amber-700" />
                          <span>Ações Afirmativas {p.tipoCota ? `(${p.tipoCota.includes('PPI') ? 'PPI' : 'Pública'})` : ''}</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          Ampla Concorrência
                        </span>
                      )}

                      {/* Badge da Banca */}
                      {isDivergente ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Divergência (&gt; 2.0 pts)</span>
                        </span>
                      ) : numAvals >= 2 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Banca Completa (2/2)</span>
                        </span>
                      ) : numAvals === 1 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Parcial (1/2 Parecer)</span>
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Pendente (0/2)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-900 transition-colors cursor-pointer" onClick={() => onSelectProposta(p)}>
                      {p.titulo}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.resumo}
                    </p>

                    {/* Metadados: Curso de Graduação, Discente e Orientador */}
                    <div className="w-full flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100/80 text-xs">
                      <div className="flex items-center space-x-1.5 bg-blue-50/90 text-blue-950 px-2.5 py-1 rounded-lg border border-blue-200/80 font-medium">
                        <School className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>
                          <strong>{getCursoMeta(p.discenteCurso).tipo}:</strong> {p.discenteCurso} ({getCursoMeta(p.discenteCurso).sigla})
                        </span>
                      </div>
                      <div className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Discente:</span> {p.discenteNome} (CR: <strong className="text-blue-900">{p.discenteCr}</strong>)
                      </div>
                      <div className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Orientador:</span> {p.orientador?.usuarioNome || 'Docente UNIG'}
                        {p.orientador && (
                          <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono font-medium">
                            {p.orientador.regraMaiorBeneficioTipo}: {p.orientador.pontuacaoMaiorBeneficio} pts
                          </span>
                        )}
                      </div>
                      {p.analiseIa && (
                        <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-[11px] font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>IA Gemini: {p.analiseIa.pontuacaoEstimada}/6.00</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notas e Ações Rápidas */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3 min-w-[200px]">
                    {/* Bloco de Notas */}
                    <div className="text-left lg:text-right">
                      {notaMeritoMedia !== null ? (
                        <div>
                          <div className="text-xs text-slate-500 font-medium">Mérito Projeto (Etapa 2)</div>
                          <div className="text-lg font-black text-slate-900">
                            {notaMeritoMedia.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 6.00</span>
                          </div>
                          {notaFinalPonderada !== null && (
                            <div className="text-[11px] font-semibold text-blue-700">
                              Nota Final: {notaFinalPonderada.toFixed(2)} / 10.0
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          Aguardando avaliação
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center space-x-2">
                      <button
                        id={`btn-parecer-${p.id}`}
                        onClick={() => onOpenParecerModal(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Ver Parecer Consolidado da Banca (4 Abas)"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                        <span className="hidden sm:inline">Pareceres</span>
                      </button>

                      <button
                        id={`btn-pdf-card-${p.id}`}
                        onClick={() => exportarParecerIndividualPDF(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#002B49] text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Exportar Laudo Técnico em PDF"
                      >
                        <FileText className="w-4 h-4 text-blue-700" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        id={`btn-download-seguro-${p.id}`}
                        onClick={() => onOpenDownloadModal(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                        title="Download Seguro do Projeto e Validação SHA-256"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">SHA-256</span>
                      </button>

                      {currentUser?.papel === 'orientador' ? (
                        <button
                          id={`btn-ver-parecer-orientador-${p.id}`}
                          onClick={() => onOpenParecerModal(p)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                          title="Consultar Parecer Consolidado e Andamento do Projeto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Pareceres</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-avaliar-workspace-${p.id}`}
                          onClick={() => onGoToBanca(p)}
                          className="px-3 py-2 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                          title="Avaliar proposta no módulo AVALIAR HUMANO + IA"
                        >
                          <span>Avaliar (Humano + IA)</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
