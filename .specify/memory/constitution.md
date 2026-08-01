<!--
Sync Impact Report
- Version: unversioned template → 1.0.0 (initial ratification)
- Modified principles: none — all five principles defined for the first time
- Added sections: Core Principles (I–V), Technology Stack & Configuration,
  Development Workflow & Quality Gates, Governance
- Removed sections: none
- Deferred TODOs: none
-->

# Laboratory Tests Lookup Constitution

## Core Principles

### I. Lightweight Frontend-Only

The application is a lightweight web application (frontend only). All
functionality MUST run client-side in the browser; no backend server,
database, or API layer is permitted. Rationale: static hosting keeps
deployment trivial and the project free of operational burden.

### II. Stack Parity with Set-Ops (NON-NEGOTIABLE)

The project MUST use the same libraries and be configured the same way as
https://github.com/YuBil/set-ops: React 19 + TypeScript + Vite + Tailwind
CSS v4 + Vitest, with the ESLint flat config. Library versions, build
scripts, tsconfig settings, and tooling configuration MUST mirror that
repository. Any deviation requires a ratified constitution amendment.
Rationale: a proven, minimal toolchain that keeps onboarding and
maintenance costs low.

### III. Minimal Dependency Footprint

Only the dependencies present in the set-ops stack are permitted. No
router, state-management library, UI component kit, or other runtime
dependency MAY be added unless its necessity is documented and ratified.
Rationale: the application is lightweight by definition; every added
dependency must earn its place.

### IV. Tested Pure Logic

All domain logic MUST live in `src/services/` as pure functions with no
React or UI coupling, and each service MUST have a colocated `*.test.ts`
suite run by Vitest. Logic that cannot be tested as pure functions is not
acceptable. Rationale: unit-testable core logic is the primary quality
gate for a frontend-only application.

### V. Type Safety and Lint Gates

The TypeScript configuration MUST remain strict (bundler module
resolution, `noEmit`, `noUnusedLocals`, `noUnusedParameters`,
`verbatimModuleSyntax`), and the ESLint flat config MUST pass with zero
errors. Rationale: the compiler and linter are the cheapest correctness
guarantees available to a client-only app.

## Technology Stack & Configuration

The project mirrors the set-ops reference repository exactly:

- Runtime: React 19 + ReactDOM 19, TypeScript (strict, `tsc -b` build)
- Build: Vite with `@vitejs/plugin-react` and `@tailwindcss/vite`
- Styling: Tailwind CSS v4 (no `tailwind.config` file required)
- Testing: Vitest (watch mode by default; `--run` for CI)
- Linting: ESLint flat config (`eslint.config.js`) with
  `typescript-eslint`, `eslint-plugin-react-hooks`,
  `eslint-plugin-react-refresh`, and `globals`
- Scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`,
  `test`
- TypeScript: root `tsconfig.json` referencing `tsconfig.app.json` (app)
  and `tsconfig.node.json` (Vite config)
- Vite: `base` set for GitHub Pages deployment; plugins `react()` and
  `tailwindcss()`
- CI: Node 20, `npm ci`, deploy `dist/` to GitHub Pages via
  `peaceiris/actions-gh-pages` on push to `main`

## Development Workflow & Quality Gates

- Source layout MUST follow `src/components`, `src/hooks`, `src/services`,
  `src/types`; tests live alongside the code they cover (`*.test.ts`).
- A change is mergeable only if `npm run build`, `npm run lint`, and
  `npm test -- --run` all pass.
- Production artifacts are built with `npm run build` and deployed to
  static hosting from `dist/`; no server-side processing may be introduced.
- Every PR MUST be reviewed for compliance with this constitution.

## Governance

This constitution supersedes all other development practices. Amendments
MUST be documented, approved, and versioned before taking effect.

- Versioning follows semantic versioning:
  - MAJOR: backward-incompatible removal or redefinition of principles.
  - MINOR: a new principle or section, or materially expanded guidance.
  - PATCH: clarifications, wording, and non-semantic refinements.
- The ratification date is fixed at original adoption; the last-amended
  date is updated whenever the constitution changes.
- All PRs and reviews MUST verify compliance with these principles;
  complexity and dependency additions MUST be justified.

**Version**: 1.0.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-01
