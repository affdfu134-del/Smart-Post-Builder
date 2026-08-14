import assert from 'node:assert/strict';
import test from 'node:test';
import { getTemplateById, getTemplatesForType, templateRegistry, templateSupportsProject } from '../features/templates/templateRegistry.ts';

test('registry separates template metadata, configuration, and layout rules', () => {
  const template = getTemplateById('medical-clean');
  assert.ok(template);
  assert.equal(template.metadata.id, 'medical-clean');
  assert.equal(typeof template.configuration.layout.headerRatio, 'number');
});

test('current templates remain available for selection', () => {
  assert.ok(getTemplateById('medical-clean'));
  assert.ok(getTemplateById('general-grid'));
  assert.ok(getTemplatesForType('medical').some((template) => template.id === 'medical-clean'));
  assert.ok(templateRegistry.length >= 2);
});

test('template support rules validate people count and canvas size', () => {
  const template = getTemplateById('medical-clean');
  assert.equal(templateSupportsProject(template, 1, 'instagram-portrait'), true);
  assert.equal(templateSupportsProject(template, 21, 'instagram-portrait'), false);
  assert.equal(templateSupportsProject(template, 1, 'unknown-size'), false);
});
