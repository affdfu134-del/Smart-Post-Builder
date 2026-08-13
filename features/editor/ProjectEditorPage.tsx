'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DesignProject } from '@/types';
import { LocalProjectRepository } from '@/lib/storage/projectRepository';
import { FabricProjectEditor } from './FabricProjectEditor';

const repository = new LocalProjectRepository();

export function ProjectEditorPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<DesignProject | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    repository.get(projectId).then((loadedProject) => {
      if (!active) return;
      if (!loadedProject) { setStatus('missing'); return; }
      setProject(loadedProject); setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [projectId]);

  if (status === 'loading') return <main className="p-8 text-center">Loading editor...</main>;
  if (status === 'missing') return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Project not found</h1><p className="mt-2 text-slate-600">Create a new project first or check the project link.</p></main>;
  if (status === 'error' || !project) return <main className="p-8 text-center"><h1 className="text-2xl font-bold">Could not load project</h1><p className="mt-2 text-slate-600">An unexpected storage error occurred.</p></main>;

  return <FabricProjectEditor project={project} repository={repository} onBack={() => router.push('/projects/new')} />;
}
