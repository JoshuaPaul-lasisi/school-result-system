// EDGE Test Generator — Vercel serverless function
// Generates weekly tests (JSS 1 / SS 1) and mock exams (JSS 2 / SS 2)
// Set ANTHROPIC_API_KEY in Vercel environment variables

// ─── SUBJECT HALVES ──────────────────────────────────────────────────────────

// JSS halves: each entry is an object with a label and components array
// Components map to JSS1_SCHEME keys for topic lookup
const JSS_HALVES = {
  A: [
    { label: "Mathematics",      components: ["Mathematics"] },
    { label: "English Language", components: ["English Language"] },
    { label: "NVE",              components: ["Social Studies","Civic Education","Security Education"] },
    { label: "BST",              components: ["Basic Science","Basic Technology","ICT"] },
  ],
  B: [
    { label: "PVS",              components: ["Agricultural Science","Home Economics"] },
    { label: "CCA",              components: ["Cultural & Creative Arts"] },
    { label: "CRS",              components: ["Christian Religious Studies"] },
  ],
};

// SS halves: each entry is an object with a label and components array
const SS_HALVES = {
  A: [
    { label: "Mathematics",      components: ["Mathematics"] },
    { label: "English Language", components: ["English Language"] },
    { label: "ICT",              components: ["ICT"] },
    { label: "Civic Education",  components: ["Civic Education"] },
    { label: "Biology",          components: ["Biology"] },
    { label: "Economics",        components: ["Economics"] },
    { label: "Physics",          components: ["Physics"] },
  ],
  B: [
    { label: "Literature",       components: ["Literature in English"] },
    { label: "Account",          components: ["Financial Accounting"] },
    { label: "Chemistry",        components: ["Chemistry"] },
    { label: "Government",       components: ["Government"] },
    { label: "Further Mathematics", components: ["Further Mathematics"] },
    { label: "CRS",              components: ["Christian Religious Studies"] },
    { label: "Commerce",         components: ["Commerce"] },
  ],
};

// Composite subject structure for mock exams
const COMPOSITE_SUBJECTS = {
  "NVE":        { fullName: "National Values Education",      components: ["Social Studies","Civic Education","Security Education"] },
  "BST":        { fullName: "Basic Science & Technology",     components: ["Basic Science","Basic Technology","ICT"] },
  "PVS":        { fullName: "Practical & Vocational Studies", components: ["Agricultural Science","Home Economics"] },
  "CCA":        { fullName: "Cultural & Creative Arts",       components: ["Cultural & Creative Arts"] },
  "CRS":        { fullName: "Christian Religious Studies",    components: ["Christian Religious Studies"] },
  "Literature": { fullName: "Literature in English",          components: ["Literature in English"] },
  "Account":    { fullName: "Financial Accounting",           components: ["Financial Accounting"] },
};

// Mock exam subjects per class
const JSS2_SUBJECTS = ["Mathematics","English Language","NVE","BST","PVS","CCA","CRS"];
const SS2_SUBJECTS  = ["Mathematics","English Language","ICT","Civic Education","Biology","Economics","Physics","Literature","Account","Chemistry","Government","Further Mathematics","CRS","Commerce"];

// ─── FULL SCHEME OF WORK ─────────────────────────────────────────────────────
// 11 topics per term per subject (Week 1–11, Week 11 = revision)

