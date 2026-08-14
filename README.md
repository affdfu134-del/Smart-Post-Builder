# Smart Post Builder

Smart Post Builder is a local-first web application for generating professional posts from people data, brand assets, templates, and export sizes. The repository now contains the MVP architecture, New Project flow, Preview flow, Fabric.js editor MVP, persistent local asset storage, and an extensible template registry.

## Phase Status

- **Phase 1 — Scaffold & Architecture:** verified. Next.js App Router scaffold, shared domain types, storage boundaries, canvas presets, layout engine contracts, docs, and tests are present.
- **Phase 2 — New Project:** verified. `/projects/new` supports project metadata, canvas size, template selection, people management, logo/background inputs, date/hours options, validation, saving, and redirecting.
- **Phase 3 — Project Preview:** verified. `/projects/[projectId]` loads saved projects, generates a `PreviewModel` through `smartLayoutEngine`, and retains the React preview renderer for the same model.
- **Phase 4 — Fabric.js Editor MVP:** verified in this environment on 2026-08-13. `npm install`, `npm test`, `npm run typecheck`, and `npm run build` complete successfully. The editor boundary supports selection, move/resize/rotation through Fabric controls, text editing, delete, bring forward, send backward, zoom, save, and reload from `editorState`.
- **Phase 5 — Persistent Local Asset Storage:** verified. Uploaded person images, logos, and background images are converted to persistent local data URIs through `AssetRepository` instead of long-lived object URLs. The abstraction handles replace/delete flows and exposes fallback resolution for missing or unavailable assets.
- **Phase 6 — Extensible Template System:** verified. Templates are registered with separated metadata, configuration, support rules, and layout rules before being consumed by `smartLayoutEngine` and renderers. Current templates remain `medical-clean` and `general-grid`.
- **Phase 7 — Export Engine & PNG/JPG Export UI:** verified. The Project Editor now exports the current Fabric editor design as PNG or JPG at the original canvas dimensions, uses sanitized filenames, preserves editor state during export, and keeps future export presets behind a small export service abstraction.

## Architecture

The project separates responsibilities by feature and shared infrastructure:

- `app/`: Next.js App Router entry points, including `/projects/new` and `/projects/[projectId]`.
- `features/projects/`: project creation UI, validation, and create-project orchestration.
- `features/people/`: future people library.
- `features/templates/`: template registry, metadata, support configuration, and layout rules.
- `features/preview/`: `PreviewModel` creation and React preview rendering.
- `features/editor/`: editor adapter boundary and Fabric.js implementation.
- `features/export/`: export service orchestration, filename sanitization, current-canvas export presets, and PNG/JPG export requests.
- `features/branding/`: future brand kit management.
- `lib/canvas/`: reusable canvas size presets.
- `lib/layout-engine/`: auto-layout contracts and `smartLayoutEngine` implementation.
- `lib/image-processing/`: smart crop provider contracts.
- `lib/storage/`: local-first `ProjectRepository`, replaceable `AssetRepository`, and test-friendly in-memory repository.
- `types/`: shared TypeScript domain model.
- `docs/`: specification and Architecture Decision Records.
- `tests/`: automated tests.

The main flow is intentionally kept as:

`Project → Template → smartLayoutEngine → PreviewModel → Preview Renderer → Fabric Editor Renderer`

Storage, asset storage, project repository, and editor state remain separate boundaries. React components and Fabric objects are not the sole source of truth for the domain model.

## Local Asset Storage

`AssetRepository` is the local-first image boundary. The current implementation stores uploaded files as data URIs in browser `localStorage`, keeping saved project images available after the current browser session. UI code asks the repository to save, replace, or remove assets; this keeps future cloud storage such as Supabase Storage replaceable without rewriting project, preview, or editor logic.

Missing or unavailable assets resolve to a local fallback image. Project data continues to reference `ImageAsset` objects by ID and URI, while Fabric editor serialization stores editor state separately under `project.editorState`.

## Template System

Templates are defined in `features/templates/templateRegistry.ts` with:

- metadata: ID, name, type, description;
- configuration: supported people counts and canvas sizes;
- layout rules: ratios and optional column overrides used by `smartLayoutEngine`;
- tokens: reusable text/color tokens.

The current registry includes:

- `medical-clean`
- `general-grid`

Additional future template categories such as school, company, event, team, staff, and general can be added by registering new metadata/configuration/rules without rewriting Fabric.js or duplicating layout calculations in renderers.


## Export System

The Project Editor includes a compact Export panel with PNG and JPG actions. Export uses the mounted `EditorAdapter`, so it exports the current design in the editor: saved `editorState` when manual edits exist, or the generated `PreviewModel` layout when no manual edits exist.

PNG export preserves transparency when the design allows it. JPG export uses a quality setting and ensures a non-transparent background color so the result is predictable. Both formats export at the original canvas width and height and do not include editor toolbar UI, Fabric controls, or extra margins.

Export file names use the pattern `smart-post-builder-project-name.png` or `smart-post-builder-project-name.jpg` after sanitizing the project name. The current implementation exports only the active canvas size; future presets such as Instagram Portrait, Instagram Square, Instagram Story, Facebook Post, WhatsApp Status, and A4 Portrait can reuse the same `ExportPreset` shape without duplicating export logic.

## Product Architecture Readiness

The code does not implement payments, subscriptions, authentication, Stripe, Supabase, or cloud sync. The current separation leaves room for future plan/entitlement concepts (Free, Standard, Pro), usage limits, and feature flags without coupling them to editor rendering, project storage, or template layout.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000/projects/new.

## Test

```bash
npm test
npm run typecheck
npm run build
```

## Remaining MVP TODOs

- Add multi-size export preset UI when product requirements demand it.
- Add richer canvas size presets if product requirements demand them.
- Add future plan/entitlement interfaces only when paid product work starts.
