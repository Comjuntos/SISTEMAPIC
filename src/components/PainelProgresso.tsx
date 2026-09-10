import React from 'react';
import { Proposta, Edital } from '../types/index.ts';
import { getCursoMeta, normalizarNomeCurso } from '../data/cursosUnig.ts';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Award,
  GraduationCap,
  TrendingUp,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Building2,
} from 'lucide-react';

interface PainelProgressoProps {
  propostas: Proposta[];
  edital: Edital | null;
  onNavigateTab: (tab: string, filtroCurso?: string) => void;
  onSelectProposta: (p: Proposta) => void;
}

export const PainelProgresso: React.FC<PainelProgressoProps> = ({
  propostas,
  edital,
  onNavigateTab,
  onSelectProposta,
}) => {
  // Cálculos de Progresso da Banca Duplo-Cega
  const totalProjetos = propostas.length;
  const pareceresEsperados = totalProjetos * 2;

  let totalPareceresConcluidos = 0;
  let projetosComBancaCompleta = 0; // 2/2
  let projetosParciais = 0; // 1/2
  let projetosPendentes = 0; // 0/2
  let projetosDivergentes = 0; // > 2.00 pontos de diferença

  let somaEtapa2Merito = 0;
  let countEtapa2Avaliados = 0;

  let countH5Beneficiados = 0;
  let countScopusBeneficiados = 0;

  // Cursos de Graduação (Edital PIC-UNIG / Anexo IV)
  const cursoCounts: Record<string, number> = {};

  propostas.forEach((p) => {
    const numPareceres = p.avaliacoesCount || p.avaliacoes?.length || 0;
    totalPareceresConcluidos += numPareceres;

    if (numPareceres >= 2) {
      projetosComBancaCompleta++;
    } else if (numPareceres === 1) {
      projetosParciais++;
    } else {
      projetosPendentes++;
    }

    if (p.calculo?.divergenciaDetectada) {
      projetosDivergentes++;
    }

    if (p.calculo?.mediaEtapa2Merito) {
      somaEtapa2Merito += parseFloat(p.calculo.mediaEtapa2Merito);
      countEtapa2Avaliados++;
    }

    if (p.orientador?.regraMaiorBeneficioTipo === 'H5') {
      countH5Beneficiados++;
    } else if (p.orientador?.regraMaiorBeneficioTipo === 'Scopus') {
      countScopusBeneficiados++;
    }

    const cursoNome = normalizarNomeCurso(p.discenteCurso);
    cursoCounts[cursoNome] = (cursoCounts[cursoNome] || 0) + 1;
  });

  const mediaMeritoGeral = countEtapa2Avaliados > 0 ? (somaEtapa2Merito / countEtapa2Avaliados).toFixed(2) : '5.30';
  const taxaConclusaoPercentual = pareceresEsperados > 0 ? Math.round((totalPareceresConcluidos / pareceresEsperados) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas Institucional */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003860] to-[#001D33] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#001D33]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edital Ativo: PIC-UNIG 2027/2028</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Painel de Gestão da Iniciação Científica
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Sistema de Governança Acadêmica da UNIG com módulo AVALIAR HUMANO + IA (Pareceristas Titulares e Inteligência Artificial Gemini 3.8 Flash para análise preliminar de conformidade) e motor algorítmico da Regra do Maior Benefício (H5 vs. Scopus).
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-quick-open-relatorios"
              onClick={() => onNavigateTab('relatorios')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Relatórios &amp; Auditoria</span>
            </button>
            <button
              id="btn-quick-new-submission"
              onClick={() => onNavigateTab('submissao')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Submeter Projeto</span>
            </button>
            <button
              id="btn-quick-open-banca"
              onClick={() => onNavigateTab('banca')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>AVALIAR HUMANO + IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador Visual do Progresso: Avaliar Humano + IA */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Progresso Global: AVALIAR HUMANO + IA</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada proposta recebe 2 pareceristas humanos independentes complementados pelo diagnóstico preliminar por IA Gemini 3.8 Flash.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-[#002B49]">{taxaConclusaoPercentual}%</span>
            <span className="text-xs text-slate-500">
              ({totalPareceresConcluidos} de {pareceresEsperados} pareceres)
            </span>
          </div>
        </div>

        {/* Barra de Progresso Segmentada */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${(projetosComBancaCompleta / (totalProjetos || 1)) * 100}%` }}
              title={`2/2 Concluídos: ${projetosComBancaCompleta} projetos`}
            />
            <div
              className="bg-amber-400 transition-all duration-500"
              style={{ width: `${(projetosParciais / (totalProjetos || 1)) * 100}%` }}
              title={`1/2 Parciais: ${projetosParciais} projetos`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">{projetosComBancaCompleta} projetos</p>
                <p className="text-[11px] text-slate-500">Banca Completa (2/2)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">{projetosParciais} projetos</p>
                <p className="text-[11px] text-slate-500">Parcial (1/2 Parecer)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-slate-200 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-900">{projetosPendentes} projetos</p>
                <p className="text-[11px] text-slate-500">Pendente (0/2 Pareceres)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-700">{projetosDivergentes} divergência(s)</p>
                <p className="text-[11px] text-slate-500">Diferença &gt; 2.00 pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Divergência se existir */}
        {projetosDivergentes > 0 && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-rose-900">
                Atenção: {projetosDivergentes} proposta(s) com divergência de notas superior a 2.00 pontos!
              </p>
              <p className="text-rose-700 mt-0.5">
                Conforme o Edital PIC-UNIG 2027, notas com discrepância maior que 2.00 pontos requerem convocação de 3º parecerista (Árbitro) pela Coordenação de Pesquisa.
              </p>
              <button
                onClick={() => onNavigateTab('banca')}
                className="mt-2 text-rose-900 underline font-semibold hover:text-rose-950 inline-flex items-center space-x-1"
              >
                <span>Examinar caso divergente no Workspace da Banca</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 100 Bolsas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cotas do Edital</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">100 Bolsas</div>
            <p className="text-xs text-slate-500 mt-1">
              60 Ampla Concorrência + 40 Ações Afirmativas
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>60% AC</span>
            <span>40% AF (PPI / Pública)</span>
          </div>
        </div>

        {/* Card 2: Mérito Técnico Etapa 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Média Mérito (Etapa 2)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{mediaMeritoGeral} <span className="text-xs font-normal text-slate-500">/ 6.00</span></div>
            <p className="text-xs text-slate-500 mt-1">
              Avaliação cega de 9 critérios regimentais
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Nota mínima de corte: 3.50</span>
          </div>
        </div>

        {/* Card 3: Regra do Maior Benefício */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Regra do Maior Benefício</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              H5 ({countH5Beneficiados}) vs. Scopus ({countScopusBeneficiados})
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Docentes pontuados pelo melhor indicador
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Automático pelo algoritmo UNIG</span>
          </div>
        </div>

        {/* Card 4: Suporte Gemini 3.8 Flash */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Suporte IA Gemini 3.8</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">1º Momento</div>
            <p className="text-xs text-slate-500 mt-1">
              Conformidade, ODS e viabilidade técnica
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-medium">
            <span>Avaliador humano soberano</span>
          </div>
        </div>
      </div>

      {/* Distribuição por Cursos de Graduação e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classificação por Curso de Graduação (Edital PIC-UNIG) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Classificação de Projetos por Curso de Graduação</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Conforme Relação Oficial de Cursos de Graduação da UNIG (Anexo IV do Edital PIC-UNIG)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('projetos')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
            >
              <span>Ver todos os projetos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(cursoCounts).map(([cursoNome, count]) => {
              const perc = Math.round((count / (totalProjetos || 1)) * 100);
              const meta = getCursoMeta(cursoNome);
              return (
                <div
                  key={cursoNome}
                  onClick={() => onNavigateTab('projetos', cursoNome)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/70 transition-all cursor-pointer space-y-1.5"
                  title={`Clique para ver as propostas do curso ${cursoNome}`}
                >
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${meta.bgTag} ${meta.corTag} ${meta.borderTag}`}>
                        {meta.grau}
                      </span>
                      <span className="font-bold text-slate-900">{cursoNome}</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">({meta.campus})</span>
                    </div>
                    <span className="text-slate-600 font-semibold text-xs">
                      {count} projeto(s) ({perc}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#002B49] h-full rounded-full transition-all" style={{ width: `${perc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo de Custódia e Integridade LGPD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Custódia Documental &amp; LGPD</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Todos os arquivos submetidos possuem Hash SHA-256 gerado no momento do envio e armazenamento protegido em Cloud Storage. Acesso restrito a links assinados com auditoria contínua.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Criptografia de Hash:</span>
                <span className="font-mono font-semibold text-slate-800">SHA-256</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Anonimização na Banca:</span>
                <span className="font-semibold text-emerald-600">Ativa (Duplo-Cega)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Armazenamento Cloud:</span>
                <span className="font-semibold text-blue-600">Google Cloud SQL + Storage</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('auditoria')}
            className="mt-4 w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors text-center"
          >
            Acessar Livro de Auditoria Digital
          </button>
        </div>
      </div>
    </div>
  );
};
