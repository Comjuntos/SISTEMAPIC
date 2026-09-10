import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Proposta, Edital, AuditoriaLog, DesenhoPesquisa } from '../types/index.ts';
import { HIERARQUIA_DESENHOS } from './methodology.ts';
import { RelatorioImpactoSimulacao } from './simulation.ts';

// Cores institucionais UNIG
const COR_AZUL_UNIG = [0, 43, 73]; // #002B49
const COR_DOURADO = [217, 119, 6]; // #D97706
const COR_CINZA_CLARO = [248, 250, 252];
const COR_BORDA = [226, 232, 240];
const COR_TEXTO_ESCURO = [30, 41, 59];
const COR_TEXTO_MUTED = [100, 116, 139];

/**
 * Adiciona rodapé formal com numeração de páginas em todas as páginas do PDF
 */
function adicionarRodape(doc: jsPDF, tituloDocumento: string) {
  const totalPages = doc.getNumberOfPages();
  const dataHoraEmissao = new Date().toLocaleString('pt-BR');

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Linha divisória sutil
    doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
    doc.setLineWidth(0.5);
    doc.line(30, pageHeight - 24, pageWidth - 30, pageHeight - 24);

    // Texto do rodapé
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
    doc.text(
      `Universidade Iguaçu (UNIG) • PROPEP/PIC 2027 • ${tituloDocumento} • Emitido em: ${dataHoraEmissao}`,
      30,
      pageHeight - 14
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 14, { align: 'right' });
  }
}

/**
 * Exporta a Ata Oficial de Homologação Final do Edital PIC-UNIG 2027 (Paisagem A4)
 */
