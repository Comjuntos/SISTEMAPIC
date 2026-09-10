import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Microscope,
  Sparkles,
  Award,
  Scale,
  FileCheck2,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock,
  Compass,
  Cpu,
  UserCheck,
  FileText,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Proposta, AvaliacaoItem } from '../types/index.ts';

interface TimelineAvaliacaoBancaProps {
  proposta: Proposta;
  activePareceristaTab: 1 | 2 | 'consolidado';
  onSelectTab: (tab: 1 | 2 | 'consolidado') => void;
  onScrollToForm?: () => void;
  onReanalisarIa?: () => void;
  isReanalysing?: boolean;
}

interface EtapaTimeline {
  id: number;
  titulo: string;
  subtitulo: string;
  descricao: string;
  fase: string;
  icone: React.ElementType;
  corPrimaria: string;
  corBg: string;
  corBorda: string;
  status: 'concluido' | 'em_andamento' | 'pendente' | 'divergencia';
  statusTexto: string;
  detalhes: {
    rotulo: string;
    valor: string;
  }[];
  dicaRegimental: string;
  acaoTexto?: string;
  onAcao?: () => void;
}

export const TimelineAvaliacaoBanca: React.FC<TimelineAvaliacaoBancaProps> = ({
  proposta,
  activePareceristaTab,
  onSelectTab,
  onScrollToForm,
  onReanalisarIa,
  isReanalysing = false,
}) => {
  const [etapaSelecionada, setEtapaSelecionada] = useState<number>(4);
  const [modoExpandido, setModoExpandido] = useState<boolean>(false);
  const [tempoSegundos, setTempoSegundos] = useState<number>(142);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Cronômetro da telemetria de dedicação pericial
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTempoSegundos((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatarTempo = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const aval1 = proposta.avaliacoes?.find((a: any) => a.ordemParecerista === 1 || a.numeroParecerista === 1);
  const aval2 = proposta.avaliacoes?.find((a: any) => a.ordemParecerista === 2 || a.numeroParecerista === 2);
  const nota1 = aval1?.notaMeritoTotal != null ? parseFloat(String(aval1.notaMeritoTotal)) : null;
  const nota2 = aval2?.notaMeritoTotal != null ? parseFloat(String(aval2.notaMeritoTotal)) : null;

  const diferenca =
    nota1 !== null && !isNaN(nota1) && nota2 !== null && !isNaN(nota2)
      ? Math.abs(nota1 - nota2)
      : null;
  const isDivergente = diferenca !== null && diferenca > 2.0;

  const scoreMetodo =
    proposta.scoreMetodologico != null
      ? parseFloat(String(proposta.scoreMetodologico)) || 7.5
      : 7.5;

  const rawNotaIa = proposta.analiseIa?.pontuacaoEstimada;
  const notaIa =
    rawNotaIa != null
      ? parseFloat(String(rawNotaIa)) || 5.2
      : 5.2;

  // Montagem das 6 Etapas da Linha do Tempo
  const etapas: EtapaTimeline[] = [
    {
      id: 1,
      titulo: 'Compliance Ético & Sigilo',
      subtitulo: 'Protocolo Duplo-Cego',
      descricao:
        'Auditoria prévia de conflito de interesses. Identidade dos proponentes (orientador e bolsista) é criptografada e ocultada do corpo de avaliadores.',
      fase: 'Etapa 1',
      icone: ShieldCheck,
      corPrimaria: 'text-emerald-700',
      corBg: 'bg-emerald-50',
      corBorda: 'border-emerald-200',
      status: 'concluido',
      statusTexto: 'Sigilo Certificado (LGPD)',
      detalhes: [
        { rotulo: 'Auditoria Ética', valor: 'Sem parentesco / coautoria' },
        { rotulo: 'Anonimização', valor: 'Chave SHA-256 ativa' },
        { rotulo: 'Edital Vinculado', valor: 'PIC-UNIG 2027 (Art. 9º)' },
      ],
      dicaRegimental:
        'O avaliador não pode pertencer ao mesmo grupo de pesquisa do orientador nem ter vínculo de consanguinidade até 3º grau.',
    },
    {
      id: 2,
      titulo: 'Dossiê Científico & Métodos',
      subtitulo: 'Rigor do Delineamento',
      descricao:
        'Inspeção do delineamento amostral, nível na pirâmide de evidências e plano de trabalho do discente.',
      fase: 'Etapa 2',
      icone: Microscope,
      corPrimaria: 'text-blue-700',
      corBg: 'bg-blue-50',
      corBorda: 'border-blue-200',
      status: 'concluido',
      statusTexto: `Score Metodológico: ${scoreMetodo.toFixed(2)}/10`,
      detalhes: [
        { rotulo: 'Abordagem', valor: proposta.metodoTipo || 'Quantitativo' },
        { rotulo: 'Delineamento', valor: proposta.metodoDesenho || 'Ensaio Clínico' },
        { rotulo: 'Amostra (N)', valor: `${proposta.metodoTamanhoAmostra || 50} participantes` },
      ],
      dicaRegimental:
        'A clareza dos métodos é critério eliminatório: propostas sem viabilidade de execução no prazo de 12 meses são desclassificadas.',
    },
    {
      id: 3,
      titulo: 'Diagnóstico IA Gemini 3.8',
      subtitulo: '1º Momento: Análise Auxiliar',
      descricao:
        'Varredura inteligente de aderência aos 17 Objetivos de Desenvolvimento Sustentável (ODS/ONU), consistência do cronograma e ausência de inconformidades estruturais.',
      fase: 'Etapa 3',
      icone: Sparkles,
      corPrimaria: 'text-purple-700',
      corBg: 'bg-purple-50',
      corBorda: 'border-purple-200',
      status: proposta.analiseIa ? 'concluido' : 'em_andamento',
      statusTexto: `Estimativa IA: ${notaIa.toFixed(2)}/6.00`,
      detalhes: [
        { rotulo: 'Motor Cognitivo', valor: 'Gemini 3.8 Flash' },
        { rotulo: 'Aderência Edital', valor: 'Alta conformidade regimental' },
        { rotulo: 'Caráter', valor: 'Consultivo não-vinculante' },
      ],
      dicaRegimental:
        'A análise por IA serve como bússola de conformidade. O parecerista humano possui soberania constitucional sobre a nota e o parecer consubstanciado.',
      acaoTexto: 'Reanalisar via IA',
      onAcao: onReanalisarIa,
    },
    {
      id: 4,
      titulo: 'Julgamento Humano Soberano',
      subtitulo: 'Barema Regimental (9 Quesitos)',
      descricao:
        'Pontuação criteriosa nos 9 quesitos do Barema Oficial (Anexo II - máx 6.00 pts) e redação obrigatória do Parecer Consubstanciado.',
      fase: 'Etapa 4 (Principal)',
      icone: Award,
      corPrimaria: 'text-amber-700',
      corBg: 'bg-amber-50',
      corBorda: 'border-amber-200',
      status:
        activePareceristaTab === 1 && aval1
          ? 'concluido'
          : activePareceristaTab === 2 && aval2
          ? 'concluido'
          : 'em_andamento',
      statusTexto:
        activePareceristaTab === 1
          ? aval1
            ? `P1 Concluído (${nota1?.toFixed(2)} pts)`
            : 'P1 Em Preenchimento'
          : aval2
          ? `P2 Concluído (${nota2?.toFixed(2)} pts)`
          : 'P2 Em Preenchimento',
      detalhes: [
        { rotulo: '1º Parecerista', valor: nota1 !== null ? `${nota1.toFixed(2)} pts` : 'Pendente' },
        { rotulo: '2º Parecerista', valor: nota2 !== null ? `${nota2.toFixed(2)} pts` : 'Pendente' },
        { rotulo: 'Exigência', valor: 'Justificativa textual mínima' },
      ],
      dicaRegimental:
        'O parecer deve conter apreciação sobre originalidade, coerência do plano de trabalho discente e impacto institucional.',
      acaoTexto: 'Ir para Formulário',
      onAcao: onScrollToForm,
    },
    {
      id: 5,
      titulo: 'Trava de Divergência & Consenso',
      subtitulo: 'Arbitragem Regimental',
      descricao:
        'Algoritmo matemático de verificação da tolerância regimental de discrepância entre os 2 pareceristas independentes (Δ ≤ 2.00 pts).',
      fase: 'Etapa 5',
      icone: Scale,
      corPrimaria: isDivergente ? 'text-rose-700' : 'text-indigo-700',
      corBg: isDivergente ? 'bg-rose-50' : 'bg-indigo-50',
      corBorda: isDivergente ? 'border-rose-200' : 'border-indigo-200',
      status: isDivergente
        ? 'divergencia'
        : nota1 !== null && nota2 !== null
        ? 'concluido'
        : 'pendente',
      statusTexto: isDivergente
        ? `Divergência: Δ ${diferenca?.toFixed(2)} pts (> 2.0)`
        : diferenca !== null
        ? `Convergente: Δ ${diferenca.toFixed(2)} pts`
        : 'Aguardando 2º Parecerista',
      detalhes: [
        { rotulo: 'Tolerância Máxima', valor: '2.00 pontos regimentais' },
        {
          rotulo: 'Delta Atual',
          valor: diferenca !== null ? `${diferenca.toFixed(2)} pts` : 'Em apuração',
        },
        {
          rotulo: 'Encaminhamento',
          valor: isDivergente ? '3º Parecerista (Árbitro)' : 'Média Homologada',
        },
      ],
      dicaRegimental:
        'Em caso de diferença superior a 2.00 pontos, um terceiro avaliador é sorteado automaticamente para proferir voto de desempate definitivo.',
      acaoTexto: 'Ver Consolidação',
      onAcao: () => onSelectTab('consolidado'),
    },
    {
      id: 6,
      titulo: 'Laudo Pericial & Custódia',
      subtitulo: 'Homologação e Certificação',
      descricao:
        'Emissão do laudo técnico pericial consolidado com assinatura digital, carimbo temporal irrefutável e envio para o ranking de bolsas.',
      fase: 'Etapa 6',
      icone: FileCheck2,
      corPrimaria: 'text-teal-700',
      corBg: 'bg-teal-50',
      corBorda: 'border-teal-200',
      status:
        nota1 !== null && nota2 !== null && !isDivergente
          ? 'concluido'
          : 'pendente',
      statusTexto:
        nota1 !== null && nota2 !== null && !isDivergente
          ? 'Laudo Aprovado p/ Ranqueamento'
          : 'Aguardando Homologação',
      detalhes: [
        { rotulo: 'Certificação', valor: 'Assinatura Eletrônica UNIG' },
        { rotulo: 'Formatos', valor: 'PDF/A Auditável + Hash' },
        { rotulo: 'Destino', valor: 'Câmara de Pesquisa & Pós' },
      ],
      dicaRegimental:
        'O laudo compõe o dossiê da proposta e é disponibilizado de forma anonimizada ao proponente como recurso de feedback formativo.',
    },
  ];

  const etapaAtiva = etapas.find((e) => e.id === etapaSelecionada) || etapas[3];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#002B49] to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 overflow-hidden relative">
      {/* Luzes decorativas sutis no fundo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* CABEÇALHO DA TIMELINE */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>Inédito no Brasil</span>
            </span>
            <span className="text-xs text-blue-300 font-semibold tracking-wide">
              Módulo AVALIAR HUMANO + IA • Edital PIC-UNIG 2027
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight flex items-center space-x-2">
            <span>Jornada Pericial do Avaliador</span>
            <span className="text-sm font-normal text-slate-400 hidden sm:inline">
              (Linha do Tempo Regimental)
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Acompanhe em tempo real cada estação do processo duplo-cego: da checagem ética de conflito de interesses à emissão do laudo pericial auditável.
          </p>
        </div>

        {/* CONTROLES DE TELEMETRIA E MODO */}
        <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
          {/* Cronômetro de Telemetria Pericial */}
          <div
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-2xl shadow-inner cursor-pointer hover:bg-slate-800 transition-colors"
            title="Tempo de leitura e dedicação pericial nesta proposta"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
          >
            <Clock className={`w-4 h-4 text-amber-400 ${isTimerRunning ? 'animate-spin' : ''}`} />
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold leading-none">
                Tempo de Avaliação
              </div>
              <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                {formatarTempo(tempoSegundos)}
              </div>
            </div>
          </div>

          {/* Alternar Modo Expandido */}
          <button
            type="button"
            onClick={() => setModoExpandido(!modoExpandido)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            {modoExpandido ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Visual Compacto</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Painel 360°</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STEPPER HORIZONTAL DA TIMELINE */}
      <div className="relative z-10 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {etapas.map((etapa, idx) => {
            const Icone = etapa.icone;
            const isAtivo = etapa.id === etapaSelecionada;

            let badgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
            let dotColor = 'bg-slate-600';

            if (etapa.status === 'concluido') {
              badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              dotColor = 'bg-emerald-400';
            } else if (etapa.status === 'em_andamento') {
              badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/40';
              dotColor = 'bg-amber-400 animate-ping';
            } else if (etapa.status === 'divergencia') {
              badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/50';
              dotColor = 'bg-rose-500 animate-pulse';
            }

            return (
              <button
                key={etapa.id}
                type="button"
                onClick={() => setEtapaSelecionada(etapa.id)}
                className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
                  isAtivo
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border-amber-400/90 shadow-lg ring-2 ring-amber-400/30'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800/90 hover:border-slate-600'
                }`}
              >
                {/* Linha de progresso no topo */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                    isAtivo
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                      : etapa.status === 'concluido'
                      ? 'bg-emerald-500'
                      : etapa.status === 'divergencia'
                      ? 'bg-rose-500'
                      : 'bg-slate-700'
                  }`}
                />

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      0{etapa.id}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full relative">
                      <span className={`w-1.5 h-1.5 rounded-full absolute ${dotColor}`} />
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isAtivo
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : etapa.status === 'concluido'
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Icone className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {etapa.titulo}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {etapa.subtitulo}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border truncate ${badgeClass}`}
                  >
                    {etapa.statusTexto}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALHAMENTO DA ETAPA SELECIONADA */}
      <div className="relative z-10 bg-slate-800/90 rounded-2xl border border-slate-700 p-5 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Coluna 1: Informações e Descrição da Etapa */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Fase {etapaAtiva.id} de 06 • {etapaAtiva.fase}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  etapaAtiva.status === 'concluido'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : etapaAtiva.status === 'divergencia'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {etapaAtiva.statusTexto}
              </span>
            </div>

            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <span>{etapaAtiva.titulo}</span>
              <span className="text-slate-400 font-normal text-sm">
                — {etapaAtiva.subtitulo}
              </span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {etapaAtiva.descricao}
            </p>

            {/* Caixa de Dica Regimental do Edital PIC-UNIG */}
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs text-blue-200 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-300">Normativa Regimental UNIG: </span>
                <span>{etapaAtiva.dicaRegimental}</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Métricas Rápidas e Ação */}
          <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-700 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Métricas &amp; Evidências de Auditoria
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {etapaAtiva.detalhes.map((det, dIdx) => (
                <div
                  key={dIdx}
                  className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/80"
                >
                  <div className="text-[10px] text-slate-400 font-medium">{det.rotulo}</div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate" title={det.valor}>
                    {det.valor}
                  </div>
                </div>
              ))}
            </div>

            {/* Botão de Ação Rápida contextual */}
            <div className="flex items-center space-x-3 pt-2">
              {etapaAtiva.acaoTexto && etapaAtiva.onAcao && (
                <button
                  type="button"
                  onClick={etapaAtiva.onAcao}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{etapaAtiva.acaoTexto}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setEtapaSelecionada((prev) => (prev < 6 ? prev + 1 : 1))
                }
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                title="Avançar para a próxima etapa"
              >
                Próxima Etapa →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL EXPANDIDO: TRIANGULAÇÃO DA BANCA (HUMANO 1 + HUMANO 2 + IA GEMINI) */}
      {modoExpandido && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Radar de Harmonia Pericial (Triangulação Humano 1 • Humano 2 • IA Gemini)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Tolerância do Edital: Δ ≤ 2.00 pontos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lente 1: 1º Parecerista Humano */}
            <div
              onClick={() => onSelectTab(1)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activePareceristaTab === 1
                  ? 'bg-blue-900/40 border-blue-400 shadow-md ring-2 ring-blue-400/20'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>1º Parecerista Humano</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Barema Anexo II</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {nota1 !== null ? `${nota1.toFixed(2)}` : '--'}
                <span className="text-xs font-normal text-slate-400"> / 6.00</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 line-clamp-2">
                {aval1?.parecerConsubstanciado || 'Parecer consubstanciado em redação regimental...'}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-blue-300">
                  {aval1 ? '✓ Parecer Concluído' : '⏳ Em Preenchimento'}
                </span>
              </div>
            </div>

            {/* Lente 2: 2º Parecerista Humano */}
            <div
              onClick={() => onSelectTab(2)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activePareceristaTab === 2
                  ? 'bg-blue-900/40 border-blue-400 shadow-md ring-2 ring-blue-400/20'
                  : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>2º Parecerista Humano</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Barema Anexo II</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {nota2 !== null ? `${nota2.toFixed(2)}` : '--'}
                <span className="text-xs font-normal text-slate-400"> / 6.00</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 line-clamp-2">
                {aval2?.parecerConsubstanciado || 'Aguardando avaliação do segundo parecerista...'}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-blue-300">
                  {aval2 ? '✓ Parecer Concluído' : '⏳ Em Preenchimento'}
                </span>
              </div>
            </div>

            {/* Lente 3: Diagnóstico IA Gemini 3.8 Flash */}
            <div className="p-4 rounded-2xl border bg-purple-950/40 border-purple-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>IA Gemini 3.8 Flash</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
                  Consultivo
                </span>
              </div>
              <div className="text-2xl font-black text-purple-200 mt-2">
                {notaIa.toFixed(2)}
                <span className="text-xs font-normal text-purple-400"> / 6.00</span>
              </div>
              <p className="text-[11px] text-purple-200/80 mt-2 line-clamp-2">
                {proposta.analiseIa?.parecerGeral ||
                  'Diagnóstico preliminar apontou conformidade metodológica e alinhamento aos ODS da ONU.'}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <span className="text-purple-400">Aderência aos ODS:</span>
                <span className="font-bold text-purple-300">Excelente</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
