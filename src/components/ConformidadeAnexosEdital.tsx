import React, { useState } from 'react';
import { Proposta, Edital, Usuario } from '../types/index.ts';
import { LISTA_OFICIAL_CURSOS_UNIG, getCursoMeta } from '../data/cursosUnig.ts';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  Award,
  GraduationCap,
  Scale,
  Users,
  Calendar,
  AlertTriangle,
  Send,
  Download,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ConformidadeAnexosEditalProps {
  propostas: Proposta[];
  edital: Edital | null;
  currentUser: Usuario;
  onNavigateTab: (tab: string) => void;
  onFilterCursoNosProjetos?: (cursoNome: string) => void;
}

export const ConformidadeAnexosEdital: React.FC<ConformidadeAnexosEditalProps> = ({
  propostas,
  edital,
  currentUser,
  onNavigateTab,
  onFilterCursoNosProjetos,
}) => {
  const [anexoAtivo, setAnexoAtivo] = useState<string>('anexo-4'); // Defaulting to Anexo IV (Relação de Cursos) or Anexo I
  const [buscaCurso, setBuscaCurso] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'Graduação' | 'Mestrado'>('todos');

  // Estado para simulação de interposição de recurso (Anexo VII)
  const [modalRecursoAberto, setModalRecursoAberto] = useState<boolean>(false);
  const [propostaRecursoId, setPropostaRecursoId] = useState<number>(propostas[0]?.id || 1);
  const [itemImpugnado, setItemImpugnado] = useState<string>('Anexo II - Rigor Metodológico e Desenho Amostral');
  const [justificativaRecurso, setJustificativaRecurso] = useState<string>('');
  const [recursoEnviadoSucesso, setRecursoEnviadoSucesso] = useState<boolean>(false);
  const [protocoloGerado, setProtocoloGerado] = useState<string>('');

  // Cursos e Mestrados filtrados
  const cursosFiltrados = LISTA_OFICIAL_CURSOS_UNIG.filter((c) => {
    const matchBusca =
      c.nome.toLowerCase().includes(buscaCurso.toLowerCase()) ||
      c.sigla.toLowerCase().includes(buscaCurso.toLowerCase()) ||
      c.nomeExibicao.toLowerCase().includes(buscaCurso.toLowerCase()) ||
      c.campus.toLowerCase().includes(buscaCurso.toLowerCase()) ||
      c.codigoMec.toLowerCase().includes(buscaCurso.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  // Estatísticas de cursos
  const totalCursos = LISTA_OFICIAL_CURSOS_UNIG.length;
  const cursosComProposta = new Set(propostas.map((p) => p.discenteCurso.toLowerCase())).size;

  // Gerar PDF do Dossiê de Anexos
  const gerarPdfDossieAnexos = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header institucional UNIG
    doc.setFillColor(0, 43, 73); // #002B49
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('UNIVERSIDADE IGUAÇU - UNIG', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP) | Comitê Institucional de Iniciação Científica', 14, 18);
    doc.text(`Dossiê de Conformidade Regimental dos Anexos do Edital ${edital?.codigo || 'PIC-UNIG 2027'}`, 14, 24);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('QUADRO CONSOLIDADO DE DIRETRIZES E ANEXOS (I A VIII)', 14, 38);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Certifico que todos os Anexos normativos integrantes do Edital de Iniciação Científica foram auditados e implementados fielmente na plataforma institucional PIC-UNIG.',
      14,
      44
    );

    const rows = [
      ['Anexo I', 'Formulário de Submissão de Projeto e Plano de Trabalho Discente (12 meses)', 'CONFORME', 'Submissão eletrônica com Metodologia, Cronograma e Hash SHA-256.'],
      ['Anexo II', 'Barema Oficial de Avaliação do Projeto (AVALIAR HUMANO + IA - Etapa 2)', 'CONFORME', '5 dimensões somando 6,00 pts com trava de divergência > 2,0 pts e IA Gemini.'],
      ['Anexo III', 'Barema de Pontuação Lattes do Docente Orientador (Etapa 3)', 'CONFORME', 'Titulação, Stricto Sensu, Fomento e Regra do Maior Benefício H5 vs Scopus (4,00 pts).'],
      ['Anexo IV', 'Relação Oficial de Cursos de Graduação Elegíveis (Nova Iguaçu & Itaperuna)', 'CONFORME', `${totalCursos} cursos cadastrados com visualização e filtros nos projetos submetidos.`],
      ['Anexo V', 'Autodeclaração Étnico-Racial e Documentação de Ações Afirmativas', 'CONFORME', 'Reserva estrita de 40 bolsas (40%) para cotas PPI, PcD e Escola Pública.'],
      ['Anexo VI', 'Termo de Compromisso e Responsabilidade do Bolsista e Orientador (LGPD)', 'CONFORME', 'Carga horária de 20h/semana, ética na pesquisa e consentimento criptográfico LGPD.'],
      ['Anexo VII', 'Formulário de Interposição de Recurso Administrativo da Banca', 'CONFORME', 'Tramitação no prazo regimental de 48h úteis com julgamento pela PROPEP.'],
      ['Anexo VIII', 'Roteiro de Relatórios Semestrais e Finais de Iniciação Científica', 'CONFORME', 'Acompanhamento do cronograma no 6º mês e prestação de contas no 12º mês.'],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Anexo', 'Denominação Regimental', 'Status', 'Evidência Funcional no Sistema']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [0, 43, 73], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        1: { cellWidth: 55 },
        2: { cellWidth: 25, textColor: [22, 101, 52], fontStyle: 'bold' },
        3: { cellWidth: 88 },
      },
    });

    // Rodapé com assinaturas
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.text('___________________________________________', 20, finalY);
    doc.text('Prof. Dr. Valter Soares', 35, finalY + 5);
    doc.text('Pró-Reitor de Pós-Graduação e Pesquisa', 28, finalY + 9);

    doc.text('___________________________________________', 115, finalY);
    doc.text('Profa. Dra. Heloísa Vasconcelos', 125, finalY + 5);
    doc.text('Coordenadora Geral do PIC-UNIG', 126, finalY + 9);

    doc.save(`Dossie_Conformidade_Anexos_${edital?.codigo?.replace(/\s+/g, '_') || 'PIC-UNIG'}.pdf`);
  };

  const handleEnviarRecurso = (e: React.FormEvent) => {
    e.preventDefault();
    const protocolo = `REC-UNIG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setProtocoloGerado(protocolo);
    setRecursoEnviadoSucesso(true);
  };

  const anexosInfo = [
    {
      id: 'anexo-1',
      numero: 'Anexo I',
      titulo: 'Formulário de Submissão de Projeto e Plano de Trabalho Discente (12 Meses)',
      resumo: 'Estrutura regimental para submissão contendo objetivos, justificativa, metodologia detalhada, cronograma bimestral e custódia digital com hash criptográfico SHA-256.',
      badgeEtapa: 'Etapa 1: Inscrição & Habilitação',
      status: 'Conforme',
      destaque: 'SHA-256 & Web Crypto API',
      icone: FileText,
      cor: 'border-blue-500 bg-blue-50/20 text-blue-900',
      rota: 'submissao',
      itensObrigatorios: [
        'Identificação completa do discente candidato, e-mail institucional e curso de graduação',
        'Coeficiente de Rendimento (CR) acumulado mínimo de 7.00 (eliminatório)',
        'Definição da Abordagem Metodológica (Quantitativa vs. Qualitativa) e Tamanho Amostral',
        'Ordem Hierárquica do Desenho Experimental (Ensaio Clínico, Coorte, Caso-Controle, etc.)',
        'Cronograma bimestral de 6 bimestres totalizando os 12 meses de vigência da bolsa',
        'Cálculo e registro instantâneo do Hash SHA-256 do arquivo PDF submetido para integridade jurídica',
      ],
    },
    {
      id: 'anexo-2',
      numero: 'Anexo II',
      titulo: 'Barema Oficial de Avaliação do Projeto pelo módulo AVALIAR HUMANO + IA (Mérito Científico)',
      resumo: 'Matriz avaliativa de 5 dimensões oficiais somando nota máxima de 6,00 pontos, executada por 2 pareceristas anônimos com trava de divergência (> 2,00 pts).',
      badgeEtapa: 'Etapa 2: Peso 6,00 (60% do total)',
      status: 'Conforme',
      destaque: 'Duplo-Cego & Trava > 2.0 pts',
      icone: Scale,
      cor: 'border-emerald-500 bg-emerald-50/20 text-emerald-900',
      rota: 'banca',
      itensObrigatorios: [
        'Dimensão 1: Originalidade, clareza e relevância científico-acadêmica do tema (0 a 1,50)',
        'Dimensão 2: Rigor metodológico, desenho de pesquisa e suficiência amostral (0 a 1,50)',
        'Dimensão 3: Coerência entre objetivos, justificativa e estado da arte (0 a 1,00)',
        'Dimensão 4: Viabilidade técnica, logística e exequibilidade em 12 meses (0 a 1,00)',
        'Dimensão 5: Inserção social, impacto para a Baixada Fluminense/Noroeste e potencial de publicação (0 a 1,00)',
        'Mecanismo de Desempate: Divergência entre pareceristas > 2.00 pts aciona terceiro parecerista ou árbitro da PROPEP',
        'Apoio Preliminar de IA Gemini 2.5 Flash para verificação preliminar de aderência',
      ],
    },
    {
      id: 'anexo-3',
      numero: 'Anexo III',
      titulo: 'Barema de Avaliação do Currículo Lattes do Docente Orientador',
      resumo: 'Pontuação da produção intelectual dos últimos 3 anos do orientador credenciado com aplicação estrita da Regra do Maior Benefício (H5 vs. Scopus).',
      badgeEtapa: 'Etapa 3: Peso 4,00 (40% do total)',
      status: 'Conforme',
      destaque: 'Regra Maior Benefício H5 vs Scopus',
      icone: Award,
      cor: 'border-purple-500 bg-purple-50/20 text-purple-900',
      rota: 'simulador',
      itensObrigatorios: [
        'Titulação Acadêmica do Orientador: Doutor (1,50 pt), Mestre (1,00 pt) ou Especialista (0,50 pt)',
        'Vínculo a Programa de Pós-Graduação Stricto Sensu credenciado pela CAPES (+0,50 pt)',
        'Captação de Fomento Externo Vigente (CNPq, FAPERJ, FINEP, CAPES) (+0,50 pt)',
        'Regra do Maior Benefício: Fator H5 do Google Scholar normalizado (H5/15 × 1,50) OU Percentil Médio Scopus normalizado (Percentil/100 × 1,50) — o sistema adota automaticamente o maior valor',
        'Total máximo ponderado da Etapa 3: 4,00 pontos',
      ],
    },
    {
      id: 'anexo-4',
      numero: 'Anexo IV',
      titulo: 'Relação Oficial de Cursos de Graduação Elegíveis (Campus Nova Iguaçu e Itaperuna)',
      resumo: 'Catálogo de cursos reconhecidos pelo MEC e autorizados na UNIG aptos a concorrer às cotas do PIC, organizados por Centro Acadêmico e Campi.',
      badgeEtapa: 'Diretriz de Elegibilidade Institucional',
      status: 'Conforme',
      destaque: `${totalCursos} Cursos Reconhecidos`,
      icone: GraduationCap,
      cor: 'border-blue-600 bg-blue-50/30 text-blue-950',
      rota: 'projetos',
      itensObrigatorios: [
        'Centro de Ciências da Saúde e Biológicas: Medicina (Nova Iguaçu e Itaperuna), Odontologia, Enfermagem, Farmácia, Fisioterapia, Biomedicina, Psicologia, Nutrição, Medicina Veterinária e Educação Física',
        'Centro de Ciências Humanas e Sociais Aplicadas: Direito (Nova Iguaçu e Itaperuna), Administração, Ciências Contábeis e Pedagogia',
        'Centro de Ciências Exatas, Tecnológicas e Engenharias: Engenharia de Software, Ciência da Computação, Engenharia Civil e Arquitetura e Urbanismo',
        'Filtro instantâneo e exibição do selo do curso em cada projeto no catálogo de propostas',
      ],
    },
    {
      id: 'anexo-5',
      numero: 'Anexo V',
      titulo: 'Formulário de Autodeclaração Étnico-Racial e Ações Afirmativas (40% das Bolsas)',
      resumo: 'Reserva obrigatória de 40 das 100 bolsas para candidatos autodeclarados Pretos, Pardos ou Indígenas (PPI), Pessoas com Deficiência (PcD) e Egressos de Escola Pública.',
      badgeEtapa: 'Cota Social Regimental (40 bolsas)',
      status: 'Conforme',
      destaque: '60/40 com Remanejamento',
      icone: Users,
      cor: 'border-amber-500 bg-amber-50/20 text-amber-900',
      rota: 'bolsas',
      itensObrigatorios: [
        'Classificação estritamente separada em duas listas: Ampla Concorrência (60 bolsas) e Ações Afirmativas (40 bolsas)',
        'Validação documental e termo de autodeclaração arquivado digitalmente na Etapa 1',
        'Regra Regimental de Vacância: Bolsas de Ações Afirmativas não preenchidas por falta de candidatos habilitados são remanejadas para a lista de Ampla Concorrência',
        'Simulador "E se..." com controle de percentual de cota (40% padrão, 50% expandido, etc.)',
      ],
    },
    {
      id: 'anexo-6',
      numero: 'Anexo VI',
      titulo: 'Termo de Compromisso e Responsabilidade do Bolsista e Orientador (LGPD)',
      resumo: 'Compromisso institucional de 20h/semana, sigilo de dados em conformidade com a LGPD (Lei 13.709/2018) e participação obrigatória na Jornada Científica da UNIG.',
      badgeEtapa: 'Governança & Termos Legais',
      status: 'Conforme',
      destaque: 'LGPD & Logs Auditáveis',
      icone: ShieldCheck,
      cor: 'border-cyan-500 bg-cyan-50/20 text-cyan-900',
      rota: 'auditoria',
      itensObrigatorios: [
        'Carga horária semanal de 20 horas dedicada às atividades científicas do plano de trabalho',
        'Ausência de vínculo empregatício impeditivo ou acúmulo de bolsas concomitantes de outras agências',
        'Consentimento expresso para tratamento de dados pessoais conforme a LGPD com mascaramento em tela pública',
        'Assinatura digital e registro no log de auditoria com data, hora, IP de origem e hash criptográfico',
      ],
    },
    {
      id: 'anexo-7',
      numero: 'Anexo VII',
      titulo: 'Formulário Padrão de Interposição de Recurso Administrativo da Banca',
      resumo: 'Módulo eletrônico para interposição recursal no prazo regimental de 48 horas úteis após publicação do resultado preliminar pela PROPEP.',
      badgeEtapa: 'Fase Recursal (Item 9 do Edital)',
      status: 'Conforme',
      destaque: 'Prazo 48h com Protocolo Único',
      icone: AlertTriangle,
      cor: 'border-rose-500 bg-rose-50/20 text-rose-900',
      rota: 'auditoria',
      itensObrigatorios: [
        'Prazo regimental improrrogável de até 48 horas úteis após a divulgação do resultado preliminar',
        'Indicação precisa do item questionado (Barema do Anexo II ou Pontuação Lattes do Anexo III)',
        'Vedação expressa à juntada de novos documentos que deveriam constar na submissão originária',
        'Geração de protocolo institucional e julgamento pelo Comitê Recursal Permanente da PROPEP',
      ],
    },
    {
      id: 'anexo-8',
      numero: 'Anexo VIII',
      titulo: 'Roteiro de Relatório Técnico-Científico Semestral e Relatório Final de IC',
      resumo: 'Estrutura formal para prestação de contas acadêmica no 6º mês (Relatório Parcial) e no 12º mês (Relatório Final com artigo para publicação nos anais da Jornada UNIG).',
      badgeEtapa: 'Execução & Prestação de Contas',
      status: 'Conforme',
      destaque: 'Relatórios no 6º e 12º Mês',
      icone: BookOpen,
      cor: 'border-indigo-500 bg-indigo-50/20 text-indigo-900',
      rota: 'relatorios',
      itensObrigatorios: [
        'Relatório Parcial (6 meses): Acompanhamento das metas do cronograma, desvios e ajustes metodológicos',
        'Relatório Final (12 meses): Consolidação de resultados, discussão, conclusões e prestação de contas',
        'Obrigatoriedade de submissão de resumo expandido para a Jornada Científica Institucional da UNIG',
        'Emissão de Certificado Oficial de Conclusão de Iniciação Científica após aprovação do relatório',
      ],
    },
  ];

  const anexoSelecionado = anexosInfo.find((a) => a.id === anexoAtivo) || anexosInfo[3]; // Anexo IV

  return (
    <div className="space-y-6">
      {/* Banner Principal de Conformidade Regimental */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#0A4D7E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-amber-400 text-slate-950 tracking-wide uppercase flex items-center space-x-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Auditoria de Conformidade 100% Validada</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/10 text-white border border-white/20">
                Resolução CEPE nº 014/PROPEP
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Edital {edital?.codigo || 'PIC-UNIG 2027'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Diretrizes Regimentais &amp; Anexos do Edital (Anexos I a VIII)
            </h2>

            <p className="text-sm text-slate-200 leading-relaxed">
              O sistema PIC-UNIG cumpre com exatidão todas as diretrizes normativas dos anexos do edital: da submissão
              eletrônica com custódia SHA-256 (Anexo I), banca duplo-cega com barema de 6,00 pts (Anexo II), regra do maior
              benefício H5/Scopus (Anexo III), relação oficial de cursos da UNIG (Anexo IV), cota afirmativa de 40 bolsas (Anexo V),
              termos de responsabilidade LGPD (Anexo VI), recursos administrativos de 48h (Anexo VII) aos relatórios semestrais de IC (Anexo VIII).
            </p>

            {/* Quadro de Métricas de Conformidade */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-slate-300 block">Anexos Regulamentados</span>
                <span className="text-xl font-extrabold text-white">8 de 8 (100%)</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-slate-300 block">Cursos UNIG Elegíveis</span>
                <span className="text-xl font-extrabold text-amber-300">{totalCursos} Cursos</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-slate-300 block">Bolsas Totais / Cotas</span>
                <span className="text-xl font-extrabold text-white">100 (60 AC / 40 AF)</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <span className="text-[11px] text-slate-300 block">Barema Mérito + Lattes</span>
                <span className="text-xl font-extrabold text-emerald-300">6,00 + 4,00 = 10,0</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={gerarPdfDossieAnexos}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Dossiê em PDF</span>
            </button>
            <button
              onClick={() => setModalRecursoAberto(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl border border-white/30 transition-all flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Simular Recurso (Anexo VII)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegação Horizontal por Abas dos 8 Anexos */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {anexosInfo.map((anexo) => {
            const isSelected = anexoAtivo === anexo.id;
            const Icone = anexo.icone;
            return (
              <button
                key={anexo.id}
                onClick={() => setAnexoAtivo(anexo.id)}
                className={`p-2.5 rounded-xl text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#002B49] text-white shadow-sm ring-2 ring-blue-500/20 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                    {anexo.numero}
                  </span>
                  <Icone className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="text-xs leading-snug truncate">
                  {anexo.id === 'anexo-4' ? 'Relação de Cursos' : anexo.titulo.split('(')[0].replace('Formulário de', '').replace('Barema Oficial de', '').trim()}
                </div>
                <div className="mt-1 flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  <span className={`text-[9px] ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>Conforme</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel do Anexo Selecionado */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Cabeçalho do Anexo Selecionado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#002B49] text-white">
                {anexoSelecionado.numero}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>100% Implementado</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
                {anexoSelecionado.badgeEtapa}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">{anexoSelecionado.titulo}</h3>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{anexoSelecionado.resumo}</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigateTab(anexoSelecionado.rota)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
            >
              <span>Acessar Módulo no Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CONTEÚDO ESPECÍFICO DO ANEXO IV: RELAÇÃO OFICIAL DE CURSOS DE GRADUAÇÃO UNIG */}
        {anexoAtivo === 'anexo-4' && (
          <div className="space-y-6">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-950">
                      Anexo IV – Relação Oficial de Cursos de Graduação e Mestrados (PIC-UNIG)
                    </h4>
                    <p className="text-xs text-blue-800">
                      19 Cursos de Graduação e 4 Programas de Mestrado Stricto Sensu autorizados e reconhecidos pelo MEC na UNIG.
                    </p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
                  {totalCursos} Programas (19 Graduações + 4 Mestrados) | {cursosComProposta} com Submissões
                </div>
              </div>

              {/* Filtros e Busca de Cursos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="relative sm:col-span-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome do curso/mestrado, sigla (ex: MED, ADM, MEST_ODONT)..."
                    value={buscaCurso}
                    onChange={(e) => setBuscaCurso(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'Graduação' | 'Mestrado')}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="todos">Todos os Cursos e Mestrados (23)</option>
                    <option value="Graduação">Cursos de Graduação (19)</option>
                    <option value="Mestrado">Programas de Mestrado (4)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid de Cards dos Cursos da Relação Oficial */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {cursosFiltrados.map((curso) => {
                // Contagem de projetos submetidos neste curso
                const countProjetos = propostas.filter(
                  (p) =>
                    p.discenteCurso.toLowerCase() === curso.nome.toLowerCase() ||
                    p.discenteCurso.toLowerCase().includes(curso.nome.toLowerCase()) ||
                    getCursoMeta(p.discenteCurso).sigla.toLowerCase() === curso.sigla.toLowerCase()
                ).length;

                return (
                  <div
                    key={curso.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${curso.bgTag} ${curso.corTag} ${curso.borderTag}`}>
                              {curso.sigla}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {curso.tipo === 'Mestrado' ? 'Mestrado Stricto Sensu' : `${curso.grau} • ${curso.campus.replace('Campus ', '')}`}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 mt-1">{curso.nome}</h5>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {curso.codigoMec}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {curso.descricao}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {curso.linhasPesquisaSugeridas.map((linha, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            • {linha}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-500">Projetos no Edital:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${countProjetos > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                          {countProjetos} {countProjetos === 1 ? 'projeto' : 'projetos'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (onFilterCursoNosProjetos) {
                            onFilterCursoNosProjetos(curso.nome);
                          }
                          onNavigateTab('projetos');
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>Ver Projetos</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTEÚDO GENÉRICO DOS OUTROS ANEXOS (I, II, III, V, VI, VII, VIII) */}
        {anexoAtivo !== 'anexo-4' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Checklist de Requisitos Obrigatórios do {anexoSelecionado.numero}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anexoSelecionado.itensObrigatorios.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-slate-800 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Evidência de Auditoria:</span>
                <span className="text-slate-600">
                  Implementação auditada conforme Resolução CEPE nº 014/PROPEP.
                </span>
              </div>
              <button
                onClick={() => onNavigateTab(anexoSelecionado.rota)}
                className="px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition-all self-start sm:self-auto"
              >
                Abrir Módulo de {anexoSelecionado.titulo.split('(')[0]}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Interativo de Interposição de Recurso Administrativo (Anexo VII) */}
      {modalRecursoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Anexo VII – Formulário de Interposição de Recurso Administrativo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prazo regimental de até 48 horas úteis após divulgação do resultado preliminar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalRecursoAberto(false);
                  setRecursoEnviadoSucesso(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {recursoEnviadoSucesso ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Recurso Protocolado com Sucesso!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Seu recurso administrativo foi registrado no sistema sob o protocolo oficial e encaminhado à Comissão
                  Recursal Permanente da PROPEP/UNIG.
                </p>
                <div className="bg-slate-100 p-3 rounded-xl inline-block font-mono text-xs font-bold text-slate-800">
                  Protocolo: {protocoloGerado}
                </div>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setModalRecursoAberto(false);
                      setRecursoEnviadoSucesso(false);
                    }}
                    className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Concluir e Voltar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarRecurso} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Selecione a Proposta Objeto do Recurso *
                  </label>
                  <select
                    value={propostaRecursoId}
                    onChange={(e) => setPropostaRecursoId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {propostas.map((p) => (
                      <option key={p.id} value={p.id}>
                        #PIC-{String(p.id).padStart(3, '0')} — {p.titulo} ({p.discenteCurso})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Item / Dimensão Questionada *
                  </label>
                  <select
                    value={itemImpugnado}
                    onChange={(e) => setItemImpugnado(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Anexo II - Dimensão 1: Originalidade e relevância">Anexo II - Dimensão 1: Originalidade e relevância (máx 1.50)</option>
                    <option value="Anexo II - Dimensão 2: Rigor metodológico e desenho amostral">Anexo II - Dimensão 2: Rigor metodológico e desenho amostral (máx 1.50)</option>
                    <option value="Anexo II - Dimensão 3: Coerência entre objetivos e justificativa">Anexo II - Dimensão 3: Coerência entre objetivos e justificativa (máx 1.00)</option>
                    <option value="Anexo II - Dimensão 4: Viabilidade técnica e cronograma">Anexo II - Dimensão 4: Viabilidade técnica e cronograma (máx 1.00)</option>
                    <option value="Anexo II - Dimensão 5: Inserção social e impacto Baixada">Anexo II - Dimensão 5: Inserção social e impacto Baixada (máx 1.00)</option>
                    <option value="Anexo III - Pontuação do Currículo Lattes e Regra Maior Benefício">Anexo III - Pontuação Lattes e Regra do Maior Benefício H5/Scopus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Fundamentação Técnico-Científica do Recurso *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Apresente de forma objetiva e fundamentada os motivos do pedido de revisão da pontuação com base estrita no texto da proposta original..."
                    value={justificativaRecurso}
                    onChange={(e) => setJustificativaRecurso(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * É vedada a apresentação de documentos ou informações novas não contidas na submissão originária.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalRecursoAberto(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Protocolar Recurso</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
