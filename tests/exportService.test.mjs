import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExportRequest, canExportEditorState, currentCanvasExportPreset, defaultJpegQuality, exportProjectDesign, sanitizeExportFilename } from '../features/export/exportService.ts';

const baseProject = {
  id: 'project-1',
  name: 'Clinic / Team: Friday?',
  type: 'medical',
  size: { id: 'instagram-portrait', label: 'Instagram Portrait', width: 1080, height: 1350 },
  people: [{ id: 'person-1', name: 'Dr. Sara' }],
  templateId: 'medical-clean',
  elements: [],
  updatedAt: '2026-08-14T00:00:00.000Z',
};

function mockAdapter(state) {
  const calls = [];
  return {
    calls,
    serialize() { return structuredClone(state); },
    async export(format, options) { calls.push({ format, options }); return new Blob([`${format}:${options.width}x${options.height}`], { type: format === 'jpg' ? 'image/jpeg' : 'image/png' }); },
  };
}

test('builds PNG export configuration without lossy quality', () => {
  assert.deepEqual(buildExportRequest('png'), { format: 'png' });
});

test('builds JPG export configuration with quality', () => {
  assert.deepEqual(buildExportRequest('jpg'), { format: 'jpg', quality: defaultJpegQuality });
});

test('current canvas export preset preserves project dimensions', () => {
  assert.deepEqual(currentCanvasExportPreset(baseProject), { id: 'instagram-portrait', label: 'Instagram Portrait', width: 1080, height: 1350 });
});

test('sanitizes exported file names', () => {
  assert.equal(sanitizeExportFilename('Clinic / Team: Friday?', 'png'), 'smart-post-builder-clinic-team-friday.png');
  assert.equal(sanitizeExportFilename('   ', 'jpg'), 'smart-post-builder-untitled-project.jpg');
});

test('project with matching editorState can be exported', () => {
  assert.equal(canExportEditorState({ ...baseProject, editorState: { version: 1, width: 1080, height: 1350, objects: [] } }), true);
});

test('missing assets represented by fallback objects do not block export', async () => {
  const editorState = { version: 1, width: 1080, height: 1350, objects: [{ elementId: 'person-1-photo', type: 'rect', left: 0, top: 0, width: 100, height: 100, fill: '#e2e8f0' }] };
  const result = await exportProjectDesign(mockAdapter(editorState), baseProject, buildExportRequest('png'));
  assert.equal(result.filename, 'smart-post-builder-clinic-team-friday.png');
});

test('export uses editor state dimensions and does not mutate project domain', async () => {
  const project = structuredClone({ ...baseProject, editorState: { version: 1, width: 1080, height: 1350, objects: [{ elementId: 'title', type: 'textbox', left: 12, top: 24, text: 'Edited' }] } });
  const before = structuredClone(project);
  const adapter = mockAdapter(project.editorState);
  const result = await exportProjectDesign(adapter, project, buildExportRequest('jpg'));
  assert.equal(result.width, 1080);
  assert.equal(result.height, 1350);
  assert.deepEqual(project, before);
  assert.deepEqual(adapter.calls[0], { format: 'jpg', options: { width: 1080, height: 1350, quality: defaultJpegQuality } });
});

test('export fails if adapter mutates editorState', async () => {
  let state = { version: 1, width: 1080, height: 1350, objects: [] };
  const adapter = { serialize() { const copy = structuredClone(state); state = { ...state, background: '#fff' }; return copy; }, async export() { return new Blob(['png']); } };
  await assert.rejects(() => exportProjectDesign(adapter, baseProject, buildExportRequest('png')), /changed the editor state/);
});
