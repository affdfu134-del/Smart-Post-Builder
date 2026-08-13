import type { DesignElement } from '@/types';
import type { LayoutContext, LayoutEngine } from './types';

export function selectLayoutMode(peopleCount: number): 'single' | 'double' | 'grid' | 'advanced-grid' | 'dense' | 'paged' {
  if (peopleCount <= 1) return 'single';
  if (peopleCount === 2) return 'double';
  if (peopleCount <= 6) return 'grid';
  if (peopleCount <= 10) return 'advanced-grid';
  if (peopleCount <= 20) return 'dense';
  return 'paged';
}

function columnsForMode(mode: ReturnType<typeof selectLayoutMode>): number {
  if (mode === 'single') return 1;
  if (mode === 'double') return 2;
  if (mode === 'advanced-grid') return 4;
  if (mode === 'dense') return 5;
  return 3;
}

export const smartLayoutEngine: LayoutEngine = {
  generate({ project }: LayoutContext): DesignElement[] {
    const canvas = project.size;
    const mode = selectLayoutMode(project.people.length);
    const columns = columnsForMode(mode);
    const gap = Math.max(20, Math.round(canvas.width * 0.025));
    const headerHeight = Math.round(canvas.height * 0.13);
    const footerHeight = project.date?.enabled || project.workingHours?.enabled ? Math.round(canvas.height * 0.1) : gap;
    const availableWidth = canvas.width - gap * (columns + 1);
    const cardWidth = Math.floor(availableWidth / columns);
    const rows = Math.max(1, Math.ceil(project.people.length / columns));
    const availableHeight = Math.max(240, canvas.height - headerHeight - footerHeight - gap * (rows + 1));
    const cardHeight = Math.floor(availableHeight / rows);
    const photoHeight = Math.max(120, Math.floor(cardHeight * 0.62));
    const nameFontSize = Math.max(24, Math.min(42, Math.round(cardWidth * 0.09)));
    const detailFontSize = Math.max(18, Math.round(nameFontSize * 0.68));
    const elements: DesignElement[] = [];

    if (project.logo) {
      elements.push({ id: 'project-logo', kind: 'image', assetId: project.logo.id, x: gap, y: gap, width: Math.round(canvas.width * 0.16), height: Math.round(headerHeight * 0.65), fit: 'contain', role: 'logo' });
    }

    elements.push({ id: 'project-title', kind: 'text', text: project.name, role: 'title', x: project.logo ? Math.round(canvas.width * 0.22) : gap, y: gap, width: project.logo ? Math.round(canvas.width * 0.72) : canvas.width - gap * 2, height: Math.round(headerHeight * 0.55), fontSize: Math.max(36, Math.round(canvas.width * 0.045)), color: project.brandKit?.primaryColor ?? '#0f766e' });

    project.people.forEach((person, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = gap + column * (cardWidth + gap);
      const y = headerHeight + gap + row * (cardHeight + gap);
      elements.push({ id: `${person.id}-photo`, kind: 'image', assetId: person.image?.id ?? 'placeholder-person', x, y, width: cardWidth, height: photoHeight, fit: 'cover', role: 'person-photo', personId: person.id });
      elements.push({ id: `${person.id}-name`, kind: 'text', text: person.name || 'Unnamed person', role: 'name', x, y: y + photoHeight + 12, width: cardWidth, height: nameFontSize + 8, fontSize: nameFontSize, color: project.brandKit?.primaryColor ?? '#0f766e', personId: person.id });
      if (person.specialty) elements.push({ id: `${person.id}-specialty`, kind: 'text', text: person.specialty, role: 'specialty', x, y: y + photoHeight + nameFontSize + 24, width: cardWidth, height: detailFontSize + 6, fontSize: detailFontSize, color: '#334155', personId: person.id });
      if (person.degreeTitle) elements.push({ id: `${person.id}-degree`, kind: 'text', text: person.degreeTitle, role: 'degree', x, y: y + photoHeight + nameFontSize + detailFontSize + 34, width: cardWidth, height: detailFontSize + 6, fontSize: detailFontSize, color: '#64748b', personId: person.id });
    });

    const footerY = canvas.height - footerHeight + Math.round(gap * 0.25);
    if (project.date?.enabled && project.date.value) {
      elements.push({ id: 'project-date', kind: 'text', text: project.date.value, role: 'date', x: gap, y: footerY, width: Math.round(canvas.width * 0.42), height: 42, fontSize: Math.max(22, Math.round(canvas.width * 0.026)), color: '#0f172a' });
    }
    if (project.workingHours?.enabled && (project.workingHours.from || project.workingHours.to)) {
      elements.push({ id: 'project-working-hours', kind: 'text', text: `${project.workingHours.from ?? ''} → ${project.workingHours.to ?? ''}`.trim(), role: 'hours', x: Math.round(canvas.width * 0.52), y: footerY, width: canvas.width - Math.round(canvas.width * 0.52) - gap, height: 42, fontSize: Math.max(22, Math.round(canvas.width * 0.026)), color: '#0f172a' });
    }

    return elements;
  },
};
