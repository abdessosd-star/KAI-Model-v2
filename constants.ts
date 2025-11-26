import { Question, QuestionType, Archetype, EmployeeData } from './types';

/**
 * An array of assessment questions.
 * @type {Question[]}
 */
export const QUESTIONS: Question[] = [
  // --- MODULE 0: PROFIEL & CONTEXT ---
  {
    id: 'prof_name',
    text: 'Wat is uw voor- en achternaam?',
    subText: 'We gebruiken dit om uw rapport te personaliseren.',
    type: QuestionType.TEXT,
    category: 'profile'
  },
  {
    id: 'prof_role',
    text: 'Wat is uw huidige functietitel?',
    subText: 'We gebruiken dit om uw takenpakket te matchen aan marktstandaarden.',
    type: QuestionType.TEXT,
    category: 'profile'
  },
  {
    id: 'prof_industry',
    text: 'In welke sector is uw organisatie actief?',
    type: QuestionType.SELECT,
    category: 'profile',
    options: [
      { label: "Financiële Dienstverlening", value: "Finance" },
      { label: "Gezondheidszorg & Welzijn", value: "Healthcare" },
      { label: "Technologie & Software", value: "Tech" },
      { label: "Overheid & Publieke Sector", value: "Public" },
      { label: "Retail & E-commerce", value: "Retail" },
      { label: "Productie & Industrie", value: "Manufacturing" },
      { label: "Zakelijke Dienstverlening", value: "Services" },
      { label: "Onderwijs & Wetenschap", value: "Education" },
      { label: "Creatieve Industrie & Media", value: "Media" },
      { label: "Bouw & Vastgoed", value: "Construction" },
      { label: "Anders", value: "Other" }
    ]
  },
  {
    id: 'prof_dept',
    text: 'In welke afdeling bent u voornamelijk werkzaam?',
    type: QuestionType.SELECT,
    category: 'profile',
    options: [
      { label: "Management & Directie", value: "Management" },
      { label: "IT, Data & Engineering", value: "IT" },
      { label: "Marketing & Communicatie", value: "Marketing" },
      { label: "Sales & Accountmanagement", value: "Sales" },
      { label: "HR & Recruitment", value: "HR" },
      { label: "Finance & Administratie", value: "Finance" },
      { label: "Operations & Logistiek", value: "Operations" },
      { label: "Legal, Risk & Compliance", value: "Legal" },
      { label: "R&D / Productontwikkeling", value: "R&D" },
      { label: "Klantenservice / Support", value: "Support" }
    ]
  },
  {
    id: 'prof_exp',
    text: 'Hoeveel jaar werkervaring heeft u in uw huidige vakgebied?',
    type: QuestionType.SELECT,
    category: 'profile',
    options: [
      { label: "Starter (0-2 jaar)", value: "Junior" },
      { label: "Professional (3-7 jaar)", value: "Medior" },
      { label: "Senior / Expert (8-15 jaar)", value: "Senior" },
      { label: "Veteraan / Executive (15+ jaar)", value: "Executive" }
    ]
  },
  {
    id: 'prof_org_size',
    text: 'Wat is de omvang van uw organisatie?',
    type: QuestionType.SELECT,
    category: 'profile',
    options: [
      { label: "Freelance / Eenmanszaak", value: "Freelance" },
      { label: "Start-up / Scale-up (2-50)", value: "Small" },
      { label: "MKB (51-250)", value: "Medium" },
      { label: "Corporate / Enterprise (250+)", value: "Enterprise" }
    ]
  },

  // --- MODULE A: EXPOSURE (TAAKANALYSE) ---
  // Doel: Bepalen hoe vatbaar de rol is voor AI (Routine vs Complex)
  {
    id: 'exp_data',
    text: 'Welk percentage van uw tijd besteedt u aan het verwerken, analyseren of invoeren van gestructureerde data?',
    subText: 'Denk aan: Excel sheets, administratie, rapportages genereren, databases beheren.',
    type: QuestionType.SLIDER,
    category: 'exposure'
  },
  {
    id: 'exp_text',
    text: 'Hoe vaak schrijft u standaard teksten (e-mails, rapporten, notities) die een vast format volgen?',
    subText: 'Teksten waarbij de inhoud varieert, maar de structuur voorspelbaar is.',
    type: QuestionType.SCALE,
    category: 'exposure'
  },
  {
    id: 'exp_decision',
    text: 'Hoe complex is de besluitvorming in uw rol?',
    subText: '1 = Ik volg strikte regels/protocollen, 5 = Ik moet continu afwegingen maken in onzekere situaties',
    type: QuestionType.SCALE,
    category: 'exposure'
  },
  {
    id: 'exp_repetitive',
    text: 'Hoeveel van uw dagelijkse taken zijn repetitief en voorspelbaar?',
    subText: 'Taken die elke week op dezelfde manier worden uitgevoerd. (1 = Alles is uniek, 5 = Zeer repetitief)',
    type: QuestionType.SCALE,
    category: 'exposure'
  },
  {
    id: 'exp_creative',
    text: 'Hoe vaak moet u creatieve oplossingen bedenken voor ongestructureerde problemen?',
    subText: 'Problemen waarvoor geen standaard handleiding bestaat. (1 = Nooit, 5 = Dagelijks)',
    type: QuestionType.SCALE,
    category: 'exposure'
  },
  {
    id: 'exp_physical',
    text: 'Vereist uw werk fysieke interactie met de echte wereld?',
    subText: 'Bijv. bouwen, zorg aan bed, fysieke inspecties, machines bedienen. (1 = Volledig digitaal, 5 = Volledig fysiek)',
    type: QuestionType.SCALE,
    category: 'exposure'
  },
  {
    id: 'exp_human',
    text: 'Hoe belangrijk is diepgaande menselijke empathie en emotionele intelligentie in uw werk?',
    subText: 'Bijv. therapie, complex leiderschap, onderhandelen, conflictbemiddeling. (1 = Niet, 5 = Cruciaal)',
    type: QuestionType.SCALE,
    category: 'exposure'
  },

  // --- MODULE B: COGNITIVE STYLE (KAI PROXY) ---
  // Doel: Adaptor (structuur, verbeteren) vs Innovator (doorbreken, vernieuwen)
  {
    id: 'style_reaction',
    text: 'Er wordt onverwachts nieuwe software geïntroduceerd die uw workflow verandert. Wat is uw eerste instinct?',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik kijk eerst hoe ik dit stabiel kan inpassen in mijn huidige werkwijze om risico's te beperken.", value: -2 }, // Adaptor
      { label: "Ik duik er direct in en kijk welke oude processen ik hiermee volledig kan schrappen.", value: 2 }   // Innovator
    ]
  },
  {
    id: 'style_deadline',
    text: 'U werkt aan een project met strakke deadlines en er treedt een onvoorzien probleem op.',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik volg de vastgestelde procedures nauwgezet om fouten te voorkomen.", value: -2 }, // Adaptor
      { label: "Ik zoek een snelle, onorthodoxe 'workaround', ook als dat regels buigt.", value: 2 } // Innovator
    ]
  },
  {
    id: 'style_detail',
    text: 'Wat is uw natuurlijke focus tijdens projecten?',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik ben gericht op nauwkeurigheid, details en het perfectioneren van de uitvoering.", value: -1 }, // Adaptor
      { label: "Ik ben gericht op het grote plaatje en de visie; de details zoek ik later wel uit.", value: 1 } // Innovator
    ]
  },
  {
    id: 'style_consensus',
    text: 'Hoe functioneert u in groepsverband?',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik zorg voor cohesie en consensus; ik ben de lijm die het team bij elkaar houdt.", value: -1 }, // Adaptor
      { label: "Ik daag de status quo uit, zelfs als dat soms wrijving of discussie veroorzaakt.", value: 1 } // Innovator
    ]
  },
  {
    id: 'style_structure',
    text: 'Hoe verhoudt u zich tot regels en structuren?',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik functioneer het best binnen duidelijke kaders en heldere richtlijnen.", value: -2 }, // Adaptor
      { label: "Ik ervaar regels vaak als beperkend en zoek naar manieren om ze te verbeteren of omzeilen.", value: 2 } // Innovator
    ]
  },
  {
    id: 'style_ideas',
    text: 'Als u een probleem moet oplossen, wat is uw voorkeur?',
    type: QuestionType.SCENARIO,
    category: 'style',
    options: [
      { label: "Ik bedenk liever 3 oplossingen die gegarandeerd werken en praktisch haalbaar zijn.", value: -2 }, // Adaptor (Efficiency)
      { label: "Ik bedenk liever 20 wilde ideeën, waarvan er misschien maar 1 werkt maar die wel revolutionair is.", value: 2 } // Innovator (Originality)
    ]
  },

  // --- MODULE C: READINESS (SKILLS & TECH) ---
  {
    id: 'read_freq',
    text: 'Hoe frequent gebruikt u momenteel Generatieve AI tools (zoals ChatGPT, Gemini, Copilot)?',
    type: QuestionType.SELECT,
    category: 'readiness',
    options: [
      { label: "Nooit / Zelden", value: 0 },
      { label: "Maandelijks (voor experimentjes)", value: 30 },
      { label: "Wekelijks (voor specifieke taken)", value: 60 },
      { label: "Dagelijks (geïntegreerd in mijn werk)", value: 100 }
    ]
  },
  {
    id: 'read_prompt',
    text: 'Hoe schat u uw vaardigheid in "Prompt Engineering" in?',
    type: QuestionType.SELECT,
    category: 'readiness',
    options: [
      { label: "Ik weet niet wat dat is", value: 0 },
      { label: "Basis (ik stel simpele vragen)", value: 40 },
      { label: "Gevorderd (ik geef context en instructies)", value: 75 },
      { label: "Expert (ik gebruik Chain-of-Thought, formatting, etc.)", value: 100 }
    ]
  },
  {
    id: 'read_learning',
    text: 'Hoe makkelijk maakt u zich nieuwe digitale systemen eigen?',
    subText: '1 = Ik heb veel hulp nodig, 5 = Ik zoek het zelf uit en leer snel',
    type: QuestionType.SCALE,
    category: 'readiness'
  },
  {
    id: 'read_limits',
    text: 'Ik begrijp de beperkingen (zoals hallucinaties en bias) van de huidige AI-modellen goed.',
    subText: 'Kennis van wat AI NIET kan is net zo belangrijk als wat het WEL kan.',
    type: QuestionType.SCALE,
    category: 'readiness'
  },
  {
    id: 'read_ethics',
    text: 'Ik ben bekend met de privacy- en veiligheidsregels rondom het delen van bedrijfsdata met AI.',
    subText: 'Weet u wat wel/niet in een publiek model mag? (1 = Geen idee, 5 = Volledig op de hoogte)',
    type: QuestionType.SCALE,
    category: 'readiness'
  },

  // --- MODULE D: SENTIMENT (ANGST & VERTROUWEN) ---
  {
    id: 'sent_anxiety',
    text: 'Ik maak me zorgen dat AI mijn baan of vaardigheden overbodig zal maken.',
    type: QuestionType.SCALE, // High score = High Anxiety
    category: 'sentiment'
  },
  {
    id: 'sent_trust',
    text: 'Ik vertrouw erop dat ik de output van AI kritisch kan beoordelen en verbeteren.',
    type: QuestionType.SCALE, // High score = High Confidence
    category: 'sentiment'
  },
  {
    id: 'sent_excitement',
    text: 'Ik zie de opkomst van AI als een kans om mijn werk leuker en waardevoller te maken.',
    type: QuestionType.SCALE, // High score = High Engagement
    category: 'sentiment'
  },
  {
    id: 'sent_pressure',
    text: 'Ik voel druk vanuit de organisatie of markt om "iets met AI" te doen, zonder dat ik precies weet wat.',
    type: QuestionType.SCALE,
    category: 'sentiment'
  }
];

