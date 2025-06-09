
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
  { title: "Media", href: "/media" },
  { title: "Game", href: "/game" }
];

export const mockDevLogs: DevLogEntry[] = [
  {
    id: "devlog-24",
    title: "Form types split into files",
    excerpt: "Interfaces now live under src/types for clarity.",
    content:
      "Auth, Profile and context logic import dedicated interfaces from src/types. Any usages have been removed for stronger typing.",
    date: "2025-06-23T00:00:00Z",
    author: "Web Team",
    tags: ["typescript", "cleanup"],
    imageUrl: "https://robohash.org/devlog-24?size=640x360"
  },
  {
    id: "devlog-23",
    title: "Typed auth and profile forms",
    excerpt: "Added interfaces and removed any types.",
    content:
      "Auth and profile components now use explicit interfaces for form data and user profiles, improving type safety.",
    date: "2025-06-22T00:00:00Z",
    author: "Web Team",
    tags: ["typescript", "refactor"],
    imageUrl: "https://robohash.org/devlog-23?size=640x360"
  },
  {
    id: "devlog-22",
    title: "styles.css newline added",
    excerpt: "File now ends with a newline character.",
    content:
      "public/game/css/styles.css now ends with a newline to follow POSIX conventions.",
    date: "2025-06-21T00:00:00Z",
    author: "Web Team",
    tags: ["maintenance"],
    imageUrl: "https://robohash.org/devlog-22?size=640x360"
  },
  {
    id: "devlog-21",
    title: "Camera images get alt text",
    excerpt: "Popup and Street View images now include alt text.",
    content:
      "The camera module sets alt='Captured photo' on generated image tags so screen readers describe them correctly.",
    date: "2025-06-20T00:00:00Z",
    author: "Web Team",
    tags: ["accessibility", "camera"],
    imageUrl: "https://robohash.org/devlog-21?size=640x360"
  },
  {
    id: "devlog-20",
    title: "Media page uses official Facebook",
    excerpt: "Link now points to facebook.com/lordtsarcasm.",
    content: "The Media page previously linked to Facebook's homepage. It now directs to the official page at facebook.com/lordtsarcasm.",
    date: "2025-06-19T00:00:00Z",
    author: "Web Team",
    tags: ["media", "link"],
    imageUrl: "https://robohash.org/devlog-20?size=640x360"
  },
  {
    id: "devlog-19",
    title: "RoboHash integration improved",
    excerpt: "Image generation now works after a clean clone.",
    content:
      "This follow-up ensures RoboHash URLs generate correctly from a fresh repository pull. The feature no longer depends on Supabase.",
    date: "2025-06-18T00:00:00Z",
    author: "Web Team",
    tags: ["devlog", "fix"],
    imageUrl: "https://robohash.org/devlog-19?size=640x360"
  },
  {
    id: "devlog-18",
    title: "RoboHash devlog images",
    excerpt: "Entries now use RoboHash for quick images.",
    content:
      "The DevLog image generator no longer relies on Supabase. It builds a RoboHash URL from the title and excerpt so images appear instantly without setup.",
    date: "2025-06-17T00:00:00Z",
    author: "Web Team",
    tags: ["devlog", "images"],
    imageUrl: "https://robohash.org/devlog-18?size=640x360"
  },
  {
    id: "devlog-17",
    title: "Main page rebranded",
    excerpt: "Home page now shows usetheknife.com branding.",
    content:
      "The navigation bar, hero section and footer all reference usetheknife.com as the new site name.",
    date: "2025-06-16T00:00:00Z",
    author: "Web Team",
    tags: ["branding"],
    imageUrl: "https://via.placeholder.com/640x360/2DD4BF/FFFFFF/?text=usetheknife"
  },
  {

    id: "devlog-16",
    title: "Game sign-in fixed",
    excerpt: "Auth modal now waits for components to load.",
    content:
      "The sign-in button on the game page failed because the modal script loaded before its HTML. The initializer now retries until elements exist, so the login dialog opens reliably.",
    date: "2025-06-15T00:00:00Z",
    author: "Web Team",
    tags: ["bugfix", "ui"],
    imageUrl: "https://via.placeholder.com/640x360/FFCC00/FFFFFF/?text=Sign+In"
  },
  {
    id: "devlog-15",
    title: "AI image generator setup clarified",
    excerpt: "Supabase function now checks for Hugging Face token.",
    content:
      "The generate-devlog-image function validates the HUGGING_FACE_ACCESS_TOKEN secret and returns an error when missing. The README explains how to configure the token.",
    date: "2025-06-14T00:00:00Z",
    author: "Web Team",
    tags: ["ai", "docs"],
    imageUrl: "https://via.placeholder.com/640x360/FFCC00/FFFFFF/?text=AI+Fix"
  },
  {
    id: "devlog-14",
    title: "About tab removed",
    excerpt: "Navigation no longer links to a dead anchor.",
    content:
      "The About link pointing to #about has been removed from the navigation bar since it had no destination.",
    date: "2025-06-13T00:00:00Z",
    author: "Web Team",
    tags: ["ui", "cleanup"],
    imageUrl: "https://via.placeholder.com/640x360/FFCC00/FFFFFF/?text=Nav+Update"
  },
  {
    id: "devlog-13",
    title: "Navigation tabs trimmed",
    excerpt: "Community and empty Media links removed.",
    content:
      "The navigation bar no longer shows the placeholder Media tab or the old Community link. This keeps the menu focused on active pages.",
    date: "2025-06-12T00:00:00Z",
    author: "Web Team",
    tags: ["ui", "cleanup"],
    imageUrl: "https://via.placeholder.com/640x360/FFCC00/FFFFFF/?text=Nav+Clean"
  },
  {
    id: "devlog-12",
    title: "Google Maps key via env",
    excerpt: "Map viewer reads VITE_GOOGLE_MAPS_KEY.",
    content: "index.html now loads Google Maps using VITE_GOOGLE_MAPS_KEY. See the new README for setup.",
    date: "2025-06-11T00:00:00Z",
    author: "Web Team",
    tags: ["docs", "game"],
    imageUrl: "https://via.placeholder.com/640x360/4285F4/FFFFFF/?text=Map+Setup"
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
