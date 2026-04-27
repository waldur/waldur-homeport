import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { projectPermissionsReviewsList } from 'waldur-js-client';

import { PermissionsReviewsList } from '@/core/PermissionsReviewsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { getProject } from '@/workspace/selectors';

const mapStateToProps = createSelector(getProject, (project) => ({
  project_uuid: project.uuid,
  o: '-created',
}));

export const ProjectPermissionsReviewsList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToProps);
  const tableProps = useTable({
    table: 'project-permissions-reviews',
    fetchData: createFetcher(projectPermissionsReviewsList),
    filter,
  });

  return <PermissionsReviewsList tableProps={tableProps} scope="project" />;
};
