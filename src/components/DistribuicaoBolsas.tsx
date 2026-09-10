import React, { useState, useMemo } from 'react';
import { Proposta, Edital, DesenhoPesquisa, TipoMetodo } from '../types/index.ts';
import {
  exportarHomologacaoFinalPDF,
  exportarParecerIndividualPDF,
  exportarRelatorioMetodosCientificosPDF,
} from '../utils/pdfExport.ts';
import { HIERARQUIA_DESENHOS, calcularScoreMetodologico } from '../utils/methodology.ts';
import { getCursoMeta, normalizarNomeCurso } from '../data/cursosUnig.ts';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Download,
  FileText,
  Printer,
  Microscope,
  Binary,
  Sliders,
  Filter,
  Check,
  Zap,
  GraduationCap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DistribuicaoBolsasProps {
  propostas: Proposta[];
  edital: Edital | null;
  onHomologarBolsas: () => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const DistribuicaoBolsas: React.FC<DistribuicaoBolsasProps> = ({
  propostas,
  edital,
  onHomologarBolsas,
  onNavigateTab,
}) => {
  const [isHomologando, setIsHomologando] = useState(false);
  const [modoOrdenacao, setModoOrdenacao] = useState<'edital' | 'metodos' | 'hibrida'>('edital');
  const [filtroDesenho, setFiltroDesenho] = useState<string>('todos');
  const [filtroTipoMetodo, setFiltroTipoMetodo] = useState<string>('todos');

  // Cálculo da lista ordenada conforme o modo selecionado
  const ranqueadas = useMemo(() => {
    let lista = propostas.filter((p) => p.calculo?.notaFinalPonderada);

    // Filtros
    if (filtroDesenho !== 'todos') {
      lista = lista.filter((p) => p.metodoDesenho === filtroDesenho);
    }
    if (filtroTipoMetodo !== 'todos') {
      lista = lista.filter((p) => p.metodoTipo === filtroTipoMetodo);
    }

    return [...lista].sort((a, b) => {
      if (modoOrdenacao === 'metodos') {
        // Ordem por Rigor Metodológico:
        // 1. Hierarquia de Desenho (ECR 5 > Coorte/Roda 4 > Caso-controle 3 > Relato 2 > In vitro 1)
        const ordemA = HIERARQUIA_DESENHOS[a.metodoDesenho as DesenhoPesquisa]?.ordem || 99;
        const ordemB = HIERARQUIA_DESENHOS[b.metodoDesenho as DesenhoPesquisa]?.ordem || 99;
        if (ordemA !== ordemB) return ordemA - ordemB;

        // 2. Score Metodológico Total (Desenho + Amostra + Tipo)
        const scoreA = parseFloat(a.calculo?.scoreMetodologico || a.metodoScoreTotal || '0');
        const scoreB = parseFloat(b.calculo?.scoreMetodologico || b.metodoScoreTotal || '0');
        if (scoreB !== scoreA) return scoreB - scoreA;

        // 3. Tamanho da Amostra (N)
        const amostraA = a.metodoTamanhoAmostra || 0;
        const amostraB = b.metodoTamanhoAmostra || 0;
        if (amostraB !== amostraA) return amostraB - amostraA;

        // 4. Nota Final Ponderada do Edital
        const notaA = parseFloat(a.calculo?.notaFinalPonderada || '0');
        const notaB = parseFloat(b.calculo?.notaFinalPonderada || '0');
        return notaB - notaA;
      }

      if (modoOrdenacao === 'hibrida') {
        // Ordem Híbrida: 70% Nota Edital + 30% Score Metodológico
        const notaA = parseFloat(a.calculo?.notaFinalPonderada || '0');
        const notaB = parseFloat(b.calculo?.notaFinalPonderada || '0');
        const scoreMetodoA = parseFloat(a.calculo?.scoreMetodologico || a.metodoScoreTotal || '0');
        const scoreMetodoB = parseFloat(b.calculo?.scoreMetodologico || b.metodoScoreTotal || '0');

        const indiceA = notaA * 0.7 + scoreMetodoA * 0.3;
        const indiceB = notaB * 0.7 + scoreMetodoB * 0.3;
        return indiceB - indiceA;
      }

      // 'edital': Classificação Regimental Oficial
      const notaA = parseFloat(a.calculo?.notaFinalPonderada || '0');
      const notaB = parseFloat(b.calculo?.notaFinalPonderada || '0');
      return notaB - notaA;
    });
  }, [propostas, modoOrdenacao, filtroDesenho, filtroTipoMetodo]);

  // Estatísticas de Desenhos de Pesquisa
  const contagemDesenhos = useMemo(() => {
    const mapa: Record<string, number> = {
      'Ensaio Clínico Randomizado': 0,
      'Ensaio de Roda / Estudo de coorte': 0,
      'Caso controle': 0,
      'Relato de caso': 0,
      'Estudo in vitro': 0,
    };
    propostas.forEach((p) => {
      if (p.metodoDesenho && mapa[p.metodoDesenho] !== undefined) {
        mapa[p.metodoDesenho]++;
      }
    });
    return mapa;
  }, [propostas]);

  // Estatísticas para Recharts
  // 1. Alocação das 100 Bolsas
  const bolsaData = [
    { name: 'Ampla Concorrência (60)', value: 60, color: '#002B49' },
    { name: 'Ações Afirmativas (40)', value: 40, color: '#D97706' },
  ];

  // 2. Pontuações Médias por Curso de Graduação (Edital PIC-UNIG / Anexo IV)
  const cursoMap: Record<string, { total: number; count: number }> = {};
  propostas.forEach((p) => {
    const n = parseFloat(p.calculo?.notaFinalPonderada || '0');
    if (n > 0) {
      const c = normalizarNomeCurso(p.discenteCurso);
      if (!cursoMap[c]) cursoMap[c] = { total: 0, count: 0 };
      cursoMap[c].total += n;
      cursoMap[c].count += 1;
    }
  });

  const cursoData = Object.entries(cursoMap).map(([curso, val]) => ({
    curso: curso.length > 16 ? curso.substring(0, 16) + '...' : curso,
    cursoCompleto: curso,
    media: Number((val.total / val.count).toFixed(2)),
  }));

  // 3. Comparativo H5 vs. Scopus
  let h5Count = 0;
  let scopusCount = 0;
  propostas.forEach((p) => {
    if (p.orientador?.regraMaiorBeneficioTipo === 'H5') h5Count++;
    if (p.orientador?.regraMaiorBeneficioTipo === 'Scopus') scopusCount++;
  });

  const maiorBeneficioData = [
    { name: 'Google Scholar (H5 / 15)', count: h5Count, fill: '#7C3AED' },
    { name: 'Scopus (Percentil / 100)', count: scopusCount, fill: '#2563EB' },
  ];

  const handleHomologar = async () => {
    try {
      setIsHomologando(true);
      await onHomologarBolsas();
      alert('Classificação geral das 100 bolsas homologada regimentalmente com sucesso!');
    } catch (err: any) {
      alert('Erro na homologação: ' + err.message);
    } finally {
      setIsHomologando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Award className="w-3.5 h-3.5" />
            <span>Motor Regimental PIC-UNIG 2027</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Distribuição e Homologação das 100 Bolsas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo ponderado: (Nota Orientador × 0,30) + (Nota Projeto × 0,50) + (Nota Aluno × 0,20), com aplicação automática de cotas e desempate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {onNavigateTab && (
            <button
              id="btn-abrir-simulador-whatif"
              onClick={() => onNavigateTab('simulador')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              title="Abrir Simulador Interativo de Cenários e Dança das Cadeiras"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Simulador "E se..." (What-If)</span>
            </button>
          )}

          <button
            id="btn-exportar-ata-pdf"
            onClick={() => exportarHomologacaoFinalPDF(propostas, edital)}
            className="px-4 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003d68] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            title="Exportar documento oficial em PDF formatado com assinatura e estatísticas"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar Ata Final (PDF)</span>
          </button>

          <button
            id="btn-exportar-metodos-pdf"
            onClick={() => exportarRelatorioMetodosCientificosPDF(propostas, edital)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            title="Exportar Relatório Oficial de Rigor Metodológico e Delineamentos em PDF"
          >
            <Microscope className="w-4 h-4 text-emerald-200" />
            <span>Relatório de Métodos (PDF)</span>
          </button>

          <button
            id="btn-recalcular-homologacao"
            onClick={handleHomologar}
            disabled={isHomologando}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isHomologando ? 'animate-spin' : ''}`} />
            <span>{isHomologando ? 'Processando Motor...' : 'Processar & Homologar Bolsas'}</span>
          </button>
        </div>
      </div>

      {/* Grid de Gráficos Analíticos em Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Proporção das 100 Bolsas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Distribuição de Vagas (100 Bolsas)
            </h3>
            <p className="text-[11px] text-slate-500">60 Ampla Concorrência vs. 40 Ações Afirmativas</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bolsaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bolsaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Bolsas`, 'Cota']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#002B49]" />
              <span className="text-slate-700 font-medium">60 AC (60%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D97706]" />
              <span className="text-slate-700 font-medium">40 AF (40%)</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Média Final por Curso de Graduação (Edital PIC-UNIG) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Nota Média Ponderada por Curso
            </h3>
            <p className="text-[11px] text-slate-500">Desempenho acadêmico consolidado por curso de graduação</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursoData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="curso" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} pts`, 'Média Final']}
                  labelFormatter={(_: any, payload: any) => payload?.[0]?.payload?.cursoCompleto || ''}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="media" fill="#002B49" radius={[4, 4, 0, 0]} name="Média Final" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-100">
            Calculado com base nas notas finais homologadas por curso
          </div>
        </div>

        {/* Gráfico 3: Regra do Maior Benefício (H5 vs. Scopus) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Regra do Maior Benefício Docente
            </h3>
            <p className="text-[11px] text-slate-500">Métricas adotadas em benefício dos orientadores</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maiorBeneficioData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Docentes Beneficiados">
                  {maiorBeneficioData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-100">
            <span className="text-purple-700 font-bold">{h5Count} por H5</span>
            <span className="text-blue-700 font-bold">{scopusCount} por Scopus</span>
          </div>
        </div>
      </div>

      {/* Painel da Hierarquia e Ordem Regimental de Pontuação de Métodos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Microscope className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Hierarquia e Ordem de Pontuação Científica (Critérios Metodológicos)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Regra Metodológica: Desenho (máx 5.00) + Amostra (máx 3.00) + Abordagem (máx 2.00) = 10.00 pts
          </span>
        </div>

        {/* Os 5 Desenhos da Pesquisa na Ordem Exata solicitada */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
              <span>1º Ordem (Nível 1)</span>
              <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded">5.00 pts</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Ensaio Clínico Randomizado</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Máxima evidência intervencionista</div>
            <div className="text-[10px] font-semibold text-emerald-700 mt-1">
              {contagemDesenhos['Ensaio Clínico Randomizado']} submissão(ões)
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
              <span>2º Ordem (Nível 2)</span>
              <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded">4.00 pts</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Ensaio de Roda / Coorte</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Analítico longitudinal prospectivo</div>
            <div className="text-[10px] font-semibold text-blue-700 mt-1">
              {contagemDesenhos['Ensaio de Roda / Estudo de coorte']} submissão(ões)
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800 uppercase">
              <span>3º Ordem (Nível 3)</span>
              <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded">3.00 pts</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Caso controle</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Observacional retrospectivo</div>
            <div className="text-[10px] font-semibold text-indigo-700 mt-1">
              {contagemDesenhos['Caso controle']} submissão(ões)
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 uppercase">
              <span>4º Ordem (Nível 4)</span>
              <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded">2.00 pts</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Relato de caso</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Descritivo clínico observacional</div>
            <div className="text-[10px] font-semibold text-amber-700 mt-1">
              {contagemDesenhos['Relato de caso']} submissão(ões)
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-bold text-purple-800 uppercase">
              <span>5º Ordem (Nível 5)</span>
              <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded">1.00 pt</span>
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">Estudo in vitro</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Laboratorial pré-clínico de bancada</div>
            <div className="text-[10px] font-semibold text-purple-700 mt-1">
              {contagemDesenhos['Estudo in vitro']} submissão(ões)
            </div>
          </div>
        </div>

        {/* Resumo de Amostragem e Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <span className="font-bold text-slate-800">Escala de Pontuação Amostral (N):</span>
            <ul className="text-[11px] text-slate-600 mt-1 space-y-0.5">
              <li>• N ≥ 200: <strong className="text-emerald-700">+3.00 pts</strong> (Amostra Robusta / Amplo Poder)</li>
              <li>• 100 ≤ N &lt; 200: <strong className="text-emerald-700">+2.25 pts</strong> (Amostra Significativa)</li>
              <li>• 30 ≤ N &lt; 100: <strong className="text-emerald-700">+1.50 pts</strong> (Amostra Moderada)</li>
              <li>• N &lt; 30: <strong className="text-emerald-700">+0.75 pt</strong> (Estudo Piloto / Saturação Teórica)</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-slate-800">Avaliação da Abordagem Metodológica:</span>
            <ul className="text-[11px] text-slate-600 mt-1 space-y-0.5">
              <li>• <strong>Quantitativo</strong>: <strong className="text-blue-700">+2.00 pts</strong> (Rigor inferencial, teste de hipóteses e mensuração)</li>
              <li>• <strong>Qualitativo</strong>: <strong className="text-amber-700">+1.75 pts</strong> (Profundidade teórica, saturação e triangulação de dados)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabela de Classificação e Homologação Geral */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quadro Oficial de Homologação e Classificação de Bolsas PIC-UNIG 2027
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alterne entre os modos de ordenação para analisar a classificação pelo Edital, pelo Rigor Metodológico ou de forma Integrada.
              </p>
            </div>
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                id="btn-baixar-ata-tabela"
                onClick={() => exportarHomologacaoFinalPDF(propostas, edital)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#002B49] text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                title="Baixar Ata Oficial em PDF"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Baixar Ata (PDF)</span>
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Selo PROPEP Homologado
              </span>
            </div>
          </div>

          {/* Seletor de Modos de Classificação e Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Abas de Modo de Classificação */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl space-x-1">
              <button
                type="button"
                id="btn-modo-edital"
                onClick={() => setModoOrdenacao('edital')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modoOrdenacao === 'edital'
                    ? 'bg-white text-[#002B49] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ordem do Edital (Ponderada)
              </button>

              <button
                type="button"
                id="btn-modo-metodos"
                onClick={() => setModoOrdenacao('metodos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  modoOrdenacao === 'metodos'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Ordem por Métodos Científicos</span>
              </button>

              <button
                type="button"
                id="btn-modo-hibrida"
                onClick={() => setModoOrdenacao('hibrida')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  modoOrdenacao === 'hibrida'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                Ordem Híbrida (Edital + Métodos)
              </button>
            </div>

            {/* Filtros por Desenho e Abordagem */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium">Desenho:</span>
                <select
                  value={filtroDesenho}
                  onChange={(e) => setFiltroDesenho(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Desenhos</option>
                  <option value="Ensaio Clínico Randomizado">1. Ensaio Clínico Randomizado</option>
                  <option value="Ensaio de Roda / Estudo de coorte">2. Ensaio de Roda / Estudo de coorte</option>
                  <option value="Caso controle">3. Caso controle</option>
                  <option value="Relato de caso">4. Relato de caso</option>
                  <option value="Estudo in vitro">5. Estudo in vitro</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium">Método:</span>
                <select
                  value={filtroTipoMetodo}
                  onChange={(e) => setFiltroTipoMetodo(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="Quantitativo">Quantitativo</option>
                  <option value="Qualitativo">Qualitativo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center">
                  {modoOrdenacao === 'metodos' ? 'Rank Métodos' : modoOrdenacao === 'hibrida' ? 'Rank Híbrido' : 'Posição'}
                </th>
                <th className="py-3 px-4">Projeto &amp; Discente</th>
                <th className="py-3 px-3">Delineamento &amp; Métodos</th>
                <th className="py-3 px-3 text-center">Score Métodos</th>
                <th className="py-3 px-3 text-center">Projeto (50%)</th>
                <th className="py-3 px-3 text-center">Orientador (30%)</th>
                <th className="py-3 px-3 text-center">Aluno CR (20%)</th>
                <th className="py-3 px-3 text-center">Nota Final</th>
                <th className="py-3 px-3">Vaga Concedida</th>
                <th className="py-3 px-3">Critério / Diagnóstico</th>
                <th className="py-3 px-3 text-center">Laudo / PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ranqueadas.map((p, idx) => {
                const c = p.calculo;
                const isDivergente = c?.divergenciaDetectada;
                const scoreMetodo = c?.scoreMetodologico || p.metodoScoreTotal || '0.00';
                const rankMetodologico = c?.classificacaoMetodologica;

                return (
                  <tr key={p.id} className={idx < 3 ? 'bg-amber-50/20' : 'hover:bg-slate-50'}>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                      {idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={p.titulo}>
                        {p.titulo}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        {(() => {
                          const meta = getCursoMeta(p.discenteCurso);
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 ${meta.bgTag} ${meta.corTag} ${meta.borderTag}`}>
                              <GraduationCap className="w-3 h-3 shrink-0" />
                              <span>{meta.nome}</span>
                            </span>
                          );
                        })()}
                        <span>{p.discenteNome}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{p.modalidade}</span>
                      </div>
                    </td>

                    {/* Delineamento e Métodos */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
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
                        <div className="text-[10px] text-slate-500 font-medium">
                          {p.metodoTipo} • Amostra N={p.metodoTamanhoAmostra || '--'}
                        </div>
                      </div>
                    </td>

                    {/* Score Metodológico */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {scoreMetodo} pts
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-semibold">
                      {c?.mediaEtapa2Merito ? `${c.mediaEtapa2Merito}/6` : '--'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold">
                      {c?.notaEtapa3Orientador ? `${c.notaEtapa3Orientador}/4` : '--'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold">
                      {p.discenteCr}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-mono font-black text-sm text-[#002B49]">
                        {c?.notaFinalPonderada || '--'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {isDivergente ? (
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
                          Sob Arbitragem
                        </span>
                      ) : c?.tipoVagaConcedida === 'Ampla Concorrência' ? (
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-100 text-blue-900 border border-blue-200">
                          Bolsa Ampla Concorrência
                        </span>
                      ) : c?.tipoVagaConcedida === 'Ações Afirmativas' ? (
                        <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-amber-100 text-amber-900 border border-amber-300">
                          Bolsa Ações Afirmativas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                          {c?.tipoVagaConcedida || 'Lista de Espera'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 max-w-xs text-[11px] text-slate-500">
                      {modoOrdenacao === 'metodos' ? (
                        <span className="text-emerald-800 font-medium">
                          Posição Metodológica: {idx + 1}º ({p.metodoDesenho})
                        </span>
                      ) : (
                        c?.criterioDesempateAplicado || 'Média e pontuação homologadas.'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        id={`btn-pdf-ranking-${p.id}`}
                        onClick={() => exportarParecerIndividualPDF(p, edital)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#002B49] text-[11px] font-bold transition-colors cursor-pointer border border-slate-200"
                        title="Baixar Laudo Técnico Individual do Projeto em PDF"
                      >
                        <FileText className="w-3 h-3 text-blue-700" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
