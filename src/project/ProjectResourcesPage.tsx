import { FunctionComponent } from 'react';

import { ProjectResourcesList } from '@/marketplace/resources/list/ProjectResourcesList';
import { useProject } from '@/workspace/hooks';

export const ProjectResourcesPage: FunctionComponent<{}> = () => {
  const project = useProject();
  if (!project) {
    return null;
  }
  return <ProjectResourcesList project={project} initialPageSize={10} />;
};
