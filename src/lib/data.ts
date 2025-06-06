
import { DevLogEntry, User, NavItem } from "@/types";

export const mockUser: User = {
  id: "user-1",
  username: "GameTester123",
  avatar: "https://i.pravatar.cc/150?img=3",
  lastLogin: "2025-05-15T10:30:00Z",
  role: "member"
};

export const mockNavItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "DevLog", href: "/devlog" },
  { title: "About", href: "/about" },
  { title: "Media", href: "/media" },
  { title: "Community", href: "#community" },
  { title: "Game", href: "/game" }
];

export const mockDevLogs: DevLogEntry[] = [
  {
    id: "devlog-12",
    title: "Map viewer documented",
    excerpt: "Added README for the Leaflet demo.",
    content:
      "public/game now includes instructions for running the standalone map. The guide covers features like the 3D terrain toggle and notes the Google Maps API key placeholder.",
    date: "2025-06-11T00:00:00Z",
    author: "Web Team",
    tags: ["documentation"],
    imageUrl: "https://via.placeholder.com/640x360/007ACC/FFFFFF/?text=Map+README"
    title: "Navigation links deduplicated",
    excerpt: "Mock nav items no longer repeat About or Media.",
    content: "The nav data was cleaned up so only one About and one Media link remain, making the menu easier to manage.",
    date: "2025-06-11T00:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Nav+Update"
  },
  {
    id: "devlog-11",
    title: "Roadmap Overhauled",
    excerpt: "Updated roadmap lays out a two-year plan to launch 1.0.",
    content:
      "We've revised the roadmap with realistic milestones through mid-2027. Key goals include engine upgrades, expanded missions and mod tools before a full release on PC and consoles.",
    date: "2025-06-10T00:00:00Z",
    author: "Web Team",
    tags: ["roadmap", "update"],
    imageUrl: "https://via.placeholder.com/640x360/FF3A20/FFFFFF/?text=Roadmap+Update"
  },
  {
    id: "devlog-10",
    title: "DevLog now standalone",
    excerpt: "Navigation links to a dedicated page.",
    content:
      "The DevLog section has moved to its own route. The nav bar directs to /devlog and the home page no longer includes the log.",
    date: "2025-06-09T00:00:00Z",
    author: "Web Team",
    tags: ["website"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=DevLog+Page"
  },
  {
    id: "devlog-9",
    title: "README overhauled",
    excerpt: "Documentation now explains the project and local setup.",
    content: "The README has been rewritten to describe the devlog portal, development commands and key technologies.",
    date: "2025-06-08T00:00:00Z",
    author: "Web Team",
    tags: ["documentation"],
    imageUrl: "https://via.placeholder.com/640x360/007ACC/FFFFFF/?text=Docs+Update"
  },
  {
    id: "devlog-8",
    title: "Navigation Cleanup",
    excerpt: "Removed extra links from the top navigation bar.",
    content: "We trimmed the nav bar by dropping the Community button and the duplicate DevLog link so the interface is less cluttered.",
    date: "2025-06-08T09:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Navigation"
  },
  {
    id: "devlog-7",
    title: "Media page now live",
    excerpt: "Visit our new page for links to Facebook, Spotify and YouTube.",
    content: "We've launched a dedicated Media page collecting our online channels. Check it out to follow us on Facebook, Spotify and YouTube.",
    date: "2025-06-07T12:00:00Z",
    author: "Web Team",
    tags: ["website", "community"],
    imageUrl: "https://via.placeholder.com/640x360/1E90FF/FFFFFF/?text=Media+Page"
  },
  {
    id: "devlog-6",
    title: "Trailer Button Updated",
    excerpt: "The homepage trailer button now says Coming Soon.",
    content: "We've renamed the 'Watch Trailer' button to 'Coming Soon' as we finalize footage for the next trailer.",
    date: "2025-06-07T10:00:00Z",
    author: "Web Team",
    tags: ["ui", "update"],
    imageUrl: "https://via.placeholder.com/640x360/FFA500/FFFFFF/?text=Coming+Soon"
  },
  {
    id: "devlog-5",
    title: "Updated site branding",
    excerpt: "Renamed landing page title to usetheknife.com.",
    content: "The main index now references the new domain in the title and Open Graph meta tags.",
    date: "2025-06-07T00:00:00Z",
    author: "Web Team",
    tags: ["meta", "branding"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Branding"
  },
  {
    id: "devlog-4",
    title: "UI Fixes and Asset Updates",
    excerpt: "Improved team and loadout tabs. Fixed broken images in the mission modal.",
    content: "This patch cleans up the Prepare Event interface. Available units are easier to read, loadout slots are clearer, and briefing/map images now load correctly.",
    date: "2025-06-06T10:00:00Z",
    author: "Web Team",
    tags: ["ui", "bugfix"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=UI+Fixes"
  },
  {
    id: "devlog-3",
    title: "Roadmap Updated",
    excerpt: "Our plan now targets a feature-complete release in mid-2027.",
    content:
      "This post details a realistic two-year roadmap. We'll focus on engine upgrades, co-op mode, localization and mod tooling before launching on PC and consoles in 2027. Thanks for your patience!",
    date: "2025-06-10T00:00:00Z",
    author: "Project Lead",
    tags: ["roadmap", "development"],
    imageUrl: "https://via.placeholder.com/640x360/FF3A20/FFFFFF/?text=Roadmap"
  }
];
