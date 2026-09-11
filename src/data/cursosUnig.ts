export type TipoProgramaAcademico = 'Graduação' | 'Mestrado';

export interface CursoUnig {
  id: string;
  nome: string;
  sigla: string;
  tipo: TipoProgramaAcademico;
  nomeExibicao: string;
  campus: 'Campus Nova Iguaçu' | 'Campus Itaperuna' | 'Nova Iguaçu & Itaperuna';
  centro?: string;
  grau: 'Bacharelado' | 'Licenciatura' | 'Tecnólogo' | 'Stricto Sensu (Mestrado)';
  duracaoSemestres: number;
  codigoMec: string;
  vagasAnuais: number;
  corTag: string;
  bgTag: string;
  borderTag: string;
  descricao: string;
  linhasPesquisaSugeridas: string[];
}

export type ProgramaAcademicoUnig = CursoUnig;

// 19 Cursos de Graduação Oficiais
export const LISTA_CURSOS_GRADUACAO_UNIG: CursoUnig[] = [
  {
    id: 'adm',
    nome: 'Administração',
    sigla: 'ADM',
    tipo: 'Graduação',
    nomeExibicao: 'Administração (ADM)',
    campus: 'Nova Iguaçu & Itaperuna',
    grau: 'Bacharelado',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12014',
    vagasAnuais: 120,
    corTag: 'text-amber-800',
    bgTag: 'bg-amber-50',
    borderTag: 'border-amber-200',
    descricao: 'Gestão estratégica, governança pública, empreendedorismo e sustentabilidade organizacional na Baixada Fluminense.',
    linhasPesquisaSugeridas: ['Governança Corporativa e Gestão Pública', 'Inovação e Empreendedorismo Regional', 'Sustentabilidade e Cadeias de Suprimentos'],
  },
  {
    id: 'biom',
    nome: 'Biomedicina',
    sigla: 'BIOM',
    tipo: 'Graduação',
    nomeExibicao: 'Biomedicina (BIOM)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12007',
    vagasAnuais: 80,
    corTag: 'text-teal-800',
    bgTag: 'bg-teal-50',
    borderTag: 'border-teal-200',
    descricao: 'Diagnóstico laboratorial, genética toxicológica, biologia molecular e vigilância sanitária aplicada.',
    linhasPesquisaSugeridas: ['Biomarcadores Moleculares em Doenças Endêmicas', 'Genética Toxicológica e Teratogênese', 'Diagnóstico Microbiológico e Resistência'],
  },
  {
    id: 'c_biol',
    nome: 'Ciências Biológicas',
    sigla: 'C_BIOL',
    tipo: 'Graduação',
    nomeExibicao: 'Ciências Biológicas (C_BIOL)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12019',
    vagasAnuais: 60,
    corTag: 'text-emerald-800',
    bgTag: 'bg-emerald-50',
    borderTag: 'border-emerald-200',
    descricao: 'Biodiversidade da Mata Atlântica, ecotoxicologia, vetores de arboviroses e educação ambiental.',
    linhasPesquisaSugeridas: ['Bioindicadores Ambientais e Ecotoxicologia', 'Entomologia Médica e Vetores de Dengue/Zika', 'Conservação de Ecossistemas Fluminenses'],
  },
  {
    id: 'dir',
    nome: 'Direito',
    sigla: 'DIR',
    tipo: 'Graduação',
    nomeExibicao: 'Direito (DIR)',
    campus: 'Nova Iguaçu & Itaperuna',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12012',
    vagasAnuais: 200,
    corTag: 'text-indigo-800',
    bgTag: 'bg-indigo-50',
    borderTag: 'border-indigo-200',
    descricao: 'Direitos humanos, garantismo penal, direito sanitário, mediação comunitária e bioética aplicada.',
    linhasPesquisaSugeridas: ['Direito à Saúde e Judicialização de Políticas Públicas', 'Criminologia Crítica e Segurança Cidadã', 'Vulnerabilidade Social e Garantias Constitucionais'],
  },
  {
    id: 'ed_fis',
    nome: 'Educação Física',
    sigla: 'ED FIS',
    tipo: 'Graduação',
    nomeExibicao: 'Educação Física (ED FIS)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Licenciatura',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12011',
    vagasAnuais: 90,
    corTag: 'text-orange-800',
    bgTag: 'bg-orange-50',
    borderTag: 'border-orange-200',
    descricao: 'Fisiologia do exercício, saúde preventiva em populações vulneráveis e pedagogia da atividade física.',
    linhasPesquisaSugeridas: ['Exercício Físico na Prevenção de DCNT', 'Atividade Física e Saúde Escolar', 'Biomecânica e Reabilitação Funcional'],
  },
  {
    id: 'enf',
    nome: 'Enfermagem',
    sigla: 'ENF',
    tipo: 'Graduação',
    nomeExibicao: 'Enfermagem (ENF)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12004',
    vagasAnuais: 110,
    corTag: 'text-sky-800',
    bgTag: 'bg-sky-50',
    borderTag: 'border-sky-200',
    descricao: 'Cuidados críticos, estratégia de saúde da família, biossegurança hospitalar e saúde da mulher.',
    linhasPesquisaSugeridas: ['Segurança do Paciente e Controle de Infecção', 'Atenção Primária à Saúde e Enfermagem Comunitária', 'Cuidado Integral à Saúde da Mulher e da Criança'],
  },
  {
    id: 'eng_civ',
    nome: 'Engenharia Civil',
    sigla: 'ENG CIV',
    tipo: 'Graduação',
    nomeExibicao: 'Engenharia Civil (ENG CIV)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12016',
    vagasAnuais: 100,
    corTag: 'text-blue-800',
    bgTag: 'bg-blue-50',
    borderTag: 'border-blue-200',
    descricao: 'Estruturas resilientes, novos materiais sustentáveis, saneamento básico e gestão de riscos geotécnicos.',
    linhasPesquisaSugeridas: ['Materiais Construtivos Sustentáveis e Reciclagem', 'Drenagem Urbana e Controle de Enchentes', 'Inspeção Predial e Patologia das Estruturas'],
  },
  {
    id: 'eng_mec',
    nome: 'Engenharia Mecânica',
    sigla: 'ENG MEC',
    tipo: 'Graduação',
    nomeExibicao: 'Engenharia Mecânica (ENG MEC)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12020',
    vagasAnuais: 70,
    corTag: 'text-slate-800',
    bgTag: 'bg-slate-100',
    borderTag: 'border-slate-300',
    descricao: 'Termociências, automação mecatrônica, manufatura aditiva e eficiência energética industrial.',
    linhasPesquisaSugeridas: ['Eficiência Térmica e Energias Renováveis', 'Automação Industrial e Robótica Aplicada', 'Integridade Estrutural e Fadiga de Materiais'],
  },
  {
    id: 'eng_prod',
    nome: 'Engenharia de Produção',
    sigla: 'ENG_PROD',
    tipo: 'Graduação',
    nomeExibicao: 'Engenharia de Produção (ENG_PROD)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12021',
    vagasAnuais: 80,
    corTag: 'text-cyan-800',
    bgTag: 'bg-cyan-50',
    borderTag: 'border-cyan-200',
    descricao: 'Otimização de processos produtivos, engenharia de qualidade, ergonomia industrial e logística hospitalar.',
    linhasPesquisaSugeridas: ['Engenharia de Operações Hospitalares', 'Gestão da Qualidade e Lean Manufacturing', 'Ergonomia e Segurança do Trabalho'],
  },
  {
    id: 'est_c',
    nome: 'Estética e Cosmética',
    sigla: 'EST_C',
    tipo: 'Graduação',
    nomeExibicao: 'Estética e Cosmética (EST_C)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Tecnólogo',
    duracaoSemestres: 6,
    codigoMec: 'MEC-12022',
    vagasAnuais: 60,
    corTag: 'text-pink-800',
    bgTag: 'bg-pink-50',
    borderTag: 'border-pink-200',
    descricao: 'Cosmetologia científica, protocolos de regeneração tecidual, recursos eletroterápicos e biossegurança estética.',
    linhasPesquisaSugeridas: ['Fitocosméticos e Ativos Naturais Brasileiros', 'Eletroterapia Avançada e Reparação Cutânea', 'Biossegurança em Procedimentos Estéticos'],
  },
  {
    id: 'farm',
    nome: 'Farmácia',
    sigla: 'FARM',
    tipo: 'Graduação',
    nomeExibicao: 'Farmácia (FARM)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12005',
    vagasAnuais: 90,
    corTag: 'text-emerald-800',
    bgTag: 'bg-emerald-50',
    borderTag: 'border-emerald-200',
    descricao: 'Farmacotécnica, toxicologia analítica, fitoterapia regional e assistência farmacêutica clínica.',
    linhasPesquisaSugeridas: ['Nanotecnologia Farmacêutica e Sistemas de Entrega', 'Fitoquímica e Bioprospecção de Plantas Medicinais', 'Farmacovigilância e Farmácia Clínica'],
  },
  {
    id: 'fis',
    nome: 'Fisioterapia',
    sigla: 'FIS',
    tipo: 'Graduação',
    nomeExibicao: 'Fisioterapia (FIS)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12006',
    vagasAnuais: 85,
    corTag: 'text-lime-800',
    bgTag: 'bg-lime-50',
    borderTag: 'border-lime-200',
    descricao: 'Fisioterapia neurofuncional, reabilitação cardiopulmonar, saúde do trabalhador e tecnologias assistivas.',
    linhasPesquisaSugeridas: ['Reabilitação Cardiorrespiratória Pós-Infecção', 'Biomecânica da Marcha e Prevenção de Quedas', 'Tecnologias Assistivas e Realidade Virtual na Fisioterapia'],
  },
  {
    id: 'g_rec_h',
    nome: 'Gestão de Recursos Humanos',
    sigla: 'G REC H',
    tipo: 'Graduação',
    nomeExibicao: 'Gestão de Recursos Humanos (G REC H)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Tecnólogo',
    duracaoSemestres: 4,
    codigoMec: 'MEC-12023',
    vagasAnuais: 70,
    corTag: 'text-violet-800',
    bgTag: 'bg-violet-50',
    borderTag: 'border-violet-200',
    descricao: 'Psicologia organizacional, clima corporativo, mediação de conflitos laborais e saúde mental no trabalho.',
    linhasPesquisaSugeridas: ['Saúde Mental e Prevenção de Burnout Laboral', 'Diversidade, Equidade e Inclusão nas Organizações', 'Transformação Digital na Gestão de Pessoas'],
  },
  {
    id: 'log',
    nome: 'Logística',
    sigla: 'LOG',
    tipo: 'Graduação',
    nomeExibicao: 'Logística (LOG)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Tecnólogo',
    duracaoSemestres: 4,
    codigoMec: 'MEC-12024',
    vagasAnuais: 70,
    corTag: 'text-zinc-800',
    bgTag: 'bg-zinc-100',
    borderTag: 'border-zinc-300',
    descricao: 'Cadeias de suprimento na Baixada, transporte multimodal, logística reversa e suprimentos hospitalares.',
    linhasPesquisaSugeridas: ['Logística de Emergência e Resposta a Desastres', 'Logística Reversa de Resíduos Químicos e de Saúde', 'Otimização de Frotas e Distribuição Urbana'],
  },
  {
    id: 'med',
    nome: 'Medicina',
    sigla: 'MED',
    tipo: 'Graduação',
    nomeExibicao: 'Medicina (MED)',
    campus: 'Nova Iguaçu & Itaperuna',
    grau: 'Bacharelado',
    duracaoSemestres: 12,
    codigoMec: 'MEC-12001',
    vagasAnuais: 300,
    corTag: 'text-rose-800',
    bgTag: 'bg-rose-50',
    borderTag: 'border-rose-200',
    descricao: 'Formação médica de excelência, com ênfase em clínica cirúrgica, saúde coletiva, cardiologia, patologia e emergência médica.',
    linhasPesquisaSugeridas: ['Epidemiologia das Doenças Infecciosas e Tropicais', 'Saúde Pública, Atenção Primária e Doenças Crônicas', 'Inovações em Diagnóstico Clínico e Terapêutica'],
  },
  {
    id: 'med_vet',
    nome: 'Medicina Veterinária',
    sigla: 'MED VET',
    tipo: 'Graduação',
    nomeExibicao: 'Medicina Veterinária (MED VET)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12010',
    vagasAnuais: 80,
    corTag: 'text-emerald-900',
    bgTag: 'bg-emerald-100',
    borderTag: 'border-emerald-300',
    descricao: 'Saúde única (One Health), zoonoses emergentes, clínica de pequenos e grandes animais e inspeção sanitária.',
    linhasPesquisaSugeridas: ['Zoonoses Tropicais e Vigilância Epidemiológica Integrada', 'Sanidade Animal e Bem-Estar em Populações Urbanas', 'Biotecnologia da Reprodução e Clínica Veterinária'],
  },
  {
    id: 'nut',
    nome: 'Nutrição',
    sigla: 'NUT',
    tipo: 'Graduação',
    nomeExibicao: 'Nutrição (NUT)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12009',
    vagasAnuais: 80,
    corTag: 'text-yellow-800',
    bgTag: 'bg-yellow-50',
    borderTag: 'border-yellow-200',
    descricao: 'Segurança alimentar e nutricional, dietoterapia em patologias crônicas, bioquímica dos alimentos e nutrição pública.',
    linhasPesquisaSugeridas: ['Segurança Alimentar e Nutricional em Comunidades Vulneráveis', 'Nutrição Clínica e Doenças Crônicas Não Transmissíveis', 'Alimentos Funcionais e Compostos Bioativos'],
  },
  {
    id: 'odont',
    nome: 'Odontologia',
    sigla: 'ODONT',
    tipo: 'Graduação',
    nomeExibicao: 'Odontologia (ODONT)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 10,
    codigoMec: 'MEC-12003',
    vagasAnuais: 120,
    corTag: 'text-blue-900',
    bgTag: 'bg-blue-100',
    borderTag: 'border-blue-300',
    descricao: 'Endodontia, implantodontia, diagnóstico bucomaxilofacial, estomatologia e odontologia preventiva comunitária.',
    linhasPesquisaSugeridas: ['Biomateriais Odontológicos e Regeneração Tecidual', 'Epidemiologia da Cárie e Doenças Periodontais', 'Diagnóstico Precoce de Lesões Potencialmente Malignas'],
  },
  {
    id: 'ped',
    nome: 'Pedagogia',
    sigla: 'PED',
    tipo: 'Graduação',
    nomeExibicao: 'Pedagogia (PED)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Licenciatura',
    duracaoSemestres: 8,
    codigoMec: 'MEC-12017',
    vagasAnuais: 90,
    corTag: 'text-purple-800',
    bgTag: 'bg-purple-50',
    borderTag: 'border-purple-200',
    descricao: 'Educação inclusiva, alfabetização, formação docente, políticas públicas educacionais e tecnologias na aprendizagem.',
    linhasPesquisaSugeridas: ['Educação Inclusiva e Práticas Pedagógicas na Escola Pública', 'Políticas Educacionais e Desigualdades Regionais', 'Tecnologias Digitais na Alfabetização e Letramento'],
  },
];