const JSS1_SCHEME = {
  "English Language": {
    t1:["Parts of Speech: Nouns & Pronouns","Verbs and Tenses (Simple Present, Past, Future)","Adjectives and Adverbs","Sentence Structure and Types","Concord / Subject-Verb Agreement","Comprehension — Narrative Passages","Essay Writing — Informal Letters","Direct and Indirect Speech","Phrasal Verbs and Idiomatic Expressions","Punctuation and Spelling","Revision & CA"],
    t2:["Phrases and Clauses","Conditional Sentences","Active and Passive Voice","Question Tags","Comprehension — Descriptive Passages","Essay Writing — Formal Letters","Figurative Language (Simile, Metaphor, Personification)","Vocabulary Building — Word Families & Synonyms","Comprehension — Dialogue Passages","Essay Writing — Narrative Essays","Revision & CA"],
    t3:["Perfect and Continuous Tenses","Reported Speech (Extended Practice)","Speech Writing","Argumentative and Debate Essays","Comprehension — Expository Passages","Summary Writing Techniques","Article Writing","Vocabulary — Antonyms, Homophones, Registers","Sentence Transformation Drills","General Language Review & Exam Technique","Revision & Exam"],
  },
  "Mathematics": {
    t1:["Sets — Definition, Types, Notation","Operations on Sets — Union, Intersection, Complement","Venn Diagrams — Two-Set Problems","Number Bases — Binary, Octal, Hexadecimal, Decimal","Conversion Between Number Bases","Natural Numbers — Factors, Multiples, LCM & HCF","Numeration Systems (Hindu-Arabic, Roman)","Operations on Whole Numbers — BODMAS","Positive and Negative Integers — Number Line","Rational Numbers — The Four Basic Operations","Revision & CA"],
    t2:["Common Fractions — Types and Operations","Decimal Fractions, Approximations, Significant Figures","Ratio and Proportion","Percentages — Basic Applications","Rates, Taxes, Commission, Discount","Profit, Loss and Percentage Error","Simple Interest","Indices (Exponents) — Laws and Applications","Standard Form (Scientific Notation)","Statistics — Data Collection, Tables, Bar Charts, Pie Charts","Revision & CA"],
    t3:["Algebraic Expressions — Formulation and Evaluation","Simplification, Expansion and Factorization","Linear Equations in One Variable","Linear Inequalities in One Variable","Mapping and Functions","Co-ordinates — Number Plane, Plotting Points","Angles — Types, Properties, Angle at a Point","Right-Angled Triangle — Pythagoras' Theorem","Length, Perimeter and Area of Plane Figures","Volume of Basic Solids — Cuboid, Cylinder, Cone","Revision & Exam"],
  },
  "Basic Science": {
    t1:["Scientific Method; Lab Safety Rules","General Characteristics of Matter — States and Properties","Measurement — Length, Mass, Volume, Time, Temperature","Density — Definition, Formula, Calculations","Elements, Compounds and Mixtures","Chemical Symbols, Formulae and Equations (Introduction)","Acids, Bases and Salts — Properties and Uses","Metals and Non-Metals — Properties and Uses","Water — Sources, Purification and Treatment","Soil — Types, Composition and Importance","Revision & CA"],
    t2:["Plants — Characteristics, Parts and Functions","Animals — Characteristics and Classification","Flowering Plants — Structure and Reproduction","Vegetative Crop Production","Animal Production — Introduction and Importance","Fish Culture — Basics of Aquaculture","Carbon Cycle and Oxygen Cycle","Photosynthesis — Process and Importance","Food and Nutrition — Food Classes and Functions","Ecosystem — Components, Food Chain, Food Web","Revision & CA"],
    t3:["Sources and Forms of Energy","Light — Reflection and Refraction","Heat — Sources, Transfer, Effects","Electrical Energy — Basic Circuits and Components","Force and Pressure — Definition and Applications","Simple Machines — Types and Uses","Magnetism — Properties and Applications","Respiratory System in Humans","Circulatory System in Humans","Infections, Diseases, Pests and Parasites","Revision & Exam"],
  },
  "Basic Technology": {
    t1:["Introduction to Basic Technology; Workshop Safety Rules","Measuring Tools — Ruler, Calipers, Try Square, Tape","Marking-Out Tools and Techniques","Cutting Tools — Saw, Chisel, Files, Hacksaw","Striking Tools — Hammers (Ball-Peen, Claw, Mallet)","Driving and Removing Tools — Screwdrivers, Spanners","Materials — Ferrous Metals (Iron, Steel)","Materials — Non-Ferrous Metals (Aluminium, Copper, Brass)","Materials — Timber: Types, Seasoning and Uses","Plastics — Types, Properties and Uses","Revision & CA"],
    t2:["Building Materials — Cement, Sand, Aggregates, Blocks","Adhesives, Abrasives and Surface Finishes","Fastenings — Nails, Screws, Bolts and Nuts","Sheet Metal Work — Cutting, Bending, Joining","Moulding and Casting Basics","Walling, Bricklaying and Concrete Work","Basic Electrical Circuits — Symbols and Components","Series and Parallel Circuits — Connections & Calculations","Basic Electronics — Resistors, Capacitors, Diodes","Safety in Electrical Work; First Aid for Electric Shock","Revision & CA"],
    t3:["Technical Drawing — Equipment, Standards, Conventions","Isometric Drawing — 3D Objects","Oblique Drawing — Cabinet and Cavalier","Orthographic Projection — First Angle","Perspective Drawing — One-Point Perspective","Development of Prisms and Cylinders","Maintenance of Tools and Equipment","Applied Technology — Simple Workshop Project","Technology and Development in Society","Entrepreneurship in Technology","Revision & Exam"],
  },
  "ICT": {
    t1:["History of Computers — Generations and Pioneers","Types of Computers — Desktop, Laptop, Tablet, Mainframe","Hardware — Input Devices and Their Uses","Hardware — Output Devices and Their Uses","Hardware — Storage Devices (Primary and Secondary)","Hardware — The CPU and Processing","Software — System Software (OS Types)","Software — Application Software (Types and Examples)","The Desktop, GUI, Icons, Taskbar","Starting, Using and Properly Shutting Down a Computer","Revision & CA"],
    t2:["Microsoft Word — Opening, Interface, Basic Typing","Formatting Text — Font, Size, Bold, Italic, Underline","Paragraph Formatting — Alignment, Spacing, Indents","Inserting Tables, Images and Page Breaks","Saving, Printing and Sharing Documents","Microsoft Excel — Interface and Cell Basics","Entering and Formatting Data in Excel","Simple Formulas — SUM, AVERAGE, MAX, MIN","Creating Charts — Bar, Pie, Line","Introduction to PowerPoint — Slides and Layouts","Revision & CA"],
    t3:["The Internet — What It Is and How It Works","Web Browsing and Search Engines","Email — Creating, Sending, Organising","Social Media — Responsible and Safe Use","Cybersecurity — Passwords, Phishing, Online Safety","Computer Networks — LAN, WAN, Wi-Fi","Introduction to Programming — Algorithms","Flowcharts and Pseudocode","Basic Coding Introduction (Scratch or Python)","Technology and Society — Digital Citizenship","Revision & Exam"],
  },
  "Social Studies": {
    t1:["Introduction to Social Studies; The Family","Types of Family; Family Roles and Relationships","The Community — Types, Features, Importance","Social Environment — Neighbourhood and Society","Natural Environment — Land, Water, Air, Forest","Population — Growth, Distribution in Nigeria","Migration — Internal and External; Push-Pull Factors","Culture — Components, Importance, Cultural Diffusion","Socialization — Agents and Importance","Social Vices — Causes, Effects, Prevention","Revision & CA"],
    t2:["Local Government — Structure and Functions","State Government — Executive, Legislature, Judiciary","Federal Government — Structure and Roles","Democratic Governance — Features and Importance","Citizenship — Rights, Duties and Responsibilities","National Identity — Symbols, Anthem, Pledge","Pre-Colonial Nigeria — Kingdoms and Empires","Colonial Period — British Rule and Independence","Post-Independence Nigeria — Key Events","National Unity and Integration","Revision & CA"],
    t3:["Economy — Types of Economic Activities","Agriculture — Importance and Types in Nigeria","Trade and Commerce — Internal and External","Natural Resources of Nigeria — Oil, Solid Minerals","Poverty and Unemployment — Causes and Solutions","Technology and Development","Communication — Types, Media, Importance","Transportation — Road, Rail, Air, Water","Environmental Problems — Pollution, Erosion, Flooding","Environmental Conservation and Sustainable Development","Revision & Exam"],
  },
  "Civic Education": {
    t1:["Meaning, Scope and Importance of Civic Education","Values — Definition, Types, Sources","Core Civic Values — Justice, Integrity, Honesty, Respect","Rights and Responsibilities of Citizens","Constitutional Rights in Nigeria","Rule of Law — Meaning and Importance","Democracy — Meaning, Types, Features","Elections and Voting — Process and Importance","Political Parties in Nigeria — History and Roles","Arms of Government — Functions and Checks","Revision & CA"],
    t2:["Human Rights — Origin, Types, Importance","Violation of Human Rights — Cases and Effects","Institutions that Protect Rights — NHRC, NAPTIP, NSCDC","Corruption — Definition, Causes, Effects","Anti-Corruption Agencies — EFCC, ICPC, CCB","National Security — Threats and Responses","Citizenship — Types and How It is Acquired","Duties of a Nigerian Citizen","National Symbols — Flag, Coat of Arms, Anthem, Seal","National Integration — Unity in Diversity","Revision & CA"],
    t3:["Drug and Substance Abuse — Causes, Effects, Prevention","Cultism in Schools — Dangers and Prevention","HIV/AIDS and STIs — Facts and Prevention","Environmental Civic Duties","Community Development and Service","Inter-Ethnic Relations in Nigeria","Religious Tolerance and Peaceful Coexistence","Peace-Building and Conflict Resolution","Globalization and Nigerian Citizenship","Review of Key Civic Concepts and Values","Revision & Exam"],
  },
  "Security Education": {
    t1:["Introduction to Security Education — Meaning, Need, Scope","Personal Safety at Home — Identifying Risks, Rules","Road Safety — Pedestrian Safety, Traffic Signs, Seatbelts","Fire Safety — Causes, Prevention, Extinguishers, Escape Plans","Water Safety — Drowning Prevention, Flood Safety, Hazards","Cybersafety — Safe Internet Use, Online Privacy, Reporting","Anti-Bullying — Types, Effects, How to Report and Prevent","School Safety — Emergency Drills, First Aid Box, Safe Play","Security Agencies — Police, NSCDC, LASTMA, Vigilante Groups","Emergency Contacts — Calling for Help, Emergency Numbers Nigeria","Revision & CA"],
    t2:["Drug Abuse — Types of Drugs, Causes, Effects, Prevention","Human Trafficking — Meaning, Methods, Warning Signs, Prevention","Terrorism — Understanding the Threat, Prevention, Staying Safe","Kidnapping — Causes, Awareness, Prevention, Response Guidelines","Armed Robbery — Community Prevention, Safety Measures","National Security Agencies — Police, Army, Navy, Air Force, DSS","Crime and Consequences — Types, Reporting, Legal Process","Security Consciousness — Observation Skills, Suspicious Activity","Community Policing — Neighbourhood Watch, Citizens' Role","Cybercrime — Types, Dangers, Reporting Online Crimes (NDLEA)","Revision & CA"],
    t3:["Conflict Resolution — Mediation, Negotiation, Dialogue, Peace","Peaceful Coexistence — Tolerance, Diversity, National Unity","Natural Disasters — Floods, Drought, Earthquakes: Preparation","Emergency Response — NEMA, Red Cross, Evacuation Procedures","First Aid Basics — CPR Steps, Treating Cuts, Burns, Fractures","Civil Defence — NSCDC Roles, Civil Emergencies, Safety","Border Security — NDLEA, Customs, Immigration: Functions","Cybercrime Legislation — CYBERCRIMES ACT 2015 in Nigeria","Youth and National Security — Responsibilities, Anti-terrorism","Security Agencies Coordination — Military, Para-military, Civil","Revision & Exam"],
  },
  "Christian Religious Studies": {
    t1:["Creation — God Creates the World (Gen 1–2)","Creation of Man and Woman; Human Dignity","The Fall of Man — Sin and Its Consequences","Cain and Abel — Jealousy and Its Consequences","Noah and the Flood — Obedience and Faith","Abraham — The Call of Faith (Gen 12)","Abraham and Isaac — Trust in God","Jacob and Esau — Consequences of Deception","Joseph — Forgiveness and God's Sovereign Plan","Moses — Deliverer of Israel (Exodus 1–3)","Revision & CA"],
    t2:["The Ten Commandments — Law and Morality","Joshua — Courage and Leadership","Samuel — The Call of God; Listening to God","David — Heart of Worship; Integrity and Failure","Solomon — Wisdom, Its Source and Its Limits","Elijah — Serving God Against Overwhelming Opposition","Isaiah — Prophecy of the Coming Messiah","Jeremiah — Perseverance Under Persecution","Daniel — Unwavering Faith Under Pressure","Esther — Courage to Stand for God's People","Revision & CA"],
    t3:["The Birth of Jesus — Incarnation and Purpose","Baptism and Temptation of Jesus","The Sermon on the Mount — Kingdom Values","The Miracles of Jesus — Faith and Compassion","The Parables of Jesus — Kingdom of God","Jesus and the Outcasts — Grace and Inclusion","The Last Supper and Betrayal","Death and Resurrection — The Heart of the Gospel","Pentecost — The Coming of the Holy Spirit","The Early Church — Community, Mission, Growth","Revision & Exam"],
  },
  "Agricultural Science": {
    t1:["Introduction to Agriculture — Meaning, Branches, Importance","Types of Agriculture — Subsistence, Commercial, Mixed","Farm Tools — Hand Tools, Power Tools, Maintenance","Farm Safety Rules and First Aid on the Farm","Soil — Formation, Profile, Composition","Soil Types and Physical Properties","Soil Fertility — Factors, Importance, Management","Soil Erosion — Types, Causes, Control Measures","Soil Conservation — Methods and Importance","Fertilizers — Organic (Manure, Compost) and Inorganic","Revision & CA"],
    t2:["Crop Classification — Cereals, Legumes, Root Crops, etc.","Cereals — Maize, Rice, Sorghum, Wheat","Legumes — Cowpea, Groundnut, Soybean","Root and Tuber Crops — Yam, Cassava, Potato","Vegetable Crops — Tomato, Pepper, Leafy Greens","Tree Crops — Cocoa, Oil Palm, Rubber, Cashew","Planting — Spacing, Thinning, Transplanting","Weeds — Types, Effects and Control Methods","Pests and Diseases of Crops — ID and Control","Harvesting, Processing and Storage of Crops","Revision & CA"],
    t3:["Animal Production — Importance, Branches","Poultry — Breeds, Housing, Equipment","Poultry Feeding and Health Management","Goat and Sheep Farming — Housing, Feeding, Breeding","Pig Production — Housing, Feeding, Disease Control","Cattle Farming — Beef and Dairy; Feeding Systems","Fish Culture — Types of Fish Farming, Pond Construction","Fish Pond Management and Feeding","Rabbit Production — Housing, Feeding, Breeding","Snail Farming — Setup, Feeding, Harvesting","Revision & Exam"],
  },
  "Home Economics": {
    t1:["Introduction to Home Economics — Meaning, Scope, Careers","The Family and Home — Structure and Functions","Personal Hygiene — Body, Hair, Teeth, Nails","Kitchen Hygiene, Sanitation and Safety Rules","Kitchen Equipment — Types, Uses, Care and Storage","Food — Classes and Functions: Carbohydrates, Proteins","Food — Fats/Oils, Vitamins, Minerals, Water","Balanced Diet — Planning and Importance","Food Preservation — Methods and Scientific Basis","Simple Meal Planning — Breakfast, Lunch, Dinner","Revision & CA"],
    t2:["Nigerian Dishes — Ingredients, Preparation, Serving","Cooking Methods — Boiling, Frying, Steaming, Roasting","Table Setting and Dining Etiquette","Clothing — Natural and Synthetic Fibres","Fabric Types — Properties, Uses, Care","Care of Clothing — Washing, Drying, Ironing","Introduction to Sewing — Equipment and Safety","Basic Stitches — Running, Backstitch, Hemming, Gathering","Simple Garment Repairs — Buttons, Zips, Seams","Introduction to Tie and Dye (Adire)","Revision & CA"],
    t3:["Home Management — Cleaning and Maintaining the Home","Laundry — Sorting, Washing, Starching","Care of Furniture and Household Equipment","First Aid — Meaning, Importance, First Aid Kit","First Aid Procedures — Burns, Cuts, Choking, Fractures","Consumer Education — Smart Shopping and Budgeting","Family Budget — Planning and Keeping","Home Safety — Accident Prevention","Caring for the Sick at Home","Home Economics as a Career — Pathways","Revision & Exam"],
  },
  "Cultural & Creative Arts": {
    t1:["Introduction to CCA — Visual Arts, Music, Drama, Dance","Drawing — Materials, Equipment and Types","Line Drawing, Shading Techniques — Pencil Work","Still Life Drawing — Observation and Proportion","Colour Theory — Primary, Secondary, Tertiary Colours","Colour Mixing — Watercolour and Crayon","Pattern and Design — Symmetry and Repetition","Introduction to Music — Elements (Rhythm, Melody, Harmony)","Musical Notation — Notes, Clef, Time Signature","Traditional Nigerian Music — Instruments and Styles","Revision & CA"],
    t2:["Drama — Introduction, Elements, Dramatic Structure","Voice Production, Projection and Expression","Mime and Role Play — Physical Storytelling","Story Dramatisation — Short Scenes","Introduction to Dance — Types and Functions","Traditional Dances of Nigeria (Yoruba, Igbo, Hausa)","Paper Craft — Origami, Collage, Paper Sculpture","Clay Modelling — Forms and Techniques","Weaving and Basketry Introduction","Tie and Dye — Adire Eleko and Adire Eleso","Revision & CA"],
    t3:["Pottery — Hand-Building Techniques","Sculpture — Relief and Three-Dimensional Carving","Batik Design — Wax-Resist Dyeing","Printmaking — Potato Prints, Lino Cuts","Lettering and Calligraphy — Uses in Design","Drama Performance — Short Play for Class","Music — Singing in Parts, Harmony and Rounds","Arts in Society — Cultural Preservation and Identity","Arts and Entrepreneurship — Making a Living Creatively","CCA Exhibition and Class Performance Day","Revision & Exam"],
  },
};

