'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DesignProject, EditorState, ExportFormat } from '@/types';
import type { ImageAsset } from '@/types';
import type { ProjectRepository } from '@/lib/storage/projectRepository';
import { LocalAssetRepository } from '@/lib/storage/assetRepository';
import { defaultTemplates } from '@/features/templates/defaultTemplates';
import { buildPreviewModel } from '@/features/preview/previewModel';
import { buildExportRequest, downloadExport, exportProjectDesign } from '@/features/export/exportService';
import { FabricEditorAdapter, projectBackgroundToEditorBackground, projectBackgroundToEditorElements } from './fabricEditorAdapter';

const assetRepository = new LocalAssetRepository();

async function resolveAssetsForEditor(assetsById: Map<string, ImageAsset>): Promise<Map<string, { name: string; uri: string }>> {
  const resolved = new Map<string, { name: string; uri: string }>();
  for (const [id, asset] of assetsById) {
    const uri = await assetRepository.resolveUri(asset);
    if (uri) resolved.set(id, { name: asset.name, uri });
  }
  return resolved;
}

export function FabricProjectEditor({ project, repository, onBack }: { project: DesignProject; repository: ProjectRepository; onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const adapterRef = useRef<FabricEditorAdapter | null>(null);
  const [zoom, setZoom] = useState(0.28);
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState('');
  const template = defaultTemplates.find((item) => item.id === project.templateId) ?? defaultTemplates[0];
  const model = useMemo(() => buildPreviewModel(project, template), [project, template]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const adapter = new FabricEditorAdapter();
    adapterRef.current = adapter;
    adapter.mount(canvasRef.current, { width: project.size.width, height: project.size.height }).then(async () => {
      if (project.editorState) await adapter.loadState(project.editorState);
      else await adapter.load([...projectBackgroundToEditorElements(project.background, project.size.width, project.size.height), ...model.elements], await resolveAssetsForEditor(model.assetsById), projectBackgroundToEditorBackground(project.background));
      adapter.setZoom(zoom);
    });
    return () => { adapter.destroy(); adapterRef.current = null; };
  }, [model, project, zoom]);

  function applyZoom(nextZoom: number) { setZoom(nextZoom); adapterRef.current?.setZoom(nextZoom); }
  async function save() {
    const editorState: EditorState | undefined = adapterRef.current?.serialize();
    if (!editorState) return;
    await repository.save({ ...project, editorState, updatedAt: new Date().toISOString() });
    setError('');
    setMessage('Saved editor changes.');
  }

  async function exportDesign(format: ExportFormat) {
    const adapter = adapterRef.current;
    if (!adapter) return;
    setExporting(format);
    setError('');
    setMessage('');
    try {
      const result = await exportProjectDesign(adapter, project, buildExportRequest(format));
      downloadExport(result);
      setMessage(`Exported ${result.filename}.`);
    } catch {
      setError('Export failed. Your project and editor changes were not modified.');
    } finally {
      setExporting(null);
    }
  }

  return <main className="mx-auto max-w-7xl p-4 md:p-8"><div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"><aside className="h-fit rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-teal-700">Fabric.js Editor MVP</p><h1 className="mt-2 text-2xl font-bold">{project.name}</h1><p className="mt-3 text-sm text-slate-600">Double-click text to edit. Select objects to move, resize, rotate, delete, or reorder.</p><div className="mt-6 grid grid-cols-2 gap-2"><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.undo()}>Undo</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.redo()}>Redo</button><button className="rounded-xl border px-3 py-2 text-red-600" type="button" onClick={() => adapterRef.current?.deleteSelected()}>Delete</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.bringForward()}>Bring Forward</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => adapterRef.current?.sendBackward()}>Send Backward</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(Math.min(0.8, zoom + 0.08))}>Zoom In</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(Math.max(0.12, zoom - 0.08))}>Zoom Out</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => applyZoom(0.28)}>Reset Zoom</button></div><div className="mt-6 flex flex-wrap gap-2"><button className="rounded-xl bg-slate-900 px-4 py-2 text-white" type="button" onClick={save}>Save</button><button className="rounded-xl border px-4 py-2" type="button" onClick={onBack}>Back</button></div><div className="mt-6 rounded-2xl border p-3"><p className="text-sm font-semibold">Export</p><div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"><button className="rounded-xl bg-teal-700 px-4 py-2 text-white disabled:opacity-60" type="button" disabled={exporting !== null} onClick={() => exportDesign('png')}>{exporting === 'png' ? 'Exporting PNG...' : 'PNG'}</button><button className="rounded-xl bg-teal-700 px-4 py-2 text-white disabled:opacity-60" type="button" disabled={exporting !== null} onClick={() => exportDesign('jpg')}>{exporting === 'jpg' ? 'Exporting JPG...' : 'JPG'}</button></div></div>{error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}{message ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}</aside><section className="min-w-0 overflow-auto rounded-3xl bg-slate-200 p-4"><canvas ref={canvasRef} /></section></div></main>;
}
