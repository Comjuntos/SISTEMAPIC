import React, { useState, useEffect } from 'react';
import { Proposta, Usuario, AvaliacaoItem, DesenhoPesquisa } from '../types/index.ts';
import { exportarParecerIndividualPDF } from '../utils/pdfExport.ts';
import { HIERARQUIA_DESENHOS } from '../utils/methodology.ts';
import { TimelineAvaliacaoBanca } from './TimelineAvaliacaoBanca.tsx';
import {
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  RefreshCw,
  Info,
  Scale,
  FileText,
  UserCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  Microscope,
  BookOpen,
} from 'lucide-react';

interface WorkspaceBancaProps {
  propostas: Proposta[];
  currentUser: Usuario;
  selectedProposta: Proposta | null;
  onSelectProposta: (p: Proposta) => void;
  onSaveAvaliacao: (data: any) => Promise<void>;
  onReanalisarGemini: (propostaId: number) => Promise<void>;
}

export const WorkspaceBanca: React.FC<WorkspaceBancaProps> = ({
  propostas,
  currentUser,
  selectedProposta,
  onSelectProposta,
  onSaveAvaliacao,
  onReanalisarGemini,
}) => {
  const current = selectedProposta || propostas[0] || null;

  // Aba selecionada: 1 (Parecerista 1), 2 (Parecerista 2) ou 'consolidado' (Média Consolidada)
  const [activePareceristaTab, setActivePareceristaTab] = useState<number | 'consolidado'>(1);

  // Estados dos 9 critérios regimentais (Etapa 2 - máx 6.00)
  const [notaTitulo, setNotaTitulo] = useState<number>(0.45);
  const [notaIntroducao, setNotaIntroducao] = useState<number>(0.65);
  const [notaObjetivos, setNotaObjetivos] = useState<number>(0.70);
  const [notaJustificativa, setNotaJustificativa] = useState<number>(0.45);
  const [notaMetodologia, setNotaMetodologia] = useState<number>(0.85);
  const [notaViabilidade, setNotaViabilidade] = useState<number>(0.65);
  const [notaCronograma, setNotaCronograma] = useState<number>(0.40);
  const [notaPlanoDiscente, setNotaPlanoDiscente] = useState<number>(0.65);
  const [notaInsercaoSocial, setNotaInsercaoSocial] = useState<number>(0.40);

  const [parecerConsubstanciado, setParecerConsubstanciado] = useState<string>('');
  const [recomendacao, setRecomendacao] = useState<string>('Recomendado para Bolsa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReanalysing, setIsReanalysing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [showDossie, setShowDossie] = useState<boolean>(true);

  // Quando trocar a proposta ou aba de parecerista, preencher com os valores existentes
  useEffect(() => {
    if (!current) return;
    const ordem = typeof activePareceristaTab === 'number' ? activePareceristaTab : 1;
    const avalExistente = current.avaliacoes?.find((a) => a.ordemParecerista === ordem);

    if (avalExistente) {
      setNotaTitulo(parseFloat(avalExistente.notaTitulo) || 0);
      setNotaIntroducao(parseFloat(avalExistente.notaIntroducao) || 0);
      setNotaObjetivos(parseFloat(avalExistente.notaObjetivos) || 0);
      setNotaJustificativa(parseFloat(avalExistente.notaJustificativa) || 0);
      setNotaMetodologia(parseFloat(avalExistente.notaMetodologia) || 0);
      setNotaViabilidade(parseFloat(avalExistente.notaViabilidade) || 0);
      setNotaCronograma(parseFloat(avalExistente.notaCronograma) || 0);
      setNotaPlanoDiscente(parseFloat(avalExistente.notaPlanoDiscente) || 0);
      setNotaInsercaoSocial(parseFloat(avalExistente.notaInsercaoSocial) || 0);
      setParecerConsubstanciado(avalExistente.parecerConsubstanciado || '');
      setRecomendacao(avalExistente.recomendacao || 'Recomendado para Bolsa');
    } else {
      // Valores padrão razoáveis para nova avaliação
      setNotaTitulo(0.40);
      setNotaIntroducao(0.60);
      setNotaObjetivos(0.65);
      setNotaJustificativa(0.40);
      setNotaMetodologia(0.80);
      setNotaViabilidade(0.60);
      setNotaCronograma(0.40);
      setNotaPlanoDiscente(0.60);
      setNotaInsercaoSocial(0.40);
      setParecerConsubstanciado('');
      setRecomendacao('Recomendado para Bolsa');
    }
    setFeedbackSuccess(null);
  }, [current?.id, activePareceristaTab]);

  if (!current) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-700">Nenhum projeto disponível para avaliação</p>
      </div>
    );
  }

  // Somatório dos 9 critérios humanos
  const totalEtapa2Humano = Number(
    (
      notaTitulo +
      notaIntroducao +
      notaObjetivos +
      notaJustificativa +
      notaMetodologia +
      notaViabilidade +
      notaCronograma +
      notaPlanoDiscente +
      notaInsercaoSocial
    ).toFixed(2)
  );

  // Avaliações existentes dos pareceristas 1 e 2
  const aval1 = current.avaliacoes?.find((a) => a.ordemParecerista === 1);
  const aval2 = current.avaliacoes?.find((a) => a.ordemParecerista === 2);

  const nota1 = aval1 ? parseFloat(aval1.notaMeritoTotal) : null;
  const nota2 = aval2 ? parseFloat(aval2.notaMeritoTotal) : null;

  let diferencaNotas: number | null = null;
  let isDivergente = false;
  let mediaBanca: number | null = null;

  if (nota1 !== null && nota2 !== null) {
    diferencaNotas = Math.abs(nota1 - nota2);
    isDivergente = diferencaNotas > 2.0;
    mediaBanca = (nota1 + nota2) / 2;
  }

  const handleSubmitParecer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parecerConsubstanciado.trim()) {
      alert('Por favor, redija o parecer consubstanciado com a justificativa técnica.');
      return;
    }

    const ordem = typeof activePareceristaTab === 'number' ? activePareceristaTab : 1;
    const avaliadorId = ordem === 1 ? (current.distribuicao?.avaliador1Id || 1) : (current.distribuicao?.avaliador2Id || 2);

    try {
      setIsSubmitting(true);
      await onSaveAvaliacao({
        propostaId: current.id,
        avaliadorId,
        ordemParecerista: ordem,
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
      });
      setFeedbackSuccess(`Parecer do Avaliador ${ordem} homologado com sucesso no comitê!`);
    } catch (err: any) {
      alert('Erro ao enviar avaliação: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunGemini = async () => {
    try {
      setIsReanalysing(true);
      await onReanalisarGemini(current.id);
    } catch (err: any) {
      alert('Erro ao analisar com Gemini: ' + err.message);
    } finally {
      setIsReanalysing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Orientativo Conforme Papel do Edital */}
      {currentUser.papel === 'orientador' ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-950 flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-900">
              Modo Somente Leitura — Perfil de Docente Orientador ({currentUser.nome})
            </p>
            <p className="text-xs text-amber-800">
              Conforme as diretrizes do Edital PIC-UNIG, <strong>aos professores cabe somente enviar o projeto e consultar editais/anexos</strong>. O lançamento de pareceres é restrito aos pareceristas da banca para garantir o sigilo duplo-cego e a imparcialidade regimental.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">
                Parecerista Ativo: {currentUser.nome} ({currentUser.papel === 'avaliador' ? 'Banca Titular' : 'Gestão / Coordenação'})
              </p>
              <p className="text-xs text-blue-800">
                Aos avaliadores cabe <strong>avaliar rigorosamente as propostas</strong> e <strong>consultar critérios do edital</strong>. Avalie os 9 critérios metodológicos com apoio da IA Gemini.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 shrink-0 shadow-2xs">
            Missão Regimental Ativa
          </span>
        </div>
      )}

      {/* Seletor de Projeto em Avaliação e Resumo do Anonimato */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                  AVALIAR HUMANO + IA
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Julgamento Ético: Pareceristas Titulares (Humano) + IA Gemini 3.8 Flash
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Workspace de Avaliação do Projeto #PIC-{String(current.id).padStart(3, '0')}
              </h2>
            </div>
          </div>

          {/* Seletor Dropdown de Proposta e Exportação PDF */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-600">Projeto:</label>
              <select
                value={current.id}
                onChange={(e) => {
                  const found = propostas.find((p) => p.id === Number(e.target.value));
                  if (found) onSelectProposta(found);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[260px] truncate"
              >
                {propostas.map((p) => (
                  <option key={p.id} value={p.id}>
                    #PIC-{String(p.id).padStart(3, '0')}: {p.titulo.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-exportar-laudo-banca"
              onClick={() => exportarParecerIndividualPDF(current)}
              className="px-3 py-1.5 bg-[#002B49] hover:bg-[#003d68] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              title="Exportar Laudo Técnico Regimental em PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Laudo em PDF</span>
            </button>
          </div>
        </div>

        {/* Banner de Anonimização Garantida */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
          <div className="flex items-center space-x-2 text-slate-700">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Salvaguarda Ética:</strong> Identidade de docente orientador e aluno discente ocultadas para garantir imparcialidade absoluta no julgamento de mérito científico.
            </span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-500 flex-shrink-0">
            <span>Hash SHA-256:</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
              {current.hashSha256.substring(0, 12)}...
            </span>
          </div>
        </div>

        {/* Bloco Retrátil: Dossiê Anônimo & Delineamento Metodológico */}
        <div className="border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={() => setShowDossie(!showDossie)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-blue-700 py-1 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Dossiê Científico e Delineamento Metodológico da Proposta Submetida</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                {current.discenteCurso} • {current.subarea}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <span className="text-[11px]">{showDossie ? 'Ocultar Dossiê' : 'Visualizar Texto & Métodos'}</span>
              {showDossie ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showDossie && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-100 text-xs">
              {/* Título do Projeto */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Título da Proposta de Pesquisa:
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{current.titulo}</p>
              </div>

              {/* Destaque Metodológico do Projeto */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                    <Microscope className="w-4 h-4 text-emerald-700" />
                    <span>Delineamento Metodológico &amp; Critérios de Classificação</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    Score Metodológico: {current.calculo?.scoreMetodologico || current.metodoScoreTotal || '0.00'} / 10.00 pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Desenho da Pesquisa</span>
                    <span className="font-bold text-slate-900">{current.metodoDesenho || 'Não informado'}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                      {current.metodoDesenho === 'Ensaio Clínico Randomizado' ? '1º Ordem • 5.00 pts' :
                       current.metodoDesenho === 'Ensaio de Roda / Estudo de coorte' ? '2º Ordem • 4.00 pts' :
                       current.metodoDesenho === 'Caso controle' ? '3º Ordem • 3.00 pts' :
                       current.metodoDesenho === 'Relato de caso' ? '4º Ordem • 2.00 pts' :
                       current.metodoDesenho === 'Estudo in vitro' ? '5º Ordem • 1.00 pt' : '--'}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Abordagem do Método</span>
                    <span className="font-bold text-slate-900">{current.metodoTipo || 'Não informado'}</span>
                    <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                      {current.metodoTipo === 'Quantitativo' ? '+2.00 pts (Inferencial)' :
                       current.metodoTipo === 'Qualitativo' ? '+1.75 pts (Descritivo)' : '--'}
                    </span>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-emerald-200/80">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Tamanho da Amostra (N)</span>
                    <span className="font-bold text-slate-900">N = {current.metodoTamanhoAmostra ?? '--'}</span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">
                      {(current.metodoTamanhoAmostra ?? 0) >= 200 ? '+3.00 pts (Robusta)' :
                       (current.metodoTamanhoAmostra ?? 0) >= 100 ? '+2.25 pts (Significativa)' :
                       (current.metodoTamanhoAmostra ?? 0) >= 30 ? '+1.50 pts (Moderada)' : '+0.75 pt (Piloto)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumo do Projeto */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Resumo da Proposta Submetida:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                  {current.resumo}
                </p>
                {current.palavrasChave && (
                  <p className="text-[11px] text-slate-500 italic">
                    Palavras-chave: {current.palavrasChave}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIMELINE INÉDITA & FANTÁSTICA DA JORNADA DO AVALIADOR */}
      <TimelineAvaliacaoBanca
        proposta={current}
        activePareceristaTab={activePareceristaTab as 1 | 2 | 'consolidado'}
        onSelectTab={(tab) => setActivePareceristaTab(tab)}
        onScrollToForm={() => {
          const el = document.getElementById('btn-submeter-parecer-banca');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onReanalisarIa={handleRunGemini}
        isReanalysing={isReanalysing}
      />

      {/* Abas Superiores: 1º Parecerista | 2º Parecerista | Média Consolidada */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          id="btn-tab-parecerista-1"
          onClick={() => setActivePareceristaTab(1)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activePareceristaTab === 1
              ? 'bg-[#002B49] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1º Parecerista {aval1 ? `(${aval1.notaMeritoTotal} pts)` : '(Pendente)'}</span>
        </button>

        <button
          id="btn-tab-parecerista-2"
          onClick={() => setActivePareceristaTab(2)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activePareceristaTab === 2
              ? 'bg-[#002B49] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>2º Parecerista {aval2 ? `(${aval2.notaMeritoTotal} pts)` : '(Pendente)'}</span>
        </button>

        <button
          id="btn-tab-consolidado"
          onClick={() => setActivePareceristaTab('consolidado')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activePareceristaTab === 'consolidado'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Média Consolidada da Banca {mediaBanca !== null ? `(${mediaBanca.toFixed(2)} pts)` : ''}</span>
        </button>
      </div>

      {/* Indicador de Convergência ou Alerta Crítico de Divergência */}
      {diferencaNotas !== null && (
        <div
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
            isDivergente
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            {isDivergente ? (
              <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {isDivergente ? 'Discrepância Regimental Detectada' : 'Convergência da Banca Homologada'}
              </div>
              <p className="text-xs mt-0.5">
                {isDivergente
                  ? `Diferença de ${diferencaNotas.toFixed(2)} pontos (> 2.00 pts) entre Parecerista 1 (${nota1?.toFixed(2)}) e Parecerista 2 (${nota2?.toFixed(2)}). Requer convocação de árbitro!`
                  : `Notas harmônicas com diferença de ${diferencaNotas.toFixed(2)} pts (<= 2.00). Média aritmética regimental: ${mediaBanca?.toFixed(2)} / 6.00.`}
              </p>
            </div>
          </div>

          <div className="text-right pl-4">
            <span className="text-xs font-semibold block text-slate-500">Média Etapa 2</span>
            <span className="text-xl font-black">{mediaBanca ? mediaBanca.toFixed(2) : '--'} / 6.00</span>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA SELECIONADA */}
      {activePareceristaTab === 'consolidado' ? (
        /* VISÃO CONSOLIDADA DA BANCA */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Consolidação e Arbitragem da Banca Dupla</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cálculo aritmético simples segundo o Edital PIC-UNIG 2027: (Nota Parecerista 1 + Nota Parecerista 2) / 2
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parecerista 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Parecerista 1</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {nota1 !== null ? `${nota1.toFixed(2)}` : 'Pendente'}
                <span className="text-xs font-normal text-slate-500"> / 6.00</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                {aval1?.parecerConsubstanciado || 'Aguardando submissão formal de parecer.'}
              </p>
              {aval1 && (
                <div className="mt-2 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                  {aval1.recomendacao}
                </div>
              )}
            </div>

            {/* Parecerista 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Parecerista 2</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {nota2 !== null ? `${nota2.toFixed(2)}` : 'Pendente'}
                <span className="text-xs font-normal text-slate-500"> / 6.00</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                {aval2?.parecerConsubstanciado || 'Aguardando submissão formal de parecer.'}
              </p>
              {aval2 && (
                <div className="mt-2 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                  {aval2.recomendacao}
                </div>
              )}
            </div>

            {/* Média Consolidada */}
            <div className={`p-4 rounded-xl border ${isDivergente ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
              <span className="text-xs font-bold uppercase text-slate-600">Média Consolidada</span>
              <div className="text-2xl font-black text-slate-950 mt-1">
                {mediaBanca !== null ? `${mediaBanca.toFixed(2)}` : 'Incompleto'}
                <span className="text-xs font-normal text-slate-600"> / 6.00</span>
              </div>
              <div className="mt-2 text-xs font-medium">
                {isDivergente ? (
                  <span className="text-rose-800 font-bold">⚠️ Convocado Árbitro (Divergência &gt; 2.0 pts)</span>
                ) : mediaBanca !== null ? (
                  <span className="text-emerald-800 font-bold">✓ Parecer Duplo Aprovado para Ranqueamento</span>
                ) : (
                  <span className="text-slate-500">Aguardando ambos os pareceristas</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LAYOUT DE 2 COLUNAS: LADO ESQUERDO (HUMANO SOBERANO) + LADO DIREITO (IA GEMINI) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LADO ESQUERDO: PREENCHIMENTO HUMANO SOBERANO (7 Colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Formulário Regimental do Parecerista {activePareceristaTab}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atribuição soberana de notas aos 9 critérios da Etapa 2 (máximo de 6.00 pontos).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Mérito</span>
                  <span className={`text-xl font-black ${totalEtapa2Humano >= 4.5 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {totalEtapa2Humano.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 6.00</span>
                  </span>
                </div>
              </div>

              {feedbackSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmitParecer} className="space-y-4">
                {/* 1. Título e Definição do Problema (máx 0.50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      1. Título e Definição do Problema (0.00 a 0.50 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaTitulo.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={notaTitulo}
                    onChange={(e) => setNotaTitulo(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 2. Introdução e Estado da Arte (máx 0.75) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      2. Introdução e Estado da Arte (0.00 a 0.75 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaIntroducao.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.75"
                    step="0.05"
                    value={notaIntroducao}
                    onChange={(e) => setNotaIntroducao(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 3. Objetivos e Hipóteses (máx 0.75) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      3. Objetivos e Hipóteses Científicas (0.00 a 0.75 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaObjetivos.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.75"
                    step="0.05"
                    value={notaObjetivos}
                    onChange={(e) => setNotaObjetivos(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 4. Justificativa e Relevância (máx 0.50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      4. Justificativa e Relevância Técnico-Científica (0.00 a 0.50 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaJustificativa.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={notaJustificativa}
                    onChange={(e) => setNotaJustificativa(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 5. Metodologia Científica (máx 1.00) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      5. Metodologia Científica e Delineamento (0.00 a 1.00 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaMetodologia.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.00"
                    step="0.05"
                    value={notaMetodologia}
                    onChange={(e) => setNotaMetodologia(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 6. Viabilidade Técnica (máx 0.75) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      6. Viabilidade Técnica e Infraestrutura (0.00 a 0.75 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaViabilidade.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.75"
                    step="0.05"
                    value={notaViabilidade}
                    onChange={(e) => setNotaViabilidade(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 7. Cronograma (máx 0.50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      7. Cronograma Físico-Financeiro (0.00 a 0.50 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaCronograma.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={notaCronograma}
                    onChange={(e) => setNotaCronograma(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 8. Plano de Trabalho Discente (máx 0.75) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      8. Plano de Trabalho do Discente (0.00 a 0.75 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaPlanoDiscente.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.75"
                    step="0.05"
                    value={notaPlanoDiscente}
                    onChange={(e) => setNotaPlanoDiscente(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* 9. Inserção Social e ODS (máx 0.50) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-800">
                      9. Inserção Social e ODS / Agenda 2030 (0.00 a 0.50 pt)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{notaInsercaoSocial.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.50"
                    step="0.05"
                    value={notaInsercaoSocial}
                    onChange={(e) => setNotaInsercaoSocial(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Recomendação Formal */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Recomendação Formal da Banca:
                  </label>
                  <select
                    value={recomendacao}
                    onChange={(e) => setRecomendacao(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Recomendado para Bolsa">Recomendado para Concessão de Bolsa</option>
                    <option value="Recomendado com Ressalvas">Recomendado com Ressalvas Técnicas</option>
                    <option value="Não Recomendado">Não Recomendado</option>
                  </select>
                </div>

                {/* Parecer Consubstanciado Obrigatório */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-800">
                      Parecer Consubstanciado (Justificativa Regimental):
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {parecerConsubstanciado.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Redija aqui o parecer técnico fundamentado sobre a proposta científica, apontando coerência metodológica, exequibilidade e contribuição científica..."
                    value={parecerConsubstanciado}
                    onChange={(e) => setParecerConsubstanciado(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
                    required
                  />
                </div>

                {/* Botão de Envio do Parecer */}
                <button
                  id="btn-submeter-parecer-banca"
                  type="submit"
                  disabled={isSubmitting || currentUser.papel === 'orientador'}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {currentUser.papel === 'orientador'
                      ? 'Lançamento Restrito a Pareceristas da Banca (Edital PIC)'
                      : isSubmitting
                      ? 'Homologando Parecer no Servidor...'
                      : `Homologar Parecer do Avaliador ${activePareceristaTab} (${totalEtapa2Humano.toFixed(2)} pts)`}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* LADO DIREITO: ANÁLISE INTELIGENTE AUXILIAR (GEMINI 3.8 FLASH) (5 Colunas) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white rounded-2xl border border-purple-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                      Análise IA Gemini 3.8 Flash
                    </h3>
                    <p className="text-[10px] text-purple-700">1º Momento: Diagnóstico Preliminar</p>
                  </div>
                </div>
                <button
                  onClick={handleRunGemini}
                  disabled={isReanalysing}
                  className="p-1.5 rounded-lg bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors text-xs flex items-center space-x-1"
                  title="Reanalisar proposta com o modelo Gemini"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReanalysing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Reanalisar</span>
                </button>
              </div>

              {/* Pontuação Estimada pela IA */}
              <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Pontuação Estimada IA</span>
                  <div className="text-xl font-black text-purple-900">
                    {current.analiseIa?.pontuacaoEstimada || '5.20'} <span className="text-xs font-normal text-slate-500">/ 6.00</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-purple-700 bg-purple-50 px-2 py-1 rounded font-mono">
                  {current.analiseIa?.modeloUsado || 'gemini-3.8-flash'}
                </div>
              </div>

              {/* Parecer Geral do Modelo */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <span>Parecer Geral de Conformidade:</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-purple-100">
                  {current.analiseIa?.parecerGeral ||
                    'A proposta atende rigorosamente às diretrizes do Edital PIC-UNIG 2027 com metodologia bem formulada.'}
                </p>
              </div>

              {/* Aderência ao Edital */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Aderência aos Objetivos e ODS:</h4>
                <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-purple-100">
                  {current.analiseIa?.aderenciaEdital || 'Excelente alinhamento aos eixos de pesquisa institucionais.'}
                </p>
              </div>

              {/* Viabilidade Técnica */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Viabilidade Técnica e Infraestrutura:</h4>
                <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-purple-100">
                  {current.analiseIa?.viabilidadeTecnica || 'Cronograma exequível no período de 12 meses.'}
                </p>
              </div>

              {/* Recomendações e Fragilidades Metodológicas */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Recomendações Práticas do Comitê IA:</h4>
                <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-purple-100">
                  {current.analiseIa?.recomendacoes || 'Acompanhamento periódico do plano discente.'}
                </p>
              </div>

              <div className="pt-1 text-[11px] text-slate-500 italic">
                * Nota regimental: A análise da IA é exclusivamente de caráter auxiliar consultivo. O parecerista humano detém soberania absoluta sobre a nota final e justificativa.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
