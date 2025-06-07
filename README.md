# Remnants of Destruction Devlog Portal

This repository contains the web portal for **Remnants of Destruction**. The site hosts devlogs, media links and an embedded tactical map. It is built with [Vite](https://vitejs.dev/), React and TypeScript using Tailwind CSS and the shadcn-ui component library. Authentication is handled by Supabase.

## Getting Started

1. Install Node.js (18 or later) and npm.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`.

## Project Structure

- `src/` – React components, pages and utilities.
- `public/` – static assets. The `public/game` folder contains the standalone map viewer built with Leaflet.
- `supabase/` – configuration for Supabase authentication.

Run `npm run build` to create a production build in the `dist/` folder.

## DevLog Image Generation

The DevLog page now uses [RoboHash](https://robohash.org/) to create fun
placeholder images. No API keys or setup are required—the image URL is built
directly from the entry title and excerpt.

## Contributing

Pull requests are welcome. Each pull request should add a short entry to `src/lib/data.ts` describing the change so it appears on the DevLog page.
