import type { DesignProject } from '@/types';

export type ProjectValidationError = { field: 'name' | 'type' | 'canvas' | 'templateId' | 'people'; message: string };

export function validateProject(project: DesignProject): ProjectValidationError[] {
  const errors: ProjectValidationError[] = [];
  if (!project.name.trim()) errors.push({ field: 'name', message: 'Project name is required.' });
  if (!project.type) errors.push({ field: 'type', message: 'Project type is required.' });
  if (!project.size?.id) errors.push({ field: 'canvas', message: 'Canvas size is required.' });
  if (!project.templateId) errors.push({ field: 'templateId', message: 'Template is required.' });
  if (project.people.length === 0) errors.push({ field: 'people', message: 'Add at least one person.' });
  return errors;
}

export function isValidProject(project: DesignProject): boolean {
  return validateProject(project).length === 0;
}
