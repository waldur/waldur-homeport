import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { PermissionsReviewsList } from '@waldur/core/PermissionsReviewsList';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';
import { getProject } from '@waldur/workspace/selectors';

const mapStateToProps = createSelector(getProject, (project) => ({
  project_uuid: project.uuid,
  o: '-created',
}));

export const ProjectPermissionsReviewsList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToProps);
  const tableProps = useTable({
    table: 'project-permissions-reviews',
    fetchData: createFetcher('project-permissions-reviews'),
    filter,
  });

  return <PermissionsReviewsList tableProps={tableProps} scope="project" />;
};
