import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { IssuesList } from '@waldur/issues/list/IssuesList';
import { getProject } from '@waldur/workspace/selectors';

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
