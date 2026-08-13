import { ProjectEditorPage } from '@/features/editor/ProjectEditorPage';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return <ProjectEditorPage projectId={params.projectId} />;
}
