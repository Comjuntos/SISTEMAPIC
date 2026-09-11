import React, { useState, useRef } from 'react';
import { Usuario } from '../types/index.ts';
import { MENUS_SISTEMA, MenuMeta } from '../data/menuMetadata.ts';
import { NavbarHoverCard, getMenuIcon } from './NavbarHoverCard.tsx';
import { ModalMatrizAcessos } from './ModalMatrizAcessos.tsx';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Award,
  ChevronDown,
  LogOut,
  Building2,
  Sparkles,
  Layers,
  Bell,
  HelpCircle,
  Lock,
  Users,
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut } from 'firebase/auth';

interface NavbarProps {
  currentUser: Usuario;
  setCurrentUser: (u: Usuario) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  usuariosDisponiveis: Usuario[];
  onRefreshData: () => void;
  onOpenGestaoUsuarios: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  setCurrentUser,
  activeTab,
  setActiveTab,
  usuariosDisponiveis,
  onRefreshData,
  onOpenGestaoUsuarios,
  onLogout,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showMatrizModal, setShowMatrizModal] = useState(false);
  const [showGestaoDropdown, setShowGestaoDropdown] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const isGestor = currentUser.papel === 'coordenador' || currentUser.papel === 'admin';
  const itensGestaoIds = ['projetos', 'bolsas', 'simulador', 'relatorios'];
  const isGestaoActive = itensGestaoIds.includes(activeTab);

  const handleMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenuId(id);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenuId(null);
    }, 140);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      if (user) {
        const matching = usuariosDisponiveis.find((u) => u.email === user.email);
        if (matching) {
          setCurrentUser(matching);
        } else {
          setCurrentUser({
            id: 999,
            uid: user.uid,
            nome: user.displayName || 'Docente UNIG',
            email: user.email || 'usuario@unig.br',
            papel: 'avaliador',
            avatarUrl: user.photoURL || undefined,
          });
        }
      }
    } catch (err) {
      console.warn('Google Auth popup notice:', err);
    }
  };

  const getRoleBadge = (papel: string) => {
    switch (papel) {
      case 'admin':
        return { label: 'Administrador Geral', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'coordenador':
        return { label: 'Coordenação PIC', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'avaliador':
        return { label: 'Parecerista Titular', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'orientador':
        return { label: 'Docente Orientador', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Pesquisador', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const currentRole = getRoleBadge(currentUser.papel);

  const papelInstrucao = (() => {
    if (currentUser.papel === 'orientador') {
      return 'Missão Docente: Submeter propostas de pesquisa, vincular alunos e consultar editais.';
    }
    if (currentUser.papel === 'avaliador') {
      return 'Missão Parecerista: Emitir avaliações consubstanciadas nos projetos distribuídos da banca.';
    }
    return 'Governança Institucional: Gestão de editais, prazos regimentais, homologação e 100 bolsas.';
  })();

  return (
    <header className="bg-[#002B49] text-white border-b border-[#001D33] shadow-md sticky top-0 z-40">
      {/* Barra de Topo Institucional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          {/* Logo e Nome da Instituição */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-amber-400/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">UNIG</span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PIC 2027
                </span>
                <span className="text-xs text-slate-300 hidden md:inline">
                  | Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP)
                </span>
              </div>
              <p className="text-xs text-slate-300 tracking-wide">
                Sistema Institucional de Gestão e Avaliação da Iniciação Científica
              </p>
            </div>
          </div>

          {/* Ações Rápidas, Guia de Papéis & Persona Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Botão Guia de Menus e Permissões */}
            <button
              id="btn-nav-matriz-acessos"
              onClick={() => setShowMatrizModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
              title="Ver todas as funções do sistema e quem pode visualizá-las"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold hidden sm:inline">Mapa de Funções &amp; Papéis</span>
            </button>

            {/* Atalho para o Quadro de Avisos e Cronograma */}
            <button
              id="btn-nav-quadro-avisos"
              onClick={() => {
                const el = document.getElementById('quadro-avisos-edital');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  el.classList.add('ring-4', 'ring-amber-400');
                  setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2500);
                }
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center space-x-1.5"
              title="Avisos Importantes do Edital & Prazos"
            >
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold hidden md:inline">Avisos do Edital</span>
            </button>

            {/* Seletor rápido de Perfil para testes de Banca / Coordenação */}
            <div className="relative">
              <button
                id="btn-persona-switcher"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-slate-200 transition-colors cursor-pointer"
                title="Alternar Perfil para simular Pareceristas, Docentes e Coordenadores"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.nome} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.nome.charAt(0)
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-medium text-white line-clamp-1 max-w-[130px]">{currentUser.nome}</div>
                  <div className="text-[10px] text-amber-300 font-semibold">{currentRole.label}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {showPersonaMenu && (
                <div
                  id="dropdown-persona-list"
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl py-2 z-50 text-slate-800 border border-slate-200 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Alternar Perfil de Teste (Banca / Docência / Gestão)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Navegue pelo sistema com a perspectiva de Pareceristas, Docentes Orientadores, Coordenadores ou Administrador.
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {usuariosDisponiveis.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowPersonaMenu(false);
                          onRefreshData();
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          currentUser.id === u.id ? 'bg-amber-50/70 font-bold' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.nome} className="w-full h-full object-cover" />
                          ) : (
                            u.nome.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{u.nome}</p>
                          <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-medium mt-0.5 ${
                              getRoleBadge(u.papel).color
                            }`}
                          >
                            {getRoleBadge(u.papel).label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-3 pt-2 border-t border-slate-100 flex flex-col space-y-1.5">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onOpenGestaoUsuarios();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>Gerenciar Contas &amp; Papéis (Coordenação)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        signOut(auth).catch(() => {});
                        onLogout();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sair do Sistema (Tela de Login)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Navegação Horizontal com Todos os Menus e Hover Informativo */}
        <div className="py-2.5 border-t border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <nav className="flex flex-wrap items-center gap-1.5 py-0.5 flex-1">
            {MENUS_SISTEMA.map((menu, index) => {
              const isGestor = currentUser.papel === 'coordenador' || currentUser.papel === 'admin';
              
              // Ocultar itens de gestao do loop principal pois serão agrupados no menu "Gestão"
              if (itensGestaoIds.includes(menu.id)) {
                return null;
              }

              const isActive =
                activeTab === menu.id ||
                (menu.id === 'editais' && activeTab === 'anexos' && false);

              const isHovered = hoveredMenuId === menu.id;

              // Calcular alinhamento do hover card para não vazar a tela
              const align =
                index <= 1 ? 'left' : index >= MENUS_SISTEMA.length - 2 ? 'right' : 'center';

              // Identificar se é o papel primordial
              const isPrioridadeDocente = currentUser.papel === 'orientador' && (menu.id === 'submissao' || menu.id === 'projetos');
              const isPrioridadeBanca = currentUser.papel === 'avaliador' && menu.id === 'banca';

              return (
                <div
                  key={menu.id}
                  className="relative shrink-0"
                  onMouseEnter={() => handleMouseEnter(menu.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    id={`tab-${menu.id}`}
                    onClick={() => {
                      setActiveTab(menu.id);
                      setHoveredMenuId(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center space-x-1.5 cursor-pointer relative ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-2 ring-amber-400/40'
                        : isPrioridadeDocente || isPrioridadeBanca
                        ? 'bg-white/15 text-white hover:bg-white/20 ring-1 ring-emerald-400/50'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-slate-950' : 'text-amber-400'}>
                      {getMenuIcon(menu.iconeNome, 'w-3.5 h-3.5')}
                    </span>
                    <span>{menu.label}</span>

                    {/* Badges de Destaque */}
                    {menu.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider ${
                          isActive ? 'bg-slate-950 text-white' : menu.badgeCor || 'bg-amber-400 text-slate-950'
                        }`}
                      >
                        {menu.badge}
                      </span>
                    )}

                    {/* Sinalizador para Docentes */}
                    {isPrioridadeDocente && !isActive && menu.id === 'submissao' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    )}
                  </button>

                  {/* Popover Flutuante ao Passar o Mouse (Hover Card) */}
                  {isHovered && (
                    <NavbarHoverCard
                      meta={menu}
                      currentUser={currentUser}
                      currentRoleLabel={currentRole.label}
                      onNavigate={(tabId) => {
                        setActiveTab(tabId);
                        setHoveredMenuId(null);
                      }}
                      align={align}
                    />
                  )}
                </div>
              );
            })}

            {/* Menu Gestão exclusivo para Coordenadores e Admins */}
            {isGestor && (
              <div className="relative shrink-0">
                <button
                  id="tab-gestao-dropdown"
                  onClick={() => setShowGestaoDropdown(!showGestaoDropdown)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center space-x-1.5 cursor-pointer relative ${
                    isGestaoActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-2 ring-amber-400/40'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={isGestaoActive ? 'text-slate-950' : 'text-amber-400'}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span>Gestão</span>
                  <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider">
                    4 MÓDULOS
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGestaoDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showGestaoDropdown && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Governança & Gestão</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">Coordenação PIC</span>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {MENUS_SISTEMA.filter(m => itensGestaoIds.includes(m.id)).map(menu => {
                        const isSubActive = activeTab === menu.id || (menu.id === 'relatorios' && activeTab === 'auditoria');
                        return (
                          <button
                            key={menu.id}
                            onClick={() => {
                              setActiveTab(menu.id);
                              setShowGestaoDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/60'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={isSubActive ? 'text-amber-600' : 'text-slate-500'}>
                              {getMenuIcon(menu.iconeNome, 'w-4 h-4')}
                            </span>
                            <div className="flex-1 truncate">
                              <div className="flex items-center justify-between">
                                <span className="truncate">{menu.label}</span>
                                {menu.badge && (
                                  <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                                    {menu.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate font-normal">{menu.categoria}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Dica do Perfil Vigente */}
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-slate-300 bg-white/5 px-3 py-1 rounded-xl border border-white/10 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-bold text-amber-200">{currentRole.label}:</span>
            <span className="truncate max-w-xs">{papelInstrucao}</span>
          </div>
        </div>
      </div>

      {/* Modal Matriz Geral de Acessos & Papéis */}
      <ModalMatrizAcessos
        isOpen={showMatrizModal}
        onClose={() => setShowMatrizModal(false)}
        currentUser={currentUser}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setShowMatrizModal(false);
        }}
      />
    </header>
  );
};
