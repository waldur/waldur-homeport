import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ProjectResourcesList } from '@waldur/marketplace/resources/list/ProjectResourcesList';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectResourcesPage: FunctionComponent<{}> = () => {
  const project = useSelector(getProject);
  if (!project) {
    return null;
  }
  return <ProjectResourcesList project={project} initialPageSize={10} />;
};
