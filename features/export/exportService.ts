import type { DesignProject, EditorState, ExportFormat } from '@/types';
import type { EditorAdapter } from '@/features/editor/editorAdapter';

export interface ExportPreset { id: string; label: string; width: number; height: number; }
export interface ExportRequest { format: ExportFormat; quality?: number; preset?: ExportPreset; }
export interface ExportResult { blob: Blob; filename: string; width: number; height: number; format: ExportFormat; }

export const defaultJpegQuality = 0.92;
export const currentCanvasExportPreset = (project: DesignProject): ExportPreset => ({ id: project.size.id, label: project.size.label, width: project.size.width, height: project.size.height });

export function sanitizeExportFilename(projectName: string, format: ExportFormat): string {
  const safeName = projectName.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'untitled-project';
  return `smart-post-builder-${safeName}.${format === 'jpg' ? 'jpg' : 'png'}`;
}

export function buildExportRequest(format: ExportFormat, quality = defaultJpegQuality): ExportRequest {
  return format === 'jpg' ? { format, quality } : { format };
}

export function canExportEditorState(project: DesignProject): boolean {
  return !project.editorState || (project.editorState.width === project.size.width && project.editorState.height === project.size.height);
}

export async function exportProjectDesign(adapter: EditorAdapter, project: DesignProject, request: ExportRequest): Promise<ExportResult> {
  const preset = request.preset ?? currentCanvasExportPreset(project);
  const beforeState: EditorState = structuredClone(adapter.serialize());
  const blob = await adapter.export(request.format, { width: preset.width, height: preset.height, quality: request.quality });
  const afterState = adapter.serialize();
  if (JSON.stringify(beforeState) !== JSON.stringify(afterState)) throw new Error('Export changed the editor state unexpectedly.');
  return { blob, filename: sanitizeExportFilename(project.name, request.format), width: preset.width, height: preset.height, format: request.format };
}

export function downloadExport(result: ExportResult): void {
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
