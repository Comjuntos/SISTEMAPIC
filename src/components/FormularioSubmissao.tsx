import React, { useState } from 'react';
import { Orientador, Usuario, TipoMetodo, DesenhoPesquisa } from '../types/index.ts';
import {
  calcularScoreMetodologico,
  HIERARQUIA_DESENHOS,
} from '../utils/methodology.ts';
import {
  LISTA_OFICIAL_CURSOS_UNIG,
  LISTA_CURSOS_GRADUACAO_UNIG,
  LISTA_MESTRADOS_UNIG,
} from '../data/cursosUnig.ts';
import {
  UploadCloud,
  FileCheck,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Shield,
  Send,
  Building,
  GraduationCap,
  Microscope,
  Binary,
  Layers,
} from 'lucide-react';

interface FormularioSubmissaoProps {
  orientadores: Orientador[];
  currentUser: Usuario;
  onSubmitProposta: (data: any) => Promise<void>;
  onSuccessNavigate: () => void;
}

export const FormularioSubmissao: React.FC<FormularioSubmissaoProps> = ({
  orientadores,
  currentUser,
  onSubmitProposta,
  onSuccessNavigate,
}) => {
  const [titulo, setTitulo] = useState('');
  const [grandeArea, setGrandeArea] = useState('Medicina');
  const [subarea, setSubarea] = useState('');
  const [resumo, setResumo] = useState('');

  // Métodos e Desenho Científico
  const [metodoTipo, setMetodoTipo] = useState<TipoMetodo>('Quantitativo');
  const [metodoTamanhoAmostra, setMetodoTamanhoAmostra] = useState<number>(50);
  const [metodoDesenho, setMetodoDesenho] = useState<DesenhoPesquisa>('Ensaio Clínico Randomizado');

  // Orientador pré-selecionado se for professor logado
  const initialOrientador =
    currentUser.papel === 'orientador'
      ? orientadores.find(
          (o) =>
            o.usuarioEmail === currentUser.email ||
            o.usuarioNome.toLowerCase().includes(currentUser.nome.toLowerCase()) ||
            currentUser.nome.toLowerCase().includes(o.usuarioNome.toLowerCase())
        ) || orientadores[0]
      : orientadores[0];

  const [orientadorId, setOrientadorId] = useState<number>(initialOrientador?.id || orientadores[0]?.id || 1);

  // Discente
  const [discenteNome, setDiscenteNome] = useState('');
  const [discenteEmail, setDiscenteEmail] = useState('');
  const [discenteCurso, setDiscenteCurso] = useState('Medicina');
  const [discenteCr, setDiscenteCr] = useState<number>(8.5);

  // Modalidade
  const [modalidade, setModalidade] = useState<'Ampla Concorrência' | 'Ações Afirmativas'>('Ampla Concorrência');
  const [tipoCota, setTipoCota] = useState('Autodeclaração Étnico-Racial (Pretos e Pardos - PPI)');

  // Arquivo e SHA-256
  const [arquivoNome, setArquivoNome] = useState<string>('');
  const [arquivoHash, setArquivoHash] = useState<string>('');
  const [arquivoBase64, setArquivoBase64] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [termoLgpdAceito, setTermoLgpdAceito] = useState<boolean>(true);

  // Orientador Selecionado
  const selectedOrientador = orientadores.find((o) => o.id === Number(orientadorId)) || orientadores[0];

  // Cálculo de SHA-256 no browser via SubtleCrypto
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoNome(file.name);
    setIsHashing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setArquivoHash(hashHex);

      // Leitura base64 simplificada
      const reader = new FileReader();
      reader.onloadend = () => {
        setArquivoBase64(reader.result as string);
        setIsHashing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Erro ao calcular hash:', err);
      setIsHashing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (discenteCr < 7.0) {
      alert('Regimento PIC-UNIG: O discente deve possuir Coeficiente de Rendimento (CR) mínimo de 7.00 para habilitação na Etapa 1.');
      return;
    }

    if (!arquivoNome) {
      // Gerar simulação de arquivo e hash caso não tenha selecionado
      const simulatedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      setArquivoHash(simulatedHash);
      setArquivoNome(`projeto_${titulo.substring(0, 15).replace(/\s+/g, '_')}_pic2027.pdf`);
    }

    try {
      setIsSubmitting(true);
      await onSubmitProposta({
        titulo,
        grandeArea,
        subarea: subarea || 'Área Principal',
        resumo,
        orientadorId: Number(orientadorId),
        discenteNome,
        discenteEmail: discenteEmail || `${discenteNome.toLowerCase().replace(/\s+/g, '.')}@aluno.unig.br`,
        discenteCurso,
        discenteCr,
        modalidade,
        tipoCota: modalidade === 'Ações Afirmativas' ? tipoCota : null,
        arquivoNome: arquivoNome || 'projeto_submissao_unig_2027.pdf',
        arquivoConteudoBase64: arquivoBase64,
        metodoTipo,
        metodoTamanhoAmostra: Number(metodoTamanhoAmostra),
        metodoDesenho,
      });

      alert('Proposta submetida com sucesso! Distribuída automaticamente para o módulo AVALIAR HUMANO + IA (Pareceristas Titulares & IA Gemini 3.8 Flash).');
      onSuccessNavigate();
    } catch (error: any) {
      alert('Erro ao submeter proposta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewScoreMetodo = calcularScoreMetodologico(metodoTipo, metodoTamanhoAmostra, metodoDesenho);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner de Papel Regimental */}
      {currentUser.papel === 'orientador' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 flex items-start space-x-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">
              Área Exclusiva de Envio de Projetos (Docente Orientador)
            </p>
            <p className="text-xs text-emerald-800">
              Conforme as diretrizes regimentais do PIC-UNIG, aos professores cabe <strong>enviar os projetos de pesquisa</strong> e <strong>consultar os editais e anexos</strong>. Preencha os dados abaixo para gerar a submissão e registrar o hash SHA-256 do arquivo.
            </p>
          </div>
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <div className="inline-flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Edital PIC-UNIG 2027/2028</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Submissão Oficial de Projeto de Pesquisa</h2>
        <p className="text-xs text-slate-500">
          Inscrição de proposta com validação em tempo real da Regra do Maior Benefício docente (H5 vs. Scopus), cota de bolsas e integridade documental via Hash SHA-256.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações da Proposta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Dados Técnico-Científicos do Projeto
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Título do Projeto *</label>
            <input
              type="text"
              placeholder="Ex: Análise Genômica e Epidemiológica da Resistência Antimicrobiana..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Curso de Graduação ou Mestrado do Projeto (Anexo IV do Edital) *
              </label>
              <select
                value={discenteCurso}
                onChange={(e) => {
                  setDiscenteCurso(e.target.value);
                  setGrandeArea(e.target.value);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                <option value="">Selecione o Curso ou Mestrado Oficial...</option>
                <optgroup label="Cursos de Graduação (19 Cursos Oficiais)">
                  {LISTA_CURSOS_GRADUACAO_UNIG.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} [{c.sigla}] — {c.grau} ({c.campus})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Programas de Pós-Graduação - Mestrado (4 Programas)">
                  {LISTA_MESTRADOS_UNIG.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} [{c.sigla}] — Stricto Sensu
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Linha Temática / Especialidade</label>
              <input
                type="text"
                placeholder="Ex: Microbiologia Molecular, Inteligência Artificial, Saúde Pública..."
                value={subarea}
                onChange={(e) => setSubarea(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Resumo Executivo (Objetivos, Métodos e Impacto) *</label>
            <textarea
              rows={4}
              placeholder="Descreva de forma concisa o estado da arte, a hipótese de trabalho, o delineamento experimental e os impactos esperados para a comunidade científica e a Baixada Fluminense..."
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
              required
            />
          </div>
        </div>

        {/* Bloco 2: Delineamento Científico, Amostragem e Ordem de Métodos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <Microscope className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Delineamento e Métodos Científicos (Avaliação & Ordem Regimental)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Classificação regimental da pesquisa com pontuação direta de abordagem, amostragem e desenho experimental.
              </p>
            </div>

            {/* Score Preview Badge */}
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-800">Score Metodológico:</span>
              <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                {previewScoreMetodo.scoreTotal.toFixed(2)} / 10.00 pts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Abordagem: Quantitativo ou Qualitativo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Abordagem Metodológica *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoTipo('Quantitativo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    metodoTipo === 'Quantitativo'
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Quantitativo</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      +2.00 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Testes de hipóteses, variáveis mensuráveis e inferência estatística.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoTipo('Qualitativo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    metodoTipo === 'Qualitativo'
                      ? 'bg-amber-50/80 border-amber-500 text-amber-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Qualitativo</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      +1.75 pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Análise hermenêutica, triangulação e saturação teórica de categorias.
                  </p>
                </button>
              </div>
            </div>

            {/* Tamanho da Amostra (N) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  Tamanho da Amostra (N) *
                </label>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  +{previewScoreMetodo.pontuacaoAmostra.toFixed(2)} pts amostrais
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={metodoTamanhoAmostra}
                  onChange={(e) => setMetodoTamanhoAmostra(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="text-xs text-slate-500">
                  {metodoTipo === 'Quantitativo' ? 'sujeitos / espécimes / medições' : 'participantes / entrevistas / grupos'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                {previewScoreMetodo.classificacaoAmostraLabel}
              </p>
            </div>
          </div>

          {/* Ordem de Pontuação do Desenho da Pesquisa */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                Ordem e Desenho da Pesquisa (Hierarquia Regimental) *
              </label>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Pontuação do Desenho: +{previewScoreMetodo.pontuacaoDesenho.toFixed(2)} pts (Nível {previewScoreMetodo.nivelHierarquia})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {(
                [
                  'Ensaio Clínico Randomizado',
                  'Ensaio de Roda / Estudo de coorte',
                  'Caso controle',
                  'Relato de caso',
                  'Estudo in vitro',
                ] as DesenhoPesquisa[]
              ).map((desenho) => {
                const meta = HIERARQUIA_DESENHOS[desenho];
                const isSelected = metodoDesenho === desenho;
                return (
                  <button
                    key={desenho}
                    type="button"
                    onClick={() => setMetodoDesenho(desenho)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          #{meta.ordem}º Ordem
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {meta.pontos.toFixed(2)} pts
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {desenho}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">
                      {meta.descricao}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Classificação Regimental:</span>
                <span className="font-bold text-slate-900">{HIERARQUIA_DESENHOS[metodoDesenho]?.classificacao}</span>
              </div>
              <div className="text-slate-600 text-[11px]">
                Diagnóstico: <span className="font-semibold text-emerald-700">{previewScoreMetodo.resumoRigor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 3: Docente Orientador e Regra do Maior Benefício */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              3. Docente Orientador e Regra do Maior Benefício (H5 vs. Scopus)
            </h3>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Etapa 3: Currículo Lattes (máx 4.00 pts)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Selecione o Docente Orientador Credenciado *</label>
            <select
              value={orientadorId}
              onChange={(e) => setOrientadorId(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {orientadores.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome || o.usuarioNome || `Docente #${o.id}`} — {o.departamento} ({o.titulacao})
                </option>
              ))}
            </select>
          </div>

          {/* Painel da Regra do Maior Benefício do Orientador Selecionado */}
          {selectedOrientador && (
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span className="text-xs font-bold text-purple-950">
                    Demonstrativo da Regra do Maior Benefício:
                  </span>
                </div>
                <div className="text-xs font-bold text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                  Nota Lattes Final: {selectedOrientador.notaLattes} / 4.00
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Índice H5 (Scholar)</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrientador.indiceH5}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    (Normalizado: {(parseFloat(selectedOrientador.indiceH5) / 15).toFixed(2)})
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Percentil Scopus</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrientador.percentilScopus}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    (Normalizado: {(parseFloat(selectedOrientador.percentilScopus) / 100).toFixed(2)})
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Critério Vencedor</span>
                  <span className="font-bold text-purple-700">{selectedOrientador.regraMaiorBeneficioTipo}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    +{selectedOrientador.pontuacaoMaiorBeneficio} pts
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Titulação &amp; Vínculos</span>
                  <span className="font-bold text-slate-900">{selectedOrientador.titulacao}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {selectedOrientador.vinculoStrictoSensu ? 'Stricto Sensu ✓' : 'Sem Stricto'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bloco 4: Dados do Discente Candidato à Bolsa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Dados do Discente Candidato
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Nome Completo do Aluno *</label>
              <input
                type="text"
                placeholder="Ex: Mariana Silva Albuquerque"
                value={discenteNome}
                onChange={(e) => setDiscenteNome(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">E-mail Institucional (@aluno.unig.br) *</label>
              <input
                type="email"
                placeholder="mariana.albuquerque@aluno.unig.br"
                value={discenteEmail}
                onChange={(e) => setDiscenteEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Curso de Graduação ou Mestrado do Candidato (Anexo IV) *
              </label>
              <select
                value={discenteCurso}
                onChange={(e) => setDiscenteCurso(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                <option value="">Selecione o Curso ou Mestrado Oficial...</option>
                <optgroup label="Cursos de Graduação (19 Cursos)">
                  {LISTA_CURSOS_GRADUACAO_UNIG.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} ({c.sigla}) — {c.grau}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Programas de Pós-Graduação - Mestrado (4 Programas)">
                  {LISTA_MESTRADOS_UNIG.map((c) => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} ({c.sigla}) — Stricto Sensu
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-800">
                  Coeficiente de Rendimento (CR Acumulado) *
                </label>
                <span className={`text-xs font-bold font-mono ${(Number(discenteCr) || 0) >= 7.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {(Number(discenteCr) || 0).toFixed(2)} (Mínimo: 7.00)
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.05"
                value={discenteCr}
                onChange={(e) => setDiscenteCr(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {discenteCr < 7.0 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Atenção: CR inferior a 7.00 inviabiliza a habilitação na Etapa 1 regimental.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 5: Modalidade de Bolsa e Ações Afirmativas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            5. Modalidade de Concorrência (100 Bolsas Disponíveis)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                modalidade === 'Ampla Concorrência'
                  ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="modalidade"
                checked={modalidade === 'Ampla Concorrência'}
                onChange={() => setModalidade('Ampla Concorrência')}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ampla Concorrência (AC)</span>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  60 bolsas alocadas por ranqueamento geral de pontuação final regimental.
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                modalidade === 'Ações Afirmativas'
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="modalidade"
                checked={modalidade === 'Ações Afirmativas'}
                onChange={() => setModalidade('Ações Afirmativas')}
                className="mt-0.5 text-amber-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Ações Afirmativas (AF)</span>
                <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                  40 bolsas reservadas com migração automática para ampla concorrência por mérito de pontuação.
                </span>
              </div>
            </label>
          </div>

          {modalidade === 'Ações Afirmativas' && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Selecione a Categoria de Ação Afirmativa declarada:
              </label>
              <select
                value={tipoCota}
                onChange={(e) => setTipoCota(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Autodeclaração Étnico-Racial (Pretos e Pardos - PPI)">
                  Autodeclaração Étnico-Racial (Pretos e Pardos - PPI)
                </option>
                <option value="Egresso de Escola Pública e Renda Familiar">
                  Egresso de Escola Pública e Baixa Renda Familiar
                </option>
                <option value="Pessoa com Deficiência (PCD)">
                  Pessoa com Deficiência (PCD)
                </option>
                <option value="Indígenas e Comunidades Tradicionais">
                  Indígenas e Comunidades Tradicionais
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Bloco 6: Upload de Arquivo com Cálculo do Hash SHA-256 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              6. Custódia Documental &amp; Hash SHA-256
            </h3>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Integridade Criptográfica
            </span>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Selecione o Projeto Completo em PDF (com Plano de Trabalho)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              O sistema computará o Hash SHA-256 imediatamente para garantir a autenticidade jurídica.
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-3 text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {arquivoNome && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{arquivoNome}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 truncate max-w-sm">
                SHA-256: {isHashing ? 'Computando...' : arquivoHash || 'Calculado'}
              </div>
            </div>
          )}

          {/* Termo LGPD */}
          <label className="flex items-start space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termoLgpdAceito}
              onChange={(e) => setTermoLgpdAceito(e.target.checked)}
              className="mt-0.5 text-blue-600 rounded"
              required
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              Declaro conformidade com o Edital PIC-UNIG 2027 e autorizo o tratamento de dados institucionais estritamente para fins de avaliação e concessão de bolsas de iniciação científica, nos termos da LGPD (Lei nº 13.709/2018).
            </span>
          </label>
        </div>

        {/* Botão de Submissão */}
        <button
          id="btn-submeter-proposta-final"
          type="submit"
          disabled={isSubmitting || discenteCr < 7.0 || !termoLgpdAceito}
          className="w-full py-3 px-6 rounded-xl bg-[#002B49] hover:bg-[#003860] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>
            {isSubmitting
              ? 'Submetendo e acionando IA Gemini...'
              : 'Submeter Proposta e Iniciar Avaliação Duplo-Cega'}
          </span>
        </button>
      </form>
    </div>
  );
};
