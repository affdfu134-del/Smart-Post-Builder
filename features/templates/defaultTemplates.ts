import type { TemplateDefinition } from '@/types';

export const defaultTemplates: TemplateDefinition[] = [
  { id: 'medical-clean', name: 'Medical Clean', type: 'medical', supports: { minPeople: 1, maxPeople: 20, sizes: ['instagram-portrait', 'instagram-square', 'a4'] }, description: 'Clean medical staff layout for doctors, clinics, and shifts.', tokens: { headline: 'الطاقم الطبي', accent: 'primaryColor' } },
  { id: 'general-grid', name: 'General Grid', type: 'general', supports: { minPeople: 1, sizes: ['instagram-portrait', 'instagram-square', 'facebook-post'] }, description: 'Flexible grid layout for teams, staff, events, and general posts.', tokens: { headline: 'فريق العمل', accent: 'primaryColor' } },
];
