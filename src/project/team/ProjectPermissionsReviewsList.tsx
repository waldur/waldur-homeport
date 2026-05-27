import { FunctionComponent, useMemo } from 'react';
import { projectPermissionsReviewsList } from 'waldur-js-client';

import { PermissionsReviewsList } from '@/core/PermissionsReviewsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { useProject } from '@/workspace/hooks';

export const ProjectPermissionsReviewsList: FunctionComponent<{}> = () => {
  const project = useProject();
  const filter = useMemo(
    () => ({
      project_uuid: project?.uuid,
      o: '-created',
    }),
    [project],
  );
  const tableProps = useTable({
    table: 'project-permissions-reviews',
    fetchData: createFetcher(projectPermissionsReviewsList),
    filter,
  });

  return <PermissionsReviewsList tableProps={tableProps} scope="project" />;
};
