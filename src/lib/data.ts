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
    id: "devlog-44",
    title: "Terra Incognita overlay fixed",
    excerpt: "Script loads without trailing whitespace errors.",
    content:
      "public/game/js/terraIncognita.js now trims stray spaces and adds a final newline so browsers load it cleanly.",
    date: "2025-07-12T00:00:00Z",
    author: "Web Team",
    tags: ["bugfix", "map"],
    imageUrl: "https://robohash.org/devlog-44?size=640x360"
  },
  {
    id: "devlog-43",
    title: "Home assets fetch script",
    excerpt: "Models download via npm run fetch-home-assets.",
    content:
      "A new Node script reads downloadableassets.txt to pull home page models and then regenerates assets/manifest.json.",
    date: "2025-07-11T00:00:00Z",
    author: "Web Team",
    tags: ["assets", "script"],
    imageUrl: "https://robohash.org/devlog-43?size=640x360"
  },
  {
    id: "devlog-42",
    title: "Map script fallback added",
    excerpt: "Google Maps loads even without env key.",
    content:
      "public/game/index.html now injects the Maps script via JavaScript. If VITE_GOOGLE_MAPS_KEY isn't set, it loads without a key to avoid a URI error. The home page no longer preloads a missing video.",
    date: "2025-07-10T00:00:00Z",
    author: "Web Team",
    tags: ["bugfix", "maps"],
    imageUrl: "https://robohash.org/devlog-42?size=640x360"
  },
  {
    id: "devlog-41",
    title: "Focus outlines added",
    excerpt: "Interactive elements highlight on keyboard focus.",
    content:
      "Buttons and links across the React components now use Tailwind focus classes so keyboard users can easily see which item is active.",
    date: "2025-07-09T00:00:00Z",
    author: "Web Team",
    tags: ["accessibility"],
    imageUrl: "https://robohash.org/devlog-41?size=640x360"
  },
  {
    id: "devlog-40",
    title: "Index script removed",
    excerpt: "Cleaned up stray console output.",
    content:
      "public/home/index.html no longer logs to the console when loaded, reducing noise during development.",
    date: "2025-07-08T00:00:00Z",
    author: "Web Team",
    tags: ["cleanup", "logging"],
    imageUrl: "https://robohash.org/devlog-40?size=640x360"
  },
  {
    id: "devlog-39",
    title: "Strict mode enabled",
    excerpt: "TypeScript now enforces strict checking across the app.",
    content:
      "tsconfig.app.json has strict mode switched on, improving type safety throughout the project.",
    date: "2025-07-07T00:00:00Z",
    author: "Web Team",
    tags: ["typescript", "strict"],
    imageUrl: "https://robohash.org/devlog-39?size=640x360"
  },
  {
    id: "devlog-38",
    title: "DevLog IDs use UUIDs",
    excerpt: "IDs are now generated with crypto.randomUUID().",
    content:
      "DevLogSection creates entry IDs via crypto.randomUUID so each post has a globally unique identifier.",
    date: "2025-07-06T00:00:00Z",
    author: "Web Team",
    tags: ["devlog", "uuid"],
    imageUrl: "https://robohash.org/devlog-38?size=640x360"
  },
  {
    id: "devlog-37",
    title: "Media links restored",
    excerpt: "Spotify and YouTube point to official pages again.",
    content:
      "Media.tsx now links to the official artist profile on Spotify and our YouTube videos page, both opening in a new tab.",
    date: "2025-07-05T00:00:00Z",
    author: "Web Team",
    tags: ["media", "link"],
    imageUrl: "https://robohash.org/devlog-37?size=640x360"
  },
  {
    id: "devlog-36",
    title: "Footer links updated",
    excerpt: "Twitter and Steam removed, YouTube fixed.",
    content:
      "The homepage footer drops the unused Twitter and Steam links. The YouTube button now opens https://www.youtube.com/@lordtsarcasm/videos in a new tab.",
    date: "2025-07-04T00:00:00Z",
    author: "Web Team",
    tags: ["footer", "links"],
    imageUrl: "https://robohash.org/devlog-36?size=640x360"
  },
  {
    id: "devlog-35",
    title: "Node warnings silenced",
    excerpt: "Adjusted default max listeners.",
    content:
      "A tweak to Vite's config increases EventEmitter.defaultMaxListeners, removing the socket listener warning during install.",
    date: "2025-07-03T00:00:00Z",
    author: "Web Team",
    tags: ["build", "fix"],
    imageUrl: "https://robohash.org/devlog-35?size=640x360"
  },
  {
    id: "devlog-34",
    title: "Security hardening implemented",
    excerpt: "Comprehensive security fixes including RLS policies, input validation, and rate limiting.",
    content:
      "Major security improvements have been implemented across the platform. Added Row Level Security policies, input sanitization, password validation, rate limiting, and security audit logging. All user inputs are now properly validated and sanitized to prevent XSS attacks. The system includes comprehensive monitoring and logging for security events.",
    date: "2025-06-11T00:00:00Z",
    author: "Security Team",
    tags: ["security", "database", "validation"],
    imageUrl: "https://robohash.org/devlog-34?size=640x360"
  },
  {

    id: "devlog-33",
    title: "Contribution guide added",
    excerpt: "AGENTS and setup docs available.",
    content:
      "The repository now includes a root AGENTS.md describing pull request steps and a setupscript.txt for first time installation.",
    date: "2025-07-02T00:00:00Z",
    author: "Web Team",
    tags: ["docs"],
    imageUrl: "https://robohash.org/devlog-33?size=640x360"
  },
  {

    id: "devlog-32",
    title: "Game dependencies installed",
    excerpt: "Missing packages now included for map viewer.",
    content:
      "The dev server failed because scripts in the game folder imported modules that were not installed. Adding osmtogeojson, three and Turf helpers fixes the startup error.",
    date: "2025-07-01T00:00:00Z",
    author: "Web Team",
    tags: ["build", "fix"],
    imageUrl: "https://robohash.org/devlog-32?size=640x360"
  },
  {
    id: "devlog-31",
    title: "Media page cleaned up",
    excerpt: "Removed unused React import.",
    content:
      "Media.tsx no longer imports React since the project uses the modern JSX runtime. This fixes build warnings.",
    date: "2025-06-30T00:00:00Z",
    author: "Web Team",
    tags: ["media", "cleanup"],
    imageUrl: "https://robohash.org/devlog-31?size=640x360"
  },
  {
    id: "devlog-30",
    title: "Media links updated",
    excerpt: "YouTube and Spotify now point to official pages.",
    content:
      "The Media page links to youtube.com/@lordtsarcasm/videos and the correct Spotify artist profile so fans can easily follow our releases.",
    date: "2025-06-29T00:00:00Z",
    author: "Web Team",
    tags: ["media", "link"],
    imageUrl: "https://robohash.org/devlog-30?size=640x360"
  },
  {

    id: "devlog-29",
    title: "Game tab requires login",
    excerpt: "Navigation hides the game link until authenticated.",
    content:
      "The navigation bar now checks login status. The Game tab is only visible when users are signed in, keeping the menu clean for guests.",
    date: "2025-06-28T00:00:00Z",
    author: "Web Team",
    tags: ["navigation"],
    imageUrl: "https://robohash.org/devlog-29?size=640x360"
  },
  {
    id: "devlog-28",
    title: "Console logging toggled",
    excerpt: "Verbose logs now require DEBUG flags.",
    content:
      "Globe scripts no longer spam the console. All console.log calls are wrapped in a DEBUG check so the site stays quiet by default.",
    date: "2025-06-27T00:00:00Z",
    author: "Web Team",
    tags: ["cleanup"],
    imageUrl: "https://robohash.org/devlog-28?size=640x360"
  },
  {
    id: "devlog-27",
    title: "Intro video button preview",
    excerpt: "ROD Intro Video label now changes on hover.",
    content:
      "The home page button previously said 'Coming Soon'. It now displays 'ROD Intro Video' until hovered, revealing the upcoming trailer message.",
    date: "2025-06-26T00:00:00Z",
    author: "Web Team",
    tags: ["ui"],
    imageUrl: "https://robohash.org/devlog-27?size=640x360"
  },
  {
    id: "devlog-26",
    title: "Hero banner links to devlog",
    excerpt: "Latest Updates button now opens posts.",
    content:
      "Clicking the Latest Updates button on the home page now routes to the DevLog page so newcomers can quickly read new entries.",
    date: "2025-06-25T00:00:00Z",
    author: "Web Team",
    tags: ["navigation"],
    imageUrl: "https://robohash.org/devlog-26?size=640x360"
  },
  {
    id: "devlog-25",
    title: "README shows linting steps",
    excerpt: "ESLint instructions added to docs.",
    content:
      "The README now explains how to run `npm run lint` and notes that linting must pass before a pull request.",
    date: "2025-06-24T00:00:00Z",
    author: "Web Team",
    tags: ["docs"],
    imageUrl: "https://robohash.org/devlog-25?size=640x360"
  },
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
    imageUrl: "https://robohash.org/devlog-17?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-16?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-15?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-14?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-13?size=640x360"
  },
  {
    id: "devlog-12",
    title: "Google Maps key via env",
    excerpt: "Map viewer reads VITE_GOOGLE_MAPS_KEY.",
    content: "index.html now loads Google Maps using VITE_GOOGLE_MAPS_KEY. See the new README for setup.",
    date: "2025-06-11T00:00:00Z",
    author: "Web Team",
    tags: ["docs", "game"],
    imageUrl: "https://robohash.org/devlog-12?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-11?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-10?size=640x360"
  },
  {
    id: "devlog-9",
    title: "README overhauled",
    excerpt: "Documentation now explains the project and local setup.",
    content: "The README has been rewritten to describe the devlog portal, development commands and key technologies.",
    date: "2025-06-08T00:00:00Z",
    author: "Web Team",
    tags: ["documentation"],
    imageUrl: "https://robohash.org/devlog-9?size=640x360"
  },
  {
    id: "devlog-8",
    title: "Navigation Cleanup",
    excerpt: "Removed extra links from the top navigation bar.",
    content: "We trimmed the nav bar by dropping the Community button and the duplicate DevLog link so the interface is less cluttered.",
    date: "2025-06-08T09:00:00Z",
    author: "Web Team",
    tags: ["ui", "navigation"],
    imageUrl: "https://robohash.org/devlog-8?size=640x360"
  },
  {
    id: "devlog-7",
    title: "Media page now live",
    excerpt: "Visit our new page for links to Facebook, Spotify and YouTube.",
    content: "We've launched a dedicated Media page collecting our online channels. Check it out to follow us on Facebook, Spotify and YouTube.",
    date: "2025-06-07T12:00:00Z",
    author: "Web Team",
    tags: ["website", "community"],
    imageUrl: "https://robohash.org/devlog-7?size=640x360"
  },
  {
    id: "devlog-6",
    title: "Trailer Button Updated",
    excerpt: "The homepage trailer button now says Coming Soon.",
    content: "We've renamed the 'Watch Trailer' button to 'Coming Soon' as we finalize footage for the next trailer.",
    date: "2025-06-07T10:00:00Z",
    author: "Web Team",
    tags: ["ui", "update"],
    imageUrl: "https://robohash.org/devlog-6?size=640x360"
  },
  {
    id: "devlog-5",
    title: "Updated site branding",
    excerpt: "Renamed landing page title to usetheknife.com.",
    content: "The main index now references the new domain in the title and Open Graph meta tags.",
    date: "2025-06-07T00:00:00Z",
    author: "Web Team",
    tags: ["meta", "branding"],
    imageUrl: "https://robohash.org/devlog-5?size=640x360"
  },
  {
    id: "devlog-4",
    title: "UI Fixes and Asset Updates",
    excerpt: "Improved team and loadout tabs. Fixed broken images in the mission modal.",
    content: "This patch cleans up the Prepare Event interface. Available units are easier to read, loadout slots are clearer, and briefing/map images now load correctly.",
    date: "2025-06-06T10:00:00Z",
    author: "Web Team",
    tags: ["ui", "bugfix"],
    imageUrl: "https://robohash.org/devlog-4?size=640x360"
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
    imageUrl: "https://robohash.org/devlog-3?size=640x360"
  },
  {
    id: "devlog-45",
    title: "Notifications use GPU-friendly transforms",
    excerpt: "Sliding elements now rely on transform animations.",
    content:
      "Globe notifications and the ranger thought bubble animate via CSS transforms instead of top/left, tapping hardware acceleration for smoother movement.",
    date: "2025-07-13T00:00:00Z",
    author: "Web Team",
    tags: ["performance", "animation"],
    imageUrl: "https://robohash.org/devlog-45?size=640x360"
  },
  {
    id: "devlog-46",
    title: "Simpler NavBar markup",
    excerpt: "Removed extra wrappers to lighten DOM.",
    content:
      "The NavBar and hero section no longer use unnecessary \x3cdiv\x3e elements. This flattening trims the DOM tree and speeds up rendering.",
    date: "2025-07-14T00:00:00Z",
    author: "Web Team",
    tags: ["cleanup", "performance"],
    imageUrl: "https://robohash.org/devlog-46?size=640x360"
  },
  {
    id: "devlog-47",
    title: "Loading video fallback created",
    excerpt: "Home page no longer errors when menu-video missing.",
    content:
      "loadingScreen.js now creates the menu video dynamically if it's absent, and index.html includes a hidden video element for styling.",
    date: "2025-07-15T00:00:00Z",
    author: "Web Team",
    tags: ["bugfix", "home"],
    imageUrl: "https://robohash.org/devlog-47?size=640x360"
  },
  {
    id: "devlog-48",
    title: "Cache asset list locally",
    excerpt: "New script downloads models from downloadableassets.txt.",
    content: "cache_assets.js saves missing GLB files and regenerates the manifest so models load without 404s.",
    date: "2025-07-16T00:00:00Z",
    author: "Web Team",
    tags: ["assets", "script"],
    imageUrl: "https://robohash.org/devlog-48?size=640x360"
  },
  {
    id: "devlog-49",
    title: "Cache script linked to Home Base",
    excerpt: "Clicking the Home Base button now triggers asset caching.",
    content: "A small server exposes /cache-assets, and geolocation.js calls it when the Home Base Command Center opens.",
    date: "2025-07-17T00:00:00Z",
    author: "Web Team",
    tags: ["assets", "integration"],
    imageUrl: "https://robohash.org/devlog-49?size=640x360"
  },
  {
    id: "devlog-50",
    title: "Discord invite updated",
    excerpt: "Footer points to the live channel.",
    content: "Index.tsx now links to https://discord.gg/qUVrPpNUNv so visitors can join our community server.",
    date: "2025-07-18T00:00:00Z",
    author: "Web Team",
    tags: ["footer", "link"],
    imageUrl: "https://robohash.org/devlog-50?size=640x360"
  },
  {
    id: "devlog-51",
    title: "Error boundaries added",
    excerpt: "App routes now handled safely.",
    content: "A new ErrorBoundary component wraps the router so unexpected runtime errors show a friendly message and link back home.",
    date: "2025-07-19T00:00:00Z",
    author: "Web Team",
    tags: ["react", "error"],
    imageUrl: "https://robohash.org/devlog-51?size=640x360"
  },
  {
    id: "devlog-52",
    title: "PWA support enabled",
    excerpt: "Site can now install as an app.",
    content: "vite-plugin-pwa registers a service worker and adds a manifest so the portal works offline.",
    date: "2025-07-20T00:00:00Z",
    author: "Web Team",
    tags: ["pwa", "service worker"],
    imageUrl: "https://robohash.org/devlog-52?size=640x360"
  },
  {
    id: "devlog-53",
    title: "RoboHash fallback for images",
    excerpt: "Old posts and the form now auto-generate art.",
    content: "Entries 3-17 use RoboHash images and DevLogForm creates a RoboHash URL when none is provided.",
    date: "2025-07-21T00:00:00Z",
    author: "Web Team",
    tags: ["devlog", "images"],
    imageUrl: "https://robohash.org/devlog-53?size=640x360"
  },
  {
    id: "devlog-54",
    title: "3D Overworld demo uploaded",
    excerpt: "Playable prototype now lives in public/game/3doverworld.",
    content:
      "A new 3D Overworld demo showcases early terrain, items and lighting scripts. Open public/game/3doverworld/index.html to explore the test map.",
    date: "2025-07-22T00:00:00Z",
    author: "Web Team",
    tags: ["game", "demo"],
    imageUrl: "https://robohash.org/devlog-54?size=640x360"
  }
,
  {
    id: "devlog-55",
    title: "Contribution guide updated",
    excerpt: "Every pull request must log its changes.",
    content: "AGENTS.md now states that every code change requires a devlog entry summarizing the pull request so the timeline stays complete.",
    date: "2025-07-23T00:00:00Z",
    author: "Web Team",
    tags: ["docs", "process"],
    imageUrl: "https://robohash.org/devlog-55?size=640x360"
  }
];
