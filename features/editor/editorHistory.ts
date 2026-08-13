import type { EditorState } from '@/types';

export class EditorHistory {
  private snapshots: EditorState[] = [];
  private index = -1;

  push(snapshot: EditorState): void {
    this.snapshots = [...this.snapshots.slice(0, this.index + 1), structuredClone(snapshot)];
    this.index = this.snapshots.length - 1;
  }

  reset(snapshot: EditorState): void {
    this.snapshots = [structuredClone(snapshot)];
    this.index = 0;
  }

  undo(): EditorState | null {
    if (this.index <= 0) return null;
    this.index -= 1;
    return structuredClone(this.snapshots[this.index]);
  }

  redo(): EditorState | null {
    if (this.index >= this.snapshots.length - 1) return null;
    this.index += 1;
    return structuredClone(this.snapshots[this.index]);
  }
}
