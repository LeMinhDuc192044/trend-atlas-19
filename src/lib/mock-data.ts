export type Domain =
  | "Computer Science"
  | "Biotechnology"
  | "Physics"
  | "Materials Science"
  | "Medicine"
  | "Mathematics"
  | "Chemistry";

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  year: number;
  doi: string;
  journalId: string;
  journalName: string;
  authors: string[];
  keywords: string[];
  domain: Domain;
  citations: number;
  fullText: boolean;
  url: string;
}

export interface Journal {
  id: string;
  name: string;
  publisher: string;
  domain: Domain;
  papersCount: number;
  impactFactor: number;
  followed: boolean;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  domain: Domain;
  papersCount: number;
  growth: number;
  followed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const journals: Journal[] = [
  { id: "j1", name: "Nature Intelligence", publisher: "Nature Publishing", domain: "Computer Science", papersCount: 1240, impactFactor: 25.8, followed: true },
  { id: "j2", name: "The Lancet Digital Health", publisher: "Elsevier", domain: "Medicine", papersCount: 812, impactFactor: 23.4, followed: true },
  { id: "j3", name: "Cell Reports", publisher: "Cell Press", domain: "Biotechnology", papersCount: 2103, impactFactor: 8.8, followed: false },
  { id: "j4", name: "Physical Review X", publisher: "APS", domain: "Physics", papersCount: 640, impactFactor: 15.7, followed: false },
  { id: "j5", name: "Journal of the ACS", publisher: "ACS", domain: "Chemistry", papersCount: 1875, impactFactor: 16.4, followed: false },
  { id: "j6", name: "Advanced Materials", publisher: "Wiley", domain: "Materials Science", papersCount: 992, impactFactor: 32.1, followed: true },
];

export const topics: Topic[] = [
  { id: "t1", name: "Large Language Models", description: "Foundation models, scaling laws, RLHF and alignment.", domain: "Computer Science", papersCount: 12480, growth: 450, followed: true },
  { id: "t2", name: "Quantum Supremacy", description: "Quantum advantage benchmarks and error correction.", domain: "Physics", papersCount: 3120, growth: 120, followed: false },
  { id: "t3", name: "Green Hydrogen Storage", description: "Catalysts, membranes and cryo storage systems.", domain: "Chemistry", papersCount: 2050, growth: 88, followed: false },
  { id: "t4", name: "CRISPR Gene Editing", description: "Cas9/Cas12 in agriculture and therapeutics.", domain: "Biotechnology", papersCount: 6720, growth: 42, followed: true },
  { id: "t5", name: "Neuro-Symbolic AI", description: "Hybrid reasoning combining symbolic logic and neural nets.", domain: "Computer Science", papersCount: 890, growth: 210, followed: false },
  { id: "t6", name: "Topological Insulators", description: "Moiré superlattices and edge-state transport.", domain: "Physics", papersCount: 1440, growth: 34, followed: false },
];

export const papers: Paper[] = [
  {
    id: "p1",
    title: "Scaling Laws for Neural Language Models: A Comparative Meta-Analysis",
    abstract: "We present an empirical study of scaling laws for language model performance, focusing on the cross-entropy loss against compute, parameters, and dataset size. We derive updated coefficients and show cross-architecture consistency.",
    year: 2024, doi: "10.1145/3442381", journalId: "j1", journalName: "Nature Intelligence",
    authors: ["Kaplan, J.", "Sora, L.", "Valcourt, J."],
    keywords: ["language models", "scaling", "meta-analysis"],
    domain: "Computer Science", citations: 1402, fullText: true,
    url: "https://doi.org/10.1145/3442381",
  },
  {
    id: "p2",
    title: "CRISPR-Cas9 Gene Editing in High-Salinity Agricultural Environments",
    abstract: "Exploring the efficacy of CRISPR-based modifications in Oryza sativa variants subjected to extreme osmotic stress in coastal breeding programs.",
    year: 2023, doi: "10.1038/s41586-023-0421", journalId: "j3", journalName: "Cell Reports",
    authors: ["Chen, L.", "Wei, Z."],
    keywords: ["CRISPR", "agriculture", "salinity"],
    domain: "Biotechnology", citations: 856, fullText: true,
    url: "https://doi.org/10.1038/s41586-023-0421",
  },
  {
    id: "p3",
    title: "Topological Quantum Matter in Moiré Superlattices of Transition Metal Dichalcogenides",
    abstract: "We report evidence of topological ordering in twisted TMD bilayers, with edge conductance signatures persisting up to 20K.",
    year: 2024, doi: "10.1103/PhysRevX.14.021005", journalId: "j4", journalName: "Physical Review X",
    authors: ["Zhang, Y.", "Miller, J."],
    keywords: ["topology", "moiré", "TMD"],
    domain: "Physics", citations: 214, fullText: false,
    url: "https://doi.org/10.1103/PhysRevX.14.021005",
  },
  {
    id: "p4",
    title: "Multi-Functional Nanocrystals for Targeted Drug Delivery in Oncology",
    abstract: "Design and synthesis of surface-functionalized nanocrystals capable of tumor-targeted payload release under mild hyperthermia.",
    year: 2023, doi: "10.1021/jacs.3c10452", journalId: "j5", journalName: "Journal of the ACS",
    authors: ["Iqbal, S.", "Ferrero, M.", "Wu, D."],
    keywords: ["nanocrystals", "drug delivery", "oncology"],
    domain: "Chemistry", citations: 411, fullText: true,
    url: "https://doi.org/10.1021/jacs.3c10452",
  },
  {
    id: "p5",
    title: "Latent Bias Detection in Cross-Lingual Large Language Models",
    abstract: "We propose a benchmark and probing method for detecting demographic bias in multilingual LLMs across 14 languages.",
    year: 2024, doi: "10.48550/arXiv.2401.09823", journalId: "j1", journalName: "Nature Intelligence",
    authors: ["O'Connor, T.", "Lee, K."],
    keywords: ["language models", "bias", "multilingual"],
    domain: "Computer Science", citations: 62, fullText: true,
    url: "https://doi.org/10.48550/arXiv.2401.09823",
  },
  {
    id: "p6",
    title: "Perovskite Photovoltaics with Sub-Cell Tandem Efficiency Above 33%",
    abstract: "Record efficiency reached via passivated interfaces and mixed-halide engineering, validated by third-party lab.",
    year: 2024, doi: "10.1002/adma.202400123", journalId: "j6", journalName: "Advanced Materials",
    authors: ["Kim, H.", "Ahmed, R."],
    keywords: ["perovskite", "solar", "materials"],
    domain: "Materials Science", citations: 305, fullText: true,
    url: "https://doi.org/10.1002/adma.202400123",
  },
  {
    id: "p7",
    title: "Digital Phenotyping for Early Detection of Depressive Episodes",
    abstract: "A prospective study using passive smartphone signals to predict depressive relapse in 1,842 participants.",
    year: 2024, doi: "10.1016/S2589-7500(24)00042-1", journalId: "j2", journalName: "The Lancet Digital Health",
    authors: ["Patel, V.", "Nordstrom, A."],
    keywords: ["mental health", "digital phenotyping"],
    domain: "Medicine", citations: 128, fullText: false,
    url: "https://doi.org/10.1016/S2589-7500(24)00042-1",
  },
  {
    id: "p8",
    title: "Neuro-Symbolic Architectures for Zero-Shot Generalization",
    abstract: "A framework combining differentiable logic with transformers, achieving state-of-the-art on compositional benchmarks.",
    year: 2024, doi: "10.1038/s41586-024-0012", journalId: "j1", journalName: "Nature Intelligence",
    authors: ["Chen, A.", "Rossi, F."],
    keywords: ["neuro-symbolic", "generalization"],
    domain: "Computer Science", citations: 187, fullText: true,
    url: "https://doi.org/10.1038/s41586-024-0012",
  },
];

// Publication volume by month (last 12 months)
export const publicationTrend = [
  { month: "Jan", cs: 320, bio: 210, phys: 140, mat: 180 },
  { month: "Feb", cs: 340, bio: 220, phys: 150, mat: 190 },
  { month: "Mar", cs: 380, bio: 240, phys: 160, mat: 200 },
  { month: "Apr", cs: 410, bio: 260, phys: 170, mat: 210 },
  { month: "May", cs: 470, bio: 280, phys: 170, mat: 220 },
  { month: "Jun", cs: 540, bio: 300, phys: 180, mat: 240 },
  { month: "Jul", cs: 610, bio: 310, phys: 190, mat: 260 },
  { month: "Aug", cs: 680, bio: 330, phys: 200, mat: 270 },
  { month: "Sep", cs: 760, bio: 340, phys: 210, mat: 290 },
  { month: "Oct", cs: 840, bio: 360, phys: 220, mat: 310 },
  { month: "Nov", cs: 910, bio: 380, phys: 230, mat: 330 },
  { month: "Dec", cs: 980, bio: 400, phys: 240, mat: 340 },
];

export const topicTrend = (base = 40) =>
  Array.from({ length: 12 }, (_, i) => ({
    month: publicationTrend[i].month,
    value: Math.round(base + i * (base * 0.18) + Math.sin(i) * base * 0.15),
  }));

export const notifications: NotificationItem[] = [
  { id: "n1", title: "New paper in Large Language Models", body: "\"Latent Bias Detection...\" published in Nature Intelligence.", time: "2h ago", read: false },
  { id: "n2", title: "Weekly digest ready", body: "12 new papers across your followed topics this week.", time: "1d ago", read: false },
  { id: "n3", title: "Journal update: Advanced Materials", body: "New issue published — 8 papers added.", time: "3d ago", read: true },
];

export const bookmarks = ["p1", "p3", "p8"];
