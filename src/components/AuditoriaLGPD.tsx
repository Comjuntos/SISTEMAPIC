import React, { useState } from 'react';
import { AuditoriaLog, Usuario } from '../types/index.ts';
import {
  ShieldCheck,
  Lock,
  Download,
  Search,
  UserCheck,
  FileText,
  Clock,
  KeyRound,
  Eye,
} from 'lucide-react';

interface AuditoriaLGPDProps {
  logs: AuditoriaLog[];
  usuarios: Usuario[];
}

export const AuditoriaLGPD: React.FC<AuditoriaLGPDProps> = ({ logs, usuarios }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMasked, setShowMasked] = useState(true);

  const filtrados = logs.filter(
    (l) =>
      l.usuarioEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detalhes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportAuditReport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `relatorio_auditoria_lgpd_pic_unig_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Trilha de Auditoria Digital &amp; Governança de Usuários
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro imutável de todas as ações regimentais, pareceres lançados, homologações e acesso a dados sensíveis.
          </p>
        </div>

        <button
          onClick={exportAuditReport}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors flex items-center space-x-2 self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório Jurídico</span>
        </button>
      </div>

      {/* Tabela de Usuários e Perfis Institucionais */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Usuários e Perfis de Acesso Credenciados
            </h3>
          </div>
          <span className="text-xs text-slate-500">{usuarios.length} usuários cadastrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">E-mail Institucional</th>
                <th className="py-3 px-4">Papel no Sistema</th>
                <th className="py-3 px-4">Privilégios Regimentais</th>
                <th className="py-3 px-4">Status LGPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {u.nome.charAt(0)}
                    </div>
                    <span>{u.nome}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        u.papel === 'admin'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : u.papel === 'coordenador'
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : u.papel === 'avaliador'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {u.papel.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {u.papel === 'admin'
                      ? 'Administração Plena, Homologação e Auditoria'
                      : u.papel === 'coordenador'
                      ? 'Distribuição de Bancas e Mediação de Árbitros'
                      : u.papel === 'avaliador'
                      ? 'Lançamento de Pareceres Duplo-Cego'
                      : 'Submissão e Acompanhamento de Projeto'}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">
                    ✓ Termo Aceito &amp; Anonimizado
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Livro de Auditoria Digital em Tempo Real */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Livro de Auditoria Digital (Últimos 100 Registros)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rastreamento estrito de submissões, avaliações duplo-cegas e consultas a dados.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Data/Hora</th>
                <th className="py-2.5 px-4">Usuário</th>
                <th className="py-2.5 px-4">Operação</th>
                <th className="py-2.5 px-4">Entidade</th>
                <th className="py-2.5 px-4">IP Origem</th>
                <th className="py-2.5 px-4">Detalhes da Transação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtrados.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.criadoEm).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                    {log.usuarioEmail}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {log.acao}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700">{log.entidade}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{log.ipOrigem}</td>
                  <td className="py-2.5 px-4 max-w-md text-slate-600 truncate" title={log.detalhes}>
                    {log.detalhes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
