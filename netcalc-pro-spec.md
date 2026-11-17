# NetCalc Pro — Product & Technical Specification

**Version:** 1.0  
**Status:** Ready for implementation  
**Product:** Responsive, static web application for IPv4 subnet calculation and subnet planning  
**Primary stack:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui  
**Architecture:** Feature-based Clean Architecture  
**Hosting:** GitHub Pages, Vercel, or Netlify  
**Backend/database:** Not required for MVP

---

## 1. Product vision

Build a fast, accurate, accessible, modern web toolkit that helps networking students, teachers, IT technicians, and network engineers calculate IPv4 subnets, design FLSM and VLSM networks, and understand CIDR addressing. All calculations are local to the browser; the app works without a server API. The app is English-first, with an architecture prepared for Khmer localization.

### Goals
- Accurate IPv4 arithmetic across all prefixes `/0` through `/32`.
- Beginner-friendly, step-by-step learning with professional output for engineers.
- Responsive mobile/tablet/desktop interface, accessible keyboard navigation, light/dark theme.
- Clean separation among UI, use cases, calculation domain, and browser-only persistence.
- Shareable calculator state through URL parameters, and exportable results.

### Non-goals (MVP)
- No user authentication, account sync, database, realtime network scanner, device configuration, IP geolocation, cloud backend, or third-party calculation API.
- No automatic live probing or scanning of networks.
- No full IPv6 subnetting in v1 (can be added in v2 using BigInt).

## 2. Target users and user stories

1. **Student:** As a student, I enter `192.168.1.10/26` to get the network, address range, and binary explanation.
2. **Teacher:** As a teacher, I divide `192.168.1.0/24` into 4 equal subnets and copy a formatted result for a lesson.
3. **Network administrator:** As an admin, I enter departments needing 100, 50, and 20 hosts and receive a valid VLSM allocation.
4. **Cisco/MikroTik learner:** As a learner, I compare subnet mask and wildcard mask, and view special `/31` point-to-point behavior.
5. **Mobile user:** As a phone user, I calculate and copy a subnet without horizontal-scrolling the whole webpage.

## 3. Routes and information architecture

| Route | Page | MVP |
|---|---|---|
| `/` | Home dashboard / quick calculator / tools overview | Yes |
| `/tools/subnet-calculator` | IPv4 subnet calculator | Yes |
| `/tools/flsm-calculator` | Equal-size subnet division | Yes |
| `/tools/vlsm-calculator` | Host-demand-based subnet allocation | Yes |
| `/tools/cidr-converter` | CIDR / subnet mask / wildcard converter | Yes |
| `/tools/binary-visualizer` | IPv4 address and mask bit-by-bit viewer | Yes |
| `/reference/subnet-table` | CIDR prefix table `/0–/32` | Yes |
| `/learn/subnetting` | Subnetting theory and worked examples | Yes |
| `*` | Not-found page | Yes |

Use React Router configured for SPA. For GitHub Pages repository-path deployments, use hash routing (`/#/tools/...`) or implement a GitHub Pages-compatible SPA fallback; hash routing is the simpler deployment-safe option. Set the Vite `base` for the repository subpath.

## 4. MVP feature requirements

### 4.1 IPv4 Subnet Calculator
**Inputs**
- IPv4 address; e.g. `192.168.1.10`.
- Prefix `/0` through `/32`, selectable by slider or numeric input; alternatively accept dotted-decimal contiguous subnet mask.
- Quick presets: `/8`, `/16`, `/24`, `/25`, `/26`, `/27`, `/28`, `/29`, `/30`, `/31`, `/32`.

**Outputs**
- Input IP address and canonical CIDR network.
- Subnet mask, wildcard mask, network address, broadcast address (with special handling for `/31` and `/32`).
- First and last assignable address, total addresses, usable addresses.
- Address class (historical/classful educational label, not a routing restriction), scope labels (private/public/loopback/link-local/multicast/reserved, appropriately qualified).
- Binary address/mask and 32-bit network-versus-host visualization.
- Details on subnet increment / block size where applicable; copy results; share via URL.

