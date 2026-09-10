import React, { useState } from 'react';
import { Edital, Usuario, Proposta, EditalFaseCronograma } from '../types/index.ts';
import { exportarEditalCronogramaPDF } from '../utils/pdfExport.ts';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldAlert,
  ArrowRight,
  Plus,
  Edit3,
  Download,
  Building2,
  Zap,
  Users,
  Award,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
  Check,
  RefreshCw,
  Sliders,
  HelpCircle,
  Copy,
  Lock,
  BookOpen,
  CalendarPlus,
  SlidersHorizontal,
} from 'lucide-react';

interface GerenciadorEditaisProps {
  editais: Edital[];
  editalAtivo: Edital | null;
  propostas: Proposta[];
  currentUser: Usuario;
  onSelectEditalAtivo: (id: number) => Promise<void>;
  onCriarEdital: (dados: any) => Promise<void>;
  onAtualizarEdital: (id: number, dados: any) => Promise<void>;
  onAtualizarFaseCronograma?: (editalId: number, faseId: string, dados: any) => Promise<void>;
  onProrrogarPrazos?: (editalId: number, params: any) => Promise<void>;
  onAvancarFase: (id: number, novaFaseId: string, justificativa?: string) => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => Promise<void>;
  onSwitchUser?: (u: Usuario) => void;
  usuariosDisponiveis?: Usuario[];
}

