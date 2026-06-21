export type Post = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string; // supports basic markdown-style paragraphs split by \n\n
  author: string;
  authorRole: string;
  publishedAt: string; // display string
  readTime: string;
  cover: string;
  tags: string[];
};

export const posts: Post[] = [
  {
    id: "1",
    slug: "great-firewall-broken",
    category: "Politics",
    title: "The Great Chinese Firewall Is Broken — And They Know It",
    excerpt:
      "For decades the Chinese Communist Party built the most sophisticated internet censorship apparatus in human history. Today, millions of its own citizens route around it daily.",
    body: `For decades the Chinese Communist Party constructed the most sophisticated censorship apparatus in human history. The Golden Shield — nicknamed the Great Firewall by Western observers — was designed to be impenetrable. Today, it leaks.

The numbers are difficult to verify from the outside, but leaked internal reports and interviews with defectors suggest that VPN usage inside mainland China has crossed into the tens of millions of regular users. A system built to control information has become a daily inconvenience rather than an absolute barrier.

The cracks started appearing in 2014, widened through the pandemic years, and by 2023 had become structural. The CCP's response has been to accelerate enforcement while simultaneously moderating economic penalties — a contradiction that reveals the core dilemma: crackdown too hard and you chill the tech economy that the party depends on; hold back and you acknowledge the wall doesn't work.

What leaks through matters as much as the volume. Footage of protests. Testimonies from Uyghur detention camps. The Peng Shuai affair. Each of these episodes revealed not just a failure of censorship, but a failure of the party's ability to manufacture reality at the speed the modern internet demands.

The CCP has responded with a dual strategy — tighten control at the infrastructure layer while flooding domestic platforms with approved content, making the effort of going around the wall feel unnecessary to most users. It works for the majority. But the minority who do look outside are no longer ignorable.

What happens when a government builds its legitimacy on information control, and that control becomes technically impossible? That question is no longer hypothetical. It is the defining political problem of the Chinese state in the 2020s.`,
    author: "Wei Jingsheng Archive",
    authorRole: "Political Analysis",
    publishedAt: "June 12, 2025",
    readTime: "6 min read",
    cover: "https://picsum.photos/seed/china-firewall-city/1200/600",
    tags: ["China", "Censorship", "Internet Freedom", "CCP"],
  },
  {
    id: "2",
    slug: "xinjiang-testimonies",
    category: "Human Rights",
    title: "Voices From the Camps: Testimonies That Beijing Tried to Erase",
    excerpt:
      "Survivor accounts, leaked documents, and satellite imagery have built an undeniable record of what is happening in Xinjiang — despite years of denial.",
    body: `The first testimony surfaced in 2018. A Uyghur woman, speaking from Kazakhstan, described being held for months in a facility she was told was a vocational training centre. She was not trained for any vocation. She was made to sing loyalty songs and recite party slogans until she could do so without hesitation.

Her account was dismissed by Beijing as fabricated. Then a second account emerged. Then dozens. Then hundreds. Then the Xinjiang Papers — internal government documents leaked to the International Consortium of Investigative Journalists — confirmed what the testimonies had described in granular operational detail.

The documents revealed a system designed for what Chinese officials called "transformation through education." In practice, this meant the systematic dismantling of cultural identity, religious practice, and family structure at industrial scale.

Satellite imagery tracked the construction of new facilities across the region even as officials denied their existence. Researchers at the Australian Strategic Policy Institute mapped over 380 suspected detention sites using commercial satellite data.

Beijing's position shifted over time. First: the camps do not exist. Then: the camps exist but are voluntary. Then: the camps exist, are compulsory, but are for counterterrorism. Each shift came only after the previous position became untenable.

The international response has been fragmented. Several Western governments have used the word genocide. Most have not, citing legal thresholds. Corporations that source materials from the region have faced boycotts and counter-boycotts simultaneously, caught between Western consumers and Chinese state pressure.

What the testimonies established, regardless of what governments choose to call it, is that a deliberate, state-directed campaign to eliminate a distinct cultural and religious identity was conducted at scale. That record now exists permanently, distributed across archives, court filings, and the memories of thousands of survivors.`,
    author: "Xinjiang Documentation Project",
    authorRole: "Investigative Report",
    publishedAt: "May 28, 2025",
    readTime: "8 min read",
    cover: "https://picsum.photos/seed/xinjiang-desert-camp/1200/600",
    tags: ["Xinjiang", "Uyghurs", "Human Rights", "Documentation"],
  },
  {
    id: "3",
    slug: "taiwan-strait-2025",
    category: "Geopolitics",
    title: "Taiwan Strait: The Slow Escalation Nobody Wants to Name",
    excerpt:
      "Military incursions into Taiwan's air defence zone have become so routine that they barely register. That normalisation is itself the strategy.",
    body: `In January 2021, Taiwan's Ministry of National Defence began publishing daily reports of PLA aircraft entering its air defence identification zone. The international press covered the first incidents extensively. By mid-year, they had become a minor footnote. By 2022, they were routine.

This is not coincidental. The normalisation of incursions is itself a strategic objective — a slow recalibration of what counts as provocation, what counts as escalation, and ultimately, what counts as aggression.

Military analysts call this "gray zone operations": actions that accumulate strategic advantage while staying below the threshold that would trigger a formal international response. The threshold is never defined, which is precisely the point.

Taiwan's air force has scrambled fighters hundreds of times annually to intercept or shadow PLA aircraft. The cost — in pilot hours, fuel, maintenance cycles, and hardware wear — is significant. It is designed to be. Exhaustion is a form of pressure.

Simultaneously, Chinese naval vessels have conducted exercises that progressively rehearse the logistics of a blockade. Not a blockade — exercises. The distinction collapses when the exercises are indistinguishable from the real thing.

The United States response has been to increase arms sales to Taiwan, conduct freedom-of-navigation operations in the Taiwan Strait, and issue increasingly precise but carefully non-committal statements about defending Taiwan. The ambiguity is deliberate and is itself a form of deterrence.

What none of the public statements acknowledge is that all parties — Taipei, Washington, Beijing — are operating on the assumption that the current situation is unsustainable, and that the question is not whether it changes, but when and under whose terms.`,
    author: "Strategic Asia Review",
    authorRole: "Security Analysis",
    publishedAt: "June 3, 2025",
    readTime: "7 min read",
    cover: "https://picsum.photos/seed/taiwan-strait-ocean/1200/600",
    tags: ["Taiwan", "PLA", "Geopolitics", "South China Sea"],
  },
  {
    id: "4",
    slug: "social-credit-reality",
    category: "Technology",
    title: "China's Social Credit System: What It Actually Is vs What You Think",
    excerpt:
      "Western media created a myth of a unified surveillance score. The reality is more fragmented, more mundane, and in some ways more insidious.",
    body: `The image that circulated in Western media circa 2019 was vivid and terrifying: every Chinese citizen assigned a numerical score, updated in real time by an omniscient surveillance apparatus, governing access to trains, schools, and employment. It was compelling. It was also substantially wrong.

The actual Social Credit System is a collection of distinct, poorly integrated local pilots, industry-specific blacklists, and court enforcement databases. There is no unified national score. The fragmentation is not a bug in the Western narrative — it is the feature that made the narrative possible.

What does exist is significant. A corporate credit system rates businesses on tax compliance, product safety violations, and regulatory adherence — not unlike bond ratings in the West, but with government enforcement teeth. Court-enforced blacklists prevent debtors who ignore civil judgments from buying plane and train tickets. Local pilots in cities like Rongcheng experiment with citizen scoring, though these remain geographically isolated.

The conflation happened for several reasons. Chinese government documents did use the language of a unified system — aspirationally, not descriptively. Western journalists, understandably, took aspirational planning documents as operational reality.

None of this means the surveillance infrastructure is not real. China has built the world's most extensive facial recognition network. Predictive policing systems operate in Xinjiang and elsewhere. The technology exists. What does not exist — yet — is the integration layer that would make the Black Mirror scenario operational at national scale.

The distinction matters because conflating the myth with the reality makes both easier to dismiss. The actual system, accurately described, is disturbing enough.`,
    author: "Digital Authoritarianism Lab",
    authorRole: "Technology Policy",
    publishedAt: "April 17, 2025",
    readTime: "9 min read",
    cover: "https://picsum.photos/seed/surveillance-camera-city/1200/600",
    tags: ["Surveillance", "Social Credit", "Technology", "Privacy"],
  },
  {
    id: "5",
    slug: "hong-kong-after-nsl",
    category: "Politics",
    title: "Hong Kong Five Years After the National Security Law",
    excerpt:
      "The city that once balanced two systems now operates under one. What was lost, what remains, and what the diaspora is building outside.",
    body: `The National Security Law was passed on June 30, 2020. Within a year, every major opposition politician had been arrested, charged, or fled. The largest independent newspaper, Apple Daily, was forced to close after its assets were frozen under the law. Stand News followed. The legal profession began a quiet exodus.

Five years later, the transformation is structural. The Legislative Council is filled exclusively with candidates who passed a "patriots only" vetting process. Civil society organisations that once gave Hong Kong its distinctive character — from trade unions to student bodies to human rights groups — have largely dissolved, some voluntarily, anticipating consequences, others after direct pressure.

What remains is the infrastructure: the banks, the port, the airport, the legal system for commercial disputes. Beijing has been careful to preserve the economic machinery while dismantling the political one. Whether those can be separated in the long run is the question that international businesses operating from Hong Kong are quietly computing.

The diaspora is significant. Estimates range from 150,000 to over 200,000 Hong Kongers who have relocated to the United Kingdom alone under the British National Overseas visa scheme, plus substantial flows to Canada, Australia, and Taiwan.

They have not been passive. In cities across the UK, Canada, and Australia, diaspora Hong Kongers have built newspapers, radio stations, and advocacy organisations. The information ecosystem that was dismantled inside the city has been rebuilt, in fragments, outside it.

Whether any of it matters for the future of Hong Kong itself is uncertain. What is not uncertain is that a city of seven million people, which had developed a distinct identity over a century and a half, was fundamentally remade in the space of five years. That is worth recording precisely, because the speed of it is the point.`,
    author: "Hong Kong Watch",
    authorRole: "Civil Society Report",
    publishedAt: "June 30, 2025",
    readTime: "10 min read",
    cover: "https://picsum.photos/seed/hong-kong-skyline-night/1200/600",
    tags: ["Hong Kong", "NSL", "Democracy", "Diaspora"],
  },
  {
    id: "6",
    slug: "chinese-economy-crack",
    category: "Economy",
    title: "The Cracks in the Chinese Economic Miracle",
    excerpt:
      "Youth unemployment above 20%, a property sector collapse that wiped trillions in wealth, and a demographic cliff. The model that powered four decades of growth is exhausted.",
    body: `For four decades, the Chinese economic model was simple in outline: mobilise cheap labour, attract foreign capital and technology, build infrastructure at scale, export manufactured goods. It worked beyond any historical precedent. Eight hundred million people lifted out of poverty is not a propaganda claim — it is a documented fact.

The model is now exhausted, and the transition to whatever replaces it is not going smoothly.

Youth unemployment reached an official rate of 21.3% in June 2023, at which point the National Bureau of Statistics stopped publishing the figure. The unofficial estimates are higher. A generation with unprecedented educational attainment is discovering that the economy does not have positions that match their expectations or qualifications. The phrase "lying flat" — a deliberate withdrawal from the competitive labour market — became the defining cultural expression of the moment.

The property sector, which at its peak accounted for roughly 30% of GDP including related industries, began its collapse with Evergrande's default in 2021. The implosion has been managed in slow motion — authorities have prevented a single catastrophic crash at the cost of a prolonged contraction. Tens of millions of pre-sold apartments remain unbuilt. Household wealth, which in China is disproportionately stored in property, has contracted accordingly.

Demographics underlie everything. The one-child policy, in effect from 1980 to 2015, produced a population structure that is now inverting. The workforce is shrinking. The elderly population is expanding. The pension system was not designed for this ratio.

Xi Jinping's response has been to reassert party control over the private sector, which has had predictable effects on investment and innovation. The technology sector crackdown that began in 2020 erased hundreds of billions in market capitalisation and sent a clear signal about the limits of private ambition.

None of this means China is about to collapse. It means the next thirty years will not look like the last thirty, and that the political system built on the promise of perpetual growth will face a test it was not designed to pass.`,
    author: "Macroeconomic Intelligence",
    authorRole: "Economic Analysis",
    publishedAt: "May 10, 2025",
    readTime: "11 min read",
    cover: "https://picsum.photos/seed/china-economy-factory/1200/600",
    tags: ["Economy", "China", "Property", "Demographics"],
  },
];
