import { FunctionComponent, useMemo } from 'react';

import { IssuesList } from '@/issues/list/IssuesList';
import { useProject } from '@/workspace/hooks';

export const ProjectIssuesList: FunctionComponent = () => {
  const project = useProject();

  const filter = useMemo(
    () => ({ project: project && project.url }),
    [project],
  );

  return (
    <IssuesList
      hiddenColumns={['customer', 'project']}
      scope={project}
      scopeType="project"
      filter={filter}
      standalone={false}
    />
  );
};
