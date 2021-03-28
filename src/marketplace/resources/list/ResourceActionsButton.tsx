import { FunctionComponent } from 'react';

import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> = ({
  row,
}) =>
  row.scope === null ? (
    <BaseResourceActionsButton
      resource={
        {
          ...row,
          marketplace_resource_uuid: row.uuid,
        } as any
      }
    />
  ) : (
    <>
      <ActionButtonResource url={row.scope} />
    </>
  );
