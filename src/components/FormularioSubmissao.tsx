import React, { useState } from 'react';
import { Orientador, Usuario } from '../types/index.ts';
import {
  LISTA_CURSOS_GRADUACAO_UNIG,
  LISTA_MESTRADOS_UNIG,
} from '../data/cursosUnig.ts';
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  Send,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  GraduationCap,
  Users,
  Compass,
  BookOpen,
  Layers,
  FileText,
  BadgeCheck,
  ArrowRight,
  Clock,
  Check,
  Utensils,
  Activity,
  Venus,
  Droplet,
  Sun,
  TrendingUp,
  Boxes,
  Move,
  Building2,
  RefreshCw,
  Globe,
  Fish,
  Trees,
  Scale,
  Share2,
} from 'lucide-react';

interface FormularioSubmissaoProps {
  orientadores: Orientador[];
  currentUser: Usuario;
  onSubmitProposta: (data: any) => Promise<void>;
  onSuccessNavigate: () => void;
}

interface ArtigoOrientador {
  link: string;
  indiceH5: string;
  percentilScopus: string;
}

interface VoluntarioItem {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  coeficiente: number;
  cursoPeriodo: string;
  telefone: string;
  email: string;
  orcid: string;
  lattes: string;
  acoesAfirmativas: 'sim' | 'nao';
  declaracaoParentesco: boolean;
  termoAceito: boolean;
}

interface ProfessorAssistenteItem {
  id: number;
  nome: string;
  cpf: string;
  titulacao: string;
  telefone: string;
  email: string;
  orcid: string;
  lattes: string;
}