const SS1_SCHEME = {
  "English Language": {
    t1:["Essay Writing — Expository and Formal Letters","Comprehension — Unseen Passages: Main Ideas and Inference","Summary Writing — Note-Taking Techniques","Lexis and Structure — Parts of Speech Review","Tenses — Perfect, Continuous and Perfect Continuous","Concord — Advanced Subject-Verb Agreement","Oral English — Vowels: Monophthongs and Diphthongs","Oral English — Consonants and Consonant Clusters","Figures of Speech — Irony, Hyperbole, Euphemism, Oxymoron","Literature — Introduction to Drama: Structure and Elements","Revision & CA"],
    t2:["Comprehension — Argumentative and Persuasive Texts","Essay — Argumentative and Debate Writing","Reported Speech — Advanced Patterns and Backshift","Conditional Sentences — All Types with Nuance","Passive Voice — Advanced and Impersonal Constructions","Oral English — Stress: Word and Sentence Stress","Oral English — Intonation Patterns","Vocabulary — Register, Collocation, Word Formation","Literature — Prose: Plot, Character, Setting, Theme","Literature — Poetry: Rhyme, Rhythm, Metre, Imagery","Revision & CA"],
    t3:["Comprehension — Literary and Multi-Text Passages","Essay — Descriptive, Creative and Article Writing","Lexis — Idioms, Phrasal Verbs, Fixed Expressions","Clause Types — Relative, Noun, Adverbial Clauses","Sentence Transformation — Advanced Drills","Oral English — Phonetic Transcription Basics","Summary Writing — Advanced Précis Techniques","Literature — Full Text Analysis (Drama or Prose)","Literature — Comparing Texts: Theme, Style, Voice","General Language and Literature Revision","Revision & Exam"],
  },
  "Mathematics": {
    t1:["Number Theory — Surds: Simplification, Rationalisation","Indices — Laws and Equations Involving Indices","Logarithms — Laws, Log Tables, Calculations","Sets — Universal, Power Sets, Venn Diagrams (Three Sets)","Equations — Quadratic Equations: Factorisation, Formula","Quadratic Equations — Completing the Square, Discriminant","Polynomials — Division, Remainder and Factor Theorems","Simultaneous Equations — Linear and Quadratic","Inequalities — Linear, Quadratic, Compound Inequalities","Functions — Definition, Types, Composite, Inverse","Revision & CA"],
    t2:["Coordinate Geometry — Gradient, Midpoint, Distance","Coordinate Geometry — Equation of a Line; Parallel & Perpendicular","Circle — Equation; Centre and Radius Problems","Trigonometry — Ratios, SOHCAHTOA, Exact Values","Trigonometry — Sine, Cosine Rules; Area of Triangle","Trigonometric Identities — Pythagorean, Reciprocal","Vectors — 2D Vectors, Magnitude, Addition, Scalar Multiplication","Matrices — Types, Operations, Determinant (2×2), Inverse","Statistics — Frequency Distribution, Histograms, Cumulative Frequency","Statistics — Mean, Median, Mode, Standard Deviation","Revision & CA"],
    t3:["Probability — Basic Concepts, Sample Space, Events","Probability — Mutually Exclusive, Independent Events, Tree Diagrams","Sequences — AP and GP: nth Term, Sums","Binomial Expansion — Pascal's Triangle, Binomial Theorem","Differentiation — Gradients, First Principles, Power Rule","Differentiation — Product, Quotient and Chain Rules","Differentiation — Applications: Tangents, Normals, Rates","Integration — Indefinite and Definite Integrals","Integration — Area Under a Curve","General Mathematics Revision","Revision & Exam"],
  },
  "Physics": {
    t1:["Introduction to Physics — Branches, Importance, Careers","Measurement — SI Units, Fundamental and Derived Quantities","Scalars and Vectors — Addition and Resolution","Motion — Types, Distance, Displacement, Speed","Velocity, Acceleration and Equations of Motion","Newton's Laws of Motion — Applications and Problems","Projectile Motion — Range, Height, Time of Flight","Work, Energy and Power — Definitions and Calculations","Conservation of Energy — Kinetic and Potential","Simple Machines — MA, VR, Efficiency Calculations","Revision & CA"],
    t2:["Pressure — Solid, Liquid, Gas; Pascal's Law","Archimedes' Principle — Buoyancy and Flotation","Waves — Types, Properties (Wavelength, Frequency, Speed)","Sound Waves — Properties, Speed, Echoes","Light — Reflection: Laws, Plane and Curved Mirrors","Light — Refraction: Snell's Law, Critical Angle, TIR","Lenses — Types, Ray Diagrams, Magnification","Electrostatics — Charge, Coulomb's Law, Electric Field","Electric Circuits — EMF, Resistance, Ohm's Law","Kirchhoff's Laws — Circuit Analysis","Revision & CA"],
    t3:["Capacitance — Capacitors, Charging, Energy Stored","Magnetism — Magnetic Fields, Solenoids, Electromagnets","Electromagnetic Induction — Faraday's and Lenz's Laws","A.C. Circuits — Frequency, RMS Values, Transformers","Radioactivity — Types, Properties, Half-Life, Decay","Nuclear Physics — Fission, Fusion, Nuclear Energy","Semiconductors — Diodes, Transistors, Logic Gates","Heat — Temperature Scales, Thermometry, Specific Heat Capacity","Heat Transfer — Conduction, Convection, Radiation","Thermal Expansion — Solids, Liquids, Gases","Revision & Exam"],
  },
  "Chemistry": {
    t1:["Introduction to Chemistry — Branches, Careers, Lab Safety","Separation Techniques — Filtration, Distillation, Chromatography","Atomic Structure — Protons, Neutrons, Electrons, Atomic Number","Electronic Configuration and Periodic Trends","Chemical Bonding — Ionic, Covalent, Metallic, Hydrogen","Formulae and Equations — Writing and Balancing","Mole Concept — Molar Mass, Moles, Avogadro's Number","Stoichiometry — Mole Ratios and Limiting Reagents","Gases — Ideal Gas Laws: Boyle's, Charles's, Combined","States of Matter — Changes of State, Heating Curves","Revision & CA"],
    t2:["Acids, Bases and Salts — Definitions, Properties, pH","Neutralisation — Preparation of Salts, Titration","Redox Reactions — Oxidation States, Electron Transfer","Electrochemistry — Electrolysis, Electrolytes, Products","Metals — Reactivity Series, Extraction, Corrosion","Non-Metals — Carbon (Allotropes, CO, CO₂), Nitrogen, Sulphur","Water Chemistry — Hard and Soft Water, Treatment","Organic Chemistry — Naming, Functional Groups, IUPAC","Hydrocarbons — Alkanes, Alkenes, Alkynes: Properties, Reactions","Alcohols, Carboxylic Acids, Esters — Properties, Uses","Revision & CA"],
    t3:["Polymers — Addition and Condensation Polymerisation","Chemical Kinetics — Rate of Reaction, Factors, Order","Chemical Equilibrium — Le Chatelier's Principle, Kc","Industrial Chemistry — Haber Process, Contact Process","Energy Changes — Exothermic, Endothermic, Enthalpy, Hess's Law","Biochemistry — Carbohydrates, Proteins, Lipids, Vitamins","Environmental Chemistry — Pollution, Greenhouse Effect","Qualitative Analysis — Tests for Ions, Gases","Nuclear Chemistry — Radioactivity, Isotopes, Applications","General Chemistry Revision and Exam Technique","Revision & Exam"],
  },
  "Biology": {
    t1:["Cell Biology — Structure, Organelles, Plant vs Animal Cells","Cell Division — Mitosis and Meiosis; Significance","Classification of Living Things — Five Kingdoms","Kingdom Monera and Protista — Features, Examples","Kingdom Fungi and Plantae — Features, Divisions","Kingdom Animalia — Major Phyla, Features, Examples","Nutrition in Plants — Photosynthesis: Process, Factors","Nutrition in Animals — Digestion: Organs, Enzymes, Absorption","Transport in Plants — Osmosis, Transpiration, Translocation","Transport in Animals — Heart, Blood Vessels, Blood Groups","Revision & CA"],
    t2:["Respiration — Aerobic, Anaerobic, ATP, Respiratory Organs","Excretion — Kidney Structure, Urine Formation, Osmoregulation","Nervous System — Neurons, Brain, Spinal Cord, Reflex Arc","Endocrine System — Glands, Hormones, Homeostasis","Sense Organs — Eye, Ear, Skin, Nose, Tongue","Reproduction in Humans — Male and Female Systems","Reproduction in Plants — Pollination, Fertilisation, Seed Dispersal","Genetics — DNA, Chromosomes, Mendel's Laws","Monohybrid and Dihybrid Inheritance — Ratios, Problems","Variation — Continuous, Discontinuous; Causes","Revision & CA"],
    t3:["Evolution — Darwin's Theory, Evidence, Natural Selection","Ecology — Habitat, Population, Community, Ecosystem","Biomes and Ecological Zones of Nigeria","Energy Flow — Food Chains, Webs, Trophic Levels, Pyramids","Nutrient Cycles — Carbon, Nitrogen, Water Cycles","Population Ecology — Density, Distribution, Growth, Limiting Factors","Environmental Pollution — Types, Sources, Effects on Organisms","Conservation — Biodiversity, Protected Areas, Sustainable Use","Immunology — Immune System, Vaccines, Antibiotics","General Biology Revision and Exam Strategy","Revision & Exam"],
  },
  "Economics": {
    t1:["Introduction to Economics — Meaning, Scope, Basic Problems","Factors of Production — Land, Labour, Capital, Entrepreneur","Scale of Preference and Opportunity Cost","Theory of Demand — Types, Laws, Determinants","The Demand Curve — Shifts, Elasticity of Demand","Theory of Supply — Types, Laws, Determinants","The Supply Curve — Shifts, Elasticity of Supply","Market Equilibrium — Price Determination, Surplus and Deficit","Consumer Theory — Utility, Law of Diminishing Utility","Indifference Curves and Budget Lines","Revision & CA"],
    t2:["Theory of the Firm — Short Run vs Long Run, Costs","Production Costs — Fixed, Variable, Total, Average, Marginal","Revenue — TR, AR, MR; Profit Maximisation","Market Structures — Perfect Competition: Features, Equilibrium","Monopoly — Features, Pricing, Pros and Cons","Monopolistic Competition — Features, Equilibrium","Oligopoly — Features, Interdependence, Game Theory","National Income — GDP, GNP, NNP; Measurement Methods","National Income and Standard of Living — HDI, Limitations","Money — Functions, Types, Quantity Theory","Revision & CA"],
    t3:["Banking — Commercial, Central Bank; Credit Creation","Monetary Policy — Tools: OMO, Reserve Ratio, Discount Rate","Fiscal Policy — Government Revenue, Expenditure, Taxation","Public Finance — Budget: Types, Deficit, Surplus","Inflation — Types, Causes, Effects, Control Measures","Balance of Payments — Current Account, Capital Account, Deficits","International Trade — Theories, Comparative Advantage, Barriers","Economic Development — Characteristics of LDCs, Strategies","Agricultural Sector in Nigeria — Problems and Solutions","Petroleum Sector — OPEC, Role in Nigerian Economy","Revision & Exam"],
  },
  "Financial Accounting": {
    t1:["Introduction to Bookkeeping and Accounting — Concepts, Terms","Source Documents — Invoice, Credit Note, Debit Note, Receipt","Double Entry — Debit and Credit Rules for All Accounts","Books of Original Entry — Sales Day Book, Purchases Day Book","Returns Books — Sales Returns, Purchases Returns","Journal Proper — Format and Uses","Cash Book — Simple Cash Book: Receipts and Payments","Cash Book — Two-Column: Cash and Bank Columns","Petty Cash Book — Imprest System, Analysis Columns","Ledger — Posting from Day Books to Ledger Accounts","Revision & CA"],
    t2:["Trial Balance — Preparation, Types of Errors","Bank Reconciliation Statement — Preparation and Adjustment","Control Accounts — Sales Ledger, Purchases Ledger","Accruals and Prepayments — Concept and Adjustment","Provisions — Bad Debts, Depreciation Provisions","Final Accounts — Trading Account: Gross Profit Calculation","Final Accounts — Profit and Loss Account","Balance Sheet — Assets, Liabilities, Capital; Format","Depreciation — Straight Line, Reducing Balance Methods","Stock Valuation — FIFO, LIFO, AVCO Methods","Revision & CA"],
    t3:["Partnership Accounts — Appropriation, Partners' Capital Accounts","Partnership Admission, Retirement, Dissolution","Company Accounts — Share Capital, Debentures, Reserves","Income Statement and Statement of Financial Position","Interpretation — Profitability, Liquidity, Efficiency Ratios","Cash Flow Statement — Operating, Investing, Financing","Non-Profit Organisation Accounts — Receipts and Payments","Income and Expenditure Account for Clubs and Societies","Manufacturing Accounts — Prime and Factory Cost","Government Accounting — Public Sector Finance Basics","Revision & Exam"],
  },
  "Government": {
    t1:["Government — Meaning, Functions, Necessity","Power, Authority and Legitimacy — Concepts and Differences","Constitution — Definition, Types, Features, Supremacy","Arms of Government — Structure, Functions, Interrelations","Legislature — Bicameral System, Law-Making Process","Executive — Powers, Functions, Cabinet Responsibility","Judiciary — Independence, Hierarchy of Courts in Nigeria","Political Parties — Roles, Registration, Financing","Electoral System — Types of Election, Proportional Representation","Independent National Electoral Commission (INEC)","Revision & CA"],
    t2:["Pressure Groups — Types, Methods, Functions","Public Opinion and the Media — Influence on Government","Federalism — Meaning, Features, Advantages and Problems","Unitary System — Features, Merits, Demerits vs Federalism","Confederation — Features and Examples","Nigeria's Colonial History — Pre-Colonial to Independence","Nigerian Constitutions — 1922, 1946, 1951, 1954, 1960, 1963","Military Interventions in Nigeria — Causes and Effects","Transition to Civil Rule — Key Events 1975–1999","The 1999 Constitution — Key Provisions and Amendments","Revision & CA"],
    t3:["Local Government — Structure, Functions, Problems in Nigeria","Intergovernmental Relations — Federal, State, Local","Public Service — Civil Service: Structure, Functions, Problems","International Relations — Concept, Basis of Foreign Policy","Nigeria's Foreign Policy — Principles, Goals, Challenges","International Organisations — UN: Structure and Functions","African Union — History, Structure, Peacekeeping Role","ECOWAS — Formation, Organs, Integration Challenges","Human Rights — UN Declarations, African Charter, Enforcement","Contemporary Issues — Corruption, Insecurity, Electoral Reform","Revision & Exam"],
  },
  "Literature in English": {
    t1:["Introduction to Literature — Genres: Prose, Poetry, Drama","Elements of Prose — Plot, Conflict, Narrative Structure","Characterisation — Direct, Indirect; Flat and Round Characters","Setting and Atmosphere — Physical, Temporal, Social","Point of View — First Person, Third Person (Limited/Omniscient)","Theme and Subject Matter — Identifying and Analysing","Style and Tone — Authorial Voice, Diction, Imagery","Language Devices — Symbolism, Irony, Allusion, Allegory","Oral Literature — Folktales, Proverbs, Myths, Riddles","Introduction to Prescribed Text (Prose) — Context and Plot","Revision & CA"],
    t2:["Drama — Elements: Plot, Conflict, Catharsis, Dramatic Irony","Stage Directions, Stagecraft and Theatre Conventions","Types of Drama — Tragedy, Comedy, Tragicomedy, Farce","Prescribed Text (Drama) — In-Depth Character Analysis","Dramatic Themes — Power, Betrayal, Redemption, Identity","Poetry — Forms: Lyric, Narrative, Dramatic, Epic","Poetic Devices — Rhyme Scheme, Metre, Stanza, Enjambment","Sound Devices — Alliteration, Assonance, Onomatopoeia","Imagery and Figurative Language in Poetry","Prescribed Poetry — Analysis of Individual Poems","Revision & CA"],
    t3:["Extended Prose Analysis — Structural and Thematic Reading","Extended Drama Analysis — Dramatic Techniques, Social Context","African Literature — Themes, Language, Post-Colonial Identity","Comparative Analysis — Two Texts: Style, Theme, Character","Critical Writing — Essay Structure: Introduction, Body, Conclusion","Unseen Passages — Prose Extract Analysis Technique","Unseen Poetry — Approach and Annotation Technique","Literature and Society — How Texts Reflect and Shape Culture","Revision of All Prescribed Texts — Key Quotes and Arguments","Examination Technique — Timing, Planning, Answering","Revision & Exam"],
  },
  "Agricultural Science": {
    t1:["Introduction to Agricultural Science — Scope, Importance, Branches","Crop Production — Land Preparation: Clearing, Tilling, Ridging","Propagation — Sexual and Vegetative Propagation Methods","Planting — Spacing, Seed Rate, Transplanting, Nursery Practice","Agrochemicals — Fertilisers: Types, Methods of Application","Weed Management — Classification, Effects, Control Methods","Pest Management — Types of Pests, IPM Approach","Disease Management — Plant Diseases: ID, Control, Prevention","Harvesting — Methods, Maturity Indices, Post-Harvest Handling","Storage — Methods, Losses, Preservation Techniques","Revision & CA"],
    t2:["Soil Science — Formation, Profile, Horizons","Soil Properties — Physical: Texture, Structure, Porosity","Soil Properties — Chemical: pH, Nutrient Content, CEC","Soil Fertility and Management — Depletion and Improvement","Soil Conservation — Erosion Types, Control Structures","Irrigation and Drainage — Methods, Importance, Waterlogging","Agricultural Economics — Farm Planning, Records, Costing","Agricultural Ecology — Agroecosystems, Biodiversity","Animal Husbandry — Livestock: Cattle, Pigs, Poultry, Sheep","Animal Feeds and Nutrition — Types, Formulation, Feed Conversion","Revision & CA"],
    t3:["Fishery — Types of Fish, Pond Construction and Management","Aquaculture — Species, Feeding, Health Management, Harvesting","Forestry — Types of Forest, Products, Conservation","Agricultural Machinery — Tractors, Implements, Maintenance","Biotechnology in Agriculture — GMOs, Tissue Culture, Applications","Agro-Processing — Value Addition, Food Technology Basics","Marketing of Agricultural Produce — Channels, Prices, Problems","Agricultural Finance — Loans, Cooperatives, Government Support","Entrepreneurship in Agriculture — Business Planning, Opportunities","Agricultural Development in Nigeria — Policies, Agencies, Challenges","Revision & Exam"],
  },
  "ICT": {
    t1:["Introduction to ICT — Meaning, Scope, Importance in Modern Society","Computer Hardware — System Unit, Peripherals, Ports and Connectors","Computer Software — System Software vs Application Software","Operating Systems — Windows, Linux, macOS: Functions and Features","File Management — Creating, Naming, Organising, Searching Files","Word Processing — Advanced Features: Mail Merge, Tables, Templates","Spreadsheets — Functions, Formulas, Conditional Formatting","Database Concepts — Tables, Records, Fields, Queries, Reports","Presentation Software — Slide Design, Animations, Transitions","Input and Output Devices — Types, Functions, Selection Criteria","Revision & CA"],
    t2:["Computer Networks — Types: LAN, MAN, WAN; Topologies","Network Hardware — Routers, Switches, Modems, Hubs, NICs","Internet Services — WWW, Email, FTP, VoIP, Cloud Computing","Web Design Basics — HTML Tags, Structure, Formatting, Links","Search Engines — Effective Search Techniques, Boolean Operators","Cybersecurity — Threats: Viruses, Malware, Phishing, Hacking","Data Protection — Firewalls, Antivirus, Encryption, Passwords","Social Media — Responsible Use, Digital Footprint, Netiquette","E-Commerce — Online Shopping, Mobile Banking, Digital Payments","ICT and Society — Digital Divide, Ethics, Privacy, Cyber Laws","Revision & CA"],
    t3:["Programming Concepts — Algorithms, Flowcharts, Pseudocode","Introduction to Python — Variables, Data Types, Input/Output","Control Structures — if/elif/else Statements in Python","Loops in Python — for and while Loops with Examples","Functions in Python — Definition, Parameters, Return Values","Data Structures — Lists, Tuples, Dictionaries in Python","Debugging and Testing — Error Types, Tracing, Correcting Code","Introduction to Artificial Intelligence — Concepts and Applications","Robotics and Automation — Concepts, Applications in Industry","Emerging Technologies — IoT, Big Data, Blockchain, AR/VR","Revision & Exam"],
  },
  "Civic Education": {
    t1:["Civic Education — Meaning, Scope, Objectives and Relevance","Democracy — Features, Types, Principles, Merits and Demerits","Constitution — Meaning, Types, Features, Supremacy of Law","Rule of Law — Principles, Importance, Threats in Nigeria","Citizenship — Types, Rights, Duties, How Citizenship Is Acquired","Human Rights — Origin, Categories, UDHR, Nigerian Constitution","Violation of Human Rights — Forms, Effects, Reporting Channels","Arms of Government — Legislature, Executive, Judiciary: Functions","Separation of Powers and Checks and Balances","Elections and Electoral Process — INEC, Voting, Electoral Malpractice","Revision & CA"],
    t2:["Federalism in Nigeria — Features, Benefits, Challenges","Inter-Governmental Relations — Revenue Sharing, Cooperation","Political Parties — Functions, Funding, Party System in Nigeria","Pressure Groups and Civil Society — Types, Methods, Importance","National Values — Integrity, Discipline, Patriotism, Tolerance","Anti-Corruption Crusade — EFCC, ICPC, CCB, Whistleblowing","Drug Abuse — Types of Drugs, Causes, Effects, NDLEA, Prevention","Human Trafficking — Causes, Methods, Effects, NAPTIP, Laws","Cultism — Forms, Causes, Dangers, Prevention in Schools","Environmental Citizenship — Duties, Pollution, Conservation","Revision & CA"],
    t3:["National Security — Threats: Terrorism, Insurgency, Communal Clashes","Government Responses to Insecurity — Military, Police, DSS","Global Citizenship — International Organisations, UN, AU, ECOWAS","Population and Development — Challenges of Population Growth","Entrepreneurship and Civic Responsibility — Business Ethics","Gender Equality and Social Justice — Women's Rights in Nigeria","Community Development — Self-Help Projects, Volunteerism","Media and Democracy — Role of the Press, Freedom of Information","Civic Participation — Voting, Community Service, Advocacy","Review of Key Civic Themes and Examination Preparation","Revision & Exam"],
  },
  "Further Mathematics": {
    t1:["Surds — Simplification, Rationalisation, Operations on Surds","Indices and Logarithms — Laws, Equations, Applications","Polynomials — Degree, Operations, Division, Remainder Theorem","Polynomial Equations — Factor Theorem, Roots, Relationships","Rational Functions — Partial Fractions (Linear, Quadratic Denominators)","Sequences and Series — AP: nth Term, Sum, Arithmetic Mean","Geometric Progression — nth Term, Sum, Geometric Mean, Infinity","Binomial Theorem — Expansion, General Term, Pascal's Triangle","Principle of Mathematical Induction — Method and Applications","Permutation and Combination — Counting Principles, nPr, nCr","Revision & CA"],
    t2:["Probability — Classical, Empirical; Conditional Probability, Bayes","Random Variables — Discrete and Continuous; Expectation, Variance","Binomial Distribution — Parameters, Mean, Variance, Applications","Normal Distribution — Standard Normal, Z-Scores, Tables","Coordinate Geometry — Conic Sections: Circle, Parabola, Ellipse","Vectors in 3D — Magnitude, Direction Cosines, Dot Product","Matrices and Determinants — 3×3 Determinant, Cramer's Rule","Systems of Linear Equations — Gaussian Elimination, Matrix Method","Complex Numbers — Argand Diagram, Modulus-Argument, Operations","De Moivre's Theorem — nth Roots of Complex Numbers","Revision & CA"],
    t3:["Differential Calculus — Higher Derivatives, Implicit Differentiation","Applications of Differentiation — Maxima, Minima, Curve Sketching","Integration Techniques — Integration by Parts, Substitution","Definite Integrals — Area Between Curves, Volumes of Revolution","Differential Equations — First-Order Separable Equations","Trigonometry — Addition Formulae, Double Angle, Half Angle","Inverse Trigonometric Functions — Derivatives and Integrals","Numerical Methods — Trapezium Rule, Simpson's Rule, Newton-Raphson","Linear Programming — Formulation, Graphical Method, Optimisation","General Further Mathematics Revision — Past Questions Practice","Revision & Exam"],
  },
  "Commerce": {
    t1:["Introduction to Commerce — Meaning, Scope, Branches, Importance","Trade — Meaning, Types: Home Trade and Foreign Trade","Home Trade — Retail Trade: Types of Retailers, Functions","Retail Trade — Departmental Stores, Supermarkets, E-Commerce","Wholesale Trade — Functions, Services to Retailers and Producers","Channels of Distribution — Direct, Indirect; Merits and Problems","Aids to Trade — Transport: Types, Modes, Importance in Commerce","Transport — Road, Rail, Air, Water: Advantages and Disadvantages","Warehousing — Types of Warehouses, Functions, Bonded Warehouses","Insurance — Principles: Indemnity, Insurable Interest, Subrogation","Revision & CA"],
    t2:["Insurance — Types: Life, Fire, Marine, Motor, Burglary","Banking — Types of Banks: Commercial, Central, Development Banks","Commercial Bank Services — Loans, Overdrafts, Remittances, Accounts","Central Bank of Nigeria — Functions, Monetary Policy, Regulation","Money — Functions, Types, Qualities of Good Money","Credit — Types of Credit, Hire Purchase, Leasing, Instalment","Advertising — Meaning, Types, Media, Objectives, Criticisms","Sales Promotion — Methods, Consumer Promotions, Trade Deals","E-Commerce — Online Business, Digital Marketing, Payment Systems","Tourism — Meaning, Importance, Challenges for Nigeria","Revision & CA"],
    t3:["Communication in Commerce — Types, Media, ICT in Business","Office — Meaning, Functions, Types, Open vs Private Plan","Business Documents — Invoice, Receipt, Statement, Credit/Debit Note","Import and Export Trade — Procedure, Documents, Trade Finance","Balance of Trade and Balance of Payments — Concepts, Problems","Tariffs and Trade Barriers — Types, Reasons, WTO, ECOWAS","Entrepreneurship — Meaning, Characteristics, Business Formation","Business Ownership — Sole Trader, Partnership, Ltd, PLC, Co-ops","Consumer Protection — NAFDAC, SON, CAC, Consumer Rights","Revision of Commerce Concepts and Examination Strategy","Revision & Exam"],
  },
  "Christian Religious Studies": {
    t1:["Introduction to CRS — Meaning, Importance, Sources of Christian Faith","The Bible — Divisions, Canon, Versions, Inspiration of Scripture","Creation — God's Creative Work (Genesis 1–2): Order and Purpose","The Fall — Disobedience, Consequences, God's Plan of Redemption","Cain and Abel — Worship, Jealousy, Murder, Consequences","Noah and the Flood — Faith, Obedience, God's Covenant, Rainbow","Abraham — Call, Promise, Migration, Faith as Righteousness","Abraham's Tests — Hagar/Ishmael, Covenant of Circumcision, Isaac","Jacob — The Supplanter: Birthright, Blessing, Dream at Bethel","Joseph — Dreams, Betrayal, Slavery, Faithfulness in Egypt","Revision & CA"],
    t2:["Joseph in Egypt — Temptation, Prison, Interpretation, Exaltation","Moses — Birth, Call at Burning Bush, Plagues, The Exodus","The Ten Commandments — Law and the Covenant at Sinai","Joshua — Conquest of Canaan, Rahab, Battle of Jericho","Judges — Gideon, Samson: Calling, Failure and Faithfulness","Samuel — Call, Eli, Ark of God, Anointing of Saul","David — Anointing, Goliath, Jonathan, Rise to Power","David's Failures — Bathsheba, Uriah, Nathan's Rebuke, Repentance","Solomon — Wisdom, Temple Building, Apostasy, Kingdom Division","Elijah — Confronting Ahab, Mount Carmel, Still Small Voice","Revision & CA"],
    t3:["The Incarnation — Birth of Jesus: Prophecy, Virgin Birth, Wise Men","Ministry of Jesus — Baptism, Temptation, Early Galilean Ministry","Sermon on the Mount — Beatitudes, Lord's Prayer, Kingdom Ethics","Miracles of Jesus — Healing, Nature Miracles, Raising the Dead","Parables of Jesus — Prodigal Son, Good Samaritan, Sower","Jesus and Outcasts — Zacchaeus, Samaritan Woman, Tax Collectors","The Passion Narrative — Triumphal Entry, Cleansing Temple, Betrayal","Crucifixion and Resurrection — Theological Significance, Evidence","The Great Commission and Ascension — Mission of the Church","Pentecost and Early Church — Acts 2, Spread of the Gospel","Revision & Exam"],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function termKey(term) {
  if (term === "First Term")  return "t1";
  if (term === "Second Term") return "t2";
  return "t3";
}

function termNumber(term) {
  if (term === "First Term")  return 1;
  if (term === "Second Term") return 2;
  return 3;
}

// Topics covered in a subject up to (but not including) the given week within a term
function topicsCoveredInTerm(scheme, subject, term, upToWeek) {
  const tk = termKey(term);
  const topics = scheme[subject]?.[tk] || [];
  return topics.slice(0, upToWeek - 1).filter(t => !t.startsWith("Revision"));
}

// All topics from previous terms
function topicsFromPreviousTerms(scheme, subject, term) {
  const tn = termNumber(term);
  const keys = ["t1","t2","t3"].slice(0, tn - 1);
  return keys.flatMap(tk => (scheme[subject]?.[tk] || []).filter(t => !t.startsWith("Revision")));
}

// All topics across all 3 terms (for mock exams)
function allTopics(scheme, subject) {
  return ["t1","t2","t3"].flatMap(tk => (scheme[subject]?.[tk] || []).filter(t => !t.startsWith("Revision")));
}

// Cumulative test index (1-24) for difficulty calculation
function cumulativeTestIndex(term, weekNumber) {
  const testsPerTerm = 8; // weeks 3-10
  return (termNumber(term) - 1) * testsPerTerm + (weekNumber - 2);
}

// Half for a given week (A for odd count from week 3, B for even)
// Week 3→A, Week 4→B, Week 5→A, Week 6→B ...
function weekHalf(weekNumber) {
  return ((weekNumber - 3) % 2 === 0) ? "A" : "B";
}

function difficultyDescription(testIndex) {
  if (testIndex <= 4)  return "Hard — significantly above standard BECE/JSCE level. Students must think deeply.";
  if (testIndex <= 8)  return "Hard+ — increasingly challenging. Inference, application, multi-step reasoning required.";
  if (testIndex <= 12) return "Very Hard — minimum 2-step reasoning for every question. No easy recall questions.";
  if (testIndex <= 16) return "Very Hard+ — questions should feel like the hardest BECE questions. Push critical thinking.";
  if (testIndex <= 20) return "Extremely Hard — close to advanced BECE standard. Multi-step, tricky options, deep analysis.";
  return "Maximum Difficulty — harder than standard BECE. Only mastery-level understanding will score full marks.";
}

function mockDifficultyMultiplier(mockNumber) {
  const multipliers = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  return multipliers[mockNumber - 1] || 1.5;
}

function mockDifficultyDescription(mockNumber, examType) {
  const mult = mockDifficultyMultiplier(mockNumber);
  const descriptions = {
    1: `1.5× harder than ${examType}. Still recognisable ${examType} format but questions require deeper analysis.`,
    2: `2× harder than ${examType}. No straightforward recall. Every question demands application or evaluation.`,
    3: `2.5× harder than ${examType}. Questions should feel like a harder version of the hardest ${examType} questions.`,
    4: `3× harder than ${examType}. Advanced level. Many questions will require synthesis across topics.`,
    5: `3.5× harder than ${examType}. Near university-entrance level difficulty. Only thorough mastery scores well.`,
    6: `4× harder than ${examType}. The hardest test these students will face before the real exam. After this, ${examType} will feel easy.`,
  };
  return descriptions[mockNumber] || descriptions[1];
}

// ─── REVISION GUIDE HTML ──────────────────────────────────────────────────────

function buildRevisionGuideHTML(subjectGroups) {
  // subjectGroups: array of { heading: string, bullets: string[] }
  const innerSections = subjectGroups.map(({ heading, bullets }) => {
    const lis = bullets.map(b => `    <li>${b}</li>`).join("\n");
    return `  <h4 style="color:#185FA5;margin:10px 0 6px">${heading}</h4>\n  <ul style="margin:0 0 10px;padding-left:20px;font-size:12px">\n${lis}\n  </ul>`;
  }).join("\n");

  return `<div style="background:#fffbea;border:2px solid #f4c542;padding:16px;margin-bottom:24px;border-radius:6px;page-break-inside:avoid">
  <h3 style="margin:0 0 10px;color:#8B1A2F;border-bottom:1px solid #f4c542;padding-bottom:8px">&#x1F4DA; STUDENT REVISION GUIDE — Study These Topics Before Your Test</h3>
  <p style="font-size:11px;color:#666;margin-bottom:12px">Review all bullet points below. These are the key areas your teacher expects you to know for this test.</p>
${innerSections}
</div>`;
}

// Build revision guide topic bullets for a subject (all covered topics up to now)
function revisionBulletsForSubject(scheme, subject, term, weekNumber) {
  const prev = topicsFromPreviousTerms(scheme, subject, term);
  const curr = topicsCoveredInTerm(scheme, subject, term, weekNumber);
  const combined = [...prev, ...curr];
  if (combined.length === 0) return [`Introductory concepts and overview of ${subject}`];
  return combined;
}

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

function buildWeeklyTestPrompt(cls, half, weekNumber, term, session) {
  const isJSS = cls === "JSS 1";
  const scheme = isJSS ? JSS1_SCHEME : SS1_SCHEME;
  const halves = isJSS ? JSS_HALVES : SS_HALVES;
  const subjectGroups = halves[half];
  const testIndex = cumulativeTestIndex(term, weekNumber);
  const diffDesc = difficultyDescription(testIndex);
  const examType = isJSS ? "BECE/JSCE" : "WAEC/NECO";

  if (isJSS) {
    return buildJSSWeeklyTestPrompt(cls, half, weekNumber, term, session, subjectGroups, scheme, testIndex, diffDesc, examType);
  } else {
    return buildSSWeeklyTestPrompt(cls, half, weekNumber, term, session, subjectGroups, scheme, testIndex, diffDesc, examType);
  }
}

function buildJSSWeeklyTestPrompt(cls, half, weekNumber, term, session, subjectGroups, scheme, testIndex, diffDesc, examType) {
  // Build revision guide
  const revGuideGroups = subjectGroups.flatMap(group => {
    return group.components.map(comp => ({
      heading: comp === group.label ? comp : `${group.label} — ${comp}`,
      bullets: revisionBulletsForSubject(scheme, comp, term, weekNumber),
    }));
  });
  const revisionGuideHTML = buildRevisionGuideHTML(revGuideGroups);

  // Build covered topics text (shared)
  const topicsText = subjectGroups.map(group => {
    return group.components.map(comp => {
      const prev = topicsFromPreviousTerms(scheme, comp, term);
      const curr = topicsCoveredInTerm(scheme, comp, term, weekNumber);
      let txt = `▸ ${comp}\n`;
      if (prev.length > 0) txt += `  [Previous terms]: ${prev.join("; ")}\n`;
      if (curr.length > 0) txt += `  [${term} up to Week ${weekNumber - 1}]: ${curr.join("; ")}`;
      if (prev.length === 0 && curr.length === 0) txt += `  [Introductory knowledge of ${comp}]`;
      return txt;
    }).join("\n\n");
  }).join("\n\n");

  const practicalRules = `• ZERO pure recall questions — no "What is the meaning/definition of...?"
• Every question must require thinking: apply a concept to a new scenario, analyse data, solve a multi-step problem, evaluate a situation, or make a judgement
• Ground questions in real Nigerian everyday life where possible (markets, farms, homes, roads, schools)
• Vary cognitive demand: some questions are straightforward application; others require deeper analysis or creative thinking
• Questions should stretch students slightly beyond what they have been directly taught — encourage thinking, not rote answers`;

  if (half === "A") {
    // Half A: Mathematics (Q1–2, 32 marks), English (Q3–4, 32 marks), NVE (Q5, 18 marks), BST (Q6, 18 marks)
    return `You are generating an EDGE Weekly Test for Debbyfield Schools.

EDGE is an accelerated programme. In ${cls}, students cover the ENTIRE ${examType} syllabus in one year. Tests challenge them ABOVE the standard ${examType} level — ALL theory, NO objectives/MCQ.

━━━ TEST PARAMETERS ━━━
Class: ${cls} | Term: ${term} ${session} | Week: ${weekNumber} | Half: A
Test Index: ${testIndex} of 24 | Duration: 2 hours | Total: 100 marks

━━━ DIFFICULTY ━━━
${diffDesc}

━━━ QUESTION PHILOSOPHY — READ CAREFULLY ━━━
${practicalRules}

━━━ COVERED TOPICS ━━━
${topicsText}

━━━ FORMAT — JSS Half A (ALL THEORY, NO MCQ) ━━━
Generate the complete test in HTML (no <html>/<body> tags) following EXACTLY this structure:

1. Header:
<h2 style="text-align:center">DEBBYFIELD SCHOOLS — EDGE Weekly Test</h2>
<p style="text-align:center"><strong>${cls} | ${term} ${session} | Week ${weekNumber} | Half A</strong><br>Duration: 2 hours &nbsp;|&nbsp; Total: 100 marks &nbsp;|&nbsp; Answer ALL questions</p>
<hr>

2. Revision Guide (insert the following HTML block exactly):
${revisionGuideHTML}

3. Questions (Answer ALL — 100 marks total):
<h3>Questions — Answer ALL [100 marks]</h3>
<p><em>This paper is entirely theory. Show all working where applicable. Answer ALL six questions.</em></p>

Generate exactly 6 theory questions with these mark allocations:

<p><strong>Question 1 [Mathematics — 16 marks]</strong></p>
[A 3–4 part Mathematics question. Parts (a), (b), (c)[, (d)] with mark allocations summing to 16. Use a real-world scenario (e.g. a market transaction, a building project, a savings plan). Require calculation, interpretation, and reasoning — not just formula application.]

<p><strong>Question 2 [Mathematics — 16 marks]</strong></p>
[A different Mathematics topic from Q1. 2–3 parts summing to 16 marks. Include data to interpret or a multi-step problem that builds from one part to the next.]

<p><strong>Question 3 [English Language — 16 marks]</strong></p>
[A comprehension passage (80–120 words, set in a Nigerian context) followed by 4–5 questions (inference, vocabulary in context, grammar identification, summary skill) totalling 16 marks. Questions should require students to think beyond the text.]

<p><strong>Question 4 [English Language — 16 marks]</strong></p>
[A writing task worth 16 marks — either: a formal or informal letter, a speech, a narrative essay, or a creative piece. Give a specific, realistic prompt that requires students to think and plan, not just copy a template.]

<p><strong>Question 5 [NVE — National Values Education — 18 marks]</strong></p>
[Three-part NVE question:
(a) Social Studies scenario — 6 marks: present a community situation students must analyse or evaluate
(b) Civic Education application — 6 marks: a civic scenario requiring knowledge of rights, duties, government, or anti-corruption
(c) Security Education case — 6 marks: a safety/security scenario students must respond to practically]

<p><strong>Question 6 [BST — Basic Science & Technology — 18 marks]</strong></p>
[Three-part BST question:
(a) Basic Science investigation or data-interpretation question — 6 marks
(b) Basic Technology design or problem-solving question — 6 marks
(c) ICT practical application question — 6 marks]

<hr>

4. Mark Scheme:
<p style="color:#666;font-size:0.85em"><strong>MARK SCHEME:</strong></p>
<p style="color:#666;font-size:0.85em">[For each question, list the key points/steps expected and the mark allocation per part. Be specific enough for a teacher to mark consistently.]</p>

Generate the complete test now:`;
  } else {
    // Half B: PVS (Agricultural Science + Home Economics, 50 marks), CCA (25 marks), CRS (25 marks)
    return `You are generating an EDGE Weekly Test for Debbyfield Schools.

EDGE is an accelerated programme. In ${cls}, students cover the ENTIRE ${examType} syllabus in one year. Tests challenge them ABOVE the standard ${examType} level — ALL theory, NO objectives/MCQ.

━━━ TEST PARAMETERS ━━━
Class: ${cls} | Term: ${term} ${session} | Week: ${weekNumber} | Half: B
Test Index: ${testIndex} of 24 | Duration: 2 hours | Total: 100 marks

━━━ DIFFICULTY ━━━
${diffDesc}

━━━ QUESTION PHILOSOPHY — READ CAREFULLY ━━━
${practicalRules}

━━━ COVERED TOPICS ━━━
${topicsText}

━━━ FORMAT — JSS Half B (ALL THEORY, NO MCQ) ━━━
Generate the complete test in HTML (no <html>/<body> tags) following EXACTLY this structure:

1. Header:
<h2 style="text-align:center">DEBBYFIELD SCHOOLS — EDGE Weekly Test</h2>
<p style="text-align:center"><strong>${cls} | ${term} ${session} | Week ${weekNumber} | Half B</strong><br>Duration: 2 hours &nbsp;|&nbsp; Total: 100 marks &nbsp;|&nbsp; Answer ALL questions</p>
<hr>

2. Revision Guide (insert the following HTML block exactly):
${revisionGuideHTML}

3. Questions (Answer ALL — 100 marks total):
<h3>Questions — Answer ALL [100 marks]</h3>
<p><em>This paper is entirely theory. Answer ALL four questions.</em></p>

Generate exactly 4 theory questions:

<p><strong>Question 1 [Agricultural Science — 25 marks]</strong></p>
[A 3–4 part Agricultural Science question summing to 25 marks. Use a realistic farm or food-production scenario. Require students to plan, evaluate, calculate, or make decisions — e.g. plan a crop rotation, analyse why a harvest failed, calculate profit from a farm produce. At least one part should require extended writing (5+ marks).]

<p><strong>Question 2 [Home Economics — 25 marks]</strong></p>
[A 3–4 part Home Economics question summing to 25 marks. Ground it in a household or community scenario — e.g. planning a balanced meal on a budget, managing a home during a health crisis, designing a safe kitchen. Require analysis, planning, and justification.]

<p><strong>Question 3 [CCA — Cultural & Creative Arts — 25 marks]</strong></p>
[A 3–4 part CCA question summing to 25 marks. Include both practical knowledge and creative application — e.g. analyse a piece of artwork using elements of design, describe how to create a specific craft with Nigerian materials, explain the cultural significance of an art form. At least one part should require creativity or extended explanation.]

<p><strong>Question 4 [CRS — Christian Religious Studies — 25 marks]</strong></p>
[A 3–4 part CRS question summing to 25 marks. Link Bible passages or Christian values to real-life situations students face — e.g. apply a parable to a school conflict, discuss what a Bible story teaches about honesty in modern Nigeria, evaluate how a Christian principle should guide a specific decision. Require thinking and application, not quotation only.]

<hr>

4. Mark Scheme:
<p style="color:#666;font-size:0.85em"><strong>MARK SCHEME:</strong></p>
<p style="color:#666;font-size:0.85em">[For each question (Q1–Q4), list the expected key points/steps per sub-part with mark allocation. Be specific enough for consistent teacher marking.]</p>

Generate the complete test now:`;
  }
}

function buildSSWeeklyTestPrompt(cls, half, weekNumber, term, session, subjectGroups, scheme, testIndex, diffDesc, examType) {
  // SS: 7 subjects per half, ALL THEORY
  // Marks: first 2 subjects get 15 marks each, remaining 5 get 14 marks each = 15+15+14×5 = 100

  // Build revision guide groups (one per subject label, using component topics)
  const revGuideGroups = subjectGroups.map(group => {
    const bullets = group.components.flatMap(comp =>
      revisionBulletsForSubject(scheme, comp, term, weekNumber)
    );
    return { heading: group.label, bullets };
  });
  const revisionGuideHTML = buildRevisionGuideHTML(revGuideGroups);

  // Build covered topics text
  const topicsText = subjectGroups.map(group => {
    return group.components.map(comp => {
      const prev = topicsFromPreviousTerms(scheme, comp, term);
      const curr = topicsCoveredInTerm(scheme, comp, term, weekNumber);
      let txt = `▸ ${group.label}${comp !== group.label ? ` (${comp})` : ""}\n`;
      if (prev.length > 0) txt += `  [Previous terms]: ${prev.join("; ")}\n`;
      if (curr.length > 0) txt += `  [${term} up to Week ${weekNumber - 1}]: ${curr.join("; ")}`;
      if (prev.length === 0 && curr.length === 0) txt += `  [Introductory knowledge of ${comp}]`;
      return txt;
    }).join("\n\n");
  }).join("\n\n");

  // Mark allocation: first 2 = 15, rest = 14
  const markAlloc = subjectGroups.map((_, i) => i < 2 ? 15 : 14);

  // Build theory question blocks
  const theoryQs = subjectGroups.map((group, idx) => {
    const marks = markAlloc[idx];
    const compNote = group.components.length > 1
      ? ` (covers: ${group.components.join(", ")})`
      : "";
    return `<p><strong>Question ${idx + 1} [${group.label}${compNote} — ${marks} marks]</strong></p>
[A ${marks}-mark ${group.label} theory question with 2–3 parts. Ground it in a real-world scenario relevant to Nigerian SS students. Require application, analysis, calculation, or evaluation — not recall. Each part should build logically on the previous one where possible. Mark allocation shown per sub-part.]`;
  }).join("\n\n");

  const practicalRules = `• ZERO pure recall questions — no "What is the meaning/definition of...?"
• Every question must require thinking: apply a concept, analyse a scenario, calculate from given data, evaluate options, or make a reasoned judgement
• Ground questions in real Nigerian contexts (economy, politics, science experiments, literature themes, accounting scenarios)
• Vary cognitive demand: some parts are straightforward application; others require deeper analysis
• Questions should stretch students slightly beyond direct classroom content — encourage reasoning, not rote answers`;

  return `You are generating an EDGE Weekly Test for Debbyfield Schools.

EDGE is an accelerated programme. In ${cls}, students cover the ENTIRE ${examType} syllabus in one year. Tests challenge them ABOVE the standard ${examType} level — ALL theory, NO objectives/MCQ.

━━━ TEST PARAMETERS ━━━
Class: ${cls} | Term: ${term} ${session} | Week: ${weekNumber} | Half: ${half}
Test Index: ${testIndex} of 24 | Duration: 2 hours | Total: 100 marks

━━━ DIFFICULTY ━━━
${diffDesc}

━━━ QUESTION PHILOSOPHY — READ CAREFULLY ━━━
${practicalRules}

━━━ COVERED TOPICS ━━━
${topicsText}

━━━ FORMAT — SS Half ${half} (ALL THEORY, NO MCQ) ━━━
Generate the complete test in HTML (no <html>/<body> tags) following EXACTLY this structure:

1. Header:
<h2 style="text-align:center">DEBBYFIELD SCHOOLS — EDGE Weekly Test</h2>
<p style="text-align:center"><strong>${cls} | ${term} ${session} | Week ${weekNumber} | Half ${half}</strong><br>Duration: 2 hours &nbsp;|&nbsp; Total: 100 marks &nbsp;|&nbsp; Answer ALL questions</p>
<hr>

2. Revision Guide (insert the following HTML block exactly):
${revisionGuideHTML}

3. Questions (Answer ALL — 100 marks total):
<h3>Questions — Answer ALL [100 marks]</h3>
<p><em>This paper is entirely theory. Answer ALL SEVEN questions. Show all working where applicable.</em></p>

Generate exactly 7 theory questions (one per subject), in this order:
${theoryQs}

<hr>

4. Mark Scheme:
<p style="color:#666;font-size:0.85em"><strong>MARK SCHEME:</strong></p>
<p style="color:#666;font-size:0.85em">[For each question (Q1–Q7), list expected key points/steps per sub-part with mark allocation. Be specific enough for consistent teacher marking.]</p>

Generate the complete test now:`;
}

function buildMockExamPrompt(cls, subject, mockNumber, term, session) {
  const isJSS = ["JSS 1","JSS 2"].includes(cls);
  const scheme = isJSS ? JSS1_SCHEME : SS1_SCHEME;
  const examType = isJSS ? "JSCE/BECE" : "WAEC/NECO";
  const mult = mockDifficultyMultiplier(mockNumber);
  const diffDesc = mockDifficultyDescription(mockNumber, examType);
  const termLabel = `Term ${Math.ceil(mockNumber / 2)}, Mock ${mockNumber % 2 === 0 ? 2 : 1} of that term`;
  const duration = isJSS ? "2 hours" : "2 hours 30 minutes";

  // Resolve composite subjects
  const composite = COMPOSITE_SUBJECTS[subject];
  const components = composite ? composite.components : [subject];
  const fullName = composite ? composite.fullName : subject;

  // Gather all topics for all components
  const componentTopics = components.map(comp => {
    const topics = allTopics(scheme, comp);
    return { comp, topics };
  });

  // Build flat topic list for prompt
  const topicText = componentTopics.map(({ comp, topics }) => {
    if (topics.length === 0) return `${comp}: Full ${examType} syllabus`;
    return `${comp}:\n${topics.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}`;
  }).join("\n\n");

  // Build revision guide for mock
  const revGuideGroups = componentTopics.map(({ comp, topics }) => ({
    heading: comp,
    bullets: topics.length > 0 ? topics : [`Full ${examType} syllabus for ${comp}`],
  }));
  const revisionGuideHTML = buildRevisionGuideHTML(revGuideGroups);

  // Determine Section A distribution for composite subjects
  let sectionAInstruction = "";
  if (components.length === 1) {
    sectionAInstruction = "Generate exactly 50 multiple-choice questions covering all topics.";
  } else {
    const perComp = Math.floor(50 / components.length);
    const remainder = 50 - perComp * components.length;
    const dist = components.map((c, i) => `${c}: ${perComp + (i === components.length - 1 ? remainder : 0)} questions`).join(", ");
    sectionAInstruction = `For composite subject, distribute 50 MCQs equally across components: ${dist}. Label each group with a sub-heading.`;
  }

  let sectionBInstruction = "";
  if (components.length === 1) {
    sectionBInstruction = "Generate 5 theory questions covering the full syllabus.";
  } else {
    sectionBInstruction = `Generate 5 theory questions. Ensure questions cover all components (${components.join(", ")}). Some questions may integrate multiple components. Each question should have sub-parts.`;
  }

  return `You are generating EDGE Mock Exam ${mockNumber} for Debbyfield Schools.

EDGE Mock Exams are for ${cls} students preparing for ${examType}. The school's philosophy is: students should practise at a harder level than the real exam so that when the actual exam comes, it feels easy.

━━━ MOCK PARAMETERS ━━━
Class: ${cls} | Subject: ${fullName} (${subject})
Mock Number: ${mockNumber} of 6 | ${termLabel} | ${term} ${session}
Difficulty Multiplier: ×${mult} vs standard ${examType}

━━━ DIFFICULTY ━━━
${diffDesc}
Specific requirements for ×${mult}:
• Section A: Every question must require at least ${Math.ceil(mult)} steps of reasoning or deep conceptual understanding
• No question should be answerable by simple recall alone
• Use data sets, graphs, case scenarios, multi-concept integration
• Distractors must be carefully crafted — plausible misconceptions, common errors, partial answers
• Section B: Questions must demand synthesis, evaluation, extended calculation, or critical analysis
${mult >= 3 ? "• Include at least one question that would challenge A-Level or university-entrance students" : ""}
${mult >= 3.5 ? "• Some questions may integrate topics from 2–3 different areas of the syllabus simultaneously" : ""}

━━━ COMPLETE SYLLABUS COVERAGE ━━━
All topics from the full ${isJSS ? "JSS 1" : "SS 1"} scheme are in scope:
${topicText}

━━━ FORMAT ━━━

Generate the complete mock exam in HTML (no <html>/<body> tags):

<h2 style="text-align:center">DEBBYFIELD SCHOOLS</h2>
<h3 style="text-align:center">EDGE Mock Exam ${mockNumber} — ${cls} ${fullName}</h3>
<p style="text-align:center">${term} ${session} &nbsp;|&nbsp; Duration: ${duration} &nbsp;|&nbsp; Total: 100 marks</p>
<p style="text-align:center;color:#8B1A2F;font-weight:600">Difficulty Level: ×${mult} vs ${examType} Standard</p>
<hr>

Insert this revision guide block:
${revisionGuideHTML}

<h3>SECTION A — Objectives [50 marks]</h3>
<p><em>Choose the correct answer from options A–D. Each question carries 1 mark.</em></p>
${sectionAInstruction}
<ol>[50 numbered MCQ questions with options on same line]</ol>

<hr>

<h3>SECTION B — Theory [50 marks]</h3>
<p><em>Answer ANY FOUR questions. Each question carries 12.5 marks.</em></p>
${sectionBInstruction}
[5 theory questions, each with clear sub-parts (a), (b), (c) [and (d) if needed], marks shown per sub-part, totalling 12.5 marks per question]

<hr>

<p style="color:#666;font-size:0.85em"><strong>SECTION A ANSWERS:</strong> [1-X 2-X ... all 50 on one or two lines]<br><strong>SECTION B MARK SCHEME:</strong> [brief allocation per sub-part for all 5 questions]</p>

Generate the mock exam now:`;
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { testType, cls, subject, half, weekNumber, mockNumber, term, session } = req.body || {};

  if (!testType || !cls || !term || !session) {
    return res.status(400).json({ error: "Missing required fields: testType, cls, term, session" });
  }
  if (!["weekly","mock"].includes(testType)) {
    return res.status(400).json({ error: "testType must be 'weekly' or 'mock'" });
  }
  if (testType === "weekly" && (!half || !weekNumber)) {
    return res.status(400).json({ error: "Weekly tests require: half (A/B), weekNumber (3-10)" });
  }
  if (testType === "mock" && (!subject || !mockNumber)) {
    return res.status(400).json({ error: "Mock exams require: subject, mockNumber (1-6)" });
  }

  // Validate mock subject for JSS 2 and SS 2
  if (testType === "mock") {
    const isJSS = ["JSS 1","JSS 2"].includes(cls);
    const isSS  = ["SS 1","SS 2"].includes(cls);
    if (isJSS && !JSS2_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        error: `Invalid subject for JSS mock. Valid subjects: ${JSS2_SUBJECTS.join(", ")}`,
      });
    }
    if (isSS && !SS2_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        error: `Invalid subject for SS mock. Valid subjects: ${SS2_SUBJECTS.join(", ")}`,
      });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server" });

  let prompt;
  try {
    if (testType === "weekly") {
      prompt = buildWeeklyTestPrompt(cls, half, parseInt(weekNumber), term, session);
    } else {
      prompt = buildMockExamPrompt(cls, subject, parseInt(mockNumber), term, session);
    }
  } catch (e) {
    return res.status(400).json({ error: "Failed to build prompt: " + e.message });
  }

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
    console.error("generate-edge error:", err);
    return res.status(500).json({ error: err.message });
  }
}
