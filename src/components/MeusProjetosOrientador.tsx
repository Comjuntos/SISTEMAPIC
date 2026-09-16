import React, { useState } from 'react';
import { Proposta, Orientador, Usuario } from '../types/index.ts';
import {
  exportarComprovanteSubmissaoPDF,
  exportarRelatorioAcompanhamentoPDF,
  exportarParecerIndividualPDF,
} from '../utils/pdfExport.ts';
import {
  FolderKanban,
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Plus,
  Search,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Building2,
  ChevronRight,
  UserCheck,
  HardDrive,
} from 'lucide-react';

interface MeusProjetosOrientadorProps {
  projetos: Proposta[];
  orientadores: Orientador[];
  currentUser: Usuario;
  onNavigateSubmissao: () => void;
  onNavigateDrive?: () => void;
  onSelectProjeto: (projeto: Proposta) => void;
}

export const MeusProjetosOrientador: React.FC<MeusProjetosOrientadorProps> = ({
  projetos,
  orientadores,
  currentUser,
  onNavigateSubmissao,
  onNavigateDrive,
  onSelectProjeto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'submetido' | 'em_avaliacao' | 'aprovado'>('todos');

  // Encontrar o orientador correspondente ao usuário logado
  const orientadorLogado = orientadores.find(
    (o) =>
      o.usuarioEmail === currentUser.email ||
      (o.usuarioNome || '').toLowerCase().includes(currentUser.nome.toLowerCase())
  ) || orientadores[0];

  // Filtrar projetos do orientador
  const meusProjetos = projetos.filter((p) => {
    const isDoOrientador =
      p.orientadorId === orientadorLogado?.id ||
      (p.orientadorInfo?.email || '').toLowerCase() === currentUser.email.toLowerCase() ||
      currentUser.papel === 'admin';

    const matchesSearch =
      (p.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.discenteNome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.linhaPesquisa || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'submetido' && p.status === 'Submetido') ||
      (statusFilter === 'em_avaliacao' && p.status === 'Em Avaliação') ||
      (statusFilter === 'aprovado' && (p.status === 'Aprovado' || p.status === 'Homologado'));

    return isDoOrientador && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
      case 'Homologado':
        return { label: 'Aprovado / Contemplado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'Em Avaliação':
        return { label: 'Em Avaliação (Banca & IA)', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Clock };
      default:
        return { label: 'Submetido', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: FileText };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Cabeçalho da Área do Docente */}
      <div className="relative bg-gradient-to-r from-slate-950 via-[#002B49] to-indigo-950 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl overflow-hidden border border-white/10">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border border-emerald-400/30 shadow-inner">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Painel do Docente Orientador — PIC-UNIG 2027</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              Meus Projetos Submetidos
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed font-medium">
              Gerencie suas propostas de Iniciação Científica, acompanhe notas da banca examinadora, pareceres gerados por Inteligência Artificial e o status de concessão de bolsas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateDrive && (
              <button
                onClick={onNavigateDrive}
                className="inline-flex items-center space-x-2 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
                title="Sincronizar e ver pastas PIC / 2027 / Orientador"
              >
                <HardDrive className="w-4 h-4" />
                <span>Google Drive (PIC / Ano)</span>
              </button>
            )}
            <button
              onClick={onNavigateSubmissao}
              className="inline-flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-2xl text-xs font-black shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Submeter Novo Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, discente ou linha de pesquisa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos os Projetos' },
            { id: 'submetido', label: 'Submetidos' },
            { id: 'em_avaliacao', label: 'Em Avaliação' },
            { id: 'aprovado', label: 'Aprovados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#002B49] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Projetos do Orientador */}
      {meusProjetos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Nenhum projeto encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Você ainda não submeteu propostas neste filtro ou com os termos pesquisados. Clique no botão acima para iniciar uma nova submissão.
            </p>
          </div>
          <button
            onClick={onNavigateSubmissao}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#002B49] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#003860] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submeter Nova Proposta</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meusProjetos.map((projeto) => {
            const statusMeta = getStatusBadge(projeto.status || 'Submetido');
            const StatusIcon = statusMeta.icon;
            return (
              <div
                key={projeto.id}
                className="bg-white p-7 rounded-[2rem] border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusMeta.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusMeta.label}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ID: #{projeto.id}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {projeto.titulo}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-600 uppercase">Aluno Bolsista</p>
                      <p className="font-semibold text-slate-900 mt-0.5 truncate">{projeto.discenteNome || 'Não informado'}</p>
                      <p className="text-[10px] text-slate-600">CR: {projeto.discenteCr || 'N/A'}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-600 uppercase">Vínculo Acadêmico</p>
                      <p className="font-semibold text-slate-900 mt-0.5 truncate">{projeto.discenteCurso || projeto.grandeArea}</p>
                      <p className="text-[10px] text-slate-600">Campus: {projeto.campus || 'Nova Iguaçu'}</p>
                    </div>
                  </div>

                  {projeto.linhaPesquisa && (
                    <p className="text-xs text-slate-600 flex items-center space-x-1.5 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium truncate">Linha: {projeto.linhaPesquisa}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    <button
                      onClick={() => exportarComprovanteSubmissaoPDF(projeto)}
                      title="Gerar Comprovante de Submissão em PDF"
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border border-blue-200"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Comprovante</span>
                    </button>

                    <button
                      onClick={() => exportarRelatorioAcompanhamentoPDF(projeto)}
                      title="Gerar Relatório de Acompanhamento em PDF"
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border border-emerald-200"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Acompanhamento</span>
                    </button>

                    <button
                      onClick={() => exportarParecerIndividualPDF(projeto)}
                      title="Gerar Laudo Técnico da Banca em PDF"
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border border-amber-200"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Laudo PDF</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectProjeto(projeto)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-[#002B49] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