// 4 Programas de Pós-Graduação Stricto Sensu (Mestrado) Oficiais
export const LISTA_MESTRADOS_UNIG: CursoUnig[] = [
  {
    id: 'mest_vigil',
    nome: 'Mestrado em Vigilância em Saúde',
    sigla: 'MEST_VIGIL',
    tipo: 'Mestrado',
    nomeExibicao: 'Mestrado em Vigilância em Saúde (MEST_VIGIL)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Stricto Sensu (Mestrado)',
    duracaoSemestres: 4,
    codigoMec: 'CAPES-VIGIL-001',
    vagasAnuais: 30,
    corTag: 'text-red-900',
    bgTag: 'bg-red-50',
    borderTag: 'border-red-300',
    descricao: 'Programa de Pós-Graduação Stricto Sensu voltado a estudos epidemiológicos, vigilância ambiental, sanitária, controle de vetores e saúde do trabalhador.',
    linhasPesquisaSugeridas: [
      'Epidemiologia e Vigilância em Saúde Coletiva',
      'Vigilância Ambiental, Toxicologia e Saúde do Trabalhador',
      'Políticas e Modelos de Gestão em Vigilância em Saúde',
    ],
  },
  {
    id: 'mest_vuln',
    nome: 'Mestrado em Vulnerabilidade Social',
    sigla: 'MEST_VULN',
    tipo: 'Mestrado',
    nomeExibicao: 'Mestrado em Vulnerabilidade Social (MEST_VULN)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Stricto Sensu (Mestrado)',
    duracaoSemestres: 4,
    codigoMec: 'CAPES-VULN-002',
    vagasAnuais: 25,
    corTag: 'text-amber-900',
    bgTag: 'bg-amber-100',
    borderTag: 'border-amber-300',
    descricao: 'Programa Stricto Sensu interdisciplinar investigando dinâmicas de desigualdade, direitos humanos, políticas de assistência e territórios vulnerabilizados.',
    linhasPesquisaSugeridas: [
      'Políticas Públicas, Cidadania e Direitos Humanos',
      'Desigualdades Territoriais e Populações Vulnerabilizadas',
      'Intersetorialidade e Redes de Proteção Social',
    ],
  },
  {
    id: 'mest_educ',
    nome: 'Mestrado em Educação',
    sigla: 'MEST_EDUC',
    tipo: 'Mestrado',
    nomeExibicao: 'Mestrado em Educação (MEST_EDUC)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Stricto Sensu (Mestrado)',
    duracaoSemestres: 4,
    codigoMec: 'CAPES-EDUC-003',
    vagasAnuais: 30,
    corTag: 'text-purple-900',
    bgTag: 'bg-purple-100',
    borderTag: 'border-purple-300',
    descricao: 'Programa Stricto Sensu dedicado à investigação de processos formativos, saberes docentes, currículo, tecnologias e gestão educacional.',
    linhasPesquisaSugeridas: [
      'Políticas Educacionais, Gestão e Trabalho Docente',
      'Práticas Pedagógicas, Currículo e Inclusão Escolar',
      'Educação, Cultura e Processos Formativos Interdisciplinares',
    ],
  },
  {
    id: 'mest_odont',
    nome: 'Mestrado em Odontologia',
    sigla: 'MEST_ODONT',
    tipo: 'Mestrado',
    nomeExibicao: 'Mestrado em Odontologia (MEST_ODONT)',
    campus: 'Campus Nova Iguaçu',
    grau: 'Stricto Sensu (Mestrado)',
    duracaoSemestres: 4,
    codigoMec: 'CAPES-ODONT-004',
    vagasAnuais: 25,
    corTag: 'text-indigo-900',
    bgTag: 'bg-indigo-100',
    borderTag: 'border-indigo-300',
    descricao: 'Programa Stricto Sensu de excelência em pesquisas biomateriais, clínica odontológica avançada, patologia bucal e regeneração tecidual.',
    linhasPesquisaSugeridas: [
      'Biomateriais e Técnicas Clínicas em Odontologia',
      'Patologia e Diagnóstico das Afecções do Complexo Bucomaxilofacial',
      'Odontologia Baseada em Evidências e Saúde Bucal Coletiva',
    ],
  },
];

