import type { CropRegion, ImageAsset } from '@/types';

export interface SmartCropProvider { crop(asset: ImageAsset, frame: { width: number; height: number }): Promise<CropRegion>; }

export class CenterCropProvider implements SmartCropProvider {
  async crop(_asset: ImageAsset, frame: { width: number; height: number }): Promise<CropRegion> {
    return { x: 0, y: 0, width: frame.width, height: frame.height, strategy: 'center', confidence: 0.5 };
  }
}
