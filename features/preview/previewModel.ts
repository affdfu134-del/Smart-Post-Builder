import type { DesignElement, DesignProject, ImageAsset, TemplateDefinition } from '@/types';
import { smartLayoutEngine } from '../../lib/layout-engine/smartLayout.ts';

export interface PreviewModel {
  project: DesignProject;
  elements: DesignElement[];
  assetsById: Map<string, ImageAsset>;
}

export function buildPreviewModel(project: DesignProject, template: TemplateDefinition): PreviewModel {
  const elements = smartLayoutEngine.generate({ project, template });
  return { project, elements, assetsById: collectAssets(project) };
}

export function collectAssets(project: DesignProject): Map<string, ImageAsset> {
  const assets = new Map<string, ImageAsset>();
  if (project.logo) assets.set(project.logo.id, project.logo);
  if (project.background?.kind === 'image') assets.set(project.background.image.id, project.background.image);
  for (const person of project.people) {
    if (person.image) assets.set(person.image.id, person.image);
  }
  return assets;
}

export function visiblePeopleCount(elements: DesignElement[]): number {
  return new Set(elements.flatMap((element) => element.kind === 'image' && element.role === 'person-photo' && element.personId ? [element.personId] : [])).size;
}
