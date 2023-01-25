import { FunctionComponent } from 'react';

import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
  refetch?(): void;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> =
  ({ row, refetch }) =>
    row.scope === null || row.offering_type === 'Support.OfferingTemplate' ? (
      <BaseResourceActionsButton
        resource={
          {
            ...row,
            marketplace_resource_uuid: row.uuid,
          } as any
        }
        refetch={refetch}
      />
    ) : (
      <>
        <ActionButtonResource url={row.scope} refetch={refetch} />
      </>
    );
