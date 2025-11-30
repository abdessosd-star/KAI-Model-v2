
import { Question, QuestionType, Archetype, EmployeeData } from './types';

export const QUICK_SCAN_IDS = [
  'prof_name',
  'prof_email',
  'prof_role',
  'prof_industry',
  'exp_data',
  'exp_decision',
  'exp_creative',
  'style_reaction',
  'style_deadline',
  'read_freq',
  'read_learning',
  'sent_anxiety'
];

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
    id: 'prof_email',
    text: 'Wat is uw zakelijk e-mailadres?',
    subText: 'We sturen uw persoonlijke rapport en roadmap hiernaartoe.',
    type: QuestionType.TEXT,
    category: 'profile'
  },
  {
    id: 'prof_org_code',
    text: 'Heeft u een organisatiecode?',
    subText: 'Vul deze hier in als u door uw werkgever bent uitgenodigd (bijv. DEMO2025). Anders kunt u dit leeg laten.',
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

// --- 10 EXTENDED ARCHETYPES ---
export const ARCHETYPES: Record<string, Archetype> = {
  // --- INNOVATORS (Style Score > 3) ---
  VISIONARY_ARCHITECT: {
    name: "De Visionary Architect",
    description: "Een strategische pionier die niet alleen de technologie begrijpt, maar ook de organisatie-brede impact ziet. U bent de motor achter transformatie.",
    color: "#3b82f6", // Blue
    risk: "Kan te ver voor de troepen uitlopen en de aansluiting met de operationele realiteit verliezen.",
    opportunity: "Leid strategische pilots en ontwikkel de lange-termijn visie voor AI-integratie.",
    behaviors: ["Denkt in systemen", "Experimenteert continu", "Negeert details voor het grote plaatje"],
    strengths: ["Strategisch inzicht", "Hoge digitale geletterdheid", "Durf en visie"],
    challenges: ["Ongeduld met trage processen", "Onderschatting van implementatierisico's"],
    managementTips: ["Geef mandaat voor R&D", "Koppel aan een 'System Guardian' voor balans", "Vraag om concrete ROI cases"],
    transformationDifficulty: 2,
    generalActionPlan: "Focus op governance en schaalbaarheid. Uw uitdaging is niet de tech, maar de mensen mee krijgen."
  },
  STRATEGIC_INTEGRATOR: {
    name: "De Strategic Integrator",
    description: "De brug tussen wild idee en werkende oplossing. U heeft de innovatieve mindset maar combineert dit met voldoende pragmatisme om dingen gedaan te krijgen.",
    color: "#6366f1", // Indigo
    risk: "Kan vastlopen in het politieke spel tussen vernieuwing en behoud.",
    opportunity: "Vertaal de visie van de Architect naar werkbare roadmaps voor afdelingen.",
    behaviors: ["Zoekt naar 'fit'", "Verbindt mensen en technologie", "Vertaalt jargon naar business"],
    strengths: ["Stakeholder management", "Procesinzicht", "Adaptieve intelligentie"],
    challenges: ["Wordt soms gezien als 'te technisch' door business en 'te vaag' door IT"],
    managementTips: ["Zet in als projectleider voor AI-transformatie", "Geef ruimte voor cross-functioneel werk"],
    transformationDifficulty: 3,
    generalActionPlan: "Identificeer high-impact use cases en begeleid teams bij de eerste adoptie."
  },
  CREATIVE_EXPERIMENTER: {
    name: "De Creative Experimenter",
    description: "Een enthousiaste ontdekker die AI ziet als een speeltuin. U genereert veel ideeën, maar mist soms de technische structuur om ze te borgen.",
    color: "#8b5cf6", // Violet
    risk: "Het blijft bij leuke demo's en 'shadow IT' zonder dat het veilig of schaalbaar is.",
    opportunity: "Fungeer als inspirator; laat collega's zien wat er allemaal mogelijk is ('Wow-factor').",
    behaviors: ["Probeert elke nieuwe tool", "Deelt enthousiast screenshots", "Negeert security regels soms"],
    strengths: ["Creativiteit", "Enthousiasme", "Snelle adoptie"],
    challenges: ["Gebrek aan focus", "Weinig oog voor compliance/security"],
    managementTips: ["Faciliteer een veilige 'sandbox' omgeving", "Stel duidelijke kaders (wat mag wel/niet)"],
    transformationDifficulty: 4,
    generalActionPlan: "Leer de basis van data-security en focus op één tool die u echt meester wordt."
  },

  // --- ADAPTORS (Style Score < -3) ---
  SYSTEM_GUARDIAN: {
    name: "De System Guardian",
    description: "De kwaliteitsbewaker. U omarmt technologie, maar alleen als deze veilig, bewezen en perfect geïntegreerd is. U voorkomt chaos.",
    color: "#10b981", // Emerald
    risk: "Kan innovatie vertragen door 'ja, maar...' houding en focus op wat er mis kan gaan.",
    opportunity: "Word de eigenaar van AI Governance, validatie en kwaliteitscontrole.",
    behaviors: ["Checkt de regels", "Test uitvoerig op fouten", "Documenteert processen"],
    strengths: ["Nauwkeurigheid", "Risicobeheersing", "Processtabiliteit"],
    challenges: ["Weerstand tegen snelle, ongeteste veranderingen"],
    managementTips: ["Betrek vroeg bij het proces (niet pas aan het eind)", "Geef de rol van 'Safety Officer'"],
    transformationDifficulty: 3,
    generalActionPlan: "Ontwikkel frameworks voor validatie van AI-output. Uw kritische blik is goud waard."
  },
  PROCESS_OPTIMIZER: {
    name: "De Process Optimizer",
    description: "U zoekt naar efficiëntie binnen de bestaande kaders. AI is voor u geen revolutie, maar een betere schroevendraaier om het huidige werk sneller te doen.",
    color: "#14b8a6", // Teal
    risk: "Optimaliseert processen die misschien wel volledig overbodig worden (sub-optimalisatie).",
    opportunity: "Implementeer 'Quick Wins' in administratieve en repetitieve taken.",
    behaviors: ["Zoekt tijdwinst", "Automatiseert spreadsheets", "Houdt van stappenplannen"],
    strengths: ["Efficiëntie", "Implementatiekracht", "Betrouwbaarheid"],
    challenges: ["Moeite met 'Out of the box' denken", "Mist soms de strategische verschuiving"],
    managementTips: ["Geef concrete tools voor automatisering", "Laat zien hoeveel tijd het bespaart"],
    transformationDifficulty: 4,
    generalActionPlan: "Kies één repetitief proces en automatiseer dit volledig. Deel de tijdwinst."
  },
  PRACTICAL_TRADITIONALIST: {
    name: "De Practical Traditionalist",
    description: "U waardeert vakmanschap en bewezen methoden. U bent niet tegen verandering, maar wilt eerst hard bewijs zien dat het werkt voordat u investeert.",
    color: "#f59e0b", // Amber
    risk: "Kan achteropraken als de marktstandaard verschuift. Risico op veroudering van skills.",
    opportunity: "Gebruik AI om de 'saaie' taken weg te nemen zodat u zich kunt richten op uw expertise.",
    behaviors: ["Wacht de kat uit de boom", "Vraagt om bewijs", "Leunt op ervaring"],
    strengths: ["Diepe domeinkennis", "Stabiliteit", "Realiteitszin"],
    challenges: ["Lage digitale veranderbereidheid", "Scepticisme"],
    managementTips: ["Geef geen theoretische training, maar praktische demo's", "Koppel aan een Integrator"],
    transformationDifficulty: 7,
    generalActionPlan: "Begin klein. Gebruik AI niet om uw werk te vervangen, maar om u voor te bereiden (bijv. research)."
  },

  // --- BRIDGE / MIDDLE (Style Score -3 to +3) ---
  PRAGMATIC_BRIDGE: {
    name: "De Pragmatic Bridge",
    description: "De ideale teamspeler. U begrijpt zowel de snelle innovators als de voorzichtige adaptors. U bent digitaal vaardig en brengt rust in de transitie.",
    color: "#0ea5e9", // Sky Blue
    risk: "Kan in de knel komen door te proberen iedereen tevreden te houden.",
    opportunity: "Fungeer als tolk en bemiddelaar tussen IT en de werkvloer.",
    behaviors: ["Luistert naar beide kanten", "Zoekt het compromis", "Implementeert rustig"],
    strengths: ["Diplomatie", "Teamcohesie", "Balans"],
    challenges: ["Cijfert zichzelf soms weg", "Mist soms uitgesproken visie"],
    managementTips: ["Zet in als teamleider of coach", "Gebruik om weerstand te verlagen"],
    transformationDifficulty: 3,
    generalActionPlan: "Faciliteer kennissessies waar u innovatie vertaalt naar praktische stappen voor het team."
  },
  COLLABORATIVE_PIVOT: {
    name: "De Collaborative Pivot",
    description: "U bent een sociaal dier dat meegaat met de groep. Als het team AI gebruikt, doet u mee. U heeft wat begeleiding nodig, maar staat open voor groei.",
    color: "#84cc16", // Lime
    risk: "Afhankelijk van de groepscultuur; in een conservatief team beweegt u niet mee.",
    opportunity: "Creëer een 'kopgroep' waar deze persoon bij kan aansluiten om meegetrokken te worden.",
    behaviors: ["Vraagt hulp", "Leert samen", "Volgt de leider"],
    strengths: ["Samenwerking", "Leerbaarheid", "Loyaliteit"],
    challenges: ["Gebrek aan eigen initiatief", "Technische onzekerheid"],
    managementTips: ["Koppel aan een buddy", "Beloon groepssucces"],
    transformationDifficulty: 5,
    generalActionPlan: "Zoek een AI-buddy in uw team en doe samen een eerste project."
  },
  HESITANT_OBSERVER: {
    name: "De Hesitant Observer",
    description: "U kijkt de kat uit de boom. U heeft nog weinig ervaring met AI en vindt het allemaal wat spannend. U heeft veiligheid en tijd nodig.",
    color: "#fbbf24", // Amber-Yellow
    risk: "Stille weerstand ('Quiet quitting' op innovatie). Kan zich terugtrekken.",
    opportunity: "Met de juiste, veilige begeleiding kan dit een zeer loyale gebruiker worden.",
    behaviors: ["Stelt vragen over nut", "Is stil tijdens meetings", "Vermijdt nieuwe tools"],
    strengths: ["Reflectie", "Voorzichtigheid"],
    challenges: ["Angst voor het onbekende", "Lage digital skills"],
    managementTips: ["Geen druk opleggen", "Focus op 'What's in it for me?'", "Simpele tools eerst"],
    transformationDifficulty: 8,
    generalActionPlan: "Volg eerst een basiscursus 'AI Awareness' om mythes te ontkrachten voordat u tools gaat gebruiken."
  },

  // --- SPECIAL CASE (High Anxiety) ---
  RESISTANT_SKEPTIC: {
    name: "De Resistant Skeptic",
    description: "U voelt zich bedreigd door AI. U ziet het vooral als een risico voor uw baan of kwaliteit. Uw weerstand komt voort uit zorg, niet uit onwil.",
    color: "#ef4444", // Red
    risk: "Actieve weerstand, negatieve sfeer in het team, sabotage van implementatie.",
    opportunity: "Als de angst wordt weggenomen, kan deze persoon de scherpste criticus (en dus kwaliteitsbewaker) worden.",
    behaviors: ["Uit openlijk kritiek", "Weigert deelname", "Benadrukt fouten van AI"],
    strengths: ["Kritisch denken", "Bescherming van waarden"],
    challenges: ["Hoge AI-angst", "Vastgeroeste patronen"],
    managementTips: ["Luister naar de zorgen (erkenning)", "Garandeer baanzekerheid/rol", "Laat zien dat AI 'augmentatie' is, geen vervanging"],
    transformationDifficulty: 10,
    generalActionPlan: "Focus op psychologische veiligheid. Ga in gesprek over uw rol en hoe uw menselijke kwaliteiten uniek blijven."
  }
};
