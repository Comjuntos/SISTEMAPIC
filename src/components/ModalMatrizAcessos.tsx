import React, { useState } from 'react';
import { MENUS_SISTEMA, MenuMeta } from '../data/menuMetadata.ts';
import { Usuario } from '../types/index.ts';
import { getMenuIcon } from './NavbarHoverCard.tsx';
import {
  ShieldCheck,
  X,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Crown,
  Scale,
  GraduationCap,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface ModalMatrizAcessosProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  onSelectTab: (tabId: string) => void;
}

export const ModalMatrizAcessos: React.FC<ModalMatrizAcessosProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectTab,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');

  if (!isOpen) return null;

  const menusFiltrados = MENUS_SISTEMA.filter((m) => {
    const matchesBusca =
      m.label.toLowerCase().includes(busca.toLowerCase()) ||
      m.resumo.toLowerCase().includes(busca.toLowerCase()) ||
      m.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      m.funcoes.some((f) => f.toLowerCase().includes(busca.toLowerCase()));
    const matchesCat =
      filtroCategoria === 'todos' || m.acessoPrincipal === filtroCategoria;
    return matchesBusca && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Topo do Modal */}
        <div className="bg-[#002B49] text-white px-6 py-5 flex items-center justify-between border-b border-[#001D33]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#002B49]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Mapa Geral de Menus, Funções & Papéis Regimentais
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Consulte todas as funcionalidades do Sistema PIC-UNIG 2027 e as permissões de acesso por perfil regimental.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
            title="Fechar"
          >
            ×
          </button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por módulo, funcionalidade ou termo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <span className="text-slate-500 font-semibold mr-1 text-[11px]">Filtrar por:</span>
            {[
              { id: 'todos', label: 'Todos os Menus' },
              { id: 'gestao', label: 'Gestão PIC' },
              { id: 'banca', label: 'Banca Parecerista' },
              { id: 'orientador', label: 'Docentes' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroCategoria(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                  filtroCategoria === f.id
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menusFiltrados.map((m) => {
              const isGestor = currentUser.papel === 'coordenador' || currentUser.papel === 'admin';
              const isAvaliador = currentUser.papel === 'avaliador';
              const isOrientador = currentUser.papel === 'orientador';

              const temPermissao =
                m.acessoPrincipal === 'todos' ||
                (m.acessoPrincipal === 'gestao' && isGestor) ||
                (m.acessoPrincipal === 'banca' && (isAvaliador || isGestor)) ||
                (m.acessoPrincipal === 'orientador' && (isOrientador || isGestor));

              return (
                <div
                  key={m.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4.5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#002B49] text-amber-400 flex items-center justify-center shrink-0">
                          {getMenuIcon(m.iconeNome, 'w-4 h-4')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{m.label}</span>
                            {m.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${m.badgeCor}`}>
                                {m.badge}
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                            {m.categoria}
                          </span>
                        </div>
                      </div>

                      {temPermissao ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Acesso Habilitado
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Lock className="w-3 h-3 mr-1 text-amber-700" />
                          Gestão Exclusiva
                        </span>
                      )}
                    </div>

                    {/* Resumo */}
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {m.resumo}
                    </p>

                    {/* Funções Chave */}
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px]">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                        Funções Disponíveis:
                      </div>
                      <ul className="space-y-1 text-slate-600">
                        {m.funcoes.map((fn, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#002B49] mt-1.5 shrink-0" />
                            <span>{fn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tabela de Papéis */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px]">
                      <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                        Quem pode visualizar & operar:
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[11px] bg-amber-50/40 p-2 rounded-xl border border-amber-100">
                        <div className="flex items-start space-x-1">
                          <Crown className="w-3 h-3 text-amber-700 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-800">Coordenação:</span>
                          <span className="text-slate-600">{m.papeis.coordenador}</span>
                        </div>
                        <div className="flex items-start space-x-1">
                          <Scale className="w-3 h-3 text-blue-700 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-800">Banca:</span>
                          <span className="text-slate-600">{m.papeis.avaliador}</span>
                        </div>
                        <div className="flex items-start space-x-1">
                          <GraduationCap className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="font-semibold text-slate-800">Docentes:</span>
                          <span className="text-slate-600">{m.papeis.orientador}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab(m.id);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Abrir este Módulo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Legenda:</span>
            <span className="inline-flex items-center text-emerald-700 font-bold">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Liberado
            </span>
            <span className="inline-flex items-center text-amber-800 font-bold">
              <Lock className="w-3 h-3 mr-1" /> Gestão Restrita
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-1 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
