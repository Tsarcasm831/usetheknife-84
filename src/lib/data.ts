
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
  { title: "About Me", href: "/about" },
  { title: "About", href: "#about" },
  { title: "Media", href: "/media" },
  { title: "Game", href: "/game" }
];

export const mockDevLogs: DevLogEntry[] = [
  {
    id: "devlog-10",
    title: "Header rebranded",
    excerpt: "Logo now reads UseTheKnife.com.",
    content: "The navigation bar and login page have been updated to display UseTheKnife.com instead of Remnants Devlog.",
    date: "2025-06-08T12:00:00Z",
    author: "Web Team",
    tags: ["branding"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Branding"
    title: "DevLog now standalone",
    excerpt: "Navigation links to a dedicated page.",
    content:
      "The DevLog section has moved to its own route. The nav bar directs to /devlog and the home page no longer includes the log.",
    date: "2025-06-09T00:00:00Z",
    author: "Web Team",
    tags: ["website"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=DevLog+Page"
    title: "Community tab removed",
    excerpt: "Navigation no longer shows the Community button.",
    content: "The Community link has been dropped from the main menu. You can still keep up with us via the Media page.",
    date: "2025-06-09T00:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=Menu+Update"
    title: "Duplicate Media link removed",
    excerpt: "Cleaned up nav to show one Media option.",
    content: "The top navigation no longer includes two Media buttons. The redundant anchor link was removed for clarity.",
    date: "2025-06-09T00:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://via.placeholder.com/640x360/1E90FF/FFFFFF/?text=Media+Fix"
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
    title: "Roadmap to Release",
    excerpt: "We've published an updated roadmap detailing the final steps to 1.0.",
    content: "In this post we outline our remaining milestones including balancing passes, localization and console certification. Thank you for sticking with us on this journey!",
    date: "2025-04-20T11:15:00Z",
    author: "Project Lead",
    tags: ["roadmap", "development"],
    imageUrl: "https://via.placeholder.com/640x360/FF3A20/FFFFFF/?text=Roadmap"
  }
];