export const FormularioSubmissao: React.FC<FormularioSubmissaoProps> = ({
  orientadores,
  currentUser,
  onSubmitProposta,
  onSuccessNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePreencherExemplo = () => {
    setTitulo('Mortalidade por Doenças Cardiovasculares no Município de Nova Iguaçu');
    setCampus('Nova Iguaçu');
    setModalidadeSubmissao('projeto 1 vaga bolsista');
    setLinhaPesquisa('Epidemiologia e Saúde Coletiva');
    setGrupoPesquisaDGP('DGP-UNIG-042: Tecnologias em Saúde');
    setVinculoCursoOuMestrado('Medicina');
    setOdsVinculado('ODS 3 - Saúde e Bem-Estar');
    setBolsistaNome('Ana Beatriz Souza da Silva');
    setBolsistaCpf('111.222.333-44');
    setBolsistaMatricula('20251234');
    setBolsistaCoeficiente(9.1);
    setBolsistaCursoPeriodo('Medicina - 5º Período');
    setBolsistaTelefone('(21) 98765-4321');
    setBolsistaEmail('ana.silva@aluno.unig.br');
    setBolsistaOrcid('https://orcid.org/0000-0003-4321-9876');
    setBolsistaLattes('http://lattes.cnpq.br/9876543210987654');
    setBolsistaAcoesAfirmativas('nao');
    setBolsistaDeclaracaoParentesco(true);
    setBolsistaTermoAceito(true);
    setAssistentes([
      {
        id: Date.now(),
        nome: 'Prof. Dr. Carlos Eduardo Mendes',
        cpf: '222.333.444-55',
        titulacao: 'Doutor',
        telefone: '(21) 98765-4321',
        email: 'carlos.mendes@unig.br',
        orcid: 'https://orcid.org/0000-0003-4321-9876',
        lattes: 'http://lattes.cnpq.br/9876543210987654',
      }
    ]);
    setEnvolveAnimais('nao');
    setAnimaisJustificativa('O projeto baseia-se em estudos epidemiológicos com humanos e análise de dados secundários, não envolvendo pesquisa com animais.');
    alert('✨ Formulário preenchido automaticamente com dados de exemplo válidos! Pronto para revisão e submissão.');
  };

  // --- Aba 1: Dados do Projeto ---
  const [titulo, setTitulo] = useState('Mortalidade por Doenças Cardiovasculares no Município de Nova Iguaçu');
  const [campus, setCampus] = useState<'Itaperuna' | 'Nova Iguaçu'>('Nova Iguaçu');
  const [modalidadeSubmissao, setModalidadeSubmissao] = useState<'projeto 1 vaga bolsista' | 'projeto de maior complexidade com 2 vagas bolsistas'>('projeto 1 vaga bolsista');
  const [linhaPesquisa, setLinhaPesquisa] = useState('Epidemiologia e Saúde Coletiva');
  const [grupoPesquisaDGP, setGrupoPesquisaDGP] = useState('DGP-UNIG-042: Tecnologias em Saúde');
  const [vinculoCursoOuMestrado, setVinculoCursoOuMestrado] = useState('Medicina');
  const [odsVinculado, setOdsVinculado] = useState('ODS 3 - Saúde e Bem-Estar');
  const [envolveAnimais, setEnvolveAnimais] = useState<'sim' | 'nao' | 'nao se aplica'>('nao');
  const [animaisJustificativa, setAnimaisJustificativa] = useState('O projeto baseia-se em estudos clínicos e revisões bibliográficas, dispensando experimentação animal.');

  // --- Aba 2: Professor Orientador ---
  const initialOrientador =
    currentUser?.papel === 'orientador'
      ? orientadores.find(
          (o) =>
            o.usuarioEmail === currentUser?.email ||
            (o.usuarioNome || '').toLowerCase().includes((currentUser?.nome || '').toLowerCase())
        ) || orientadores[0]
      : orientadores[0];

  const [orientadorId, setOrientadorId] = useState<number>(initialOrientador?.id || orientadores[0]?.id || 1);
  const selectedOrientador = orientadores.find((o) => o.id === Number(orientadorId)) || orientadores[0];

  const [orientadorNome, setOrientadorNome] = useState(selectedOrientador?.nome || selectedOrientador?.usuarioNome || '');
  const [orientadorCpf, setOrientadorCpf] = useState('123.456.789-00');
  const [orientadorTitulacao, setOrientadorTitulacao] = useState(selectedOrientador?.titulacao || 'Doutor');
  const [orientadorTelefone, setOrientadorTelefone] = useState('(21) 99888-7766');
  const [orientadorEmail, setOrientadorEmail] = useState(selectedOrientador?.usuarioEmail || 'orientador@unig.br');
  const [orientadorOrcid, setOrientadorOrcid] = useState('https://orcid.org/0000-0002-1825-009X');
  const [orientadorLattes, setOrientadorLattes] = useState('http://lattes.cnpq.br/1234567890123456');

  // 5 caixas para artigos / periódicos
  const [orientadorArtigos, setOrientadorArtigos] = useState<ArtigoOrientador[]>([
    { link: 'https://doi.org/10.1590/1984-0462', indiceH5: '18', percentilScopus: '75' },
    { link: 'https://doi.org/10.1590/abc.2025.01', indiceH5: '15', percentilScopus: '65' },
    { link: '', indiceH5: '', percentilScopus: '' },
    { link: '', indiceH5: '', percentilScopus: '' },
    { link: '', indiceH5: '', percentilScopus: '' },
  ]);

  // --- Aba 3: Professor Assistente / Voluntário ---
  const [assistentes, setAssistentes] = useState<ProfessorAssistenteItem[]>([]);

  const handleAddAssistente = () => {
    setAssistentes([
      ...assistentes,
      {
        id: Date.now(),
        nome: '',
        cpf: '',
        titulacao: 'Mestre',
        telefone: '',
        email: '',
        orcid: '',
        lattes: '',
      },
    ]);
  };

  const handleRemoveAssistente = (id: number) => {
    setAssistentes(assistentes.filter((a) => a.id !== id));
  };

  const handleAssistenteChange = (id: number, field: keyof ProfessorAssistenteItem, value: any) => {
    setAssistentes(
      assistentes.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // --- Aba 4: Informações do Bolsista ---
  const [bolsistaNome, setBolsistaNome] = useState('');
  const [bolsistaCpf, setBolsistaCpf] = useState('');
  const [bolsistaMatricula, setBolsistaMatricula] = useState('');
  const [bolsistaCoeficiente, setBolsistaCoeficiente] = useState<number>(8.5);
  const [bolsistaCursoPeriodo, setBolsistaCursoPeriodo] = useState('Medicina - 4º Período');
  const [bolsistaTelefone, setBolsistaTelefone] = useState('');
  const [bolsistaEmail, setBolsistaEmail] = useState('');
  const [bolsistaOrcid, setBolsistaOrcid] = useState('');
  const [bolsistaLattes, setBolsistaLattes] = useState('');
  const [bolsistaAcoesAfirmativas, setBolsistaAcoesAfirmativas] = useState<'sim' | 'nao'>('nao');
  const [bolsistaDeclaracaoParentesco, setBolsistaDeclaracaoParentesco] = useState<boolean>(false);
  const [bolsistaTermoAceito, setBolsistaTermoAceito] = useState<boolean>(false);

  // --- Aba 5: Informações dos Voluntários (até 4 voluntários) ---
  const [voluntarios, setVoluntarios] = useState<VoluntarioItem[]>([]);

  const handleAddVoluntario = () => {
    if (voluntarios.length >= 4) {
      alert('O limite máximo é de até 4 voluntários por projeto.');
      return;
    }
    setVoluntarios([
      ...voluntarios,
      {
        id: Date.now(),
        nome: '',
        cpf: '',
        matricula: '',
        coeficiente: 8.0,
        cursoPeriodo: '',
        telefone: '',
        email: '',
        orcid: '',
        lattes: '',
        acoesAfirmativas: 'nao',
        declaracaoParentesco: false,
        termoAceito: false,
      },
    ]);
  };

  const handleRemoveVoluntario = (id: number) => {
    setVoluntarios(voluntarios.filter((v) => v.id !== id));
  };

  const handleVoluntarioChange = (id: number, field: keyof VoluntarioItem, value: any) => {
    setVoluntarios(
      voluntarios.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // --- Aba 6: Anexos e Declarações ---
  const [arquivoNome, setArquivoNome] = useState<string>('');
  const [arquivoHash, setArquivoHash] = useState<string>('');
  const [arquivoBase64, setArquivoBase64] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);

  const [declaracaoVerdade, setDeclaracaoVerdade] = useState<boolean>(false);
  const [declaracaoAusenciaDocumento, setDeclaracaoAusenciaDocumento] = useState<boolean>(false);

  // Cálculo de preenchimento de cada etapa para a Timeline Animada
  const step1Complete = Boolean(titulo.trim() && linhaPesquisa.trim() && grupoPesquisaDGP.trim() && vinculoCursoOuMestrado);
  const step2Complete = Boolean(orientadorNome.trim() && orientadorCpf.trim());
  const step3Complete = true; // opcional
  const step4Complete = Boolean(bolsistaNome.trim() && bolsistaCpf.trim() && bolsistaMatricula.trim() && bolsistaDeclaracaoParentesco && bolsistaTermoAceito);
  const step5Complete = true; // opcional
  const step6Complete = Boolean(arquivoNome && declaracaoVerdade && declaracaoAusenciaDocumento);

  const completedStepsCount = [step1Complete, step2Complete, step3Complete, step4Complete, step5Complete, step6Complete].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 6) * 100);

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

    if (bolsistaCoeficiente < 7.0) {
      alert('Regimento PIC-UNIG: O discente bolsista deve possuir Coeficiente de Rendimento (CR) mínimo de 7.00.');
      setActiveTab(4);
      return;
    }

    if (!bolsistaDeclaracaoParentesco || !bolsistaTermoAceito) {
      alert('Você deve aceitar a declaração de não parentesco e o Termo de Compromisso do Bolsista na aba de Aluno Bolsista.');
      setActiveTab(4);
      return;
    }

    if (!declaracaoVerdade || !declaracaoAusenciaDocumento) {
      alert('Você deve aceitar ambas as declarações finais obrigatórias na aba de Anexos & Declarações.');
      setActiveTab(6);
      return;
    }

    if (!arquivoNome) {
      const simulatedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      setArquivoHash(simulatedHash);
      setArquivoNome(`projeto_pic2027_${campus.toLowerCase()}.pdf`);
    }

    try {
      setIsSubmitting(true);
      await onSubmitProposta({
        titulo: titulo || `Projeto PIC UNIG - ${linhaPesquisa || 'Pesquisa Científica'}`,
        grandeArea: vinculoCursoOuMestrado || 'Medicina',
        subarea: linhaPesquisa || 'Área Geral',
        resumo: `Projeto submetido no campus ${campus} (${modalidadeSubmissao}). Linha: ${linhaPesquisa}. ODS: ${odsVinculado}.`,
        orientadorId: Number(orientadorId),
        discenteNome: bolsistaNome || 'Discente Bolsista',
        discenteEmail: bolsistaEmail || 'bolsista@aluno.unig.br',
        discenteCurso: vinculoCursoOuMestrado || 'Medicina',
        discenteCr: bolsistaCoeficiente,
        modalidade: bolsistaAcoesAfirmativas === 'sim' ? 'Ações Afirmativas' : 'Ampla Concorrência',
        arquivoNome: arquivoNome || 'projeto_submissao.pdf',
        arquivoConteudoBase64: arquivoBase64,
        campus,
        modalidadeSubmissao,
        linhaPesquisa,
        grupoPesquisaDGP,
        odsVinculado,
        envolveAnimais,
        orientadorInfo: {
          nome: orientadorNome || selectedOrientador?.nome,
          cpf: orientadorCpf,
          titulacao: orientadorTitulacao,
          telefone: orientadorTelefone,
          email: orientadorEmail,
          orcid: orientadorOrcid,
          lattes: orientadorLattes,
          artigos: orientadorArtigos,
        },
        assistentes,
        assistenteInfo: assistentes[0] ? {
          nome: assistentes[0].nome,
          cpf: assistentes[0].cpf,
          titulacao: assistentes[0].titulacao,
          telefone: assistentes[0].telefone,
          email: assistentes[0].email,
          orcid: assistentes[0].orcid,
          lattes: assistentes[0].lattes,
        } : null,
        voluntarios,
      });

      alert('Proposta submetida e arquivo enviado com sucesso para o Google Drive na pasta PIC / 2027 / Orientador (rmsx22@gmail.com)! Distribuída para avaliação regimental e IA Gemini.');
      onSuccessNavigate();
    } catch (error: any) {
      alert('Erro ao submeter proposta: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timelineSteps = [
    { id: 1, label: 'Projeto', isComplete: step1Complete, icon: Compass },
    { id: 2, label: 'Orientador', isComplete: step2Complete, icon: Award },
    { id: 3, label: 'Assistente', isComplete: step3Complete, icon: User },
    { id: 4, label: 'Bolsista', isComplete: step4Complete, icon: GraduationCap },
    { id: 5, label: 'Voluntários', isComplete: step5Complete, icon: Users },
    { id: 6, label: 'Anexos & Edital', isComplete: step6Complete, icon: FileText },
  ];

  const tabsConfig = [
    { id: 1, label: 'Projeto & Campus', icon: Compass, badge: '01', desc: 'Escopo e Campus' },
    { id: 2, label: 'Professor Orientador', icon: Award, badge: '02', desc: 'H5, Scopus e Lattes' },
    { id: 3, label: 'Prof. Assistente', icon: User, badge: '03', desc: 'Co-orientação opcional' },
    { id: 4, label: 'Aluno Bolsista', icon: GraduationCap, badge: '04', desc: 'CR e Termos' },
    { id: 5, label: 'Alunos Voluntários', icon: Users, badge: '05', desc: 'Até 4 voluntários' },
    { id: 6, label: 'Anexos & Declarações', icon: FileText, badge: '06', desc: 'PDFs e Edital' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Cabeçalho Luxuoso com Gradiente Mesh */}
      <div className="relative bg-gradient-to-r from-slate-950 via-[#002B49] to-indigo-950 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl overflow-hidden border border-white/10">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border border-amber-400/30 shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Edital PIC-UNIG 2027/2028 — Plataforma Oficial</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
              Portal de Submissão de Pesquisa Científica
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed font-medium">
              Preencha com rigor acadêmico os blocos de dados estruturados abaixo. Nosso sistema valida em tempo real a conformidade regimental e o quociente de produção científica.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePreencherExemplo}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                title="Preenche automaticamente com dados acadêmicos de exemplo para teste rápido"
              >
                <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>⚡ Preenchimento Rápido com Exemplo (1-Clique)</span>
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/15 flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="relative w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
              <span>{progressPercent}%</span>
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-white uppercase tracking-wider">Progresso Geral</p>
              <p className="text-amber-300 font-semibold">{completedStepsCount} de 6 etapas prontas</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 TIMELINE ANIMADA DE ETAPAS DE PREENCHIMENTO */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '10s' }} />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Linha do Tempo de Preenchimento da Proposta</h3>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Atualização em tempo real
          </span>
        </div>

        <div className="relative flex items-center justify-between w-full pt-4 pb-2">
          {/* Linha de fundo da Timeline */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
          {/* Linha de progresso animada */}
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full z-0 transition-all duration-500"
            style={{ width: `${((activeTab - 1) / 5) * 100}%` }}
          ></div>

          {timelineSteps.map((step) => {
            const IconComp = step.icon;
            const isCurrent = activeTab === step.id;
            const isDone = step.isComplete;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveTab(step.id)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-all duration-200 ${
                  isCurrent ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 font-black'
                      : isDone
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <IconComp className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 transition-colors whitespace-nowrap ${
                    isCurrent ? 'text-slate-900 font-extrabold' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abas Super Sofisticadas (Card Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabsConfig.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          const isDone = timelineSteps.find(s => s.id === tab.id)?.isComplete;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer relative group ${
                isActive
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold border-amber-400 shadow-xl ring-4 ring-amber-400/30 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shadow-xs ${
                  isActive ? 'bg-slate-950 text-amber-400' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isDone && !isActive ? <Check className="w-4 h-4" /> : tab.badge}
                </span>
                <div className={`p-2 rounded-xl ${isActive ? 'bg-black/10' : 'bg-slate-50 text-slate-500'}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold leading-snug line-clamp-1">{tab.label}</p>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-slate-900/80 font-medium' : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ----------------- ABA 1: PROJETO & CAMPUS ----------------- */}
        {activeTab === 1 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">1. Informações Gerais do Projeto &amp; Campus</h3>
                <p className="text-xs text-slate-500">Parâmetros de vinculação institucional e enquadramento regimental.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Título Completo do Projeto de Pesquisa *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mortalidade por Doenças Cardiovasculares no Município de Nova Iguaçu"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Qual Campus de Vinculação *</span>
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value as any)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                >
                  <option value="Nova Iguaçu">Nova Iguaçu (Campus I — Sede)</option>
                  <option value="Itaperuna">Itaperuna (Campus II)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>2. Modalidade da Submissão *</span>
                </label>
                <select
                  value={modalidadeSubmissao}
                  onChange={(e) => setModalidadeSubmissao(e.target.value as any)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                >
                  <option value="projeto 1 vaga bolsista">Projeto com 1 vaga bolsista</option>
                  <option value="projeto de maior complexidade com 2 vagas bolsistas">
                    Projeto de maior complexidade com 2 vagas bolsistas
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Linha de Pesquisa da Vinculação *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Biotecnologia em Saúde e Doenças Infecciosas"
                  value={linhaPesquisa}
                  onChange={(e) => setLinhaPesquisa(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Nome do Grupo de Pesquisa no DGP (CNPq) *</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grupo de Estudos em Patologia Clínica"
                  value={grupoPesquisaDGP}
                  onChange={(e) => setGrupoPesquisaDGP(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>5. Vínculo do Projeto ao Curso de Graduação ou Programa de Mestrado *</span>
                </label>
                <select
                  value={vinculoCursoOuMestrado}
                  onChange={(e) => setVinculoCursoOuMestrado(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                >
                  <option value="">Selecione o Curso ou Mestrado Oficial...</option>
                  <optgroup label="Cursos de Graduação">
                    {LISTA_CURSOS_GRADUACAO_UNIG.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome} ({c.sigla}) — {c.campus}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Programas de Mestrado">
                    {LISTA_MESTRADOS_UNIG.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome} ({c.sigla}) — Stricto Sensu
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>6. Objetivo de Desenvolvimento Sustentável (ODS) vinculado *</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3 font-medium">
                  Selecione abaixo o ODS da ONU ao qual o seu projeto de pesquisa está alinhado (cartões compactos com ícones oficiais):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-[320px] overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {[
                    { num: 1, nome: 'Erradicação da Pobreza', bg: '#E5243B', icon: Users },
                    { num: 2, nome: 'Fome Zero e Agricultura Sustentável', bg: '#DDA63A', icon: Utensils },
                    { num: 3, nome: 'Saúde e Bem-Estar', bg: '#4C9F38', icon: Activity },
                    { num: 4, nome: 'Educação de Qualidade', bg: '#C5192D', icon: BookOpen },
                    { num: 5, nome: 'Igualdade de Gênero', bg: '#FF3A21', icon: Venus },
                    { num: 6, nome: 'Água Potável e Saneamento', bg: '#26BDE2', icon: Droplet },
                    { num: 7, nome: 'Energia Limpa e Acessível', bg: '#FCC30B', icon: Sun },
                    { num: 8, nome: 'Trabalho Decente e Crescimento Econômico', bg: '#A21942', icon: TrendingUp },
                    { num: 9, nome: 'Indústria, Inovação e Infraestrutura', bg: '#FD6925', icon: Boxes },
                    { num: 10, nome: 'Redução das Desigualdades', bg: '#DD1367', icon: Move },
                    { num: 11, nome: 'Cidades e Comunidades Sustentáveis', bg: '#FD9D24', icon: Building2 },
                    { num: 12, nome: 'Consumo e Produção Responsáveis', bg: '#BF8B2E', icon: RefreshCw },
                    { num: 13, nome: 'Ação Contra a Mudança Global do Clima', bg: '#3F7E44', icon: Globe },
                    { num: 14, nome: 'Vida na Água', bg: '#0A97D9', icon: Fish },
                    { num: 15, nome: 'Vida Terrestre', bg: '#56C02B', icon: Trees },
                    { num: 16, nome: 'Paz, Justiça e Instituições Eficazes', bg: '#00689D', icon: Scale },
                    { num: 17, nome: 'Parcerias e Meios de Implementação', bg: '#19486A', icon: Share2 },
                    { num: 18, nome: 'Igualdade Étnico-Racial', bg: '#6B4226', icon: User },
                  ].map((ods) => {
                    const odsString = `ODS ${ods.num} - ${ods.nome}`;
                    const isSelected = odsVinculado === odsString;
                    const isLightBg = ods.num === 7;
                    const IconComponent = ods.icon;
                    return (
                      <button
                        key={ods.num}
                        type="button"
                        onClick={() => setOdsVinculado(odsString)}
                        style={{ backgroundColor: ods.bg }}
                        className={`p-1.5 rounded-lg text-left transition-all flex flex-col justify-between min-h-[42px] h-auto relative cursor-pointer shadow-xs hover:scale-[1.02] ${
                          isSelected
                            ? 'ring-2 ring-slate-900 ring-offset-1 scale-[1.02] shadow-md z-10'
                            : 'opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[11px] font-black ${isLightBg ? 'text-slate-950' : 'text-white'}`}>
                            {ods.num}
                          </span>
                          <IconComponent className={`w-3.5 h-3.5 ${isLightBg ? 'text-slate-950' : 'text-white'} opacity-90`} />
                          {isSelected && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-white text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className={`text-[8px] font-bold leading-tight line-clamp-1 ${isLightBg ? 'text-slate-950' : 'text-white'}`}>
                          {ods.nome}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-600">
                  Selecionado: <span className="text-emerald-700 font-bold">{odsVinculado}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                7. Projeto envolve pesquisa com animais? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'sim', label: 'Sim (Requer CEUA)' },
                  { id: 'nao', label: 'Não' },
                  { id: 'nao se aplica', label: 'Não se aplica' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEnvolveAnimais(item.id as any)}
                    className={`py-3.5 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      envolveAnimais === item.id
                        ? 'bg-[#002B49] text-white border-[#002B49] shadow-md ring-2 ring-blue-500/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {envolveAnimais === 'nao' && (
                <div className="mt-3 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Justificativa obrigatória (Pesquisa sem animais) *</span>
                  </label>
                  <textarea
                    value={animaisJustificativa}
                    onChange={(e) => setAnimaisJustificativa(e.target.value)}
                    rows={3}
                    placeholder="Descreva detalhadamente a justificativa para a não utilização de animais nesta pesquisa..."
                    className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs placeholder:text-slate-400"
                    required
                  />
                  <p className="text-[11px] text-amber-800 font-medium">
                    Explique brevemente a metodologia adotada que dispensa o uso de animais (ex: estudos clínicos, simulações computacionais, revisão bibliográfica ou dados secundários).
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                <span>Avançar para Professor Orientador</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- ABA 2: PROFESSOR ORIENTADOR ----------------- */}
        {activeTab === 2 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">2. Identificação &amp; Produção Científica do Professor Orientador</h3>
                <p className="text-xs text-slate-500">Regra do Maior Benefício (H5 vs. Scopus) e validação curricular.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Selecione o Orientador Credenciado *</label>
                <select
                  value={orientadorId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setOrientadorId(id);
                    const sel = orientadores.find((o) => o.id === id);
                    if (sel) {
                      setOrientadorNome(sel.nome || sel.usuarioNome || '');
                      setOrientadorTitulacao(sel.titulacao || 'Doutor');
                      setOrientadorEmail(sel.usuarioEmail || '');
                    }
                  }}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                >
                  {orientadores.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome || o.usuarioNome} — {o.departamento} ({o.titulacao})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">1. Nome do Orientador *</label>
                <input
                  type="text"
                  value={orientadorNome}
                  onChange={(e) => setOrientadorNome(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">2. CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={orientadorCpf}
                  onChange={(e) => setOrientadorCpf(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">3. Titulação *</label>
                <select
                  value={orientadorTitulacao}
                  onChange={(e) => setOrientadorTitulacao(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-xs"
                  required
                >
                  <option value="Doutor">Doutor</option>
                  <option value="Doutorando">Doutorando</option>
                  <option value="Mestre">Mestre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">4. Telefone &amp; E-mail *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="(21) 99999-9999"
                    value={orientadorTelefone}
                    onChange={(e) => setOrientadorTelefone(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                  <input
                    type="email"
                    placeholder="orientador@unig.br"
                    value={orientadorEmail}
                    onChange={(e) => setOrientadorEmail(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">5. Link do ORCID &amp; Link Lattes *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="https://orcid.org/..."
                    value={orientadorOrcid}
                    onChange={(e) => setOrientadorOrcid(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                  <input
                    type="url"
                    placeholder="http://lattes.cnpq.br/..."
                    value={orientadorLattes}
                    onChange={(e) => setOrientadorLattes(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <label className="block text-xs font-extrabold text-slate-900">
                6. Link do artigo/periódico do professor orientador e Índice H5 ou Percentil Scopus do periódico: (5 caixas para inclusão) *
              </label>
              <div className="space-y-2.5">
                {orientadorArtigos.map((artigo, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                    <span className="sm:col-span-1 text-xs font-black text-slate-400">#{idx + 1}</span>
                    <input
                      type="url"
                      placeholder={`Link do artigo / periódico #${idx + 1}`}
                      value={artigo.link}
                      onChange={(e) => {
                        const arr = [...orientadorArtigos];
                        arr[idx].link = e.target.value;
                        setOrientadorArtigos(arr);
                      }}
                      className="sm:col-span-6 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Índice H5"
                      value={artigo.indiceH5}
                      onChange={(e) => {
                        const arr = [...orientadorArtigos];
                        arr[idx].indiceH5 = e.target.value;
                        setOrientadorArtigos(arr);
                      }}
                      className="sm:col-span-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 shadow-2xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Percentil Scopus"
                      value={artigo.percentilScopus}
                      onChange={(e) => {
                        const arr = [...orientadorArtigos];
                        arr[idx].percentilScopus = e.target.value;
                        setOrientadorArtigos(arr);
                      }}
                      className="sm:col-span-3 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 shadow-2xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(3)}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                <span>Avançar para Professor Assistente</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- ABA 3: PROFESSOR ASSISTENTE ----------------- */}
        {activeTab === 3 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">3. Professor Assistente / Professor Voluntário (Opcional)</h3>
                <p className="text-xs text-slate-500">Colaboradores docentes vinculados ao projeto.</p>
              </div>
            </div>

            {assistentes.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <User className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Nenhum professor assistente ou voluntário adicionado.</p>
                <p className="text-[11px] text-slate-500 mt-1">Este item é opcional. Clique abaixo caso queira incluir colaboradores docentes.</p>
                <button
                  type="button"
                  onClick={handleAddAssistente}
                  className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <span>+ Adicionar Professor Assistente / Voluntário</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {assistentes.map((assistente, index) => (
                  <div key={assistente.id} className="p-6 bg-slate-50/80 border border-slate-200 rounded-3xl relative space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-black text-slate-900 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <span>Professor Assistente / Voluntário #{index + 1}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssistente(assistente.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                      >
                        Remover Assistente
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">1. Nome do Professor Assistente / Voluntário *</label>
                        <input
                          type="text"
                          placeholder="Nome completo"
                          value={assistente.nome}
                          onChange={(e) => handleAssistenteChange(assistente.id, 'nome', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">2. CPF *</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={assistente.cpf}
                          onChange={(e) => handleAssistenteChange(assistente.id, 'cpf', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">3. Titulação *</label>
                        <select
                          value={assistente.titulacao}
                          onChange={(e) => handleAssistenteChange(assistente.id, 'titulacao', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900"
                          required
                        >
                          <option value="Doutor">Doutor</option>
                          <option value="Doutorando">Doutorando</option>
                          <option value="Mestre">Mestre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">4. Telefone & E-mail *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Telefone"
                            value={assistente.telefone}
                            onChange={(e) => handleAssistenteChange(assistente.id, 'telefone', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                          <input
                            type="email"
                            placeholder="E-mail"
                            value={assistente.email}
                            onChange={(e) => handleAssistenteChange(assistente.id, 'email', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">5. Link do ORCID & Link Lattes *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="url"
                            placeholder="ORCID (https://orcid.org/...)"
                            value={assistente.orcid}
                            onChange={(e) => handleAssistenteChange(assistente.id, 'orcid', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                          <input
                            type="url"
                            placeholder="Lattes (http://lattes.cnpq.br/...)"
                            value={assistente.lattes}
                            onChange={(e) => handleAssistenteChange(assistente.id, 'lattes', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAssistente}
                  className="w-full py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
                >
                  <span>+ Adicionar Outro Professor Assistente / Voluntário</span>
                </button>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(4)}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                <span>Avançar para Aluno Bolsista</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- ABA 4: ALUNO BOLSISTA ----------------- */}
        {activeTab === 4 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">4. Informações do Aluno Bolsista Candidato</h3>
                <p className="text-xs text-slate-500">CR mínimo exigido (≥ 7.00), declarações e termo de compromisso.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">1. Nome Completo do Bolsista *</label>
                <input
                  type="text"
                  placeholder="Nome completo do aluno"
                  value={bolsistaNome}
                  onChange={(e) => setBolsistaNome(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">2. CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={bolsistaCpf}
                  onChange={(e) => setBolsistaCpf(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">3. Matrícula &amp; Coeficiente (CR Acumulado) *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Matrícula"
                    value={bolsistaMatricula}
                    onChange={(e) => setBolsistaMatricula(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.05"
                    placeholder="CR (Mín 7.0)"
                    value={bolsistaCoeficiente}
                    onChange={(e) => setBolsistaCoeficiente(parseFloat(e.target.value) || 0)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold"
                    required
                  />
                </div>
                {bolsistaCoeficiente < 7.0 && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    Atenção: CR inferior a 7.00 desclassifica o aluno.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">4. Curso e Período Atual *</label>
                <input
                  type="text"
                  placeholder="Ex: Medicina - 4º Período"
                  value={bolsistaCursoPeriodo}
                  onChange={(e) => setBolsistaCursoPeriodo(e.target.value)}
                  className="w-full px-4.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">5. Telefone &amp; E-mail Institucional *</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={bolsistaTelefone}
                    onChange={(e) => setBolsistaTelefone(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                  <input
                    type="email"
                    placeholder="aluno@aluno.unig.br"
                    value={bolsistaEmail}
                    onChange={(e) => setBolsistaEmail(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">6. Link do ORCID &amp; Link Lattes</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="ORCID"
                    value={bolsistaOrcid}
                    onChange={(e) => setBolsistaOrcid(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                  />
                  <input
                    type="url"
                    placeholder="Lattes"
                    value={bolsistaLattes}
                    onChange={(e) => setBolsistaLattes(e.target.value)}
                    className="px-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-2">7. Modalidade de Ações Afirmativas? *</label>
                <div className="flex space-x-8">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="bolsistaAfirmativa"
                      checked={bolsistaAcoesAfirmativas === 'nao'}
                      onChange={() => setBolsistaAcoesAfirmativas('nao')}
                    />
                    <span>Não (Ampla Concorrência)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="bolsistaAfirmativa"
                      checked={bolsistaAcoesAfirmativas === 'sim'}
                      onChange={() => setBolsistaAcoesAfirmativas('sim')}
                    />
                    <span>Sim (Ações Afirmativas / Cotas)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <label className="flex items-start space-x-3 cursor-pointer bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={bolsistaDeclaracaoParentesco}
                  onChange={(e) => setBolsistaDeclaracaoParentesco(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 shrink-0 w-4 h-4"
                  required
                />
                <span className="text-xs text-slate-900 font-bold leading-relaxed">
                  8. Declaro não possuir vínculo de matrimônio, união estável ou parentesco (até 4º grau) com o professor orientador. *
                </span>
              </label>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 space-y-3">
                <p className="text-xs font-extrabold text-blue-950">9. Termo de Compromisso do Aluno e do Professor Orientador *</p>
                <p className="text-xs text-blue-900 leading-relaxed italic">
                  "O aluno bolsista e o professor orientador compromete-se a cumprir rigorosamente as normas do Programa de Iniciação Científica da UNIG, apresentar resultados na Jornada Científica e zelar pela ética em pesquisa."
                </p>
                <label className="flex items-center space-x-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bolsistaTermoAceito}
                    onChange={(e) => setBolsistaTermoAceito(e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                    required
                  />
                  <span className="text-xs font-extrabold text-blue-950">
                    10. Li e aceito o Termo de Compromisso do Aluno e do Professor Orientador *
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(3)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(5)}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                <span>Avançar para Alunos Voluntários</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- ABA 5: ALUNOS VOLUNTÁRIOS ----------------- */}
        {activeTab === 5 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">5. Informações dos Alunos Voluntários (Até 4 voluntários)</h3>
                  <p className="text-xs text-slate-500">Colaboradores discentes sem bolsa vinculados à equipe.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVoluntario}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Voluntário</span>
              </button>
            </div>

            {voluntarios.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs bg-slate-50/80 rounded-3xl border border-dashed border-slate-200 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">Nenhum aluno voluntário adicionado.</p>
                <p className="text-slate-400">Clique em "Adicionar Voluntário" caso deseje incluir colaboradores voluntários no projeto.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {voluntarios.map((vol, index) => (
                  <div key={vol.id} className="p-6 md:p-8 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-5 relative shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200">
                        Voluntário #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVoluntario(vol.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        title="Remover voluntário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">1. Nome *</label>
                        <input
                          type="text"
                          value={vol.nome}
                          onChange={(e) => handleVoluntarioChange(vol.id, 'nome', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">2. CPF *</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={vol.cpf}
                          onChange={(e) => handleVoluntarioChange(vol.id, 'cpf', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">3. Matrícula &amp; Coeficiente *</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Matrícula"
                            value={vol.matricula}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'matricula', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                          <input
                            type="number"
                            step="0.05"
                            placeholder="CR"
                            value={vol.coeficiente}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'coeficiente', parseFloat(e.target.value) || 0)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 font-bold"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">4. Curso e Período Atual *</label>
                        <input
                          type="text"
                          placeholder="Ex: Enfermagem - 3º Período"
                          value={vol.cursoPeriodo}
                          onChange={(e) => handleVoluntarioChange(vol.id, 'cursoPeriodo', e.target.value)}
                          className="w-full px-4.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">5. Telefone &amp; E-mail *</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Telefone"
                            value={vol.telefone}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'telefone', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                          <input
                            type="email"
                            placeholder="E-mail"
                            value={vol.email}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'email', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">6. Link do ORCID &amp; Link Lattes</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="url"
                            placeholder="ORCID"
                            value={vol.orcid}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'orcid', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          />
                          <input
                            type="url"
                            placeholder="Lattes"
                            value={vol.lattes}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'lattes', e.target.value)}
                            className="px-3.5 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3 pt-3 border-t border-slate-200/60">
                        <label className="flex items-center space-x-3 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vol.declaracaoParentesco}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'declaracaoParentesco', e.target.checked)}
                            className="rounded text-blue-600 w-4 h-4"
                            required
                          />
                          <span className="font-bold text-slate-800">
                            8. Declaro não possuir vínculo de matrimônio, união estável ou parentesco (até 4º grau) com o professor orientador. *
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vol.termoAceito}
                            onChange={(e) => handleVoluntarioChange(vol.id, 'termoAceito', e.target.checked)}
                            className="rounded text-blue-600 w-4 h-4"
                            required
                          />
                          <span className="font-extrabold text-blue-950">
                            10. Li e aceito o Termo de Compromisso do Aluno Voluntário e Professor Orientador *
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(4)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(6)}
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
              >
                <span>Avançar para Anexos &amp; Declarações</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- ABA 6: ANEXOS & DECLARAÇÕES ----------------- */}
        {activeTab === 6 && (
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/80 shadow-xl space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">6. Anexos em PDF &amp; Declarações Oficiais do Edital</h3>
                <p className="text-xs text-slate-500">Custódia documental com hash SHA-256 e validação regimental.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                <BadgeCheck className="w-4 h-4" />
                <span>Orientações para o Envio dos Anexos em PDF</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-100">
                O arquivo submetido deve conter o projeto completo de pesquisa, cronograma de execução, orçamento (se aplicável), termos de consentimento livre e esclarecido (TCLE) e assinaturas digitalizadas do professor orientador e alunos participantes, salvos em formato PDF único.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-amber-400 transition-colors bg-slate-50/70">
              <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-bounce" />
              <p className="text-xs font-bold text-slate-800">
                Selecione o Projeto Completo em PDF (com Anexos)
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                O sistema calculará automaticamente o Hash SHA-256 para garantir a autenticidade jurídica e imutabilidade perante a PROPEP.
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-4 text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-2xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer shadow-sm"
                required
              />
            </div>

            {arquivoNome && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-800 truncate">{arquivoNome}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 truncate max-w-sm shadow-2xs">
                  SHA-256: {isHashing ? 'Computando...' : arquivoHash || 'Calculado'}
                </div>
              </div>
            )}

            {/* Declarações Finais Obrigatórias */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <label className="flex items-start space-x-3.5 cursor-pointer bg-slate-50/80 p-5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={declaracaoVerdade}
                  onChange={(e) => setDeclaracaoVerdade(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 shrink-0 w-4 h-4"
                  required
                />
                <span className="text-xs text-slate-900 font-extrabold leading-relaxed">
                  Declaro que todas as informações prestadas, inclusive as dos alunos e professores indicados, são verdadeiras e de minha inteira responsabilidade. *
                </span>
              </label>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <div className="text-[11px] text-slate-700 leading-relaxed space-y-2 font-mono bg-white p-5 rounded-2xl border border-slate-200 overflow-y-auto max-h-64 shadow-inner">
                  <p className="font-bold text-slate-900 font-sans text-xs">
                    Li o Edital PIC-UNIG 2027 e o Regulamento do PIC-UNIG
                  </p>
                  <p className="font-semibold text-rose-700 font-sans">
                    Atenção: Antes de submeter, leia o Edital e o Regulamento do PIC-UNIG, reúna todos os documentos listados abaixo — inclusive os dos alunos indicados — e salve-os em formato PDF, observando rigorosamente o padrão de nomenclatura estabelecido no Anexo V do Edital. Arquivos que não seguirem o padrão indicado poderão não ser aceitos pelo sistema.
                  </p>
                  <p className="font-bold text-slate-900 font-sans">Atenção: Só serão aceitos arquivos em PDF.</p>
                  <p><strong>a)</strong> 01 (uma) cópia do projeto de pesquisa, com identificação do orientador, (modelo disponível no endereço <a href="https://unignet.com.br/pic/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://unignet.com.br/pic/</a>); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(1_PROJETO_PRIMEIRO_ÚLTIMO_SOBRENOME_ORIENTADOR_CURSO)</span>.<br/>
                  Exemplos: (1_PROJETO_MARCELO_CRUZ_FIS), para curso de graduação, ou (1_PROJETO_MARCELO_CRUZ_MEST_VIGIL), para Programa de Mestrado.</p>

                  <p><strong>b)</strong> Documento que comprove o Coeficiente de Rendimento (CR) do aluno indicado à vaga de bolsista, igual ou superior a 7 (sete); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(2_CR_ALUNO_PRIMEIRO_ÚLTIMO_SOBRENOME_ALUNO_CURSO)</span>.<br/>
                  Exemplo: (2_CR_ALUNO_JOAO_SILVA_ENF).</p>

                  <p><strong>(OPCIONAL CONFORME O TIPO DE PROJETO) c)</strong> Documento que comprove, quando aplicável, a submissão e/ou aprovação do projeto pelo Comitê de Ética em Pesquisa (CEP), e/ou pelo Comitê de Ética no Uso de Animais (CEUA)... Os projetos sujeitos à apreciação ética devem ser submetidos obrigatoriamente com o comprovante de submissão ao CEP/CEUA, ainda que pendente de aprovação. Caso a aprovação ocorra após o envio do projeto, o parecer deverá ser encaminhado à parte, por e-mail pic@campus1.unig.br, impreterivelmente até 10/12/2026. O não envio dessa comprovação até o prazo implicará a desclassificação do projeto.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(3_PB_CEP_PRIMEIRO_ÚLTIMO_SOBRENOME_ORIENTADOR_CURSO)</span>.<br/>
                  Exemplos: (3_PB_CEP_MARCELO_CRUZ_ODONT), para curso de graduação, ou (3_PB_CEP_MARCELO_CRUZ_MEST_VULN), para Programa de Mestrado.</p>

                  <p><strong>d)</strong> Carta de ciência e acordo do coordenador de graduação, ou da Coordenação do Programa de Pós-Graduação Stricto Sensu (Mestrado) ao qual o projeto se vincula (modelo disponível em <a href="https://unignet.com.br/pic/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://unignet.com.br/pic/</a>); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(4_CIENCIA_COORDENADOR_PRIMEIRO_ÚLTIMO_SOBRENOME_ORIENTADOR_CURSO)</span>.<br/>
                  Exemplo: (4_CIENCIA_COORDENADOR_MARCELO_CRUZ_ENF).</p>

                  <p><strong>e)</strong> Termo de Compromisso entre o(s) aluno(s) indicado(s) e o professor orientador, devidamente assinado por ambos (modelo disponível em <a href="https://unignet.com.br/pic/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://unignet.com.br/pic/</a>); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(5_TERMO_COMPROMISSO_PRIMEIRO_ÚLTIMO_SOBRENOME_ALUNO_CURSO)</span>.<br/>
                  Exemplo: (5_TERMO_COMPROMISSO_JOAO_SILVA_MED).</p>

                  <p><strong>(OPCIONAL CONFORME O TIPO DE PROJETO) f)</strong> Parecer da Coordenação do NUPEX, exclusivo para projetos com experimentação animal no Núcleo de Pesquisa Experimental, quando aplicável (e-mail: experimental.pesquisa@campus1.unig.br); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(6_PARECER_NUPEX_PRIMEIRO_ÚLTIMO_SOBRENOME_ORIENTADOR_CURSO)</span>.<br/>
                  Exemplo: (6_PARECER_NUPEX_MARCELO_CRUZ_DIR).</p>

                  <p><strong>(OPCIONAL CONFORME O TIPO DE PROJETO) g)</strong> Ficha de autodeclaração, exclusiva para os alunos indicados que optarem pela modalidade de ações afirmativas (modelo disponível em <a href="https://unignet.com.br/pic/" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://unignet.com.br/pic/</a>); em PDF.<br/>
                  O arquivo deverá ser nomeado como: <span className="text-blue-800 font-bold">(7_AUTODECLARACAO_PRIMEIRO_ÚLTIMO_SOBRENOME_ALUNO_CURSO)</span>.<br/>
                  Exemplo: (7_AUTODECLARACAO_JOAO_SILVA_FIS).</p>

                  <p className="font-semibold">Consultar o Anexo III (Lista de Abreviações dos Cursos de Graduação) e o Anexo VI (Programas de Pós-Graduação Stricto Sensu) do Edital para o preenchimento correto do campo "CURSO" na nomenclatura dos arquivos.</p>

                  <p className="font-bold text-rose-700">
                    ATENÇÃO: NÃO SERÃO ACEITAS PROPOSTAS SUBMETIDAS POR QUALQUER OUTRA VIA, INCOMPLETAS, OU FORA DO PRAZO, SENDO DE INTEIRA RESPONSABILIDADE DO PROFESSOR ORIENTADOR. A AUSÊNCIA DE QUALQUER DOCUMENTO OU INFORMAÇÃO, DO ORIENTADOR OU DOS ALUNOS INDICADOS, LEVARÁ À DESCLASSIFICAÇÃO AUTOMÁTICA DO PROJETO OU CORRESPONDENTE, CONFORME O CASO.
                  </p>
                </div>

                <label className="flex items-start space-x-3.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={declaracaoAusenciaDocumento}
                    onChange={(e) => setDeclaracaoAusenciaDocumento(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 shrink-0 w-4 h-4"
                    required
                  />
                  <span className="text-xs text-slate-900 font-extrabold leading-relaxed">
                    2ª Declaração: Li o Edital PIC-UNIG 2027 e o Regulamento do PIC-UNIG, e estou ciente de todas as exigências de documentação, nomenclatura de arquivos e prazos. *
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(5)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                ← Voltar
              </button>
              <button
                id="btn-submeter-proposta-final"
                type="submit"
                disabled={isSubmitting || !declaracaoVerdade || !declaracaoAusenciaDocumento}
                className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-2xl text-xs font-black shadow-2xl transition-all disabled:opacity-50 cursor-pointer transform hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>
                  {isSubmitting ? 'Submetendo Proposta...' : 'Finalizar e Submeter Proposta Oficial'}
                </span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
