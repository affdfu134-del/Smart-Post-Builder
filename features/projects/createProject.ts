import type { DesignProject, ProjectType } from '@/types';
import type { ProjectRepository } from '../../lib/storage/projectRepository.ts';
import { smartLayoutEngine } from '../../lib/layout-engine/smartLayout.ts';
import { validateProject } from './projectValidation.ts';
import { defaultTemplates } from '../templates/defaultTemplates.ts';
import { canvasSizePresets } from '../../lib/canvas/presets.ts';

export type CreateProjectResult = { ok: true; project: DesignProject } | { ok: false; errors: ReturnType<typeof validateProject> };

export async function createProject(project: DesignProject, repository: ProjectRepository): Promise<CreateProjectResult> {
  const errors = validateProject(project);
  if (errors.length > 0) return { ok: false, errors };
  const template = defaultTemplates.find((item) => item.id === project.templateId) ?? defaultTemplates[0];
  const projectToSave = { ...project, elements: smartLayoutEngine.generate({ project, template }), updatedAt: new Date().toISOString() };
  await repository.save(projectToSave);
  return { ok: true, project: projectToSave };
}

export function createEmptyProject(id = crypto.randomUUID()): DesignProject {
  return {
    id,
    name: '',
    type: 'medical' satisfies ProjectType,
    size: canvasSizePresets[0],
    people: [],
    templateId: defaultTemplates[0]?.id ?? '',
    elements: [],
    background: { kind: 'color', color: '#f8fafc' },
    updatedAt: new Date().toISOString(),
  };
}