export function exportarHomologacaoFinalPDF(propostas: Proposta[], edital: Edital | null) {
  // Configuração paisagem para tabela detalhada com 11 colunas
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 35;
  let currentY = 32;

  // 1. Cabeçalho Institucional Oficial
  // Tarja decorativa superior azul UNIG
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Brasão / Logo estilizado UNIG
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 32, 32, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 16, currentY + 22, { align: 'center' });

  // Textos do cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 42, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP', startX + 42, currentY + 22);
  doc.text('Comitê Institucional de Iniciação Científica e Tecnológica', startX + 42, currentY + 32);

  // Selo do Edital à direita
  const seloWidth = 210;
  const seloX = pageWidth - startX - seloWidth;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(COR_DOURADO[0], COR_DOURADO[1], COR_DOURADO[2]);
  doc.roundedRect(seloX, currentY, seloWidth, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_DOURADO[0], COR_DOURADO[1], COR_DOURADO[2]);
  doc.text('EDITAL PIC-UNIG 2027/2028', seloX + seloWidth / 2, currentY + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text('Quota Institucional: 100 Bolsas (60 AC + 40 AF)', seloX + seloWidth / 2, currentY + 25, { align: 'center' });

  currentY += 46;

  // Linha divisória
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.setLineWidth(0.8);
  doc.line(startX, currentY, pageWidth - startX, currentY);

  currentY += 16;

  // 2. Título Central da Ata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('ATA OFICIAL DE HOMOLOGAÇÃO DO RESULTADO FINAL E CONCESSÃO DE BOLSAS', pageWidth / 2, currentY, { align: 'center' });

  currentY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    'Classificação regimental ponderada segundo a fórmula: (Mérito Projeto × 0,50) + (Lattes Orientador × 0,30) + (CR Aluno × 0,20)',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );

  currentY += 16;

  // 3. Bloco de Indicadores Resumidos
  const ranqueadas = propostas
    .filter((p) => p.calculo?.notaFinalPonderada)
    .sort((a, b) => {
      const notaA = parseFloat(a.calculo?.notaFinalPonderada || '0');
      const notaB = parseFloat(b.calculo?.notaFinalPonderada || '0');
      return notaB - notaA;
    });

  const bolsasAC = ranqueadas.filter((p) => p.calculo?.tipoVagaConcedida === 'Ampla Concorrência').length;
  const bolsasAF = ranqueadas.filter((p) => p.calculo?.tipoVagaConcedida === 'Ações Afirmativas').length;
  const sobArbitragem = ranqueadas.filter((p) => p.calculo?.divergenciaDetectada).length;

  const cardWidth = (pageWidth - startX * 2 - 30) / 4;
  const cardHeight = 36;

  const cards = [
    { label: 'Propostas Homologadas', value: `${ranqueadas.length}`, cor: COR_AZUL_UNIG },
    { label: 'Bolsas Concedidas (AC)', value: `${bolsasAC} / 60`, cor: COR_AZUL_UNIG },
    { label: 'Bolsas Concedidas (AF)', value: `${bolsasAF} / 40`, cor: COR_DOURADO },
    { label: 'Status da Banca', value: sobArbitragem > 0 ? `${sobArbitragem} Sob Arbitragem` : '100% Convergente', cor: sobArbitragem > 0 ? [220, 38, 38] : [5, 150, 105] },
  ];

  cards.forEach((c, idx) => {
    const x = startX + idx * (cardWidth + 10);
    doc.setFillColor(COR_CINZA_CLARO[0], COR_CINZA_CLARO[1], COR_CINZA_CLARO[2]);
    doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 4, 4, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
    doc.text(c.label, x + 8, currentY + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(c.cor[0], c.cor[1], c.cor[2]);
    doc.text(c.value, x + 8, currentY + 28);
  });

  currentY += cardHeight + 14;

  // 4. Montagem da Tabela com jspdf-autotable
  const tableData = ranqueadas.map((p, index) => {
    const c = p.calculo;
    const orientadorNome = p.orientador?.nome || p.orientador?.usuarioNome || `Orientador #${p.orientadorId}`;
    const orientadorMetrica = p.orientador ? `(${p.orientador.regraMaiorBeneficioTipo}: ${p.orientador.pontuacaoMaiorBeneficio} pts)` : '';
    const desenhoAbrev = p.metodoDesenho === 'Ensaio Clínico Randomizado' ? 'ECR' :
      p.metodoDesenho === 'Ensaio de Roda / Estudo de coorte' ? 'Coorte/Roda' :
      p.metodoDesenho || '--';
    const scoreMetodo = c?.scoreMetodologico || p.metodoScoreTotal || '--';

    return [
      `${index + 1}º`,
      `#PIC-${String(p.id).padStart(3, '0')}`,
      p.titulo,
      `${orientadorNome} ${orientadorMetrica}`,
      `${p.discenteNome}\n(${p.discenteCurso})`,
      `${desenhoAbrev}\n(N=${p.metodoTamanhoAmostra || '?'}, ${p.metodoTipo || '?'})\n[${scoreMetodo} pts]`,
      p.modalidade === 'Ações Afirmativas' ? `AF: ${p.tipoCota || 'Cota'}` : 'Ampla Concorrência',
      c?.mediaEtapa2Merito ? `${c.mediaEtapa2Merito} / 6.00` : '--',
      c?.notaEtapa3Orientador ? `${c.notaEtapa3Orientador} / 4.00` : '--',
      p.discenteCr ? `${parseFloat(p.discenteCr).toFixed(2)}` : '--',
      c?.notaFinalPonderada ? `${c.notaFinalPonderada}` : '--',
      c?.divergenciaDetectada ? 'Sob Arbitragem' : c?.tipoVagaConcedida || 'Lista de Espera',
      c?.criterioDesempateAplicado || 'Média e pontuação homologadas',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Pos.',
      'Cód.',
      'Título do Projeto',
      'Docente Orientador',
      'Discente Candidato',
      'Delineamento &\nMétodos (/10)',
      'Modalidade',
      'Etapa 2\n(Proj. /6)',
      'Etapa 3\n(Orient. /4)',
      'Aluno\n(CR /10)',
      'Nota Final\n(Pond. /10)',
      'Vaga Concedida',
      'Status / Desempate',
    ]],
    body: tableData,
    margin: { left: startX, right: startX },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 7.5,
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 26 }, // Pos
      1: { halign: 'center', cellWidth: 44, fontStyle: 'bold' }, // Cód
      2: { cellWidth: 145 }, // Título
      3: { cellWidth: 110 }, // Orientador
      4: { cellWidth: 100 }, // Discente
      5: { cellWidth: 80, fontSize: 7 }, // Modalidade
      6: { halign: 'center', cellWidth: 48, fontStyle: 'bold' }, // Etapa 2
      7: { halign: 'center', cellWidth: 50, fontStyle: 'bold' }, // Etapa 3
      8: { halign: 'center', cellWidth: 40 }, // CR
      9: { halign: 'center', cellWidth: 52, fontStyle: 'bold', textColor: [0, 43, 73], fontSize: 8.5 }, // Nota Final
      10: { halign: 'center', cellWidth: 80, fontStyle: 'bold' }, // Vaga
      11: { cellWidth: 85, fontSize: 6.8 }, // Desempate
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Destacar estilo de vagas concedidas
      if (data.section === 'body' && data.column.index === 10) {
        const text = String(data.cell.raw);
        if (text === 'Ampla Concorrência') {
          data.cell.styles.textColor = [0, 43, 73];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Ações Afirmativas') {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'Sob Arbitragem') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Destaque para os 3 primeiros colocados
      if (data.section === 'body' && data.column.index === 0) {
        if (data.row.index === 0) {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    },
  });

  // 5. Bloco de Assinaturas e Encerramento
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 25 : currentY + 120;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Verificar se há espaço para as assinaturas; caso contrário, adiciona nova página
  if (finalY + 90 > pageHeight) {
    doc.addPage();
  }

  const signY = finalY + 90 > pageHeight ? 50 : finalY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(
    `Nova Iguaçu - RJ, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`,
    startX,
    signY
  );

  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    'A presente ata expressa a deliberação soberana do Comitê Institucional e da Pró-Reitoria de Pós-Graduação e Pesquisa da UNIG, homologada para publicação oficial.',
    startX,
    signY + 12
  );

  // Linhas de Assinatura
  const signLineWidth = 220;
  const signX1 = startX + 60;
  const signX2 = pageWidth - startX - signLineWidth - 60;
  const lineY = signY + 45;

  // Assinatura 1: Pró-Reitor
  doc.setDrawColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.setLineWidth(0.8);
  doc.line(signX1, lineY, signX1 + signLineWidth, lineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('Prof. Dr. Valter Soares', signX1 + signLineWidth / 2, lineY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitor de Pós-Graduação e Pesquisa — PROPEP/UNIG', signX1 + signLineWidth / 2, lineY + 22, { align: 'center' });

  // Assinatura 2: Coordenadora do PIC
  doc.line(signX2, lineY, signX2 + signLineWidth, lineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('Profa. Dra. Heloísa Vasconcelos', signX2 + signLineWidth / 2, lineY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Coordenadora Geral do PIC-UNIG 2027/2028', signX2 + signLineWidth / 2, lineY + 22, { align: 'center' });

  // Rodapé em todas as páginas
  adicionarRodape(doc, 'Ata de Homologação Final do Resultado');

  // Salvar o arquivo
  const filename = `ata_homologacao_final_pic_unig_${edital?.ano || 2027}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Parecer Técnico Regimental de Avaliação Individual de um Projeto (Retrato A4)
 */
export function exportarParecerIndividualPDF(proposta: Proposta, edital?: Edital | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 40;
  const contentWidth = pageWidth - startX * 2;
  let currentY = 32;

  // 1. Tarja decorativa superior e Cabeçalho Institucional
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Logo UNIG
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 30, 30, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 15, currentY + 21, { align: 'center' });

  // Texto do cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 38, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP', startX + 38, currentY + 20);
  doc.text('Comitê Institucional de Iniciação Científica — Edital PIC-UNIG 2027', startX + 38, currentY + 30);

  // Badge Protocolo à direita
  const badgeWidth = 140;
  const badgeX = pageWidth - startX - badgeWidth;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(badgeX, currentY, badgeWidth, 30, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 43, 73);
  doc.text(`PROJETO #PIC-${String(proposta.id).padStart(3, '0')}`, badgeX + badgeWidth / 2, currentY + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('AVALIAR HUMANO + IA', badgeX + badgeWidth / 2, currentY + 24, { align: 'center' });

  currentY += 44;

  // Linha divisória
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.setLineWidth(0.8);
  doc.line(startX, currentY, pageWidth - startX, currentY);

  currentY += 16;

  // 2. Título do Documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('LAUDO TÉCNICO REGIMENTAL DE AVALIAÇÃO DE MÉRITO CIENTÍFICO', pageWidth / 2, currentY, { align: 'center' });

  currentY += 16;

  // 3. Quadro de Metadados do Projeto
  doc.setFillColor(COR_CINZA_CLARO[0], COR_CINZA_CLARO[1], COR_CINZA_CLARO[2]);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(startX, currentY, contentWidth, 94, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('TÍTULO DA PROPOSTA:', startX + 10, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  const splitTitulo = doc.splitTextToSize(proposta.titulo, contentWidth - 20);
  doc.text(splitTitulo, startX + 10, currentY + 25);

  const tituloOffset = (splitTitulo.length - 1) * 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(`Curso de Graduação: ${proposta.discenteCurso} • Subárea: ${proposta.subarea || proposta.grandeArea}`, startX + 10, currentY + 40 + tituloOffset);
  doc.text(`Orientador: ${proposta.orientador?.nome || proposta.orientador?.usuarioNome || 'Docente Credenciado'} (${proposta.orientador?.titulacao || 'Doutor'})`, startX + 10, currentY + 51 + tituloOffset);
  doc.text(`Discente: ${proposta.discenteNome} • Curso: ${proposta.discenteCurso} • CR Acumulado: ${proposta.discenteCr}`, startX + 10, currentY + 62 + tituloOffset);
  doc.text(`Delineamento: ${proposta.metodoDesenho || 'Não informado'} • Amostra N=${proposta.metodoTamanhoAmostra || '--'} (${proposta.metodoTipo || '--'}) • Score Métodos: ${proposta.calculo?.scoreMetodologico || proposta.metodoScoreTotal || '0.00'}/10.00 pts`, startX + 10, currentY + 73 + tituloOffset);
  doc.text(`Modalidade: ${proposta.modalidade}${proposta.tipoCota ? ` (${proposta.tipoCota})` : ''} • Hash SHA-256: ${proposta.hashSha256.substring(0, 16)}...`, startX + 10, currentY + 84 + tituloOffset);

  currentY += 104 + tituloOffset;

  // 4. Detalhamento dos 9 Critérios da Etapa 2 (Avaliação da Banca)
  const avals = proposta.avaliacoes || [];
  const aval1 = avals.find((a) => a.ordemParecerista === 1);
  const aval2 = avals.find((a) => a.ordemParecerista === 2);

  const nota1 = aval1 ? parseFloat(aval1.notaMeritoTotal) : null;
  const nota2 = aval2 ? parseFloat(aval2.notaMeritoTotal) : null;
  const diferenca = nota1 !== null && nota2 !== null ? Math.abs(nota1 - nota2) : null;
  const isDivergente = diferenca !== null && diferenca > 2.0;
  const media = nota1 !== null && nota2 !== null ? (nota1 + nota2) / 2 : null;

  const criterios = [
    { nome: '1. Título e Definição do Problema', max: '0.50', n1: aval1?.notaTitulo || '--', n2: aval2?.notaTitulo || '--' },
    { nome: '2. Introdução e Estado da Arte', max: '0.75', n1: aval1?.notaIntroducao || '--', n2: aval2?.notaIntroducao || '--' },
    { nome: '3. Objetivos e Hipóteses Científicas', max: '0.75', n1: aval1?.notaObjetivos || '--', n2: aval2?.notaObjetivos || '--' },
    { nome: '4. Justificativa e Relevância Técnico-Científica', max: '0.50', n1: aval1?.notaJustificativa || '--', n2: aval2?.notaJustificativa || '--' },
    { nome: '5. Metodologia Científica e Delineamento Experimental', max: '1.00', n1: aval1?.notaMetodologia || '--', n2: aval2?.notaMetodologia || '--' },
    { nome: '6. Viabilidade Técnica e Infraestrutura Laboratorial', max: '0.75', n1: aval1?.notaViabilidade || '--', n2: aval2?.notaViabilidade || '--' },
    { nome: '7. Cronograma Físico-Financeiro de Execução', max: '0.50', n1: aval1?.notaCronograma || '--', n2: aval2?.notaCronograma || '--' },
    { nome: '8. Plano de Trabalho Detalhado do Discente', max: '0.75', n1: aval1?.notaPlanoDiscente || '--', n2: aval2?.notaPlanoDiscente || '--' },
    { nome: '9. Inserção Social, ODS e Agenda 2030', max: '0.50', n1: aval1?.notaInsercaoSocial || '--', n2: aval2?.notaInsercaoSocial || '--' },
  ];

  const tabelaCriterios = criterios.map((c) => {
    const val1 = parseFloat(c.n1) || 0;
    const val2 = parseFloat(c.n2) || 0;
    const mediaCrit = c.n1 !== '--' && c.n2 !== '--' ? ((val1 + val2) / 2).toFixed(2) : '--';
    return [c.nome, `${c.max} pt`, c.n1, c.n2, mediaCrit];
  });

  // Linha de total
  tabelaCriterios.push([
    'NOTA TOTAL DE MÉRITO (ETAPA 2)',
    '6.00 pts',
    aval1?.notaMeritoTotal ? `${parseFloat(aval1.notaMeritoTotal).toFixed(2)} pts` : 'Pendente',
    aval2?.notaMeritoTotal ? `${parseFloat(aval2.notaMeritoTotal).toFixed(2)} pts` : 'Pendente',
    media !== null ? `${media.toFixed(2)} pts` : 'Incompleto',
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Critério Regimental Avaliado', 'Peso Máx.', 'Parecerista 1', 'Parecerista 2', 'Média Banca']],
    body: tabelaCriterios,
    margin: { left: startX, right: startX },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 260, fontStyle: 'normal' },
      1: { halign: 'center', cellWidth: 60, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 65 },
      3: { halign: 'center', cellWidth: 65 },
      4: { halign: 'center', cellWidth: 65, fontStyle: 'bold', textColor: [0, 43, 73] },
    },
    didParseCell: (data) => {
      // Linha final em destaque
      if (data.row.index === criterios.length) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 4) {
          data.cell.styles.textColor = [0, 43, 73];
          data.cell.styles.fontSize = 9;
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : currentY + 160;

  // 5. Bloco de Diagnóstico de Convergência / Divergência
  if (diferenca !== null) {
    if (isDivergente) {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(252, 165, 165);
      doc.roundedRect(startX, currentY, contentWidth, 30, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text(
        `ALERTA DE DISCREPÂNCIA REGIMENTAL: Diferença de ${diferenca.toFixed(2)} pontos (> 2.00 pts) entre os pareceristas.`,
        startX + 10,
        currentY + 12
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(127, 29, 29);
      doc.text(
        'Nos termos do Edital PIC-UNIG, o projeto foi submetido à Coordenação para convocação obrigatória de 3º árbitro.',
        startX + 10,
        currentY + 23
      );
    } else {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(startX, currentY, contentWidth, 24, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      doc.text(
        `CONVERGÊNCIA REGIMENTAL HOMOLOGADA: Diferença de ${diferenca.toFixed(2)} pts (<= 2.00 pts). Média da banca: ${media?.toFixed(2)} / 6.00 pts.`,
        startX + 10,
        currentY + 15
      );
    }
    currentY += isDivergente ? 38 : 32;
  }

  // 6. Pareceres Consubstanciados dos Avaliadores
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('JUSTIFICATIVAS TÉCNICAS E RECOMENDAÇÕES DA BANCA EXAMINADORA', startX, currentY);

  currentY += 12;

  // Parecer 1
  doc.setFillColor(COR_CINZA_CLARO[0], COR_CINZA_CLARO[1], COR_CINZA_CLARO[2]);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(startX, currentY, contentWidth, 54, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`Parecerista 1 — Recomendação: ${aval1?.recomendacao || 'Pendente'}`, startX + 8, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  const splitP1 = doc.splitTextToSize(aval1?.parecerConsubstanciado || 'Aguardando submissão formal de parecer técnico.', contentWidth - 16);
  doc.text(splitP1.slice(0, 3), startX + 8, currentY + 24);

  currentY += 60;

  // Parecer 2
  doc.setFillColor(COR_CINZA_CLARO[0], COR_CINZA_CLARO[1], COR_CINZA_CLARO[2]);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(startX, currentY, contentWidth, 54, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`Parecerista 2 — Recomendação: ${aval2?.recomendacao || 'Pendente'}`, startX + 8, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  const splitP2 = doc.splitTextToSize(aval2?.parecerConsubstanciado || 'Aguardando submissão formal de parecer técnico.', contentWidth - 16);
  doc.text(splitP2.slice(0, 3), startX + 8, currentY + 24);

  currentY += 62;

  // 7. Diagnóstico Auxiliar do Modelo IA (Gemini 3.8 Flash)
  if (proposta.analiseIa) {
    doc.setFillColor(250, 245, 255); // purple-50
    doc.setDrawColor(233, 213, 255); // purple-200
    doc.roundedRect(startX, currentY, contentWidth, 42, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 33, 168);
    doc.text(
      `Diagnóstico Preliminar de IA (${proposta.analiseIa.modeloUsado || 'Gemini 3.8 Flash'}) • Pontuação Estimada: ${proposta.analiseIa.pontuacaoEstimada || '5.20'} / 6.00`,
      startX + 8,
      currentY + 12
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(88, 28, 135);
    const splitIa = doc.splitTextToSize(
      `Parecer IA: ${proposta.analiseIa.parecerGeral} • Recomendações: ${proposta.analiseIa.recomendacoes}`,
      contentWidth - 16
    );
    doc.text(splitIa.slice(0, 2), startX + 8, currentY + 24);

    currentY += 48;
  }

  // 8. Quadro de Pontuação Final Ponderada e Homologação
  if (currentY + 100 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    currentY = 40;
  }

  const c = proposta.calculo;
  doc.setFillColor(0, 43, 73);
  doc.roundedRect(startX, currentY, contentWidth, 40, 4, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('CÁLCULO CONSOLIDADO DA PONTUAÇÃO FINAL PONDERADA (0 a 10 pts):', startX + 10, currentY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Projeto (50%): ${c?.mediaEtapa2Merito ? `${c.mediaEtapa2Merito}/6` : '--'} • Orientador (30%): ${c?.notaEtapa3Orientador ? `${c.notaEtapa3Orientador}/4` : '--'} • Aluno CR (20%): ${proposta.discenteCr}`,
    startX + 10,
    currentY + 26
  );

  // Nota final à direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(254, 243, 199); // amber-100
  doc.text(
    c?.notaFinalPonderada ? `${c.notaFinalPonderada} pts` : '--',
    pageWidth - startX - 12,
    currentY + 26,
    { align: 'right' }
  );

  currentY += 50;

  // Resultado da Homologação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text(`Situação e Vaga Regimental Concedida: ${c?.tipoVagaConcedida || 'Em processo de classificação'}`, startX, currentY);

  currentY += 28;

  // Linhas de assinatura da banca
  const signWidth = 200;
  const s1X = startX + 20;
  const s2X = pageWidth - startX - signWidth - 20;

  doc.setDrawColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.setLineWidth(0.8);
  doc.line(s1X, currentY, s1X + signWidth, currentY);
  doc.line(s2X, currentY, s2X + signWidth, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('Banca Examinadora (Parecerista 1)', s1X + signWidth / 2, currentY + 11, { align: 'center' });
  doc.text('Banca Examinadora (Parecerista 2)', s2X + signWidth / 2, currentY + 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Protocolo de Homologação Duplo-Cega', s1X + signWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Protocolo de Homologação Duplo-Cega', s2X + signWidth / 2, currentY + 20, { align: 'center' });

  // Rodapé em todas as páginas
  adicionarRodape(doc, `Parecer Técnico #PIC-${String(proposta.id).padStart(3, '0')}`);

  // Salvar PDF individual
  const filename = `parecer_tecnico_pic_${String(proposta.id).padStart(3, '0')}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Relatório Executivo de Delineamentos e Métodos Científicos para a Coordenação (A4 Paisagem)
 */
export function exportarRelatorioMetodosCientificosPDF(propostas: Proposta[], edital: Edital | null) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 35;
  let currentY = 32;

  // Tarja superior
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Brasão e Cabeçalho
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 32, 32, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 16, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 42, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP', startX + 42, currentY + 22);
  doc.text('Relatório Executivo da Coordenação: Delineamentos e Rigor Metodológico', startX + 42, currentY + 32);

  // Selo
  const seloWidth = 230;
  const seloX = pageWidth - startX - seloWidth;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.roundedRect(seloX, currentY, seloWidth, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('ANÁLISE DE MÉTODOS CIENTÍFICOS', seloX + seloWidth / 2, currentY + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Critérios: Desenho (5 pts) + N (3 pts) + Tipo (2 pts)', seloX + seloWidth / 2, currentY + 25, { align: 'center' });

  currentY += 46;
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.line(startX, currentY, pageWidth - startX, currentY);
  currentY += 16;

  // Título Central
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('MAPA CONSOLIDADO DE RIGOR METODOLÓGICO E CLASSIFICAÇÃO DOS PROJETOS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    'Hierarquia Oficial: 1º ECR (5 pts) • 2º Coorte/Roda (4 pts) • 3º Caso-controle (3 pts) • 4º Relato de caso (2 pts) • 5º In vitro (1 pt)',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 18;

  // Contagem por desenho
  const contagem: Record<string, number> = {
    'Ensaio Clínico Randomizado': 0,
    'Ensaio de Roda / Estudo de coorte': 0,
    'Caso controle': 0,
    'Relato de caso': 0,
    'Estudo in vitro': 0,
  };
  propostas.forEach((p) => {
    if (p.metodoDesenho && contagem[p.metodoDesenho] !== undefined) {
      contagem[p.metodoDesenho]++;
    }
  });

  // Tabela com ordenação por rigor metodológico
  const ordenadasMetodos = [...propostas].sort((a, b) => {
    const ordemA = HIERARQUIA_DESENHOS[a.metodoDesenho as DesenhoPesquisa]?.ordem || 99;
    const ordemB = HIERARQUIA_DESENHOS[b.metodoDesenho as DesenhoPesquisa]?.ordem || 99;
    if (ordemA !== ordemB) return ordemA - ordemB;

    const scoreA = parseFloat(a.calculo?.scoreMetodologico || a.metodoScoreTotal || '0');
    const scoreB = parseFloat(b.calculo?.scoreMetodologico || b.metodoScoreTotal || '0');
    if (scoreB !== scoreA) return scoreB - scoreA;

    const nA = a.metodoTamanhoAmostra || 0;
    const nB = b.metodoTamanhoAmostra || 0;
    return nB - nA;
  });

  const tableBody = ordenadasMetodos.map((p, idx) => {
    const hierarquia = HIERARQUIA_DESENHOS[p.metodoDesenho as DesenhoPesquisa];
    const scoreTotal = p.calculo?.scoreMetodologico || p.metodoScoreTotal || '0.00';
    const orientador = p.orientador?.nome || p.orientador?.usuarioNome || `Orientador #${p.orientadorId}`;

    return [
      `${idx + 1}º`,
      `PIC-${String(p.id).padStart(3, '0')}`,
      p.titulo,
      `${orientador}\nDiscente: ${p.discenteNome} (${p.discenteCurso})`,
      `${p.metodoDesenho || 'Não informado'}\n[${hierarquia ? `Ordem ${hierarquia.ordem}º • ${hierarquia.pontos.toFixed(2)} pts` : '--'}]`,
      p.metodoTipo || '--',
      `N = ${p.metodoTamanhoAmostra ?? '--'}\n(${p.metodoPontuacaoAmostra ? `+${p.metodoPontuacaoAmostra} pts` : ''})`,
      `${scoreTotal} / 10.00`,
      p.calculo?.notaFinalPonderada ? `${p.calculo.notaFinalPonderada} pts` : '--',
      p.calculo?.tipoVagaConcedida || 'Pendente',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: startX },
    head: [
      [
        'Rank\nMetod.',
        'Código',
        'Título da Proposta de Pesquisa',
        'Pesquisadores Envolvidos',
        'Delineamento &\nHierarquia (/5.0)',
        'Abordagem\n(/2.0)',
        'Amostra N\n(/3.0)',
        'Score Metod.\nTotal (/10.0)',
        'Nota Final\nEdital',
        'Vaga / Concessão',
      ],
    ],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 4,
      valign: 'middle',
      textColor: COR_TEXTO_ESCURO as [number, number, number],
      lineColor: COR_BORDA as [number, number, number],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [6, 78, 59], // emerald-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 35, fontStyle: 'bold' },
      1: { halign: 'center', cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 170 },
      3: { cellWidth: 130 },
      4: { cellWidth: 120 },
      5: { halign: 'center', cellWidth: 55 },
      6: { halign: 'center', cellWidth: 55 },
      7: { halign: 'center', cellWidth: 60, fontStyle: 'bold', textColor: [6, 95, 70] },
      8: { halign: 'center', cellWidth: 45, fontStyle: 'bold' },
      9: { cellWidth: 60, fontSize: 7 },
    },
  });

  adicionarRodape(doc, 'Relatório Executivo de Rigor Metodológico — Coordenação PIC-UNIG');
  const filename = `relatorio_metodologia_pic_unig_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Relatório Institucional de Auditoria e Conformidade LGPD (A4 Retrato)
 */
export function exportarRelatorioAuditoriaPDF(logs: AuditoriaLog[], edital: Edital | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 40;
  let currentY = 36;

  // Tarja superior
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Cabeçalho
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 32, 32, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 16, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 42, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP', startX + 42, currentY + 22);
  doc.text('Encarregado de Proteção de Dados (DPO) & Comissão de Auditoria', startX + 42, currentY + 32);

  // Selo LGPD
  const seloWidth = 190;
  const seloX = pageWidth - startX - seloWidth;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(seloX, currentY, seloWidth, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('AUDITORIA DE SEGURANÇA & LGPD', seloX + seloWidth / 2, currentY + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Total de Registros: ${logs.length} eventos`, seloX + seloWidth / 2, currentY + 25, { align: 'center' });

  currentY += 46;
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.line(startX, currentY, pageWidth - startX, currentY);
  currentY += 18;

  // Título Central
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('LIVRO ELETRÔNICO DE AUDITORIA, TRILHA DE EVENTOS E CUSTÓDIA CRIPTOGRÁFICA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    'Registro imutável em conformidade com a Lei Federal nº 13.709/2018 (LGPD) e Normativas PROPEP.',
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 18;

  // Tabela de Logs
  const tableBody = logs.map((log) => [
    log.criadoEm ? new Date(log.criadoEm).toLocaleString('pt-BR') : '--',
    log.usuarioEmail || 'Sistema',
    log.acao,
    `${log.entidade}${log.entidadeId ? ` #${log.entidadeId}` : ''}`,
    log.detalhes,
    log.ipOrigem || '127.0.0.1',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: startX },
    head: [['Data / Hora', 'Operador / Identificação', 'Ação / Evento', 'Objeto', 'Detalhes Técnicos / Custódia', 'IP Origem']],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 4,
      valign: 'middle',
      textColor: COR_TEXTO_ESCURO as [number, number, number],
      lineColor: COR_BORDA as [number, number, number],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: COR_AZUL_UNIG as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 70, fontSize: 7 },
      1: { cellWidth: 105 },
      2: { cellWidth: 85, fontStyle: 'bold' },
      3: { cellWidth: 65 },
      4: { cellWidth: 130, fontSize: 7 },
      5: { cellWidth: 60, halign: 'center', fontSize: 7 },
    },
  });

  adicionarRodape(doc, 'Trilha Oficial de Auditoria e Conformidade LGPD — UNIG');
  const filename = `relatorio_auditoria_lgpd_pic_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Dossiê Completo e Ficha Cadastral da Proposta de Pesquisa (A4 Retrato)
 */
export function exportarDossieCompletoPropostaPDF(proposta: Proposta, edital: Edital | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 40;
  const contentWidth = pageWidth - startX * 2;
  let currentY = 36;

  // Tarja superior
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Cabeçalho
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 32, 32, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 16, currentY + 22, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 42, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP', startX + 42, currentY + 22);
  doc.text('Programa de Iniciação Científica — Ficha Cadastral e Dossiê Científico', startX + 42, currentY + 32);

  // Selo
  const seloWidth = 180;
  const seloX = pageWidth - startX - seloWidth;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(COR_DOURADO[0], COR_DOURADO[1], COR_DOURADO[2]);
  doc.roundedRect(seloX, currentY, seloWidth, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_DOURADO[0], COR_DOURADO[1], COR_DOURADO[2]);
  doc.text(`PROPOSTA #PIC-${String(proposta.id).padStart(3, '0')}`, seloX + seloWidth / 2, currentY + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`Status: ${proposta.status.toUpperCase()}`, seloX + seloWidth / 2, currentY + 25, { align: 'center' });

  currentY += 46;
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.line(startX, currentY, pageWidth - startX, currentY);
  currentY += 16;

  // Título do Projeto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  const splitTitulo = doc.splitTextToSize(proposta.titulo, contentWidth);
  doc.text(splitTitulo, startX, currentY);
  currentY += splitTitulo.length * 16 + 8;

  // Quadro de Identificação e Equipe
  doc.setFillColor(COR_CINZA_CLARO[0], COR_CINZA_CLARO[1], COR_CINZA_CLARO[2]);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(startX, currentY, contentWidth, 80, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('IDENTIFICAÇÃO DA PROPOSTA E PESQUISADORES:', startX + 10, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`Curso de Graduação: ${proposta.discenteCurso} • Subárea: ${proposta.subarea}`, startX + 10, currentY + 28);
  doc.text(`Docente Orientador: ${proposta.orientador?.nome || proposta.orientador?.usuarioNome || 'Docente Cadastrado'} (${proposta.orientador?.titulacao || 'Doutor'}) • Departamento: ${proposta.orientador?.departamento || 'Ciências da Saúde'}`, startX + 10, currentY + 42);
  doc.text(`Discente Candidato: ${proposta.discenteNome} • Curso: ${proposta.discenteCurso} • CR Acumulado: ${proposta.discenteCr}`, startX + 10, currentY + 56);
  doc.text(`Modalidade Concorrente: ${proposta.modalidade}${proposta.tipoCota ? ` (Cota: ${proposta.tipoCota})` : ''} • Data de Submissão: ${proposta.criadoEm ? new Date(proposta.criadoEm).toLocaleDateString('pt-BR') : '--'}`, startX + 10, currentY + 70);

  currentY += 92;

  // Bloco de Rigor Metodológico
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(startX, currentY, contentWidth, 60, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70);
  doc.text('DELINEAMENTO E RIGOR METODOLÓGICO:', startX + 10, currentY + 15);

  const scoreMetodo = proposta.calculo?.scoreMetodologico || proposta.metodoScoreTotal || '0.00';
  doc.text(`Score Metodológico: ${scoreMetodo} / 10.00 pts`, pageWidth - startX - 10, currentY + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(6, 78, 59);
  doc.text(`• Desenho da Pesquisa: ${proposta.metodoDesenho || 'Não informado'} (${proposta.metodoPontuacaoDesenho ? `${proposta.metodoPontuacaoDesenho} pts` : ''})`, startX + 10, currentY + 29);
  doc.text(`• Abordagem Científica: ${proposta.metodoTipo || 'Não informada'} (${proposta.metodoPontuacaoTipo ? `+${proposta.metodoPontuacaoTipo} pts` : ''})`, startX + 10, currentY + 41);
  doc.text(`• Tamanho Amostral: N = ${proposta.metodoTamanhoAmostra ?? '--'} (${proposta.metodoPontuacaoAmostra ? `+${proposta.metodoPontuacaoAmostra} pts` : ''})`, startX + 10, currentY + 53);

  currentY += 72;

  // Resumo Científico
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('RESUMO ESTRUTURADO DA PROPOSTA:', startX, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  const splitResumo = doc.splitTextToSize(proposta.resumo, contentWidth);
  doc.text(splitResumo, startX, currentY);
  currentY += splitResumo.length * 11 + 14;

  // Custódia e Hash
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(startX, currentY, contentWidth, 34, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('INTEGRIDADE CRIPTOGRÁFICA E CUSTÓDIA DIGITAL:', startX + 8, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Hash SHA-256 do Arquivo Submetido: ${proposta.hashSha256}`, startX + 8, currentY + 24);

  adicionarRodape(doc, `Dossiê Científico #PIC-${String(proposta.id).padStart(3, '0')}`);
  const filename = `dossie_proposta_pic_${String(proposta.id).padStart(3, '0')}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Relatório Executivo de Sensibilidade Orçamentária e Matriz de Cenários "E Se..." (Paisagem A4)
 */
export function exportarSimuladorCenariosPDF(
  simulacao: RelatorioImpactoSimulacao,
  edital: Edital | null = null
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const startX = 30;
  const contentWidth = pageWidth - startX * 2;
  let currentY = 24;

  // 1. Tarja decorativa superior e Cabeçalho Institucional
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Logo UNIG
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(startX, currentY, 28, 28, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('U', startX + 14, currentY + 19, { align: 'center' });

  // Texto do cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU — UNIG', startX + 36, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa — PROPEP • Coordenação Geral de Iniciação Científica', startX + 36, currentY + 20);
  doc.text(`Edital Ativo: ${edital?.titulo || 'PIC-UNIG 2027/2028'} • Estudo de Sensibilidade e Governança Orçamentária`, startX + 36, currentY + 29);

  // Badge Protocolo à direita
  const badgeWidth = 230;
  const badgeX = pageWidth - startX - badgeWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.roundedRect(badgeX, currentY, badgeWidth, 30, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_DOURADO[0], COR_DOURADO[1], COR_DOURADO[2]);
  doc.text('SIMULADOR EXECUTIVO "WHAT-IF" • REITORIA/PROPEP', badgeX + 8, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, badgeX + 8, currentY + 23);

  currentY += 40;

  // 2. Título do Relatório
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('RELATÓRIO DE IMPACTO DE CENÁRIOS, DANÇA DAS CADEIRAS & SENSIBILIDADE ORÇAMENTÁRIA', startX, currentY);
  currentY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    'Demonstrativo analítico de simulação de alteração de pesos regimentais, expansão de cotas institucionais e impacto orçamentário anual.',
    startX,
    currentY
  );
  currentY += 16;

  // 3. Quadro Comparativo de Parâmetros e Orçamento
  const p = simulacao.parametros;
  const of = simulacao.oficial;
  const sim = simulacao.simulado;

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        'DIMENSÃO DE ANÁLISE',
        'CENÁRIO OFICIAL DO EDITAL',
        'CENÁRIO SIMULADO (WHAT-IF)',
        'VARIAÇÃO LÍQUIDA (DELTA)',
        'IMPACTO REGIMENTAL / ORÇAMENTÁRIO',
      ],
    ],
    body: [
      [
        'Total de Bolsas de Pesquisa',
        `${of.totalBolsas} Bolsas (100%)`,
        `${sim.totalBolsas} Bolsas (100%)`,
        `${sim.totalBolsas - of.totalBolsas >= 0 ? '+' : ''}${sim.totalBolsas - of.totalBolsas} Bolsas`,
        sim.totalBolsas > of.totalBolsas ? 'Expansão de vagas com novo fomento' : 'Manutenção da cota regimental',
      ],
      [
        'Cotas: Ampla vs. Ações Afirmativas',
        `60 AC (60%) / 40 AF (40%)`,
        `${sim.vagasAC} AC (${100 - p.percCotasAf}%) / ${sim.vagasAF} AF (${p.percCotasAf}%)`,
        `AF: ${p.percCotasAf - 40 >= 0 ? '+' : ''}${p.percCotasAf - 40}%`,
        p.percCotasAf > 40 ? 'Ampliação da política afirmativa de equidade' : 'Proporção padrão mantida',
      ],
      [
        'Pesos: Projeto / Orientador / Aluno',
        '50% Projeto / 30% Lattes / 20% CR',
        `${p.pesoProjeto}% Projeto / ${p.pesoOrientador}% Lattes / ${p.pesoAluno}% CR`,
        `Proj: ${p.pesoProjeto - 50}% | Lat: ${p.pesoOrientador - 30}%`,
        p.pesoProjeto > 50 ? 'Maior valorização do mérito científico cego' : 'Maior ênfase na produtividade docente',
      ],
      [
        'Custo Mensal da Folha de Bolsas',
        `R$ ${of.custoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${sim.custoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${simulacao.deltaCustoMensal >= 0 ? '+' : ''}R$ ${simulacao.deltaCustoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`,
        `Valor unitário: R$ ${p.valorBolsaMensal.toFixed(2)}/mês por bolsista`,
      ],
      [
        'Custo Orçamentário Anual (12 Meses)',
        `R$ ${of.custoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${sim.custoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${simulacao.deltaCustoAnual >= 0 ? '+' : ''}R$ ${simulacao.deltaCustoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano`,
        simulacao.deltaCustoAnual > 0 ? 'Demanda suplementação orçamentária' : 'Dentro da dotação orçamentária prevista',
      ],
      [
        'Notas de Corte Estimadas (Pontuação)',
        `AC: ${of.corteAC.toFixed(2)} pts | AF: ${of.corteAF.toFixed(2)} pts`,
        `AC: ${sim.corteAC.toFixed(2)} pts | AF: ${sim.corteAF.toFixed(2)} pts`,
        `AC: ${(sim.corteAC - of.corteAC).toFixed(2)} | AF: ${(sim.corteAF - of.corteAF).toFixed(2)}`,
        'Sensibilidade direta na pontuação de corte para concessão',
      ],
      [
        'Mobilidade na Lista ("Dança das Cadeiras")',
        'Classificação Base Homologada',
        `${simulacao.novosContempladosCount} Entraram | ${simulacao.perderamBolsaCount} Saíram`,
        `${simulacao.mantiveramBolsaCount} Bolsistas Mantidos`,
        `${simulacao.novosContempladosCount} novos alunos beneficiados neste cenário`,
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 150 },
      1: { cellWidth: 140 },
      2: { cellWidth: 150, fontStyle: 'bold', textColor: [0, 43, 73] },
      3: { cellWidth: 130, fontStyle: 'bold' },
      4: { fontStyle: 'italic', textColor: [100, 116, 139] },
    },
    margin: { left: startX, right: startX },
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // 4. Tabela da "Dança das Cadeiras" (Propostas e Movimentações)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('MATRIZ COMPARATIVA DE PROPOSTAS — DANÇA DAS CADEIRAS (OFICIAL VS. SIMULADO)', startX, currentY);
  currentY += 10;

  const bodyPropostas = simulacao.propostasComparadas.map((p) => {
    let movTexto = 'Manteve Espera';
    if (p.movimentacaoStatus === 'NOVO_CONTEMPLADO') movTexto = '🟢 NOVO CONTEMPLADO';
    else if (p.movimentacaoStatus === 'PERDEU_BOLSA') movTexto = '🔴 PERDEU BOLSA';
    else if (p.movimentacaoStatus === 'MANTEVE_BOLSA') movTexto = '🟡 MANTEVE BOLSA';

    const rankTexto = p.deltaRank > 0 ? `+${p.deltaRank} posições` : p.deltaRank < 0 ? `${p.deltaRank} posições` : '= Estável';

    return [
      p.codigoFormatado,
      p.titulo.length > 38 ? `${p.titulo.substring(0, 36)}...` : p.titulo,
      p.orientadorNome.split(' ')[0] + ' ' + (p.orientadorNome.split(' ').pop() || ''),
      (p as any).curso || p.grandeArea,
      p.modalidade === 'Ações Afirmativas' ? 'AF' : 'AC',
      `${p.notaOficial.toFixed(2)} (${p.rankOficial}º)`,
      `${p.notaSimulada.toFixed(2)} (${p.rankSimulado}º)`,
      rankTexto,
      p.statusOficial,
      p.statusSimulado,
      movTexto,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        'CÓD',
        'TÍTULO DA PROPOSTA',
        'ORIENTADOR',
        'CURSO DE GRADUAÇÃO',
        'MOD.',
        'OFICIAL (NOTA/POS)',
        'SIMULADO (NOTA/POS)',
        'VARIAÇÃO POS',
        'STATUS OFICIAL',
        'STATUS SIMULADO',
        'RESULTADO DO IMPACTO',
      ],
    ],
    body: bodyPropostas,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46 },
      1: { cellWidth: 150 },
      2: { cellWidth: 72 },
      3: { cellWidth: 76 },
      4: { cellWidth: 32, halign: 'center' },
      5: { cellWidth: 68, halign: 'center' },
      6: { cellWidth: 72, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 62, halign: 'center' },
      8: { cellWidth: 70 },
      9: { cellWidth: 70, fontStyle: 'bold' },
      10: { cellWidth: 92, fontStyle: 'bold' },
    },
    didParseCell: function (data) {
      if (data.section === 'body') {
        const row = simulacao.propostasComparadas[data.row.index];
        if (row?.movimentacaoStatus === 'NOVO_CONTEMPLADO') {
          data.cell.styles.fillColor = [240, 253, 244]; // verde bem claro
        } else if (row?.movimentacaoStatus === 'PERDEU_BOLSA') {
          data.cell.styles.fillColor = [254, 242, 242]; // vermelho bem claro
        }
      }
    },
    margin: { left: startX, right: startX },
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // Se o espaço restante for menor que 80pt, criar nova página para assinaturas e parecer
  if (currentY > pageHeight - 90) {
    doc.addPage();
    currentY = 40;
  }

  // 5. Parecer e Assinaturas Institucionais
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('DESPACHO E PARECER DE VIABILIDADE TÉCNICA E ORÇAMENTÁRIA:', startX, currentY);
  currentY += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    `A presente simulação atesta que o cenário com ${sim.totalBolsas} bolsas e divisão ${100 - p.percCotasAf}/${p.percCotasAf} (AC/AF) apresenta um delta orçamentário anual de ` +
      `R$ ${simulacao.deltaCustoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, gerando inclusão de ${simulacao.novosContempladosCount} novo(s) bolsista(s). ` +
      `Submetido para apreciação e homologação superior pelo Conselho Universitário e Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP).`,
    startX,
    currentY,
    { maxWidth: contentWidth }
  );

  currentY += 36;

  // Linhas de assinatura
  const colWidth = (contentWidth - 60) / 3;

  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.line(startX, currentY, startX + colWidth, currentY);
  doc.line(startX + colWidth + 30, currentY, startX + colWidth * 2 + 30, currentY);
  doc.line(startX + colWidth * 2 + 60, currentY, startX + colWidth * 3 + 60, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa', startX + colWidth / 2, currentY + 10, { align: 'center' });
  doc.text('Coordenação Geral do PIC-UNIG 2027', startX + colWidth * 1.5 + 30, currentY + 10, { align: 'center' });
  doc.text('Conselho de Ensino, Pesquisa e Extensão', startX + colWidth * 2.5 + 60, currentY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('PROPEP / UNIG', startX + colWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Comitê Institucional Científico', startX + colWidth * 1.5 + 30, currentY + 20, { align: 'center' });
  doc.text('Governança Universitária', startX + colWidth * 2.5 + 60, currentY + 20, { align: 'center' });

  adicionarRodape(doc, 'Simulador de Cenários What-If & Sensibilidade Orçamentária');

  const filename = `relatorio_simulacao_cenarios_whatif_${p.totalBolsas}_bolsas_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Exporta o Edital Normativo & Cronograma da Linha do Tempo Oficial (PDF Retrato A4)
 */
export function exportarEditalCronogramaPDF(edital: Edital) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = 40;
  const contentWidth = pageWidth - 80;
  let currentY = 36;

  // 1. Cabeçalho Institucional
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('UNIVERSIDADE IGUAÇU - UNIG', startX, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitoria de Pós-Graduação e Pesquisa (PROPEP)', startX, currentY + 12);
  doc.text('Coordenação Geral do Programa de Iniciação Científica (PIC)', startX, currentY + 22);

  // Badge do Edital
  doc.setFillColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.roundedRect(pageWidth - 190, currentY - 4, 150, 24, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`ANO VIGÊNCIA ${edital.ano}/${edital.ano + 1}`, pageWidth - 115, currentY + 11, { align: 'center' });

  currentY += 40;
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.setLineWidth(0.75);
  doc.line(startX, currentY, startX + contentWidth, currentY);
  currentY += 16;

  // 2. Título do Documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text(`CRONOGRAMA OFICIAL & LINHA DO TEMPO REGIMENTAL`, startX, currentY);
  currentY += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(`${edital.titulo} • Código: ${edital.codigo}`, startX, currentY);
  currentY += 16;

  // 3. Quadro de Parâmetros e Orçamento
  const valorBolsa = edital.valorBolsa || 700;
  const orcamentoAnual = edital.orcamentoTotalAnual || edital.totalBolsas * valorBolsa * 12;

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: startX },
    head: [['Código do Edital', 'Ano Vigente', 'Total de Cotas', 'Ampla Concorrência', 'Ações Afirmativas', 'Valor Mensal', 'Orçamento Anual']],
    body: [
      [
        edital.codigo,
        `${edital.ano}`,
        `${edital.totalBolsas} bolsas`,
        `${edital.bolsasAmplaConcorrencia} (${Math.round((edital.bolsasAmplaConcorrencia / edital.totalBolsas) * 100)}%)`,
        `${edital.bolsasAcoesAfirmativas} (${Math.round((edital.bolsasAcoesAfirmativas / edital.totalBolsas) * 100)}%)`,
        `R$ ${valorBolsa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${orcamentoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      ],
    ],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      halign: 'center',
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 16;

  // 4. Tabela da Linha do Tempo (9 Fases Regimentais)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COR_AZUL_UNIG[0], COR_AZUL_UNIG[1], COR_AZUL_UNIG[2]);
  doc.text('MARCOS DO CICLO ANUAL & CALENDÁRIO REGIMENTAL (TIMELINE)', startX, currentY);
  currentY += 8;

  const cronograma = edital.cronograma || [];
  const tabelaFases = cronograma.map((fase) => {
    let statusLabel = 'Pendente';
    if (fase.status === 'concluido') statusLabel = 'Concluído (100%)';
    else if (fase.status === 'em_andamento') statusLabel = 'Em Andamento';

    return [
      `Etapa ${fase.faseNumero}`,
      fase.titulo,
      `${fase.dataInicio} a ${fase.dataFim}`,
      fase.responsavel,
      fase.criterioRegimental,
      statusLabel,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: startX, right: startX },
    head: [['Etapa', 'Denominação do Marco Regimental', 'Período Oficial', 'Órgão Responsável', 'Fundamento / Norma', 'Situação']],
    body: tabelaFases,
    theme: 'striped',
    styles: {
      fontSize: 7.5,
      cellPadding: 4.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [0, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 46, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 120, fontStyle: 'bold' },
      2: { cellWidth: 90, halign: 'center' },
      3: { cellWidth: 100 },
      4: { cellWidth: 95, fontSize: 6.5 },
      5: { cellWidth: 64, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const txt = String(data.cell.raw);
        if (txt.includes('Concluído')) {
          data.cell.styles.textColor = [16, 120, 50];
        } else if (txt.includes('Em Andamento')) {
          data.cell.styles.textColor = [217, 119, 6];
        } else {
          data.cell.styles.textColor = [100, 116, 139];
        }
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 28;

  if (currentY > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    currentY = 40;
  }

  // 5. Despacho Institucional & Assinaturas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text('DESPACHO TÉCNICO DE HOMOLOGAÇÃO DO CALENDÁRIO REGIMENTAL', startX, currentY);
  currentY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text(
    `Certifico que o cronograma anual supra especificado atende integralmente à Resolução CEPE nº 014/PROPEP e às diretrizes do CNPq/FAPERJ. O descumprimento de prazos implicará na perda de elegibilidade à concessão de quotas de fomento.`,
    startX,
    currentY,
    { maxWidth: contentWidth }
  );

  currentY += 45;

  const colWidth = (contentWidth - 40) / 2;
  doc.setDrawColor(COR_BORDA[0], COR_BORDA[1], COR_BORDA[2]);
  doc.line(startX, currentY, startX + colWidth, currentY);
  doc.line(startX + colWidth + 40, currentY, startX + colWidth * 2 + 40, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COR_TEXTO_ESCURO[0], COR_TEXTO_ESCURO[1], COR_TEXTO_ESCURO[2]);
  doc.text('Prof. Dr. Valter Soares', startX + colWidth / 2, currentY + 10, { align: 'center' });
  doc.text('Profa. Dra. Heloísa Vasconcelos', startX + colWidth * 1.5 + 40, currentY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COR_TEXTO_MUTED[0], COR_TEXTO_MUTED[1], COR_TEXTO_MUTED[2]);
  doc.text('Pró-Reitor de Pós-Graduação e Pesquisa (PROPEP)', startX + colWidth / 2, currentY + 20, { align: 'center' });
  doc.text('Coordenadora Geral do PIC / UNIG', startX + colWidth * 1.5 + 40, currentY + 20, { align: 'center' });

  adicionarRodape(doc, `Cronograma Oficial do Edital ${edital.codigo}`);

  const filename = `cronograma_edital_${edital.codigo.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}


