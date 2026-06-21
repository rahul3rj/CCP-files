# CCP Files — The Great Firewall of China Archive

> A public, open archive of short videos documenting the reality behind China's censorship apparatus and the CCP's information control machine. Search. Research. Investigate.

---

## Overview

**CCP Files** is a Next.js web application that serves as a searchable, filterable video archive. Videos are sourced from X (Twitter) and submitted by the public. The site is designed to be resilient against censorship and takedown attempts, with a mirror-site system built into the navigation.

---

## Features

- **Archive Feed** — Masonry grid of archived short videos, shuffled randomly on every page load to ensure equal visibility for all content
- **Shorts Player** — Vertical swipe-style player for watching archived videos back-to-back
- **World Map** — Interactive Black Marble satellite map visualising where archived videos were filmed
- **Knowledge Hub** — Curated articles and context about China's censorship system
- **Video Submission** — Password-gated upload flow for submitting new videos to the archive
- **Mirror Sites** — In-navbar panel listing backup proxy sites in case of takedown
- **Live Status Bar** — Bottom bar showing real-time video count, country count, and archive timestamp
- **Advanced Filters** — Filter by category, trending tags, verified status, and date range
- **Sort Options** — Sort by latest added, most viewed, or shortest duration
- **Full-text Search** — Search across titles, creator names, and tags

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS + Tailwind CSS v4 |
| Icons | [Phosphor Icons](https://phosphoricons.com) |
| Maps | [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) |
| Animations | [Motion](https://motion.dev) |
| Runtime | React 19 |

---

## Project Structure

```
ccp_files/
├── app/
│   ├── api/
│   │   ├── archive/        # GET/POST archived reels
│   │   ├── auth/           # Password gate authentication
│   │   ├── oembed/         # oEmbed metadata fetching
│   │   ├── resolve-tweet/  # Twitter/X URL resolver
│   │   └── video/          # Video proxy / metadata
│   ├── components/
│   │   ├── Feed.tsx         # Archive home page (hero + grid)
│   │   ├── Navbar.tsx       # Top nav + mobile bottom nav + Mirror Sites
│   │   ├── MasonryGrid.tsx  # Responsive masonry video grid
│   │   ├── VideoCard.tsx    # Individual video card
│   │   ├── ShortsPlayer.tsx # Vertical shorts-style player
│   │   ├── MapView.tsx      # World map with video markers
│   │   ├── Upload.tsx       # Video submission form
│   │   ├── SubmitGate.tsx   # Password gate modal
│   │   ├── AskAI.tsx        # AI Q&A interface
│   │   └── knowledge/       # Knowledge hub articles
│   ├── data/
│   │   └── reels.ts         # Categories, trending topics, Reel type
│   ├── globals.css          # Design system, tokens, animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # App shell + status bar
├── public/                  # Static assets (logo, header image, etc.)
├── package.json
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ccp_files

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Add any required API keys or secrets here
SUBMIT_PASSWORD=your_submission_password
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## Mirror Sites

If the main site is taken down due to censorship pressure, backup mirrors are listed in the **Mirror Sites** panel in the navbar. Update the `MIRROR_SITES` array in [`app/components/Navbar.tsx`](./app/components/Navbar.tsx) with your real proxy URLs before deployment.

---

## Contributing

Submissions are accepted through the in-app **Submit** flow (password protected). To add a video to the archive:

1. Click **Submit** in the navbar
2. Enter the submission password
3. Paste an X (Twitter) video URL
4. Fill in metadata (title, category, country, etc.)
5. Submit — the video appears in the archive immediately

---

## Deployment

The easiest deployment target is [Vercel](https://vercel.com):

```bash
npx vercel
```

For censorship-resilient hosting, consider deploying to multiple providers simultaneously and keeping the mirror URLs updated in the navbar.

---

## License

This project is open-source. The archived content belongs to the original creators and is preserved for research, journalism, and public interest purposes.

---

*"Those who cannot remember the past are condemned to repeat it." — George Santayana*
