import type { ProjectType, TemplateDefinition } from '@/types';

export interface TemplateMetadata { id: string; name: string; type: ProjectType; description?: string; }
export interface TemplateLayoutRules { columns?: number; headerRatio: number; footerRatio: number; gapRatio: number; photoRatio: number; }
export interface TemplateConfiguration { supports: TemplateDefinition['supports']; tokens: Record<string, string>; layout: TemplateLayoutRules; }
export type RegisteredTemplate = TemplateDefinition & { metadata: TemplateMetadata; configuration: TemplateConfiguration };

export const templateRegistry: RegisteredTemplate[] = [
  {
    id: 'medical-clean', name: 'Medical Clean', type: 'medical',
    supports: { minPeople: 1, maxPeople: 20, sizes: ['instagram-portrait', 'instagram-square', 'a4'] },
    description: 'Clean medical staff layout for doctors, clinics, and shifts.', tokens: { headline: 'الطاقم الطبي', accent: 'primaryColor' },
    metadata: { id: 'medical-clean', name: 'Medical Clean', type: 'medical', description: 'Clean medical staff layout for doctors, clinics, and shifts.' },
    configuration: { supports: { minPeople: 1, maxPeople: 20, sizes: ['instagram-portrait', 'instagram-square', 'a4'] }, tokens: { headline: 'الطاقم الطبي', accent: 'primaryColor' }, layout: { headerRatio: 0.13, footerRatio: 0.1, gapRatio: 0.025, photoRatio: 0.62 } },
  },
  {
    id: 'general-grid', name: 'General Grid', type: 'general',
    supports: { minPeople: 1, sizes: ['instagram-portrait', 'instagram-square', 'facebook-post'] },
    description: 'Flexible grid layout for teams, staff, events, and general posts.', tokens: { headline: 'فريق العمل', accent: 'primaryColor' },
    metadata: { id: 'general-grid', name: 'General Grid', type: 'general', description: 'Flexible grid layout for teams, staff, events, and general posts.' },
    configuration: { supports: { minPeople: 1, sizes: ['instagram-portrait', 'instagram-square', 'facebook-post'] }, tokens: { headline: 'فريق العمل', accent: 'primaryColor' }, layout: { headerRatio: 0.12, footerRatio: 0.09, gapRatio: 0.022, photoRatio: 0.6 } },
  },
];

export function getTemplateById(id: string): RegisteredTemplate | undefined { return templateRegistry.find((template) => template.id === id); }
export function getTemplatesForType(type: ProjectType): RegisteredTemplate[] { return templateRegistry.filter((template) => template.type === type || template.type === 'general'); }
export function templateSupportsProject(template: TemplateDefinition, peopleCount: number, sizeId: string): boolean { return peopleCount >= template.supports.minPeople && (template.supports.maxPeople === undefined || peopleCount <= template.supports.maxPeople) && template.supports.sizes.includes(sizeId); }
