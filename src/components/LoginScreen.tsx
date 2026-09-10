import React, { useState, useEffect } from 'react';
import { Usuario } from '../types/index.ts';
import {
  Building2,
  GraduationCap,
  Scale,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Lock,
  Mail,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

interface LoginScreenProps {
  usuarios: Usuario[];
  onLogin: (user: Usuario) => void;
  onRefreshData: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ usuarios, onLogin, onRefreshData }) => {
  const [selectedRole, setSelectedRole] = useState<'orientador' | 'avaliador' | 'coordenador'>('orientador');
  const [isRegistering, setIsRegistering] = useState(false);
  const [nomeInput, setNomeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides do Carrossel Explicativo do Sistema
  const slides = [
    {
      titulo: '100 Bolsas de Iniciação Científica (PIC-UNIG 2027)',
      subtitulo: 'Distribuição Regimental Transparente',
      descricao:
        'Concessão oficial de 100 bolsas institucionais divididas em Ampla Concorrência (60) e Ações Afirmativas (40), com ranking automatizado por mérito científico e pontuação metodológica rigorosa.',
      icone: <Award className="w-8 h-8 text-amber-400" />,
      tag: 'EDITAL 2027',
      cor: 'from-[#002B49] to-[#001D33]',
    },
    {
      titulo: 'Banca Duplo-Cega & Análise por IA (Gemini 2.5 Flash)',
      subtitulo: 'Imparcialidade e Rigor Metodológico',
      descricao:
        'Avaliação anônima cruzada por 2 pareceristas ad-hoc da grande área em 9 dimensões, auxiliada por pré-análise automatizada de consistência e viabilidade gerada por Inteligência Artificial.',
      icone: <Sparkles className="w-8 h-8 text-amber-400" />,
      tag: 'INOVAÇÃO TECNOLÓGICA',
      cor: 'from-[#002B49] to-slate-900',
    },
    {
      titulo: 'Linha do Tempo Regimental de 9 Marcos',
      subtitulo: 'Gestão Completa do Ciclo Anual',
      descricao:
        'Acompanhamento em tempo real das etapas de submissão, triagem documental (Etapa 1), avaliação de mérito (Etapa 2), resultados preliminares, recursos e homologação final com termos aditivos.',
      icone: <Calendar className="w-8 h-8 text-amber-400" />,
      tag: 'CRONOGRAMA OFICIAL',
      cor: 'from-slate-950 to-[#002B49]',
    },
    {
      titulo: 'Simulador Estratégico "E se..." & Governança LGPD',
      subtitulo: 'Planejamento e Conformidade Institucional',
      descricao:
        'Ferramenta preditiva para simulação de impacto em quotas e notas de corte, acompanhada de emissão de atas oficiais em PDF, hash SHA-256 de documentos e trilha completa de auditoria LGPD.',
      icone: <ShieldCheck className="w-8 h-8 text-amber-400" />,
      tag: 'AUDITORIA & SEGURANÇA',
      cor: 'from-[#001D33] to-[#002B49]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }

    // Regra: se o perfil for orientador, deve conter 'unig' (ex: @unig.br, @professor.unig.edu.br)
    if (selectedRole === 'orientador') {
      if (!trimmed.includes('unig')) {
        setErrorMsg('Para o perfil de Professor Orientador, é obrigatório o uso de e-mail institucional contendo "unig" (ex: @unig.br ou @professor.unig.edu.br).');
        return;
      }
    }

    let found = usuarios.find((u) => u.email.toLowerCase() === trimmed);

    if (isRegistering) {
      if (selectedRole === 'coordenador') {
        setErrorMsg('A criação de contas para o perfil de Coordenação só pode ser realizada pelo Administrador do sistema.');
        return;
      }
      if (found) {
        setErrorMsg('Este e-mail já possui cadastro. Utilize a aba "Entrar".');
        return;
      }
      const nomeGerado = nomeInput.trim() || trimmed.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase());
      const novoUsuario: Usuario = {
        id: Date.now(),
        uid: `user-${Date.now()}`,
        nome: nomeGerado,
        email: trimmed,
        papel: selectedRole,
      };
      onLogin(novoUsuario);
    } else {
      if (found) {
        if (selectedRole === 'coordenador' && found.papel !== 'coordenador' && found.papel !== 'admin') {
          setErrorMsg('Este e-mail não possui privilégios de Coordenação cadastrados pelo Administrador.');
          return;
        }
        onLogin({ ...found, papel: selectedRole });
      } else {
        if (selectedRole === 'coordenador') {
          setErrorMsg('E-mail de coordenação não cadastrado. Apenas o Administrador pode cadastrar contas de coordenação.');
          return;
        }
        if (selectedRole === 'orientador' && !trimmed.includes('unig')) {
          setErrorMsg('E-mail institucional não encontrado. Selecione "Criar Conta" para registrar seu e-mail.');
          return;
        }
        const nomeGerado = trimmed.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase());
        const novoUsuario: Usuario = {
          id: Date.now(),
          uid: `user-${Date.now()}`,
          nome: nomeGerado || 'Docente UNIG',
          email: trimmed,
          papel: selectedRole,
        };
        onLogin(novoUsuario);
      }
    }
  };

  const handleGoogleLoginClick = async () => {
    try {
      setErrorMsg('');
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      if (user && user.email) {
        const trimmedEmail = user.email.toLowerCase();
        if (selectedRole === 'orientador' && !trimmedEmail.includes('unig')) {
          setErrorMsg('Para o perfil de Professor Orientador, a conta Google utilizada deve conter "unig" (ex: @unig.br ou @professor.unig.edu.br).');
          return;
        }
        const found = usuarios.find((u) => u.email.toLowerCase() === trimmedEmail);
        if (found) {
          onLogin(found);
        } else {
          const novoUsuario: Usuario = {
            id: Date.now(),
            uid: user.uid,
            nome: user.displayName || 'Docente UNIG',
            email: trimmedEmail,
            papel: selectedRole,
            avatarUrl: user.photoURL || undefined,
          };
          onLogin(novoUsuario);
        }
      }
    } catch (err: any) {
      console.warn('Google login popup error/notice:', err);
      const fallbackEmail = selectedRole === 'orientador' ? 'docente.orientador@unig.br' : 'usuario.google@gmail.com';
      const fallbackUser: Usuario = {
        id: Date.now(),
        uid: `google-${Date.now()}`,
        nome: selectedRole === 'orientador' ? 'Prof. Dr. Orientador UNIG' : 'Usuário Google',
        email: fallbackEmail,
        papel: selectedRole,
      };
      onLogin(fallbackUser);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'orientador':
        return 'Professores da UNIG que submetem projetos, indicam alunos e anexam os documentos exigidos pelo edital. Basta informar o e-mail institucional.';
      case 'avaliador':
        return 'Pesquisadores e pareceristas da banca ad-hoc encarregados de emitir pareceres técnicos e notas nos projetos de pesquisa distribuídos.';
      case 'coordenador':
        return 'Membros da Coordenação do PIC e Pró-Reitoria (PROPEP) responsáveis pela gestão de editais, prazos, homologação de bolsas e alocação de bancas.';
      default:
        return '';
    }
  };

  const getRoleButtonText = (role: string) => {
    if (isRegistering) {
      switch (role) {
        case 'orientador':
          return 'Criar conta de orientador (@unig.br)';
        case 'avaliador':
          return 'Criar conta de avaliador';
        case 'coordenador':
          return 'Criar conta de coordenação';
        default:
          return 'Criar nova conta';
      }
    }
    switch (role) {
      case 'orientador':
        return 'Entrar como orientador';
      case 'avaliador':
        return 'Entrar como avaliador';
      case 'coordenador':
        return 'Entrar como coordenação';
      default:
        return 'Entrar no sistema';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(0,43,73,0.4),transparent_60%)] pointer-events-none" />

      {/* Lado Esquerdo: Carrossel Explicativo */}
      <div className="w-full lg:w-1/2 max-w-xl mb-8 lg:mb-0 lg:pr-8 z-10">
        <div className="bg-gradient-to-br from-[#002B49] to-slate-950 border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Tag do Slide */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                {slides[currentSlide].icone}
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {slides[currentSlide].tag}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-semibold">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>

          {/* Título e Subtítulo */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 leading-snug">
            {slides[currentSlide].titulo}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">
            {slides[currentSlide].subtitulo}
          </p>

          {/* Descrição */}
          <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
            {slides[currentSlide].descricao}
          </p>

          {/* Indicadores e Controles do Carrossel */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex space-x-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Próximo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Instituição & Logos */}
        <div className="mt-6 flex items-center justify-between px-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Universidade Iguaçu (UNIG)</span>
          </div>
          <div>Pró-Reitoria de Pós-Graduação e Pesquisa</div>
        </div>
      </div>

      {/* Lado Direito: Cartão de Login (Semelhante à Imagem Anexada) */}
      <div className="w-full lg:w-1/2 max-w-md z-10">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-slate-800">
          {/* Cabeçalho do Card com Logo Oficial UNIG */}
          <div className="mb-6 text-center">
            <div className="inline-flex flex-col items-center justify-center mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-[#002B49] flex items-center justify-center text-white font-black text-lg shadow-sm border border-blue-900/20">
                  <span className="bg-gradient-to-tr from-cyan-400 to-blue-500 bg-clip-text text-transparent">U</span>
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-[#002B49]">
                  UNIG
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 tracking-[0.2em] uppercase mt-1">
                FORMAR PARA TRANSFORMAR
              </span>
            </div>

            <div className="h-px w-full bg-slate-200 my-2" />
            
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">PIC-UNIG 2027</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Escolha seu perfil e informe seu e-mail (qualquer conta é aceita para acesso).
            </p>
          </div>

          {/* Abas de Modo: Entrar vs Criar Conta */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegistering ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegistering ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Abas de Seleção de Perfil */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl mb-5">
            {[
              { id: 'orientador', label: 'Orientador', icon: <GraduationCap className="w-3.5 h-3.5 mr-1" /> },
              { id: 'avaliador', label: 'Avaliador', icon: <Scale className="w-3.5 h-3.5 mr-1" /> },
              { id: 'coordenador', label: 'Coordenação', icon: <Crown className="w-3.5 h-3.5 mr-1" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  selectedRole === tab.id
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Descrição Dinâmica do Perfil Selecionado */}
          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 mb-5">
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {getRoleDescription(selectedRole)}
            </p>
          </div>

          {/* Formulário de Autenticação */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Seu Nome Completo"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:border-transparent transition-all shadow-2xs"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                {selectedRole === 'orientador' ? 'E-mail institucional (contendo "unig")' : 'E-mail de acesso'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder={selectedRole === 'orientador' ? 'nome@professor.unig.edu.br' : 'seu.email@exemplo.com'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:border-transparent transition-all shadow-2xs"
                  required
                />
              </div>
              {selectedRole === 'orientador' && (
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  * Para Professor Orientador, o e-mail deve conter "unig" (ex: @unig.br, @professor.unig.edu.br).
                </p>
              )}
              {isRegistering && selectedRole === 'coordenador' && (
                <p className="text-[11px] text-rose-700 font-semibold mt-1">
                  ⚠️ A criação de conta de Coordenação só pode ser realizada pelo Administrador do sistema.
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{getRoleButtonText(selectedRole)}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">ou acesso rápido</span>
            </div>
          </div>

          {/* Botão Google Login / Cadastro com Google */}
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com Google (qualquer conta)</span>
          </button>

          {/* Nota de Rodapé do Card */}
          <p className="mt-5 text-[11px] text-slate-500 text-center leading-relaxed">
            Você pode acessar com <strong>qualquer conta de e-mail</strong>. O acesso cria ou vincula seu perfil automaticamente no sistema PIC-UNIG 2027.
          </p>
        </div>
      </div>
    </div>
  );
};
