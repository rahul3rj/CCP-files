// ── Knowledge page data ──────────────────────────────────────────────────────
// All static content for the five topics: Hukou, Shi·Nong·Gong·Shang, Tibet, Xinjiang

export type TopicId = "hukou" | "hierarchy" | "tibet" | "xinjiang";

export interface NodeData {
  id: string;
  label: string;
  x: number; // SVG coordinate 0-100
  y: number;
  title: string;
  summary: string;
  fact: string;
  relatedVideos: string[]; // archive video titles (display only)
}

export interface HukouNodeData extends NodeData {
  connections: string[]; // ids of connected nodes
}

export interface HierarchyLevel {
  id: string;
  label: string;
  subtitle: string;
  title: string;
  summary: string;
  fact: string;
  color: string;
  relatedVideos: string[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  summary: string;
  significance: "high" | "medium" | "low";
  fact: string;
  relatedVideos: string[];
  externalRef: string;
}

export interface GraphNode {
  id: string;
  label: string;
  isCentral?: boolean;
  x: number;
  y: number;
  connections: string[];
  summary: string;
}

// ── Hukou System ─────────────────────────────────────────────────────────────
export const hukouNodes: HukouNodeData[] = [
  {
    id: "center",
    label: "Hukou\nSystem",
    x: 50, y: 50,
    title: "Household Registration System",
    summary: "The Hukou (户口) system is China's internal passport framework, tying citizens' social entitlements to their place of birth registration. Introduced in 1958, it created two parallel classes: urban and rural residents — each with vastly different rights.",
    fact: "Over 300 million rural migrants live in Chinese cities without full urban rights — the largest internal migration in human history.",
    connections: ["education","healthcare","employment","housing","migration","urban","rural","policy"],
    relatedVideos: ["Factory Workers Denied School Access","Migrant Children Left Behind","Healthcare Inequality Exposed"],
  },
  {
    id: "education",
    label: "Education",
    x: 50, y: 14,
    title: "Education Access & Hukou",
    summary: "Children of rural migrants living in cities often cannot attend public schools locally or take the national Gaokao exam where they live. They must return to their registered hometown — sometimes a province away — to sit for college entrance.",
    fact: "An estimated 69 million 'left-behind children' live in rural areas while their parents work in cities, separated by Hukou.",
    connections: ["center","policy"],
    relatedVideos: ["Left-Behind Children Documentary","Gaokao Inequality Report"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    x: 79, y: 24,
    title: "Healthcare Tied to Registration",
    summary: "Public health insurance, subsidized care, and hospital reimbursement rates are linked to a citizen's Hukou location. Migrants seeking medical care in their adopted city often pay out-of-pocket rates 3–5× higher than locals.",
    fact: "Migrant workers are 40% less likely to seek medical care than urban residents due to cost barriers created by Hukou.",
    connections: ["center","policy"],
    relatedVideos: ["Migrant Healthcare Crisis","Factory Injury With No Coverage"],
  },
  {
    id: "employment",
    label: "Employment",
    x: 86, y: 50,
    title: "Employment & Labor Rights",
    summary: "Without urban Hukou, migrants cannot access civil service positions, many state-enterprise jobs, or union protections designed for registered city residents. Labor contracts are routinely ignored with little legal recourse.",
    fact: "Rural Hukou holders earn on average 40% less than urban counterparts for identical work in Chinese cities.",
    connections: ["center","housing","migration"],
    relatedVideos: ["Factory Wages Withheld","Union Rights Denied","Labor Protest Suppressed"],
  },
  {
    id: "housing",
    label: "Housing",
    x: 79, y: 76,
    title: "Housing Rights & Property",
    summary: "Purchasing subsidized public housing, qualifying for affordable housing programs, and accessing mortgage terms for city apartments typically require local urban Hukou. Migrants are excluded from the wealth-building mechanisms available to registered residents.",
    fact: "In Beijing, applicants for social housing must prove 5+ years of continuous Hukou registration in the city.",
    connections: ["center","employment"],
    relatedVideos: ["Migrant Camp Conditions","Urban Housing Denied"],
  },
  {
    id: "migration",
    label: "Migration",
    x: 50, y: 86,
    title: "Internal Migration Controls",
    summary: "Hukou effectively functions as an internal visa system. Moving from a rural area to a city does not grant the rights of that city. Converting Hukou status is tightly controlled, expensive, and often tied to education credentials or property purchase — barriers most migrants cannot clear.",
    fact: "Only ~35% of China's 900 million rural Hukou holders live in areas classified as urban — but most retain rural registration status.",
    connections: ["center","urban","rural","employment"],
    relatedVideos: ["Hukou Conversion Process Exposed","Rural to Urban: The Impossible Move"],
  },
  {
    id: "urban",
    label: "Urban\nHukou",
    x: 21, y: 76,
    title: "Urban Hukou Privileges",
    summary: "Holders of urban Hukou enjoy access to top schools, city hospitals, social security, affordable housing queues, and state jobs. Urban registration functions as a form of inherited wealth — it concentrates privilege intergenerationally and is extremely difficult for outsiders to acquire.",
    fact: "An urban Hukou in Shanghai or Beijing can add the equivalent of $50,000–$100,000 USD in lifetime access to subsidized services.",
    connections: ["center","migration","policy"],
    relatedVideos: ["Two Tiers of Citizenship","Shanghai Registration Rules"],
  },
  {
    id: "rural",
    label: "Rural\nHukou",
    x: 14, y: 50,
    title: "Rural Hukou & Land Rights",
    summary: "Rural Hukou holders retain collective land-use rights in their home village — a safety net that urban holders lack. However, this land cannot be sold and offers little economic mobility. When rural residents move to cities, they fall into a no-man's-land: no urban rights, and land back home that is economically inaccessible.",
    fact: "Rural collective land rights cannot be transferred to the free market — trapping approximately $2 trillion in rural land value.",
    connections: ["center","migration","policy"],
    relatedVideos: ["Land Rights in Rural China","Village Land Seized"],
  },
  {
    id: "policy",
    label: "Government\nPolicy",
    x: 21, y: 24,
    title: "State Policy & Reform Attempts",
    summary: "The CCP has announced Hukou reform repeatedly since 2014. Small cities have loosened registration. But Beijing, Shanghai, and Guangzhou — where most migrants actually want to live — maintain rigid controls. Reform in theory, preservation of privilege in practice.",
    fact: "China's 2014 Hukou reform plan promised universal urbanization by 2020. In 2024, over 200 million people still lack rights in the city they live in.",
    connections: ["center","education","healthcare","urban","rural"],
    relatedVideos: ["Reform Announcement vs Reality","CCP Urbanization Policy Analysis"],
  },
];

// ── Four Occupations Hierarchy ───────────────────────────────────────────────
export const hierarchyLevels: HierarchyLevel[] = [
  {
    id: "shi",
    label: "士 Shì",
    subtitle: "Scholar-Officials",
    title: "Shì — The Scholar-Official Class",
    summary: "The highest social class in imperial China. Scholars who passed the imperial civil service examinations (科举, Kējǔ) gained access to government office, land, and prestige. Their authority derived from Confucian learning. In modern China, the echo of Shì lives in the Communist Party's technocratic elite — educated officials who govern by virtue of examination and party credentials.",
    fact: "The imperial examination system ran for 1,300 years (605–1905 CE), longer than any other meritocratic institution in history.",
    color: "rgba(200,16,46,0.9)",
    relatedVideos: ["Gaokao: China's New Imperial Exam","Party Elite Education","CCP Cadre Selection"],
  },
  {
    id: "nong",
    label: "農 Nóng",
    subtitle: "Peasant Farmers",
    title: "Nóng — The Farming Class",
    summary: "Second in the Confucian hierarchy despite being the largest group, peasant farmers were valued as the producers of food — the basis of civilization. Yet they were taxed heavily, subject to corvée labor, and frequently displaced by elite land consolidation. Today, 600+ million rural Hukou holders are Nóng's direct descendants — essential to the economy, yet structurally excluded from its benefits.",
    fact: "At peak imperial dynasty periods, farmers represented 85–90% of China's population while producing nearly all state revenue.",
    color: "rgba(180,130,40,0.9)",
    relatedVideos: ["Left-Behind Farmers","Agricultural Policy Failures","Rural Poverty Documentary"],
  },
  {
    id: "gong",
    label: "工 Gōng",
    subtitle: "Artisans & Craftsmen",
    title: "Gōng — The Artisan Class",
    summary: "Skilled craftsmen — potters, weavers, smiths, builders — occupied the third tier. They were valued as producers of durable goods but seen as lesser than farmers because they depended on Nóng's raw materials. In China's modern factory era, Gōng maps directly onto the migrant factory worker: essential, skilled, yet disposable — the backbone of the 'world's factory' with minimal labor protections.",
    fact: "China's manufacturing workforce of ~400 million is the largest in human history — the contemporary Gōng class.",
    color: "rgba(100,140,200,0.9)",
    relatedVideos: ["Factory Conditions Exposed","Assembly Line Life","Manufacturing Worker Rights"],
  },
  {
    id: "shang",
    label: "商 Shāng",
    subtitle: "Merchants & Traders",
    title: "Shāng — The Merchant Class",
    summary: "Merchants occupied the lowest rung of the Confucian social order — despite often being the wealthiest. Confucian philosophy viewed commerce as parasitic rather than productive: merchants profited from others' labor without creating value. The CCP inherited this ambivalence. Private entrepreneurs — from Jack Ma to property developers — have been repeatedly humiliated, regulated into submission, or made to 'voluntarily donate' wealth when they grew too prominent.",
    fact: "Between 2020–2023, the CCP wiped out over $1 trillion in market value from Chinese tech and private sector companies through regulatory crackdowns.",
    color: "rgba(160,100,220,0.9)",
    relatedVideos: ["Jack Ma Disappearance","Tech Crackdown Analysis","Entrepreneur Detention"],
  },
];

// ── Tibet Timeline ────────────────────────────────────────────────────────────
export const tibetEvents: TimelineEvent[] = [
  {
    id: "t1", year: "1913",
    title: "Tibet Declares Independence",
    summary: "Following the collapse of the Qing Dynasty, the 13th Dalai Lama issues a proclamation of independence, describing a separation between Tibetan and Chinese territories.",
    significance: "high",
    fact: "Tibet functioned as a de facto independent state for nearly four decades — issuing its own currency, passports, and maintaining a small army.",
    relatedVideos: [],
    externalRef: "Proclamation of the 13th Dalai Lama, 1913",
  },
  {
    id: "t2", year: "1950",
    title: "PLA Invasion of Tibet",
    summary: "The People's Liberation Army crosses into eastern Tibet (Chamdo). The Tibetan army, numbering ~10,000, is overwhelmed within weeks. Beijing calls it a 'peaceful liberation.'",
    significance: "high",
    fact: "The Battle of Chamdo lasted 6 days. Tibet's entire eastern military force was captured or destroyed.",
    relatedVideos: [],
    externalRef: "Battle of Chamdo, October 1950",
  },
  {
    id: "t3", year: "1951",
    title: "Seventeen Point Agreement",
    summary: "Under military duress, Tibetan representatives sign the 'Agreement on Measures for the Peaceful Liberation of Tibet.' Tibet is incorporated into the PRC. The Dalai Lama's government is nominally preserved.",
    significance: "high",
    fact: "Tibet's delegation signed under coercion — the official seals used were fabricated by Beijing because the delegation did not bring authorized seals.",
    relatedVideos: [],
    externalRef: "Seventeen Point Agreement, May 23, 1951",
  },
  {
    id: "t4", year: "1959",
    title: "Tibetan Uprising & Dalai Lama's Exile",
    summary: "Mass protests in Lhasa against Chinese rule. The uprising is crushed by the PLA. The 14th Dalai Lama flees to India, establishing the Tibetan government-in-exile in Dharamsala. Over 87,000 Tibetans are estimated killed.",
    significance: "high",
    fact: "The CIA covertly supported Tibetan resistance fighters from 1957–1969 as part of Cold War operations against China.",
    relatedVideos: ["1959 Uprising Archive Footage","Dalai Lama Exile Story"],
    externalRef: "1959 Tibetan Uprising; CIA Tibet Task Force",
  },
  {
    id: "t5", year: "1966–76",
    title: "Cultural Revolution Devastation",
    summary: "Red Guards destroy over 6,000 monasteries and religious sites across Tibet. Monks are imprisoned, tortured, or killed. Religious practice is banned. The physical infrastructure of Tibetan Buddhism is nearly obliterated.",
    significance: "high",
    fact: "Of ~6,000 monasteries in Tibet before 1950, fewer than 10 remained standing by 1979.",
    relatedVideos: ["Cultural Revolution in Tibet","Monastery Destruction Evidence"],
    externalRef: "Panchen Lama's 70,000 Character Petition, 1962",
  },
  {
    id: "t6", year: "1989",
    title: "Martial Law in Lhasa",
    summary: "Protests marking the 30th anniversary of the 1959 uprising erupt in Lhasa. The PLA imposes martial law — the first time since the Cultural Revolution. Party Secretary Hu Jintao oversees the crackdown, a role later noted in his political rise.",
    significance: "medium",
    fact: "Martial law in Tibet lasted until May 1990 — 13 months — while martial law in Beijing after Tiananmen lasted only about 7 months.",
    relatedVideos: ["1989 Lhasa Protests"],
    externalRef: "Tibet Information Network Reports, 1989–90",
  },
  {
    id: "t7", year: "1995",
    title: "Panchen Lama Dispute",
    summary: "The Dalai Lama identifies 6-year-old Gedhun Choekyi Nyima as the 11th Panchen Lama. Beijing abducts the boy within days and appoints its own candidate. Nyima becomes one of the world's longest-held political prisoners.",
    significance: "high",
    fact: "Gedhun Choekyi Nyima was 6 years old when abducted. He has not been seen publicly since 1995. He would be in his mid-30s today.",
    relatedVideos: ["Panchen Lama Case","World's Youngest Political Prisoner"],
    externalRef: "UN Committee on the Rights of the Child reports",
  },
  {
    id: "t8", year: "2008",
    title: "Pre-Olympics Protests & Crackdown",
    summary: "Protests marking 49 years of Chinese rule erupt across Tibet and Tibetan diaspora communities worldwide. The PLA and PAP deploy in force. Beijing blames the Dalai Lama for 'splitting the motherland.'",
    significance: "high",
    fact: "The 2008 protests spread to Tibetan communities in 15 Chinese provinces — the widest geographic spread since 1959.",
    relatedVideos: ["2008 Protests Footage","Olympic Torch Relay Disruptions"],
    externalRef: "Human Rights Watch, 'Crackdown in Tibet,' 2008",
  },
  {
    id: "t9", year: "2009–present",
    title: "Wave of Self-Immolations",
    summary: "Beginning in 2009, over 150 Tibetans have set themselves on fire in protest against Chinese rule. Most call for the Dalai Lama's return. The Chinese government has criminalized any expression of support for self-immolators.",
    significance: "high",
    fact: "China passed legislation in 2012 making it a crime to 'instigate, coerce, entice or induce' self-immolations — effectively criminalizing mourning.",
    relatedVideos: ["Self-Immolation Protests","Tibetan Resistance 2012"],
    externalRef: "International Campaign for Tibet tracking database",
  },
  {
    id: "t10", year: "2016–present",
    title: "Sinicization Campaign",
    summary: "Under Xi Jinping, a systematic 'Sinicization' campaign intensifies: Tibetan-language schools closed or converted to Mandarin-only instruction, monasteries under direct party management, colonial-style 'villages' built in nomadic areas, mass surveillance expanded.",
    significance: "high",
    fact: "Tibet's surveillance density now rivals Xinjiang — facial recognition checkpoints, QR-coded residency tracking, and mandatory political education for monks.",
    relatedVideos: ["Sinicization Policy Exposed","Tibetan Monastery Under CCP Management","Language Erasure in Tibet"],
    externalRef: "Human Rights Watch, Tibetan Centre for Human Rights reports",
  },
];

// ── Xinjiang Timeline ─────────────────────────────────────────────────────────
export const xinjiangEvents: TimelineEvent[] = [
  {
    id: "x1", year: "1949",
    title: "PLA Takes Control of Xinjiang",
    summary: "The People's Liberation Army enters Xinjiang (East Turkestan), ending the short-lived East Turkestan Republic. Mass Han migration campaigns begin over subsequent decades, reshaping the region's demographics.",
    significance: "high",
    fact: "In 1949, Han Chinese made up ~6% of Xinjiang's population. Today they constitute approximately 40%.",
    relatedVideos: [],
    externalRef: "PRC incorporation of Xinjiang, October 1949",
  },
  {
    id: "x2", year: "1997",
    title: "Ghulja Massacre",
    summary: "Security forces kill at least 30–100 peaceful Uyghur demonstrators in Ghulja (Yining) on February 5–6, followed by mass arrests. The crackdown triggers the first wave of systematic 'Strike Hard' anti-separatism campaigns.",
    significance: "high",
    fact: "Eyewitness accounts describe protesters including children shot in the street. Official death toll: 9. Independent estimates: 100+.",
    relatedVideos: ["Ghulja 1997 Testimonies"],
    externalRef: "Human Rights Watch, 'China's Crackdown in Xinjiang,' 1997",
  },
  {
    id: "x3", year: "2009",
    title: "Ürümqi Riots & Aftermath",
    summary: "Inter-ethnic clashes in Ürümqi kill nearly 200 people. The Chinese government blames Uyghur separatists. Internet and phone communications are cut across Xinjiang for 10 months — the longest blackout in internet history up to that point.",
    significance: "high",
    fact: "Xinjiang's internet blackout lasted 312 days — longer than any government-imposed shutdown recorded at the time.",
    relatedVideos: ["2009 Ürümqi Evidence","Communications Blackout Report"],
    externalRef: "Amnesty International, July 2009 reports",
  },
  {
    id: "x4", year: "2013–14",
    title: "'People's War on Terror' Launched",
    summary: "Following knife attacks in Kunming and Ürümqi, Xi Jinping launches an intensified security campaign. CCTV cameras, biometric checkpoints, and predictive policing systems begin mass deployment across Xinjiang.",
    significance: "high",
    fact: "By 2018, Xinjiang had 1 surveillance camera for every 2.6 people — the highest density in the world at the time.",
    relatedVideos: ["Xinjiang Surveillance Grid","Biometric Collection Exposed"],
    externalRef: "Australian Strategic Policy Institute surveillance reports",
  },
  {
    id: "x5", year: "2017",
    title: "Mass Detention System Expands",
    summary: "Construction of 'Vocational Education and Training Centers' accelerates dramatically. Leaked procurement documents show security specifications: guard towers, razor wire, isolation cells, behavioral tracking. The global media begins reporting on a mass incarceration system.",
    significance: "high",
    fact: "Satellite imagery tracked the construction of over 380 facilities across Xinjiang between 2017–2019.",
    relatedVideos: ["Camp Construction Evidence","Satellite Images Analysis"],
    externalRef: "ASPI 'Uyghurs for Sale,' 2020; BuzzFeed News satellite analysis",
  },
  {
    id: "x6", year: "2017–18",
    title: "First Survivor Testimonies Emerge",
    summary: "Uyghurs who escaped to Kazakhstan, Europe, and North America begin speaking publicly. Testimonies describe systematic political indoctrination, prohibition of prayer, forced consumption of pork and alcohol, sexual violence, and torture.",
    significance: "high",
    fact: "UN experts estimate 1 million+ Uyghurs have been held in detention — the largest mass incarceration of a religious minority since World War II.",
    relatedVideos: ["Survivor Testimony: Tursunay Ziawudun","Camp Survivor Interviews","Detention Evidence Archive"],
    externalRef: "UN Committee on the Elimination of Racial Discrimination, 2018",
  },
  {
    id: "x7", year: "2019",
    title: "China Cables & Xinjiang Papers Leaked",
    summary: "The ICIJ publishes internal Chinese government documents detailing the operational rules of the detention facilities: point systems, family separation as leverage, prohibition on remorse about past religious practice, and instructions to prevent escapes.",
    significance: "high",
    fact: "The leaked documents use the phrase 'transformation through education' 22 times — exposing the stated purpose as ideological conversion, not vocational training.",
    relatedVideos: ["China Cables Analysis","ICIJ Documents Explained"],
    externalRef: "ICIJ China Cables project, November 2019",
  },
  {
    id: "x8", year: "2020",
    title: "Forced Labor Supply Chain Evidence",
    summary: "ASPI publishes 'Uyghurs for Sale' documenting how Uyghurs are transferred from Xinjiang to factories across 9 provinces, supplying major global brands. Over 80 major corporations are linked to the supply chain.",
    significance: "high",
    fact: "An estimated 80,000+ Uyghurs were transferred to work in factories outside Xinjiang between 2017–2019 under conditions matching ILO definitions of forced labor.",
    relatedVideos: ["Supply Chain Exposure","Forced Labor Factory Report"],
    externalRef: "ASPI 'Uyghurs for Sale,' March 2020",
  },
  {
    id: "x9", year: "2021–22",
    title: "Xinjiang Police Files",
    summary: "A hacker leaks 10GB of classified Xinjiang police data to academic Adrian Zenz. Files include internal shoot-to-kill orders, photos of detained elderly Uyghurs, and operational communications — providing direct evidence from inside the system.",
    significance: "high",
    fact: "Internal communications in the leaked files include an order from Xi Jinping to 'show absolutely no mercy' in the crackdown.",
    relatedVideos: ["Police Files Analysis","Evidence of Shoot-to-Kill Orders"],
    externalRef: "Xinjiang Police Files, leaked May 2022; BBC, Deutsche Welle verification",
  },
  {
    id: "x10", year: "2022–present",
    title: "Ongoing Suppression & Diaspora",
    summary: "An estimated 3 million Uyghurs live in diaspora. Families inside Xinjiang are routinely used as leverage against activists abroad — relatives detained or threatened when diaspora members speak publicly. The detention system has partially evolved into community surveillance and compulsory political education.",
    significance: "high",
    fact: "Diaspora Uyghurs in 18 countries have documented Chinese security services threatening their relatives inside Xinjiang in retaliation for activism.",
    relatedVideos: ["Transnational Repression Report","Diaspora Under Threat","Family Separation Stories"],
    externalRef: "Human Rights Watch 'Transnational Repression' reports, 2021–2024",
  },
];

// ── Knowledge Graphs ──────────────────────────────────────────────────────────
export const knowledgeGraphs: Record<TopicId, GraphNode[]> = {
  hukou: [
    { id: "kh-c", label: "Hukou System", isCentral: true, x: 50, y: 50, connections: ["kh-1","kh-2","kh-3","kh-4","kh-5","kh-6"], summary: "Core registration system tying rights to place of birth" },
    { id: "kh-1", label: "Class Stratification", x: 20, y: 18, connections: ["kh-c","kh-6"], summary: "Creates a legally-enforced two-tier citizen class system" },
    { id: "kh-2", label: "Internal Migration", x: 80, y: 18, connections: ["kh-c","kh-3"], summary: "Controls movement of 300M+ internal migrants" },
    { id: "kh-3", label: "Labor Supply", x: 88, y: 55, connections: ["kh-c","kh-2","kh-4"], summary: "Cheap, rightless labor pool for China's manufacturing" },
    { id: "kh-4", label: "Urban Inequality", x: 75, y: 82, connections: ["kh-c","kh-3","kh-5"], summary: "Cities built by workers who cannot legally live in them" },
    { id: "kh-5", label: "Left-Behind Children", x: 30, y: 82, connections: ["kh-c","kh-4","kh-6"], summary: "69M children separated from parents by the system" },
    { id: "kh-6", label: "Social Control", x: 12, y: 55, connections: ["kh-c","kh-1","kh-5"], summary: "Population legibility and control at scale" },
  ],
  hierarchy: [
    { id: "kf-c", label: "Four Occupations", isCentral: true, x: 50, y: 50, connections: ["kf-1","kf-2","kf-3","kf-4","kf-5"], summary: "Confucian social hierarchy ordering all of Chinese society" },
    { id: "kf-1", label: "Confucianism", x: 20, y: 20, connections: ["kf-c","kf-2"], summary: "Philosophical framework that created and justified the hierarchy" },
    { id: "kf-2", label: "Imperial Exams", x: 75, y: 20, connections: ["kf-c","kf-1","kf-3"], summary: "Meritocratic gateway to the elite Shì class" },
    { id: "kf-3", label: "CCP Parallel", x: 85, y: 58, connections: ["kf-c","kf-2","kf-4"], summary: "Modern party structure mirrors ancient hierarchy" },
    { id: "kf-4", label: "Private Sector", x: 65, y: 85, connections: ["kf-c","kf-3","kf-5"], summary: "Merchants (Shāng) remain suspect — liable to state seizure" },
    { id: "kf-5", label: "Peasant Class", x: 20, y: 75, connections: ["kf-c","kf-4","kf-1"], summary: "Modern Nóng class: Hukou-bound rural population" },
  ],
  tibet: [
    { id: "kt-c", label: "Tibet", isCentral: true, x: 50, y: 50, connections: ["kt-1","kt-2","kt-3","kt-4","kt-5","kt-6"], summary: "Formerly independent nation incorporated by force in 1950" },
    { id: "kt-1", label: "Buddhism", x: 18, y: 20, connections: ["kt-c","kt-2"], summary: "Tibetan Buddhism: central identity under systematic erasure" },
    { id: "kt-2", label: "Dalai Lama", x: 75, y: 18, connections: ["kt-c","kt-1","kt-3"], summary: "Exiled spiritual leader; successor controlled by Beijing" },
    { id: "kt-3", label: "Sinicization", x: 85, y: 52, connections: ["kt-c","kt-2","kt-4"], summary: "State campaign to replace Tibetan culture with Han norms" },
    { id: "kt-4", label: "Self-Immolations", x: 72, y: 80, connections: ["kt-c","kt-3"], summary: "150+ acts of protest; mourning criminalized by Beijing" },
    { id: "kt-5", label: "Surveillance Grid", x: 28, y: 80, connections: ["kt-c","kt-4","kt-6"], summary: "Near-Xinjiang-level density of cameras and checkpoints" },
    { id: "kt-6", label: "Language Erasure", x: 14, y: 52, connections: ["kt-c","kt-5","kt-1"], summary: "Tibetan-language schools systematically replaced with Mandarin" },
  ],
  xinjiang: [
    { id: "kx-c", label: "Xinjiang", isCentral: true, x: 50, y: 50, connections: ["kx-1","kx-2","kx-3","kx-4","kx-5","kx-6"], summary: "Home of 12M Uyghurs; site of largest documented mass detention since WWII" },
    { id: "kx-1", label: "Detention Camps", x: 20, y: 18, connections: ["kx-c","kx-2"], summary: "380+ facilities holding 1M+ Uyghurs in 'vocational training'" },
    { id: "kx-2", label: "Forced Labor", x: 78, y: 18, connections: ["kx-c","kx-1","kx-3"], summary: "80,000+ workers transferred to factories across China" },
    { id: "kx-3", label: "Supply Chains", x: 86, y: 52, connections: ["kx-c","kx-2","kx-4"], summary: "80+ global corporations linked to Uyghur forced labor" },
    { id: "kx-4", label: "Surveillance State", x: 72, y: 80, connections: ["kx-c","kx-3","kx-5"], summary: "1 camera per 2.6 people; DNA collection; facial recognition" },
    { id: "kx-5", label: "Cultural Erasure", x: 28, y: 80, connections: ["kx-c","kx-4","kx-6"], summary: "Mosques demolished, Arabic script banned, names changed" },
    { id: "kx-6", label: "Transnational Repression", x: 14, y: 52, connections: ["kx-c","kx-5","kx-1"], summary: "Diaspora silenced via threats against relatives inside Xinjiang" },
  ],
};

// ── Topic metadata ────────────────────────────────────────────────────────────
export const topics: { id: TopicId; label: string; subtitle: string; intro: string }[] = [
  {
    id: "hukou",
    label: "Hukou System",
    subtitle: "China's Internal Passport",
    intro: "The household registration system that creates two classes of Chinese citizens — and controls the lives of 300 million internal migrants.",
  },
  {
    id: "hierarchy",
    label: "Shì · Nóng · Gōng · Shāng",
    subtitle: "The Four Occupations similar to Varna system of ancient India",
    intro: "The Confucian social hierarchy that ordered imperial China for 2,000 years — and whose ghost still structures Chinese society today.",
  },
  {
    id: "tibet",
    label: "Tibet",
    subtitle: "Occupation, Resistance & Erasure",
    intro: "A cinematic record of Tibet's transformation: from contested independence through military occupation to the systematic erasure of a civilization.",
  },
  {
    id: "xinjiang",
    label: "Xinjiang",
    subtitle: "The Evidence Record",
    intro: "The documented history of China's campaign against the Uyghur people — built from survivor testimony, leaked documents, and satellite imagery.",
  },
];
