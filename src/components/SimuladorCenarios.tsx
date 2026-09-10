import React, { useState, useMemo } from 'react';
import { Proposta, Edital } from '../types/index.ts';
import {
  ParametrosSimulacao,
  PARAMETROS_PADRAO_EDITAL,
  simularCenario,
  RelatorioImpactoSimulacao,
} from '../utils/simulation.ts';
import { exportarSimuladorCenariosPDF } from '../utils/pdfExport.ts';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  Scale,
  Building2,
  Search,
  Check,
  Zap,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SimuladorCenariosProps {
  propostas: Proposta[];
  edital: Edital | null;
  onHomologarBolsas?: () => Promise<void>;
  onNavigateTab?: (tab: string) => void;
}

export const SimuladorCenarios: React.FC<SimuladorCenariosProps> = ({
  propostas,
  edital,
  onHomologarBolsas,
  onNavigateTab,
}) => {
  const [params, setParams] = useState<ParametrosSimulacao>(PARAMETROS_PADRAO_EDITAL);
  const [filtroMovimentacao, setFiltroMovimentacao] = useState<'todos' | 'NOVO_CONTEMPLADO' | 'PERDEU_BOLSA' | 'MANTEVE_BOLSA' | 'MANTEVE_ESPERA'>('todos');
  const [busca, setBusca] = useState('');
  const [presetAtivo, setPresetAtivo] = useState<string>('oficial');
  const [isHomologando, setIsHomologando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Execução do motor de simulação reativo
  const simulacao: RelatorioImpactoSimulacao = useMemo(() => {
    return simularCenario(propostas, params, edital);
  }, [propostas, params, edital]);

  const somaPesos = params.pesoProjeto + params.pesoOrientador + params.pesoAluno;

  // Filtragem da tabela de "Dança das Cadeiras"
  const propostasFiltradas = useMemo(() => {
    return simulacao.propostasComparadas.filter((p) => {
      const matchBusca =
        p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        p.orientadorNome.toLowerCase().includes(busca.toLowerCase()) ||
        p.discenteNome.toLowerCase().includes(busca.toLowerCase()) ||
        p.discenteCurso.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigoFormatado.toLowerCase().includes(busca.toLowerCase());

      if (!matchBusca) return false;

      if (filtroMovimentacao === 'todos') return true;
      return p.movimentacaoStatus === filtroMovimentacao;
    });
  }, [simulacao.propostasComparadas, busca, filtroMovimentacao]);

  // Aplicar Presets de Cenários
  const aplicarPreset = (tipo: string) => {
    setPresetAtivo(tipo);
    switch (tipo) {
      case 'oficial':
        setParams(PARAMETROS_PADRAO_EDITAL);
        break;
      case 'expansao_cnpq':
        setParams({
          ...PARAMETROS_PADRAO_EDITAL,
          totalBolsas: 115,
          percCotasAf: 40,
        });
        break;
      case 'equidade_50':
        setParams({
          ...PARAMETROS_PADRAO_EDITAL,
          totalBolsas: 100,
          percCotasAf: 50,
        });
        break;
      case 'merito_projeto':
        setParams({
          ...PARAMETROS_PADRAO_EDITAL,
          pesoProjeto: 60,
          pesoOrientador: 25,
          pesoAluno: 15,
        });
        break;
      case 'foco_lattes':
        setParams({
          ...PARAMETROS_PADRAO_EDITAL,
          pesoProjeto: 40,
          pesoOrientador: 40,
          pesoAluno: 20,
        });
        break;
      case 'reajuste_bolsa':
        setParams({
          ...PARAMETROS_PADRAO_EDITAL,
          valorBolsaMensal: 800,
        });
        break;
    }
  };

  const handleHomologarCenario = async () => {
    if (!onHomologarBolsas) return;
    const confirm = window.confirm(
      `Confirma a aplicação oficial deste cenário (${params.totalBolsas} bolsas, ${simulacao.simulado.vagasAC} AC / ${simulacao.simulado.vagasAF} AF) na base do sistema?`
    );
    if (!confirm) return;

    setIsHomologando(true);
    try {
      await onHomologarBolsas();
      setMensagemSucesso('Cenário processado e homologado com sucesso no edital!');
      setTimeout(() => setMensagemSucesso(null), 5000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsHomologando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Institucional da Coordenação */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003860] to-[#001D33] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#001D33]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Matriz Estratégica "E se..." (What-If) • PROPEP/UNIG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Simulador Interativo de Cenários &amp; Sensibilidade Orçamentária
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore o impacto em tempo real de novas cotas do CNPq/FAPERJ, expansão de vagas, alteração de pesos regimentais e a "Dança das Cadeiras" na classificação antes da publicação oficial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              id="btn-exportar-simulador-pdf"
              onClick={() => exportarSimuladorCenariosPDF(simulacao, edital)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              title="Exportar Parecer Executivo de Impacto Orçamentário e Dança das Cadeiras em PDF"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Exportar Parecer (PDF)</span>
            </button>

            <button
              id="btn-restaurar-padrao"
              onClick={() => aplicarPreset('oficial')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
              title="Restaurar parâmetros padrão do Edital 2027"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>

        {/* Barra de Presets Rápidos */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-xs font-medium text-slate-300 mb-2.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cenários Estratégicos Predefinidos (1 Clique):</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'oficial', label: '🏛️ Padrão Edital 2027 (100 Bolsas, 60/40)' },
              { id: 'expansao_cnpq', label: '🚀 Cota CNPq (+15 Bolsas = 115)' },
              { id: 'equidade_50', label: '⚖️ Paridade Afirmativa (50% AC / 50% AF)' },
              { id: 'merito_projeto', label: '🔬 Foco Mérito do Projeto (60/25/15)' },
              { id: 'foco_lattes', label: '👨‍🏫 Foco Produtividade Docente (40/40/20)' },
              { id: 'reajuste_bolsa', label: '💰 Reajuste de Bolsa (R$ 800/mês)' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  presetAtivo === preset.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm ring-2 ring-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{mensagemSucesso}</span>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('bolsas')}
              className="text-xs text-emerald-700 underline font-bold hover:text-emerald-900"
            >
              Ver na Distribuição de Bolsas
            </button>
          )}
        </div>
      )}

      {/* 2. Painel de Sliders e Controles em Tempo Real */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#002B49]" />
            <h2 className="text-base font-bold text-slate-900">
              Painel de Parâmetros e Variáveis de Sensibilidade
            </h2>
          </div>
          <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
            Simulação Dinâmica Sandbox (Não afeta base até homologar)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Slider 1: Total de Bolsas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                1. Total de Bolsas Concedidas
              </label>
              <span className="px-2 py-0.5 rounded font-black text-sm bg-[#002B49] text-white">
                {params.totalBolsas} bolsas
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              step="5"
              value={params.totalBolsas}
              onChange={(e) => {
                setParams({ ...params, totalBolsas: parseInt(e.target.value, 10) });
                setPresetAtivo('custom');
              }}
              className="w-full accent-[#002B49] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>20 bolsas</span>
              <span className="text-slate-700 font-bold">Padrão: 100</span>
              <span>160 bolsas</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Simule a expansão por emenda parlamentar, cota CNPq ou aporte FAPERJ.
            </p>
          </div>

          {/* Slider 2: Divisão de Cotas (Ações Afirmativas %) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                2. Política de Ações Afirmativas
              </label>
              <span className="px-2 py-0.5 rounded font-black text-sm bg-amber-600 text-white">
                {params.percCotasAf}% AF
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={params.percCotasAf}
              onChange={(e) => {
                setParams({ ...params, percCotasAf: parseInt(e.target.value, 10) });
                setPresetAtivo('custom');
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>10% AF</span>
              <span className="text-slate-700 font-bold">Padrão: 40%</span>
              <span>70% AF</span>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-700 pt-1 border-t border-slate-200">
              <span>Ampla: {simulacao.simulado.vagasAC} vagas ({100 - params.percCotasAf}%)</span>
              <span className="text-amber-700">Cotas: {simulacao.simulado.vagasAF} vagas ({params.percCotasAf}%)</span>
            </div>
          </div>

          {/* Input 3: Valor da Bolsa Mensal */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                3. Valor Mensal da Bolsa (R$)
              </label>
              <span className="px-2 py-0.5 rounded font-black text-sm bg-emerald-700 text-white">
                R$ {params.valorBolsaMensal.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="50"
              min="400"
              max="1500"
              value={params.valorBolsaMensal}
              onChange={(e) => {
                setParams({ ...params, valorBolsaMensal: parseFloat(e.target.value) || 700 });
                setPresetAtivo('custom');
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#002B49]"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Duração: 12 meses</span>
              <span className="font-semibold text-slate-700">
                R$ {(params.valorBolsaMensal * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano por bolsista
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Valor padrão nacional: R$ 700,00 (CNPq / CAPES / FAPERJ).
            </p>
          </div>

          {/* Slider 4: Peso Projeto (Etapa 2 Mérito) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                4. Peso do Projeto (Mérito Cego)
              </label>
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-100 text-blue-900">
                {params.pesoProjeto}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={params.pesoProjeto}
              onChange={(e) => {
                setParams({ ...params, pesoProjeto: parseInt(e.target.value, 10) });
                setPresetAtivo('custom');
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Mín: 20%</span>
              <span className="font-bold text-slate-700">Edital: 50%</span>
              <span>Máx: 70%</span>
            </div>
          </div>

          {/* Slider 5: Peso Orientador (Etapa 3 Lattes) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                5. Peso do Orientador (Lattes H5/Scopus)
              </label>
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-purple-100 text-purple-900">
                {params.pesoOrientador}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={params.pesoOrientador}
              onChange={(e) => {
                setParams({ ...params, pesoOrientador: parseInt(e.target.value, 10) });
                setPresetAtivo('custom');
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Mín: 10%</span>
              <span className="font-bold text-slate-700">Edital: 30%</span>
              <span>Máx: 50%</span>
            </div>
          </div>

          {/* Slider 6: Peso Aluno (Histórico / CR) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                6. Peso do Aluno (CR / Histórico)
              </label>
              <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-900">
                {params.pesoAluno}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={params.pesoAluno}
              onChange={(e) => {
                setParams({ ...params, pesoAluno: parseInt(e.target.value, 10) });
                setPresetAtivo('custom');
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Mín: 10%</span>
              <span className="font-bold text-slate-700">Edital: 20%</span>
              <span>Máx: 40%</span>
            </div>
          </div>
        </div>

        {/* Barra de Status de Equilíbrio dos Pesos */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Soma dos Pesos:</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                somaPesos === 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {somaPesos}% {somaPesos === 100 ? '• 100% Exato' : '• Auto-normalizado para 100%'}
            </span>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={params.bonusMetodologico}
              onChange={(e) => setParams({ ...params, bonusMetodologico: e.target.checked })}
              className="rounded text-[#002B49] focus:ring-[#002B49] h-4 w-4"
            />
            <span className="font-medium">
              Aplicar Bônus de Rigor Metodológico (+0.50 pts para ECR e Coorte)
            </span>
          </label>
        </div>
      </div>

      {/* 3. Indicadores de Impacto & Sensibilidade Orçamentária (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Impacto Orçamentário Anual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Custo Orçamentário Anual</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">
              R$ {simulacao.simulado.custoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Folha: R$ {simulacao.simulado.custoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Variação (Delta):</span>
            <span
              className={`font-bold flex items-center ${
                simulacao.deltaCustoAnual > 0
                  ? 'text-rose-600'
                  : simulacao.deltaCustoAnual < 0
                  ? 'text-emerald-600'
                  : 'text-slate-600'
              }`}
            >
              {simulacao.deltaCustoAnual > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
              ) : simulacao.deltaCustoAnual < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Minus className="w-3.5 h-3.5 mr-1" />
              )}
              {simulacao.deltaCustoAnual >= 0 ? '+' : ''}
              R$ {simulacao.deltaCustoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Card 2: Dança das Cadeiras (Novos Contemplados) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Dança das Cadeiras</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-emerald-600">
                +{simulacao.novosContempladosCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">novos beneficiados</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {simulacao.perderamBolsaCount} perderiam a bolsa neste cenário
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Bolsistas Mantidos:</span>
            <span className="font-bold text-slate-800">{simulacao.mantiveramBolsaCount} projetos</span>
          </div>
        </div>

        {/* Card 3: Nota de Corte Ampla Concorrência */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Nota de Corte (Ampla)</span>
              <Scale className="w-4 h-4 text-blue-800" />
            </div>
            <div className="text-xl font-black text-[#002B49]">
              {simulacao.simulado.corteAC.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">/ 10.0</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Oficial do edital: {simulacao.oficial.corteAC.toFixed(2)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Variação no Corte:</span>
            <span
              className={`font-bold ${
                simulacao.simulado.corteAC < simulacao.oficial.corteAC
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {(simulacao.simulado.corteAC - simulacao.oficial.corteAC >= 0 ? '+' : '') +
                (simulacao.simulado.corteAC - simulacao.oficial.corteAC).toFixed(2)}{' '}
              pts
            </span>
          </div>
        </div>

        {/* Card 4: Nota de Corte Ações Afirmativas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-medium">Nota de Corte (Afirmativas)</span>
              <Scale className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-600">
              {simulacao.simulado.corteAF.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">/ 10.0</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Oficial do edital: {simulacao.oficial.corteAF.toFixed(2)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Vagas Totais AF:</span>
            <span className="font-bold text-slate-800">
              {simulacao.simulado.vagasAF} cotas ({params.percCotasAf}%)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Gráficos Analíticos de Equidade e Distribuição por Grande Área */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Comparativo: Bolsas Oficial vs. Simulado por Área */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Distribuição de Bolsas por Curso de Graduação (Oficial vs. Simulado)
              </h3>
              <p className="text-[11px] text-slate-500">
                Acompanhe a alocação de bolsas por curso de graduação da UNIG (Anexo IV do Edital).
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#002B49]" />
                <span className="text-slate-600 font-medium">Oficial</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 font-medium">Simulado</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={simulacao.distribuicaoPorArea}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="area" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} Bolsas`,
                    name === 'bolsasOficial' ? 'Cenário Oficial' : 'Cenário Simulado',
                  ]}
                />
                <Bar dataKey="bolsasOficial" fill="#002B49" name="bolsasOficial" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bolsasSimulado" fill="#F59E0B" name="bolsasSimulado" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnóstico Executivo de Equidade & Ação Homologar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#002B49]" />
                <span>Diagnóstico de Equidade Institucional</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Monitoramento de conformidade acadêmica e limites de concentração.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Alocação de Cotas AF:</span>
                <span className="font-bold text-amber-700">
                  {simulacao.simulado.vagasAF} bolsas ({params.percCotasAf}%)
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Alocação Ampla AC:</span>
                <span className="font-bold text-slate-800">
                  {simulacao.simulado.vagasAC} bolsas ({100 - params.percCotasAf}%)
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Impacto Orçamentário / Mês:</span>
                <span className={`font-bold ${simulacao.deltaCustoMensal >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {simulacao.deltaCustoMensal >= 0 ? '+' : ''}R${' '}
                  {simulacao.deltaCustoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1">Parecer da Coordenação:</p>
              {simulacao.novosContempladosCount > 0 ? (
                <span>
                  O presente cenário amplia o acesso incluindo {simulacao.novosContempladosCount} novos alunos que não seriam contemplados no edital oficial.
                </span>
              ) : (
                <span>
                  O cenário mantém estabilidade nos contemplados com ajustes pontuais na ordem de classificação.
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              id="btn-aplicar-cenario-oficial"
              onClick={handleHomologarCenario}
              disabled={isHomologando}
              className="w-full py-2.5 px-3 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isHomologando ? 'Gravando no Banco...' : 'Adotar Este Cenário Oficialmente'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Requer perfil de Coordenador ou Pró-Reitor (PROPEP).
            </p>
          </div>
        </div>
      </div>

      {/* 5. Tabela Interativa da Dança das Cadeiras */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cabeçalho da Tabela e Filtros */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>Matriz Comparativa da Dança das Cadeiras</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-normal">
                {propostasFiltradas.length} propostas listadas
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifique quem entra, quem sai e quem sobe ou desce de posição com os novos parâmetros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar proposta, orientador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002B49] w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Abas de Filtro de Movimentação */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap gap-2 text-xs font-medium">
          <button
            onClick={() => setFiltroMovimentacao('todos')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroMovimentacao === 'todos'
                ? 'bg-[#002B49] text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({simulacao.propostasComparadas.length})
          </button>
          <button
            onClick={() => setFiltroMovimentacao('NOVO_CONTEMPLADO')}
            className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition-colors ${
              filtroMovimentacao === 'NOVO_CONTEMPLADO'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>🟢 Novos Contemplados ({simulacao.novosContempladosCount})</span>
          </button>
          <button
            onClick={() => setFiltroMovimentacao('PERDEU_BOLSA')}
            className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition-colors ${
              filtroMovimentacao === 'PERDEU_BOLSA'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-rose-800 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            <span>🔴 Perderam Bolsa ({simulacao.perderamBolsaCount})</span>
          </button>
          <button
            onClick={() => setFiltroMovimentacao('MANTEVE_BOLSA')}
            className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition-colors ${
              filtroMovimentacao === 'MANTEVE_BOLSA'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span>🟡 Bolsistas Mantidos ({simulacao.mantiveramBolsaCount})</span>
          </button>
          <button
            onClick={() => setFiltroMovimentacao('MANTEVE_ESPERA')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filtroMovimentacao === 'MANTEVE_ESPERA'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ⚪ Fila de Espera
          </button>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4">Proposta</th>
                <th className="py-3 px-3">Curso de Graduação</th>
                <th className="py-3 px-2 text-center">Mod.</th>
                <th className="py-3 px-3 text-center">Posição Oficial</th>
                <th className="py-3 px-3 text-center">Posição Simulada</th>
                <th className="py-3 px-3 text-center">Variação (Pos)</th>
                <th className="py-3 px-3 text-center">Nota Oficial</th>
                <th className="py-3 px-3 text-center">Nota Simulada</th>
                <th className="py-3 px-4 text-center">Impacto no Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propostasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhuma proposta encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                propostasFiltradas.map((p) => {
                  const subiu = p.deltaRank > 0;
                  const desceu = p.deltaRank < 0;

                  let linhaBg = '';
                  if (p.movimentacaoStatus === 'NOVO_CONTEMPLADO') {
                    linhaBg = 'bg-emerald-50/50 hover:bg-emerald-50';
                  } else if (p.movimentacaoStatus === 'PERDEU_BOLSA') {
                    linhaBg = 'bg-rose-50/50 hover:bg-rose-50';
                  } else {
                    linhaBg = 'hover:bg-slate-50';
                  }

                  return (
                    <tr key={p.propostaId} className={`transition-colors ${linhaBg}`}>
                      {/* Proposta */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-800 text-[11px]">
                            {p.codigoFormatado}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 line-clamp-1 mt-0.5" title={p.titulo}>
                           {p.titulo}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Orientador: {p.orientadorNome} • Aluno: {p.discenteNome}
                        </p>
                      </td>

                      {/* Curso de Graduação */}
                      <td className="py-3 px-3 text-slate-700 font-semibold whitespace-nowrap">
                        {p.discenteCurso}
                      </td>

                      {/* Modalidade */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.modalidade === 'Ações Afirmativas'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {p.modalidade === 'Ações Afirmativas' ? 'AF' : 'AC'}
                        </span>
                      </td>

                      {/* Posição Oficial */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-medium text-slate-600">
                        {p.rankOficial}º lugar
                      </td>

                      {/* Posição Simulada */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-black text-slate-900">
                        {p.rankSimulado}º lugar
                      </td>

                      {/* Variação de Posição */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          {subiu && (
                            <span className="text-emerald-600 font-bold flex items-center">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              +{p.deltaRank}
                            </span>
                          )}
                          {desceu && (
                            <span className="text-rose-600 font-bold flex items-center">
                              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                              {p.deltaRank}
                            </span>
                          )}
                          {!subiu && !desceu && (
                            <span className="text-slate-400 font-medium">Estável</span>
                          )}
                        </div>
                      </td>

                      {/* Nota Oficial */}
                      <td className="py-3 px-3 text-center whitespace-nowrap text-slate-600 font-semibold">
                        {p.notaOficial.toFixed(2)}
                      </td>

                      {/* Nota Simulada */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-[#002B49]">
                        {p.notaSimulada.toFixed(2)}
                        {p.deltaNota !== 0 && (
                          <span
                            className={`text-[10px] block ${
                              p.deltaNota > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {p.deltaNota > 0 ? `+${p.deltaNota.toFixed(2)}` : p.deltaNota.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Impacto no Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {p.movimentacaoStatus === 'NOVO_CONTEMPLADO' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse" />
                            🟢 Ganhou Bolsa ({p.statusSimulado === 'Ações Afirmativas' ? 'Cota AF' : 'Ampla AC'})
                          </span>
                        )}
                        {p.movimentacaoStatus === 'PERDEU_BOLSA' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
                            🔴 Perdeu Bolsa (Fila de Espera)
                          </span>
                        )}
                        {p.movimentacaoStatus === 'MANTEVE_BOLSA' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                            🟡 Bolsa Mantida ({p.statusSimulado === 'Ações Afirmativas' ? 'AF' : 'AC'})
                          </span>
                        )}
                        {p.movimentacaoStatus === 'MANTEVE_ESPERA' && (
                          <span className="text-slate-400 text-[11px] italic">
                            Permanece em Espera
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