**Interactions**
- Calculate on button click or debounced valid inputs; invalid input never produces misleading results.
- Reset to an example, copy single values, copy all, and show explanatory notes.

### 4.2 FLSM — Fixed Length Subnet Mask Calculator
**Inputs**
- Parent CIDR (e.g. `192.168.1.0/24`; if a host address is supplied, canonicalize to parent network and show notice).
- Requested number of equal-size subnets OR minimum usable hosts per subnet (choose one mode).

**Outputs**
- New subnet prefix and mask, borrowed bits, number of possible equal-sized subnets, usable hosts/subnet.
- Paged or virtualized table: subnet index, CIDR, first IP, last IP, broadcast, total addresses, usable hosts.
- Allocation bar or tiles showing equal blocks; export CSV.

**Rules**
- `borrowedBits = ceil(log2(requestedSubnetCount))`; `newPrefix = parentPrefix + borrowedBits`; reject if `newPrefix > 32`.
- For minimum hosts, find the smallest address block satisfying normal LAN usable host rule (`blockSize - 2 >= neededHosts`), unless an explicit `/31` P2P mode applies; ensure selected prefix fits inside parent.
- Calculate possible subnet count as `2^(newPrefix-parentPrefix)`.
- Only generate visible/paged rows, never eagerly render millions of addresses/subnets.
- Display unallocated parent space clearly if requested subnet count is not a power of two.

**Acceptance example**
`192.168.1.0/24`, 4 subnets -> `/26` with networks `.0/26`, `.64/26`, `.128/26`, `.192/26`; 64 total addresses and 62 normal usable hosts each.

### 4.3 VLSM — Variable Length Subnet Mask Calculator
**Inputs**
- Parent network (e.g. `192.168.10.0/24`).
- Add/remove/reorder named requirements: `Department`, `Required usable hosts`, optional description.
- Optional manual reserved CIDR blocks for advanced mode (v2).

**Algorithm**
1. Validate parent and all rows (non-negative host requirements; require >=1 for ordinary LAN allocations).
2. For each LAN demand `h`, choose smallest power-of-two block `b` with `b - 2 >= h` (traditional IPv4 LAN); corresponding prefix `32 - log2(b)`. Distinguish special `/31` point-to-point links and `/32` single-host routes from LAN calculations.
3. Sort demands by block size descending; preserve input order for equal sizes (stable sort).
4. Starting at the parent network start, align each proposed allocation to its block boundary: `aligned = ceil(cursor/blockSize)*blockSize` (using exact integer arithmetic); ensure allocation stays inside the parent range and does not overlap another allocation.
5. Allocate blocks in order and update the cursor; on insufficient space show failure without partially presenting a valid-looking full plan.
6. Return allocation table, totals (assigned/reserved/unallocated), utilization percentage, and address block visualization. Show original requirement labels even if allocation order changes.

**Outputs**
- Name, required hosts, allocated usable capacity, prefix/mask, network, first/last usable IP, broadcast, address count, unused assignable capacity.
- Parent utilization: allocated addresses / parent address count; separately show demand efficiency to avoid ambiguous percentages.
- Export CSV and JSON; copy network plan.

**Acceptance example**
`192.168.10.0/24` with LAN demands 100, 50, 20:
- 100 hosts -> `192.168.10.0/25` (126 usable)
- 50 hosts -> `192.168.10.128/26` (62 usable)
- 20 hosts -> `192.168.10.192/27` (30 usable)
- Unallocated `192.168.10.224/27` (32 addresses)
- Parent address allocation = 224/256 = 87.5%; avoid treating this as demanded host utilization.

