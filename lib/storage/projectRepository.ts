import type { DesignProject } from '@/types';

export interface ProjectRepository { list(): Promise<DesignProject[]>; get(id: string): Promise<DesignProject | null>; save(project: DesignProject): Promise<void>; remove(id: string): Promise<void>; }
export class LocalProjectRepository implements ProjectRepository {
  private key = 'smart-post-builder.projects';
  async list(): Promise<DesignProject[]> { if (typeof localStorage === 'undefined') return []; return JSON.parse(localStorage.getItem(this.key) ?? '[]'); }
  async get(id: string): Promise<DesignProject | null> { return (await this.list()).find((project) => project.id === id) ?? null; }
  async save(project: DesignProject): Promise<void> { const projects = (await this.list()).filter((item) => item.id !== project.id); localStorage.setItem(this.key, JSON.stringify([...projects, project])); }
  async remove(id: string): Promise<void> { localStorage.setItem(this.key, JSON.stringify((await this.list()).filter((project) => project.id !== id))); }
}
