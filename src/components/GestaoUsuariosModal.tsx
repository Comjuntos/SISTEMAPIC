import React, { useState } from 'react';
import { Usuario } from '../types/index.ts';
import {
  Users,
  Shield,
  Crown,
  Scale,
  GraduationCap,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface GestaoUsuariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  currentUser: Usuario;
  onUpdateRole: (userId: number, novoPapel: string) => void;
}

export const GestaoUsuariosModal: React.FC<GestaoUsuariosModalProps> = ({
  isOpen,
  onClose,
  usuarios,
  currentUser,
  onUpdateRole,
}) => {
  const [busca, setBusca] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  if (!isOpen) return null;

  const isGestor = currentUser.papel === 'coordenador' || currentUser.papel === 'admin';

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase()) ||
      u.papel.toLowerCase().includes(busca.toLowerCase())
  );

  const handleRoleChange = (userId: number, novoPapel: string) => {
    onUpdateRole(userId, novoPapel);
    setMensagemSucesso('Papel regimental atualizado com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="bg-[#002B49] text-white px-6 py-5 flex items-center justify-between border-b border-[#001D33]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-[#002B49]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Painel de Administração de Contas & Papéis Regimentais
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Gerencie os usuários cadastrados e altere o papel de professores orientadores para avaliadores da banca ou vice-versa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Busca e Barra de Alerta */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou papel..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
            />
          </div>

          {mensagemSucesso && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{mensagemSucesso}</span>
            </div>
          )}
        </div>

        {/* Lista de Usuários */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100">
          {!isGestor && (
            <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Atenção: Apenas os perfis de <strong>Coordenação</strong> e <strong>Administrador</strong> possuem permissão para alterar os papéis regimentais dos usuários.
              </span>
            </div>
          )}

          <div className="space-y-3">
            {usuariosFiltrados.map((u) => {
              const badge = getRoleBadge(u.papel);
              return (
                <div
                  key={u.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.nome} className="w-full h-full object-cover" />
                      ) : (
                        u.nome.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <span>{u.nome}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  {/* Seletor de Alteração de Papel (Ativo para Coordenador/Admin) */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <span className="text-xs text-slate-500 font-semibold hidden md:inline">Alterar Papel:</span>
                    <select
                      value={u.papel}
                      disabled={!isGestor}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-xl border border-slate-300 font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002B49] ${
                        !isGestor ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white'
                      }`}
                    >
                      <option value="orientador">Docente Orientador</option>
                      <option value="avaliador">Parecerista (Banca)</option>
                      <option value="coordenador">Coordenação PIC</option>
                      <option value="admin">Administrador Geral</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total de usuários cadastrados: {usuarios.length}</span>
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
