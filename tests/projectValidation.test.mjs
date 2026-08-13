import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyProject, createProject } from '../features/projects/createProject.ts';
import { validateProject } from '../features/projects/projectValidation.ts';
import { InMemoryProjectRepository } from '../lib/storage/inMemoryProjectRepository.ts';

function validProject() {
  const project = createEmptyProject('project-test');
  return { ...project, name: 'دوام أطباء الخميس', people: [{ id: 'person-1', name: 'Dr. Sara', specialty: 'Cardiology', degreeTitle: 'MD' }] };
}

test('validation accepts a valid project', () => {
  assert.deepEqual(validateProject(validProject()), []);
});

test('validation rejects a project without a name', () => {
  const errors = validateProject({ ...validProject(), name: ' ' });
  assert.equal(errors.some((error) => error.field === 'name'), true);
});

test('validation rejects a project without people', () => {
  const errors = validateProject({ ...validProject(), people: [] });
  assert.equal(errors.some((error) => error.field === 'people'), true);
});

test('createProject builds and saves a valid project through the repository', async () => {
  const repository = new InMemoryProjectRepository();
  const result = await createProject(validProject(), repository);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.project.id, 'project-test');
  assert.equal(result.project.elements.length > 0, true);
  assert.deepEqual(await repository.get('project-test'), result.project);
});
