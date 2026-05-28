// Vercel serverless function — server-side proxy to Anthropic API
// Set ANTHROPIC_API_KEY in your Vercel project environment variables

const SCHEME = {
  // ── JSS ──────────────────────────────────────────────────────────────────
  "JSS 1": {
    mathematics: [
      "Whole numbers: reading and writing large numbers, place value",
      "Basic operations: addition, subtraction, multiplication, division of whole numbers",
      "LCM and HCF",
      "Fractions: types, conversion, addition, subtraction, multiplication, division",
      "Decimals: place value, operations, conversion to fractions",
      "Percentages: conversion, percentage of quantities, percentage increase/decrease",
      "Approximation: rounding to decimal places and significant figures",
      "Number bases: binary, octal; conversion between bases",
      "Introduction to algebra: algebraic expressions, collecting like terms",
      "Simple equations: solving one-step and two-step equations",
      "Geometry: lines, angles, triangles, types of triangles",
      "Measurement: length, mass, capacity, time, area of rectangles and triangles",
    ],
    english: [
      "Parts of speech: nouns, pronouns, verbs, adjectives, adverbs",
      "Tenses: simple present, simple past, simple future",
      "Sentence types: simple, compound",
      "Comprehension: reading for main idea, inference",
      "Vocabulary: synonyms, antonyms, word families",
      "Composition: narrative writing, letter writing",
      "Punctuation: capital letters, full stop, comma, question mark",
      "Direct and indirect speech",
      "Articles: definite and indefinite",
      "Spelling and phonics",
    ],
    NVE: [
      "Social Studies: the family — types, functions, values",
      "The school — types, functions, school rules",
      "The community — features, types, community development",
      "Civic Education: citizenship — meaning, duties and rights",
      "Constituted authority — meaning, types, importance of obeying",
      "Security Education: personal safety, road safety rules",
      "Drug abuse: meaning, causes, effects, prevention",
      "Human trafficking: meaning, causes, effects",
    ],
    BST: [
      "Basic Science: living and non-living things; characteristics of living things",
      "Cells: structure of plant and animal cells",
      "Nutrition: classes of food, balanced diet",
      "Basic Technology: meaning, importance; tools and their uses",
      "Drawing instruments and their uses",
      "PHE: benefits of physical exercise; first aid",
      "ICT: meaning and importance of ICT; components of a computer",
      "Input and output devices",
      "Basic operations on a computer",
    ],
    PVS: [
      "Agricultural Science: meaning and importance of agriculture",
      "Branches of agriculture",
      "Farm tools and equipment",
      "Land preparation: clearing, tilling",
      "Home Economics: the home — rooms and their uses",
      "Kitchen safety and hygiene",
      "Food groups and nutrition",
      "Clothing and textile: types of fabric",
    ],
    CCA: [
      "Cultural heritage: meaning, types",
      "Nigerian cultural festivals",
      "Music: elements of music — rhythm, melody, pitch",
      "Musical instruments — classification",
      "Creative Art: drawing — lines, shapes, composition",
      "Colour: primary, secondary, tertiary colours",
      "Drama and performances in Nigerian culture",
    ],
    CRS: [
      "Creation: the creation account (Genesis 1-2)",
      "The fall of man (Genesis 3)",
      "Cain and Abel",
      "Noah and the flood",
      "Abraham: call and faith",
      "Joseph and his brothers",
      "The Ten Commandments (Exodus 20)",
      "The life and birth of Jesus",
    ],
  },

  "JSS 2": {
    mathematics: [
      "Integers: addition, subtraction, multiplication, division of directed numbers",
      "Standard form (scientific notation)",
      "Ratio and proportion: direct and inverse proportion",
      "Simple interest",
      "Profit and loss, percentage profit and loss",
      "Algebraic expressions: expansion, factorization of simple expressions",
      "Linear equations and word problems",
      "Simultaneous equations (substitution and elimination)",
      "Graphs: plotting points, linear graphs",
      "Geometry: properties of quadrilaterals, polygons",
      "Angles: types, angles on a straight line, vertically opposite angles",
      "Perimeter and area: rectangles, triangles, circles",
    ],
    english: [
      "Parts of speech: conjunctions, prepositions, interjections",
      "Tenses: present continuous, past continuous, present perfect",
      "Conditional sentences: type 1 and type 2",
      "Reported speech: commands and requests",
      "Comprehension: inferential and evaluative questions",
      "Composition: descriptive writing, argumentative writing",
      "Figurative language: simile, metaphor, personification",
      "Comprehension passages and summary writing",
      "Vocabulary: homophones, homonyms",
      "Formal and informal letter writing",
    ],
    NVE: [
      "Social Studies: inter-group relations in Nigeria",
      "Culture and social values",
      "Population: meaning, factors, effects of population growth",
      "Migration: types and causes",
      "Civic Education: fundamental human rights",
      "Rule of law and democracy",
      "Security Education: cybercrime — meaning, types, prevention",
      "Cultism: meaning, dangers, prevention",
      "Traffic regulations",
    ],
    BST: [
      "Basic Science: reproduction in plants and animals",
      "Simple machines: types, mechanical advantage",
      "Matter: states, changes of state",
      "Energy: forms, transformation",
      "Basic Technology: forces — types and effects",
      "Simple structures and their properties",
      "ICT: word processing; formatting documents",
      "Spreadsheet basics",
      "Internet: browsing and email",
      "PHE: team sports rules; safety in sports",
    ],
    PVS: [
      "Agricultural Science: crop production — planting, spacing, nursery",
      "Fertilizers: types, uses, application",
      "Pest and disease management",
      "Animal husbandry: livestock farming basics",
      "Home Economics: meal planning and preparation",
      "Table setting and serving",
      "Laundry: washing, ironing",
      "Budgeting and consumer education",
    ],
    CCA: [
      "Nigerian art forms: painting, sculpture, weaving",
      "Traditional dances of Nigeria",
      "Music notation: staff, clef, notes",
      "Vocal music: songs and singing technique",
      "Drama: elements of drama, playwriting basics",
      "Design and colour theory",
      "Craft work: clay modeling, weaving",
    ],
    CRS: [
      "Moses: the birth and call of Moses",
      "The Exodus and the Passover",
      "Joshua and the conquest of Canaan",
      "Judges: Gideon, Samson",
      "Samuel: call and ministry",
      "King Saul: rise and fall",
      "King David: life and achievements",
      "The ministry of Jesus: miracles and teachings",
    ],
  },

  "JSS 3": {
    mathematics: [
      "Fractions and decimals: further operations",
      "Number patterns: sequences and series",
      "Algebraic fractions: simplification, operations",
      "Quadratic expressions: expansion, factorization",
      "Inequalities: linear inequalities, number line representation",
      "Coordinate geometry: distance, midpoint, gradient",
      "Statistics: data collection, frequency tables, mean, median, mode",
      "Probability: basic concepts, simple probability",
      "Circle: arc, sector, chord; circumference and area",
      "Pythagoras theorem and applications",
      "Trigonometry: ratios — sin, cos, tan in right-angled triangles",
      "Construction: bisection, angle construction",
    ],
    english: [
      "Tenses review: all tenses and usage",
      "Active and passive voice",
      "Phrasal verbs",
      "Comprehension: extended passages, critical reading",
      "Essay writing: expository, argumentative",
      "Speech work: stress and intonation",
      "Idioms and idiomatic expressions",
      "Oral English: vowel and consonant sounds",
      "Poetry: elements and analysis",
      "Literature: plot, character, theme (prose text)",
      "Formal report writing",
    ],
    NVE: [
      "Social Studies: government — meaning, forms of government",
      "Democratic institutions in Nigeria",
      "Citizenship: responsibilities of citizens",
      "National symbols and their significance",
      "Civic Education: electoral process — voting, INEC",
      "Corruption: causes, effects, EFCC, ICPC",
      "Security Education: kidnapping — causes, effects, prevention",
      "Cybersecurity basics",
      "Conflict resolution",
    ],
    BST: [
      "Basic Science: genetics and heredity basics",
      "Ecology: habitat, food chain, food web",
      "Environmental pollution: types, causes, effects",
      "Basic Technology: machines — gears, pulleys, levers",
      "Electrical circuits: components, simple circuit",
      "Materials: metals, non-metals, properties",
      "ICT: programming basics; algorithms",
      "Database concepts",
      "Presentation software",
      "PHE: fitness and health; first aid procedures",
    ],
    PVS: [
      "Agricultural Science: soil — types, properties, conservation",
      "Irrigation and drainage",
      "Storage of farm produce",
      "Fishery: types of fish, fish farming",
      "Home Economics: child care and development",
      "Family planning and health",
      "Consumer rights and protection",
      "Entrepreneurship: small-scale business",
    ],
    CCA: [
      "History of art in Nigeria",
      "West African art and architecture",
      "Music: traditional and contemporary Nigerian music",
      "Music appreciation and analysis",
      "Theatre arts: production planning",
      "Photography basics",
      "Digital art introduction",
    ],
    CRS: [
      "Solomon: wisdom and the temple",
      "Division of the kingdom",
      "Elijah and Elisha: miracles and ministry",
      "The major prophets: Isaiah, Jeremiah",
      "The exile and return",
      "The Sermon on the Mount",
      "Parables of Jesus",
      "The death and resurrection of Jesus",
      "Pentecost and the early church",
    ],
  },

  // ── SS ───────────────────────────────────────────────────────────────────
  "SS 1": {
    mathematics: [
      "Surds: simplification, rationalization",
      "Indices: laws of indices, equations involving indices",
      "Logarithms: laws, tables, calculations",
      "Sets: notation, types, Venn diagrams, operations",
      "Quadratic equations: factorization, completing the square, formula",
      "Polynomials: operations, remainder and factor theorems",
      "Inequalities: quadratic inequalities",
      "Functions: definition, types, composite, inverse",
      "Coordinate geometry: equation of a line, circle",
      "Trigonometry: general angles, trigonometric identities",
      "Statistics: frequency distribution, histograms, cumulative frequency",
      "Probability: tree diagrams, mutually exclusive events",
    ],
    english: [
      "Comprehension: reading unseen passages",
      "Summary writing: note-taking and précis",
      "Essay types: narrative, descriptive, expository, argumentative",
      "Lexis and structure: word classes, phrases, clauses",
      "Tenses and aspect",
      "Concord: subject-verb agreement",
      "Oral English: phonetics — vowels, consonants, consonant clusters",
      "Figures of speech: irony, hyperbole, euphemism",
      "Literature: drama — elements, structure, analysis",
      "Prose: characterization, setting, plot, theme",
      "Poetry: types, imagery, sound devices",
    ],
    ICT: [
      "Computer hardware: CPU, memory, storage devices",
      "Computer software: system and application software",
      "Operating systems: functions, types (Windows, Linux, Android)",
      "File management: organizing, naming, copying, moving files",
      "Word processing: advanced formatting, tables, mail merge",
      "Spreadsheet: formulas, functions, charts",
      "Database: creating tables, queries, forms",
      "Internet: search engines, email, social media safety",
      "Cybersecurity: threats, protection strategies",
      "Emerging technologies: AI, IoT basics",
    ],
    "civic education": [
      "Citizenship: types, rights and responsibilities",
      "Constitution: features of Nigerian constitution",
      "Arms of government: executive, legislature, judiciary",
      "Democracy: principles, merits and demerits",
      "Electoral process: political parties, voting, INEC",
      "Rule of law: meaning, principles, limitations",
      "Human rights: fundamental rights in Nigeria",
      "Traffic laws and road safety",
      "Drug law enforcement",
      "Anti-corruption agencies: EFCC, ICPC",
    ],
    biology: [
      "Cell biology: cell structure and functions, cell organelles",
      "Cell division: mitosis and meiosis",
      "Classification of living things: kingdoms",
      "Kingdom Monera, Protista, Fungi",
      "Kingdom Plantae: divisions",
      "Kingdom Animalia: phyla",
      "Nutrition in plants: photosynthesis",
      "Nutrition in animals: digestion, enzymes",
      "Transport in plants: osmosis, transpiration",
      "Transport in animals: heart structure, blood, blood vessels",
      "Respiration: aerobic and anaerobic",
      "Excretion in plants and animals",
    ],
    economics: [
      "Introduction: meaning, scope, basic economic problems",
      "Factors of production: land, labour, capital, entrepreneur",
      "Scale of preference and opportunity cost",
      "Demand: types, laws, determinants, demand curve",
      "Supply: types, laws, determinants, supply curve",
      "Market equilibrium: price determination",
      "Utility: types, total and marginal utility",
      "Production: stages, types",
      "Costs of production: fixed, variable, total, average, marginal",
      "Revenue: total, average, marginal revenue",
      "Market structures: perfect competition, monopoly",
      "Population: census, distribution, implications",
    ],
    physics: [
      "Measurements: SI units, measuring instruments",
      "Scalars and vectors: addition, resolution",
      "Motion: distance, displacement, speed, velocity, acceleration",
      "Newton's laws of motion",
      "Momentum and impulse",
      "Work, energy and power",
      "Machines: types, efficiency, mechanical advantage",
      "Elasticity: Hooke's law, elastic limit",
      "Pressure: in solids, liquids, gases; Pascal's principle",
      "Archimedes' principle and buoyancy",
      "Heat: temperature, thermometry, heat transfer",
      "Waves: types, properties, sound waves",
    ],
    literature: [
      "Introduction to literature: genres — prose, poetry, drama",
      "Prose: narrative techniques, point of view",
      "Character and characterization",
      "Setting and atmosphere",
      "Theme and subject matter",
      "Plot and conflict",
      "Drama: elements, stage directions",
      "Poetry: forms — lyric, narrative, dramatic",
      "Poetic devices: rhyme, rhythm, metre",
      "Imagery and symbolism",
      "Prescribed text analysis",
    ],
    account: [
      "Introduction to bookkeeping and accounting",
      "Source documents: invoice, receipt, credit note, debit note",
      "Books of original entry: cash book, sales day book, purchases day book",
      "Ledger accounts: posting entries",
      "Trial balance: preparation and errors",
      "Bank reconciliation statement",
      "Petty cash book: imprest system",
      "Capital and revenue expenditure",
      "Final accounts: trading account, profit and loss account",
      "Balance sheet: components",
    ],
    chemistry: [
      "Separation techniques: filtration, distillation, chromatography",
      "Atomic structure: proton, neutron, electron; atomic number, mass number",
      "Electronic configuration and periodicity",
      "Chemical bonding: ionic, covalent, metallic",
      "Formulae and equations: balancing chemical equations",
      "Acids, bases and salts: properties, neutralization, pH",
      "Oxidation and reduction (redox)",
      "Metals: properties, reactivity series, extraction",
      "Non-metals: carbon, oxygen, nitrogen, sulphur",
      "Organic chemistry: hydrocarbons, functional groups",
      "Chemical kinetics: factors affecting reaction rate",
      "Electrochemistry: electrolysis, electroplating",
    ],
    government: [
      "Government: meaning, functions, types",
      "Power, authority and legitimacy",
      "Constitution: types, features, supremacy",
      "Arms of government: structure and functions",
      "Legislature: bicameral system, law-making process",
      "Executive: powers and functions",
      "Judiciary: independence, hierarchy of courts",
      "Political parties: roles, Nigerian political parties",
      "Electoral system: types of election, INEC",
      "Pressure groups: types and functions",
      "Civil society and media",
      "Local government: structure and functions",
    ],
    "further mathematics": [
      "Surds and indices: advanced operations",
      "Binary operations",
      "Mapping and functions: bijection, inverse, composition",
      "Polynomials: roots, synthetic division",
      "Rational functions: partial fractions",
      "Sequences and series: AP, GP, sum to infinity",
      "Binomial theorem",
      "Matrices: types, operations, determinant, inverse",
      "Vectors: magnitude, direction, scalar and vector products",
      "Trigonometry: compound angles, double angle formulae",
      "Coordinate geometry: conic sections",
      "Calculus: differentiation — first principles, chain rule, product rule",
    ],
    CRS: [
      "The attributes of God",
      "Creation and the purpose of man",
      "The covenant with Abraham",
      "Moses and the law",
      "Kingship in Israel: Saul, David, Solomon",
      "The prophets and social justice",
      "The life and ministry of Jesus",
      "The Sermon on the Mount",
      "The death, resurrection and ascension of Jesus",
      "The Holy Spirit and the early church",
      "Paul's missionary journeys",
      "Christian stewardship",
    ],
    commerce: [
      "Commerce: meaning, scope, importance",
      "Trade: home and foreign trade",
      "Retail trade: types of retailers",
      "Wholesale trade: functions of wholesalers",
      "Channels of distribution",
      "Transportation: modes, importance",
      "Warehousing: types, functions",
      "Insurance: principles, types",
      "Banking: types of banks, banking services",
      "Advertising: types, media, importance",
      "Tourism: meaning, importance",
      "Business documents: order, invoice, receipt, statement",
    ],
  },

  "SS 2": {
    mathematics: [
      "Matrices and determinants: operations, inverse, solving systems",
      "Permutation and combination",
      "Probability: conditional probability, Bayes' theorem",
      "Differentiation: rules, applications (tangent, normal, rates of change)",
      "Integration: basic integration, definite integrals, area under curve",
      "Statistics: measures of dispersion, standard deviation, normal distribution",
      "Linear programming: formulation, graphical solution",
      "Modular arithmetic",
      "Number theory: primes, congruences",
      "Trigonometric equations and graphs",
      "Further coordinate geometry: parametric equations",
      "Exponential and logarithmic functions: graphs, equations",
    ],
    english: [
      "Advanced comprehension strategies",
      "Argumentative and persuasive writing",
      "Report writing: formal reports",
      "Oral presentation skills",
      "Advanced lexis: register, jargon, collocation",
      "Syntactic structures: complex and compound-complex sentences",
      "Literature: detailed text analysis (prose)",
      "Drama analysis: themes, dramatic devices",
      "Poetry: comparative analysis",
      "Creative writing: narrative voice, style",
      "Language and communication in context",
    ],
    ICT: [
      "Advanced spreadsheet: pivot tables, VLOOKUP, data validation",
      "Database management: SQL basics, relational databases",
      "Web design: HTML basics, CSS styling",
      "Networking: types, topologies, protocols, IP addressing",
      "Programming: flowcharts, pseudocode, Python basics",
      "Systems analysis and design",
      "Data communication: bandwidth, transmission media",
      "Cloud computing: concepts, services",
      "Multimedia: types, applications",
      "Computer security: authentication, encryption",
    ],
    "civic education": [
      "Democratic governance: deepening democracy",
      "Federalism: principles, merits, challenges in Nigeria",
      "Inter-governmental relations",
      "Public service: structure, functions",
      "National values: integrity, patriotism",
      "Conflict resolution: dialogue, mediation",
      "International organizations: UN, AU, ECOWAS",
      "Human trafficking: prevention, laws",
      "Civic responsibilities: tax, voting, environmental protection",
    ],
    biology: [
      "Genetics: Mendel's laws, monohybrid and dihybrid crosses",
      "DNA structure and protein synthesis",
      "Evolution: Darwin's theory, evidence",
      "Variation: types, causes",
      "Nervous system: structure, functions",
      "Endocrine system: hormones, functions",
      "Reproduction in humans: male and female reproductive systems",
      "Reproduction in plants: pollination, fertilization, seed dispersal",
      "Growth and development",
      "Population ecology: density, distribution",
      "Ecosystem: energy flow, nutrient cycles",
      "Environmental issues: deforestation, pollution, conservation",
    ],
    economics: [
      "Theory of the firm: revenue curves, profit maximization",
      "Oligopoly and monopolistic competition",
      "Labour market: wage determination",
      "Capital and interest",
      "Entrepreneur and profit",
      "National income: GDP, GNP, measurement",
      "Money and banking: functions of money, banking system",
      "Central bank: functions, monetary policy",
      "Fiscal policy: government revenue and expenditure, taxation",
      "Inflation: types, causes, effects, control",
      "Balance of payments: components, deficits",
      "International trade: theories, trade barriers, WTO",
    ],
    physics: [
      "Electric fields: Coulomb's law, field intensity",
      "Capacitance: capacitors, charging, energy stored",
      "Electric circuits: Ohm's law, Kirchhoff's laws",
      "Electromagnetism: magnetic fields, solenoids",
      "Electromagnetic induction: Faraday's law",
      "A.C. circuits: frequency, peak and RMS values",
      "Transformers and power transmission",
      "Photoelectric effect",
      "Nuclear physics: radioactivity, half-life",
      "Electronics: semiconductors, diodes, transistors",
      "Communication: AM/FM, satellite, fibre optics",
      "Solar energy and renewable energy",
    ],
    literature: [
      "Drama: structural analysis, subtext",
      "Prose: narrative structure, stream of consciousness",
      "Poetry: modernist and contemporary poetry",
      "Comparative literature analysis",
      "African literature in context",
      "Post-colonial themes in literature",
      "Literary criticism: approaches",
      "Extended essay on prescribed texts",
    ],
    account: [
      "Partnership accounts: appropriation, goodwill",
      "Partnership dissolution",
      "Company accounts: share capital, debentures",
      "Published accounts: income statement, balance sheet",
      "Interpretation of accounts: ratios",
      "Cash flow statement",
      "Manufacturing accounts",
      "Non-profit organizations: income and expenditure account",
      "Government accounting basics",
      "Computerized accounting",
    ],
    chemistry: [
      "Rates of reaction: quantitative aspects, order of reaction",
      "Chemical equilibrium: Le Chatelier's principle",
      "Energetics: enthalpy, Hess's law",
      "Electrochemistry: electrode potentials, cell EMF",
      "Industrial chemistry: Haber process, Contact process",
      "Organic chemistry: nomenclature, isomerism",
      "Functional group chemistry: alcohols, aldehydes, ketones, carboxylic acids",
      "Polymers: addition and condensation polymerization",
      "Biochemistry: carbohydrates, proteins, lipids",
      "Environmental chemistry: pollution, green chemistry",
    ],
    government: [
      "Nigeria's political history: colonial era to 1999",
      "The 1999 Constitution: provisions, amendments",
      "Nigerian federalism: history, structure",
      "Electoral system in Nigeria: reform, challenges",
      "Civil service: structure, functions, problems",
      "International relations: foreign policy, treaties",
      "International organizations: UN, AU, ECOWAS, commonwealth",
      "Human rights: international instruments",
      "Corruption and governance",
      "Recent democratic development in Nigeria",
    ],
    "further mathematics": [
      "Differentiation: implicit, parametric, logarithmic",
      "Integration: integration by parts, substitution",
      "Differential equations: first order, variable separable",
      "Complex numbers: Argand diagram, modulus-argument form",
      "Proof by induction",
      "Further vectors: 3D vectors, planes",
      "Further matrices: diagonalization",
      "Statistics: hypothesis testing, chi-square",
      "Mechanics: kinematics, projectiles, circular motion",
      "Linear algebra: eigenvalues, eigenvectors",
    ],
    CRS: [
      "The wisdom literature: Psalms, Proverbs, Job",
      "The prophets: Amos, Hosea, Isaiah",
      "New Testament letters: Galatians, Romans, Corinthians",
      "Christian ethics: love, justice, peace",
      "The church and social issues",
      "Christian approaches to marriage and family",
      "Religious tolerance and inter-faith dialogue",
      "Christian response to poverty and suffering",
    ],
    commerce: [
      "Home and foreign trade: procedures, documents",
      "Import and export: documentation, INCOTERMS",
      "Port operations and agencies",
      "Finance of international trade: letters of credit, bill of exchange",
      "Money market and capital market",
      "Stock exchange: functions, securities",
      "Hire purchase and consumer credit",
      "E-commerce: types, advantages, challenges",
      "Entrepreneurship and business planning",
      "Corporate social responsibility",
    ],
  },
};

