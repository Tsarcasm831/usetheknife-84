# Remnants of Destruction Devlog Portal

This repository contains the web portal for **Remnants of Destruction**. The site hosts devlogs, media links and an embedded tactical map. It is built with [Vite](https://vitejs.dev/), React and TypeScript using Tailwind CSS and the shadcn-ui component library. Authentication is handled by Supabase.

## Getting Started

1. Install Node.js (18 or later) and npm.
2. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:8080`.

## Project Structure

- `src/` – React components, pages and utilities.
- `public/` – static assets. The `public/game` folder contains the standalone map viewer built with Leaflet.
- `supabase/` – configuration for Supabase authentication.

Run `npm run build` to create a production build in the `dist/` folder.

## Contributing

Pull requests are welcome. Each pull request should add a short entry to `src/lib/data.ts` describing the change so it appears on the DevLog page.
