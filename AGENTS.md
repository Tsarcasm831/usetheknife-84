# Project Contribution Guide

This repository hosts the Remnants of Destruction devlog portal built with Vite, React and TypeScript. Use this document as the baseline instructions for all future updates.

## Required Steps for Pull Requests

1. **Install dependencies**
   - Run `npm install` to ensure `node_modules` are available.
2. **Run the linter**
   - Execute `npm run lint` before committing. Fix any reported issues.
3. **Update the DevLog**
   - Append a brief entry to `src/lib/data.ts` describing your change so it appears on the DevLog page.
4. **Keep commits focused**
   - Commit messages should be short and reference the main change.

## Style Notes

- This project uses TypeScript with the modern JSX runtime. Importing `React` in components is unnecessary.
- Tailwind CSS is configured in `tailwind.config.ts`; keep custom classes organised.

## Additional Resources

See `public/game/AGENTS.md` for guidelines that apply when editing files under `public/game/`.
