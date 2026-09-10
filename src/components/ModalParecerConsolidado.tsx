import React, { useState } from 'react';
import { Proposta } from '../types/index.ts';
import { exportarParecerIndividualPDF } from '../utils/pdfExport.ts';
import {
  X,
  Award,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  FileText,
  Download,
} from 'lucide-react';

interface ModalParecerConsolidadoProps {
  proposta: Proposta;
  onClose: () => void;
  onGoToBanca: (p: Proposta) => void;
}

export const ModalParecerConsolidado: React.FC<ModalParecerConsolidadoProps> = ({
  proposta,
  onClose,
  onGoToBanca,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'aval1' | 'aval2' | 'gemini'>('media');

  const avals = proposta.avaliacoes || [];
  const aval1 = avals.find((a) => a.ordemParecerista === 1);
  const aval2 = avals.find((a) => a.ordemParecerista === 2);

  const n1 = aval1 ? parseFloat(aval1.notaMeritoTotal) : null;
  const n2 = aval2 ? parseFloat(aval2.notaMeritoTotal) : null;

  let diferenca = null;
  let isDivergente = false;
  let media = null;

  if (n1 !== null && n2 !== null) {
    diferenca = Math.abs(n1 - n2);
    isDivergente = diferenca > 2.0;
    media = (n1 + n2) / 2;
  }

  const renderCriteriosTable = (a: any) => {
    if (!a) return <p className="text-xs text-slate-400 italic">Parecer ainda não submetido.</p>;

    const criterios = [
      { nome: '1. Título e Definição do Problema', nota: a.notaTitulo, max: '0.50' },
      { nome: '2. Introdução e Estado da Arte', nota: a.notaIntroducao, max: '0.75' },
      { nome: '3. Objetivos e Hipóteses', nota: a.notaObjetivos, max: '0.75' },
      { nome: '4. Justificativa e Relevância', nota: a.notaJustificativa, max: '0.50' },
      { nome: '5. Metodologia Científica', nota: a.notaMetodologia, max: '1.00' },
      { nome: '6. Viabilidade Técnica e Infraestrutura', nota: a.notaViabilidade, max: '0.75' },
      { nome: '7. Cronograma Físico-Financeiro', nota: a.notaCronograma, max: '0.50' },
      { nome: '8. Plano de Trabalho Discente', nota: a.notaPlanoDiscente, max: '0.75' },
      { nome: '9. Inserção Social e ODS / Agenda 2030', nota: a.notaInsercaoSocial, max: '0.50' },
    ];

    return (
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Critério Regimental (Etapa 2)</th>
                <th className="py-2.5 px-3 text-right">Nota Atribuída</th>
                <th className="py-2.5 px-3 text-right">Máximo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criterios.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-700">{c.nome}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{c.nota}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">{c.max}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-3 text-slate-900">Nota de Mérito Total</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-700 text-sm">{a.notaMeritoTotal}</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">6.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 block mb-1">Recomendação do Parecerista:</span>
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            {a.recomendacao}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 block mb-1">Parecer Consubstanciado:</span>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {a.parecerConsubstanciado}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                #PIC-{String(proposta.id).padStart(3, '0')}
              </span>
              <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                🎓 Curso: {proposta.discenteCurso}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                CR: {proposta.discenteCr}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                AVALIAR HUMANO + IA
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
              {proposta.titulo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Abas Claramente Definidas */}
        <div className="flex border-b border-slate-200 px-6 pt-3 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('media')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Média Consolidada</span>
          </button>

          <button
            onClick={() => setActiveTab('aval1')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'aval1'
                ? 'border-[#002B49] text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Avaliador 1 {n1 !== null ? `(${n1.toFixed(2)})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('aval2')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'aval2'
                ? 'border-[#002B49] text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Avaliador 2 {n2 !== null ? `(${n2.toFixed(2)})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Análise IA Gemini</span>
          </button>
        </div>

        {/* Corpo do Modal com Scroll */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Alerta de Divergência ou Convergência */}
              {diferenca !== null && (
                <div
                  className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    isDivergente
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  {isDivergente ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">
                      {isDivergente
                        ? 'Divergência Crítica entre Avaliadores (> 2.00 pts)'
                        : 'Convergência Regimental Homologada'}
                    </p>
                    <p className="mt-0.5">
                      Diferença observada: {diferenca.toFixed(2)} pontos (Avaliador 1: {n1?.toFixed(2)} vs Avaliador 2: {n2?.toFixed(2)}).
                      {isDivergente
                        ? ' Convocação obrigatória de 3º parecerista (árbitro) pela Coordenação.'
                        : ' Média calculada por média aritmética simples.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Avaliador 1</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {n1 !== null ? `${n1.toFixed(2)}` : 'Pendente'}
                    <span className="text-xs font-normal text-slate-500"> / 6.00</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Avaliador 2</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {n2 !== null ? `${n2.toFixed(2)}` : 'Pendente'}
                    <span className="text-xs font-normal text-slate-500"> / 6.00</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase">Média Consolidada Etapa 2</span>
                  <div className="text-2xl font-black text-slate-950">
                    {media !== null ? `${media.toFixed(2)}` : 'Incompleto'}
                    <span className="text-xs font-normal text-slate-600"> / 6.00</span>
                  </div>
                </div>
                {proposta.calculo?.notaFinalPonderada && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-900 uppercase">Nota Final Ponderada</span>
                    <div className="text-2xl font-black text-blue-900">
                      {proposta.calculo.notaFinalPonderada}
                      <span className="text-xs font-normal text-blue-600"> / 10.0</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'aval1' && renderCriteriosTable(aval1)}
          {activeTab === 'aval2' && renderCriteriosTable(aval2)}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-900">Pontuação Estimada IA Gemini</span>
                  <div className="text-2xl font-black text-purple-950">
                    {proposta.analiseIa?.pontuacaoEstimada || '5.20'}
                    <span className="text-xs font-normal text-purple-700"> / 6.00</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-purple-200 text-purple-800">
                  {proposta.analiseIa?.modeloUsado || 'gemini-3.8-flash'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Parecer Geral de Conformidade:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed mt-1">
                    {proposta.analiseIa?.parecerGeral || 'Em conformidade regimental preliminar.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Aderência ao Edital PIC-UNIG:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed mt-1">
                    {proposta.analiseIa?.aderenciaEdital || 'Alinhamento comprovado aos eixos temáticos.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Viabilidade Técnica:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed mt-1">
                    {proposta.analiseIa?.viabilidadeTecnica || 'Cronograma exequível.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Recomendações do Modelo:</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed mt-1">
                    {proposta.analiseIa?.recomendacoes || 'Acompanhamento contínuo.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onGoToBanca(proposta);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Abrir no Workspace da Banca &rarr;
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              id="btn-exportar-laudo-modal"
              onClick={() => exportarParecerIndividualPDF(proposta)}
              className="px-3.5 py-2 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
              title="Gerar e baixar laudo técnico de avaliação do módulo AVALIAR HUMANO + IA em PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Exportar Laudo Técnico (PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