/**
 * A record of archetypes, keyed by their identifier.
 * @type {Record<string, Archetype>}
 */
export const ARCHETYPES: Record<string, Archetype> = {
  ARCHITECT: {
    name: "De AI-Architect",
    description: "Een visionair met hoge digitale vaardigheden en een innovatieve stijl. U ziet AI niet als tool, maar als fundering voor nieuwe processen.",
    color: "#3b82f6", // Blue
    risk: "Kan te snel gaan voor de organisatie, governance negeren en collega's 'kwijtraken' in hun enthousiasme.",
    opportunity: "Strategische leiding nemen, nieuwe use-cases ontwerpen en de 'art of the possible' tonen."
  },
  GUARDIAN: {
    name: "De Sceptische Bewaker",
    description: "De kwaliteitscontroleur. U begrijpt de technologie goed, maar uw adaptieve stijl zorgt voor een focus op veiligheid, precisie en integratie.",
    color: "#10b981", // Emerald
    risk: "Kan innovatie onbedoeld vertragen door te veel focus op risico's, compliance en 'hoe het hoort'.",
    opportunity: "Validatie van AI-output, opstellen van richtlijnen, borgen van ethiek en veiligheid."
  },
  EXPLORER: {
    name: "De Nieuwsgierige Verkenner",
    description: "De enthousiasteling die graag wil veranderen en experimenteren, maar nog de technische diepgang mist om het schaalbaar te maken.",
    color: "#f59e0b", // Amber
    risk: "Het blijft bij 'leuke experimentjes' zonder structurele business impact of veilige implementatie.",
    opportunity: "Cultureel ambassadeur die angst bij collega's wegneemt door laagdrempelige successen te delen."
  },
  TRADITIONALIST: {
    name: "De Pragmatische Traditionalist",
    description: "U hecht aan bewezen methoden en stabiliteit. U bent niet tegen AI, maar wilt eerst hard bewijs zien dat het uw huidige werk verbetert.",
    color: "#ef4444", // Red
    risk: "Risico op veroudering van vaardigheden als de marktstandaard sneller verschuift dan uw aanpassingsvermogen.",
    opportunity: "Focus op 'Quick Wins': AI inzetten voor de saaie, repetitieve taken zodat u zich kunt richten op uw vakmanschap."
  }
};

/**
 * An array of mock employee data.
 * @type {EmployeeData[]}
 */
export const MOCK_EMPLOYEES: EmployeeData[] = [
  { id: '1', name: 'Jan Jansen', department: 'Finance', kaiScore: -5, readinessScore: 80, archetype: 'De Sceptische Bewaker' },
  { id: '2', name: 'Sophie de Vries', department: 'Marketing', kaiScore: 8, readinessScore: 90, archetype: 'De AI-Architect' },
  { id: '3', name: 'Pieter Bakker', department: 'Operations', kaiScore: -2, readinessScore: 30, archetype: 'De Pragmatische Traditionalist' },
  { id: '4', name: 'Emma Visser', department: 'Sales', kaiScore: 6, readinessScore: 40, archetype: 'De Nieuwsgierige Verkenner' },
  { id: '5', name: 'Ahmet Yilmaz', department: 'IT', kaiScore: 4, readinessScore: 95, archetype: 'De AI-Architect' },
];