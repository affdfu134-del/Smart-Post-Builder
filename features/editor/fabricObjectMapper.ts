import type { DesignElement, EditorObjectState, ImageElement, TextElement } from '@/types';

export interface FabricObjectDescriptor extends EditorObjectState {
  type: 'textbox' | 'image' | 'rect' | 'circle';
  selectable: boolean;
  editable?: boolean;
  src?: string;
  fill?: string;
  radius?: number;
}

export function designElementToFabricDescriptor(element: DesignElement, assetUri?: string): FabricObjectDescriptor {
  const base = {
    elementId: element.id,
    elementRole: element.kind === 'text' ? element.role : element.kind === 'image' ? element.role : undefined,
    personId: 'personId' in element ? element.personId : undefined,
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    angle: element.rotation ?? 0,
    scaleX: 1,
    scaleY: 1,
  } satisfies Omit<FabricObjectDescriptor, 'type' | 'selectable'>;

  if (element.kind === 'text') return textElementToDescriptor(element, base);
  if (element.kind === 'image') return imageElementToDescriptor(element, base, assetUri);
  return { ...base, type: element.shape, selectable: true, fill: element.fill, radius: element.shape === 'circle' ? Math.min(element.width, element.height) / 2 : undefined };
}

function textElementToDescriptor(element: TextElement, base: Omit<FabricObjectDescriptor, 'type' | 'selectable'>): FabricObjectDescriptor {
  return { ...base, type: 'textbox', selectable: true, editable: true, text: element.text, fontSize: element.fontSize, fill: element.color };
}

function imageElementToDescriptor(element: ImageElement, base: Omit<FabricObjectDescriptor, 'type' | 'selectable'>, assetUri?: string): FabricObjectDescriptor {
  return { ...base, type: 'image', selectable: element.role !== 'background', editable: false, src: assetUri, fit: element.fit };
}

export function descriptorsToEditorState(width: number, height: number, objects: EditorObjectState[], background?: string) {
  return { version: 1 as const, width, height, background, objects };
}

export function removeEditorObject(state: { objects: EditorObjectState[] }, elementId: string): EditorObjectState[] {
  return state.objects.filter((object) => object.elementId !== elementId);
}

export function updateEditorObjectText(state: { objects: EditorObjectState[] }, elementId: string, text: string): EditorObjectState[] {
  return state.objects.map((object) => object.elementId === elementId ? { ...object, text } : object);
}
