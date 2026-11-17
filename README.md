# NetCalc Pro

A browser-only IPv4 toolkit built from [netcalc-pro-spec.md](./netcalc-pro-spec.md). It includes a subnet calculator, FLSM and VLSM planners, a CIDR converter, binary visualizer, prefix table, and learning guide. Calculations stay in your browser.

## Run locally

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. Other scripts:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run preview
```

The E2E command uses Playwright Chromium. If needed, install it with `npx playwright install chromium`.

## Architecture

`src/features/subnet-calculator/domain` holds pure IPv4 parsing and arithmetic. FLSM and VLSM use cases live in their feature `application` folders. React pages are under `presentation`; shared UI wraps shadcn/ui Button and Card components in `src/components/ui`. Browser-specific clipboard and export code is in `src/shared/lib/export.ts`. No API or database is needed.

Hash routes (`/#/tools/...`) support refreshes on static hosts. Calculator inputs are shareable in the hash route query string. Light/dark preference is stored locally.

## Deploy

For a root domain, `npm run build` creates `dist/`. For a GitHub Pages project path, set `VITE_BASE_PATH` before building, for example:

```bash
VITE_BASE_PATH=/netcalc-pro/ npm run build
```

Publish `dist/` with GitHub Pages, Netlify, or Vercel. The provided GitHub Actions workflow uses the repository name as its base path.
