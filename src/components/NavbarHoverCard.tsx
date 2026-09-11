import React from 'react';
import { MenuMeta } from '../data/menuMetadata.ts';
import { Usuario } from '../types/index.ts';
import {
  BarChart3,
  Calendar,
  FileText,
  Send,
  FolderKanban,
  Sparkles,
  Award,
  SlidersHorizontal,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  Shield,
  UserCheck,
  GraduationCap,
  Scale,
  Crown,
  ArrowRight,
} from 'lucide-react';

interface NavbarHoverCardProps {
  meta: MenuMeta;
  currentUser: Usuario;
  currentRoleLabel: string;
  onNavigate: (tabId: string) => void;
  align?: 'left' | 'center' | 'right';
}

export const getMenuIcon = (iconeNome: string, className = 'w-4 h-4') => {
  switch (iconeNome) {
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Send':
      return <Send className={className} />;
    case 'FolderKanban':
      return <FolderKanban className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'SlidersHorizontal':
      return <SlidersHorizontal className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    default:
      return <FileCheck className={className} />;
  }
};

export const NavbarHoverCard: React.FC<NavbarHoverCardProps> = ({
  meta,
  currentUser,
  currentRoleLabel,
  onNavigate,
  align = 'center',
}) => {
  const isGestor = currentUser.papel === 'coordenador' || currentUser.papel === 'admin';
  const isAvaliador = currentUser.papel === 'avaliador';
  const isOrientador = currentUser.papel === 'orientador';

  // Acesso totalmente liberado para todas as funções e módulos para todos os usuários
  const acessoStatus = {
    liberado: true,
    tipo: 'liberado',
    mensagem: `Acesso Liberado para exploração e operação completa (${currentRoleLabel})`,
  };

  const alignClass = (() => {
    if (align === 'left') return 'left-0';
    if (align === 'right') return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  })();

  return (
    <div
      id={`hover-card-${meta.id}`}
      className={`absolute top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-4.5 z-50 animate-in fade-in zoom-in-95 duration-150 cursor-default ${alignClass}`}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#002B49] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            {getMenuIcon(meta.iconeNome, 'w-4 h-4')}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight flex items-center space-x-1.5">
              <span>{meta.label}</span>
              {meta.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider ${meta.badgeCor}`}>
                  {meta.badge}
                </span>
              )}
            </h4>
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
              {meta.categoria}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo do que se trata */}
      <div className="py-2.5">
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {meta.resumo}
        </p>
      </div>

      {/* Funções e Entregas */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 my-1.5">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Principais Funções & Informações:</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-700">
          {meta.funcoes.map((fn, idx) => (
            <li key={idx} className="flex items-start space-x-1.5">
              <span className="w-1 h-1 rounded-full bg-[#002B49] mt-1.5 shrink-0" />
              <span className="leading-snug">{fn}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Seção de Governança e Papéis Regimentais */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-[#002B49]" />
            <span>Papéis que visualizam e operam:</span>
          </span>
        </div>

        <div className="space-y-1 text-[11px] bg-amber-50/40 border border-amber-200/50 rounded-xl p-2">
          <div className="flex items-start space-x-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Coordenação PIC / PROPEP: </span>
              <span className="text-slate-600">{meta.papeis.coordenador}</span>
            </div>
          </div>

          <div className="flex items-start space-x-1.5">
            <Scale className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Avaliadores da Banca: </span>
              <span className="text-slate-600">{meta.papeis.avaliador}</span>
            </div>
          </div>

          <div className="flex items-start space-x-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Docentes Orientadores: </span>
              <span className="text-slate-600">{meta.papeis.orientador}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status do Usuário Atual & Botão de Navegação */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[11px]">
          {acessoStatus.liberado ? (
            <span className="inline-flex items-center text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Acesso Liberado
            </span>
          ) : (
            <span className="inline-flex items-center text-amber-800 font-semibold">
              <Lock className="w-3 h-3 mr-1 text-amber-700" />
              Gestão Exclusiva
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate(meta.id)}
          className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <span>Acessar</span>
          <ArrowRight className="w-3 h-3 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