function toInputDate(val?: any): string {
  if (!val) return '';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
  if (typeof val === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function toBrDate(val?: string): string {
  if (!val) return '';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
    const [y, m, d] = val.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
}

export function GerenciadorEditais({
  editais,
  editalAtivo,
  propostas,
  currentUser,
  onSelectEditalAtivo,
  onCriarEdital,
  onAtualizarEdital,
  onAtualizarFaseCronograma,
  onProrrogarPrazos,
  onAvancarFase,
  onNavigateTab,
  onRefresh,
  onSwitchUser,
  usuariosDisponiveis = [],
}: GerenciadorEditaisProps) {
  // Controle de Permissão Estrito: Somente Coordenação e Administrador Geral
  const temPermissao = currentUser.papel === 'admin' || currentUser.papel === 'coordenador';

  // Edital em foco para visualização na Linha do Tempo
  const [editalSelecionadoId, setEditalSelecionadoId] = useState<number>(
    editalAtivo ? editalAtivo.id : editais[0]?.id || 1
  );

  // Modais
  const [modalNovoEditalAberto, setModalNovoEditalAberto] = useState(false);
  const [modalEditarEditalAberto, setModalEditarEditalAberto] = useState(false);
  const [modalAvancarFaseAberto, setModalAvancarFaseAberto] = useState(false);
  const [modalEditarFaseAberto, setModalEditarFaseAberto] = useState(false);
  const [modalProrrogarAberto, setModalProrrogarAberto] = useState(false);

  const [faseParaAvancar, setFaseParaAvancar] = useState<{ id: string; titulo: string; faseNumero: number } | null>(null);
  const [faseParaEditar, setFaseParaEditar] = useState<EditalFaseCronograma | null>(null);
  const [justificativaTransicao, setJustificativaTransicao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Form State para Novo Edital
  const anoPadraoProximo = (editais[0]?.ano || 2027) + 1;
  const [formNovo, setFormNovo] = useState({
    codigo: `PIC-UNIG ${anoPadraoProximo}`,
    titulo: `Edital do Programa Institucional de Iniciação Científica UNIG ${anoPadraoProximo}/${anoPadraoProximo + 1}`,
    ano: anoPadraoProximo,
    totalBolsas: 100,
    bolsasAmplaConcorrencia: 60,
    bolsasAcoesAfirmativas: 40,
    status: 'planejamento',
    inicioSubmissao: `${anoPadraoProximo - 1}-08-01`,
    fimSubmissao: `${anoPadraoProximo - 1}-10-31`,
  });

  // Form State para Edição do Edital Selecionado
  const [formEditar, setFormEditar] = useState({
    codigo: '',
    titulo: '',
    ano: 2027,
    totalBolsas: 100,
    bolsasAmplaConcorrencia: 60,
    bolsasAcoesAfirmativas: 40,
    status: 'em_avaliacao',
    inicioSubmissao: '',
    fimSubmissao: '',
  });

  // Form State para Edição de Fase do Cronograma
  const [formEditarFase, setFormEditarFase] = useState({
    id: '',
    titulo: '',
    dataInicio: '',
    dataFim: '',
    responsavel: '',
    criterioRegimental: '',
    descricao: '',
    status: 'pendente' as 'concluido' | 'em_andamento' | 'pendente',
  });

  // Form State para Prorrogação Regimental de Prazos
  const [formProrrogar, setFormProrrogar] = useState({
    faseId: 'fase-2',
    diasProrrogacao: 15,
    novaDataFim: '',
    justificativa: 'Solicitação do corpo docente deliberada pela Coordenação Geral do PIC / PROPEP.',
  });

  // Edital ativo da visualização
  const editalEmFoco = editais.find((e) => e.id === editalSelecionadoId) || editalAtivo || editais[0];

  const handleOpenEditarModal = () => {
    if (!editalEmFoco) return;
    setFormEditar({
      codigo: editalEmFoco.codigo || '',
      titulo: editalEmFoco.titulo || '',
      ano: editalEmFoco.ano || 2027,
      totalBolsas: editalEmFoco.totalBolsas || 100,
      bolsasAmplaConcorrencia: editalEmFoco.bolsasAmplaConcorrencia || 60,
      bolsasAcoesAfirmativas: editalEmFoco.bolsasAcoesAfirmativas || 40,
      status: editalEmFoco.status || 'em_avaliacao',
      inicioSubmissao: toInputDate(editalEmFoco.inicioSubmissao) || '2026-08-01',
      fimSubmissao: toInputDate(editalEmFoco.fimSubmissao) || '2026-10-31',
    });
    setModalEditarEditalAberto(true);
  };

  const handleOpenEditarFase = (fase: EditalFaseCronograma) => {
    setFaseParaEditar(fase);
    setFormEditarFase({
      id: fase.id,
      titulo: fase.titulo,
      dataInicio: fase.dataInicio,
      dataFim: fase.dataFim,
      responsavel: fase.responsavel,
      criterioRegimental: fase.criterioRegimental || '',
      descricao: fase.descricao,
      status: fase.status,
    });
    setModalEditarFaseAberto(true);
  };

  const handleOpenProrrogar = (faseIdTarget = 'fase-2') => {
    const crono = editalEmFoco?.cronograma || [];
    const targetFase = crono.find((c) => c.id === faseIdTarget) || crono[1];
    setFormProrrogar({
      faseId: faseIdTarget,
      diasProrrogacao: 15,
      novaDataFim: targetFase?.dataFim || '',
      justificativa: 'Resolução Aditiva da Coordenação Geral do PIC e Pró-Reitoria de Pesquisa.',
    });
    setModalProrrogarAberto(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalEmFoco) return;
    try {
      setIsSubmitting(true);
      await onAtualizarEdital(editalEmFoco.id, formEditar);
      setModalEditarEditalAberto(false);
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Parâmetros e datas do edital atualizados com sucesso pela Coordenação!' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: err.message || 'Falha ao atualizar edital.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalvarFase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalEmFoco || !faseParaEditar) return;
    try {
      setIsSubmitting(true);
      if (onAtualizarFaseCronograma) {
        await onAtualizarFaseCronograma(editalEmFoco.id, faseParaEditar.id, formEditarFase);
      } else {
        await onRefresh();
      }
      setModalEditarFaseAberto(false);
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: `Etapa ${faseParaEditar.faseNumero} (${formEditarFase.titulo}) e datas atualizadas no cronograma!`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: err.message || 'Falha ao atualizar cronograma da fase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalvarProrrogacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalEmFoco) return;
    try {
      setIsSubmitting(true);
      if (onProrrogarPrazos) {
        await onProrrogarPrazos(editalEmFoco.id, formProrrogar);
      } else {
        await onRefresh();
      }
      setModalProrrogarAberto(false);
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: `Prorrogação de prazo regimental homologada com sucesso! Atualizado no quadro de avisos.`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: err.message || 'Falha ao prorrogar prazo regimental.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCriarEditalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onCriarEdital(formNovo);
      setModalNovoEditalAberto(false);
      setFeedbackMsg({ tipo: 'sucesso', texto: `Novo Edital ${formNovo.codigo} cadastrado com sucesso no ciclo anual!` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: err.message || 'Falha ao criar novo edital.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmarTransicaoFase = async () => {
    if (!editalEmFoco || !faseParaAvancar) return;
    try {
      setIsSubmitting(true);
      await onAvancarFase(editalEmFoco.id, faseParaAvancar.id, justificativaTransicao);
      setModalAvancarFaseAberto(false);
      setFaseParaAvancar(null);
      setJustificativaTransicao('');
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: `Ciclo regimental avançado com sucesso para a Etapa ${faseParaAvancar.faseNumero}!`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ tipo: 'erro', texto: err.message || 'Falha ao transitar fase.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. TELA DE ACESSO RESTRITO (se o usuário for avaliador ou orientador)
  if (!temPermissao) {
    const adminUser = usuariosDisponiveis.find((u) => u.papel === 'admin');
    const coordUser = usuariosDisponiveis.find((u) => u.papel === 'coordenador');

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            Acesso Restrito à Governança Institucional
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-3">
            Módulo Exclusivo da Coordenação Geral do PIC e Administrador Geral
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            O <strong>Gerenciador Anual de Editais & Linha do Tempo Regimental</strong> envolve a homologação de resoluções do CEPE, parametrização de cotas orçamentárias e avanço das fases regimentais da Universidade Iguaçu (UNIG).
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 text-left">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-[#002B49]" />
              <span>Perfis Autorizados pelo Regimento Geral da UNIG:</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Administrador Geral:</strong> Prof. Dr. Valter Soares (Pró-Reitoria de Pós-Graduação e Pesquisa - PROPEP).
              </li>
              <li>
                <strong>Coordenação Geral:</strong> Profa. Dra. Heloísa Vasconcelos (Comitê Institucional de Iniciação Científica).
              </li>
            </ul>
          </div>

          {onSwitchUser && (adminUser || coordUser) && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-3">
                Deseja testar as funcionalidades de governança como gestor institucional?
              </p>
              <div className="flex items-center justify-center space-x-3">
                {coordUser && (
                  <button
                    type="button"
                    onClick={() => onSwitchUser(coordUser)}
                    className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-[#002B49] text-white text-xs font-bold hover:bg-[#001D33] transition-colors cursor-pointer shadow-sm"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Entrar como Coordenação PIC</span>
                  </button>
                )}
                {adminUser && (
                  <button
                    type="button"
                    onClick={() => onSwitchUser(adminUser)}
                    className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer shadow-sm"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Entrar como Administrador Geral</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Cálculos do edital selecionado
  const cronograma = editalEmFoco?.cronograma || [];
  const totalBolsas = editalEmFoco?.totalBolsas || 100;
  const valorBolsa = editalEmFoco?.valorBolsa || 700;
  const orcamentoAnual = editalEmFoco?.orcamentoTotalAnual || totalBolsas * valorBolsa * 12;
  const faseAtualObj = cronograma.find((c) => c.status === 'em_andamento') || cronograma[0];
  const fasesConcluidasCount = cronograma.filter((c) => c.status === 'concluido').length;
  const progressoGeralCiclo = Math.round((fasesConcluidasCount / Math.max(1, cronograma.length)) * 100);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all ${
            feedbackMsg.tipo === 'sucesso'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedbackMsg.tipo === 'sucesso' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Top Banner & Header de Governança Institucional */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Módulo de Governança Institucional</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                Resolução CEPE nº 014/PROPEP
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight flex items-center space-x-2">
              <span>Gerenciador Anual de Editais & Linha do Tempo</span>
              <Calendar className="w-6 h-6 text-[#002B49]" />
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Painel regimental anual da Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP) e Coordenação Geral do PIC.
              Gerencie parâmetros das cotas, alterne o edital ativo da plataforma e acompanhe o avanço cronológico das 9 etapas fundamentais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-gerenciador-ver-anexos"
              onClick={() => onNavigateTab('anexos')}
              className="flex items-center space-x-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Diretrizes &amp; Anexos (I a VIII)</span>
            </button>

            <button
              type="button"
              id="btn-gerenciador-novo-edital"
              onClick={() => setModalNovoEditalAberto(true)}
              className="flex items-center space-x-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Novo Edital Anual</span>
            </button>

            {editalEmFoco && (
              <button
                type="button"
                id="btn-gerenciador-exportar-pdf"
                onClick={() => exportarEditalCronogramaPDF(editalEmFoco)}
                className="flex items-center space-x-1.5 py-2.5 px-3.5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Exportar Cronograma (PDF)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRefresh()}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Atualizar dados do servidor"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Seleção de Editais Anuais (Multi-Ano) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-[#002B49]" />
              <span>Histórico & Planejamento de Editais Anuais da UNIG:</span>
            </span>
            <span className="text-xs text-slate-500">
              {editais.length} editais anuais registrados
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {editais.map((ed) => {
              const isSelecionado = ed.id === editalEmFoco?.id;
              const isAtivoGeral = ed.isAtivo;

              return (
                <div
                  key={ed.id}
                  onClick={() => setEditalSelecionadoId(ed.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelecionado
                      ? 'border-[#002B49] bg-blue-50/40 shadow-sm ring-2 ring-[#002B49]/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {ed.codigo}
                      </span>
                      {isAtivoGeral ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Ativo no Sistema</span>
                        </span>
                      ) : ed.status === 'concluido' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Concluído
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          Planejamento
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                      Ano de Vigência: {ed.ano}/{ed.ano + 1}
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-2">
                      <span><strong>{ed.totalBolsas}</strong> bolsas</span>
                      <span>•</span>
                      <span><strong>{ed.propostasCount || 0}</strong> projetos</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {isSelecionado ? (
                        <span className="text-[#002B49] font-bold">● Em Exibição</span>
                      ) : (
                        'Clique para ver'
                      )}
                    </span>
                    {!isAtivoGeral && isSelecionado && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEditalAtivo(ed.id);
                        }}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                        title="Tornar este o edital oficial ativo do sistema"
                      >
                        Ativar no Sistema
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Painel do Edital em Foco */}
      {editalEmFoco && (
        <>
          {/* Alerta caso o edital em foco não seja o edital ativo geral */}
          {!editalEmFoco.isAtivo && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Atenção da Coordenação: </span>
                  Você está visualizando o cronograma do <strong>{editalEmFoco.codigo}</strong> (Ano {editalEmFoco.ano}), mas o edital ativo atual da plataforma é o <strong>{editalAtivo?.codigo}</strong>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectEditalAtivo(editalEmFoco.id)}
                className="py-1.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Definir {editalEmFoco.codigo} como Ativo
              </button>
            </div>
          )}

          {/* Cards com Métricas Gerais do Edital Selecionado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total de Bolsas & Cotas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total de Cotas
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {totalBolsas} <span className="text-xs font-normal text-slate-500">bolsas anuais</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                  <span className="font-semibold text-blue-700">{editalEmFoco.bolsasAmplaConcorrencia} AC</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-700">{editalEmFoco.bolsasAcoesAfirmativas} AF</span>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Divisão regimental:</span>
                <span className="font-bold text-slate-700">
                  {Math.round((editalEmFoco.bolsasAmplaConcorrencia / totalBolsas) * 100)}% /{' '}
                  {Math.round((editalEmFoco.bolsasAcoesAfirmativas / totalBolsas) * 100)}%
                </span>
              </div>
            </div>

            {/* Card 2: Orçamento Total Anual */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Orçamento Anual
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  R$ {(orcamentoAnual / 1000).toFixed(0)}k
                  <span className="text-xs font-normal text-slate-500"> / 12 meses</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  R$ {valorBolsa},00/mês por bolsista ativo
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Folha mensal:</span>
                <span className="font-bold text-slate-700">
                  R$ {(totalBolsas * valorBolsa).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Card 3: Propostas Vinculadas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Demanda de Projetos
                  </span>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {editalEmFoco.propostasCount || propostas.length}{' '}
                  <span className="text-xs font-normal text-slate-500">submetidos</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Grande Área de Saúde e Biológicas dominante
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onNavigateTab('projetos')}
                  className="text-xs font-bold text-[#002B49] hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Ver Todos os Projetos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: Situação & Progresso do Ciclo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ciclo Regimental
                  </span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {progressoGeralCiclo}%
                  <span className="text-xs font-normal text-slate-500"> concluído</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-1">
                  {faseAtualObj?.titulo || 'Em Planejamento'}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleOpenEditarModal}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Parâmetros</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* SEÇÃO PRINCIPAL: LINHA DO TEMPO ANUAL INTERATIVA (TIMELINE) */}
          {/* ========================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Linha do Tempo Anual
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">9 Etapas Regimentais do Ciclo</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
                  Cronograma & Fases do Edital {editalEmFoco.codigo}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clique em qualquer marco da timeline para ver detalhes, avançar a fase oficial ou acessar diretamente o módulo correspondente.
                </p>
              </div>

              {/* Controles da Coordenação & Barra de Progresso do Ciclo Anual */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProrrogar('fase-2')}
                    className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    title="Prorrogar prazo de inscrições ou avaliação (Termo Aditivo)"
                  >
                    <CalendarPlus className="w-4 h-4 text-emerald-100" />
                    <span>Prorrogar Prazos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenEditarModal}
                    className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    title="Editar título, cotas, bolsas e datas regimentais do edital"
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Editar Edital</span>
                  </button>
                </div>

                <div className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Progresso do Ciclo</span>
                    <span className="text-[#002B49]">{fasesConcluidasCount} de {cronograma.length}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#002B49] to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressoGeralCiclo}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TIMELINE VERTICAL MODERNA COM NÓS E CONEXÕES */}
            <div className="mt-8 relative">
              {/* Linha vertical centralizadora de fundo */}
              <div className="absolute left-6 sm:left-8 top-6 bottom-6 w-0.5 bg-slate-200 -z-0" />

              <div className="space-y-6">
                {cronograma.map((fase) => {
                  const isConcluido = fase.status === 'concluido';
                  const isEmAndamento = fase.status === 'em_andamento';
                  const isPendente = fase.status === 'pendente';

                  return (
                    <div
                      key={fase.id}
                      className={`relative flex items-start space-x-4 sm:space-x-6 p-4 sm:p-5 rounded-2xl border transition-all ${
                        isEmAndamento
                          ? 'bg-blue-50/50 border-[#002B49] shadow-md ring-2 ring-[#002B49]/15'
                          : isConcluido
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-slate-50/60 border-slate-200/80 opacity-80'
                      }`}
                    >
                      {/* Nó / Ícone da Etapa na Linha do Tempo */}
                      <div className="relative shrink-0 z-10">
                        {isConcluido ? (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md ring-4 ring-emerald-50">
                            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                          </div>
                        ) : isEmAndamento ? (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#002B49] text-white flex items-center justify-center shadow-lg ring-4 ring-blue-100 animate-pulse">
                            <span className="text-base sm:text-lg font-black text-amber-400">
                              0{fase.faseNumero}
                            </span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center shadow-sm">
                            <span className="text-xs sm:text-sm font-bold">
                              0{fase.faseNumero}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo Principal do Marco */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Etapa {fase.faseNumero} de {cronograma.length}
                              </span>
                              <span>•</span>
                              <span className="text-xs font-semibold text-slate-600">
                                Período: <strong>{fase.dataInicio} a {fase.dataFim}</strong>
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                              {fase.titulo}
                            </h3>
                          </div>

                          {/* Badge de Status da Fase */}
                          <div className="shrink-0">
                            {isConcluido ? (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                <Check className="w-3.5 h-3.5" />
                                <span>Concluído (100%)</span>
                              </span>
                            ) : isEmAndamento ? (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#002B49] text-white border border-[#001D33] shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>FASE ATUAL EM ANDAMENTO</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-200/80 text-slate-600 border border-slate-300">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendente / Próxima</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Descrição & Critério Regimental */}
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                          {fase.descricao}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-100/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                          <div>
                            <span className="font-semibold text-slate-700">Órgão Responsável: </span>
                            {fase.responsavel}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Norma Regimental: </span>
                            <span className="italic">{fase.criterioRegimental}</span>
                          </div>
                        </div>

                        {/* Ações Disponíveis para a Coordenação */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {/* Botão de Atalho para o Módulo correspondente */}
                          {fase.acaoDestinoTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab(fase.acaoDestinoTab!)}
                              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span>{fase.acaoRotulo || 'Acessar Módulo'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Botão de Edição das Datas e Parâmetros da Fase */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditarFase(fase)}
                            className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            title={`Editar período e normas da Etapa ${fase.faseNumero}`}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Editar Fase & Prazos</span>
                          </button>

                          {/* Botão de Prorrogação Rápida (para etapas com prazos regimentais) */}
                          {(fase.id === 'fase-2' || fase.id === 'fase-4' || fase.id === 'fase-7') && (
                            <button
                              type="button"
                              onClick={() => handleOpenProrrogar(fase.id)}
                              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                              title="Prorrogar data final desta etapa regimental"
                            >
                              <CalendarPlus className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Prorrogar Prazo</span>
                            </button>
                          )}

                          {/* Botão de Transição de Fase (Avançar para esta etapa) */}
                          {!isEmAndamento && (
                            <button
                              type="button"
                              onClick={() => {
                                setFaseParaAvancar({
                                  id: fase.id,
                                  titulo: fase.titulo,
                                  faseNumero: fase.faseNumero,
                                });
                                setModalAvancarFaseAberto(true);
                              }}
                              className="inline-flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                            >
                              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                {isPendente
                                  ? `Avançar Edital para esta Etapa ${fase.faseNumero}`
                                  : `Retornar Edital para esta Etapa ${fase.faseNumero}`}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* MODAL 1: CRIAR NOVO EDITAL ANUAL                           */}
      {/* ========================================================== */}
      {modalNovoEditalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#002B49] text-white flex items-center justify-center shadow-md">
                  <Plus className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cadastrar Novo Edital Anual
                  </h3>
                  <p className="text-xs text-slate-500">
                    Criação de novo ciclo regimental anual com quotas de bolsas e cronograma oficial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalNovoEditalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCriarEditalSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código do Edital *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNovo.codigo}
                    onChange={(e) => setFormNovo({ ...formNovo, codigo: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                    placeholder="Ex: PIC-UNIG 2028"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ano de Vigência *
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2035}
                    value={formNovo.ano}
                    onChange={(e) => {
                      const a = parseInt(e.target.value, 10);
                      setFormNovo({
                        ...formNovo,
                        ano: a,
                        codigo: `PIC-UNIG ${a}`,
                        titulo: `Edital do Programa Institucional de Iniciação Científica UNIG ${a}/${a + 1}`,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título Completo do Edital *
                </label>
                <input
                  type="text"
                  required
                  value={formNovo.titulo}
                  onChange={(e) => setFormNovo({ ...formNovo, titulo: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  placeholder="Título oficial do edital"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total de Bolsas *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={500}
                    value={formNovo.totalBolsas}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10) || 100;
                      const ac = Math.round(total * 0.6);
                      const af = total - ac;
                      setFormNovo({
                        ...formNovo,
                        totalBolsas: total,
                        bolsasAmplaConcorrencia: ac,
                        bolsasAcoesAfirmativas: af,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ampla Concorrência (AC)
                  </label>
                  <input
                    type="number"
                    value={formNovo.bolsasAmplaConcorrencia}
                    onChange={(e) =>
                      setFormNovo({ ...formNovo, bolsasAmplaConcorrencia: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ações Afirmativas (AF)
                  </label>
                  <input
                    type="number"
                    value={formNovo.bolsasAcoesAfirmativas}
                    onChange={(e) =>
                      setFormNovo({ ...formNovo, bolsasAcoesAfirmativas: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Início das Inscrições
                  </label>
                  <input
                    type="date"
                    value={formNovo.inicioSubmissao}
                    onChange={(e) => setFormNovo({ ...formNovo, inicioSubmissao: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Encerramento das Inscrições
                  </label>
                  <input
                    type="date"
                    value={formNovo.fimSubmissao}
                    onChange={(e) => setFormNovo({ ...formNovo, fimSubmissao: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              {/* Prévia Orçamentária Automática */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Orçamento Anual Previsto (12 parcelas): </span>
                  R$ {(formNovo.totalBolsas * 700 * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  R$ 700,00/mês
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalNovoEditalAberto(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Cadastrando...' : 'Publicar Edital Anual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: EDITAR PARÂMETROS DO EDITAL                       */}
      {/* ========================================================== */}
      {modalEditarEditalAberto && editalEmFoco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#002B49]" />
                <h3 className="text-base font-bold text-slate-900">
                  Editar Parâmetros • {editalEmFoco.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarEditalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código Oficial do Edital
                  </label>
                  <input
                    type="text"
                    required
                    value={formEditar.codigo}
                    onChange={(e) => setFormEditar({ ...formEditar, codigo: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ano Vigente
                  </label>
                  <input
                    type="number"
                    required
                    value={formEditar.ano}
                    onChange={(e) => setFormEditar({ ...formEditar, ano: parseInt(e.target.value, 10) || 2027 })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título do Edital
                </label>
                <input
                  type="text"
                  required
                  value={formEditar.titulo}
                  onChange={(e) => setFormEditar({ ...formEditar, titulo: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Início das Inscrições
                  </label>
                  <input
                    type="date"
                    value={formEditar.inicioSubmissao}
                    onChange={(e) => setFormEditar({ ...formEditar, inicioSubmissao: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fim das Inscrições
                  </label>
                  <input
                    type="date"
                    value={formEditar.fimSubmissao}
                    onChange={(e) => setFormEditar({ ...formEditar, fimSubmissao: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Bolsas
                  </label>
                  <input
                    type="number"
                    required
                    value={formEditar.totalBolsas}
                    onChange={(e) => {
                      const t = parseInt(e.target.value, 10) || 100;
                      const ac = Math.round(t * 0.6);
                      setFormEditar({
                        ...formEditar,
                        totalBolsas: t,
                        bolsasAmplaConcorrencia: ac,
                        bolsasAcoesAfirmativas: t - ac,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cotas AC
                  </label>
                  <input
                    type="number"
                    value={formEditar.bolsasAmplaConcorrencia}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, bolsasAmplaConcorrencia: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cotas AF
                  </label>
                  <input
                    type="number"
                    value={formEditar.bolsasAcoesAfirmativas}
                    onChange={(e) =>
                      setFormEditar({ ...formEditar, bolsasAcoesAfirmativas: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status Regimental do Edital
                </label>
                <select
                  value={formEditar.status}
                  onChange={(e) => setFormEditar({ ...formEditar, status: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="planejamento">Planejamento / Minuta CEPE</option>
                  <option value="submissao">Inscrições & Submissão Abertas</option>
                  <option value="triagem">Triagem e Habilitação Documental</option>
                  <option value="em_avaliacao">Avaliação Duplo-Cega em Curso</option>
                  <option value="etapa3">Pontuação Lattes / CR Aluno</option>
                  <option value="preliminar">Classificação Preliminar Divulgada</option>
                  <option value="recursos">Período de Recursos Aberto</option>
                  <option value="homologado">Homologado pelo CONSU / Bolsas Distribuídas</option>
                  <option value="concluido">Ciclo Concluído / Prestação de Contas</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalEditarEditalAberto(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 3: TRANSIÇÃO / AVANÇO DE FASE NA LINHA DO TEMPO      */}
      {/* ========================================================== */}
      {modalAvancarFaseAberto && faseParaAvancar && editalEmFoco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Transição Oficial de Fase • Linha do Tempo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAvancarFaseAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                <span className="font-bold">Nova Fase Regimental: </span>
                Etapa {faseParaAvancar.faseNumero} — {faseParaAvancar.titulo}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Ao confirmar esta transição, o status do edital <strong>{editalEmFoco.codigo}</strong> será atualizado na Linha do Tempo institucional e um registro de auditoria LGPD será gravado em nome da Coordenação / Pró-Reitoria.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Justificativa / Parecer da Coordenação (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={justificativaTransicao}
                  onChange={(e) => setJustificativaTransicao(e.target.value)}
                  placeholder="Ex: Prazos da etapa anterior expirados e pareceres homologados sem pendências."
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalAvancarFaseAberto(false)}
                className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarTransicaoFase}
                disabled={isSubmitting}
                className="py-2 px-5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Gravando...' : 'Confirmar Transição de Fase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 4: EDITAR FASE & DATAS ESPECÍFICAS DO CRONOGRAMA    */}
      {/* ========================================================== */}
      {modalEditarFaseAberto && faseParaEditar && editalEmFoco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#002B49]" />
                <h3 className="text-base font-bold text-slate-900">
                  Editar Cronograma • Etapa {faseParaEditar.faseNumero}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarFaseAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarFase} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título da Etapa
                </label>
                <input
                  type="text"
                  required
                  value={formEditarFase.titulo}
                  onChange={(e) => setFormEditarFase({ ...formEditarFase, titulo: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data de Início
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 01/08/2026"
                    value={formEditarFase.dataInicio}
                    onChange={(e) => setFormEditarFase({ ...formEditarFase, dataInicio: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data de Término
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 31/10/2026"
                    value={formEditarFase.dataFim}
                    onChange={(e) => setFormEditarFase({ ...formEditarFase, dataFim: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status Desta Etapa
                </label>
                <select
                  value={formEditarFase.status}
                  onChange={(e) =>
                    setFormEditarFase({
                      ...formEditarFase,
                      status: e.target.value as 'concluido' | 'em_andamento' | 'pendente',
                    })
                  }
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  <option value="pendente">Pendente / Aguardando Início</option>
                  <option value="em_andamento">Em Andamento (Fase Vigente)</option>
                  <option value="concluido">Concluído (100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Órgão Responsável
                </label>
                <input
                  type="text"
                  required
                  value={formEditarFase.responsavel}
                  onChange={(e) => setFormEditarFase({ ...formEditarFase, responsavel: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Critério Regimental / Base Legal
                </label>
                <input
                  type="text"
                  value={formEditarFase.criterioRegimental}
                  onChange={(e) => setFormEditarFase({ ...formEditarFase, criterioRegimental: e.target.value })}
                  placeholder="Ex: Art. 14 do Regimento PIC-UNIG"
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descrição dos Procedimentos da Fase
                </label>
                <textarea
                  rows={3}
                  required
                  value={formEditarFase.descricao}
                  onChange={(e) => setFormEditarFase({ ...formEditarFase, descricao: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalEditarFaseAberto(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações do Cronograma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 5: PRORROGAR PRAZOS REGIMENTAIS (TERMO ADITIVO)      */}
      {/* ========================================================== */}
      {modalProrrogarAberto && editalEmFoco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CalendarPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Prorrogar Prazo Regimental • {editalEmFoco.codigo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalProrrogarAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSalvarProrrogacao} className="space-y-4 mt-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Termo Aditivo de Prorrogação: </span>
                  A prorrogação estenderá a data final no edital, atualizará a linha do tempo e refletirá imediatamente no <strong>Quadro de Avisos</strong> institucional para todos os docentes e avaliadores.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Etapa a Prorrogar
                </label>
                <select
                  value={formProrrogar.faseId}
                  onChange={(e) => {
                    const fid = e.target.value;
                    const crono = editalEmFoco.cronograma || [];
                    const faseSel = crono.find((c) => c.id === fid);
                    setFormProrrogar({
                      ...formProrrogar,
                      faseId: fid,
                      novaDataFim: faseSel?.dataFim || '',
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                >
                  {(editalEmFoco.cronograma || []).map((f) => (
                    <option key={f.id} value={f.id}>
                      Etapa {f.faseNumero}: {f.titulo} (atual: até {f.dataFim})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Extensão Rápida de Prazo (Dias Corridos)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[7, 15, 20, 30].map((dias) => (
                    <button
                      key={dias}
                      type="button"
                      onClick={() => setFormProrrogar({ ...formProrrogar, diasProrrogacao: dias, novaDataFim: '' })}
                      className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                        formProrrogar.diasProrrogacao === dias && !formProrrogar.novaDataFim
                          ? 'bg-[#002B49] text-white border-[#002B49]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{dias} Dias
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ou Definir Nova Data de Término Específica
                </label>
                <input
                  type="text"
                  placeholder="Ex: 15/11/2026 ou 2026-11-15"
                  value={formProrrogar.novaDataFim}
                  onChange={(e) => setFormProrrogar({ ...formProrrogar, novaDataFim: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
                <span className="text-[11px] text-slate-400">
                  Se preenchido, sobrepõe os dias corridos automáticos.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Justificativa Oficial do Termo Aditivo *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formProrrogar.justificativa}
                  onChange={(e) => setFormProrrogar({ ...formProrrogar, justificativa: e.target.value })}
                  placeholder="Justifique o motivo da prorrogação para registro em ata e conformidade LGPD..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalProrrogarAberto(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CalendarPlus className="w-4 h-4 text-emerald-100" />
                  <span>{isSubmitting ? 'Homologando...' : 'Homologar Prorrogação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
