import React, { useState, useEffect } from 'react';
import { Usuario, Proposta, Edital, Orientador, AuditoriaLog } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { GestaoUsuariosModal } from './components/GestaoUsuariosModal.tsx';
import { NotificacoesModal } from './components/NotificacoesModal.tsx';
import { PainelProgresso } from './components/PainelProgresso.tsx';
import { ProjetosLista } from './components/ProjetosLista.tsx';
import { WorkspaceBanca } from './components/WorkspaceBanca.tsx';
import { FormularioSubmissao } from './components/FormularioSubmissao.tsx';
import { DistribuicaoBolsas } from './components/DistribuicaoBolsas.tsx';
import { SimuladorCenarios } from './components/SimuladorCenarios.tsx';
import { RelatoriosCoordenacao } from './components/RelatoriosCoordenacao.tsx';
import { AuditoriaLGPD } from './components/AuditoriaLGPD.tsx';
import { GerenciadorEditais } from './components/GerenciadorEditais.tsx';
import { ConformidadeAnexosEdital } from './components/ConformidadeAnexosEdital.tsx';
import { ModalParecerConsolidado } from './components/ModalParecerConsolidado.tsx';
import { ModalDownloadSeguro } from './components/ModalDownloadSeguro.tsx';
import { QuadroDeAvisos } from './components/QuadroDeAvisos.tsx';
import { ModalPerfil } from './components/ModalPerfil.tsx';
import { Building2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('progresso');
  const [filtroCursoProjetos, setFiltroCursoProjetos] = useState<string>('todos');

  // Usuários padrão institucionais
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      uid: 'admin-unig-001',
      nome: 'Prof. Dr. Valter Soares',
      email: 'proreitoria.pesquisa@unig.br',
      papel: 'admin',
    },
    {
      id: 2,
      uid: 'coord-unig-002',
      nome: 'Profa. Dra. Heloísa Vasconcelos',
      email: 'coordenacao.pic@unig.br',
      papel: 'coordenador',
    },
    {
      id: 6,
      uid: 'coord-unig-003',
      nome: 'Prof. Coordenador 0142076',
      email: '0142076@professor.unig.edu.br',
      papel: 'coordenador',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      uid: 'aval-unig-001',
      nome: 'Dr. Carlos Eduardo Meireles',
      email: 'carlos.meireles@unig.br',
      papel: 'avaliador',
    },
    {
      id: 4,
      uid: 'aval-unig-002',
      nome: 'Dra. Juliana Mendes Fontes',
      email: 'juliana.fontes@unig.br',
      papel: 'avaliador',
    },
    {
      id: 5,
      uid: 'orient-unig-001',
      nome: 'Prof. Dr. Roberto Guimarães',
      email: 'roberto.guimaraes@unig.br',
      papel: 'orientador',
    },
  ]);

  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [showGestaoUsuarios, setShowGestaoUsuarios] = useState<boolean>(false);
  const [showNotificacoes, setShowNotificacoes] = useState<boolean>(false);
  const [showPerfil, setShowPerfil] = useState<boolean>(false);

  const handleUpdateUser = (updatedUser: Usuario) => {
    setCurrentUser(updatedUser);
    setUsuarios((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [edital, setEdital] = useState<Edital | null>(null);
  const [editais, setEditais] = useState<Edital[]>([]);
  const [orientadores, setOrientadores] = useState<Orientador[]>([]);
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Proposta selecionada para Workspace ou Modais
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);
  const [parecerModalProposta, setParecerModalProposta] = useState<Proposta | null>(null);
  const [downloadModalProposta, setDownloadModalProposta] = useState<Proposta | null>(null);

  const handleUpdateRole = async (userId: number, novoPapel: string) => {
    try {
      const res = await fetch(`/api/usuarios/${userId}/papel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papel: novoPapel }),
      });
      if (res.ok) {
        setUsuarios((prev) => prev.map((u) => (u.id === userId ? { ...u, papel: novoPapel as any } : u)));
        if (currentUser && currentUser.id === userId) {
          setCurrentUser((prev) => (prev ? { ...prev, papel: novoPapel as any } : prev));
        }
        loadData();
      }
    } catch (e) {
      console.error('Erro ao atualizar papel do usuário:', e);
    }
  };

  // Carregar dados da API
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [propostasRes, editalRes, editaisRes, orientadoresRes, auditoriaRes, usuariosRes] = await Promise.all([
        fetch('/api/propostas').then((r) => r.json()),
        fetch('/api/edital').then((r) => r.json()),
        fetch('/api/editais').then((r) => r.json()),
        fetch('/api/orientadores').then((r) => r.json()),
        fetch('/api/auditoria').then((r) => r.json()),
        fetch('/api/usuarios').then((r) => r.json()),
      ]);

      if (Array.isArray(propostasRes)) {
        setPropostas(propostasRes);
        if (!selectedProposta && propostasRes.length > 0) {
          setSelectedProposta(propostasRes[0]);
        }
      }

      if (editalRes && !editalRes.error) setEdital(editalRes);
      if (Array.isArray(editaisRes)) setEditais(editaisRes);
      if (Array.isArray(orientadoresRes)) setOrientadores(orientadoresRes);
      if (Array.isArray(auditoriaRes)) setAuditoriaLogs(auditoriaRes);
      if (Array.isArray(usuariosRes) && usuariosRes.length > 0) setUsuarios(usuariosRes);
    } catch (error) {
      console.error('Erro ao carregar dados do PIC-UNIG:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Redirecionamento regimental estrito de acordo com o edital:
  // - Professores: Somente Enviar Projeto, Meus Projetos e Ver Editais/Anexos
  // - Avaliadores: Somente Avaliar Projetos (Banca) e Ver Editais/Anexos
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.papel === 'orientador') {
      const allowedOrientador = ['submissao', 'projetos', 'editais', 'anexos'];
      if (!allowedOrientador.includes(activeTab)) {
        setActiveTab('submissao');
      }
    } else if (currentUser.papel === 'avaliador') {
      const allowedAvaliador = ['banca', 'projetos', 'editais', 'anexos'];
      if (!allowedAvaliador.includes(activeTab)) {
        setActiveTab('banca');
      }
    }
  }, [currentUser?.papel]);

  // Lançar Parecer no Backend
  const handleSaveAvaliacao = async (data: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch('/api/avaliacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao registrar parecer.');
    }

    await loadData();
    // Atualizar proposta selecionada
    if (selectedProposta && selectedProposta.id === data.propostaId) {
      const updated = await fetch(`/api/propostas/${data.propostaId}`).then((r) => r.json());
      if (updated && !updated.error) setSelectedProposta(updated);
    }
  };

  // Submissão de Proposta
  const handleSubmitProposta = async (data: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch('/api/propostas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao submeter proposta.');
    }

    await loadData();
    setActiveTab('projetos');
  };

  // Reanalisar com Gemini Flash
  const handleReanalisarGemini = async (propostaId: number) => {
    const res = await fetch(`/api/propostas/${propostaId}/analisar-gemini`, {
      method: 'POST',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao reanalisar com IA Gemini.');
    }

    await loadData();
    const updated = await fetch(`/api/propostas/${propostaId}`).then((r) => r.json());
    if (updated && !updated.error) setSelectedProposta(updated);
  };

  // Homologar Distribuição de Bolsas
  const handleHomologarBolsas = async () => {
    const res = await fetch('/api/homologar', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro na homologação.');
    }
    await loadData();
  };

  // Alternar Edital Ativo do Sistema
  const handleSelectEditalAtivo = async (id: number) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch(`/api/editais/${id}/ativar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authHeader}`,
      },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao definir edital ativo.');
    }
    await loadData();
  };

  // Criar Novo Edital Anual
  const handleCriarEdital = async (dados: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch('/api/editais', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar novo edital anual.');
    }
    await loadData();
  };

  // Atualizar Parâmetros do Edital
  const handleAtualizarEdital = async (id: number, dados: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch(`/api/editais/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar edital.');
    }
    await loadData();
  };

  // Atualizar Fase Específica do Cronograma
  const handleAtualizarFaseCronograma = async (editalId: number, faseId: string, dados: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch(`/api/editais/${editalId}/cronograma/fases/${faseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar etapa do cronograma.');
    }
    await loadData();
  };

  // Prorrogar Prazos Regimentais (Termo Aditivo)
  const handleProrrogarPrazos = async (editalId: number, params: any) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch(`/api/editais/${editalId}/prorrogar-prazos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao prorrogar prazos do edital.');
    }
    await loadData();
  };

  // Avançar Fase do Cronograma / Linha do Tempo
  const handleAvancarFaseEdital = async (id: number, novaFaseId: string, justificativa?: string) => {
    const authHeader = `mock-${currentUser.uid}:${currentUser.email}:${encodeURIComponent(currentUser.nome)}`;
    const res = await fetch(`/api/editais/${id}/avancar-fase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify({ novaFaseId, justificativa }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao avançar fase regimental.');
    }
    await loadData();
  };

  if (!currentUser) {
    return (
      <LoginScreen
        usuarios={usuarios}
        onLogin={(u) => {
          setCurrentUser(u);
          loadData();
        }}
        onRefreshData={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar Institucional com Seletor de Papéis */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usuariosDisponiveis={usuarios}
        onRefreshData={loadData}
        onOpenGestaoUsuarios={() => setShowGestaoUsuarios(true)}
        onLogout={() => setCurrentUser(null)}
        onOpenNotificacoes={() => setShowNotificacoes(true)}
        onOpenPerfil={() => setShowPerfil(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {isLoading && propostas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#002B49] animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Carregando base de dados do Edital PIC-UNIG 2027...
            </p>
          </div>
        ) : (
          <>
            {/* Quadro de Avisos do Edital (Prazos de Submissão e Avaliação para Professores e Avaliadores) */}
            <QuadroDeAvisos
              edital={edital}
              currentUser={currentUser}
              propostas={propostas}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {activeTab === 'editais' && (
              <GerenciadorEditais
                editais={editais}
                editalAtivo={edital}
                propostas={propostas}
                currentUser={currentUser}
                onSelectEditalAtivo={handleSelectEditalAtivo}
                onCriarEdital={handleCriarEdital}
                onAtualizarEdital={handleAtualizarEdital}
                onAtualizarFaseCronograma={handleAtualizarFaseCronograma}
                onProrrogarPrazos={handleProrrogarPrazos}
                onAvancarFase={handleAvancarFaseEdital}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onRefresh={loadData}
                onSwitchUser={setCurrentUser}
                usuariosDisponiveis={usuarios}
              />
            )}

            {activeTab === 'progresso' && (
              <PainelProgresso
                propostas={propostas}
                edital={edital}
                onNavigateTab={setActiveTab}
                onSelectProposta={(p) => {
                  setSelectedProposta(p);
                  setActiveTab('banca');
                }}
              />
            )}

            {activeTab === 'projetos' && (
              <ProjetosLista
                propostas={propostas}
                currentUser={currentUser}
                filtroCursoInicial={filtroCursoProjetos}
                onNavigateToAnexos={() => setActiveTab('anexos')}
                onNavigateToSubmissao={() => setActiveTab('submissao')}
                onSelectProposta={(p) => {
                  setSelectedProposta(p);
                  setParecerModalProposta(p);
                }}
                onOpenParecerModal={(p) => setParecerModalProposta(p)}
                onOpenDownloadModal={(p) => setDownloadModalProposta(p)}
                onGoToBanca={(p) => {
                  setSelectedProposta(p);
                  setActiveTab('banca');
                }}
              />
            )}

            {activeTab === 'anexos' && (
              <ConformidadeAnexosEdital
                propostas={propostas}
                edital={edital}
                currentUser={currentUser}
                onNavigateTab={setActiveTab}
                onFilterCursoNosProjetos={(cursoNome) => {
                  setFiltroCursoProjetos(cursoNome);
                  setActiveTab('projetos');
                }}
              />
            )}

            {activeTab === 'banca' && (
              <WorkspaceBanca
                propostas={propostas}
                currentUser={currentUser}
                selectedProposta={selectedProposta}
                onSelectProposta={setSelectedProposta}
                onSaveAvaliacao={handleSaveAvaliacao}
                onReanalisarGemini={handleReanalisarGemini}
              />
            )}

            {activeTab === 'submissao' && (
              <FormularioSubmissao
                orientadores={orientadores}
                currentUser={currentUser}
                onSubmitProposta={handleSubmitProposta}
                onSuccessNavigate={() => setActiveTab('projetos')}
              />
            )}

            {activeTab === 'bolsas' && (
              <DistribuicaoBolsas
                propostas={propostas}
                edital={edital}
                onHomologarBolsas={handleHomologarBolsas}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'simulador' && (
              <SimuladorCenarios
                propostas={propostas}
                edital={edital}
                onHomologarBolsas={handleHomologarBolsas}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'relatorios' && (
              <RelatoriosCoordenacao
                propostas={propostas}
                edital={edital}
                auditoriaLogs={auditoriaLogs}
                orientadores={orientadores}
                currentUser={currentUser}
                onOpenParecerModal={(p) => setParecerModalProposta(p)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'auditoria' && (
              <AuditoriaLGPD logs={auditoriaLogs} usuarios={usuarios} />
            )}
          </>
        )}
      </main>

      {/* Modais Globais */}
      {parecerModalProposta && (
        <ModalParecerConsolidado
          proposta={parecerModalProposta}
          onClose={() => setParecerModalProposta(null)}
          onGoToBanca={(p) => {
            setSelectedProposta(p);
            setParecerModalProposta(null);
            setActiveTab('banca');
          }}
        />
      )}

      {downloadModalProposta && (
        <ModalDownloadSeguro
          proposta={downloadModalProposta}
          onClose={() => setDownloadModalProposta(null)}
        />
      )}

      {showGestaoUsuarios && currentUser && (
        <GestaoUsuariosModal
          isOpen={showGestaoUsuarios}
          onClose={() => setShowGestaoUsuarios(false)}
          usuarios={usuarios}
          currentUser={currentUser}
          onUpdateRole={handleUpdateRole}
        />
      )}

      {showNotificacoes && currentUser && (
        <NotificacoesModal
          isOpen={showNotificacoes}
          onClose={() => setShowNotificacoes(false)}
          currentUser={currentUser}
        />
      )}

      {showPerfil && currentUser && (
        <ModalPerfil
          isOpen={showPerfil}
          onClose={() => setShowPerfil(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Rodapé Institucional */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#002B49] text-white flex items-center justify-center font-bold text-[10px]">
              U
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Universidade Iguaçu — UNIG | Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP)
              </p>
              <p className="text-[11px] text-slate-400">
                Programa Institucional de Iniciação Científica — Edital PIC-UNIG 2027/2028
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformidade LGPD Ativa</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 text-purple-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suporte IA Gemini 3.8 Flash</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">v2027.3.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
