import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../lib/storage/assetRepository.ts', import.meta.url), 'utf8');

test('asset repository stores files behind a replaceable abstraction', () => {
  assert.match(source, /export interface AssetRepository/);
  assert.match(source, /class LocalAssetRepository/);
  assert.match(source, /readAsDataURL/);
});

test('asset repository handles fallback and delete flows', () => {
  assert.match(source, /fallbackImageUri/);
  assert.match(source, /remove\(id: string\)/);
  assert.match(source, /resolveUri/);
});
