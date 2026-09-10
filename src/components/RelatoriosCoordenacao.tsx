import React, { useState, useMemo } from 'react';
import { Proposta, Edital, AuditoriaLog, Orientador, Usuario, DesenhoPesquisa } from '../types/index.ts';
import {
  exportarHomologacaoFinalPDF,
  exportarParecerIndividualPDF,
  exportarRelatorioMetodosCientificosPDF,
  exportarRelatorioAuditoriaPDF,
  exportarDossieCompletoPropostaPDF,
  exportarSimuladorCenariosPDF,
} from '../utils/pdfExport.ts';
import { simularCenario, PARAMETROS_PADRAO_EDITAL } from '../utils/simulation.ts';
import { HIERARQUIA_DESENHOS } from '../utils/methodology.ts';
import { AuditoriaLGPD } from './AuditoriaLGPD.tsx';
import {
  FileText,
  Download,
  Microscope,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Eye,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  FolderDown,
  Building2,
  AlertCircle,
  Zap,
  Lock,
} from 'lucide-react';

interface RelatoriosCoordenacaoProps {
  propostas: Proposta[];
  edital: Edital | null;
  auditoriaLogs: AuditoriaLog[];
  orientadores: Orientador[];
  usuarios?: Usuario[];
  currentUser: Usuario;
  onOpenParecerModal: (proposta: Proposta) => void;
  onNavigateTab?: (tab: string) => void;
  abaInicial?: 'documentos' | 'auditoria';
}