// Relação Consolidada Oficial (19 Graduações + 4 Mestrados = 23 Programas)
export const LISTA_OFICIAL_CURSOS_UNIG: CursoUnig[] = [
  ...LISTA_CURSOS_GRADUACAO_UNIG,
  ...LISTA_MESTRADOS_UNIG,
];

/**
 * Normaliza o nome do curso de graduação ou mestrado para associação exata
 */
export function normalizarNomeCurso(cursoStr: string | null | undefined): string {
  if (!cursoStr || typeof cursoStr !== 'string') return 'Administração';
  const c = cursoStr.toLowerCase().trim();

  // Mestrados
  if (c.includes('mest') || c.includes('mestrado')) {
    if (c.includes('vigil')) return 'Mestrado em Vigilância em Saúde';
    if (c.includes('vuln')) return 'Mestrado em Vulnerabilidade Social';
    if (c.includes('educ')) return 'Mestrado em Educação';
    if (c.includes('odont')) return 'Mestrado em Odontologia';
  }

  // Siglas diretas
  if (c === 'adm') return 'Administração';
  if (c === 'biom') return 'Biomedicina';
  if (c === 'c_biol' || c === 'c biol') return 'Ciências Biológicas';
  if (c === 'dir') return 'Direito';
  if (c === 'ed fis' || c === 'ed_fis') return 'Educação Física';
  if (c === 'enf') return 'Enfermagem';
  if (c === 'eng civ' || c === 'eng_civ') return 'Engenharia Civil';
  if (c === 'eng mec' || c === 'eng_mec') return 'Engenharia Mecânica';
  if (c === 'eng prod' || c === 'eng_prod') return 'Engenharia de Produção';
  if (c === 'est_c' || c === 'est c') return 'Estética e Cosmética';
  if (c === 'farm') return 'Farmácia';
  if (c === 'fis') return 'Fisioterapia';
  if (c === 'g rec h' || c === 'g_rec_h') return 'Gestão de Recursos Humanos';
  if (c === 'log') return 'Logística';
  if (c === 'med') return 'Medicina';
  if (c === 'med vet' || c === 'med_vet') return 'Medicina Veterinária';
  if (c === 'nut') return 'Nutrição';
  if (c === 'odont') return 'Odontologia';
  if (c === 'ped') return 'Pedagogia';

  // Nomes por aproximação
  if (c.includes('administra')) return 'Administração';
  if (c.includes('biomed')) return 'Biomedicina';
  if (c.includes('biol')) return 'Ciências Biológicas';
  if (c.includes('direito')) return 'Direito';
  if (c.includes('educação física') || c.includes('educacao fisica')) return 'Educação Física';
  if (c.includes('enferm')) return 'Enfermagem';
  if (c.includes('mecanica') || c.includes('mecânica')) return 'Engenharia Mecânica';
  if (c.includes('produção') || c.includes('producao')) return 'Engenharia de Produção';
  if (c.includes('civil')) return 'Engenharia Civil';
  if (c.includes('estética') || c.includes('estetica') || c.includes('cosmética') || c.includes('cosmetica')) return 'Estética e Cosmética';
  if (c.includes('farm')) return 'Farmácia';
  if (c.includes('fisio')) return 'Fisioterapia';
  if (c.includes('recursos humanos') || c.includes('rh')) return 'Gestão de Recursos Humanos';
  if (c.includes('logíst') || c.includes('logist')) return 'Logística';
  if (c.includes('veterin')) return 'Medicina Veterinária';
  if (c.includes('medicina')) return 'Medicina';
  if (c.includes('nutri')) return 'Nutrição';
  if (c.includes('odonto')) return 'Odontologia';
  if (c.includes('pedagog')) return 'Pedagogia';

  // Fallback
  return cursoStr;
}