### 4.4 CIDR / Subnet Mask Converter
- Enter `/26` -> `255.255.255.192`, wildcard `0.0.0.63`, address count 64, normal usable host count 62.
- Enter mask `255.255.255.192` -> `/26`; reject non-contiguous masks such as `255.0.255.0`.
- Wildcard masks represent bitwise inverse of subnet mask; explicitly label context (e.g., ACL wildcard use).
- Provide `/0–/32` prefix reference table with sorting/filtering and a copy action.

### 4.5 Binary Visualizer
- Four separate 8-bit octet groups for IP, mask, network address and host field.
- Network bits highlighted indigo; host bits teal; clear textual labels and non-color-only cues.
- Step-by-step AND explanation (input IP AND mask = network address), bit-by-bit view toggle.
- Option to compare two IP addresses and tell whether they lie in the same subnet under a supplied prefix.

### 4.6 Subnetting reference and learning center
- CIDR table `/0–/32`, address counts, masks, special-case descriptions.
- Formulas:
  - Total IPs `2^(32 - prefix)`
  - Usable IPv4 LAN hosts `2^(32 - prefix) - 2` for ordinary `/0–/30` calculations
  - FLSM subnet count `2^(borrowed bits)`
- Clarify `/31` permits two point-to-point endpoints per RFC 3021, while `/32` is a single-address host route.
- Glossary: IP, network, host, network address, broadcast, subnet mask, wildcard mask, CIDR, FLSM, VLSM, address range.
- Worked examples and short quizzes (quizzes v2).

## 5. UX/UI specification

### Visual direction
- Modern network-engineering dashboard; professional but approachable.
- Main theme: neutral slate backgrounds, indigo primary actions, teal subnet highlights, amber warnings, red errors.
- Responsive: mobile first; soft surfaces, clear spacing, 12px radius cards, restrained shadows, high contrast.
- Font: Inter or system font for English; use a legible Khmer-capable font when localizing.
- Light and dark modes; persist preference in local storage.

### Design tokens (suggested)
```
--primary: #4F46E5;
--accent: #0D9488;
--background-light: #F8FAFC;
--surface-light: #FFFFFF;
--background-dark: #0B1220;
--surface-dark: #111C2E;
--text-light: #0F172A;
--text-dark: #F8FAFC;
--border-light: #E2E8F0;
--radius-card: 12px;
--space-unit: 4px;
```
Ensure WCAG 2.2 AA color contrast; colors are suggestive and must be checked before implementation.

### Desktop layout
```
+------------------------------------------------------------------+
| NetCalc Pro      Search tools...             Theme    EN / KM     |
+-------------------+----------------------------------------------+
| Dashboard         | Subnet Calculator                            |
| Subnet Calculator |----------------------------------------------|
| FLSM Calculator   | IP Address     [192.168.1.10]   CIDR [/26]   |
| VLSM Planner      | [ Calculate ] [ Reset ] [ Share ]            |
| CIDR Converter    |----------------------------------------------|
| Binary Visualizer | [Network] [Mask] [Broadcast] [Usable Hosts]  |
| Subnet Table      |----------------------------------------------|
| Learn Subnetting  | Binary network/host bits visualization       |
|                   | Details table and copy/export controls       |
+-------------------+----------------------------------------------+
```

### Mobile layout
- Compact top navigation with drawer menu.
- Full-width input fields; sticky action bar only if it does not obscure results.
- Summary cards stack; table becomes scrollable within its own container, plus per-subnet expandable cards for accessibility.
- Large touch targets (at least 44×44px where practical), visible focus states, labels and error text.

### Page states
- Empty / example-loaded, calculating (if expensive), success, invalid inputs, no-results/too-many-rows, allocation-failed, copy success, export failure.
- Do not show full-table loading spinners for synchronous instant calculations.
- On validation failures, focus the relevant field and display accessible contextual error messages.

## 6. Component inventory

**Shared shell:** `AppLayout`, `Header`, `Sidebar`, `MobileNav`, `ThemeToggle`, `LanguageSwitcher`, `PageHeader`.

