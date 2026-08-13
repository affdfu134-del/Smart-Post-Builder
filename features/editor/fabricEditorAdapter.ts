import type { DesignElement, EditorObjectState, EditorState, ExportFormat, ProjectBackground } from '@/types';
import type { EditorAdapter } from './editorAdapter';
import { designElementToFabricDescriptor, descriptorsToEditorState } from './fabricObjectMapper';
import { EditorHistory } from './editorHistory';

type FabricCanvas = any;
type FabricObject = any;

function backgroundToCss(background: ProjectBackground | undefined): string | undefined {
  if (!background) return undefined;
  if (background.kind === 'color') return background.color;
  return background.color;
}

export class FabricEditorAdapter implements EditorAdapter {
  private fabric: any;
  private canvas: FabricCanvas | null = null;
  private width = 0;
  private height = 0;
  private history = new EditorHistory();
  private restoring = false;

  async mount(element: HTMLCanvasElement, options: { width: number; height: number }) {
    const fabricModule = await import('fabric');
    this.fabric = fabricModule;
    this.width = options.width;
    this.height = options.height;
    this.canvas = new fabricModule.Canvas(element, { width: options.width, height: options.height, preserveObjectStacking: true, selection: true });
    this.canvas.on('object:modified', () => this.captureHistory());
    this.canvas.on('object:removed', () => this.captureHistory());
    this.canvas.on('text:changed', () => this.captureHistory());
  }

  async load(elements: DesignElement[], assetsById = new Map<string, { name: string; uri: string }>(), background?: string) {
    if (!this.canvas) return;
    this.canvas.clear();
    this.canvas.backgroundColor = background;
    for (const element of elements) await this.addElement(element, assetsById.get(element.kind === 'image' ? element.assetId : '')?.uri);
    this.canvas.renderAll();
    this.captureHistory(true);
  }

  async loadState(state: EditorState) {
    if (!this.canvas) return;
    this.canvas.clear();
    this.width = state.width; this.height = state.height;
    this.canvas.setDimensions({ width: state.width, height: state.height });
    this.canvas.backgroundColor = state.background;
    for (const object of state.objects) await this.addObjectFromState(object);
    this.canvas.renderAll();
    this.captureHistory(true);
  }

  async addElement(element: DesignElement, assetUri?: string) { await this.addObjectFromState(designElementToFabricDescriptor(element, assetUri)); }

  updateElement(elementId: string, update: Partial<DesignElement>) {
    const object = this.findObject(elementId);
    if (!object) return;
    if ('x' in update) object.set('left', update.x);
    if ('y' in update) object.set('top', update.y);
    if ('width' in update) object.set('width', update.width);
    if ('height' in update) object.set('height', update.height);
    this.canvas?.renderAll(); this.captureHistory();
  }

  removeElement(elementId: string) { const object = this.findObject(elementId); if (object && this.canvas) this.canvas.remove(object); }
  deleteSelected() { const object = this.canvas?.getActiveObject(); if (object && this.canvas) this.canvas.remove(object); }
  selectElement(elementId: string) { const object = this.findObject(elementId); if (object && this.canvas) { this.canvas.setActiveObject(object); this.canvas.renderAll(); } }
  bringForward() { const object = this.canvas?.getActiveObject(); if (object) { this.canvas.bringObjectForward(object); this.captureHistory(); } }
  sendBackward() { const object = this.canvas?.getActiveObject(); if (object) { this.canvas.sendObjectBackwards(object); this.captureHistory(); } }
  undo() { const snapshot = this.history.undo(); if (snapshot) this.restoreSnapshot(snapshot); }
  redo() { const snapshot = this.history.redo(); if (snapshot) this.restoreSnapshot(snapshot); }
  setZoom(zoom: number) { this.canvas?.setZoom(zoom); this.canvas?.renderAll(); }
  async export(format: ExportFormat): Promise<Blob> { const dataUrl = this.canvas?.toDataURL({ format }) ?? ''; return (await fetch(dataUrl)).blob(); }
  destroy() { this.canvas?.dispose(); this.canvas = null; }

  serialize(): EditorState {
    const objects: EditorObjectState[] = this.canvas?.getObjects().map((object: FabricObject) => ({
      elementId: object.elementId,
      elementRole: object.elementRole,
      personId: object.personId,
      type: object.type,
      left: object.left ?? 0,
      top: object.top ?? 0,
      width: object.width,
      height: object.height,
      angle: object.angle ?? 0,
      scaleX: object.scaleX ?? 1,
      scaleY: object.scaleY ?? 1,
      text: object.text,
      fontSize: object.fontSize,
      fill: object.fill,
      src: object.src,
      fit: object.fit,
      selectable: object.selectable,
      editable: object.editable,
    })) ?? [];
    return descriptorsToEditorState(this.width, this.height, objects, this.canvas?.backgroundColor as string | undefined);
  }

  private async addObjectFromState(state: EditorObjectState) {
    if (!this.canvas) return;
    let object: FabricObject;
    if (state.type === 'textbox') object = new this.fabric.Textbox(state.text ?? '', state);
    else if (state.type === 'image' && state.src) object = await this.fabric.FabricImage.fromURL(state.src, { crossOrigin: 'anonymous' }, state);
    else object = new this.fabric.Rect({ ...state, fill: state.fill ?? '#e2e8f0' });
    object.set({ elementId: state.elementId, elementRole: state.elementRole, personId: state.personId, src: state.src, fit: state.fit, selectable: state.selectable !== false, editable: state.editable });
    this.canvas.add(object);
  }

  private findObject(elementId: string): FabricObject | undefined { return this.canvas?.getObjects().find((object: FabricObject) => object.elementId === elementId); }
  private captureHistory(reset = false) { if (this.restoring) return; const snapshot = this.serialize(); if (reset) this.history.reset(snapshot); else this.history.push(snapshot); }
  private async restoreSnapshot(snapshot: EditorState) { this.restoring = true; await this.loadState(snapshot); this.restoring = false; }
}

export function projectBackgroundToEditorBackground(background: ProjectBackground | undefined): string | undefined {
  return backgroundToCss(background);
}
