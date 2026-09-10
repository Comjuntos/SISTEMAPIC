import React, { useState } from 'react';
import { Usuario } from '../types/index.ts';
import { User, Mail, Shield, Camera, X, Check, Award } from 'lucide-react';

interface ModalPerfilProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  onUpdateUser: (updatedUser: Usuario) => void;
}

export const ModalPerfil: React.FC<ModalPerfilProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [nome, setNome] = useState(currentUser.nome);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Usuario = {
      ...currentUser,
      nome: nome.trim() || currentUser.nome,
      email: email.trim() || currentUser.email,
      avatarUrl: avatarUrl.trim() || undefined,
    };
    onUpdateUser(updated);
    setSuccessMsg('Dados da conta atualizados com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  const getRoleBadgeLabel = (papel: string) => {
    switch (papel) {
      case 'admin':
        return { label: 'Administrador do Sistema', color: 'bg-rose-500/10 text-rose-700 border-rose-200' };
      case 'coordenador':
        return { label: 'Coordenação PROPEP / PIC', color: 'bg-amber-500/10 text-amber-700 border-amber-200' };
      case 'avaliador':
        return { label: 'Avaliador / Parecerista Ad-Hoc', color: 'bg-blue-500/10 text-blue-700 border-blue-200' };
      case 'orientador':
        return { label: 'Professor Orientador', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Participante / Discente', color: 'bg-slate-500/10 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadgeLabel(currentUser.papel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#002B49] to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Perfil da Conta</h2>
              <p className="text-xs text-slate-300">Gerencie seus dados e foto de exibição</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Preview & URL */}
          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 font-bold text-xl flex items-center justify-center overflow-hidden shrink-0 shadow-md border-2 border-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={nome} className="w-full h-full object-cover" />
              ) : (
                nome.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">UID: {currentUser.uid}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nome Completo
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              E-mail Institucional / Acesso
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              URL da Foto de Perfil (Avatar URL opcional)
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="url"
                placeholder="https://exemplo.com/foto.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cole o link direto de uma imagem online para exibir sua foto no cabeçalho e bancas.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <Check className="w-4 h-4 text-amber-400" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