**Reusable UI:** `IPAddressInput`, `CIDRInput`, `MaskInput`, `ResultCard`, `ResultsGrid`, `SubnetTable`, `NetworkRangeBar`, `BinaryOctet`, `CopyButton`, `ExportMenu`, `ErrorMessage`, `EmptyState`, `InfoTooltip`, `EducationalNote`.

**Page-level:** `SubnetCalculatorPage`, `FLSMPage`, `VLSMPage`, `CIDRConverterPage`, `BinaryVisualizerPage`, `SubnetReferencePage`, `LearnPage`.

## 7. Software architecture

### Layer responsibilities
1. **Domain (`domain`)**: Type definitions, `IPv4Address` value object, prefix/mask rules, pure functions; no React, browser APIs or styling imports.
2. **Application (`application`)**: Use cases (`calculateSubnet`, `splitFLSM`, `planVLSM`, `convertCIDR`), DTO mapping, error handling.
3. **Presentation (`presentation`)**: React forms, components, view models and hooks. Calls application interfaces only; does not implement subnet arithmetic.
4. **Infrastructure (`infrastructure`)**: URL query encoding/decoding, local storage settings, clipboard, download-as-CSV/JSON adapters.

### Directory tree
```
src/
  app/
    App.tsx
    providers/
      ThemeProvider.tsx
    router/
      router.tsx
    styles/
      globals.css
  components/
    layout/
    ui/
    network/
  features/
    subnet-calculator/
      domain/
        ipv4.ts
        subnet.ts
        types.ts
      application/
        calculateSubnet.ts
      presentation/
        SubnetCalculatorPage.tsx
        SubnetForm.tsx
        SubnetResults.tsx
      tests/
        calculateSubnet.test.ts
    flsm/
      domain/
      application/
        calculateFLSM.ts
      presentation/
        FLSMPage.tsx
      tests/
    vlsm/
      domain/
      application/
        allocateVLSM.ts
      presentation/
        VLSMPage.tsx
      tests/
    cidr-converter/
    binary-visualizer/
    subnet-reference/
    learning/
  shared/
    lib/
      validation.ts
      formatting.ts
      csv.ts
    hooks/
    types/
  infrastructure/
    url/
    storage/
    export/
  tests/
    e2e/
```

**Architecture boundaries**
- UI may import application layer; application may import domain; domain imports no UI or browser-specific code.
- Cross-feature common subnet primitives should be extracted into a shared pure `network-core` module when reuse becomes clear; do not duplicate algorithms.
- Avoid unnecessary global state; local form state + URL query parameters + one theme setting is enough for MVP.
- No third-party IP calculation dependency is required; validate mathematical correctness with deterministic tests.

## 8. Domain contracts

```ts
export type IPv4 = number; // unsigned integer, range 0..4294967295
export type Prefix = number; // integer 0..32

export interface IPv4SubnetResult {
  inputIP: string;
  prefix: Prefix;
  cidr: string;               // canonical network/prefix
  mask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string | null;
  firstAssignable: string;
  lastAssignable: string;
  totalAddresses: number;
  usableAddresses: number;
  addressType: 'lan' | 'point-to-point' | 'host-route';
}

export interface VLSMRequirement {
  id: string;
  name: string;
  requiredHosts: number;
  mode?: 'lan' | 'point-to-point' | 'host-route';
}

export interface VLSMAllocation {
  requirementId: string;
  name: string;
  requiredHosts: number;
  cidr: string;
  mask: string;
  networkAddress: string;
  firstAssignable: string;
  lastAssignable: string;
  broadcastAddress: string | null;
  totalAddresses: number;
  usableAddresses: number;
}
```

**Important:** `/31` has no conventional directed broadcast address on a point-to-point link; `/32` denotes a single address. The UI should display `Not applicable` for their broadcast fields rather than present a misleading ordinary broadcast address. A generic numeric top-of-range address can still be stored internally separately from `broadcastAddress`.

## 9. Arithmetic and validation rules

