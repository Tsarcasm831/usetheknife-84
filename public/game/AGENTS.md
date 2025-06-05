# Agent Contribution Guide

This document outlines the development standards for the **Remnants of Destruction**
static web project. Each section provides detailed rules to ensure consistent style
and maintainable code. Follow them carefully whenever you modify or extend this
repository.

## Project overview
- The repository contains HTML, CSS, JavaScript, and various image assets used to
  deliver a single-page application.
- There is no bundler or build step. The browser consumes the files directly from
  the `index.html` entry point.
- Directory structure is intentionally flat, with subfolders for components, data,
  images, and style sheets.
- The application does not currently have a backend. All dynamic behavior is
  handled on the client side.
- We do not use a package manager. Keep dependencies external via CDN links
  whenever possible.

## Directory overview

Below is a simplified view of the repository showing only directories:

```
.
├── assets
│   ├── aliens
│   │   ├── anthromorphs
│   │   ├── avianos
│   │   ├── behemoth
│   │   ├── chiropteran
│   │   ├── dengar
│   │   ├── kilrathi
│   │   ├── shalrah_p
│   │   ├── talorian
│   │   ├── tal_ehn
│   │   ├── t_ana_rhe
│   │   ├── vyraxus
│   │   └── xithrian
│   ├── equipment
│   │   ├── armor
│   │   └── weapons
│   │       ├── ballistics_tier1
│   │       ├── energy_tier1
│   │       ├── gauss_exotic
│   │       ├── particle_beam
│   │       ├── plasma_tier2
│   │       ├── plutonium_fuel_rod
│   │       └── rail_tier2
│   ├── factions
│   │   ├── cross
│   │   ├── heroes
│   │   │   └── slingers
│   │   └── prometheus
│   ├── FDG
│   ├── HIVE
│   └── mutants
├── components
├── css
│   ├── prepareEventModal
│   │   ├── components
│   │   ├── core
│   │   └── tabs
│   └── tutorial
├── home
├── icons
├── js
│   ├── character
│   │   └── utils
│   ├── characterSheet
│   ├── prepareEventModal
│   │   ├── core
│   │   ├── tabs
│   │   └── utils
│   └── tutorial
├── json
│   ├── character_creation
│   ├── data
│   ├── equipment
│   └── factions
│       └── cross_units
```

## General coding rules
- Two spaces are required for indentation in all code files: HTML, CSS, and
  JavaScript.
- Avoid tabs and trailing whitespace. Run `git diff` before committing to confirm
  spacing looks correct.
- Use double quotes for string literals and HTML attribute values. The only
  exception is JSON files, which should be valid standard JSON with double quotes
  as required.
- Keep lines under 120 characters. If a line grows too long, break it into
  multiple lines using sensible indentation.
- Comment your code where it is not immediately obvious. Favor short sentences
  over block paragraphs for explanations.
- Use semicolons at the end of JavaScript statements for clarity and
  compatibility with older browsers.
- JavaScript variable and function names should be camelCase, while class names
  in CSS should be kebab-case.
- Keep functions focused. If a function exceeds roughly 40 lines, consider
  splitting it into smaller pieces.

## HTML guidelines
- Place standalone HTML snippets or reusable UI pieces in the `components/`
  directory. Use clear filenames that describe what the snippet does.
- Keep the main `index.html` concise by referencing these components using
  server-side includes or by injecting them dynamically with JavaScript.
- Maintain a consistent element hierarchy. Avoid excessive nesting that makes
  the markup hard to follow.
- Close all tags explicitly. Self-closing elements like `<br />` and `<img />`
  should include the trailing slash for XHTML compatibility.
- Use semantic HTML elements (such as `<header>`, `<nav>`, `<main>`, and
  `<footer>`) to make the structure clear for screen readers and search engines.
- Keep inline styles to a minimum. Use classes or IDs to apply CSS instead.
- When linking to external resources, prefer HTTPS to avoid mixed content
  warnings in modern browsers.

## CSS guidelines
- Stylesheets live in the `css/` directory. Organize them by feature or module
  if the folder becomes large.
- Use class selectors whenever possible. IDs should be reserved for elements that
  are unique on the page.
- Keep selectors short and avoid unnecessary nesting, which can lead to overly
  specific rules.
- Use descriptive class names with words separated by hyphens. Example:
  `toolbar-button`.
- Group related rules together and leave a blank line between rule sets for
  readability.
- When adding new colors or fonts, define CSS variables near the top of the file
  so future modifications are easy.
- Minimize the use of `!important` unless overriding third-party library styles.
- Prefer `rem` units for sizing text so that the layout remains accessible when
  users change their default browser font size.

## JavaScript guidelines
- Keep scripts in the `js/` directory. Provide a short comment at the top of each
  file describing its purpose.
- Use the latest ECMAScript syntax supported by modern browsers, but avoid
  experimental features that lack widespread support.
- Wrap related functionality inside modules or Immediately Invoked Function
  Expressions (IIFEs) to avoid polluting the global scope.
- When interacting with the DOM, cache selectors to avoid repeated lookups on
  each function call.
- Handle potential errors using `try`/`catch` where needed, and log meaningful
  messages to the console to assist debugging.
- Keep asynchronous code readable by using `async` and `await` rather than deeply
  nested callbacks.

## Asset guidelines
- Put vector icons and raster images in `icons/` or another clearly named
  subdirectory. Keep file names lowercase and separate words with underscores.
