import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../lib/layout-engine/smartLayout.ts', import.meta.url), 'utf8');

test('layout engine defines expected layout modes and thresholds', () => {
  for (const mode of ['single', 'double', 'grid', 'advanced-grid', 'dense', 'paged']) {
    assert.match(source, new RegExp(`'${mode}'`));
  }
  assert.match(source, /peopleCount <= 6/);
  assert.match(source, /peopleCount <= 10/);
  assert.match(source, /peopleCount <= 20/);
});
