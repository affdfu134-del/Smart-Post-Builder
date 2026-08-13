import { useState, type CSSProperties } from 'react';
import type { DesignElement, ImageElement, ProjectBackground, TextElement } from '@/types';
import type { PreviewModel } from './previewModel';

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(date);
}

function backgroundStyle(background: ProjectBackground | undefined): CSSProperties {
  if (!background) return { background: '#f8fafc' };
  if (background.kind === 'color') return { background: background.color };
  return { backgroundColor: background.color ?? '#f8fafc', backgroundImage: `url(${background.image.uri})`, backgroundSize: 'cover', backgroundPosition: 'center' };
}

function elementStyle(element: DesignElement): CSSProperties {
  return { position: 'absolute', left: element.x, top: element.y, width: element.width, height: element.height, transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined };
}

function TextPreview({ element }: { element: TextElement }) {
  const text = element.role === 'date' ? formatDate(element.text) : element.text;
  return <div style={{ ...elementStyle(element), fontSize: element.fontSize, color: element.color, fontFamily: element.fontFamily, lineHeight: 1.15, fontWeight: element.role === 'name' || element.role === 'title' ? 800 : 500, overflow: 'hidden' }}>{text}</div>;
}

function ImageFallback({ label }: { label: string }) {
  return <div className="flex h-full w-full items-center justify-center rounded-3xl bg-slate-200 text-center text-slate-500">{label}</div>;
}

function ImagePreview({ element, model }: { element: ImageElement; model: PreviewModel }) {
  const [failed, setFailed] = useState(false);
  const asset = model.assetsById.get(element.assetId);
  return <div style={elementStyle(element)} className="overflow-hidden rounded-3xl bg-slate-100">{asset && !failed ? <img src={asset.uri} alt={asset.name} className="h-full w-full" style={{ objectFit: element.fit }} onError={() => setFailed(true)} /> : <ImageFallback label={element.role === 'logo' ? 'Logo unavailable' : 'Image unavailable'} />}</div>;
}

export function ProjectPreviewCanvas({ model, zoom }: { model: PreviewModel; zoom: number }) {
  const { project, elements } = model;
  return <div className="max-w-full overflow-auto rounded-3xl bg-slate-200 p-4"><div className="relative mx-auto shadow-2xl" style={{ width: project.size.width, height: project.size.height, transform: `scale(${zoom})`, transformOrigin: 'top center', marginBottom: project.size.height * (zoom - 1), ...backgroundStyle(project.background) }}>{elements.map((element) => element.kind === 'text' ? <TextPreview key={element.id} element={element} /> : element.kind === 'image' ? <ImagePreview key={element.id} element={element} model={model} /> : <div key={element.id} style={{ ...elementStyle(element), background: element.fill, borderRadius: element.shape === 'circle' ? '9999px' : 0 }} />)}</div></div>;
}