- Compress large images before committing them to avoid bloating the repository.
- If you add new images, update any relevant `README` or documentation sections
  that reference them.
- Avoid committing large binary files. Consider linking externally if possible.

## Data files
- JSON data lives under the `json/` folder. Validate syntax before committing by
  opening the file in a text editor or using a linter.
- When modifying JSON structure, update any scripts that read the data to handle
  the new format gracefully.

## Commit guidelines
- Make small, focused commits. Each commit should ideally change only one aspect
  of the application.
- Write commit messages using the imperative mood, e.g. "Add map zoom control" or
  "Fix style on sidebar".
- Include a short summary line. If additional context is necessary, add a blank
  line followed by a concise description.
- Ensure `git status --short` shows a clean working tree before committing. This
  reduces the chance of accidental files being included.

## Branching
- Keep your work on a single branch within this repository. Avoid creating
  feature branches in remote forks to keep the history simple.
- Rebase your changes if necessary to keep the commit history linear and easy to
  follow.

## Manual testing workflow
- Open `index.html` in a modern browser after making changes.
- Inspect the browser console for JavaScript errors or warnings.
- Click through all interactive elements to ensure they still function.
- If you modify any assets or styles, refresh the page using your browser's cache
  bypass (often Ctrl+Shift+R) to confirm the changes take effect.
- Document anything unusual in the pull request description so reviewers can
  double-check it.

## Pull request expectations
- Summarize the key files you touched and why the changes are needed.
- Describe the manual testing steps you performed, including which browsers were
  used if relevant.
- Keep pull request titles short but informative. Avoid long issue references in
  the title; include them in the body if required.
- Check for merge conflicts before opening a pull request so the review process
  goes smoothly.

## Documentation standards
- Keep this `AGENTS.md` up to date. Whenever you adjust guidelines, provide a
  short explanation at the top describing what changed.
- When adding new features or pages, consider writing a short `README` in the
  appropriate directory to explain how it fits into the larger project.
- All documentation should aim for clarity and assume new contributors are not
  familiar with the codebase.

## Environment setup
- No special setup is required beyond a web browser and text editor.
- If you plan to run a simple web server for local development, you can use
  Python's built-in server by running `python -m http.server` in the project
  root.
- Avoid committing environment-specific configuration files such as those
  generated by IDEs.

## Accessibility considerations
- Ensure interactive elements are reachable via keyboard navigation. Use `tabindex`
  when necessary to override default tab order.
- Provide alt text for all images to assist screen readers.
- Check color contrast with online tools to make sure text remains readable for
  users with vision impairments.

## Performance tips
- Combine related CSS files if there are too many small imports, but balance this
  with the need for clear organization.
- Defer non-critical JavaScript so the page loads quickly. Use the `defer` or
  `async` attribute when referencing scripts in HTML.
- Lazy-load images if they are not immediately visible when the page first loads.

## Security notes
- Be cautious when adding third-party scripts. Verify that they come from trusted
  sources and keep track of version numbers in case of future patches.
- Sanitize any user input if you add forms or other interactive features that
  accept data from the browser.

## Browser support
- Aim to support the two most recent major versions of Chrome, Firefox, Safari,
  and Edge.
- Avoid vendor-prefixed CSS unless absolutely necessary. Standard properties
  should work across the targeted browsers.

## Style and formatting tools
- If you use an editor with formatting tools, configure it to use two spaces for
  indentation.
- Consider installing linters or formatters (like ESLint or Prettier) in your
  local environment, but do not commit their configuration files unless they are
  explicitly needed.

## Keeping dependencies up to date
- Periodically check CDN links to ensure they reference the latest compatible
  library versions.
- When updating a library version, test thoroughly to make sure nothing breaks.

## Reporting issues
- Use clear language when filing issues or requesting help. Include screenshots or
  code snippets if they help explain the problem.
- Label issues with categories such as `bug`, `enhancement`, or `question` so
  maintainers can triage them efficiently.

## Community expectations
- All contributors are expected to be respectful and constructive during code
  reviews and discussions.
- Feedback should be specific and actionable. Avoid vague criticism that does not
  guide the author toward improvement.
- We welcome new contributors! If anything in this guide is confusing, open an
  issue so we can clarify it.

## Release process
- There is currently no automated release pipeline. When significant changes are
  merged, update the version number in any relevant files and create a git tag.
- Document noteworthy changes in a `CHANGELOG.md` file if one exists. If not,
  create it with a summary of added features and fixes.

## Archival
- Old assets that are no longer used should be moved to an `archive/` directory
  rather than deleted outright. This allows future contributors to reuse them if
  needed.

## Backups
- Keep local backups of any large changes until they are merged. While Git tracks
  history, having an extra copy can save time in case of accidental deletion.

## Final thoughts
- This project values clarity and maintainability over clever one-liners. Write
  code that others can easily understand.
- When in doubt, err on the side of explicitness. Add a small helper function or
  comment rather than leaving future contributors guessing.


## Appendix: useful links
- [MDN Web Docs](https://developer.mozilla.org/) has detailed references for
  HTML, CSS, and JavaScript features used throughout this project.
- The [W3C Markup Validation Service](https://validator.w3.org/) can help verify
  that your HTML is well-formed and free of syntax issues.
- For CSS validation, check the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/).
- Review the [WCAG guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/) when assessing accessibility.
- If you need map or geolocation resources, review the [Leaflet documentation](https://leafletjs.com/).