- Validate 4 decimal octets exactly in range 0–255; reject empty octets, signs, spaces embedded in octets, extra segments, and leading-zero ambiguity (prefer rejecting `001` rather than interpreting it).
- Require integer CIDR between 0 and 32 inclusive.
- Validate dotted masks as contiguous ones followed by zeros, including `0.0.0.0` and `255.255.255.255`.
- Implement unsigned 32-bit conversions carefully. JavaScript's standard bitwise operators coerce operands to signed 32-bit integers; normalize with `>>> 0` when appropriate, or use `BigInt` internally for clarity and consistent arithmetic.
- Avoid `(1 << 32)` and `1 << 32` because the bit shift count wraps; use `2 ** hostBits` for counts.
- Do not use iteration over every IP address to calculate ranges. Use arithmetic to compute endpoints directly.
- For prefix `/0`, mask all zeroes; network `0.0.0.0`; range ends at `255.255.255.255` (theoretical address count 4,294,967,296).
- For prefix `/31`, expose two assignable endpoints **only when explicitly treated as a point-to-point subnet**; if the user is performing LAN host planning, do not silently recommend `/31`.
- For prefix `/32`, expose one assignable host address, no ordinary broadcast.
- A user's input IP may be a host inside a network: canonicalize by applying mask, but preserve and display original entered IP.
- Source input correction must not mutate user data unexpectedly: show parsed/canonical values separately.
- For IP classification, rely on established IANA special-purpose blocks; do not assume every address outside RFC1918 space is globally routable.

## 10. Detailed test cases

| Scenario | Input | Expected |
|---|---|---|
| Standard subnet | `192.168.1.10/26` | Network `192.168.1.0`, broadcast `.63`, usable `.1–.62`, 62 hosts |
| Standard `/24` | `10.0.1.7/24` | Network `10.0.1.0`, broadcast `10.0.1.255`, 254 usable |
| P2P `/31` | `10.0.0.0/31` | Two endpoints `.0`, `.1`; no conventional broadcast |
| Host `/32` | `10.0.0.5/32` | Single address `10.0.0.5` |
| Default route mask | `203.0.113.4/0` | Network `0.0.0.0`, mask `0.0.0.0`, 2^32 addresses |
| Converter | `/27` | Mask `255.255.255.224`, wildcard `0.0.0.31` |
| FLSM | `192.168.1.0/24`, 4 subnets | Four `/26` subnets |
| VLSM | `192.168.10.0/24`, 100+50+20 | `/25`, `/26`, `/27` sequential valid allocation |
| VLSM overflow | `192.168.1.0/24`, 200+100 | Show insufficient address space error |
| Bad IP | `192.168.1.999/24` | Validation error |
| Bad mask | `255.0.255.0` | Validation error |
| Unaligned parent | `192.168.1.123/24` | Canonical `192.168.1.0/24` with notice |
| FLSM excessive output | `/0` split into many /32s | Pagination/virtualization, no UI freeze |
| High unsigned range | `250.250.250.250/24` | Correct addresses without signed overflow |
| Invalid CIDR | `/33` or `/-1` | Validation error |

Test each pure function with unit tests, UI inputs/outputs with React Testing Library, and critical user flows with Playwright.

## 11. Accessibility, performance and security

- WCAG 2.2 AA target: semantic headings/tables, sufficient contrast, labels, ARIA descriptions where needed, keyboard navigation, visible focus, screen-reader friendly binary descriptions.
- Browser support: recent Chrome, Firefox, Safari, and Edge; responsive from 320px width.
- Instant calculations for ordinary use; use debouncing and/or Web Worker if VLSM plans become large.
- Virtualize or paginate massive FLSM result lists; cap export rows with visible warning and user confirmation.
- No account, cookies, analytics, or data collection required for MVP; only store optional UI preferences locally.
- Escape/encode all labels and CSV cells safely; avoid formula injection in exported spreadsheet CSV (prefix cells starting with `=`, `+`, `-`, `@` or other dangerous patterns).
- Include accessible errors; no direct HTML insertion for user-provided labels.

