import type { DesignProject } from '@/types';
import type { ProjectRepository } from './projectRepository';

export class InMemoryProjectRepository implements ProjectRepository {
  private projects = new Map<string, DesignProject>();
  async list(): Promise<DesignProject[]> { return [...this.projects.values()]; }
  async get(id: string): Promise<DesignProject | null> { return this.projects.get(id) ?? null; }
  async save(project: DesignProject): Promise<void> { this.projects.set(project.id, project); }
  async remove(id: string): Promise<void> { this.projects.delete(id); }
}
