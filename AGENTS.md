# K-SPORT Agent Guide

## Scope and safety

- This repository is the standalone public website for `k-sport.net`.
- Do not modify, deploy to, or connect the existing Admin, VPS, API or database unless the user explicitly opens a separate integration task.
- The current phase is UI with mock data only. Keep mock data in `lib/mock-data.ts` and label it in the UI.
- Never invent achievements, clients, revenue, awards, production events, pricing amounts or testimonials.
- Do not expose sensitive athlete data. Public sample views may show only a synthetic name, club, category and non-sensitive competition result.
- Do not add payment processing in this phase.
- Do not push Git or deploy automatically.

## Required reading

Before changing UI, read `DESIGN.md`. Its tokens and guardrails are the source of truth. For large visual changes, inspect the matching image in `design-references/` and verify in a real browser.

## Stack

- Next.js App Router
- TypeScript in strict mode
- Tailwind CSS v4 through `@tailwindcss/postcss`
- Server Components by default; add `"use client"` only for interaction
- Global design tokens and complex art-direction layout in `app/globals.css`; Tailwind utilities are allowed for local layout/state work

## Project structure

- `app/`: routes, metadata and global CSS
- `components/`: reusable site and interactive product-fragment components
- `lib/mock-data.ts`: all mock records and types
- `design-references/`: generated visual references; do not ship them as page screenshots

## Route requirements

Maintain these routes: `/`, `/events`, `/events/[slug]`, `/schedule`, `/results`, `/athletes`, `/athletes/[id]`, `/ranking`, `/news`, `/news/[slug]`, `/software`, `/pricing`, `/contact`. Existing `/clubs` and `/clubs/[id]` routes remain supported as secondary public directories.

Dynamic routes must use synthetic IDs/slugs from `lib/mock-data.ts`, implement `generateStaticParams`, and call `notFound()` for unknown records.

## UI rules

- Use semantic HTML and one `h1` per page.
- Keep every heading to two lines or fewer at 1440, 768 and 390px.
- Use links for navigation and buttons for actions.
- All icon-only buttons need `aria-label`; decorative icons need `aria-hidden="true"`.
- Forms need visible labels, `name`, correct type, autocomplete and clear help/error text.
- Include visible `:focus-visible` styles, a skip link and at least 44px mobile targets.
- Use explicit image dimensions; lazy-load only below-fold imagery.
- Honor `prefers-reduced-motion`; animate only transform and opacity.
- Avoid `transition: all`, gradients, glass, glows, resting shadows, decorative badges, card grids and nested boxes.
- Format production dates and numbers with `Intl.*`; mock dates may be stored as ISO strings.

## Data and copy

- Write in Vietnamese by default.
- Use active, specific copy. Keep primary CTA naming consistent.
- Mark sample event/athlete/club data as “Dữ liệu minh họa”.
- Never represent sample records as real customers, current tournaments or verified results.

## Verification

For every material UI change:

1. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
2. Run the taste-skill lint and production inspector; resolve every failure and justify any remaining warning.
3. Review screenshots at 1440px, 768px and 390px.
4. Use Playwright CLI to check navigation, keyboard focus, mobile menu, FAQ, workflow slider and contact form behavior.
5. Audit changed files against the current Vercel Web Interface Guidelines.

## Completion report

List created/changed files, implemented routes and interactions, checks actually run, mock content that must be replaced, and any missing production integration. Never claim a check that did not run.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
