'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DesignProject } from '@/types';
import { LocalProjectRepository } from '@/lib/storage/projectRepository';
import { defaultTemplates } from '@/features/templates/defaultTemplates';
import { buildPreviewModel } from './previewModel';
import { ProjectPreviewCanvas } from './ProjectPreviewCanvas';

const repository = new LocalProjectRepository();

export function ProjectPreviewPage({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<DesignProject | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [zoom, setZoom] = useState(0.28);

  useEffect(() => {
    let active = true;
    repository.get(projectId).then((loadedProject) => {
      if (!active) return;
      if (!loadedProject) { setStatus('missing'); return; }
      setProject(loadedProject); setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [projectId]);

  const template = defaultTemplates.find((item) => item.id === project?.templateId) ?? defaultTemplates[0];
  const model = useMemo(() => project ? buildPreviewModel(project, template) : null, [project, template]);

  if (status === 'loading') return <main className="p-8 text-center">Loading project preview...</main>;
  if (status === 'missing') return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Project not found</h1><p className="mt-2 text-slate-600">Create a new project first or check the project link.</p></main>;
  if (status === 'error' || !model) return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Could not load project</h1><p className="mt-2 text-slate-600">An unexpected storage error occurred.</p></main>;

  return <main className="mx-auto max-w-7xl p-4 md:p-8"><div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="h-fit rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-teal-700">Project Preview</p><h1 className="mt-2 text-2xl font-bold">{model.project.name}</h1><dl className="mt-4 space-y-2 text-sm"><div><dt className="text-slate-500">Canvas</dt><dd>{model.project.size.label} — {model.project.size.width}x{model.project.size.height}</dd></div><div><dt className="text-slate-500">People</dt><dd>{model.project.people.length}</dd></div><div><dt className="text-slate-500">Template</dt><dd>{template.name}</dd></div></dl><div className="mt-6 flex flex-wrap gap-2"><button className="rounded-xl border px-3 py-2" type="button" onClick={() => setZoom((value) => Math.min(0.8, value + 0.08))}>Zoom In</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => setZoom((value) => Math.max(0.12, value - 0.08))}>Zoom Out</button><button className="rounded-xl border px-3 py-2" type="button" onClick={() => setZoom(0.28)}>Reset Zoom</button></div></aside><section className="flex min-w-0 justify-center"><ProjectPreviewCanvas model={model} zoom={zoom} /></section></div></main>;
}
