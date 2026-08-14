import { ProjectEditorPage } from '@/features/editor/ProjectEditorPage';

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectEditorPage projectId={projectId} />;
}
