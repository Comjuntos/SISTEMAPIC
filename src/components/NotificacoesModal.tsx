import React, { useState, useEffect } from 'react';
import { Mail, Bell, CheckCircle, AlertCircle, X, Send, RefreshCw, FileText } from 'lucide-react';
import { Usuario } from '../types/index.ts';

interface Notificacao {
  id: number;
  orientadorEmail: string;
  propostaId: number | null;
  assunto: string;
  corpo: string;
  tipo: string;
  lida: boolean;
  criadoEm: string;
}

interface NotificacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
}

export const NotificacoesModal: React.FC<NotificacoesModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<Notificacao | null>(null);
  const [testando, setTestando] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  const fetchNotificacoes = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notificacoes?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data);
        if (data.length > 0 && !selectedNotif) {
          setSelectedNotif(data[0]);
        }
      }
    } catch (e) {
      console.error('Erro ao buscar notificações:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes();
    }
  }, [isOpen, currentUser]);

  const marcarComoLida = async (id: number) => {
    try {
      const res = await fetch(`/api/notificacoes/${id}/lida`, { method: 'PUT' });
      if (res.ok) {
        setNotificacoes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
        if (selectedNotif && selectedNotif.id === id) {
          setSelectedNotif((prev) => (prev ? { ...prev, lida: true } : prev));
        }
      }
    } catch (e) {
      console.error('Erro ao marcar como lida:', e);
    }
  };

  const dispararTeste = async () => {
    setTestando(true);
    setTestMsg('');
    try {
      const res = await fetch('/api/notificacoes/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propostaId: 1,
          assunto: `Alerta Institucional de Teste - ${currentUser.nome}`,
          corpo: `Prezado(a) ${currentUser.nome},\n\nEste é um e-mail simulado de teste gerado pelo Serviço de Notificação Institucional PIC-UNIG 2027 para validar o alerta ao orientador.\n\nAtenciosamente,\nPROPEP - UNIG`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestMsg('✅ Alerta simulado enviado com sucesso! Verifique o console do servidor e a lista abaixo.');
        fetchNotificacoes();
      } else {
        setTestMsg(`❌ Erro: ${data.error}`);
      }
    } catch (e: any) {
      setTestMsg(`❌ Erro de conexão: ${e.message}`);
    } finally {
      setTestando(false);
    }
  };

  if (!isOpen) return null;

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Caixa de E-mails & Alertas Simulados (PIC-UNIG 2027)</h2>
              <p className="text-xs text-slate-300">
                Destinatário: <span className="font-semibold text-amber-300">{currentUser.email}</span> ({currentUser.papel})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotificacoes}
              title="Atualizar"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar de Teste */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-amber-900">
            <span className="font-semibold">Serviço Ativo:</span> Envia alertas automáticos por e-mail simulado (console + banco) quando propostas mudam de status ou recebem pareceres da banca.
          </div>
          <button
            onClick={dispararTeste}
            disabled={testando}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {testando ? 'Enviando...' : 'Simular Alerta de E-mail'}
          </button>
        </div>

        {testMsg && (
          <div className="px-6 py-2 bg-slate-800 text-white text-xs font-medium border-b border-slate-700 flex items-center justify-between">
            <span>{testMsg}</span>
            <button onClick={() => setTestMsg('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Corpo com Split View (Lista e Detalhe do Email) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Lista de Notificações */}
          <div className="md:col-span-5 overflow-y-auto bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-semibold uppercase tracking-wider">
              <span>Mensagens ({notificacoes.length})</span>
              {naoLidasCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full font-bold">
                  {naoLidasCount} nova(s)
                </span>
              )}
            </div>

            {loading && notificacoes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">Carregando e-mails simulados...</div>
            ) : notificacoes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm p-4">
                <Mail className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                Nenhuma notificação por e-mail registrada para este usuário.
              </div>
            ) : (
              notificacoes.map((notif) => {
                const isSelected = selectedNotif?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setSelectedNotif(notif);
                      if (!notif.lida) marcarComoLida(notif.id);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition border text-left ${
                      isSelected
                        ? 'bg-amber-100/70 border-amber-300 shadow-sm'
                        : notif.lida
                        ? 'bg-white border-slate-200 hover:bg-slate-100'
                        : 'bg-white border-amber-300 shadow-sm font-semibold'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {notif.assunto}
                      </span>
                      {!notif.lida && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{notif.corpo}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 bg-slate-200/70 rounded text-slate-700">
                        {notif.tipo === 'PARECER_RECEBIDO' ? 'Parecer Banca' : notif.tipo === 'STATUS_ALTERADO' ? 'Status' : 'Geral'}
                      </span>
                      <span>{new Date(notif.criadoEm).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Visualizador do E-mail Selecionado */}
          <div className="md:col-span-7 bg-white p-6 overflow-y-auto flex flex-col">
            {selectedNotif ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg uppercase">
                      {selectedNotif.tipo === 'PARECER_RECEBIDO' ? 'Parecer Técnico da Banca' : 'Alerta de Status Regimental'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedNotif.criadoEm).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedNotif.assunto}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    De: <span className="font-medium text-slate-700">noreply@unig.br (PROPEP PIC-UNIG 2027)</span>
                    <br />
                    Para: <span className="font-medium text-slate-700">{selectedNotif.orientadorEmail}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedNotif.corpo}
                </div>

                {selectedNotif.propostaId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-medium">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>Proposta vinculada: ID #{selectedNotif.propostaId}</span>
                    </div>
                    <span className="text-amber-800 font-bold">Edital PIC-UNIG 2027</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
                <Bell className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium">Selecione uma mensagem na lista ao lado para visualizar o e-mail simulado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Serviço de Notificação Automatizado PIC-UNIG 2027</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
