import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPreviewModel, visiblePeopleCount } from '../features/preview/previewModel.ts';
import { createEmptyProject } from '../features/projects/createProject.ts';
import { defaultTemplates } from '../features/templates/defaultTemplates.ts';

function projectWithPeople(count, overrides = {}) {
  const project = createEmptyProject(`preview-${count}`);
  return {
    ...project,
    name: `Preview ${count}`,
    people: Array.from({ length: count }, (_, index) => ({ id: `person-${index + 1}`, name: `Person ${index + 1}`, specialty: 'Specialty', degreeTitle: 'Title' })),
    ...overrides,
  };
}

function modelFor(project) {
  return buildPreviewModel(project, defaultTemplates[0]);
}

test('one-person project generates a person layout', () => {
  const model = modelFor(projectWithPeople(1));
  assert.equal(visiblePeopleCount(model.elements), 1);
  assert.ok(model.elements.some((element) => element.role === 'person-photo'));
  assert.ok(model.elements.some((element) => element.role === 'name'));
});

test('five-person project renders five people in the preview model', () => {
  const model = modelFor(projectWithPeople(5));
  assert.equal(visiblePeopleCount(model.elements), 5);
});

test('disabled date does not generate a date element', () => {
  const model = modelFor(projectWithPeople(1, { date: { enabled: false, value: '2026-08-13' } }));
  assert.equal(model.elements.some((element) => element.role === 'date'), false);
});

test('disabled working hours do not generate working-hours element', () => {
  const model = modelFor(projectWithPeople(1, { workingHours: { enabled: false, from: '16:00', to: '20:00' } }));
  assert.equal(model.elements.some((element) => element.role === 'hours'), false);
});

test('logo is omitted when no logo exists', () => {
  const model = modelFor(projectWithPeople(1, { logo: undefined }));
  assert.equal(model.elements.some((element) => element.role === 'logo'), false);
});

test('changing people count changes generated layout positions', () => {
  const two = modelFor(projectWithPeople(2)).elements.filter((element) => element.role === 'person-photo').map((element) => `${element.x},${element.y},${element.width}`);
  const eight = modelFor(projectWithPeople(8)).elements.filter((element) => element.role === 'person-photo').map((element) => `${element.x},${element.y},${element.width}`);
  assert.notDeepEqual(two, eight.slice(0, 2));
});
