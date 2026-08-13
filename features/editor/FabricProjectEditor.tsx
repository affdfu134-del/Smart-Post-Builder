'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DesignProject, EditorState } from '@/types';
import type { ProjectRepository } from '@/lib/storage/projectRepository';
import { defaultTemplates } from '@/features/templates/defaultTemplates';
import { buildPreviewModel } from '@/features/preview/previewModel';
import { FabricEditorAdapter, projectBackgroundToEditorBackground } from './fabricEditorAdapter';

export function FabricProjectEditor({ project, repository, onBack }: { project: DesignProject; repository: ProjectRepository; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const adapterRef = useRef<FabricEditorAdapter | null>(null);
  const [zoom, setZoom] = useState(0.28);
  const [message, setMessage] = useState('');
  const template = defaultTemplates.find((item) => item.id === project.templateId) ?? defaultTemplates[0];
  const model = useMemo(() => buildPreviewModel(project, template), [project, template]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const adapter = new FabricEditorAdapter();
    adapterRef.current = adapter;
    adapter.mount(canvasRef.current, { width: project.size.width, height: project.size.height }).then(async () => {
      if (project.editorState) await adapter.loadState(project.editorState);
      else await adapter.load(model.elements, model.assetsById, projectBackgroundToEditorBackground(project.background));
      adapter.setZoom(zoom);
    });
    return () => { adapter.destroy(); adapterRef.current = null; };
  }, [model, project, zoom]);

  function applyZoom(nextZoom: number) { setZoom(nextZoom); adapterRef.current?.setZoom(nextZoom); }
  async function save() {
    const editorState: EditorState | undefined = adapterRef.current?.serialize();
    if (!editorState) return;
    await repository.save({ ...project, editorState, updatedAt: new Date().toISOString() });
    setMessage('Saved editor changes.');
  }

  return <main className="mx-auto max-w-7xl p-4 md:p-8"><div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"><aside className="h-fit rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-teal-700">Fabric.js Editor MVP</p><h1 className="mt-2 text-2xl font-bold">{project.name}</h1><p className="mt-3 text-sm text-slate-600">Double-click text to edit. Select objects to move, resize, rotate, delete, or reorder.</p><div className="mt-6 grid grid-cols-2 gap-2"><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.undo()}>Undo</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.redo()}>Redo</button><button className="rounded-xl border px-3 py-2 text-red-600" type="button" onClick={() => adapterRef.current?.deleteSelected()}>Delete</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.bringForward()}>Bring Forward</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.sendBackward()}>Send Backward</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(Math.min(0.8, zoom + 0.08))}>Zoom In</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(Math.max(0.12, zoom - 0.08))}>Zoom Out</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(0.28)}>Reset Zoom</button></div><div className="mt-6 flex gap-2"><button className="rounded-xl bg-slate-900 px-4 py-2 text-white" type="button" onClick={save}>Save</button><button className="rounded-xl border px-4 py-2" type="button" onClick={onBack}>Back</button></div>{message ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}</aside><section className="min-w-0 overflow-auto rounded-3xl bg-slate-200 p-4"><canvas ref={canvasRef} /></section></div></main>;
}
