import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ProjectResourcesList } from '@/marketplace/resources/list/ProjectResourcesList';
import { getProject } from '@/workspace/selectors';

export const ProjectResourcesPage: FunctionComponent<{}> = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }
  return <ProjectResourcesList project={project} initialPageSize={10} />;
};
