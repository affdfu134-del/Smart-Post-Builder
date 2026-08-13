export type ProjectType = 'medical' | 'school' | 'company' | 'event' | 'staff' | 'team' | 'general';
export type ExportFormat = 'png' | 'jpg';

export interface CanvasSize { id: string; label: string; width: number; height: number; }
export interface ImageAsset { id: string; name: string; uri: string; crop?: CropRegion; }
export interface CropRegion { x: number; y: number; width: number; height: number; confidence?: number; strategy: 'manual' | 'center' | 'face-detection' | 'subject-detection'; }
export interface Person { id: string; name: string; specialty?: string; degreeTitle?: string; image?: ImageAsset; notes?: string; }
export interface BrandKit { id: string; organizationName: string; logo?: ImageAsset; primaryColor: string; secondaryColor?: string; fontFamily?: string; website?: string; phone?: string; socialMedia?: string[]; }
export interface ProjectSchedule { date?: string; day?: string; workingHours?: string; }
export interface TemplateDefinition { id: string; name: string; type: ProjectType; description?: string; supports: { minPeople: number; maxPeople?: number; sizes: string[] }; tokens: Record<string, string>; }
export type ProjectBackground = { kind: 'color'; color: string } | { kind: 'image'; image: ImageAsset; color?: string };
export interface WorkingHours { enabled: boolean; from?: string; to?: string; }
export interface ProjectDate { enabled: boolean; value?: string; }
export interface DesignProject { id: string; name: string; type: ProjectType; size: CanvasSize; people: Person[]; brandKit?: BrandKit; logo?: ImageAsset; templateId: string; schedule?: ProjectSchedule; date?: ProjectDate; workingHours?: WorkingHours; background?: ProjectBackground; elements: DesignElement[]; updatedAt: string; editorState?: EditorState; }

export interface EditorObjectState { elementId: string; elementRole?: string; personId?: string; type?: string; left: number; top: number; width?: number; height?: number; angle?: number; scaleX?: number; scaleY?: number; text?: string; fontSize?: number; fill?: string; src?: string; fit?: string; selectable?: boolean; editable?: boolean; }
export interface EditorState { version: 1; width: number; height: number; background?: string; objects: EditorObjectState[]; }
export type DesignElement = TextElement | ImageElement | ShapeElement;
interface BaseElement { id: string; x: number; y: number; width: number; height: number; rotation?: number; locked?: boolean; }
export interface TextElement extends BaseElement { kind: 'text'; text: string; fontSize: number; color: string; fontFamily?: string; role?: 'title' | 'name' | 'specialty' | 'degree' | 'date' | 'hours' | 'misc'; personId?: string; }
export interface ImageElement extends BaseElement { kind: 'image'; assetId: string; fit: 'cover' | 'contain'; role?: 'logo' | 'person-photo' | 'background' | 'misc'; personId?: string; }
export interface ShapeElement extends BaseElement { kind: 'shape'; shape: 'rect' | 'circle'; fill: string; }