// Duration by section
function duration(cls) {
  if (cls.startsWith("JSS")) return "1 hour 30 minutes";
  return "2 hours";
}

// Normalize subject key for lookup
function normalizeSubject(sub) {
  const map = {
    "nve": "NVE", "bst": "BST", "pvs": "PVS", "cca": "CCA", "crs": "CRS",
    "ict": "ICT", "civic education": "civic education",
    "further mathematics": "further mathematics",
  };
  const lower = sub.toLowerCase();
  return map[lower] || lower;
}

function getTopics(cls, subject) {
  const clsData = SCHEME[cls];
  if (!clsData) return null;
  const sub = normalizeSubject(subject);
  return clsData[sub] || clsData[subject] || null;
}

function buildPrompt(subject, cls, paperType, term, session) {
  const topics = getTopics(cls, subject);
  const topicsText = topics
    ? `Scheme of work topics:\n${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
    : `Subject: ${subject} (${cls})`;

  const dur = duration(cls);
  const maxCA = 40; // CA uses Section A only
  const typeLabel = paperType === "CA1" ? "First Continuous Assessment (CA1)"
    : paperType === "CA2" ? "Second Continuous Assessment (CA2)"
    : "End-of-Term Examination";

  let instructions, sectionInstructions;

  if (paperType === "CA1" || paperType === "CA2") {
    instructions = `Generate a ${typeLabel} test paper for ${subject}, ${cls}, ${term} ${session}.
Duration: 30 minutes. Total marks: 40.
The paper has ONE section: 40 multiple-choice (objective) questions, 1 mark each.
Focus on the FIRST HALF of the scheme of work topics for ${paperType === "CA1" ? "CA1 (earlier topics)" : "CA2 (later topics)"}.`;
    sectionInstructions = `
First, generate a STUDENT REVISION GUIDE in a styled HTML box before the paper:
<div style="background:#fffbea;border:2px solid #f4c542;padding:14px;margin-bottom:20px;border-radius:6px;page-break-inside:avoid">
<h3 style="margin:0 0 8px;color:#8B1A2F;border-bottom:1px solid #f4c542;padding-bottom:6px">📚 STUDENT REVISION GUIDE — Study These Before Your Test</h3>
<p style="font-size:11px;color:#666;margin-bottom:10px">Review these key topics. Your teacher expects you to know these for this ${typeLabel}.</p>
[Insert 8-12 specific bullet points covering the key concepts, formulas, definitions, and facts a student must know for this test. Be specific — not just topic titles but actual content to remember.]
</div>

Then generate the test paper:
SECTION A — Objectives (40 marks)
Circle the letter of the correct answer.
Generate exactly 40 multiple-choice questions, each with options A, B, C, D.
Number them 1–40. Vary difficulty: ~40% easy, 40% medium, 20% challenging.
At the end, add an "ANSWERS" section: "Section A: 1-A 2-C 3-B ..." on one line.`;
  } else {
    instructions = `Generate an End-of-Term Examination paper for ${subject}, ${cls}, ${term} ${session}.
Duration: ${dur}. Total marks: 100.
Section A: 40 multiple-choice questions (40 marks, 1 mark each).
Section B: 5 theory/essay questions (60 marks, 15 marks each); candidates attempt ANY 4.`;
    sectionInstructions = `
First, generate a STUDENT REVISION GUIDE in a styled HTML box before the paper:
<div style="background:#fffbea;border:2px solid #f4c542;padding:14px;margin-bottom:20px;border-radius:6px;page-break-inside:avoid">
<h3 style="margin:0 0 8px;color:#8B1A2F;border-bottom:1px solid #f4c542;padding-bottom:6px">📚 STUDENT REVISION GUIDE — Study These Before Your Exam</h3>
<p style="font-size:11px;color:#666;margin-bottom:10px">Review all key topics below. This covers the full scope of the exam.</p>
[Insert 12-16 specific bullet points organized by major topic areas. Include key formulas, theorems, definitions, and concepts a student must know. Be specific and useful — a student should be able to study directly from this list.]
</div>

Then generate the exam paper:
SECTION A — Objectives (40 marks)
Circle the letter of the correct answer.
Generate exactly 40 multiple-choice questions with options A, B, C, D.
Number them 1–40. Vary difficulty: ~40% easy, 40% medium, 20% challenging.

SECTION B — Theory (60 marks) — Attempt any FOUR questions
Generate exactly 5 theory questions. Each must be worth 15 marks and include sub-parts (a), (b), (c).
Questions should cover different major topics from the scheme.

At the end, add an ANSWERS section listing Section A answers: "1-A 2-C 3-B ..."
Also add suggested mark allocation for Section B sub-parts.`;
  }

  const practicalPhilosophy = `Question philosophy (CRITICAL — apply to EVERY question):
• Avoid pure recall or definition questions (e.g. "What is the definition of...?" or "List three types of...")
• Instead, present scenarios, data, or problems that require students to APPLY knowledge
• Ground questions in realistic Nigerian everyday contexts: markets, farms, households, communities, workplaces
• Require students to calculate, analyse, evaluate, compare, predict, or justify — not just recall
• Difficulty should stretch students slightly beyond what they have directly been taught
• For MCQ: make distractors plausible — common misconceptions or partial answers, not obviously wrong options
• For theory: require extended reasoning; award marks for method/process, not just final answer`;

  return `You are an experienced Nigerian secondary school examiner. ${instructions}

${topicsText}

Standard: Align with Nigerian National curriculum (NERDC). Language: clear, age-appropriate for ${cls} students.
${practicalPhilosophy}
${sectionInstructions}

Format the output as clean HTML (no <html>/<body> tags, just the paper content):
- Use <h2> for the school heading "DEBBYFIELD SCHOOLS"
- Sub-heading: subject, class, term, session, duration, total marks
- Use <p>, <ol>, <li> for questions
- Multiple choice options on the same line, separated by spaces: (A) option  (B) option  (C) option  (D) option
- Use <h3> for SECTION headings
- Use <hr> between sections
- The ANSWERS section should be in small gray text: <p style="color:#666;font-size:0.85em"><strong>ANSWERS — Section A:</strong> 1-X 2-X ...</p>
- Keep it professional and printable`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, cls, paperType, term, session } = req.body || {};
  if (!subject || !cls || !paperType || !term || !session) {
    return res.status(400).json({ error: "Missing required fields: subject, cls, paperType, term, session" });
  }
  if (!["CA1", "CA2", "Exam"].includes(paperType)) {
    return res.status(400).json({ error: "paperType must be CA1, CA2, or Exam" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server" });
  }

  const prompt = buildPrompt(subject, cls, paperType, term, session);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return res.status(502).json({ error: "AI service error", detail: err });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    return res.status(200).json({ content });
  } catch (err) {
    console.error("generate-exam error:", err);
    return res.status(500).json({ error: err.message });
  }
}
