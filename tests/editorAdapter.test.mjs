import assert from 'node:assert/strict';
import test from 'node:test';
import { designElementToFabricDescriptor, descriptorsToEditorState, removeEditorObject, updateEditorObjectText } from '../features/editor/fabricObjectMapper.ts';
import { EditorHistory } from '../features/editor/editorHistory.ts';

const personNameElement = { id: 'p1-name', kind: 'text', text: 'Dr. Sara', role: 'name', personId: 'p1', x: 10, y: 20, width: 300, height: 50, fontSize: 28, color: '#0f766e' };
const personImageElement = { id: 'p1-photo', kind: 'image', assetId: 'asset-p1', role: 'person-photo', personId: 'p1', x: 10, y: 80, width: 300, height: 180, fit: 'cover' };

test('converts PreviewModel text element to editable Fabric descriptor', () => {
  const descriptor = designElementToFabricDescriptor(personNameElement);
  assert.equal(descriptor.type, 'textbox');
  assert.equal(descriptor.text, 'Dr. Sara');
  assert.equal(descriptor.editable, true);
});

test('preserves elementId, elementRole, and personId metadata', () => {
  const descriptor = designElementToFabricDescriptor(personImageElement, 'person.png');
  assert.equal(descriptor.elementId, 'p1-photo');
  assert.equal(descriptor.elementRole, 'person-photo');
  assert.equal(descriptor.personId, 'p1');
});

test('serialization keeps all editor objects', () => {
  const objects = [designElementToFabricDescriptor(personNameElement), designElementToFabricDescriptor(personImageElement, 'person.png')];
  const state = descriptorsToEditorState(1080, 1350, objects, '#ffffff');
  assert.equal(state.objects.length, 2);
  assert.equal(state.width, 1080);
  assert.equal(state.background, '#ffffff');
});

test('delete removes an editor element by elementId', () => {
  const objects = [designElementToFabricDescriptor(personNameElement), designElementToFabricDescriptor(personImageElement, 'person.png')];
  assert.equal(removeEditorObject({ objects }, 'p1-photo').length, 1);
});

test('text editing updates the correct editor state object', () => {
  const objects = [designElementToFabricDescriptor(personNameElement), designElementToFabricDescriptor(personImageElement, 'person.png')];
  const updated = updateEditorObjectText({ objects }, 'p1-name', 'Dr. Nora');
  assert.equal(updated.find((object) => object.elementId === 'p1-name')?.text, 'Dr. Nora');
  assert.equal(updated.find((object) => object.elementId === 'p1-photo')?.text, undefined);
});

test('undo and redo restore previous editor states', () => {
  const history = new EditorHistory();
  const first = descriptorsToEditorState(100, 100, [designElementToFabricDescriptor(personNameElement)]);
  const second = { ...first, objects: updateEditorObjectText(first, 'p1-name', 'Changed') };
  history.reset(first);
  history.push(second);
  assert.equal(history.undo()?.objects[0].text, 'Dr. Sara');
  assert.equal(history.redo()?.objects[0].text, 'Changed');
});
