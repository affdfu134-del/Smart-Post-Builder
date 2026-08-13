import type { DesignElement, DesignProject, TemplateDefinition } from '@/types';

export interface LayoutContext { project: DesignProject; template: TemplateDefinition; }
export interface LayoutEngine { generate(context: LayoutContext): DesignElement[]; }
