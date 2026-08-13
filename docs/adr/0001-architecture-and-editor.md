# ADR 0001: Architecture and Editor Choice

## Status
Accepted for MVP scaffold.

## Context
Smart Post Builder needs automatic layout, reusable templates, local-first storage, future Supabase sync, and eventual Android/iOS/iPadOS delivery through Capacitor.

## Decision
Use Next.js, TypeScript, Tailwind CSS, local-first repository interfaces, and a feature-oriented structure. Choose Fabric.js for the MVP editor adapter.

## Editor Evaluation
- Fabric.js: strong object model, on-canvas text editing, image manipulation, built-in controls, JSON serialization, SVG import/export helpers, and a mature editing-focused API.
- Konva.js: strong performance, layers, animations, React integration, and JSON serialization, but images and handlers require app-managed restoration and React Native support is not available through react-konva.

## Rationale
Fabric.js better matches the MVP's editing-heavy requirements: text editing, resizing, images, serialization, and export. Future mobile support is handled by Capacitor wrapping the web app, so browser canvas compatibility is more important than native canvas bindings.

## Consequences
- Keep editor usage behind `EditorAdapter` so Fabric.js can be replaced later.
- Store domain project data separately from canvas-library serialization.
- Keep smart crop behind `SmartCropProvider` to allow future face/subject detection.

## Sources Checked
- Fabric.js official site/docs mention interactive object model, text editing, serialization, and SVG/canvas conversion.
- Konva official docs mention stage JSON serialization while noting images and event handlers are not serialized.
- react-konva package documentation states React Native is not currently supported.