export const RelatoriosCoordenacao: React.FC<RelatoriosCoordenacaoProps> = ({
  propostas,
  edital,
  auditoriaLogs,
  orientadores,
  usuarios = [],
  currentUser,
  onOpenParecerModal,
  onNavigateTab,
  abaInicial = 'documentos',
}) => {
  const [subTab, setSubTab] = useState<'documentos' | 'auditoria'>(abaInicial);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDesenho, setFiltroDesenho] = useState('todos');
  const [filtroModalidade, setFiltroModalidade] = useState('todos');
  const [filtroStatusBolsa, setFiltroStatusBolsa] = useState('todos');
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Filtragem das propostas no acervo
  const propostasFiltradas = useMemo(() => {
    return propostas.filter((p) => {
      const termo = searchTerm.toLowerCase();
      const matchSearch =
        p.titulo.toLowerCase().includes(termo) ||
        p.discenteNome.toLowerCase().includes(termo) ||
        (p.orientador?.nome && p.orientador.nome.toLowerCase().includes(termo)) ||
        p.discenteCurso.toLowerCase().includes(termo) ||
        `pic-${p.id}`.includes(termo);

      const matchDesenho = filtroDesenho === 'todos' || p.metodoDesenho === filtroDesenho;
      const matchModalidade = filtroModalidade === 'todos' || p.modalidade === filtroModalidade;

      let matchStatus = true;
      if (filtroStatusBolsa === 'concedida') {
        matchStatus = !!p.calculo?.tipoVagaConcedida && p.calculo.tipoVagaConcedida !== 'Não Contemplado';
      } else if (filtroStatusBolsa === 'avaliada') {
        matchStatus = !!p.calculo?.notaFinalPonderada;
      }

      return matchSearch && matchDesenho && matchModalidade && matchStatus;
    });
  }, [propostas, searchTerm, filtroDesenho, filtroModalidade, filtroStatusBolsa]);

  // Estatísticas do Acervo
  const totalHomologadas = propostas.filter((p) => p.calculo?.notaFinalPonderada).length;
  const totalBolsasConcedidas = propostas.filter(
    (p) => p.calculo?.tipoVagaConcedida && p.calculo.tipoVagaConcedida.includes('Bolsa')
  ).length;

  // Emissão em lote de todos os pareceres
  const handleBaixarTodosPareceres = async () => {
    if (propostas.length === 0) return;
    setIsExportingBatch(true);
    const total = propostas.length;

    for (let i = 0; i < total; i++) {
      setBatchProgress({ current: i + 1, total });
      exportarParecerIndividualPDF(propostas[i], edital);
      // Pequeno intervalo assíncrono para garantir o download estável pelo navegador
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsExportingBatch(false);
    setBatchProgress(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Institucional do Acervo da Coordenação */}
      <div className="bg-[#002B49] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
                Coordenação &amp; PROPEP
              </span>
              <span className="text-xs text-slate-300">
                Edital PIC-UNIG 2027/2028 • Painel Central de Documentos
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white mt-2">
              Central de Relatórios Oficiais &amp; Acervo Documental da Coordenação
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Todos os relatórios gerenciais, pareceres técnicos, atas de concessão de bolsas, dossiês de métodos científicos e trilhas de auditoria LGPD estão centralizados aqui para emissão imediata e arquivamento legal.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-300 block uppercase font-medium">Propostas no Acervo</span>
              <span className="text-lg font-black text-amber-400">{propostas.length}</span>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <span className="text-[10px] text-slate-300 block uppercase font-medium">Laudos Disponíveis</span>
              <span className="text-lg font-black text-emerald-400">{totalHomologadas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Sub-Módulos: Relatórios Oficiais vs. Trilha de Auditoria LGPD */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          id="btn-subtab-documentos"
          onClick={() => setSubTab('documentos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            subTab === 'documentos'
              ? 'bg-[#002B49] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Relatórios Mestres &amp; PDFs Oficiais ({propostas.length})</span>
        </button>

        <button
          id="btn-subtab-auditoria"
          onClick={() => setSubTab('auditoria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            subTab === 'auditoria'
              ? 'bg-[#002B49] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Trilha de Auditoria Digital &amp; LGPD ({auditoriaLogs.length})</span>
        </button>
      </div>

      {subTab === 'auditoria' ? (
        <AuditoriaLGPD logs={auditoriaLogs} usuarios={usuarios} />
      ) : (
        <>
          {/* Grade de Documentos Mestres Institucionais */}
          <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Documentos Mestres &amp; Relatórios Globais do Edital
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: Ata Oficial de Homologação Final */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-blue-700 uppercase">
                <span>Documento Oficial</span>
                <span>•</span>
                <span>Paisagem A4</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Ata de Homologação Final (100 Bolsas)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Resultado regimental completo com classificação ponderada, cotas de Ações Afirmativas, notas por etapa e critérios de desempate.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-coordenacao-baixar-ata"
                onClick={() => exportarHomologacaoFinalPDF(propostas, edital)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Baixar Ata Oficial (PDF)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Relatório Executivo de Métodos Científicos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3">
                <Microscope className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-700 uppercase">
                <span>Rigor Científico</span>
                <span>•</span>
                <span>Paisagem A4</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Relatório de Métodos &amp; Delineamentos
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hierarquia dos 5 desenhos (ECR, Coorte, Caso-controle, Relato, In vitro), análise amostral (N) e pontuação de mérito científico (/10 pts).
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-coordenacao-baixar-metodos"
                onClick={() => exportarRelatorioMetodosCientificosPDF(propostas, edital)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Relatório Métodos (PDF)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Livro de Auditoria e Conformidade LGPD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-600 uppercase">
                <span>Segurança &amp; Custódia</span>
                <span>•</span>
                <span>Retrato A4</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Livro de Auditoria &amp; Conformidade LGPD
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Trilha completa de acessos, avaliações duplo-cegas, custódia de hashes SHA-256 e segurança documental exigida pela legislação.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-coordenacao-baixar-auditoria"
                onClick={() => exportarRelatorioAuditoriaPDF(auditoriaLogs, edital)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar Trilha LGPD (PDF)</span>
              </button>
            </div>
          </div>

          {/* Card 4: Emissão em Lote de Todos os Laudos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-3">
                <FolderDown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-700 uppercase">
                <span>Exportação em Lote</span>
                <span>•</span>
                <span>Todos os Laudos</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Acervo Completo de Laudos da Banca
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Emite sequencialmente os laudos técnicos individuais em PDF de todas as propostas homologadas com um único comando.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                id="btn-coordenacao-baixar-lote"
                onClick={handleBaixarTodosPareceres}
                disabled={isExportingBatch}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>
                  {isExportingBatch
                    ? `Gerando (${batchProgress?.current}/${batchProgress?.total})...`
                    : 'Emitir Todos os Laudos (Lote)'}
                </span>
              </button>
            </div>
          </div>

          {/* Card 5: Simulador de Cenários & Sensibilidade Orçamentária */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-700 uppercase">
                <span>Matriz What-If</span>
                <span>•</span>
                <span>Sensibilidade</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Parecer de Cenários Orçamentários ("E se...")
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Relatório executivo comparando hipóteses orçamentárias (+cotas, alteração de pesos e dança das cadeiras).
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                id="btn-coordenacao-baixar-simulacao-pdf"
                onClick={() => {
                  const sim = simularCenario(propostas, PARAMETROS_PADRAO_EDITAL, edital);
                  exportarSimuladorCenariosPDF(sim, edital);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Baixar Parecer (PDF)</span>
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  id="btn-coordenacao-abrir-simulador"
                  onClick={() => onNavigateTab('simulador')}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>Abrir Simulador Interativo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela do Acervo Individual de Relatórios e PDFs das Propostas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Filtros e Busca */}
        <div className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#002B49]" />
                <span>Acervo Documental de Propostas, Pareceres e Dossiês</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Localize qualquer projeto submetido e baixe instantaneamente o Laudo Técnico em PDF, o Dossiê Científico ou a Ata Regimental.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
              Exibindo {propostasFiltradas.length} de {propostas.length} propostas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por projeto, discente, orientador..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Desenho */}
            <select
              value={filtroDesenho}
              onChange={(e) => setFiltroDesenho(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos os Delineamentos</option>
              <option value="Ensaio Clínico Randomizado">1. Ensaio Clínico Randomizado</option>
              <option value="Ensaio de Roda / Estudo de coorte">2. Ensaio de Roda / Coorte</option>
              <option value="Caso controle">3. Caso controle</option>
              <option value="Relato de caso">4. Relato de caso</option>
              <option value="Estudo in vitro">5. Estudo in vitro</option>
            </select>

            {/* Filtro por Modalidade */}
            <select
              value={filtroModalidade}
              onChange={(e) => setFiltroModalidade(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todas as Modalidades</option>
              <option value="Ampla Concorrência">Ampla Concorrência</option>
              <option value="Ações Afirmativas">Ações Afirmativas</option>
            </select>

            {/* Filtro por Status da Concessão */}
            <select
              value={filtroStatusBolsa}
              onChange={(e) => setFiltroStatusBolsa(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="concedida">Com Bolsa Concedida</option>
              <option value="avaliada">Avaliada pela Banca</option>
            </select>
          </div>
        </div>

        {/* Tabela de Relatórios e PDFs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center">Código</th>
                <th className="py-3 px-4">Projeto &amp; Pesquisadores</th>
                <th className="py-3 px-3">Métodos &amp; Delineamento</th>
                <th className="py-3 px-3 text-center">Score Métodos</th>
                <th className="py-3 px-3 text-center">Nota Final</th>
                <th className="py-3 px-3">Situação Regimental</th>
                <th className="py-3 px-3 text-center">Relatórios Oficiais (PDF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {propostasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Nenhuma proposta encontrada com os critérios selecionados.
                  </td>
                </tr>
              ) : (
                propostasFiltradas.map((p) => {
                  const c = p.calculo;
                  const orientadorNome =
                    p.orientador?.nome || p.orientador?.usuarioNome || `Orientador #${p.orientadorId}`;
                  const scoreMetodo = c?.scoreMetodologico || p.metodoScoreTotal || '0.00';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* Código */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                        PIC-{String(p.id).padStart(3, '0')}
                      </td>

                      {/* Título & Pesquisadores */}
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-1">{p.titulo}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <strong>Orientador:</strong> {orientadorNome} • <strong>Discente:</strong>{' '}
                          {p.discenteNome} ({p.discenteCurso})
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          SHA-256: {p.hashSha256.substring(0, 16)}...
                        </p>
                      </td>

                      {/* Métodos & Delineamento */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.metodoDesenho === 'Ensaio Clínico Randomizado'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.metodoDesenho === 'Ensaio de Roda / Estudo de coorte'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : p.metodoDesenho === 'Caso controle'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : p.metodoDesenho === 'Relato de caso'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {p.metodoDesenho || 'Não informado'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {p.metodoTipo} • N={p.metodoTamanhoAmostra ?? '--'}
                        </div>
                      </td>

                      {/* Score Metodológico */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {scoreMetodo} pts
                        </span>
                      </td>

                      {/* Nota Final */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-black text-sm text-[#002B49]">
                          {c?.notaFinalPonderada ? `${c.notaFinalPonderada}` : '--'}
                        </span>
                      </td>

                      {/* Situação Regimental */}
                      <td className="py-3 px-3">
                        {c?.tipoVagaConcedida ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                              c.tipoVagaConcedida.includes('Ampla Concorrência')
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : c.tipoVagaConcedida.includes('Ações Afirmativas')
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {c.tipoVagaConcedida}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Em avaliação</span>
                        )}
                      </td>

                      {/* Ações de Relatórios em PDF */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Botão: Baixar Laudo Individual PDF */}
                          <button
                            type="button"
                            id={`btn-relatorio-laudo-${p.id}`}
                            onClick={() => exportarParecerIndividualPDF(p, edital)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#002B49] border border-slate-200 transition-colors cursor-pointer"
                            title="Baixar Laudo Técnico da Banca (PDF)"
                          >
                            <FileText className="w-4 h-4 text-blue-700" />
                          </button>

                          {/* Botão: Baixar Dossiê Completo PDF */}
                          <button
                            type="button"
                            id={`btn-relatorio-dossie-${p.id}`}
                            onClick={() => exportarDossieCompletoPropostaPDF(p, edital)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#002B49] border border-slate-200 transition-colors cursor-pointer"
                            title="Baixar Dossiê Científico e Ficha Cadastral (PDF)"
                          >
                            <Download className="w-4 h-4 text-emerald-700" />
                          </button>

                          {/* Botão: Visualizar Parecer em Modal */}
                          <button
                            type="button"
                            id={`btn-relatorio-ver-${p.id}`}
                            onClick={() => onOpenParecerModal(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                            title="Visualizar Parecer Consolidado na Tela"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota de Segurança e Conformidade Digital */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Todos os relatórios e PDFs emitidos contêm chancela eletrônica da PROPEP, carimbo de tempo oficial e hash de custódia em estrita conformidade com a LGPD.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">
          Edital PIC 2027/2028
        </span>
      </div>
        </>
      )}
    </div>
  );
};
