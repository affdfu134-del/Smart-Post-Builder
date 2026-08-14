import type { DesignElement, EditorState, ExportFormat } from '@/types';

export interface EditorExportOptions { width?: number; height?: number; quality?: number; backgroundColor?: string; }

export interface EditorAdapter {
  mount(container: HTMLCanvasElement, options: { width: number; height: number }): Promise<void> | void;
  load(elements: DesignElement[], assetsById?: Map<string, { name: string; uri: string }>, background?: string): Promise<void> | void;
  loadState(state: EditorState): Promise<void> | void;
  addElement(element: DesignElement): Promise<void> | void;
  updateElement(elementId: string, update: Partial<DesignElement>): void;
  removeElement(elementId: string): void;
  deleteSelected(): void;
  selectElement(elementId: string): void;
  bringForward(): void;
  sendBackward(): void;
  undo(): void;
  redo(): void;
  setZoom(zoom: number): void;
  serialize(): EditorState;
  export(format: ExportFormat, options?: EditorExportOptions): Promise<Blob>;
  destroy(): void;
}

export const selectedEditorLibrary = 'fabric.js' as const;
