import { FC } from 'react';
import { Resource, ResourceProject } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { DeleteProjectAction } from './DeleteProjectAction';
import { ForceDeleteProjectAction } from './ForceDeleteProjectAction';
import { ResourceProjectEditButton } from './ResourceProjectEditButton';
import { RestoreProjectAction } from './RestoreProjectAction';

interface ResourceProjectActionsProps {
  row: ResourceProject;
  resource: Resource;
  offering: any;
  refetch(): void;
  siblings: ResourceProject[];
}

export const ResourceProjectActions: FC<ResourceProjectActionsProps> = ({
  row,
  resource,
  offering,
  refetch,
  siblings,
}) => {
  const user = useUser();

  return (
    <ActionsDropdown row={row} refetch={refetch}>
      {row.is_removed ? (
        <RestoreProjectAction row={row} refetch={refetch} />
      ) : (
        <>
          <ResourceProjectEditButton
            row={row}
            refetch={refetch}
            resource={resource}
            offering={offering}
            siblings={siblings}
          />
          <DeleteProjectAction
            row={row}
            resourceUuid={resource.uuid}
            refetch={refetch}
          />
        </>
      )}
      {user.is_staff && (
        <ForceDeleteProjectAction
          row={row}
          resourceUuid={resource.uuid}
          refetch={refetch}
        />
      )}
    </ActionsDropdown>
  );
};
