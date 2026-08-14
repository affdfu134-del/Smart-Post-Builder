import type { ImageAsset } from '@/types';

export interface AssetRepository {
  saveFile(file: File, id?: string): Promise<ImageAsset>;
  get(id: string): Promise<ImageAsset | null>;
  remove(id: string): Promise<void>;
  resolveUri(asset?: ImageAsset): Promise<string | null>;
}

const ASSET_KEY = 'smart-post-builder.assets';
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364758b" font-family="Arial" font-size="24">Image unavailable</text></svg>';

function readAssets(): ImageAsset[] {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(ASSET_KEY) ?? '[]'); } catch { return []; }
}

function writeAssets(assets: ImageAsset[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ASSET_KEY, JSON.stringify(assets));
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Unable to read file.'));
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

export class LocalAssetRepository implements AssetRepository {
  async saveFile(file: File, id = crypto.randomUUID()): Promise<ImageAsset> {
    const asset: ImageAsset = { id, name: file.name, uri: await fileToDataUri(file) };
    writeAssets([...readAssets().filter((item) => item.id !== id), asset]);
    return asset;
  }

  async get(id: string): Promise<ImageAsset | null> { return readAssets().find((asset) => asset.id === id) ?? null; }
  async remove(id: string): Promise<void> { writeAssets(readAssets().filter((asset) => asset.id !== id)); }

  async resolveUri(asset?: ImageAsset): Promise<string | null> {
    if (!asset) return FALLBACK_IMAGE;
    if (asset.uri && !asset.uri.startsWith('blob:')) return asset.uri;
    return (await this.get(asset.id))?.uri ?? FALLBACK_IMAGE;
  }
}

export const fallbackImageUri = FALLBACK_IMAGE;
