// EDGE Test Generator — Vercel serverless function
// Generates weekly tests (JSS 1 / SS 1) and mock exams (JSS 2 / SS 2)
// Set ANTHROPIC_API_KEY in Vercel environment variables

// ─── SUBJECT HALVES ──────────────────────────────────────────────────────────

const JSS_HALVES = {
  A: ["English Language","Mathematics","Basic Science","Basic Technology","Social Studies","Civic Education","Christian Religious Studies"],
  B: ["Business Studies","Computer Studies","Agricultural Science","Home Economics","Cultural & Creative Arts","Physical & Health Education","Yoruba Language"],
};

const SS_HALVES = {
  A: ["English Language","Mathematics","Physics","Chemistry","Biology","Economics"],
  B: ["Financial Accounting","Government","Literature in English","Geography","Agricultural Science"],
};

// Mock exam subjects per class
const JSS2_SUBJECTS = [...JSS_HALVES.A, ...JSS_HALVES.B];
const SS2_SUBJECTS  = [...SS_HALVES.A, ...SS_HALVES.B];

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
  "Christian Religious Studies": {
    t1:["Creation — God Creates the World (Gen 1–2)","Creation of Man and Woman; Human Dignity","The Fall of Man — Sin and Its Consequences","Cain and Abel — Jealousy and Its Consequences","Noah and the Flood — Obedience and Faith","Abraham — The Call of Faith (Gen 12)","Abraham and Isaac — Trust in God","Jacob and Esau — Consequences of Deception","Joseph — Forgiveness and God's Sovereign Plan","Moses — Deliverer of Israel (Exodus 1–3)","Revision & CA"],
    t2:["The Ten Commandments — Law and Morality","Joshua — Courage and Leadership","Samuel — The Call of God; Listening to God","David — Heart of Worship; Integrity and Failure","Solomon — Wisdom, Its Source and Its Limits","Elijah — Serving God Against Overwhelming Opposition","Isaiah — Prophecy of the Coming Messiah","Jeremiah — Perseverance Under Persecution","Daniel — Unwavering Faith Under Pressure","Esther — Courage to Stand for God's People","Revision & CA"],
    t3:["The Birth of Jesus — Incarnation and Purpose","Baptism and Temptation of Jesus","The Sermon on the Mount — Kingdom Values","The Miracles of Jesus — Faith and Compassion","The Parables of Jesus — Kingdom of God","Jesus and the Outcasts — Grace and Inclusion","The Last Supper and Betrayal","Death and Resurrection — The Heart of the Gospel","Pentecost — The Coming of the Holy Spirit","The Early Church — Community, Mission, Growth","Revision & Exam"],
  },
  "Business Studies": {
    t1:["Introduction to Business — Meaning, Types, Importance","Sole Proprietorship — Features, Advantages, Disadvantages","Partnership — Formation, Types, Advantages","Limited Liability Companies — Public and Private","Co-operative Societies — Types and Importance","Trade — Home Trade and Foreign Trade","Functions and Qualities of a Trader","Channels of Distribution — Roles of Intermediaries","Retail Trade — Types of Retailers and Their Functions","Wholesale Trade — Functions of a Wholesaler","Revision & CA"],
    t2:["The Office — Meaning, Functions, Types","Office Equipment and Their Uses","Filing and Record Keeping — Systems and Importance","Business Communication — Formal Letters","Business Communication — Memos and Circulars","Money — Origin, Functions, Qualities","Banking — Types of Banks and Their Services","Savings and Current Accounts — Differences","Cheques, Drafts and Electronic Payment","Insurance — Meaning, Principles, Types","Revision & CA"],
    t3:["Introduction to Keyboarding / Typewriting","Home Keys and Correct Posture","Upper Row Keys — Drill Practice","Lower Row Keys — Drill Practice","Capital Letters, Numbers, Punctuation Marks","Typing Simple Business Documents","Introduction to Bookkeeping — Concepts","Double Entry — Debit and Credit Explained","The Cash Book — Simple Entries","Petty Cash Book — Imprest System","Revision & Exam"],
  },
  "Computer Studies": {
    t1:["History of Computers — Generations and Pioneers","Types of Computers — Desktop, Laptop, Tablet, Mainframe","Hardware — Input Devices and Their Uses","Hardware — Output Devices and Their Uses","Hardware — Storage Devices (Primary and Secondary)","Hardware — The CPU and Processing","Software — System Software (OS Types)","Software — Application Software (Types and Examples)","The Desktop, GUI, Icons, Taskbar","Starting, Using and Properly Shutting Down a Computer","Revision & CA"],
    t2:["Microsoft Word — Opening, Interface, Basic Typing","Formatting Text — Font, Size, Bold, Italic, Underline","Paragraph Formatting — Alignment, Spacing, Indents","Inserting Tables, Images and Page Breaks","Saving, Printing and Sharing Documents","Microsoft Excel — Interface and Cell Basics","Entering and Formatting Data in Excel","Simple Formulas — SUM, AVERAGE, MAX, MIN","Creating Charts — Bar, Pie, Line","Introduction to PowerPoint — Slides and Layouts","Revision & CA"],
    t3:["The Internet — What It Is and How It Works","Web Browsing and Search Engines","Email — Creating, Sending, Organising","Social Media — Responsible and Safe Use","Cybersecurity — Passwords, Phishing, Online Safety","Computer Networks — LAN, WAN, Wi-Fi","Introduction to Programming — Algorithms","Flowcharts and Pseudocode","Basic Coding Introduction (Scratch or Python)","Technology and Society — Digital Citizenship","Revision & Exam"],
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
  "Physical & Health Education": {
    t1:["Introduction to PHE — Importance of Physical Activity","Physical Fitness — Components: Strength, Stamina, Flexibility","Warming Up and Cooling Down Properly","Athletics — Sprint, Middle Distance, Relay Techniques","Athletics — High Jump, Long Jump, Triple Jump","Athletics — Shot Put, Discus, Javelin Introduction","Football — Rules, Positions, Tactics","Football Skills — Dribbling, Passing, Shooting, Heading","Volleyball — Rules, Court Layout, Positions","Volleyball Skills — Serving, Setting, Passing, Spiking","Revision & CA"],
    t2:["Basketball — Rules, Court, Positions","Basketball Skills — Dribbling, Shooting, Defense","Handball — Introduction, Rules and Skills","Table Tennis — Equipment, Rules, Basic Techniques","Badminton — Equipment, Rules, Basic Strokes","Health Education — Personal Hygiene and Grooming","Disease Prevention — Immunization Schedule","Nutrition and Physical Performance","First Aid — Sprains, Strains, Fractures, CPR Basics","Alcohol, Drugs and Sport — Effects and Rules","Revision & CA"],
    t3:["Swimming — Pool Safety and Basic Strokes","Indigenous Nigerian Games — Ayo, Tug-of-War, etc.","Gymnastics — Forward Roll, Cartwheel, Balance Beam","Rope Jumping, Flexibility and Stretching Routines","Mental Health and Emotional Wellbeing","Stress Management and Relaxation Techniques","Reproductive Health Education","Sports Leadership, Teamwork and Fair Play","Career Pathways in Sports","Sports Day Preparation and Team Practice","Revision & Exam"],
  },
  "Yoruba Language": {
    t1:["Ìfáàrọ̀ Yorùbá — Mò Èdè Mi (Introduction to Yoruba)","Ẹbí àti Àgbèjọ — Describing Family and Household","Òrọ̀ Orúkọ — Nouns: Types and Usage","Òrọ̀ Ìṣe — Verbs and Tenses in Yoruba","Àpèjúwe — Adjectives, Adverbs and Comparisons","Àmì Ohùn — Tonal Marks and Correct Pronunciation","Ìlò Àmì Ìsọ̀rọ̀ — Punctuation in Yoruba Writing","Kíkà — Reading Comprehension: Simple Narrative","Ìkọ̀wé — Composition: Informal Letter (Lẹ́tà)","Àsà Yorùbá — Proverbs and Their Meanings","Revision & CA"],
    t2:["Ìtàn Àtẹnudẹnu — Yoruba Oral Tradition and Folktales","Ẹ̀wì — Yoruba Praise Poetry (Oriki) Introduction","Òrọ̀ Àpọ̀nwọ̀ — Pronouns and Their Use","Ìbéèrè àti Ìdáhùn — Questions and Answers","Ìfọ̀rọ̀wérọ̀ — Conversation Drills on Daily Topics","Ọjà — Market Vocabulary and Role Play","Àwùjọ àti Ìjọba — Community and Social Life","Orin Yorùbá — Songs, Poems and Rhythms","Kíkà — Comprehension: Descriptive Passage","Ìkọ̀wé — Composition: Descriptive Essay","Revision & CA"],
    t3:["Ìtàn Yorùbá — History, Kingdoms, Heroes","Ìdárayá àti Àṣà — Traditional Festivals and Customs","Ìdásọ̀ Àpapọ̀ — Complex Sentence Construction","Òrọ̀ Àsọyé — Reported Speech in Yoruba","Kíkà — Expository Passage Comprehension","Akopọ̀ Òrọ̀ — Summary Writing in Yoruba","Ìkọ̀wé — Argumentative Writing","Ìtàn Kíkà — Introduction to Yoruba Written Literature","Sísọ Yorùbá — Oral Expression and Presentation","Àtúnyẹ̀wò Gbogbo — General Revision","Revision & Exam"],
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
  "Geography": {
    t1:["Introduction to Geography — Branches, Tools, Importance","Maps and Map Reading — Scale, Grid References, Contours","Earth's Structure — Crust, Mantle, Core","Plate Tectonics — Theory, Evidence, Boundaries","Earthquakes — Causes, Effects, Measurement, Distribution","Volcanoes — Types, Formation, Products, Distribution","Weathering — Physical, Chemical, Biological; Results","Erosion and Deposition — Agents: Rivers, Wind, Ice, Sea","Rivers — Long Profile, Processes, Landforms (V-Valley to Delta)","Coasts — Erosion Landforms (Cliff, Cave, Arch, Stack), Beaches","Revision & CA"],
    t2:["Climate and Weather — Difference; Elements and Controls","Climate Classification — Tropical, Temperate, Polar Zones","The Atmosphere — Layers, Composition, Pressure Belts","Tropical Rainforest Climate — Features, Location, Vegetation","Savanna Climate — Guinea and Sudan Savanna, Vegetation","Mediterranean Climate — Features, Vegetation, Land Use","World Population — Distribution, Density, Factors","Population Growth — Birth Rates, Death Rates, Migration","Urban Geography — Urbanisation, CBD, Suburbs, Problems","Rural-Urban Migration — Causes, Effects, Solutions","Revision & CA"],
    t3:["Agriculture — Types, Systems, Factors of Production","Nigerian Agriculture — Problems, Green Revolution, Solutions","Mining — Types, Methods, Environmental Impact","Petroleum Industry in Nigeria — Exploration, Refining, Pipelines","Manufacturing Industry — Types, Location Factors","Transportation — Road, Rail, Water, Air; Nigeria's Network","Trade — Internal and External; Balance of Trade","Natural Hazards — Floods, Droughts, Desertification in Nigeria","Environmental Problems — Erosion, Deforestation, Pollution","Sustainable Development and Environmental Management","Revision & Exam"],
  },
  "Agricultural Science": {
    t1:["Introduction to Agricultural Science — Scope, Importance, Branches","Crop Production — Land Preparation: Clearing, Tilling, Ridging","Propagation — Sexual and Vegetative Propagation Methods","Planting — Spacing, Seed Rate, Transplanting, Nursery Practice","Agrochemicals — Fertilisers: Types, Methods of Application","Weed Management — Classification, Effects, Control Methods","Pest Management — Types of Pests, IPM Approach","Disease Management — Plant Diseases: ID, Control, Prevention","Harvesting — Methods, Maturity Indices, Post-Harvest Handling","Storage — Methods, Losses, Preservation Techniques","Revision & CA"],
    t2:["Soil Science — Formation, Profile, Horizons","Soil Properties — Physical: Texture, Structure, Porosity","Soil Properties — Chemical: pH, Nutrient Content, CEC","Soil Fertility and Management — Depletion and Improvement","Soil Conservation — Erosion Types, Control Structures","Irrigation and Drainage — Methods, Importance, Waterlogging","Agricultural Economics — Farm Planning, Records, Costing","Agricultural Ecology — Agroecosystems, Biodiversity","Animal Husbandry — Livestock: Cattle, Pigs, Poultry, Sheep","Animal Feeds and Nutrition — Types, Formulation, Feed Conversion","Revision & CA"],
    t3:["Fishery — Types of Fish, Pond Construction and Management","Aquaculture — Species, Feeding, Health Management, Harvesting","Forestry — Types of Forest, Products, Conservation","Agricultural Machinery — Tractors, Implements, Maintenance","Biotechnology in Agriculture — GMOs, Tissue Culture, Applications","Agro-Processing — Value Addition, Food Technology Basics","Marketing of Agricultural Produce — Channels, Prices, Problems","Agricultural Finance — Loans, Cooperatives, Government Support","Entrepreneurship in Agriculture — Business Planning, Opportunities","Agricultural Development in Nigeria — Policies, Agencies, Challenges","Revision & Exam"],
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
  // topics[0] = Week 1, topics[N-1] = Week N
  // For test on weekN, cover topics from weeks 1 to weekN-1
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

// Half for a given week (odd = A, even = B counting from week 3)
// Week 3→A(1), Week 4→B(2), Week 5→A(3), Week 6→B(4) ...
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

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

function buildWeeklyTestPrompt(cls, half, weekNumber, term, session) {
  const isJSS = cls === "JSS 1";
  const scheme = isJSS ? JSS1_SCHEME : SS1_SCHEME;
  const halves = isJSS ? JSS_HALVES : SS_HALVES;
  const subjects = halves[half];
  const testIndex = cumulativeTestIndex(term, weekNumber);
  const diffDesc = difficultyDescription(testIndex);
  const examType = isJSS ? "BECE/JSCE" : "WAEC/NECO";
  const totalQs = subjects.length * 4;
  const tn = termNumber(term);

  const subjectDetails = subjects.map(sub => {
    const prevTopics = topicsFromPreviousTerms(scheme, sub, term);
    const thisTermTopics = topicsCoveredInTerm(scheme, sub, term, weekNumber);
    const allCovered = [...prevTopics, ...thisTermTopics];
    let topicText = "";
    if (prevTopics.length > 0) {
      topicText += `  [From previous term(s)]: ${prevTopics.join("; ")}\n`;
    }
    if (thisTermTopics.length > 0) {
      topicText += `  [${term} up to Week ${weekNumber - 1}]: ${thisTermTopics.join("; ")}`;
    }
    if (allCovered.length === 0) {
      topicText = "  [Topics from scheme are all new — test general introductory knowledge of this subject]";
    }
    return `▸ ${sub}\n${topicText}`;
  }).join("\n\n");

  return `You are generating an EDGE Weekly Test for Debbyfield Schools.

EDGE is an accelerated academic programme. In ${cls}, students cover the ENTIRE ${examType} syllabus in one year. Weekly tests challenge them ABOVE the standard ${examType} level to build mastery.

━━━ TEST PARAMETERS ━━━
Class: ${cls} | Term: ${term} ${session} | Week: ${weekNumber} | Half: ${half}
Test Index: ${testIndex} of 24 for this class's EDGE year
Duration: 35 minutes | Total: ${totalQs} marks

━━━ DIFFICULTY ━━━
${diffDesc}
Rules:
• NO pure recall questions (no "What is the definition of...?")
• Every question must test understanding, application, analysis, or evaluation
• Use scenario-based questions, data interpretation, error-detection, or multi-step problems
• Distractors (wrong options) must be plausible — not obviously wrong
• Avoid giving away answers through option patterns

━━━ SUBJECTS AND COVERED TOPICS ━━━
${subjectDetails}

━━━ FORMAT ━━━
Generate EXACTLY 4 questions per subject, numbered 1–${totalQs} sequentially.
All questions are Multiple Choice with 4 options: (A) (B) (C) (D)

HTML format (no <html>/<body> tags):
• <h2>DEBBYFIELD SCHOOLS — EDGE Weekly Test</h2>
• <p style="text-align:center"><strong>${cls} | ${term} ${session} | Week ${weekNumber} | Half ${half}</strong><br>Duration: 35 minutes &nbsp;|&nbsp; Total: ${totalQs} marks &nbsp;|&nbsp; All questions carry 1 mark each</p>
• <hr>
• For each subject: <h4 style="color:#8B1A2F;margin-top:16px">[Subject Name]</h4> followed by <ol start="[first Q number]">...<li>...</li>...</ol>
• Each question: <li>[Question text]<br><span style="color:#444">(A) ... &nbsp;&nbsp; (B) ... &nbsp;&nbsp; (C) ... &nbsp;&nbsp; (D) ...</span></li>
• At the very end: <hr><p style="color:#666;font-size:0.85em"><strong>ANSWERS:</strong> 1-X &nbsp; 2-X &nbsp; 3-X ... (all ${totalQs} answers on one or two lines)</p>

Generate the test now:`;
}

function buildMockExamPrompt(cls, subject, mockNumber, term, session) {
  const isJSS = ["JSS 1","JSS 2"].includes(cls);
  const scheme = isJSS ? JSS1_SCHEME : SS1_SCHEME;
  const examType = isJSS ? "JSCE/BECE" : "WAEC/NECO";
  const mult = mockDifficultyMultiplier(mockNumber);
  const diffDesc = mockDifficultyDescription(mockNumber, examType);
  const termLabel = `Term ${Math.ceil(mockNumber / 2)}, Mock ${mockNumber % 2 === 0 ? 2 : 1} of that term`;
  const duration = isJSS ? "2 hours" : "2 hours 30 minutes";

  const subjectTopics = allTopics(scheme, subject);
  const topicText = subjectTopics.length > 0
    ? subjectTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : `Full ${examType} syllabus for ${subject}`;

  return `You are generating EDGE Mock Exam ${mockNumber} for Debbyfield Schools.

EDGE Mock Exams are for ${cls} students preparing for ${examType}. The school's philosophy is: students should practise at a harder level than the real exam so that when the actual exam comes, it feels easy.

━━━ MOCK PARAMETERS ━━━
Class: ${cls} | Subject: ${subject}
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
All topics from the full ${isJSS ? "JSS 1" : "SS 1"} scheme are in scope for this mock:
${topicText}

━━━ FORMAT ━━━
SECTION A — Objectives (50 marks): exactly 50 multiple-choice questions, 1 mark each
SECTION B — Theory (50 marks): 5 questions, candidates attempt ANY 4 (each worth 12.5 marks)
  Each theory question must have sub-parts (a), (b), (c) [and (d) if needed]
  Total theory marks per question: 12.5

HTML format (no <html>/<body> tags):
• <h2 style="text-align:center">DEBBYFIELD SCHOOLS</h2>
• <h3 style="text-align:center">EDGE Mock Exam ${mockNumber} — ${cls} ${subject}</h3>
• <p style="text-align:center">${term} ${session} &nbsp;|&nbsp; Duration: ${duration} &nbsp;|&nbsp; Total: 100 marks</p>
• <p style="text-align:center;color:#8B1A2F;font-weight:600">Difficulty Level: ×${mult} vs ${examType} Standard</p>
• <hr>
• <h3>SECTION A — Objectives [50 marks]</h3>
• <p><em>Choose the correct answer from options A–D. Each question carries 1 mark.</em></p>
• Numbered list <ol> with all 50 questions, options on same line
• <hr>
• <h3>SECTION B — Theory [50 marks]</h3>
• <p><em>Answer ANY FOUR questions. Each question carries 12.5 marks.</em></p>
• 5 numbered theory questions with clear sub-parts
• <hr>
• ANSWERS and mark scheme: <p style="color:#666;font-size:0.85em"><strong>SECTION A ANSWERS:</strong> [1-X 2-X ... all 50]<br><strong>SECTION B MARK SCHEME:</strong> [brief allocation per sub-part]</p>

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
