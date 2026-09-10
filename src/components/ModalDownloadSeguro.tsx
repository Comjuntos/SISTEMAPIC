import React, { useState, useEffect } from 'react';
import { Proposta } from '../types/index.ts';
import {
  X,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Lock,
  Clock,
  ExternalLink,
  FileText,
} from 'lucide-react';

interface ModalDownloadSeguroProps {
  proposta: Proposta;
  onClose: () => void;
}

export const ModalDownloadSeguro: React.FC<ModalDownloadSeguroProps> = ({
  proposta,
  onClose,
}) => {
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/download-url/${proposta.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDownloadInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar URL assinada:', err);
        setLoading(false);
      });
  }, [proposta.id]);

  const copyHash = () => {
    if (downloadInfo?.hashSha256) {
      navigator.clipboard.writeText(downloadInfo.hashSha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Custódia Documental &amp; Link Seguro</h3>
              <p className="text-[11px] text-slate-500">Google Cloud Storage com URL Assinada (V4)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Arquivo e Projeto */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center space-x-2 text-slate-900 font-bold">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="truncate">{proposta.arquivoNome}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Projeto #PIC-{String(proposta.id).padStart(3, '0')}: {proposta.titulo}
            </p>
          </div>

          {/* Hash SHA-256 com botão de copiar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Hash Criptográfico de Integridade (SHA-256):</span>
              <button
                onClick={copyHash}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Hash'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl break-all border border-slate-800">
              {downloadInfo?.hashSha256 || proposta.hashSha256}
            </div>
          </div>

          {/* Dados de Segurança do Cloud Storage */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
            <div className="flex items-center space-x-2 font-bold">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>Autenticidade e Salvaguarda Garantidas</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              O arquivo foi cifrado em repouso e seu resumo criptográfico atesta que o conteúdo avaliado pela banca é exatamente o mesmo submetido pelo docente.
            </p>
            <div className="pt-1 flex items-center space-x-1 text-[10px] text-emerald-700 font-medium">
              <Clock className="w-3 h-3" />
              <span>Link assinado válido por 15 minutos (expira em {downloadInfo ? new Date(downloadInfo.expiresAt).toLocaleTimeString() : '15 min'}).</span>
            </div>
          </div>

          {/* Botão de Download */}
          <div className="pt-2">
            <a
              href={downloadInfo?.signedUrl || proposta.arquivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo Cifrado do Projeto</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
