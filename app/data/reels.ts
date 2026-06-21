export type Reel = {
  id: string;
  title: string;
  creator: string;
  views: string;
  duration: string;
  category: string;
  tags?: string[];
  description?: string;
  aspectRatio: number;
  archiveDate?: string;
  uploadDate?: string;
  source?: string;
  country?: string;
  verified?: boolean;
  avatarUrl?: string;        // creator profile picture
  // --- embed mode (paste x.com link) ---
  tweetUrl?: string;
  tweetId?: string;
  thumbnail?: string;
  // --- direct video mode ---
  videoUrl?: string;
};

export type Category = {
  id: string;
  label: string;
  count?: number;
};

/** Proxy twimg URLs through our server route to bypass hotlink protection */
export function resolveVideoSrc(url: string): string {
  const proxiedHosts = ["video.twimg.com", "pbs.twimg.com"];
  try {
    const host = new URL(url).hostname;
    if (proxiedHosts.includes(host)) {
      return `/api/video?url=${encodeURIComponent(url)}`;
    }
  } catch { /* not a valid URL — return as-is */ }
  return url;
}

/** Extract tweet ID from x.com, twitter.com, or any Nitter instance URL */
export function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com|xcancel\.com|nitter\.\w+)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

export const categories: Category[] = [
  { id: "all",         label: "All"          },
  { id: "trash",       label: "Trash"        },
  { id: "poverty",     label: "Poverty"      },
  { id: "disgusting",  label: "Disgusting"   },
  { id: "casteism",    label: "Casteism"     },
  { id: "food",        label: "Food"         },
  { id: "rural",       label: "Rural China"  },
  { id: "propaganda",  label: "Propaganda"   },
  { id: "civic",       label: "Civic Sense"  },
];

export const trendingTopics = [
  { id: "trending",  label: "Trending",      tag: "trend-trending"  },
  { id: "hukou",     label: "Hukou System",  tag: "trend-hukou"     },
  { id: "shang",     label: "Shang",         tag: "trend-shang"     },
  { id: "shi",       label: "Shi",           tag: "trend-shi"       },
  { id: "disgusting",label: "Disgusting",    tag: "trend-disgusting"},
  { id: "crises",    label: "Crises",        tag: "trend-crises"    },
  { id: "protest",   label: "Protest",       tag: "trend-protest"   },
];

export const reels: Reel[] = [
  {
    id: "seed-1",
    title: "Factory worker explains 996 work culture — 9am to 9pm, 6 days a week",
    creator: "chinaworker",
    views: "3.4M",
    duration: "0:47",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "factory",
    aspectRatio: 0.5625,
    archiveDate: "Jun 13, 2025",
    uploadDate: "Jun 10, 2025",
    source: "x.com",
    country: "China",
    verified: true,
    description: "A factory worker in Shenzhen describes working 72-hour weeks with no overtime pay.",
  },
  {
    id: "seed-2",
    title: "Empty apartments in Guiyang — ghost city footage goes viral",
    creator: "urbanwanderer_cn",
    views: "2.7M",
    duration: "1:02",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "housing",
    aspectRatio: 0.5625,
    archiveDate: "Jun 12, 2025",
    uploadDate: "Jun 09, 2025",
    source: "x.com",
    country: "China",
    verified: true,
    description: "Footage of entire residential districts standing empty in Guiyang.",
  },
  {
    id: "seed-3",
    title: "Rural life in Henan province — realities far from the official narrative",
    creator: "henan_daily",
    views: "1.8M",
    duration: "1:14",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "rural",
    aspectRatio: 1.7778,
    archiveDate: "Jun 11, 2025",
    uploadDate: "Jun 08, 2025",
    source: "x.com",
    country: "China",
    verified: false,
    description: "Life in rural Henan shows stark contrast to official economic statistics.",
  },
  {
    id: "seed-4",
    title: "University student talks about pressure — 'lying flat' movement explained",
    creator: "cn_student",
    views: "2.9K",
    duration: "1:50",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "education",
    aspectRatio: 0.5625,
    archiveDate: "Jun 10, 2025",
    uploadDate: "Jun 07, 2025",
    source: "x.com",
    country: "China",
    verified: true,
    description: "A university graduate explains why they chose to 'lie flat' rather than compete.",
  },
  {
    id: "seed-5",
    title: "She lost her job after speaking out — footage before account was deleted",
    creator: "realtime_cn",
    views: "5.1M",
    duration: "1:09",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "censorship",
    aspectRatio: 0.5625,
    archiveDate: "Jun 09, 2025",
    uploadDate: "Jun 06, 2025",
    source: "x.com",
    country: "China",
    verified: true,
    description: "A woman documents losing her job after posting a video critical of local officials.",
  },
  {
    id: "seed-6",
    title: "Street food vendor shut down by city management officers",
    creator: "street_cn",
    views: "890K",
    duration: "0:32",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "society",
    aspectRatio: 1.3333,
    archiveDate: "Jun 08, 2025",
    uploadDate: "Jun 05, 2025",
    source: "x.com",
    country: "China",
    verified: false,
  },
  {
    id: "seed-7",
    title: "Healthcare workers protest unpaid wages outside hospital",
    creator: "cn_health",
    views: "1.2M",
    duration: "2:14",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "healthcare",
    aspectRatio: 0.5625,
    archiveDate: "Jun 07, 2025",
    uploadDate: "Jun 04, 2025",
    source: "x.com",
    country: "China",
    verified: true,
  },
  {
    id: "seed-8",
    title: "Youth unemployment — graduates share their stories",
    creator: "youthvoice_cn",
    views: "3.8M",
    duration: "3:02",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    category: "youth",
    aspectRatio: 1.7778,
    archiveDate: "Jun 06, 2025",
    uploadDate: "Jun 03, 2025",
    source: "x.com",
    country: "China",
    verified: true,
  },
];