## 12. Data storage and URL sharing

- React state contains current input and results.
- URL query string stores basic input; e.g. `?ip=192.168.1.10&prefix=26` so users can bookmark or share links.
- Local storage only for theme, language, and optionally recent calculations (opt-in).
- Export data on demand as `.csv` or `.json` via browser file creation. No backend upload.

## 13. Milestones and implementation order

### Phase 1 — Core foundation (MVP)
- Scaffold Vite + React + TypeScript; set up Tailwind, shadcn/ui, lint/format/test tooling.
- Create layout, navigation, theme, reusable input components.
- Build and fully test IPv4 conversion and subnet core.
- Implement Subnet Calculator, CIDR Converter, and Subnet Reference Table.

### Phase 2 — Subnet planners
- Implement FLSM use case and table (pagination/export).
- Implement VLSM use case and allocation visualization.
- Add CSV/JSON export, copy results, URL sharing.

### Phase 3 — Education and polish
- Add binary visualizer, explanations, learning content, sample exercises.
- Test accessibility, responsiveness, navigation, failure states.
- Configure GitHub Pages deployment and automated checks.

### Phase 4 — Future improvements
- IPv6 calculator and subprefix planner using 128-bit BigInt operations.
- IP supernetting / aggregation and CIDR overlap checker.
- Import/export saved subnet projects (JSON), subnet address reservation, private network templates.
- Khmer localization and interactive quizzes.

## 14. Definition of done

- [ ] All specified MVP routes render correctly on desktop and mobile.
- [ ] Calculation engine is UI-independent and passes standard and edge-case tests.
- [ ] `/0`, `/31`, `/32`, invalid masks and overflow are explicitly handled.
- [ ] FLSM and VLSM output is mathematically correct, deterministic and exportable.
- [ ] Bulk results do not freeze browser or create millions of DOM rows.
- [ ] Error messages are clear and accessible.
- [ ] Dark/light theme and copy/share/export features work.
- [ ] Automated lint, type-check, unit tests, E2E smoke test, and production build pass.
- [ ] Deployed static site works on refresh and deep routes.
- [ ] README explains setup, scripts, architecture and deployment.

## 15. Starter project commands

```bash
npm create vite@latest netcalc-pro -- --template react-ts
cd netcalc-pro
npm install
npm install react-router-dom zod lucide-react
npm install tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright
# Follow the latest official shadcn/ui Vite setup guide; configuration may change.
npm run dev
```

Example package scripts to add: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`.

## 16. Deployment guidance

- For Vite production builds, output directory defaults to `dist`.
- For GitHub Pages project repository (e.g. `https://username.github.io/netcalc-pro/`) set Vite `base: '/netcalc-pro/'`; for a root/user site or custom-domain root use `base: '/'`.
- For static hosting without SPA fallback, hash-based routing avoids 404 on route refresh. For Vercel/Netlify use their SPA rewrites if choosing history-based routes.
- Use GitHub Actions to run `npm ci`, typecheck, unit tests, build and deploy.

## 17. References

- React — Build a React app from scratch: https://react.dev/learn/build-a-react-app-from-scratch
- Vite — Getting started: https://vite.dev/guide/
- Vite — Deploying a static site: https://vite.dev/guide/static-deploy
- Tailwind CSS — Vite installation: https://tailwindcss.com/docs/installation/using-vite
- shadcn/ui — Vite installation: https://ui.shadcn.com/docs/installation/vite
- RFC 4632 — CIDR: https://www.rfc-editor.org/info/rfc4632/
- RFC 3021 — `/31` point-to-point: https://www.rfc-editor.org/info/rfc3021/
- MDN — BigInt: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

---

**Implementation priority:** First create the pure IPv4 engine and its test suite, then wire up React UI, then FLSM/VLSM planners. Treat correctness and explanatory clarity as essential product features.
