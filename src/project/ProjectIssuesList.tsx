import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IssuesList } from '@/issues/list/IssuesList';
import { getProject } from '@/workspace/selectors';

export const ProjectIssuesList: FunctionComponent = () => {
  const project = useSelector(getProject);

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