/**
 * Retorna metadados de cor, campus e sigla para um curso ou mestrado
 */
export function getCursoMeta(cursoStr: string | null | undefined): CursoUnig {
  const safeCurso = cursoStr && typeof cursoStr === 'string' ? cursoStr : 'Administração';
  const norm = normalizarNomeCurso(safeCurso);
  const found = LISTA_OFICIAL_CURSOS_UNIG.find(
    (c) =>
      c.nome.toLowerCase() === norm.toLowerCase() ||
      c.id === norm.toLowerCase() ||
      c.sigla.toLowerCase() === norm.toLowerCase() ||
      c.nome.toLowerCase() === safeCurso.toLowerCase()
  );

  if (found) return found;

  return {
    id: 'generico',
    nome: safeCurso,
    sigla: safeCurso.substring(0, 4).toUpperCase(),
    tipo: 'Graduação',
    nomeExibicao: `${safeCurso} (UNIG)`,
    campus: 'Campus Nova Iguaçu',
    grau: 'Bacharelado',
    duracaoSemestres: 8,
    codigoMec: 'MEC-UNIG',
    vagasAnuais: 50,
    corTag: 'text-slate-800',
    bgTag: 'bg-slate-100',
    borderTag: 'border-slate-300',
    descricao: 'Curso oficial da Universidade Iguaçu (UNIG).',
    linhasPesquisaSugeridas: ['Pesquisa Científica e Inovação Tecnológica'],
  };
}
