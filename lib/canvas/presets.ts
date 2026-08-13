import type { CanvasSize } from '@/types';

export const canvasSizePresets: CanvasSize[] = [
  { id: 'instagram-portrait', label: 'Instagram Portrait', width: 1080, height: 1350 },
  { id: 'instagram-square', label: 'Instagram Square', width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920 },
  { id: 'facebook-post', label: 'Facebook Post', width: 1200, height: 630 },
  { id: 'whatsapp-status', label: 'WhatsApp Status', width: 1080, height: 1920 },
  { id: 'a4-portrait', label: 'A4 Portrait', width: 2480, height: 3508 },
];

export function findCanvasSize(id: string): CanvasSize | undefined {
  return canvasSizePresets.find((size) => size.id === id);
}
