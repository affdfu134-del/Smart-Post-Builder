# Smart Post Builder

Smart Post Builder is a planned local-first web application for generating professional posts automatically from people data, brand assets, templates, and export sizes. The current repository contains the MVP architecture scaffold plus a usable **New Project** flow.

## Architecture

The project separates responsibilities by feature and shared infrastructure:

- `app/`: Next.js App Router entry points, including `/projects/new` and the placeholder project editor route.
- `components/`: shared UI components.
- `features/projects/`: project creation UI, validation, and create-project orchestration.
- `features/people/`: future people library.
- `features/templates/`: reusable template definitions.
- `features/editor/`: editor adapter boundary; currently targets Fabric.js.
- `features/export/`: future PNG/JPG export orchestration.
- `features/branding/`: future brand kit management.
- `lib/canvas/`: reusable canvas size presets.
- `lib/layout-engine/`: auto-layout contracts and starter implementation.
- `lib/image-processing/`: smart crop provider contracts.
- `lib/storage/`: local-first repository interfaces and test-friendly in-memory repository.
- `types/`: shared TypeScript domain model.
- `docs/`: specification and Architecture Decision Records.
- `tests/`: automated tests.

## New Project Flow

Open `/projects/new` to create a local-first project. The screen supports project name, type, canvas size, template selection, people add/edit/delete/reorder, person image previews, logo preview/removal, background color or image, optional date, optional working hours, validation, repository saving, and redirecting to the project preview page.

## Project Preview Flow

Open `/projects/[projectId]` to load a saved project through `ProjectRepository`, build a `PreviewModel` from `smartLayoutEngine`, and open the Fabric.js Editor MVP. The Phase 3 preview renderer remains available as a separate renderer for the same `PreviewModel`.

## Editor MVP Flow

The editor uses `EditorAdapter` plus `FabricEditorAdapter` so Fabric.js stays behind a boundary. It dynamically imports Fabric.js on the client, converts layout elements to Fabric object descriptors with `elementId`, `elementRole`, and `personId` metadata, supports move/resize/rotation/selection/text editing/delete/reorder/zoom, and stores manual edits in `project.editorState` instead of replacing the domain project model.

## Editor Decision

Fabric.js is selected for the MVP because it is editing-oriented: object controls, text editing, image support, serialization, and export-friendly canvas behavior. Konva.js remains a viable future option for high-performance scene graphs, but the editor is isolated behind `EditorAdapter` so the decision can be revisited.

See `docs/adr/0001-architecture-and-editor.md` for the full decision record.

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
```

## MVP TODOs

- Implement Fabric.js canvas adapter.
- Connect generated layout elements to the editor.
- Add manual move/resize/text editing controls.
- Add PNG/JPG export.
- Persist richer project assets beyond object URL previews.
- Expand template registry and canvas size presets.
